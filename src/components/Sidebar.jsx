import React, { useState } from 'react';
import { 
  FiFilter, 
  FiSettings, 
  FiBarChart2, 
  FiRefreshCw,
  FiClock,
  FiMapPin,
  FiZap,
  FiSearch,
  FiX,
  FiEye,
  FiCpu
} from 'react-icons/fi';
import { TIME_RANGES, MAGNITUDE_CATEGORIES } from '../services/earthquakeService';
import StatisticsPanel from './StatisticsPanel';
import EarthquakeList from './EarthquakeList';
import PredictionPanel from './PredictionPanel';
import EarthquakeVisualization3D from './EarthquakeVisualization3D';
import SettingsModal from './SettingsModal';

const Sidebar = ({ 
  isOpen,
  onToggle,
  filters,
  onFiltersChange,
  statistics,
  earthquakes,
  onEarthquakeSelect,
  onRefresh,
  loading,
  mapStyle,
  onMapStyleChange,
  autoFit,
  onAutoFitChange,
  autoRefresh,
  onAutoRefreshChange
}) => {
  const [activeTab, setActiveTab] = useState('filters');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);

  const tabs = [
    { id: 'filters', label: 'Filters', icon: FiFilter },
    { id: 'statistics', label: 'Statistics', icon: FiBarChart2 },
    { id: 'earthquakes', label: 'Earthquakes', icon: FiMapPin },
    { id: 'prediction', label: 'AI Analysis', icon: FiCpu },
    { id: '3d', label: '3D View', icon: FiEye },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];


  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      
      minMagnitude: '',
      maxMagnitude: '',
      region: '',
      minDepth: '',
      maxDepth: ''
    });
    setSearchTerm('');
  };


  const filteredEarthquakes = earthquakes?.features?.filter(feature => {
    const place = feature.properties.place || '';
    return place.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  // Handle tab switching with loading state
  const handleTabSwitch = (tabId) => {
    if (tabId === 'settings') {
      setIsSettingsOpen(true);
      return;
    }
    
    if (tabId === activeTab) return;
    
    setTabLoading(true);
    setActiveTab(tabId);
    
    // Different loading times based on tab complexity
    const loadingTimes = {
      'filters': 500,
      'statistics': 800,
      'earthquakes': 600,
      'prediction': 1000,
      '3d': 1200
    };
    
    // If main data is still loading, use shorter tab loading times
    const baseTime = loading ? 200 : loadingTimes[tabId] || 500;
    
    setTimeout(() => {
      setTabLoading(false);
    }, baseTime);
  };

  // Loading component for tab transitions
  const TabLoadingSpinner = ({ icon: Icon, title, subtitle }) => (
    <div className="p-4 flex flex-col items-center justify-center h-64 space-y-4">
      <Icon className="w-12 h-12 text-blue-500 animate-pulse" />
      <div className="text-center">
        <p className="text-gray-600 font-medium">{title}</p>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      <div className="w-full max-w-xs">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{width: '75%'}}></div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Toggle Button - Hamburger Menu */}
      <button
        onClick={onToggle}
        className={`fixed top-4 left-4 z-[1001] bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 rounded-lg p-3 shadow-lg border border-gray-200 group ${
          isOpen ? 'lg:hidden' : ''
        }`}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? (
          <FiX className="w-5 h-5 text-gray-700" />
        ) : (
          <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
            <div className="w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-200 group-hover:bg-blue-600"></div>
            <div className="w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-200 group-hover:bg-blue-600"></div>
            <div className="w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-200 group-hover:bg-blue-600"></div>
          </div>
        )}
      </button>


      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-[1000] w-96 bg-white/95 backdrop-blur-md border-r border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div>
            <h2 className="text-lg font-bold">Earthquake Monitor</h2>
            <p className="text-xs text-blue-100">Real-time seismic activity</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={onToggle}
              className="p-2 hover:bg-blue-500/50 rounded transition-colors"
              aria-label="Close sidebar"
              title="Close sidebar"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(tab.id)}
                className={`relative flex-1 px-3 py-2 text-xs font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                } ${tabLoading && activeTab === tab.id ? 'opacity-75' : ''}`}
              >
                <Icon className={`w-4 h-4 mx-auto mb-1 ${tabLoading && activeTab === tab.id ? 'animate-pulse' : ''}`} />
                <span className="block">{tab.label}</span>
                {tabLoading && activeTab === tab.id && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Main Content Area */}
          <div className="flex-1">
          {/* Filters Tab */}
          {activeTab === 'filters' && (
            (tabLoading || loading) ? (
              <TabLoadingSpinner 
                icon={FiFilter} 
                title="Loading Filters..." 
                subtitle="Preparing filter options"
              />
            ) : (
            <div className={`p-4 space-y-6 relative`}>
              {/* Refresh Button */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <FiClock className="w-4 h-4 mr-2" />
                  Time Range
                </h3>
                <button
                  onClick={onRefresh}
                  disabled={loading}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Refresh data"
                >
                  <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <select
                value={filters.timeRange}
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.values(TIME_RANGES).map(range => (
                  <option key={range.key} value={range.key}>
                    {range.label}
                  </option>
                ))}
              </select>

              {/* Magnitude Filter */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FiZap className="w-4 h-4 mr-2" />
                  Magnitude Range
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Min</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={filters.minMagnitude}
                      onChange={(e) => handleFilterChange('minMagnitude', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={filters.maxMagnitude}
                      onChange={(e) => handleFilterChange('maxMagnitude', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="10.0"
                    />
                  </div>
                </div>
              </div>

              {/* Region Filter */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FiMapPin className="w-4 h-4 mr-2" />
                  Region Filter
                </h3>
                <input
                  type="text"
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., California, Japan, Chile"
                />
              </div>

              {/* Depth Filter */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Depth Range (km)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Min</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={filters.minDepth}
                      onChange={(e) => handleFilterChange('minDepth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={filters.maxDepth}
                      onChange={(e) => handleFilterChange('maxDepth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="700"
                    />
                  </div>
                </div>
              </div>

              {/* Loading indicator for filters */}
              {loading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <FiRefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-sm text-blue-700 font-medium">Applying filters...</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Fetching updated earthquake data</p>
                </div>
              )}

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                disabled={loading}
                className={`w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                Clear All Filters
              </button>

              {/* Quick Magnitude Filters */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Quick Filters</h3>
                <div className="space-y-2">
                  {Object.values(MAGNITUDE_CATEGORIES).map(category => (
                    <button
                      key={category.label}
                      onClick={() => {
                        handleFilterChange('minMagnitude', category.min);
                        handleFilterChange('maxMagnitude', category.max);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        {category.label}
                      </div>
                      <span className="text-gray-500">{category.min}+ M</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            )
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            (tabLoading || loading) ? (
              <TabLoadingSpinner 
                icon={FiBarChart2} 
                title="Loading Statistics..." 
                subtitle="Analyzing earthquake data"
              />
            ) : (
              <StatisticsPanel statistics={statistics} earthquakes={earthquakes} loading={loading} />
            )
          )}

          {/* Earthquakes List Tab */}
          {activeTab === 'earthquakes' && (
            (tabLoading || loading) ? (
              <TabLoadingSpinner 
                icon={FiMapPin} 
                title="Loading Earthquakes..." 
                subtitle="Fetching latest seismic data"
              />
            ) : (
              <div className="p-4">
                <div className="mb-4">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Search earthquakes by location..."
                    />
                  </div>
                </div>
                <EarthquakeList 
                  earthquakes={filteredEarthquakes}
                  onEarthquakeSelect={onEarthquakeSelect}
                  searchTerm={searchTerm}
                  loading={loading}
                />
              </div>
            )
          )}

          {/* AI Prediction Tab */}
          {activeTab === 'prediction' && (
            (tabLoading || loading) ? (
              <TabLoadingSpinner 
                icon={FiCpu} 
                title="AI Analysis in Progress..." 
                subtitle="Processing seismic patterns"
              />
            ) : (
              <PredictionPanel 
                earthquakes={earthquakes}
                statistics={statistics}
                loading={loading}
              />
            )
          )}

          {/* 3D Visualization Tab */}
          {activeTab === '3d' && (
            (tabLoading || loading) ? (
              <div className="p-4 flex flex-col items-center justify-center h-96 space-y-4">
                <FiEye className="w-12 h-12 text-indigo-500 animate-pulse" />
                <div className="text-center">
                  <p className="text-gray-600 font-medium">Rendering 3D View...</p>
                  <p className="text-sm text-gray-500 mt-1">Preparing visualization</p>
                </div>
                <div className="w-32 h-32 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="text-xs text-gray-400 text-center">
                  Loading earthquake positions and magnitudes
                </div>
              </div>
            ) : (
              <div className="h-96">
                <EarthquakeVisualization3D 
                  earthquakes={earthquakes}
                  isVisible={true}
                  loading={loading}
                />
              </div>
            )
          )}

          </div>
          
          {/* Sidebar Footer with Close Button */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Press <kbd className="px-1.5 py-0.5 bg-white rounded border text-gray-700">S</kbd> or <kbd className="px-1.5 py-0.5 bg-white rounded border text-gray-700">Esc</kbd> to close
              </div>
              <button
                onClick={onToggle}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title="Close sidebar"
              >
                <FiX className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        mapStyle={mapStyle}
        onMapStyleChange={onMapStyleChange}
        autoFit={autoFit}
        onAutoFitChange={onAutoFitChange}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={onAutoRefreshChange}
        filters={filters}
        earthquakes={earthquakes}
      />

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[999] lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;
