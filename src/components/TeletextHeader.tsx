import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TeletextColors, TeletextFonts } from '../styles/teletext';

function fmtDatetime(): string {
  const d = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${days[d.getDay()]} ${dd} ${months[d.getMonth()]}  ${hh}:${mm}:${ss}`;
}

export const TeletextHeader: React.FC = () => {
  const [dt, setDt] = useState(fmtDatetime());
  useEffect(() => {
    const t = setInterval(() => setDt(fmtDatetime()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={styles.wrapper}>
      <View style={styles.topBar}>
        <Text style={styles.pageNum}>Page301</Text>
        <Text style={styles.datetime}>{dt}</Text>
      </View>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>FOOTBALL</Text>
      </View>
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  pageNum: {
    color: TeletextColors.textPrimary,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
  },
  datetime: {
    color: TeletextColors.textPrimary,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
  },
  banner: {
    backgroundColor: TeletextColors.blue,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: TeletextColors.textSecondary,
    fontFamily: TeletextFonts.family,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 6,
  },
  divider: {
    height: 2,
    backgroundColor: TeletextColors.cyan,
    marginTop: 4,
  },
});
