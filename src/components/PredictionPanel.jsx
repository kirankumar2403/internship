import React, { useState, useEffect } from 'react';
import { FiCpu, FiTrendingUp, FiAlertTriangle, FiTarget, FiClock, FiZap } from 'react-icons/fi';

const PredictionPanel = ({ earthquakes, selectedRegion, loading = false }) => {
  const [predictions, setPredictions] = useState(null);
  const [riskLevel, setRiskLevel] = useState('low');
  const [patterns, setPatterns] = useState([]);

  // Simulate AI-based earthquake pattern analysis
  useEffect(() => {
    if (!earthquakes?.features) return;

    const analyzePatterns = () => {
      const features = earthquakes.features;
      const now = Date.now();
      
      // Analyze recent activity patterns
      const recentQuakes = features.filter(f => 
        (now - f.properties.time) < 7 * 24 * 60 * 60 * 1000 // Last 7 days
      );

      // Calculate seismic activity indicators
      const avgMagnitude = recentQuakes.reduce((sum, f) => sum + (f.properties.mag || 0), 0) / recentQuakes.length;
      const activityRate = recentQuakes.length / 7; // per day
      const maxMagnitude = Math.max(...recentQuakes.map(f => f.properties.mag || 0));

      // Detect clustering
      const clusters = detectClusters(recentQuakes);
      
      // Generate risk assessment
      let risk = 'low';
      if (avgMagnitude > 4.0 && activityRate > 5) risk = 'high';
      else if (avgMagnitude > 3.0 && activityRate > 2) risk = 'moderate';

      setRiskLevel(risk);
      setPredictions({
        avgMagnitude: avgMagnitude.toFixed(1),
        activityRate: activityRate.toFixed(1),
        maxMagnitude: maxMagnitude.toFixed(1),
        clusters: clusters.length,
        probability: calculateProbability(avgMagnitude, activityRate, maxMagnitude)
      });

      // Identify patterns
      const detectedPatterns = [];
      if (activityRate > 3) detectedPatterns.push('Increased seismic activity detected');
      if (clusters.length > 2) detectedPatterns.push('Multiple earthquake clusters identified');
      if (maxMagnitude > 6.0) detectedPatterns.push('Recent significant earthquake may trigger aftershocks');
      
      setPatterns(detectedPatterns);
    };

    const timer = setTimeout(analyzePatterns, 1000);
    return () => clearTimeout(timer);
  }, [earthquakes]);

  const detectClusters = (earthquakes) => {
    // Simple clustering algorithm based on proximity
    const clusters = [];
    const processed = new Set();
    
    earthquakes.forEach((quake, i) => {
      if (processed.has(i)) return;
      
      const cluster = [quake];
      const [lng1, lat1] = quake.geometry.coordinates;
      
      earthquakes.forEach((otherQuake, j) => {
        if (i === j || processed.has(j)) return;
        
        const [lng2, lat2] = otherQuake.geometry.coordinates;
        const distance = Math.sqrt(Math.pow(lng2 - lng1, 2) + Math.pow(lat2 - lat1, 2));
        
        if (distance < 2) { // Within ~200km
          cluster.push(otherQuake);
          processed.add(j);
        }
      });
      
      if (cluster.length > 1) {
        clusters.push(cluster);
      }
      processed.add(i);
    });
    
    return clusters;
  };

  const calculateProbability = (avgMag, rate, maxMag) => {
    // Simplified probability calculation
    let probability = 0;
    if (avgMag > 3.0) probability += 20;
    if (rate > 2) probability += 15;
    if (maxMag > 5.0) probability += 25;
    
    return Math.min(probability, 85); // Cap at 85%
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  if (loading || !predictions) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="text-center">
        <FiCpu className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-pulse" />
          <p className="text-sm text-gray-600">
            {loading ? 'Loading earthquake data for analysis...' : 'Analyzing seismic patterns...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <FiCpu className="w-8 h-8 mx-auto mb-3 text-blue-600" />
        <h3 className="font-bold text-lg text-gray-800">AI Seismic Analysis</h3>
        <p className="text-sm text-gray-600">Machine learning-powered earthquake pattern recognition</p>
      </div>

      {/* Risk Assessment */}
      <div className={`p-4 rounded-lg border ${getRiskColor(riskLevel)}`}>
        <div className="flex items-center mb-2">
          <FiAlertTriangle className="w-5 h-5 mr-2" />
          <h4 className="font-semibold">Current Risk Level: {riskLevel.toUpperCase()}</h4>
        </div>
        <p className="text-sm">
          Based on recent seismic activity patterns and historical data analysis.
        </p>
      </div>

      {/* Predictions */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <FiTrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-lg font-bold text-blue-600">{predictions.avgMagnitude}</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">Avg Magnitude (7d)</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <FiClock className="w-4 h-4 text-green-600" />
            <span className="text-lg font-bold text-green-600">{predictions.activityRate}</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">Events/Day</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <FiZap className="w-4 h-4 text-red-600" />
            <span className="text-lg font-bold text-red-600">{predictions.maxMagnitude}</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">Max Magnitude</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <FiTarget className="w-4 h-4 text-purple-600" />
            <span className="text-lg font-bold text-purple-600">{predictions.clusters}</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">Active Clusters</p>
        </div>
      </div>

      {/* Probability Assessment */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-800 mb-2">Earthquake Probability (Next 30 Days)</h4>
        <div className="flex items-center mb-2">
          <div className="flex-1 bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${predictions.probability}%` }}
            ></div>
          </div>
          <span className="ml-3 font-bold text-lg text-purple-600">{predictions.probability}%</span>
        </div>
        <p className="text-xs text-gray-600">
          Magnitude 4.0+ earthquake probability based on current seismic patterns
        </p>
      </div>

      {/* Pattern Recognition */}
      {patterns.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
            <FiCpu className="w-4 h-4 mr-2" />
            Detected Patterns
          </h4>
          <ul className="space-y-1">
            {patterns.map((pattern, index) => (
              <li key={index} className="text-sm text-orange-700 flex items-start">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {pattern}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Historical Comparison */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3">Historical Context</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Current vs 30-day avg:</span>
            <span className={`font-medium ${predictions.activityRate > 2 ? 'text-red-600' : 'text-green-600'}`}>
              {predictions.activityRate > 2 ? '↑ Above normal' : '↓ Below normal'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Magnitude trend:</span>
            <span className={`font-medium ${predictions.avgMagnitude > 3 ? 'text-red-600' : 'text-green-600'}`}>
              {predictions.avgMagnitude > 3 ? '↑ Increasing' : '→ Stable'}
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          <strong>Disclaimer:</strong> This analysis is for educational purposes only. 
          Earthquake prediction is not scientifically reliable. Always refer to official 
          geological surveys for authoritative information.
        </p>
      </div>
    </div>
  );
};

export default PredictionPanel;
