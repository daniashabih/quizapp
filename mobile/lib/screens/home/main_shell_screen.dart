import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/config/app_config.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../services/notification_service.dart';
import '../../widgets/network_status_banner.dart';

class _NavDestination {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isCenterFeatured;

  const _NavDestination({
    required this.icon,
    required this.activeIcon,
    required this.label,
    this.isCenterFeatured = false,
  });
}

class MainShellScreen extends ConsumerStatefulWidget {
  final StatefulNavigationShell navigationShell;

  const MainShellScreen({
    super.key,
    required this.navigationShell,
  });

  @override
  ConsumerState<MainShellScreen> createState() => _MainShellScreenState();
}

class _MainShellScreenState extends ConsumerState<MainShellScreen> {
  DateTime? _lastBackPressTime;

  bool _handleBackPress() {
    final now = DateTime.now();
    if (_lastBackPressTime == null ||
        now.difference(_lastBackPressTime!) > const Duration(seconds: 2)) {
      _lastBackPressTime = now;
      AppNotificationService.info(
        id: 'mobile-back-press-exit',
        title: 'Confirm exit',
        message: 'Press back again to exit ${AppConfig.appName}',
        duration: const Duration(seconds: 2),
      );
      return false;
    }
    return true;
  }

  void _onSelectTab(int index) {
    widget.navigationShell.goBranch(
      index,
      initialLocation: index == widget.navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isAdmin = authState.isAdmin;
    final currentIndex = widget.navigationShell.currentIndex;
    final isDark = context.isDark;

    final destinations = <_NavDestination>[
      const _NavDestination(
        icon: Icons.home_outlined,
        activeIcon: Icons.home_rounded,
        label: 'Home',
      ),
      const _NavDestination(
        icon: Icons.explore_outlined,
        activeIcon: Icons.explore_rounded,
        label: 'Explore',
      ),
      const _NavDestination(
        icon: Icons.sports_esports_outlined,
        activeIcon: Icons.sports_esports_rounded,
        label: 'Games',
        isCenterFeatured: true,
      ),
      const _NavDestination(
        icon: Icons.workspace_premium_outlined,
        activeIcon: Icons.workspace_premium_rounded,
        label: 'Certificates',
      ),
      const _NavDestination(
        icon: Icons.person_outline_rounded,
        activeIcon: Icons.person_rounded,
        label: 'Profile',
      ),
      if (isAdmin)
        const _NavDestination(
          icon: Icons.admin_panel_settings_outlined,
          activeIcon: Icons.admin_panel_settings_rounded,
          label: 'Admin',
        ),
    ];

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        if (currentIndex != 0) {
          widget.navigationShell.goBranch(0);
        } else {
          final shouldExit = _handleBackPress();
          if (shouldExit) {
            Navigator.of(context).pop();
          }
        }
      },
      child: Scaffold(
        body: Column(
          children: [
            const NetworkStatusBanner(),
            Expanded(child: widget.navigationShell),
          ],
        ),
        bottomNavigationBar: _ReferenceBottomNavBar(
          destinations: destinations,
          currentIndex: currentIndex,
          isDark: isDark,
          onTap: _onSelectTab,
        ),
      ),
    );
  }
}

class _ReferenceBottomNavBar extends StatelessWidget {
  final List<_NavDestination> destinations;
  final int currentIndex;
  final bool isDark;
  final ValueChanged<int> onTap;

  const _ReferenceBottomNavBar({
    required this.destinations,
    required this.currentIndex,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final activeColor = isDark ? AppColors.accent : AppColors.primary;
    final inactiveColor = context.textMutedColor;

    return Container(
      decoration: BoxDecoration(
        color: context.cardBgColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(
          top: BorderSide(
            color: context.borderColor.withValues(alpha: isDark ? 0.55 : 0.45),
            width: 1,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.34 : 0.07),
            blurRadius: 24,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 74,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: List.generate(destinations.length, (index) {
                final item = destinations[index];
                final isSelected = currentIndex == index;

                if (item.isCenterFeatured) {
                  return Expanded(
                    child: _CenterFeaturedNavItem(
                      item: item,
                      isSelected: isSelected,
                      isDark: isDark,
                      onTap: () => onTap(index),
                    ),
                  );
                }

                return Expanded(
                  child: _StandardNavItem(
                    item: item,
                    isSelected: isSelected,
                    activeColor: activeColor,
                    inactiveColor: inactiveColor,
                    onTap: () => onTap(index),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}

class _StandardNavItem extends StatelessWidget {
  final _NavDestination item;
  final bool isSelected;
  final Color activeColor;
  final Color inactiveColor;
  final VoidCallback onTap;

  const _StandardNavItem({
    required this.item,
    required this.isSelected,
    required this.activeColor,
    required this.inactiveColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = isSelected ? activeColor : inactiveColor;

    return Semantics(
      button: true,
      selected: isSelected,
      label: item.label,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 2),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 220),
                curve: Curves.easeOutCubic,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: isSelected
                      ? activeColor.withValues(alpha: 0.12)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: AnimatedScale(
                  scale: isSelected ? 1.08 : 1.0,
                  duration: const Duration(milliseconds: 200),
                  curve: Curves.easeOutBack,
                  child: Icon(
                    isSelected ? item.activeIcon : item.icon,
                    size: 22,
                    color: color,
                  ),
                ),
              ),
              const SizedBox(height: 3),
              Text(
                item.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: color,
                  letterSpacing: 0.1,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CenterFeaturedNavItem extends StatelessWidget {
  final _NavDestination item;
  final bool isSelected;
  final bool isDark;
  final VoidCallback onTap;

  const _CenterFeaturedNavItem({
    required this.item,
    required this.isSelected,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final activeLabelColor = isDark ? AppColors.accent : AppColors.primary;

    return Semantics(
      button: true,
      selected: isSelected,
      label: item.label,
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Stack(
          clipBehavior: Clip.none,
          alignment: Alignment.center,
          children: [
            Positioned(
              top: -16,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 240),
                curve: Curves.easeOutBack,
                width: 60,
                height: 60,
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: context.cardBgColor,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(
                        alpha: isSelected ? 0.34 : 0.22,
                      ),
                      blurRadius: isSelected ? 18 : 14,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      colors: [AppColors.primary, AppColors.primaryLight],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    border: Border.all(
                      color: isSelected
                          ? AppColors.accent
                          : Colors.white.withValues(alpha: 0.22),
                      width: isSelected ? 2.2 : 1.2,
                    ),
                  ),
                  child: Center(
                    child: AnimatedScale(
                      scale: isSelected ? 1.12 : 1.0,
                      duration: const Duration(milliseconds: 200),
                      child: Icon(
                        isSelected ? item.activeIcon : Icons.grid_view_rounded,
                        color: Colors.white,
                        size: 25,
                      ),
                    ),
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 6,
              child: Text(
                item.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                  color: isSelected ? activeLabelColor : context.textMutedColor,
                  letterSpacing: 0.1,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
