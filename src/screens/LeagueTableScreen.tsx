import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TableEntry } from '../types';
import { liveScoreAPI } from '../api/footballDataClient';
import { TeletextColors, TeletextFonts, TeletextStyles } from '../styles/teletext';
import { TeletextHeader } from '../components/TeletextHeader';
import { ColorButtons } from '../components/ColorButtons';

const tableCache = new Map<number, TableEntry[]>();

interface Props {
  competitionId: number;
  competitionName: string;
}

export const LeagueTableScreen: React.FC<Props> = ({ competitionId, competitionName }) => {
  const { top, bottom } = useSafeAreaInsets();
  const [table, setTable] = useState<TableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cached = tableCache.get(competitionId);
    if (cached) { setTable(cached); setLoading(false); return; }
    setLoading(true);
    setError(false);
    liveScoreAPI.getLeagueTable(competitionId)
      .then(rows => {
        if (rows.length === 0) { setError(true); }
        else { tableCache.set(competitionId, rows); setTable(rows); }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [competitionId]);

  return (
    <View style={[TeletextStyles.container, { paddingTop: top, paddingBottom: 0 }]}>
      <TeletextHeader />

      <View style={styles.compHeader}>
        <Text style={styles.compName}>{competitionName.toUpperCase()}</Text>
      </View>

      <View style={styles.colHeader}>
        <Text style={[styles.cell, styles.posCell]}>#</Text>
        <Text style={[styles.cell, styles.teamCell]}>TEAM</Text>
        <Text style={[styles.cell, styles.numCell]}>P</Text>
        <Text style={[styles.cell, styles.numCell]}>W</Text>
        <Text style={[styles.cell, styles.numCell]}>D</Text>
        <Text style={[styles.cell, styles.numCell]}>L</Text>
        <Text style={[styles.cell, styles.numCell]}>GD</Text>
        <Text style={[styles.cell, styles.numCell]}>PTS</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={TeletextColors.textPrimary} />
          <Text style={styles.statusText}>LOADING TABLE...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.statusText}>TABLE NOT AVAILABLE</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: bottom + 8 }}
          showsVerticalScrollIndicator={false}
        >
          {table.map((row, i) => (
            <View key={i} style={[styles.row, i % 2 === 1 && styles.rowAlt]}>
              <Text style={[styles.cell, styles.posCell, styles.posText]}>{row.position}</Text>
              <Text style={[styles.cell, styles.teamCell, styles.teamText]} numberOfLines={1}>
                {row.team_name.toUpperCase()}
              </Text>
              <Text style={[styles.cell, styles.numCell, styles.numText]}>{row.played}</Text>
              <Text style={[styles.cell, styles.numCell, styles.numText]}>{row.won}</Text>
              <Text style={[styles.cell, styles.numCell, styles.numText]}>{row.drawn}</Text>
              <Text style={[styles.cell, styles.numCell, styles.numText]}>{row.lost}</Text>
              <Text style={[styles.cell, styles.numCell, styles.numText]}>
                {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
              </Text>
              <Text style={[styles.cell, styles.numCell, styles.ptsText]}>{row.points}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <ColorButtons />
    </View>
  );
};

const styles = StyleSheet.create({
  compHeader: {
    backgroundColor: TeletextColors.blue,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  compName: {
    color: TeletextColors.white,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
    letterSpacing: 1,
  },
  colHeader: {
    flexDirection: 'row',
    backgroundColor: '#001a1a',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: TeletextColors.cyan,
  },
  scroll: { flex: 1 },
  row: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 4 },
  rowAlt: { backgroundColor: '#0a0a0a' },
  cell: { fontFamily: TeletextFonts.family, fontSize: TeletextFonts.sizes.small },
  posCell:  { width: 22 },
  teamCell: { flex: 1 },
  numCell:  { width: 28, textAlign: 'right' },
  posText:  { color: TeletextColors.orange },
  teamText: { color: TeletextColors.cyan },
  numText:  { color: TeletextColors.textPrimary },
  ptsText:  { color: TeletextColors.textSecondary },
  center:   { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  statusText: {
    color: TeletextColors.textPrimary,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
    marginTop: 8,
  },
});
