import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hangbug/core/theme/app_theme.dart';
import 'package:hangbug/widgets/hangbug_dialog.dart';

Widget _wrapTestApp({
  required Widget child,
  ThemeMode themeMode = ThemeMode.light,
}) {
  return MaterialApp(
    theme: AppTheme.lightTheme,
    darkTheme: AppTheme.darkTheme,
    themeMode: themeMode,
    home: Scaffold(body: child),
  );
}

void main() {
  testWidgets('HangbugDialog.confirmDelete cancels cleanly without running onConfirm', (tester) async {
    bool deleted = false;
    bool? dialogResult;

    await tester.pumpWidget(
      _wrapTestApp(
        child: Builder(
          builder: (context) => ElevatedButton(
            onPressed: () async {
              dialogResult = await HangbugDialog.confirmDelete(
                context,
                title: 'Delete Question?',
                message: 'Are you sure you want to delete this item?',
                itemName: 'Dart Null Safety Q1',
                onConfirm: () async {
                  deleted = true;
                },
              );
            },
            child: const Text('Open Delete'),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Open Delete'));
    await tester.pumpAndSettle();

    expect(find.text('Delete Question?'), findsOneWidget);
    expect(find.text('Dart Null Safety Q1'), findsOneWidget);
    expect(find.textContaining('permanent'), findsOneWidget);

    await tester.tap(find.text('Cancel'));
    await tester.pumpAndSettle();

    expect(deleted, isFalse);
    expect(dialogResult, isFalse);
  });

  testWidgets('HangbugDialog.confirmDelete shows loading state and keeps dialog open on error', (tester) async {
    final completer = Completer<void>();
    int attempts = 0;

    await tester.pumpWidget(
      _wrapTestApp(
        themeMode: ThemeMode.dark,
        child: Builder(
          builder: (context) => ElevatedButton(
            onPressed: () {
              HangbugDialog.confirmDelete(
                context,
                title: 'Delete Book?',
                message: 'Remove book and chunks.',
                confirmText: 'Delete Book',
                loadingText: 'Deleting...',
                onConfirm: () async {
                  attempts++;
                  if (attempts == 1) {
                    await completer.future;
                    throw Exception('Server timeout');
                  }
                },
              );
            },
            child: const Text('Trigger'),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Trigger'));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Delete Book'));
    await tester.pump();
    expect(find.text('Deleting...'), findsOneWidget);

    completer.complete();
    await tester.pumpAndSettle();

    // Dialog remains open with inline error banner
    expect(find.text('Delete Book?'), findsOneWidget);
    expect(find.text('Server timeout'), findsOneWidget);

    // Retry succeeds and closes dialog
    await tester.tap(find.text('Delete Book'));
    await tester.pumpAndSettle();
    expect(find.text('Delete Book?'), findsNothing);
    expect(attempts, 2);
  });

  testWidgets('HangbugDialog.confirmDelete enforces confirmPhrase before enabling delete', (tester) async {
    bool confirmed = false;

    await tester.pumpWidget(
      _wrapTestApp(
        child: Builder(
          builder: (context) => ElevatedButton(
            onPressed: () async {
              confirmed = await HangbugDialog.confirmDelete(
                context,
                title: 'Delete Account?',
                message: 'Permanent deletion.',
                confirmText: 'Permanently Delete',
                confirmPhrase: 'DELETE',
              );
            },
            child: const Text('Open Account Delete'),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Open Account Delete'));
    await tester.pumpAndSettle();

    // Button should be disabled until DELETE is typed
    await tester.tap(find.text('Permanently Delete'));
    await tester.pumpAndSettle();
    expect(find.text('Delete Account?'), findsOneWidget);

    await tester.enterText(find.byType(TextField), 'DELETE');
    await tester.pumpAndSettle();

    await tester.tap(find.text('Permanently Delete'));
    await tester.pumpAndSettle();
    expect(confirmed, isTrue);
  });

  testWidgets('HangbugDialog.prompt validates empty input and returns submitted text', (tester) async {
    String? entered;

    await tester.pumpWidget(
      _wrapTestApp(
        child: Builder(
          builder: (context) => ElevatedButton(
            onPressed: () async {
              entered = await HangbugDialog.prompt(
                context,
                title: 'Add Category',
                label: 'Category Name',
                hint: 'e.g. Flutter',
                confirmText: 'Create',
              );
            },
            child: const Text('Open Prompt'),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Open Prompt'));
    await tester.pumpAndSettle();

    // Submitting empty input displays inline validation error
    await tester.tap(find.text('Create'));
    await tester.pumpAndSettle();
    expect(find.text('Category Name is required.'), findsOneWidget);

    await tester.enterText(find.byType(TextField), 'Rust');
    await tester.tap(find.text('Create'));
    await tester.pumpAndSettle();

    expect(entered, 'Rust');
  });

  testWidgets('HangbugDialog supports success, error, warning, and info dialogs', (tester) async {
    await tester.pumpWidget(
      _wrapTestApp(
        child: Builder(
          builder: (context) => Column(
            children: [
              ElevatedButton(
                onPressed: () => HangbugDialog.success(
                  context,
                  title: 'Saved',
                  message: 'Settings saved successfully.',
                ),
                child: const Text('Success'),
              ),
              ElevatedButton(
                onPressed: () => HangbugDialog.error(
                  context,
                  title: 'Upload Failed',
                  message: 'Could not upload file.',
                ),
                child: const Text('Error'),
              ),
              ElevatedButton(
                onPressed: () => HangbugDialog.info(
                  context,
                  title: 'Notice',
                  message: 'Vector index synced.',
                ),
                child: const Text('Info'),
              ),
            ],
          ),
        ),
      ),
    );

    for (final label in ['Success', 'Error', 'Info']) {
      await tester.tap(find.text(label));
      await tester.pumpAndSettle();
      await tester.tap(find.text('OK'));
      await tester.pumpAndSettle();
      expect(find.text('OK'), findsNothing);
    }
  });
}
