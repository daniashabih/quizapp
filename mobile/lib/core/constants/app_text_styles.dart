import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTextStyles {
  // Display / Headings (Poppins) — inherits color from active ThemeData
  static TextStyle displayLarge = GoogleFonts.poppins(
    fontSize: 28,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  );

  static TextStyle displayMedium = GoogleFonts.poppins(
    fontSize: 22,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  );

  static TextStyle displaySmall = GoogleFonts.poppins(
    fontSize: 18,
    fontWeight: FontWeight.w700,
  );

  // Body / UI (Inter) — inherits color from active ThemeData
  static TextStyle bodyLarge = GoogleFonts.inter(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    height: 1.5,
  );

  static TextStyle bodyMedium = GoogleFonts.inter(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    height: 1.4,
  );

  static TextStyle bodySmall = GoogleFonts.inter(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    height: 1.4,
  );

  // Buttons & Labels
  static TextStyle button = GoogleFonts.inter(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.2,
  );

  static TextStyle labelBold = GoogleFonts.inter(
    fontSize: 11,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.5,
  );

  // Monospace (for codes, scores, IDs)
  static TextStyle mono = GoogleFonts.jetBrainsMono(
    fontSize: 13,
    fontWeight: FontWeight.w600,
  );
}
