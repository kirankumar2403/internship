import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiMapPin, FiClock, FiZap, FiActivity, FiAlertTriangle } from 'react-icons/fi';
import { MAGNITUDE_CATEGORIES } from '../services/earthquakeService';

const StatisticsPanel = ({ statistics, earthquakes, loading = false }) => {
  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <FiActivity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
          <p className="font-medium">Loading Statistics...</p>
          <p className="text-sm text-gray-400 mt-1">Processing earthquake data</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <FiActivity className="w-8 h-8 mx-auto mb-2" />
          <p>No statistics available</p>
        </div>
      </div>
    );
  }

  // Prepare data for magnitude distribution chart
  const magnitudeData = Object.entries(statistics.byMagnitude).map(([category, count]) => {
    const categoryInfo = Object.values(MAGNITUDE_CATEGORIES).find(c => c.label === category);
    return {
      category,
      count,
      color: categoryInfo?.color || '#8884d8'
    };
  });

  // Prepare data for depth distribution
  const depthData = [
    { name: 'Shallow (0-70km)', value: statistics.totalByDepth.shallow, color: '#22c55e' },
    { name: 'Intermediate (70-300km)', value: statistics.totalByDepth.intermediate, color: '#eab308' },
    { name: 'Deep (300+km)', value: statistics.totalByDepth.deep, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Recent activity timeline (last 24 hours)
  const getRecentActivity = () => {
    if (!earthquakes?.features) return [];
    
    const now = Date.now();
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${23 - i}h ago`,
      count: 0,
      magnitude: 0
    }));

    earthquakes.features.forEach(feature => {
      const earthquakeTime = feature.properties.time;
      const hoursAgo = Math.floor((now - earthquakeTime) / (1000 * 60 * 60));
      
      if (hoursAgo < 24) {
        const index = 23 - hoursAgo;
        if (index >= 0 && index < 24) {
          hourlyData[index].count++;
          hourlyData[index].magnitude = Math.max(hourlyData[index].magnitude, feature.properties.mag || 0);
        }
      }
    });

    return hourlyData.slice(-12); // Show last 12 hours
  };

  const recentActivity = getRecentActivity();

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Key Statistics */}
      <div className="grid grid-cols-1 gap-4">
        <StatCard
          icon={FiActivity}
          title="Total Earthquakes"
          value={statistics.total.toLocaleString()}
          color="blue"
        />
        
        <StatCard
          icon={FiZap}
          title="Average Magnitude"
          value={`M${statistics.averageMagnitude}`}
          color="yellow"
        />

        {statistics.strongest && (
          <StatCard
            icon={FiTrendingUp}
            title="Strongest Earthquake"
            value={`M${statistics.strongest.properties.mag?.toFixed(1) || 'N/A'}`}
            subtitle={statistics.strongest.properties.place}
            color="red"
          />
        )}

        {statistics.mostRecent && (
          <StatCard
            icon={FiClock}
            title="Most Recent"
            value={new Date(statistics.mostRecent.properties.time).toLocaleTimeString()}
            subtitle={new Date(statistics.mostRecent.properties.time).toLocaleDateString()}
            color="green"
          />
        )}
      </div>

      {/* Magnitude Distribution Chart */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <FiZap className="w-4 h-4 mr-2" />
          Magnitude Distribution
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={magnitudeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Depth Distribution Chart */}
      {depthData.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <FiMapPin className="w-4 h-4 mr-2" />
            Depth Distribution
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={depthData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {depthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity Timeline */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <FiClock className="w-4 h-4 mr-2" />
            Recent Activity (Last 12 Hours)
          </h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#10b981"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Notable Events */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <FiAlertTriangle className="w-4 h-4 mr-2" />
          Notable Events
        </h3>
        
        <div className="space-y-3">
          {/* Strongest Earthquake */}
          {statistics.strongest && (
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-900">Strongest Earthquake</p>
                <p className="text-xs text-red-700">
                  M{statistics.strongest.properties.mag?.toFixed(1)} - {statistics.strongest.properties.place}
                </p>
                <p className="text-xs text-red-600">
                  {new Date(statistics.strongest.properties.time).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Most Recent */}
          {statistics.mostRecent && (
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-900">Most Recent</p>
                <p className="text-xs text-green-700">
                  M{statistics.mostRecent.properties.mag?.toFixed(1)} - {statistics.mostRecent.properties.place}
                </p>
                <p className="text-xs text-green-600">
                  {new Date(statistics.mostRecent.properties.time).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Tsunami Warnings */}
          {earthquakes?.features?.some(f => f.properties.tsunami) && (
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-orange-900">Tsunami Warnings</p>
                <p className="text-xs text-orange-700">
                  {earthquakes.features.filter(f => f.properties.tsunami).length} earthquake(s) with tsunami warnings
                </p>
              </div>
            </div>
          )}

          {/* High Significance Events */}
          {earthquakes?.features?.some(f => f.properties.sig > 600) && (
            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-purple-900">High Significance</p>
                <p className="text-xs text-purple-700">
                  {earthquakes.features.filter(f => f.properties.sig > 600).length} highly significant event(s)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-blue-600">{statistics.total}</p>
              <p className="text-xs text-gray-600">Total Events</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">
                {earthquakes?.features?.filter(f => f.properties.felt > 0).length || 0}
              </p>
              <p className="text-xs text-gray-600">Felt Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Info */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium mb-1">Data Source</p>
        <p>United States Geological Survey (USGS)</p>
        <p>Last updated: {new Date().toLocaleString()}</p>
        <p className="mt-1">
          Statistics are calculated from currently visible earthquakes based on applied filters.
        </p>
      </div>
    </div>
  );
};

export default StatisticsPanel;
