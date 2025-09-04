import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchDashboardStats } from '../store/slices/analyticsSlice';
import {
  UsersIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboardStats, isLoading } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const stats = [
    {
      name: 'Total Members',
      value: dashboardStats?.totalMembers || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Classes',
      value: dashboardStats?.totalClasses || 0,
      icon: CalendarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Bookings',
      value: dashboardStats?.totalBookings || 0,
      icon: ClipboardDocumentListIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Monthly Revenue',
      value: `$${dashboardStats?.monthlyRevenue || 0}`,
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
    },
  ];

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
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Overview of your gym's performance and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-md ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-secondary-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Class Occupancy Rate</h3>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="bg-secondary-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${dashboardStats?.classOccupancyRate || 0}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-secondary-600">
                {dashboardStats?.classOccupancyRate || 0}% average occupancy
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Member Retention Rate</h3>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="bg-secondary-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${dashboardStats?.memberRetentionRate || 0}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-secondary-600">
                {dashboardStats?.memberRetentionRate || 0}% retention rate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-secondary-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button className="card hover:bg-secondary-50 transition-colors text-left">
            <h4 className="font-medium text-secondary-900">Add New Class</h4>
            <p className="text-sm text-secondary-500 mt-1">Create a new fitness class</p>
          </button>
          <button className="card hover:bg-secondary-50 transition-colors text-left">
            <h4 className="font-medium text-secondary-900">View Bookings</h4>
            <p className="text-sm text-secondary-500 mt-1">Check today's class bookings</p>
          </button>
          <button className="card hover:bg-secondary-50 transition-colors text-left">
            <h4 className="font-medium text-secondary-900">Member Management</h4>
            <p className="text-sm text-secondary-500 mt-1">Manage member accounts</p>
          </button>
        </div>
      </div>
    </div>
  );
}
