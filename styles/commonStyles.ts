
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#FFB3BA',      // Pastel Pink
  secondary: '#BAFFC9',    // Pastel Green
  accent: '#BAE1FF',       // Pastel Blue
  background: '#FFFACD',   // Light Cream
  backgroundAlt: '#F5F5DC', // Beige
  surface: '#F8F8F8',      // Light Surface
  text: '#4A4A4A',         // Dark Gray for readability
  textLight: '#7A7A7A',    // Light Gray
  card: '#FFFFFF',         // White
  white: '#FFFFFF',        // Pure White
  border: '#E0E0E0',       // Light Border
  success: '#BAFFC9',      // Pastel Green
  warning: '#FFDFBA',      // Pastel Orange
  error: '#FFB3BA',        // Pastel Pink/Red
  purple: '#E0BBE4',       // Pastel Purple
  yellow: '#FFFFBA',       // Pastel Yellow
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
  secondary: {
    backgroundColor: colors.secondary,
    alignSelf: 'center',
    width: '100%',
  },
  accent: {
    backgroundColor: colors.accent,
    alignSelf: 'center',
    width: '100%',
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
    alignSelf: 'flex-start',
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 100,
    alignSelf: 'flex-start',
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    minWidth: 120,
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100, // Extra space for safe area
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 8
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  textLight: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textLight,
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  petCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingBottom: 20, // Extra padding for safe area
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  smallButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minWidth: 80,
  },
  smallButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
