import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchLiveMatches } from '../store/scoresSlice';
import { TeletextHeader } from '../components/TeletextHeader';
import { ScoreRow } from '../components/ScoreRow';
import { TeletextColors, TeletextStyles } from '../styles/teletext';

export const LiveScoresScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { liveMatches, loading, lastUpdated } = useSelector((state: RootState) => state.scores);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    dispatch(fetchLiveMatches());

    pollingIntervalRef.current = setInterval(() => {
      dispatch(fetchLiveMatches());
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchLiveMatches());
  };

  const lastUpdatedTime = lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never';

  return (
    <View style={TeletextStyles.container}>
      <TeletextHeader title="TODAY'S MATCHES" subtitle={`Updated: ${lastUpdatedTime}`} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {liveMatches.length > 0 ? (
          liveMatches.map((match) => <ScoreRow key={match.id} match={match} />)
        ) : (
          <Text style={styles.emptyText}>No live matches at the moment</Text>
        )}
      </ScrollView>
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>⟳ REFRESH</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 12,
    color: TeletextColors.textPrimary,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Courier New',
  },
  refreshButton: {
    backgroundColor: TeletextColors.orange,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: TeletextColors.background,
    fontWeight: 'bold',
    fontFamily: 'Courier New',
    fontSize: 12,
  },
});
