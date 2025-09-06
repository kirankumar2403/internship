import React, { useState } from 'react';
import { 
  FiX, 
  FiLayers, 
  FiDownload, 
  FiInfo, 
  FiBell,
  FiGlobe,
  FiSettings,
  FiMonitor
} from 'react-icons/fi';
import { CSVLink } from 'react-csv';

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  mapStyle, 
  onMapStyleChange, 
  autoFit, 
  onAutoFitChange,
  autoRefresh,
  onAutoRefreshChange,
  filters,
  earthquakes
}) => {
  const [notifications, setNotifications] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  const mapStyles = [
    { value: 'osm', label: 'OpenStreetMap', description: 'Standard map with street details' },
    { value: 'satellite', label: 'Satellite', description: 'High-resolution satellite imagery' },
    { value: 'terrain', label: 'Terrain', description: 'Topographic map showing elevation' },
    { value: 'dark', label: 'Dark Mode', description: 'Dark theme optimized for night viewing' }
  ];

  const getCSVData = () => {
    if (!earthquakes || !earthquakes.features) return [];
    
    return earthquakes.features.map(feature => {
      const props = feature.properties;
      const coords = feature.geometry.coordinates;
      
      return {
        magnitude: props.mag || 'N/A',
        location: props.place || 'Unknown',
        time: new Date(props.time).toISOString(),
        latitude: coords[1],
        longitude: coords[0],
        depth: coords[2] || 'N/A',
        significance: props.sig || 'N/A',
        felt_reports: props.felt || 0,
        tsunami_warning: props.tsunami ? 'Yes' : 'No',
        url: props.url || ''
      };
    });
  };

  const csvHeaders = [
    { label: 'Magnitude', key: 'magnitude' },
    { label: 'Location', key: 'location' },
    { label: 'Time (ISO)', key: 'time' },
    { label: 'Latitude', key: 'latitude' },
    { label: 'Longitude', key: 'longitude' },
    { label: 'Depth (km)', key: 'depth' },
    { label: 'Significance', key: 'significance' },
    { label: 'Felt Reports', key: 'felt_reports' },
    { label: 'Tsunami Warning', key: 'tsunami_warning' },
    { label: 'USGS URL', key: 'url' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center space-x-3">
            <FiSettings className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Settings</h2>
              <p className="text-sm text-blue-100">Customize your earthquake monitoring experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-500/50 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-8">
            {/* Display Settings */}
            <section>
              <div className="flex items-center space-x-3 mb-6">
                <FiMonitor className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Display Settings</h3>
              </div>
              
              <div className="space-y-6">
                {/* Map Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Map Style
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mapStyles.map(style => (
                      <div
                        key={style.value}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          mapStyle === style.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                        onClick={() => onMapStyleChange(style.value)}
                      >
                        <div className="flex items-center space-x-3">
                          <FiLayers className={`w-5 h-5 ${
                            mapStyle === style.value ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                          <div>
                            <h4 className={`font-medium ${
                              mapStyle === style.value ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {style.label}
                            </h4>
                            <p className={`text-sm ${
                              mapStyle === style.value ? 'text-blue-700' : 'text-gray-600'
                            }`}>
                              {style.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* View Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FiGlobe className="w-5 h-5 text-blue-600" />
                      <div>
                        <label className="font-medium text-gray-900">Auto-fit Map</label>
                        <p className="text-sm text-gray-600">Automatically fit map to show all earthquakes</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoFit}
                        onChange={(e) => onAutoFitChange(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>


                </div>
              </div>
            </section>

            {/* Notification Settings */}
            <section>
              <div className="flex items-center space-x-3 mb-6">
                <FiBell className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FiBell className="w-5 h-5 text-blue-600" />
                    <div>
                      <label className="font-medium text-gray-900">Enable Notifications</label>
                      <p className="text-sm text-gray-600">Get notified about significant earthquakes</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

              </div>
            </section>

            {/* Auto-Refresh Settings */}
            <section>
              <div className="flex items-center space-x-3 mb-6">
                <FiSettings className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Auto-Refresh</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-900">Enable Auto-Refresh</label>
                    <p className="text-sm text-gray-600">Automatically update earthquake data</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => onAutoRefreshChange(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {autoRefresh && (
                  <div className="ml-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refresh Interval
                    </label>
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>1 minute</option>
                      <option value={300}>5 minutes</option>
                      <option value={600}>10 minutes</option>
                    </select>
                  </div>
                )}
              </div>
            </section>

            {/* Data Export */}
            <section>
              <div className="flex items-center space-x-3 mb-6">
                <FiDownload className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Data Export</h3>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  Export current earthquake data as CSV for further analysis
                </p>
                <CSVLink
                  data={getCSVData()}
                  headers={csvHeaders}
                  filename={`earthquakes_${filters?.timeRange || 'current'}_${new Date().toISOString().split('T')[0]}.csv`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors space-x-2"
                >
                  <FiDownload className="w-4 h-4" />
                  <span>Download CSV</span>
                </CSVLink>
              </div>
            </section>

            {/* About */}
            <section>
              <div className="flex items-center space-x-3 mb-6">
                <FiInfo className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">About</h3>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <FiInfo className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Earthquake Visualizer</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      This application provides real-time earthquake monitoring and visualization using data from the United States Geological Survey (USGS). 
                      The data is updated continuously and includes magnitude, location, depth, and other seismic information.
                    </p>
                    <div className="space-y-1 text-xs text-blue-700">
                      <p><strong>Data Source:</strong> USGS Earthquake API</p>
                      <p><strong>Update Frequency:</strong> Real-time</p>
                      <p><strong>Magnitude Scale:</strong> Richter Scale</p>
                      <p><strong>Coverage:</strong> Global</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Settings are saved automatically
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
