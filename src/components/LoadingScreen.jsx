import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        {/* Animated earthquake icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow">
            <span className="text-4xl">🌍</span>
          </div>
          
          {/* Ripple effects */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 border-4 border-blue-300 rounded-full animate-ping opacity-20"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-4 border-blue-200 rounded-full animate-ping opacity-10" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4 text-shadow">
          Earthquake Visualizer
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Visualizing real-time seismic activity around the world
        </p>

        {/* Loading spinner */}
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Loading earthquake data...</span>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>

        {/* Additional info */}
        <div className="mt-12 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 mx-auto max-w-lg shadow-lg">
            <h3 className="font-semibold text-gray-800 mb-3">About This Application</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Real-time earthquake data from USGS</p>
              <p>• Interactive world map visualization</p>
              <p>• Advanced filtering and statistics</p>
              <p>• Built for geography students and researchers</p>
            </div>
          </div>
        </div>

        {/* Loading states */}
        <div className="mt-8 text-xs text-gray-500">
          <p>Fetching latest seismic data...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
