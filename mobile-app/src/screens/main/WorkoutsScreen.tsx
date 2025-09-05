import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchWorkouts } from '../../store/slices/workoutsSlice';
import { Workout } from '../../types';

export default function WorkoutsScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { workouts, isLoading } = useAppSelector((state) => state.workouts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      await dispatch(fetchWorkouts()).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to load workouts');
    }
  };

  const onRefresh = () => {
    loadWorkouts();
  };

  const filteredWorkouts = workouts.filter((workout: Workout) => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || workout.type === selectedType;
    return matchesSearch && matchesType;
  });

  const workoutTypes = ['cardio', 'strength', 'flexibility', 'sports', 'other'];

  const handleWorkoutPress = (workout: Workout) => {
    navigation.navigate('WorkoutDetails', { workoutId: workout._id });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cardio':
        return '#ef4444';
      case 'strength':
        return '#3b82f6';
      case 'flexibility':
        return '#10b981';
      case 'sports':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getTotalCalories = () => {
    return workouts.reduce((total, workout) => total + (workout.caloriesBurned || 0), 0);
  };

  const getTotalDuration = () => {
    return workouts.reduce((total, workout) => total + workout.duration, 0);
  };

  const getWorkoutCount = () => {
    return workouts.length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Workouts</Text>
        <Text style={styles.subtitle}>Track your fitness journey</Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getWorkoutCount()}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatDuration(getTotalDuration())}</Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getTotalCalories()}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search workouts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Filter Buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterButton, !selectedType && styles.filterButtonActive]}
          onPress={() => setSelectedType(null)}
        >
          <Text style={[styles.filterButtonText, !selectedType && styles.filterButtonTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {workoutTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterButton, selectedType === type && styles.filterButtonActive]}
            onPress={() => setSelectedType(selectedType === type ? null : type)}
          >
            <Text style={[styles.filterButtonText, selectedType === type && styles.filterButtonTextActive]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Workouts List */}
      <ScrollView
        style={styles.workoutsList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {filteredWorkouts.length > 0 ? (
          filteredWorkouts.map((workout: Workout) => (
            <TouchableOpacity
              key={workout._id}
              style={styles.workoutCard}
              onPress={() => handleWorkoutPress(workout)}
            >
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(workout.type) }]}>
                  <Text style={styles.typeText}>
                    {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.workoutDate}>{formatDate(workout.date)}</Text>
              
              <View style={styles.workoutStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatDuration(workout.duration)}</Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
                {workout.caloriesBurned && (
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{workout.caloriesBurned}</Text>
                    <Text style={styles.statLabel}>Calories</Text>
                  </View>
                )}
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{workout.exercises?.length || 0}</Text>
                  <Text style={styles.statLabel}>Exercises</Text>
                </View>
              </View>

              {workout.notes && (
                <Text style={styles.workoutNotes} numberOfLines={2}>
                  {workout.notes}
                </Text>
              )}

              <View style={styles.workoutFooter}>
                <Text style={styles.viewDetailsText}>Tap to view details</Text>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No workouts found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || selectedType 
                ? 'Try adjusting your search or filters'
                : 'Start logging your workouts to track your progress!'
              }
            </Text>
            {!searchQuery && !selectedType && (
              <TouchableOpacity
                style={styles.logWorkoutButton}
                onPress={() => navigation.navigate('LogWorkout')}
              >
                <Text style={styles.logWorkoutButtonText}>Log Workout</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('LogWorkout')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  workoutsList: {
    flex: 1,
    padding: 20,
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  workoutDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  workoutNotes: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  workoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  arrowText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 20,
  },
  logWorkoutButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logWorkoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
