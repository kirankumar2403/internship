import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiX, FiAlertTriangle, FiMapPin, FiClock } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const NotificationSystem = ({ earthquakes, onEarthquakeSelect }) => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    enabled: true,
    minMagnitude: 5.0,
    regions: [],
    sound: true,
    desktop: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [lastCheck, setLastCheck] = useState(Date.now());
  const audioRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJH3L+N2QQAoUXrTp66hVFApGn+DyvmogBjuV3+/FdC4GJHnI9NyOOQcZZ7jr3ZlIDAhLouPushwEPJbb8MNyJAUsgcvh3Y06CBpl'); 
  }, []);

  // Check for new significant earthquakes
  useEffect(() => {
    if (!earthquakes?.features || !settings.enabled) return;

    const checkForAlerts = () => {
      const newQuakes = earthquakes.features.filter(feature => {
        const quakeTime = feature.properties.time;
        const magnitude = feature.properties.mag || 0;
        const place = feature.properties.place || '';

        // Check if it's newer than our last check
        if (quakeTime <= lastCheck) return false;

        // Check magnitude threshold
        if (magnitude < settings.minMagnitude) return false;

        // Check region filters (if any)
        if (settings.regions.length > 0) {
          const matchesRegion = settings.regions.some(region => 
            place.toLowerCase().includes(region.toLowerCase())
          );
          if (!matchesRegion) return false;
        }

        return true;
      });

      // Create notifications for new earthquakes
      newQuakes.forEach(quake => {
        const notification = {
          id: `${quake.properties.time}-${quake.properties.mag}`,
          earthquake: quake,
          timestamp: Date.now(),
          read: false
        };

        setNotifications(prev => [notification, ...prev.slice(0, 19)]); // Keep last 20

        // Show toast notification
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FiAlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    🚨 M{quake.properties.mag?.toFixed(1)} Earthquake
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {quake.properties.place}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(quake.properties.time).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  onEarthquakeSelect?.(quake);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                View
              </button>
            </div>
          </div>
        ), {
          duration: 8000,
          position: 'top-right'
        });

        // Play sound if enabled
        if (settings.sound && audioRef.current) {
          audioRef.current.play().catch(() => {
            // Handle audio play failure silently
          });
        }

        // Show desktop notification if enabled and permission granted
        if (settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`🌍 M${quake.properties.mag?.toFixed(1)} Earthquake`, {
            body: `${quake.properties.place}\n${new Date(quake.properties.time).toLocaleString()}`,
            icon: '🌍',
            tag: `earthquake-${quake.properties.time}`,
            requireInteraction: true
          });
        }
      });

      setLastCheck(Date.now());
    };

    checkForAlerts();
  }, [earthquakes, settings, lastCheck, onEarthquakeSelect]);

  // Request notification permission
  useEffect(() => {
    if (settings.desktop && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [settings.desktop]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const addRegionFilter = () => {
    const region = prompt('Enter region name to monitor (e.g., "California", "Japan"):');
    if (region && region.trim()) {
      setSettings(prev => ({
        ...prev,
        regions: [...prev.regions, region.trim()]
      }));
    }
  };

  const removeRegionFilter = (index) => {
    setSettings(prev => ({
      ...prev,
      regions: prev.regions.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"        
        title="Earthquake Notifications"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showSettings && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setShowSettings(false)}
          />
          <div className="absolute top-12 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <FiBell className="w-4 h-4 mr-2" />
                Earthquake Alerts
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-4">
              {/* Enable/Disable */}
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable notifications</span>
              </label>

              {/* Minimum Magnitude */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Magnitude: {settings.minMagnitude}
                </label>
                <input
                  type="range"
                  min="3.0"
                  max="8.0"
                  step="0.1"
                  value={settings.minMagnitude}
                  onChange={(e) => setSettings(prev => ({ ...prev, minMagnitude: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Sound */}
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.sound}
                  onChange={(e) => setSettings(prev => ({ ...prev, sound: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Sound alerts</span>
              </label>

              {/* Desktop Notifications */}
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.desktop}
                  onChange={(e) => setSettings(prev => ({ ...prev, desktop: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Desktop notifications</span>
              </label>

              {/* Region Filters */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Region Filters</label>
                  <button
                    onClick={addRegionFilter}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    + Add
                  </button>
                </div>
                {settings.regions.length > 0 ? (
                  <div className="space-y-1">
                    {settings.regions.map((region, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                        <span className="text-xs text-gray-600">{region}</span>
                        <button
                          onClick={() => removeRegionFilter(index)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">Monitoring all regions</p>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <>
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Recent Alerts ({notifications.length})
                  </span>
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        markAsRead(notification.id);
                        onEarthquakeSelect?.(notification.earthquake);
                        setShowSettings(false);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <FiAlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-medium text-gray-900">
                              M{notification.earthquake.properties.mag?.toFixed(1)}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-1">
                            <FiMapPin className="w-3 h-3 inline mr-1" />
                            {notification.earthquake.properties.place}
                          </p>
                          
                          <p className="text-xs text-gray-500">
                            <FiClock className="w-3 h-3 inline mr-1" />
                            {new Date(notification.earthquake.properties.time).toLocaleString()}
                          </p>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-6 text-center">
                <FiBell className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No recent alerts</p>
                <p className="text-xs text-gray-400 mt-1">
                  You'll be notified of earthquakes ≥ M{settings.minMagnitude}
                </p>
              </div>
            )}
          </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationSystem;
