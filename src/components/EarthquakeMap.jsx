import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import earthquakeService from '../services/earthquakeService';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom earthquake marker component
const EarthquakeMarkers = ({ earthquakes, selectedEarthquake, onEarthquakeClick }) => {
  const map = useMap();
  const markersRef = useRef(new Map());

  useEffect(() => {
    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current.clear();

    if (!earthquakes || !earthquakes.features) return;

    earthquakes.features.forEach((feature, index) => {
      const { properties, geometry } = feature;
      const [lng, lat, depth] = geometry.coordinates;
      const magnitude = properties.mag || 0;
      
      // Get magnitude category for styling
      const category = earthquakeService.getMagnitudeCategory(magnitude);
      const markerSize = earthquakeService.getMarkerSize(magnitude);
      
      // Create custom icon
      const icon = L.divIcon({
        className: 'earthquake-marker-container',
        html: `
          <div 
            class="earthquake-marker magnitude-${Math.floor(magnitude)}" 
            style="
              width: ${markerSize}px;
              height: ${markerSize}px;
              background-color: ${category.color};
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: ${Math.max(8, markerSize / 3)}px;
              font-weight: bold;
              color: white;
              text-shadow: 0 1px 2px rgba(0,0,0,0.5);
              cursor: pointer;
              transition: all 0.2s ease;
            "
            data-magnitude="${magnitude.toFixed(1)}"
          >
            ${magnitude >= 4 ? magnitude.toFixed(1) : ''}
          </div>
        `,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
        popupAnchor: [0, -markerSize / 2]
      });

      // Create marker
      const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(() => {
          const popupDiv = document.createElement('div');
          
          popupDiv.innerHTML = `
            <div class="earthquake-popup">
              <div class="popup-header">
                <h3 class="text-lg font-bold text-gray-800 mb-2">
                  M${magnitude.toFixed(1)} Earthquake
                </h3>
                <div class="magnitude-badge" style="background-color: ${category.color}">
                  ${category.label}
                </div>
              </div>
              
              <div class="popup-content space-y-2">
                <div>
                  <strong>Location:</strong> ${properties.place || 'Unknown'}
                </div>
                <div>
                  <strong>Time:</strong> ${new Date(properties.time).toLocaleString()}
                </div>
                <div>
                  <strong>Depth:</strong> ${depth ? `${depth.toFixed(1)} km` : 'Unknown'}
                </div>
                <div>
                  <strong>Coordinates:</strong> ${lat.toFixed(4)}°, ${lng.toFixed(4)}°
                </div>
                ${properties.felt ? `<div><strong>Felt Reports:</strong> ${properties.felt}</div>` : ''}
                ${properties.tsunami ? '<div class="text-red-600 font-bold">⚠️ Tsunami Warning</div>' : ''}
              </div>
              
              <div class="popup-footer mt-3">
                ${properties.url ? 
                  `<a href="${properties.url}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">
                    View Details on USGS →
                  </a>` : ''
                }
              </div>
            </div>
          `;
          
          return popupDiv;
        }, {
          maxWidth: 300,
          className: 'custom-popup'
        });

      // Add click handler
      marker.on('click', () => {
        if (onEarthquakeClick) {
          onEarthquakeClick(feature);
        }
      });

      // Add hover effects
      marker.on('mouseover', (e) => {
        const markerElement = e.target._icon.querySelector('.earthquake-marker');
        if (markerElement) {
          markerElement.style.transform = 'scale(1.2)';
          markerElement.style.zIndex = '1000';
        }
      });

      marker.on('mouseout', (e) => {
        const markerElement = e.target._icon.querySelector('.earthquake-marker');
        if (markerElement) {
          markerElement.style.transform = 'scale(1)';
          markerElement.style.zIndex = '50';
        }
      });

      markersRef.current.set(feature.id || index, marker);
    });

    return () => {
      const currentMarkers = markersRef.current;
      currentMarkers.forEach(marker => map.removeLayer(marker));
      currentMarkers.clear();
    };
  }, [earthquakes, map, onEarthquakeClick]);

  // Handle selected earthquake
  useEffect(() => {
    if (selectedEarthquake && selectedEarthquake.geometry) {
      const [lng, lat] = selectedEarthquake.geometry.coordinates;
      map.setView([lat, lng], 8, { animate: true });
      
      // Find and open popup for selected earthquake
      markersRef.current.forEach(marker => {
        const markerLatLng = marker.getLatLng();
        if (Math.abs(markerLatLng.lat - lat) < 0.001 && Math.abs(markerLatLng.lng - lng) < 0.001) {
          marker.openPopup();
        }
      });
    }
  }, [selectedEarthquake, map]);

  return null;
};

