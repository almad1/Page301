import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { TableEntry } from '../types';
import { liveScoreAPI } from '../api/footballDataClient';
import { TeletextColors, TeletextFonts } from '../styles/teletext';

// Session-level cache: avoids re-fetching the same table within one app session
const tableCache = new Map<number, TableEntry[]>();

interface Props {
  competitionId: number;
  competitionName: string;
  onClose: () => void;
}

export const LeagueTableModal: React.FC<Props> = ({ competitionId, competitionName, onClose }) => {
  const [table, setTable] = useState<TableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cached = tableCache.get(competitionId);
    if (cached) {
      setTable(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    liveScoreAPI.getLeagueTable(competitionId)
      .then((rows) => {
        if (rows.length === 0) setError(true);
        else { tableCache.set(competitionId, rows); setTable(rows); }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [competitionId]);

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>{competitionName.toUpperCase()}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Table header row */}
          <View style={styles.tableHeader}>
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
            <ScrollView>
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
                  <Text style={[styles.cell, styles.numCell, styles.numText]}>{row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}</Text>
                  <Text style={[styles.cell, styles.numCell, styles.ptsText]}>{row.points}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: TeletextColors.background,
    maxHeight: '85%',
    borderTopWidth: 2,
    borderTopColor: TeletextColors.cyan,
  },
  header: {
    backgroundColor: TeletextColors.cyan,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerText: {
    flex: 1,
    color: TeletextColors.background,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
    letterSpacing: 1,
  },
  closeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: TeletextColors.background,
  },
  closeBtnText: {
    color: TeletextColors.cyan,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#001a1a',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: TeletextColors.cyan,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  rowAlt: {
    backgroundColor: '#0a0a0a',
  },
  cell: {
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.small,
  },
  posCell: { width: 22, color: TeletextColors.orange },
  teamCell: { flex: 1, color: TeletextColors.textPrimary },
  numCell: { width: 28, textAlign: 'right', color: TeletextColors.textPrimary },
  posText: { color: TeletextColors.orange },
  teamText: { color: TeletextColors.cyan },
  numText: { color: TeletextColors.textPrimary },
  ptsText: { color: TeletextColors.textSecondary },
  center: {
    padding: 20,
    alignItems: 'center',
  },
  statusText: {
    color: TeletextColors.textPrimary,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
    marginTop: 8,
  },
});
