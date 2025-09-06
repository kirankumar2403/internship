import React, { useRef, useEffect, useState } from 'react';
import { FiEye, FiRotateCw, FiZoomIn, FiZoomOut, FiPlay, FiPause, FiSkipBack } from 'react-icons/fi';

const EarthquakeVisualization3D = ({ earthquakes, isVisible, loading = false }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isVisible || !earthquakes?.features) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    let autoRotation = 0;

    const drawEarthquake3D = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.3 * zoom;

      // Draw Earth sphere
      const gradient = ctx.createRadialGradient(
        centerX - radius * 0.3, centerY - radius * 0.3, 0,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, '#4FC3F7');
      gradient.addColorStop(0.7, '#2196F3');
      gradient.addColorStop(1, '#1976D2');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Add continent shadows (simplified)
      ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
      ctx.beginPath();
      ctx.arc(centerX + radius * 0.2, centerY - radius * 0.1, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Draw earthquakes as 3D points
      earthquakes.features.forEach((feature, index) => {
        const [lng, lat, depth] = feature.geometry.coordinates;
        const magnitude = feature.properties.mag || 0;
        
        // Convert lat/lng to 3D coordinates with manual rotation
        const phi = (90 - lat) * Math.PI / 180;
        const theta = (lng + autoRotation + rotation.y) * Math.PI / 180;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        // Project to 2D screen coordinates
        const screenX = centerX + x * 0.8;
        const screenY = centerY - z * 0.8;
        
        // Only draw if on visible hemisphere
        if (y > -radius * 0.5) {
          const size = Math.max(2, magnitude * 2) * zoom;
          const opacity = Math.max(0.3, (y + radius * 0.5) / radius);
          
          // Color based on magnitude and depth
          const hue = magnitude < 4 ? 120 : magnitude < 6 ? 60 : 0;
          const saturation = 80;
          const lightness = Math.max(30, 70 - (depth / 20));
          
          ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
          ctx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
          ctx.shadowBlur = size;
          
          ctx.beginPath();
          ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add ripple effect for recent earthquakes
          const age = (Date.now() - feature.properties.time) / (1000 * 60 * 60); // hours
          if (age < 24) {
            const rippleRadius = size + (24 - age) * 2;
            ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.3 * (1 - age/24)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(screenX, screenY, rippleRadius, 0, Math.PI * 2);
            ctx.stroke();
          }
          
          ctx.shadowBlur = 0;
        }
      });

      // Add rotation if animating
      if (isAnimating) {
        autoRotation += 0.01 * rotationSpeed;
        animationRef.current = requestAnimationFrame(drawEarthquake3D);
      }
    };

    drawEarthquake3D();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [earthquakes, isVisible, isAnimating, rotationSpeed, zoom, rotation]);

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const resetView = () => {
    setZoom(1);
    setRotationSpeed(1);
    setIsAnimating(false);
    setRotation({ x: 0, y: 0 });
  };

  // Mouse event handlers for drag functionality
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };


  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for drag functionality
  useEffect(() => {
    const handleMouseMoveGlobal = (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      setRotation(prev => ({
        x: prev.x + deltaY * 0.01,
        y: prev.y + deltaX * 0.01
      }));
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMoveGlobal);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, lastMousePos]);

  if (!isVisible) return null;

  if (loading) {
    return (
      <div className="relative h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <FiEye className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium mb-2">Preparing 3D Visualization</p>
          <p className="text-sm text-blue-200">Loading earthquake data...</p>
          <div className="mt-4 w-16 h-16 mx-auto border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))' }}
        onMouseDown={handleMouseDown}
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-3 space-y-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAnimation}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title={isAnimating ? 'Pause rotation' : 'Start rotation'}
          >
            {isAnimating ? <FiPause className="w-4 h-4 text-white" /> : <FiPlay className="w-4 h-4 text-white" />}
          </button>
          
          <button
            onClick={resetView}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Reset view"
          >
            <FiSkipBack className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded text-white"
            title="Zoom out"
          >
            <FiZoomOut className="w-3 h-3" />
          </button>
          <span className="text-white text-xs px-2">{zoom.toFixed(1)}x</span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.2))}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded text-white"
            title="Zoom in"
          >
            <FiZoomIn className="w-3 h-3" />
          </button>
        </div>

        {/* Rotation speed */}
        {isAnimating && (
          <div className="flex items-center space-x-2">
            <FiRotateCw className="w-3 h-3 text-white" />
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
              className="w-16 h-1"
            />
            <span className="text-white text-xs">{rotationSpeed.toFixed(1)}x</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md rounded-lg p-3">
        <h4 className="text-white font-semibold text-sm mb-2">3D Earthquake View</h4>
        <div className="space-y-1 text-xs text-white/80">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>M &lt; 4.0</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span>M 4.0-6.0</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span>M &gt; 6.0</span>
          </div>
          <div className="mt-2 pt-2 border-t border-white/20">
            <p>Size = Magnitude | Brightness = Depth</p>
            <p>Ripples = Recent activity (&lt;24h)</p>
          </div>
        </div>
      </div>

      {/* Info overlay */}
      {earthquakes?.features && (
        <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-lg p-3">
          <div className="text-white text-sm">
            <div className="flex items-center space-x-2 mb-1">
              <FiEye className="w-4 h-4" />
              <span className="font-semibold">3D Globe View</span>
            </div>
            <div className="text-xs text-white/80">
              {earthquakes.features.length} earthquakes visualized
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarthquakeVisualization3D;
