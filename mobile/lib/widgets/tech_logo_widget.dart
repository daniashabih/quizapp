import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/tech_logo_registry.dart';

/// Displays an official technology SVG logo (or a compact multi-logo cluster for
/// combined technology categories) inside Hangbug's rounded icon container.
///
/// Automatically adapts dark-ink monochrome SVGs and dark-accent badges so logos
/// remain crisp in both Light and Dark themes without changing card layouts.
class TechLogoWidget extends StatelessWidget {
  const TechLogoWidget({
    super.key,
    required this.name,
    this.size = 48.0,
    this.borderRadius = 15.0,
    this.backgroundColor,
    this.border,
    this.fallbackIconColor,
    this.maxLogos = 6,
    this.compactMultiRow = true,
  });

  final String name;
  final double size;
  final double borderRadius;
  final Color? backgroundColor;
  final BoxBorder? border;
  final Color? fallbackIconColor;
  final int maxLogos;

  /// When true and 4+ logos are present, lays icons out in a compact 2-row
  /// cluster (up to 3 icons per row) to prevent horizontal overflow on narrow
  /// mobile cards while keeping all logos clearly legible.
  final bool compactMultiRow;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final resolvedBg = backgroundColor ??
        (isDark ? const Color(0xFF222E29) : const Color(0xFFF4EFE6));
    final resolvedBorder = border ??
        Border.all(
          color: context.borderColor.withValues(alpha: isDark ? 0.55 : 0.7),
          width: 1,
        );
    final logos = TechLogoRegistry.resolve(name).take(maxLogos).toList();

    if (logos.isEmpty) {
      return Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: resolvedBg,
          borderRadius: BorderRadius.circular(borderRadius),
          border: resolvedBorder,
        ),
        child: Center(
          child: Icon(
            Icons.code_rounded,
            size: size * 0.5,
            color: fallbackIconColor ?? context.brandAccentColor,
          ),
        ),
      );
    }

    if (logos.length == 1) {
      final asset = logos.first;
      return Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: resolvedBg,
          borderRadius: BorderRadius.circular(borderRadius),
          border: resolvedBorder,
        ),
        child: Center(
          child: _buildSvgIcon(
            asset,
            iconSize: size * 0.58,
            isDark: isDark,
          ),
        ),
      );
    }

    // 2–3 logos: compact single horizontal row inside a fixed-height pill.
    if (logos.length <= 3 || !compactMultiRow) {
      final iconSize = logos.length <= 2 ? size * 0.5 : size * 0.43;
      final spacing = logos.length <= 3 ? 5.0 : 4.0;
      return Container(
        height: size,
        padding: EdgeInsets.symmetric(horizontal: logos.length <= 2 ? 9.0 : 8.0),
        decoration: BoxDecoration(
          color: resolvedBg,
          borderRadius: BorderRadius.circular(borderRadius),
          border: resolvedBorder,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            for (var i = 0; i < logos.length; i++) ...[
              if (i > 0) SizedBox(width: spacing),
              _buildSvgIcon(logos[i], iconSize: iconSize, isDark: isDark),
            ],
          ],
        ),
      );
    }

    // 4–6 logos: compact 2-row horizontal cluster (3 icons per row) so narrow
    // mobile cards never overflow or starve the category title.
    final iconSize = size >= 48 ? 16.5 : 15.0;
    const hGap = 4.5;
    const vGap = 3.0;
    final splitIndex = (logos.length / 2).ceil();
    final topRow = logos.sublist(0, splitIndex);
    final bottomRow = logos.sublist(splitIndex);

    return Container(
      height: size,
      padding: const EdgeInsets.symmetric(horizontal: 7.0, vertical: 4.0),
      decoration: BoxDecoration(
        color: resolvedBg,
        borderRadius: BorderRadius.circular(borderRadius),
        border: resolvedBorder,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildIconRow(topRow, iconSize: iconSize, gap: hGap, isDark: isDark),
          if (bottomRow.isNotEmpty) ...[
            const SizedBox(height: vGap),
            _buildIconRow(bottomRow, iconSize: iconSize, gap: hGap, isDark: isDark),
          ],
        ],
      ),
    );
  }

  Widget _buildIconRow(
    List<TechLogoAsset> rowAssets, {
    required double iconSize,
    required double gap,
    required bool isDark,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        for (var i = 0; i < rowAssets.length; i++) ...[
          if (i > 0) SizedBox(width: gap),
          _buildSvgIcon(rowAssets[i], iconSize: iconSize, isDark: isDark),
        ],
      ],
    );
  }

  Widget _buildSvgIcon(
    TechLogoAsset asset, {
    required double iconSize,
    required bool isDark,
  }) {
    final colorFilter = (isDark && asset.darkInk)
        ? const ColorFilter.mode(Color(0xFFF3F6F4), BlendMode.srcIn)
        : null;

    final svgWidget = SvgPicture.asset(
      asset.assetPath,
      width: iconSize,
      height: iconSize,
      fit: BoxFit.contain,
      colorFilter: colorFilter,
      semanticsLabel: asset.label,
      placeholderBuilder: (_) => SizedBox(width: iconSize, height: iconSize),
    );

    if (isDark && asset.lightBacking) {
      return Container(
        width: iconSize + 3,
        height: iconSize + 3,
        padding: const EdgeInsets.all(1.5),
        decoration: const BoxDecoration(
          color: Color(0xFFF3F6F4),
          shape: BoxShape.circle,
        ),
        child: svgWidget,
      );
    }

    return SizedBox(
      width: iconSize,
      height: iconSize,
      child: svgWidget,
    );
  }
}
