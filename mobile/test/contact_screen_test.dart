import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hangbug/core/network/api_client.dart';
import 'package:hangbug/core/network/network_exceptions.dart';
import 'package:hangbug/providers/core_providers.dart';
import 'package:hangbug/screens/legal/contact_screen.dart';

class _FakeContactApiClient extends Fake implements ApiClient {
  int calls = 0;
  String? submittedPath;
  Map<String, dynamic>? submittedData;
  Object? error;
  dynamic responseData = {'success': true};

  @override
  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    calls++;
    submittedPath = path;
    submittedData = Map<String, dynamic>.from(data as Map);
    if (error != null) throw error!;
    return Response(
      requestOptions: RequestOptions(path: path),
      data: responseData,
      statusCode: 200,
    );
  }
}

Future<void> _enterContactForm(WidgetTester tester, {required String email}) async {
  for (final entry in [
    (const Key('contact-name'), 'Ada Lovelace'),
    (const Key('contact-email'), email),
    (const Key('contact-subject'), 'Quiz support'),
    (const Key('contact-message'), 'Please help with my quiz result.'),
  ]) {
    final field = find.byKey(entry.$1);
    await tester.ensureVisible(field);
    await tester.enterText(field, entry.$2);
  }
}

void main() {
  testWidgets('contact form posts to the shared API and reports accepted delivery', (tester) async {
    final apiClient = _FakeContactApiClient();
    await tester.pumpWidget(
      ProviderScope(
        overrides: [apiClientProvider.overrideWithValue(apiClient)],
        child: const MaterialApp(home: ContactScreen()),
      ),
    );

    await _enterContactForm(tester, email: 'ada@example.com');
    final submit = find.text('Send Message');
    await tester.ensureVisible(submit);
    await tester.tap(submit);
    await tester.pumpAndSettle();

    expect(apiClient.calls, 1);
    expect(apiClient.submittedPath, '/contact');
    expect(apiClient.submittedData, containsPair('email', 'ada@example.com'));
    expect(apiClient.submittedData, containsPair('website', ''));
    expect(
      find.text('Your message was accepted for delivery to Hangbug support.'),
      findsOneWidget,
    );
  });

  testWidgets('contact form validation and API failures never show success', (tester) async {
    final apiClient = _FakeContactApiClient()
      ..error = const NetworkException(
        message: 'Too many contact requests. Please try again later.',
        statusCode: 429,
      );
    await tester.pumpWidget(
      ProviderScope(
        overrides: [apiClientProvider.overrideWithValue(apiClient)],
        child: const MaterialApp(home: ContactScreen()),
      ),
    );

    await _enterContactForm(tester, email: 'invalid');
    final submit = find.text('Send Message');
    await tester.ensureVisible(submit);
    await tester.tap(submit);
    await tester.pumpAndSettle();
    expect(apiClient.calls, 0);
    expect(find.text('Enter a valid email address.'), findsOneWidget);

    final emailField = find.byKey(const Key('contact-email'));
    await tester.ensureVisible(emailField);
    await tester.enterText(emailField, 'ada@example.com');
    await tester.ensureVisible(submit);
    await tester.tap(submit);
    await tester.pumpAndSettle();
    expect(apiClient.calls, 1);
    expect(find.text('Too many contact requests. Please try again later.'), findsOneWidget);
    expect(
      find.text('Your message was accepted for delivery to Hangbug support.'),
      findsNothing,
    );
  });
}
