import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchClasses, createClass, updateClass, deleteClass } from '../store/slices/classesSlice';
import { Class, ClassType, ClassStatus } from '../types';

export default function ClassesPage() {
  const dispatch = useAppDispatch();
  const { classes, isLoading } = useAppSelector((state) => state.classes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ClassType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ClassStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Class | null>(null);

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = 
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || cls.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || cls.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDeleteClass = async (classId: string) => {
    try {
      await dispatch(deleteClass(classId)).unwrap();
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Failed to delete class:', error);
    }
  };

  const getTypeColor = (type: ClassType) => {
    switch (type) {
      case 'yoga':
        return 'bg-purple-100 text-purple-800';
      case 'cardio':
        return 'bg-red-100 text-red-800';
      case 'strength':
        return 'bg-blue-100 text-blue-800';
      case 'pilates':
        return 'bg-pink-100 text-pink-800';
      case 'crossfit':
        return 'bg-orange-100 text-orange-800';
      case 'spinning':
        return 'bg-yellow-100 text-yellow-800';
      case 'dance':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: ClassStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">Classes</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Manage fitness classes and schedules
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Search
            </label>
            <input
              type="text"
              className="input"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Type
            </label>
            <select
              className="input"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ClassType | 'all')}
            >
              <option value="all">All Types</option>
              <option value="yoga">Yoga</option>
              <option value="cardio">Cardio</option>
              <option value="strength">Strength</option>
              <option value="pilates">Pilates</option>
              <option value="crossfit">CrossFit</option>
              <option value="spinning">Spinning</option>
              <option value="dance">Dance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Status
            </label>
            <select
              className="input"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ClassStatus | 'all')}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              className="btn-primary w-full"
              onClick={() => setShowCreateModal(true)}
            >
              Add New Class
            </button>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => (
          <div key={cls._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900">{cls.name}</h3>
                <p className="text-sm text-secondary-500">{cls.type}</p>
              </div>
              <div className="flex space-x-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(cls.type)}`}>
                  {cls.type}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(cls.status)}`}>
                  {cls.status}
                </span>
              </div>
            </div>

            <p className="text-sm text-secondary-600 mb-4 line-clamp-2">
              {cls.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-secondary-500">Duration</p>
                <p className="text-sm font-medium text-secondary-900">{cls.duration} min</p>
              </div>
              <div>
                <p className="text-xs text-secondary-500">Capacity</p>
                <p className="text-sm font-medium text-secondary-900">{cls.maxCapacity}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-500">Price</p>
                <p className="text-sm font-medium text-secondary-900">${cls.price}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-500">Difficulty</p>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(cls.difficulty)}`}>
                  {cls.difficulty}
                </span>
              </div>
            </div>

            {cls.schedule && cls.schedule.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-secondary-500 mb-2">Schedule</p>
                <div className="space-y-1">
                  {cls.schedule.slice(0, 2).map((schedule, index) => (
                    <p key={index} className="text-xs text-secondary-600">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][schedule.dayOfWeek]} {schedule.startTime} - {schedule.endTime}
                    </p>
                  ))}
                  {cls.schedule.length > 2 && (
                    <p className="text-xs text-secondary-500">+{cls.schedule.length - 2} more</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-secondary-200">
              <div className="flex space-x-2">
                <button
                  className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                  onClick={() => setEditingClass(cls)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                  onClick={() => setShowDeleteModal(cls)}
                >
                  Delete
                </button>
              </div>
              <div className="text-right">
                <p className="text-xs text-secondary-500">Rating</p>
                <p className="text-sm font-medium text-secondary-900">
                  {cls.averageRating ? cls.averageRating.toFixed(1) : 'N/A'} ⭐
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="card">
          <div className="text-center py-12">
            <p className="text-secondary-500">No classes found matching your criteria.</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">
                Delete Class
              </h3>
              <p className="text-sm text-secondary-500 mb-6">
                Are you sure you want to delete "{showDeleteModal.name}"? 
                This action cannot be undone and will affect all future bookings.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  className="btn-secondary"
                  onClick={() => setShowDeleteModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDeleteClass(showDeleteModal._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
