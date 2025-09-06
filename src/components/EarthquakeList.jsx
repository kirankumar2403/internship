import React from 'react';
import { FiMapPin, FiClock, FiZap, FiAlertTriangle, FiExternalLink, FiTrendingUp } from 'react-icons/fi';
import earthquakeService from '../services/earthquakeService';

const EarthquakeList = ({ earthquakes, onEarthquakeSelect, searchTerm, loading = false }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <FiMapPin className="w-12 h-12 mb-3 text-gray-300 animate-pulse" />
        <p className="text-lg font-medium mb-1">Loading Earthquakes...</p>
        <p className="text-sm">Fetching latest seismic data</p>
      </div>
    );
  }

  if (!earthquakes || earthquakes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <FiMapPin className="w-12 h-12 mb-3 text-gray-300" />
        <p className="text-lg font-medium mb-1">No earthquakes found</p>
        <p className="text-sm">
          {searchTerm ? 'Try adjusting your search terms' : 'Try adjusting your filters'}
        </p>
      </div>
    );
  }

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const sortedEarthquakes = [...earthquakes].sort((a, b) => {
    // Sort by magnitude (descending), then by time (most recent first)
    const magDiff = (b.properties.mag || 0) - (a.properties.mag || 0);
    if (magDiff !== 0) return magDiff;
    return b.properties.time - a.properties.time;
  });

  const EarthquakeItem = ({ earthquake, index }) => {
    const { properties, geometry } = earthquake;
    const magnitude = properties.mag || 0;
    const category = earthquakeService.getMagnitudeCategory(magnitude);
    const [lng, lat, depth] = geometry.coordinates;
    
    const isSignificant = properties.sig > 600;
    const hasTsunami = properties.tsunami === 1;
    const hasFeltReports = properties.felt > 0;
    
    return (
      <div
        className="group relative p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
        onClick={() => onEarthquakeSelect?.(earthquake)}
      >
        {/* Magnitude indicator */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
            style={{ backgroundColor: category.color }}
          >
            {magnitude.toFixed(1)}
          </div>
          {isSignificant && (
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center" title="Significant earthquake">
              <FiTrendingUp className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="pr-16">
          {/* Location and time */}
          <div className="mb-3">
            <h4 className="font-semibold text-gray-800 text-sm leading-tight mb-1">
              {properties.place || 'Unknown Location'}
            </h4>
            <div className="flex items-center text-xs text-gray-500 space-x-3">
              <span className="flex items-center">
                <FiClock className="w-3 h-3 mr-1" />
                {formatTimeAgo(properties.time)}
              </span>
              <span className="flex items-center">
                <FiMapPin className="w-3 h-3 mr-1" />
                {lat.toFixed(2)}°, {lng.toFixed(2)}°
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Magnitude</span>
              <div className="flex items-center">
                <div
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="font-medium">M{magnitude.toFixed(1)} ({category.label})</span>
              </div>
            </div>

            {depth && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Depth</span>
                <span className="font-medium">{depth.toFixed(1)} km</span>
              </div>
            )}

            {properties.sig && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Significance</span>
                <span className={`font-medium ${properties.sig > 600 ? 'text-orange-600' : ''}`}>
                  {properties.sig}
                </span>
              </div>
            )}
          </div>

          {/* Alerts and warnings */}
          {(hasTsunami || hasFeltReports) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                {hasTsunami && (
                  <div className="flex items-center text-xs text-red-600">
                    <FiAlertTriangle className="w-3 h-3 mr-1" />
                    Tsunami Warning
                  </div>
                )}
                {hasFeltReports && (
                  <div className="flex items-center text-xs text-blue-600">
                    <FiZap className="w-3 h-3 mr-1" />
                    {properties.felt} felt report{properties.felt !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* External link */}
          {properties.url && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a
                href={properties.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                onClick={(e) => e.stopPropagation()}
              >
                <FiExternalLink className="w-3 h-3 mr-1" />
                View on USGS
              </a>
            </div>
          )}
        </div>

        {/* Hover indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </div>
    );
  };

  return (
    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-3 border-b border-gray-200 mb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">
            {earthquakes.length} earthquake{earthquakes.length !== 1 ? 's' : ''}
            {searchTerm && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                matching "{searchTerm}"
              </span>
            )}
          </h3>
          <div className="text-xs text-gray-500">
            Sorted by magnitude & time
          </div>
        </div>
      </div>

      {/* Earthquake items */}
      <div className="space-y-3 px-1">
        {sortedEarthquakes.map((earthquake, index) => (
          <EarthquakeItem
            key={earthquake.id || `${earthquake.properties.time}-${index}`}
            earthquake={earthquake}
            index={index}
          />
        ))}
      </div>

      {/* Load more indicator (for future pagination) */}
      {earthquakes.length >= 50 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Showing first 50 results. Use filters to narrow down the results.
          </p>
        </div>
      )}
    </div>
  );
};

export default EarthquakeList;
