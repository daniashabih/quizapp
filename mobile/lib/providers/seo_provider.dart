import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/seo_dashboard_model.dart';
import '../services/seo_service.dart';
import 'core_providers.dart';

final seoServiceProvider = Provider<SeoService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return SeoService(apiClient: apiClient);
});

final seoDomainProvider = StateProvider<String>((ref) => 'www.hangbug.com');
final seoDateRangeProvider = StateProvider<String>((ref) => '28d');
final seoCustomDatesProvider = StateProvider<({String start, String end})>(
  (ref) => (start: '', end: ''),
);
final seoActiveSectionProvider = StateProvider<String>((ref) => 'overview');

final seoDashboardProvider =
    FutureProvider.autoDispose<SeoDashboardPayload>((ref) async {
  final service = ref.watch(seoServiceProvider);
  final domain = ref.watch(seoDomainProvider);
  final range = ref.watch(seoDateRangeProvider);
  final custom = ref.watch(seoCustomDatesProvider);
  return service.getDashboard(
    domain: domain,
    range: range,
    startDate: custom.start,
    endDate: custom.end,
  );
});

final seoSettingsProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final service = ref.watch(seoServiceProvider);
  final domain = ref.watch(seoDomainProvider);
  return service.getSettings(domain: domain);
});
