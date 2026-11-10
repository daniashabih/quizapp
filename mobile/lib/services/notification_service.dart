import 'dart:async';
import 'package:flutter/foundation.dart';

enum HangbugNotificationType {
  success,
  error,
  warning,
  info,
  loading,
}

class HangbugNotificationItem {
  final String id;
  final String fingerprint;
  final HangbugNotificationType type;
  final String title;
  final String message;
  final Duration duration;
  final bool isExiting;
  final int updatedAt;

  const HangbugNotificationItem({
    required this.id,
    required this.fingerprint,
    required this.type,
    required this.title,
    required this.message,
    required this.duration,
    this.isExiting = false,
    required this.updatedAt,
  });

  HangbugNotificationItem copyWith({
    HangbugNotificationType? type,
    String? title,
    String? message,
    Duration? duration,
    bool? isExiting,
    int? updatedAt,
    String? fingerprint,
  }) {
    return HangbugNotificationItem(
      id: id,
      fingerprint: fingerprint ?? this.fingerprint,
      type: type ?? this.type,
      title: title ?? this.title,
      message: message ?? this.message,
      duration: duration ?? this.duration,
      isExiting: isExiting ?? this.isExiting,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

/// Centralized Hangbug Notification Service for Flutter Mobile.
/// Provides deduplicated, stackable, animated SaaS notifications across all screens.
class AppNotificationService {
  AppNotificationService._();

  static final AppNotificationService instance = AppNotificationService._();

  static const int maxVisibleToasts = 3;
  static const Duration exitAnimationDuration = Duration(milliseconds: 240);
  static const Duration loadingFailsafeDuration = Duration(seconds: 20);

  final ValueNotifier<List<HangbugNotificationItem>> itemsNotifier =
      ValueNotifier<List<HangbugNotificationItem>>(const []);

  final Map<String, Timer> _dismissTimers = {};
  final Map<String, Timer> _exitTimers = {};
  int _counter = 0;

  static Duration _defaultDuration(HangbugNotificationType type) {
    switch (type) {
      case HangbugNotificationType.success:
      case HangbugNotificationType.info:
        return const Duration(milliseconds: 3500);
      case HangbugNotificationType.warning:
        return const Duration(milliseconds: 4000);
      case HangbugNotificationType.error:
        return const Duration(milliseconds: 4400);
      case HangbugNotificationType.loading:
        return Duration.zero;
    }
  }

  static Map<String, String> _inferTitleAndMessage(
    HangbugNotificationType type,
    String? explicitTitle,
    String rawMessage,
  ) {
    final trimmedTitle = (explicitTitle ?? '').trim();
    final trimmedMsg = rawMessage.trim();

    if (trimmedTitle.isNotEmpty) {
      return {'title': trimmedTitle, 'message': trimmedMsg};
    }

    // Check if rawMessage naturally splits into a short headline + second sentence
    final sentenceMatch = RegExp(r'^([^.!?:]+[.!])\s+(.+)$').firstMatch(trimmedMsg);
    if (sentenceMatch != null) {
      final firstPart = (sentenceMatch.group(1) ?? '').trim();
      final restPart = (sentenceMatch.group(2) ?? '').trim();
      if (firstPart.length >= 6 && firstPart.length <= 44 && restPart.length >= 6) {
        return {'title': firstPart, 'message': restPart};
      }
    }

    final lower = trimmedMsg.toLowerCase();

    switch (type) {
      case HangbugNotificationType.success:
        if (lower.contains('welcome') || lower.contains('signed in')) {
          return {'title': "You're all set!", 'message': trimmedMsg};
        }
        if (lower.contains('copied')) {
          return {'title': 'Copied to clipboard', 'message': trimmedMsg};
        }
        if (lower.contains('saved') || lower.contains('updated')) {
          return {'title': 'Changes saved', 'message': trimmedMsg};
        }
        if (lower.contains('deleted') || lower.contains('discarded') || lower.contains('removed')) {
          return {'title': 'Removed', 'message': trimmedMsg};
        }
        return {'title': 'Completed', 'message': trimmedMsg};

      case HangbugNotificationType.error:
        if (lower.contains('invalid') || lower.contains('password') || lower.contains('sign in')) {
          return {'title': 'Sign-in failed', 'message': trimmedMsg};
        }
        if (lower.contains('expired')) {
          return {'title': 'Session expired', 'message': trimmedMsg};
        }
        return {'title': 'Something went wrong', 'message': trimmedMsg};

      case HangbugNotificationType.warning:
        if (lower.contains('required') || lower.contains('filled') || lower.contains('complete')) {
          return {'title': 'Action required', 'message': trimmedMsg};
        }
        if (lower.contains('expired')) {
          return {'title': 'Session expired', 'message': trimmedMsg};
        }
        return {'title': 'Please note', 'message': trimmedMsg};

      case HangbugNotificationType.info:
        if (lower.contains('signed out') || lower.contains('logged out')) {
          return {'title': 'Signed out', 'message': trimmedMsg};
        }
        if (lower.contains('exit')) {
          return {'title': 'Confirm exit', 'message': trimmedMsg};
        }
        return {'title': 'Heads up', 'message': trimmedMsg};

      case HangbugNotificationType.loading:
        return {
          'title': trimmedMsg.isNotEmpty ? trimmedMsg : 'Processing...',
          'message': '',
        };
    }
  }

  String _buildFingerprint(
    String? customId,
    HangbugNotificationType type,
    String title,
    String message,
  ) {
    if (customId != null && customId.isNotEmpty) {
      return 'id:$customId';
    }
    return '${type.name}:${title.toLowerCase()}:${message.toLowerCase()}';
  }

  void _scheduleAutoDismiss(String id, Duration duration) {
    _dismissTimers[id]?.cancel();
    final effective = duration > Duration.zero ? duration : loadingFailsafeDuration;
    _dismissTimers[id] = Timer(effective, () {
      dismiss(id);
    });
  }

  String _showInternal({
    required HangbugNotificationType type,
    String? title,
    required String message,
    String? id,
    Duration? duration,
  }) {
    final structured = _inferTitleAndMessage(type, title, message);
    final resolvedTitle = structured['title'] ?? '';
    final resolvedMessage = structured['message'] ?? '';
    final resolvedDuration = duration ?? _defaultDuration(type);
    final fingerprint = _buildFingerprint(id, type, resolvedTitle, resolvedMessage);
    final now = DateTime.now().millisecondsSinceEpoch;

    final current = List<HangbugNotificationItem>.from(itemsNotifier.value);
    final dupIndex = current.indexWhere(
      (item) => !item.isExiting && (item.id == id || item.fingerprint == fingerprint),
    );

    if (dupIndex != -1) {
      final existing = current[dupIndex];
      current[dupIndex] = existing.copyWith(
        type: type,
        title: resolvedTitle,
        message: resolvedMessage,
        duration: resolvedDuration,
        updatedAt: now,
      );
      itemsNotifier.value = current;
      _scheduleAutoDismiss(existing.id, resolvedDuration);
      return existing.id;
    }

    final toastId = id ?? 'hb-mobile-toast-${++_counter}-$now';
    final newItem = HangbugNotificationItem(
      id: toastId,
      fingerprint: fingerprint,
      type: type,
      title: resolvedTitle,
      message: resolvedMessage,
      duration: resolvedDuration,
      updatedAt: now,
    );

    final nextList = [newItem, ...current];
    final activeItems = nextList.where((e) => !e.isExiting).toList();
    if (activeItems.length > maxVisibleToasts) {
      for (final overflow in activeItems.skip(maxVisibleToasts)) {
        dismiss(overflow.id);
      }
    }

    itemsNotifier.value = nextList;
    _scheduleAutoDismiss(toastId, resolvedDuration);
    return toastId;
  }

  String _updateInternal(
    String id, {
    required HangbugNotificationType type,
    String? title,
    required String message,
    Duration? duration,
  }) {
    final current = List<HangbugNotificationItem>.from(itemsNotifier.value);
    final index = current.indexWhere((item) => item.id == id && !item.isExiting);

    if (index == -1) {
      return _showInternal(
        type: type,
        title: title,
        message: message,
        id: id,
        duration: duration,
      );
    }

    final structured = _inferTitleAndMessage(type, title, message);
    final resolvedTitle = structured['title'] ?? '';
    final resolvedMessage = structured['message'] ?? '';
    final resolvedDuration = duration ?? _defaultDuration(type);
    final fingerprint = _buildFingerprint(id, type, resolvedTitle, resolvedMessage);

    current[index] = current[index].copyWith(
      type: type,
      title: resolvedTitle,
      message: resolvedMessage,
      duration: resolvedDuration,
      fingerprint: fingerprint,
      updatedAt: DateTime.now().millisecondsSinceEpoch,
    );

    itemsNotifier.value = current;
    _scheduleAutoDismiss(id, resolvedDuration);
    return id;
  }

  void _dismissInternal(String id) {
    _dismissTimers.remove(id)?.cancel();
    final current = List<HangbugNotificationItem>.from(itemsNotifier.value);
    final index = current.indexWhere((item) => item.id == id);
    if (index == -1 || current[index].isExiting) return;

    current[index] = current[index].copyWith(isExiting: true);
    itemsNotifier.value = current;

    _exitTimers[id]?.cancel();
    _exitTimers[id] = Timer(exitAnimationDuration, () {
      _exitTimers.remove(id);
      final updated = List<HangbugNotificationItem>.from(itemsNotifier.value)
        ..removeWhere((item) => item.id == id);
      itemsNotifier.value = updated;
    });
  }

  void _clearInternal() {
    for (final timer in _dismissTimers.values) {
      timer.cancel();
    }
    for (final timer in _exitTimers.values) {
      timer.cancel();
    }
    _dismissTimers.clear();
    _exitTimers.clear();
    itemsNotifier.value = const [];
  }

  // Static convenience API

  static String success({
    String? title,
    required String message,
    String? id,
    Duration? duration,
  }) {
    return instance._showInternal(
      type: HangbugNotificationType.success,
      title: title,
      message: message,
      id: id,
      duration: duration,
    );
  }

  static String error({
    String? title,
    required String message,
    String? id,
    Duration? duration,
  }) {
    return instance._showInternal(
      type: HangbugNotificationType.error,
      title: title,
      message: message,
      id: id,
      duration: duration,
    );
  }

  static String warning({
    String? title,
    required String message,
    String? id,
    Duration? duration,
  }) {
    return instance._showInternal(
      type: HangbugNotificationType.warning,
      title: title,
      message: message,
      id: id,
      duration: duration,
    );
  }

  static String info({
    String? title,
    required String message,
    String? id,
    Duration? duration,
  }) {
    return instance._showInternal(
      type: HangbugNotificationType.info,
      title: title,
      message: message,
      id: id,
      duration: duration,
    );
  }

  static String loading({
    String? title,
    String message = '',
    String? id,
  }) {
    return instance._showInternal(
      type: HangbugNotificationType.loading,
      title: title ?? 'Processing...',
      message: message,
      id: id,
      duration: Duration.zero,
    );
  }

  static String update(
    String id, {
    required HangbugNotificationType type,
    String? title,
    required String message,
    Duration? duration,
  }) {
    return instance._updateInternal(
      id,
      type: type,
      title: title,
      message: message,
      duration: duration,
    );
  }

  static void dismiss(String id) {
    instance._dismissInternal(id);
  }

  static void clear() {
    instance._clearInternal();
  }
}
