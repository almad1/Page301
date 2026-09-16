import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NormalisedMatch, GoalEvent, CardEvent } from '../types';
import { TeletextColors, TeletextFonts } from '../styles/teletext';
import { liveScoreAPI } from '../api/footballDataClient';

interface ScoreRowProps {
  match: NormalisedMatch;
}

function fmtGoal(g: GoalEvent): string {
  const suffix = g.ownGoal ? ' og' : g.penalty ? ' pen' : '';
  return `${g.player}${suffix} ${g.time}`;
}

function fmtCard(c: CardEvent): string {
  return `${c.player} ${c.time}`;
}

// Renders a live score with yellow numbers and red dash
function LiveScore({ score }: { score: string }) {
  const parts = score.split('-');
  if (parts.length !== 2) {
    return <Text style={styles.scoreLive}>{score}</Text>;
  }
  return (
    <Text>
      <Text style={styles.scoreNumber}>{parts[0].trim()}</Text>
      <Text style={styles.scoreDash}>{'-'}</Text>
      <Text style={styles.scoreNumber}>{parts[1].trim()}</Text>
    </Text>
  );
}

export const ScoreRow: React.FC<ScoreRowProps> = ({ match }) => {
  const [expanded, setExpanded] = useState(false);
  const [goals, setGoals] = useState<GoalEvent[]>(match.goals ?? []);
  const [cards, setCards] = useState<CardEvent[]>(match.cards ?? []);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [dotFrame, setDotFrame] = useState(0);

  useEffect(() => {
    if (!loadingEvents) { setDotFrame(0); return; }
    const t = setInterval(() => setDotFrame((f) => (f + 1) % 3), 400);
    return () => clearInterval(t);
  }, [loadingEvents]);

  // Sync when Redux enriches the match after initial render
  useEffect(() => {
    if (match.goals !== undefined) setGoals(match.goals);
  }, [match.goals]);
  useEffect(() => {
    if (match.cards !== undefined) setCards(match.cards);
  }, [match.cards]);

  const isFinished = match.status === 'FINISHED' || match.time === 'FT';
  const isLive = !isFinished && match.score !== '' && (
    match.status === 'LIVE' || (match.time !== 'FT' && match.time !== 'SCHED')
  );
  const isScheduled = !isLive && !isFinished;

  const homeGoals = goals.filter((g) => g.homeAway === 'h');
  const awayGoals = goals.filter((g) => g.homeAway === 'a');
  const homeCards = cards.filter((c) => c.homeAway === 'h');
  const awayCards = cards.filter((c) => c.homeAway === 'a');
  const hasEvents = homeGoals.length > 0 || awayGoals.length > 0 ||
                    homeCards.length > 0 || awayCards.length > 0;

  let scoreDisplay: string;
  let timeBadge: string;
  if (isScheduled) {
    scoreDisplay = 'v';
    timeBadge = match.scheduled || '';
  } else {
    scoreDisplay = match.score ? match.score.replace(' - ', '-') : '?-?';
    timeBadge = isFinished ? 'FT' : match.time;
  }

  const canTap = !isScheduled;
  // Whether events have been fetched already (either from Redux or on-demand)
  const eventsFetched = match.goals !== undefined;

  const handlePress = async () => {
    if (!canTap) return;

    if (!expanded) {
      setExpanded(true);
      if (!eventsFetched && !loadingEvents) {
        setLoadingEvents(true);
        try {
          const { goals: g, cards: c } = await liveScoreAPI.getMatchEvents(match.id);
          setGoals(g);
          setCards(c);
        } catch {
          setGoals([]);
          setCards([]);
        } finally {
          setLoadingEvents(false);
        }
      }
    } else {
      setExpanded(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={canTap ? 0.7 : 1}
    >
      {/* Main match row */}
      <View style={styles.matchRow}>
        <Text style={[styles.team, isLive && styles.teamLive]} numberOfLines={1}>
          {match.home_name.toUpperCase()}
        </Text>
        <View style={styles.scoreBox}>
          {isLive
            ? <LiveScore score={scoreDisplay} />
            : <Text style={styles.score}>{scoreDisplay}</Text>}
        </View>
        <Text style={[styles.team, isLive && styles.teamLive]} numberOfLines={1}>
          {match.away_name.toUpperCase()}
        </Text>
        <Text style={[styles.badge, isLive && styles.badgeLive]} numberOfLines={1}>
          {timeBadge}
        </Text>
      </View>

      {/* Events — shown on tap */}
      {expanded && (
        <View style={styles.scorerSection}>
          {loadingEvents ? (
            <Text style={styles.scorer}>{['·', '· ·', '· · ·'][dotFrame]}</Text>
          ) : !hasEvents ? (
            <Text style={styles.scorer}>No data</Text>
          ) : (
            <>
              <View style={styles.scorerCol}>
                {homeGoals.map((g, i) => (
                  <Text key={`hg${i}`} style={styles.scorer}>{fmtGoal(g)}</Text>
                ))}
                {homeCards.map((c, i) => (
                  <Text key={`hc${i}`} style={c.cardType === 'yellow' ? styles.cardYellow : styles.cardRed}>
                    {fmtCard(c)}
                  </Text>
                ))}
              </View>
              <View style={styles.scorerColRight}>
                {awayGoals.map((g, i) => (
                  <Text key={`ag${i}`} style={styles.scorer}>{fmtGoal(g)}</Text>
                ))}
                {awayCards.map((c, i) => (
                  <Text key={`ac${i}`} style={c.cardType === 'yellow' ? styles.cardYellow : styles.cardRed}>
                    {fmtCard(c)}
                  </Text>
                ))}
              </View>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
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
  },
  teamLive: {
    color: '#00FF00',
  },
  scoreBox: {
    width: 56,
    alignItems: 'center',
  },
  score: {
    color: TeletextColors.textSecondary,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
  },
  scoreLive: {
    color: TeletextColors.red,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
  },
  scoreNumber: {
    color: '#FFFF00',
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
  },
  scoreDash: {
    color: TeletextColors.red,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.normal,
  },
  badge: {
    width: 44,
    textAlign: 'right',
    color: TeletextColors.white,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.small,
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
  cardYellow: {
    color: '#FFFF00',
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.small,
  },
  cardRed: {
    color: TeletextColors.red,
    fontFamily: TeletextFonts.family,
    fontSize: TeletextFonts.sizes.small,
  },
});
