import React, { useState } from 'react';
import { FiShare2, FiCopy, FiDownload, FiCompass, FiClock, FiZap, FiMapPin, FiTwitter, FiFacebook } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ComparisonTool = ({ earthquakes, selectedEarthquakes, onAddToComparison, onRemoveFromComparison }) => {
  const [showShareModal, setShowShareModal] = useState(false);

  const generateComparisonReport = () => {
    if (selectedEarthquakes.length === 0) return '';

    const report = selectedEarthquakes.map((eq, index) => {
      const props = eq.properties;
      const coords = eq.geometry.coordinates;
      
      return `
🌍 Earthquake #${index + 1}
📊 Magnitude: ${props.mag?.toFixed(1) || 'Unknown'}
📍 Location: ${props.place || 'Unknown location'}
⏰ Time: ${new Date(props.time).toLocaleString()}
🌊 Depth: ${coords[2]?.toFixed(1) || 'Unknown'} km
${props.tsunami ? '🚨 Tsunami Warning' : ''}
${props.felt > 0 ? `👥 ${props.felt} people felt it` : ''}
🔗 More info: ${props.url || 'N/A'}
      `.trim();
    }).join('\n\n---\n\n');

    return `🌍 Earthquake Comparison Report\n\nGenerated on ${new Date().toLocaleString()}\nData source: USGS Earthquake Hazards Program\n\n${report}`;
  };

  const shareToTwitter = () => {
    const report = generateComparisonReport();
    const text = `🌍 Earthquake Report: ${selectedEarthquakes.length} earthquakes analyzed\n\n${selectedEarthquakes[0]?.properties?.place || 'Recent activity'}\nMagnitude: ${selectedEarthquakes[0]?.properties?.mag?.toFixed(1) || 'N/A'}\n\n#EarthquakeMonitor #Seismology`;
    
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    const report = generateComparisonReport();
    navigator.clipboard.writeText(report).then(() => {
      toast.success('Report copied to clipboard!');
    });
  };

  const downloadReport = () => {
    const report = generateComparisonReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earthquake-comparison-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
  };

  const calculateDistance = (eq1, eq2) => {
    const [lng1, lat1] = eq1.geometry.coordinates;
    const [lng2, lat2] = eq2.geometry.coordinates;
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getTimeDifference = (eq1, eq2) => {
    const diff = Math.abs(eq1.properties.time - eq2.properties.time);
    const hours = diff / (1000 * 60 * 60);
    const days = hours / 24;
    
    if (days >= 1) {
      return `${days.toFixed(1)} days`;
    } else {
      return `${hours.toFixed(1)} hours`;
    }
  };

  if (selectedEarthquakes.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <FiCompass className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <h3 className="font-medium mb-2">No earthquakes selected for comparison</h3>
        <p className="text-sm">Click the compare button next to earthquakes to add them here</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">
          Comparing {selectedEarthquakes.length} Earthquake{selectedEarthquakes.length !== 1 ? 's' : ''}
        </h3>
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <FiShare2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-2 font-medium text-gray-700">Property</th>
              {selectedEarthquakes.map((_, index) => (
                <th key={index} className="text-left p-2 font-medium text-gray-700">
                  Earthquake {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="p-2 font-medium text-gray-600">
                <FiZap className="w-4 h-4 inline mr-1" />
                Magnitude
              </td>
              {selectedEarthquakes.map((eq, index) => (
                <td key={index} className="p-2">
                  <span className={`font-bold ${
                    (eq.properties.mag || 0) >= 6 ? 'text-red-600' : 
                    (eq.properties.mag || 0) >= 4 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {eq.properties.mag?.toFixed(1) || 'Unknown'}
                  </span>
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="p-2 font-medium text-gray-600">
                <FiMapPin className="w-4 h-4 inline mr-1" />
                Location
              </td>
              {selectedEarthquakes.map((eq, index) => (
                <td key={index} className="p-2 text-xs">
                  {eq.properties.place || 'Unknown location'}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="p-2 font-medium text-gray-600">
                <FiClock className="w-4 h-4 inline mr-1" />
                Time
              </td>
              {selectedEarthquakes.map((eq, index) => (
                <td key={index} className="p-2 text-xs">
                  {new Date(eq.properties.time).toLocaleString()}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="p-2 font-medium text-gray-600">Depth (km)</td>
              {selectedEarthquakes.map((eq, index) => (
                <td key={index} className="p-2">
                  {eq.geometry.coordinates[2]?.toFixed(1) || 'Unknown'}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="p-2 font-medium text-gray-600">Felt Reports</td>
              {selectedEarthquakes.map((eq, index) => (
                <td key={index} className="p-2">
                  {eq.properties.felt || 0}
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="p-2 font-medium text-gray-600">Significance</td>
              {selectedEarthquakes.map((eq, index) => (
                <td key={index} className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    (eq.properties.sig || 0) > 600 ? 'bg-red-100 text-red-800' :
                    (eq.properties.sig || 0) > 300 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {eq.properties.sig || 0}
                  </span>
                </td>
              ))}
            </tr>
            
            <tr>
              <td className="p-2 font-medium text-gray-600">Tsunami Alert</td>
              {selectedEarthquakes.map((eq, index) => (
                <td key={index} className="p-2">
                  {eq.properties.tsunami ? (
                    <span className="text-red-600 font-bold">⚠️ Yes</span>
                  ) : (
                    <span className="text-green-600">No</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Distance Analysis (for 2+ earthquakes) */}
      {selectedEarthquakes.length >= 2 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3">Distance Analysis</h4>
          <div className="space-y-2">
            {selectedEarthquakes.map((eq1, i) => 
              selectedEarthquakes.slice(i + 1).map((eq2, j) => (
                <div key={`${i}-${j}`} className="flex justify-between text-sm">
                  <span className="text-blue-800">
                    Earthquake {i + 1} ↔ Earthquake {i + j + 2}:
                  </span>
                  <span className="font-medium text-blue-900">
                    {calculateDistance(eq1, eq2).toFixed(0)} km apart
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Time Analysis */}
      {selectedEarthquakes.length >= 2 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-3">Temporal Analysis</h4>
          <div className="space-y-2">
            {selectedEarthquakes.map((eq1, i) => 
              selectedEarthquakes.slice(i + 1).map((eq2, j) => (
                <div key={`${i}-${j}`} className="flex justify-between text-sm">
                  <span className="text-purple-800">
                    Time difference {i + 1} → {i + j + 2}:
                  </span>
                  <span className="font-medium text-purple-900">
                    {getTimeDifference(eq1, eq2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          <FiCopy className="w-4 h-4" />
          <span>Copy Report</span>
        </button>
        
        <button
          onClick={downloadReport}
          className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          <FiDownload className="w-4 h-4" />
          <span>Download</span>
        </button>
        
        <button
          onClick={() => selectedEarthquakes.forEach(eq => onRemoveFromComparison?.(eq))}
          className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Clear All
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Share Earthquake Report</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={shareToTwitter}
                className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiTwitter className="w-5 h-5 text-blue-400" />
                <span>Share on Twitter</span>
              </button>
              
              <button
                onClick={shareToFacebook}
                className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiFacebook className="w-5 h-5 text-blue-600" />
                <span>Share on Facebook</span>
              </button>
              
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiCopy className="w-5 h-5 text-gray-600" />
                <span>Copy Report Text</span>
              </button>
            </div>
            
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonTool;
