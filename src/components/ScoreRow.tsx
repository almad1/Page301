import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NormalisedMatch, GoalEvent } from '../types';
import { TeletextColors, TeletextFonts } from '../styles/teletext';

interface ScoreRowProps {
  match: NormalisedMatch;
}

function fmtScore(score: string): string {
  // "2 - 1" → "2-1"
  return score.replace(' - ', '-').replace(' - ', '-');
}

function fmtPlayer(g: GoalEvent): string {
  const og = g.ownGoal ? ' og' : '';
  return `${g.player}${og} ${g.time}`;
}

export const ScoreRow: React.FC<ScoreRowProps> = ({ match }) => {
  const isLive = match.status === 'LIVE' ||
    (match.time !== 'FT' && match.time !== 'SCHED' && match.score !== '');
  const isFinished = match.status === 'FINISHED' || match.time === 'FT';
  const isScheduled = !isLive && !isFinished;

  const homeGoals: GoalEvent[] = (match.goals || []).filter((g) => g.homeAway === 'h');
  const awayGoals: GoalEvent[] = (match.goals || []).filter((g) => g.homeAway === 'a');
  const goalRows = Math.max(homeGoals.length, awayGoals.length);

  let scoreDisplay: string;
  let timeBadge: string;
  if (isScheduled) {
    scoreDisplay = 'v';
    timeBadge = match.scheduled || '';
  } else {
    scoreDisplay = match.score ? fmtScore(match.score) : '?-?';
    timeBadge = isFinished ? 'FT' : match.time;
  }

  const scoreStyle = isLive ? [styles.score, styles.scoreLive] : styles.score;
  const teamStyle = isLive ? [styles.team, styles.teamLive] : styles.team;

  return (
    <View style={styles.container}>
      {/* Main match row */}
      <View style={styles.matchRow}>
        <Text style={teamStyle} numberOfLines={1}>{match.home_name.toUpperCase()}</Text>
        <View style={styles.scoreBox}>
          <Text style={scoreStyle}>{scoreDisplay}</Text>
        </View>
        <Text style={teamStyle} numberOfLines={1}>{match.away_name.toUpperCase()}</Text>
        <Text style={[styles.badge, isLive && styles.badgeLive]}>{timeBadge}</Text>
      </View>

      {/* Scorer rows: home scorers left, away scorers right */}
      {goalRows > 0 && (
        <View style={styles.scorerSection}>
          <View style={styles.scorerCol}>
            {homeGoals.map((g, i) => (
              <Text key={i} style={styles.scorer}>{fmtPlayer(g)}</Text>
            ))}
          </View>
          <View style={styles.scorerColRight}>
            {awayGoals.map((g, i) => (
              <Text key={i} style={styles.scorer}>{fmtPlayer(g)}</Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottomColor: '#1a1a1a',
    borderBottomWidth: 1,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  team: {
    flex: 1,
    fontSize: TeletextFonts.sizes.normal,
    color: TeletextColors.cyan,
    fontFamily: TeletextFonts.family,
    fontWeight: 'bold',
  },
  teamLive: {
    color: TeletextColors.red,
  },
  scoreBox: {
    width: 52,
    alignItems: 'center',
  },
  score: {
    color: TeletextColors.textSecondary,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
    fontWeight: 'bold',
  },
  scoreLive: {
    color: TeletextColors.red,
  },
  badge: {
    width: 36,
    textAlign: 'right',
    color: TeletextColors.white,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.small,
    fontWeight: 'bold',
  },
  badgeLive: {
    color: TeletextColors.red,
  },
  scorerSection: {
    flexDirection: 'row',
    marginTop: 1,
    paddingLeft: 2,
  },
  scorerCol: {
    flex: 1,
  },
  scorerColRight: {
    flex: 1,
  },
  scorer: {
    color: TeletextColors.white,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.small,
  },
});
