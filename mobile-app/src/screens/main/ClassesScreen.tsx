import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchClasses } from '../../store/slices/classesSlice';
import { Class } from '../../types';

export default function ClassesScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { classes, isLoading } = useAppSelector((state) => state.classes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      await dispatch(fetchClasses()).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to load classes');
    }
  };

  const onRefresh = () => {
    loadClasses();
  };

  const filteredClasses = classes.filter((cls: Class) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cls.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || cls.type === selectedType;
    return matchesSearch && matchesType;
  });

  const classTypes = ['yoga', 'cardio', 'strength', 'pilates', 'crossfit', 'spinning', 'dance'];

  const handleClassPress = (classItem: Class) => {
    navigation.navigate('ClassDetails', { classId: classItem._id });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getScheduleText = (schedule: any[]) => {
    if (!schedule || schedule.length === 0) return 'No schedule';
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const scheduleText = schedule.map(s => 
      `${days[s.dayOfWeek]} ${formatTime(s.startTime)}`
    ).join(', ');
    
    return scheduleText.length > 50 ? scheduleText.substring(0, 50) + '...' : scheduleText;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Classes</Text>
        <Text style={styles.subtitle}>Browse and book gym classes</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search classes..."
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
        {classTypes.map((type) => (
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

      {/* Classes List */}
      <ScrollView
        style={styles.classesList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {filteredClasses.length > 0 ? (
          filteredClasses.map((classItem: Class) => (
            <TouchableOpacity
              key={classItem._id}
              style={styles.classCard}
              onPress={() => handleClassPress(classItem)}
            >
              <View style={styles.classHeader}>
                <Text style={styles.className}>{classItem.name}</Text>
                <View style={styles.classTypeBadge}>
                  <Text style={styles.classTypeText}>
                    {classItem.type.charAt(0).toUpperCase() + classItem.type.slice(1)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.classDescription} numberOfLines={2}>
                {classItem.description}
              </Text>
              
              <View style={styles.classDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Duration:</Text>
                  <Text style={styles.detailValue}>{classItem.duration} min</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Capacity:</Text>
                  <Text style={styles.detailValue}>{classItem.maxCapacity}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Price:</Text>
                  <Text style={styles.detailValue}>${classItem.price}</Text>
                </View>
              </View>
              
              <View style={styles.scheduleContainer}>
                <Text style={styles.scheduleLabel}>Schedule:</Text>
                <Text style={styles.scheduleText}>{getScheduleText(classItem.schedule)}</Text>
              </View>
              
              <View style={styles.classFooter}>
                <View style={styles.difficultyContainer}>
                  <Text style={styles.difficultyLabel}>Difficulty:</Text>
                  <View style={[styles.difficultyBadge, 
                    classItem.difficulty === 'beginner' && styles.difficultyBeginner,
                    classItem.difficulty === 'intermediate' && styles.difficultyIntermediate,
                    classItem.difficulty === 'advanced' && styles.difficultyAdvanced
                  ]}>
                    <Text style={styles.difficultyText}>
                      {classItem.difficulty.charAt(0).toUpperCase() + classItem.difficulty.slice(1)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No classes found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>
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
  classesList: {
    flex: 1,
    padding: 20,
  },
  classCard: {
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
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  classTypeBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  classTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  classDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  classDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  scheduleContainer: {
    marginBottom: 12,
  },
  scheduleLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  scheduleText: {
    fontSize: 14,
    color: '#374151',
  },
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyBeginner: {
    backgroundColor: '#dcfce7',
  },
  difficultyIntermediate: {
    backgroundColor: '#fef3c7',
  },
  difficultyAdvanced: {
    backgroundColor: '#fee2e2',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
  },
});
