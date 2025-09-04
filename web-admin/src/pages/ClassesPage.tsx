import React from 'react';

export default function ClassesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">Classes</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Manage fitness classes and schedules
        </p>
      </div>
      
      <div className="card">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-secondary-900 mb-2">Coming Soon</h3>
          <p className="text-secondary-500">
            Class management features are under development and will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
