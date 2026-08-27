import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TeletextColors, TeletextFonts } from '../styles/teletext';

interface TeletextHeaderProps {
  title: string;
  subtitle?: string;
}

export const TeletextHeader: React.FC<TeletextHeaderProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: TeletextFonts.sizes.xl,
    fontWeight: 'bold',
    color: TeletextColors.orange,
    fontFamily: TeletextFonts.family,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: TeletextFonts.sizes.normal,
    color: TeletextColors.cyan,
    fontFamily: TeletextFonts.family,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: TeletextColors.cyan,
    marginTop: 8,
  },
});
