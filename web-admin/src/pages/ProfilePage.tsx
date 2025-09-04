import React from 'react';
import { useAppSelector } from '../hooks/redux';

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">Profile</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Manage your admin account settings
        </p>
      </div>
      
      <div className="card">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Account Information</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-secondary-500">Name</dt>
                <dd className="mt-1 text-sm text-secondary-900">
                  {user?.firstName} {user?.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-secondary-500">Email</dt>
                <dd className="mt-1 text-sm text-secondary-900">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-secondary-500">Role</dt>
                <dd className="mt-1 text-sm text-secondary-900 capitalize">{user?.role}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-secondary-500">Status</dt>
                <dd className="mt-1 text-sm text-secondary-900 capitalize">{user?.status}</dd>
              </div>
            </dl>
          </div>
          
          <div className="border-t border-secondary-200 pt-6">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="btn-primary">
                Edit Profile
              </button>
              <button className="btn-secondary">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
