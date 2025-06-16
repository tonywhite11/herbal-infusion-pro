
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 my-8 p-8 bg-white/50 backdrop-blur-sm rounded-lg shadow-md">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600"></div>
      <p className="text-xl font-semibold text-emerald-700">Crafting your infusion...</p>
      <p className="text-gray-600">Please wait while our AI herbalist prepares your recipe.</p>
    </div>
  );
};

export default LoadingSpinner;
