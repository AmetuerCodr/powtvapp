import { StyleSheet, Platform } from 'react-native';

// ─── Color Tokens ────────────────────────────────────────────────────────────

export const Colors = {
  // Backgrounds
  bgBase: '#09090b',
  bgSurface: '#18181b',
  bgElevated: '#27272a',
  border: '#3f3f46',

  // Amber — primary accent
  amber50: '#fffbeb',
  amber500: '#f5a100',
  amber700: '#b45309',
  amber950: '#451a03',

  // Fuchsia — secondary accent
  fuchsia50: '#fdf4ff',
  fuchsia500: '#d946ef',
  fuchsia700: '#a21caf',
  fuchsia950: '#4a044e',

  // Text hierarchy
  textPrimary: '#fafafa',
  textSecondary: '#e4e4e7',
  textMuted: '#a1a1aa',
  textSubtle: '#71717a',
  textDisabled: '#52525b',

  // Semantic
  live: '#ef4444',      // red-500
  iconInactive: '#a1a1aa',
  iconActive: '#f5a100',
} as const;

// ─── Spacing Scale ────────────────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

// ─── Typography — Sora ───────────────────────────────────────────────────────
// Load 'Sora' via expo-font; falls back to system sans until loaded.

const fontFamily = Platform.select({
  ios: 'Sora',
  android: 'Sora',
  default: 'System',
});

export const Typography = StyleSheet.create({
  display: {
    fontFamily,
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  heading1: {
    fontFamily,
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  heading2: {
    fontFamily,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  bodyStrong: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  body: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  caption: {
    fontFamily,
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  iconLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  label: {
    fontFamily,
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

// ─── Layout Helpers ───────────────────────────────────────────────────────────

export const Layout = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
