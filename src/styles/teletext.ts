export const TeletextColors = {
  background: '#000000',
  textPrimary: '#00FF00',
  textSecondary: '#FFFF00',
  orange: '#FF8800',
  cyan: '#00FFFF',
  red: '#FF0000',
  white: '#FFFFFF',
};

export const TeletextFonts = {
  family: 'Courier New',
  sizes: {
    small: 10,
    normal: 12,
    large: 14,
    xl: 16,
  },
};

export const TeletextStyles = {
  container: {
    flex: 1,
    backgroundColor: TeletextColors.background,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  header: {
    fontSize: TeletextFonts.sizes.xl,
    fontWeight: 'bold' as const,
    color: TeletextColors.orange,
    fontFamily: TeletextFonts.family,
    marginBottom: 10,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  text: {
    fontSize: TeletextFonts.sizes.normal,
    color: TeletextColors.textPrimary,
    fontFamily: TeletextFonts.family,
  },
  grid: {
    marginVertical: 8,
    borderColor: TeletextColors.cyan,
    borderWidth: 1,
  },
};
