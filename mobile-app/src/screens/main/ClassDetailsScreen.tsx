import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { classesService } from '../../services/classesService';
import { Class } from '../../types';

export default function ClassDetailsScreen({ route, navigation }: any) {
  const { classId } = route.params;
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [classDetails, setClassDetails] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    loadClassDetails();
  }, [classId]);

  const loadClassDetails = async () => {
    try {
      setIsLoading(true);
      const response = await classesService.getClassById(classId);
      if (response.success) {
        setClassDetails(response.data);
      } else {
        Alert.alert('Error', 'Failed to load class details');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load class details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookClass = async () => {
    if (!classDetails) return;

    try {
      setIsBooking(true);
      // For now, we'll create a mock class instance ID
      const classInstanceId = `instance_${Date.now()}`;
      
      const response = await classesService.bookClass({
        classId: classDetails._id,
        classInstanceId: classInstanceId
      });

      if (response.success) {
        Alert.alert(
          'Success',
          'Class booked successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('MyBookings')
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to book class');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to book class');
    } finally {
      setIsBooking(false);
    }
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading class details...</Text>
      </View>
    );
  }

  if (!classDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Class not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.classTypeBadge}>
          <Text style={styles.classTypeText}>
            {classDetails.type.charAt(0).toUpperCase() + classDetails.type.slice(1)}
          </Text>
        </View>
      </View>

      {/* Class Image Placeholder */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>Class Image</Text>
      </View>

      {/* Class Info */}
      <View style={styles.content}>
        <Text style={styles.className}>{classDetails.name}</Text>
        <Text style={styles.classDescription}>{classDetails.description}</Text>

        {/* Class Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{classDetails.duration}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{classDetails.maxCapacity}</Text>
            <Text style={styles.statLabel}>Max Capacity</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${classDetails.price}</Text>
            <Text style={styles.statLabel}>Price</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getDifficultyColor(classDetails.difficulty) }]}>
              {classDetails.difficulty.charAt(0).toUpperCase() + classDetails.difficulty.slice(1)}
            </Text>
            <Text style={styles.statLabel}>Difficulty</Text>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          {classDetails.schedule && classDetails.schedule.length > 0 ? (
            classDetails.schedule.map((schedule, index) => (
              <View key={index} style={styles.scheduleItem}>
                <Text style={styles.scheduleDay}>{getDayName(schedule.dayOfWeek)}</Text>
                <Text style={styles.scheduleTime}>
                  {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noScheduleText}>No schedule available</Text>
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              {classDetails.location.room}
              {classDetails.location.floor && `, Floor ${classDetails.location.floor}`}
              {classDetails.location.building && `, ${classDetails.location.building}`}
            </Text>
          </View>
        </View>

        {/* Requirements */}
        {classDetails.requirements && classDetails.requirements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What to Bring</Text>
            {classDetails.requirements.map((requirement, index) => (
              <View key={index} style={styles.requirementItem}>
                <Text style={styles.requirementText}>• {requirement}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Equipment */}
        {classDetails.equipment && classDetails.equipment.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment Provided</Text>
            {classDetails.equipment.map((equipment, index) => (
              <View key={index} style={styles.equipmentItem}>
                <Text style={styles.equipmentText}>• {equipment}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Cancellation Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cancellation Policy</Text>
          <Text style={styles.policyText}>
            Cancel up to {classDetails.cancellationPolicy.hoursBeforeClass} hours before class for a {classDetails.cancellationPolicy.refundPercentage}% refund.
          </Text>
        </View>

        {/* Book Button */}
        <TouchableOpacity
          style={[styles.bookButton, isBooking && styles.bookButtonDisabled]}
          onPress={handleBookClass}
          disabled={isBooking}
        >
          {isBooking ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.bookButtonText}>Book This Class</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  classTypeBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  classTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  content: {
    padding: 20,
  },
  className: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  classDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  scheduleDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#64748b',
  },
  noScheduleText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  locationContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#374151',
  },
  requirementItem: {
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 14,
    color: '#374151',
  },
  equipmentItem: {
    marginBottom: 4,
  },
  equipmentText: {
    fontSize: 14,
    color: '#374151',
  },
  policyText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  bookButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  bookButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
