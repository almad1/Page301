import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { TeletextColors, TeletextFonts } from '../styles/teletext';
import { useNav } from '../navigation/NavContext';

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
  const [inputVisible, setInputVisible] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<TextInput>(null);
  const { currentPage, navigate } = useNav();

  useEffect(() => {
    const t = setInterval(() => setDt(fmtDatetime()), 1000);
    return () => clearInterval(t);
  }, []);

  const openInput = () => {
    setInputVal('');
    setInputVisible(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const commitPage = (val: string) => {
    const page = parseInt(val, 10);
    if (page >= 300 && page <= 399) navigate(page);
    setInputVisible(false);
    setInputVal('');
  };

  const handleChange = (val: string) => {
    setInputVal(val);
    if (val.length === 3) commitPage(val);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.topBar}>
        {inputVisible ? (
          <TextInput
            ref={inputRef}
            style={styles.pageInput}
            value={inputVal}
            onChangeText={handleChange}
            keyboardType="number-pad"
            maxLength={3}
            onSubmitEditing={() => commitPage(inputVal)}
            onBlur={() => { setInputVisible(false); setInputVal(''); }}
            placeholder="3__"
            placeholderTextColor={TeletextColors.orange}
          />
        ) : (
          <TouchableOpacity onPress={openInput} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.pageNum}>P{currentPage}</Text>
          </TouchableOpacity>
        )}
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
  wrapper: { marginBottom: 4 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  pageNum: {
    color: TeletextColors.textSecondary,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
  },
  pageInput: {
    color: TeletextColors.textSecondary,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
    width: 48,
    borderBottomWidth: 1,
    borderBottomColor: TeletextColors.textSecondary,
    padding: 0,
  },
  datetime: {
    color: TeletextColors.textSecondary,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
  },
  banner: {
    backgroundColor: TeletextColors.blue,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: TeletextColors.textPrimary,
    fontFamily: TeletextFonts.family,
    fontSize: 48,
    letterSpacing: 6,
    textShadowColor: TeletextColors.textPrimary,
    textShadowOffset: { width: 1, height: 0 },
    textShadowRadius: 1,
  },
  divider: { height: 2, backgroundColor: TeletextColors.cyan, marginTop: 4 },
});
