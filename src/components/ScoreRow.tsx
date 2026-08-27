import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Match } from '../types';
import { TeletextColors, TeletextFonts } from '../styles/teletext';

interface ScoreRowProps {
  match: Match;
  onPress?: () => void;
}

export const ScoreRow: React.FC<ScoreRowProps> = ({ match, onPress }) => {
  const homeScore = match.score.fullTime.home !== null ? match.score.fullTime.home : '-';
  const awayScore = match.score.fullTime.away !== null ? match.score.fullTime.away : '-';
  const isLive = match.status === 'LIVE' || match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const kickOff = new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const status = match.status === 'FINISHED' ? 'FT' : isLive ? 'LIVE' : kickOff;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.teamHome} numberOfLines={1}>
          {match.homeTeam.shortName || match.homeTeam.tla}
        </Text>
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, isLive && styles.live]}>{homeScore}</Text>
          <Text style={styles.status}>{status}</Text>
          <Text style={[styles.score, isLive && styles.live]}>{awayScore}</Text>
        </View>
        <Text style={styles.teamAway} numberOfLines={1}>
          {match.awayTeam.shortName || match.awayTeam.tla}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomColor: TeletextColors.cyan,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamHome: {
    flex: 1,
    fontSize: TeletextFonts.sizes.normal,
    color: TeletextColors.textPrimary,
    fontFamily: TeletextFonts.family,
  },
  teamAway: {
    flex: 1,
    textAlign: 'right',
    fontSize: TeletextFonts.sizes.normal,
    color: TeletextColors.textPrimary,
    fontFamily: TeletextFonts.family,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  score: {
    fontSize: TeletextFonts.sizes.large,
    fontWeight: 'bold',
    color: TeletextColors.textSecondary,
    fontFamily: TeletextFonts.family,
    width: 20,
    textAlign: 'center',
  },
  status: {
    fontSize: TeletextFonts.sizes.small,
    color: TeletextColors.cyan,
    fontFamily: TeletextFonts.family,
    marginHorizontal: 4,
    minWidth: 40,
    textAlign: 'center',
  },
  live: {
    color: TeletextColors.red,
  },
});