// Map bounds controller
const MapBoundsController = ({ earthquakes, autoFit }) => {
  const map = useMap();

  useEffect(() => {
    if (autoFit && earthquakes && earthquakes.features && earthquakes.features.length > 0) {
      const bounds = L.latLngBounds();
      
      earthquakes.features.forEach(feature => {
        const [lng, lat] = feature.geometry.coordinates;
        bounds.extend([lat, lng]);
      });
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20], maxZoom: 10 });
      }
    }
  }, [earthquakes, autoFit, map]);

  return null;
};

// Map style controller
const MapStyleController = ({ mapStyle }) => {
  const map = useMap();

  useEffect(() => {
    // Update map style/tiles based on selection
    // This would be implemented with different tile layer sources
  }, [mapStyle, map]);

  return null;
};

const EarthquakeMap = ({ 
  earthquakes, 
  loading, 
  selectedEarthquake, 
  onEarthquakeClick, 
  mapStyle = 'osm',
  autoFit = true,
  showClusters = true,
  className = ''
}) => {
  const mapRef = useRef(null);

  const getTileLayerUrl = () => {
    switch (mapStyle) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}';
      case 'dark':
        return 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
      case 'osm':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getTileLayerAttribution = () => {
    switch (mapStyle) {
      case 'satellite':
      case 'terrain':
        return '© Esri';
      case 'dark':
        return '© Stadia Maps © OpenMapTiles © OpenStreetMap contributors';
      case 'osm':
      default:
        return '© OpenStreetMap contributors';
    }
  };

  return (
    <div className={`relative h-full w-full ${className}`}>
      {loading && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700">Loading earthquakes...</span>
          </div>
        </div>
      )}

      <MapContainer
        ref={mapRef}
        center={[20, 0]} // World center
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        preferCanvas={true}
        attributionControl={true}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        worldCopyJump={true}
      >
        <TileLayer
          url={getTileLayerUrl()}
          attribution={getTileLayerAttribution()}
          maxZoom={18}
          tileSize={256}
          zoomOffset={0}
        />
        
        <EarthquakeMarkers 
          earthquakes={earthquakes}
          selectedEarthquake={selectedEarthquake}
          onEarthquakeClick={onEarthquakeClick}
        />
        
        <MapBoundsController 
          earthquakes={earthquakes}
          autoFit={autoFit}
        />
        
        <MapStyleController 
          mapStyle={mapStyle}
        />
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">Earthquake Magnitude</h4>
        <div className="space-y-2">
          {[
            { label: 'Minor', min: 0, color: '#22c55e' },
            { label: 'Light', min: 4, color: '#eab308' },
            { label: 'Moderate', min: 5, color: '#f97316' },
            { label: 'Strong', min: 6, color: '#ef4444' },
            { label: 'Major', min: 7, color: '#dc2626' },
            { label: 'Great', min: 8, color: '#991b1b' }
          ].map((category) => (
            <div key={category.label} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: category.color }}
              ></div>
              <span className="text-xs text-gray-700">
                {category.label} ({category.min}+)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scale indicator */}
      {earthquakes && earthquakes.features && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="text-xs text-gray-600">
            {earthquakes.features.length} earthquake{earthquakes.features.length !== 1 ? 's' : ''} shown
          </div>
        </div>
      )}
    </div>
  );
};

export default EarthquakeMap;
