export const TeletextColors = {
  background: '#000000',
  textPrimary: '#00FF00',
  textSecondary: '#FFFF00',
  orange: '#FF8800',
  cyan: '#00FFFF',
  red: '#FF0000',
  white: '#FFFFFF',
  blue: '#0000CC',
};

export const TeletextFonts = {
  family: 'CourierPrime_700Bold',
  sizes: {
    small: 11,
    normal: 13,
    large: 16,
    xl: 19,
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
