import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import EarthquakeMap from './components/EarthquakeMap';
import Sidebar from './components/Sidebar';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import earthquakeService from './services/earthquakeService';

function App() {
  // State management
  const [earthquakes, setEarthquakes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [selectedEarthquake, setSelectedEarthquake] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Filter state
  const [filters, setFilters] = useState({
    timeRange: 'day',
    minMagnitude: '',
    maxMagnitude: '',
    region: '',
    minDepth: '',
    maxDepth: ''
  });

  // Map settings
  const [mapStyle, setMapStyle] = useState('osm');
  const [autoFit, setAutoFit] = useState(true);

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const refreshInterval = 30 * 1000; // 30 seconds

  // Fetch earthquake data
  const fetchEarthquakes = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);

      const filterOptions = {
        minMagnitude: filters.minMagnitude ? parseFloat(filters.minMagnitude) : undefined,
        maxMagnitude: filters.maxMagnitude ? parseFloat(filters.maxMagnitude) : undefined,
        region: filters.region || undefined,
        minDepth: filters.minDepth ? parseFloat(filters.minDepth) : undefined,
        maxDepth: filters.maxDepth ? parseFloat(filters.maxDepth) : undefined
      };

      const data = await earthquakeService.getEarthquakes(filters.timeRange, filterOptions);
      const stats = earthquakeService.getEarthquakeStats(data);

      setEarthquakes(data);
      setStatistics(stats);
      setLastRefresh(new Date());
      
      if (showToast) {
        toast.success(`Loaded ${data.features?.length || 0} earthquakes`);
      }
      
      if (initialLoad) {
        setInitialLoad(false);
      }
    } catch (err) {
      console.error('Error fetching earthquakes:', err);
      setError(err.message);
      toast.error(`Failed to load earthquake data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [filters, initialLoad]);

  // Initialize data on component mount
  useEffect(() => {
    fetchEarthquakes();
  }, [fetchEarthquakes]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchEarthquakes(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchEarthquakes]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setSelectedEarthquake(null); // Clear selection when filters change
  }, []);

  // Handle earthquake selection
  const handleEarthquakeSelect = useCallback((earthquake) => {
    setSelectedEarthquake(earthquake);
    
    // Show details toast
    const magnitude = earthquake.properties.mag?.toFixed(1) || 'N/A';
    const place = earthquake.properties.place || 'Unknown location';
    toast(`M${magnitude} earthquake - ${place}`, {
      icon: '🌍',
      duration: 4000
    });
  }, []);

  // Handle earthquake click from map
  const handleEarthquakeClick = useCallback((earthquake) => {
    handleEarthquakeSelect(earthquake);
  }, [handleEarthquakeSelect]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchEarthquakes(true);
  }, [fetchEarthquakes]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Toggle sidebar with 'S' key
      if (event.key.toLowerCase() === 's' && !event.ctrlKey && !event.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          setSidebarOpen(prev => !prev);
        }
      }
      
      // Refresh with 'R' key
      if (event.key.toLowerCase() === 'r' && !event.ctrlKey && !event.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          event.preventDefault();
          handleRefresh();
        }
      }
      
      // Clear selection with Escape, or close sidebar if open
      if (event.key === 'Escape') {
        if (sidebarOpen) {
          setSidebarOpen(false);
        } else {
          setSelectedEarthquake(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleRefresh, sidebarOpen]);

  // Show initial loading screen
  if (initialLoad && loading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="h-screen w-screen overflow-hidden bg-gray-100">
        {/* Header */}
        <header className="relative z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-bold text-gray-900 flex items-center">
                    🌍 Earthquake Visualizer
                  </h1>
                </div>
                <div className="hidden md:block ml-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      {statistics && (
                        <span>
                          {statistics.total.toLocaleString()} earthquakes
                          {lastRefresh && (
                            <span className="ml-2 text-xs text-gray-500">
                              • Updated {lastRefresh.toLocaleTimeString()}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Auto-refresh toggle */}
                <label className="hidden md:flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Auto-refresh</span>
                </label>
                
                {/* Keyboard shortcuts info */}
                <div className="hidden lg:block text-xs text-gray-500">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">S</kbd> for sidebar, 
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded ml-1">R</kbd> to refresh
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex h-[calc(100vh-4rem)] relative">
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            statistics={statistics}
            earthquakes={earthquakes}
            onEarthquakeSelect={handleEarthquakeSelect}
            onRefresh={handleRefresh}
            loading={loading}
            mapStyle={mapStyle}
            onMapStyleChange={setMapStyle}
            autoFit={autoFit}
            onAutoFitChange={setAutoFit}
            autoRefresh={autoRefresh}
            onAutoRefreshChange={setAutoRefresh}
          />

          {/* Map */}
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-96' : ''}`}>
            {error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <EarthquakeMap
                earthquakes={earthquakes}
                loading={loading}
                selectedEarthquake={selectedEarthquake}
                onEarthquakeClick={handleEarthquakeClick}
                mapStyle={mapStyle}
                autoFit={autoFit}
                className="h-full"
              />
            )}
          </div>
        </div>

        {/* Global notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb',
            },
          }}
        />

        {/* Footer with credits */}
        <div className="absolute bottom-4 right-4 z-10 hidden lg:block">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg text-xs text-gray-600">
            <p>
              Data from{' '}
              <a 
                href="https://earthquake.usgs.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                USGS Earthquake Hazards Program
              </a>
            </p>
            <p className="mt-1">
              Built for Casey - Geography Student
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
