import 'package:flutter/material.dart';

class AppTheme {
  // Human-touch Clean Light Slate Palette
  static const Color lightBackground = Color(0xFFF8FAFC);
  static const Color cardBackground = Color(0xFFFFFFFF);
  static const Color primaryBlue = Color(0xFF2563EB);
  static const Color primaryBlueDark = Color(0xFF1D4ED8);
  static const Color accentGreen = Color(0xFF16A34A);
  static const Color accentAmber = Color(0xFFD97706);
  static const Color accentRed = Color(0xFFDC2626);
  static const Color textDark = Color(0xFF0F172A);
  static const Color textMuted = Color(0xFF64748B);
  static const Color borderColor = Color(0xFFE2E8F0);

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: lightBackground,
      primaryColor: primaryBlue,
      colorScheme: const ColorScheme.light(
        primary: primaryBlue,
        secondary: accentGreen,
        surface: cardBackground,
        error: accentRed,
      ),
      cardTheme: CardThemeData(
        color: cardBackground,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: borderColor, width: 1),
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFFFFFFFF),
        elevation: 0.5,
        centerTitle: true,
        iconTheme: IconThemeData(color: textDark),
        titleTextStyle: TextStyle(
          color: textDark,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryBlue,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(52),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFFFFFFFF),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryBlue, width: 2),
        ),
        labelStyle: const TextStyle(color: textMuted),
        hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
      ),
    );
  }
}
