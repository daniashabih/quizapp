import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../models/seo_dashboard_model.dart';
import 'seo_theme_tokens.dart';

class SeoHealthRingGauge extends StatelessWidget {
  final int score;
  final double size;

  const SeoHealthRingGauge({
    super.key,
    required this.score,
    this.size = 112,
  });

  @override
  Widget build(BuildContext context) {
    final safeScore = score.clamp(0, 100);
    final Color ringColor = safeScore >= 85
        ? SeoColors.accentGreen
        : safeScore >= 65
            ? const Color(0xFFD19A45)
            : const Color(0xFFC96155);

    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _HealthRingPainter(
          score: safeScore,
          ringColor: ringColor,
          trackColor: SeoColors.border(context),
        ),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '$safeScore',
                style: AppTextStyles.displaySmall.copyWith(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: SeoColors.textPrimary(context),
                ),
              ),
              Text(
                '/ 100',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: SeoColors.textMuted(context),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HealthRingPainter extends CustomPainter {
  final int score;
  final Color ringColor;
  final Color trackColor;

  _HealthRingPainter({
    required this.score,
    required this.ringColor,
    required this.trackColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (math.min(size.width, size.height) - 12) / 2;
    const strokeWidth = 10.0;

    final trackPaint = Paint()
      ..color = trackColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    final progressPaint = Paint()
      ..color = ringColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, trackPaint);
    final sweepAngle = (score / 100) * 2 * math.pi;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      sweepAngle,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(covariant _HealthRingPainter oldDelegate) =>
      oldDelegate.score != score ||
      oldDelegate.ringColor != ringColor ||
      oldDelegate.trackColor != trackColor;
}

class SeoTrendChart extends StatelessWidget {
  final List<double> values;
  final List<double?>? previousValues;
  final List<String> labels;
  final String title;
  final Color color;
  final bool invertY;

  const SeoTrendChart({
    super.key,
    required this.values,
    this.previousValues,
    required this.labels,
    required this.title,
    required this.color,
    this.invertY = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: SeoColors.cardBg(context),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: SeoColors.border(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: AppTextStyles.labelBold.copyWith(
                  color: SeoColors.textPrimary(context),
                ),
              ),
              if (previousValues != null &&
                  previousValues!.any((element) => element != null))
                Text(
                  'Dashed: prev period',
                  style: TextStyle(
                    fontSize: 10,
                    color: SeoColors.textMuted(context),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          if (values.isEmpty)
            SizedBox(
              height: 120,
              child: Center(
                child: Text(
                  'No time-series points in this date window.',
                  style: TextStyle(
                    fontSize: 12,
                    color: SeoColors.textMuted(context),
                  ),
                ),
              ),
            )
          else
            SizedBox(
              height: 140,
              width: double.infinity,
              child: CustomPaint(
                painter: _TrendChartPainter(
                  values: values,
                  previousValues: previousValues,
                  lineColor: color,
                  gridColor: SeoColors.border(context),
                  invertY: invertY,
                ),
              ),
            ),
          if (labels.isNotEmpty) ...[
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  labels.first,
                  style: TextStyle(
                    fontSize: 10,
                    color: SeoColors.textMuted(context),
                  ),
                ),
                if (labels.length > 2)
                  Text(
                    labels[labels.length ~/ 2],
                    style: TextStyle(
                      fontSize: 10,
                      color: SeoColors.textMuted(context),
                    ),
                  ),
                Text(
                  labels.last,
                  style: TextStyle(
                    fontSize: 10,
                    color: SeoColors.textMuted(context),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _TrendChartPainter extends CustomPainter {
  final List<double> values;
  final List<double?>? previousValues;
  final Color lineColor;
  final Color gridColor;
  final bool invertY;

  _TrendChartPainter({
    required this.values,
    this.previousValues,
    required this.lineColor,
    required this.gridColor,
    this.invertY = false,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (values.isEmpty) return;

    final allNums = <double>[
      ...values,
      if (previousValues != null) ...previousValues!.whereType<double>(),
    ];
    final minVal = invertY ? allNums.reduce(math.min) : 0.0;
    final maxVal = math.max(
      allNums.reduce(math.max),
      invertY ? minVal + 1.0 : 1.0,
    );
    final span = math.max(0.0001, maxVal - minVal);

    final gridPaint = Paint()
      ..color = gridColor
      ..strokeWidth = 1;
    for (int i = 0; i <= 2; i++) {
      final y = (size.height / 2) * i;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    double xAt(int idx) => values.length == 1
        ? size.width / 2
        : (idx / (values.length - 1)) * size.width;
    double yAt(double val) {
      final norm = (val - minVal) / span;
      return invertY ? norm * size.height : (1 - norm) * size.height;
    }

    if (previousValues != null && previousValues!.isNotEmpty) {
      final prevPaint = Paint()
        ..color = Colors.grey.withValues(alpha: 0.55)
        ..strokeWidth = 1.5
        ..style = PaintingStyle.stroke;
      for (int i = 0; i < previousValues!.length - 1; i++) {
        final a = previousValues![i];
        final b = previousValues![i + 1];
        if (a != null && b != null && i.isEven) {
          canvas.drawLine(
            Offset(xAt(i), yAt(a)),
            Offset(xAt(i + 1), yAt(b)),
            prevPaint,
          );
        }
      }
    }

    final path = Path();
    final areaPath = Path();
    for (int i = 0; i < values.length; i++) {
      final pt = Offset(xAt(i), yAt(values[i]));
      if (i == 0) {
        path.moveTo(pt.dx, pt.dy);
        areaPath.moveTo(pt.dx, size.height);
        areaPath.lineTo(pt.dx, pt.dy);
      } else {
        path.lineTo(pt.dx, pt.dy);
        areaPath.lineTo(pt.dx, pt.dy);
      }
    }
    areaPath.lineTo(xAt(values.length - 1), size.height);
    areaPath.close();

    final areaPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          lineColor.withValues(alpha: 0.22),
          lineColor.withValues(alpha: 0.01),
        ],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    final linePaint = Paint()
      ..color = lineColor
      ..strokeWidth = 2.4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    canvas.drawPath(areaPath, areaPaint);
    canvas.drawPath(path, linePaint);
  }

  @override
  bool shouldRepaint(covariant _TrendChartPainter oldDelegate) =>
      oldDelegate.values != values || oldDelegate.lineColor != lineColor;
}

class SeoMetricCard extends StatelessWidget {
  final SeoOverviewMetric metric;
  final VoidCallback? onConnectTap;

  const SeoMetricCard({
    super.key,
    required this.metric,
    this.onConnectTap,
  });

  @override
  Widget build(BuildContext context) {
    final hasTrend = metric.available && metric.trend != null;
    final positive = hasTrend &&
        (metric.invertTrendGood ? metric.trend! <= 0 : metric.trend! >= 0);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: SeoColors.cardBg(context),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: SeoColors.border(context)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  metric.label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w700,
                    color: SeoColors.textMuted(context),
                  ),
                ),
              ),
              if (metric.isEstimated) const SeoStatusBadge(status: 'Estimated'),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Flexible(
                child: Text(
                  metric.formattedValue,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTextStyles.displaySmall.copyWith(
                    fontSize: metric.available ? 22 : 13,
                    fontWeight: FontWeight.w800,
                    color: metric.available
                        ? SeoColors.textPrimary(context)
                        : SeoColors.textMuted(context),
                  ),
                ),
              ),
              if (hasTrend) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: positive
                        ? SeoColors.mintSurface(context)
                        : const Color(0xFFFCEEED),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${metric.trend! > 0 ? '+' : ''}${metric.trend}${metric.trendUnit}',
                    style: TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                      color: positive
                          ? SeoColors.primaryBrand(context)
                          : const Color(0xFFB91C1C),
                    ),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 6),
          Text(
            metric.available
                ? metric.explanation
                : (metric.unavailabilityReason.isNotEmpty
                    ? metric.unavailabilityReason
                    : metric.explanation),
            style: TextStyle(
              fontSize: 11,
              height: 1.35,
              color: SeoColors.textMuted(context),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  'Source: ${metric.source}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: SeoColors.textMuted(context),
                  ),
                ),
              ),
              if (!metric.available && onConnectTap != null)
                GestureDetector(
                  onTap: onConnectTap,
                  child: Text(
                    'Connect →',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: SeoColors.primaryBrand(context),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class SeoEmptyIntegrationCard extends StatelessWidget {
  final String title;
  final String description;
  final String source;
  final VoidCallback? onConfigure;

  const SeoEmptyIntegrationCard({
    super.key,
    required this.title,
    required this.description,
    required this.source,
    this.onConfigure,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: SeoColors.cardBg(context),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: SeoColors.border(context)),
      ),
      child: Column(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: SeoColors.mintSurface(context),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              Icons.power_outlined,
              color: SeoColors.primaryBrand(context),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            textAlign: TextAlign.center,
            style: AppTextStyles.labelBold.copyWith(
              fontSize: 15,
              color: SeoColors.textPrimary(context),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            description,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              height: 1.45,
              color: SeoColors.textMuted(context),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Provider: $source',
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: SeoColors.accentGreen,
            ),
          ),
          if (onConfigure != null) ...[
            const SizedBox(height: 14),
            ElevatedButton(
              onPressed: onConfigure,
              style: ElevatedButton.styleFrom(
                backgroundColor: SeoColors.primaryDarkGreen,
                foregroundColor: Colors.white,
                minimumSize: const Size(180, 42),
              ),
              child: const Text('Configure in Settings'),
            ),
          ],
        ],
      ),
    );
  }
}
