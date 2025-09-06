import axios from 'axios';

// USGS Earthquake API base URL
const USGS_BASE_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0';

// Time range options for earthquake data
export const TIME_RANGES = {
  HOUR: { key: 'hour', label: 'Past Hour', endpoint: 'summary/all_hour.geojson' },
  DAY: { key: 'day', label: 'Past Day', endpoint: 'summary/all_day.geojson' },
  WEEK: { key: 'week', label: 'Past Week', endpoint: 'summary/all_week.geojson' },
  MONTH: { key: 'month', label: 'Past Month', endpoint: 'summary/all_month.geojson' },
  SIGNIFICANT: { key: 'significant', label: 'Significant (Past Month)', endpoint: 'summary/significant_month.geojson' },
  M4_5_DAY: { key: 'm4.5_day', label: 'M4.5+ Past Day', endpoint: 'summary/4.5_day.geojson' },
  M4_5_WEEK: { key: 'm4.5_week', label: 'M4.5+ Past Week', endpoint: 'summary/4.5_week.geojson' },
  M2_5_DAY: { key: 'm2.5_day', label: 'M2.5+ Past Day', endpoint: 'summary/2.5_day.geojson' },
  M2_5_WEEK: { key: 'm2.5_week', label: 'M2.5+ Past Week', endpoint: 'summary/2.5_week.geojson' },
  M1_0_DAY: { key: 'm1.0_day', label: 'M1.0+ Past Day', endpoint: 'summary/1.0_day.geojson' }
};

// Magnitude categories for color coding
export const MAGNITUDE_CATEGORIES = {
  MINOR: { min: 0, max: 3.9, label: 'Minor', color: '#22c55e' },
  LIGHT: { min: 4.0, max: 4.9, label: 'Light', color: '#eab308' },
  MODERATE: { min: 5.0, max: 5.9, label: 'Moderate', color: '#f97316' },
  STRONG: { min: 6.0, max: 6.9, label: 'Strong', color: '#ef4444' },
  MAJOR: { min: 7.0, max: 7.9, label: 'Major', color: '#dc2626' },
  GREAT: { min: 8.0, max: 10.0, label: 'Great', color: '#991b1b' }
};

class EarthquakeService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get earthquake data from USGS API
   * @param {string} timeRange - Time range key from TIME_RANGES
   * @param {Object} options - Additional options for filtering
   * @returns {Promise<Object>} GeoJSON data with earthquake information
   */
  async getEarthquakes(timeRange = 'day', options = {}) {
    try {
      const cacheKey = `${timeRange}_${JSON.stringify(options)}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const endpoint = TIME_RANGES[timeRange.toUpperCase()]?.endpoint || TIME_RANGES.DAY.endpoint;
      const url = `${USGS_BASE_URL}/${endpoint}`;
      
      const response = await axios.get(url, {
        timeout: 30000, // 30 seconds timeout
        headers: {
          'Accept': 'application/json',
        }
      });

      let data = response.data;

      // Apply filters if provided
      if (options.minMagnitude || options.maxMagnitude || options.region || options.minDepth || options.maxDepth) {
        data = this.filterEarthquakes(data, options);
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Error fetching earthquake data:', error);
      throw new Error(`Failed to fetch earthquake data: ${error.message}`);
    }
  }

  /**
   * Filter earthquake data based on criteria
   * @param {Object} geoJsonData - Original GeoJSON data
   * @param {Object} filters - Filter criteria
   * @returns {Object} Filtered GeoJSON data
   */
  filterEarthquakes(geoJsonData, filters = {}) {
    if (!geoJsonData || !geoJsonData.features) {
      return geoJsonData;
    }

    const filteredFeatures = geoJsonData.features.filter(feature => {
      const properties = feature.properties;
      const magnitude = properties.mag;
      const place = properties.place || '';
      const depth = feature.geometry.coordinates[2]; // Depth is the third coordinate

      // Magnitude filter
      if (filters.minMagnitude !== undefined && (magnitude === null || magnitude === undefined || magnitude < filters.minMagnitude)) {
        return false;
      }
      if (filters.maxMagnitude !== undefined && (magnitude === null || magnitude === undefined || magnitude > filters.maxMagnitude)) {
        return false;
      }

      // Region filter (simple text search in place name)
      if (filters.region && !place.toLowerCase().includes(filters.region.toLowerCase())) {
        return false;
      }

      // Depth filter
      if (filters.minDepth !== undefined && depth < filters.minDepth) {
        return false;
      }
      if (filters.maxDepth !== undefined && depth > filters.maxDepth) {
        return false;
      }

      return true;
    });

    return {
      ...geoJsonData,
      features: filteredFeatures
    };
  }

  /**
   * Get earthquake statistics from the data
   * @param {Object} geoJsonData - GeoJSON earthquake data
   * @returns {Object} Statistics object
   */
  getEarthquakeStats(geoJsonData) {
    if (!geoJsonData || !geoJsonData.features) {
      return {
        total: 0,
        byMagnitude: {},
        strongest: null,
        mostRecent: null,
        averageMagnitude: 0,
        totalByDepth: { shallow: 0, intermediate: 0, deep: 0 }
      };
    }

    const features = geoJsonData.features;
    const magnitudes = features.map(f => f.properties.mag).filter(m => m !== null);
    const byMagnitude = {};
    const totalByDepth = { shallow: 0, intermediate: 0, deep: 0 };

    // Count by magnitude categories
    Object.values(MAGNITUDE_CATEGORIES).forEach(category => {
      byMagnitude[category.label] = features.filter(f => {
        const mag = f.properties.mag;
        return mag >= category.min && mag < category.max;
      }).length;
    });

    // Count by depth categories
    features.forEach(feature => {
      const depth = feature.geometry.coordinates[2]; // Depth is the third coordinate
      if (depth < 70) {
        totalByDepth.shallow++;
      } else if (depth < 300) {
        totalByDepth.intermediate++;
      } else {
        totalByDepth.deep++;
      }
    });

    // Find strongest earthquake
    const strongest = features.reduce((max, current) => {
      const currentMag = current.properties.mag || 0;
      const maxMag = max?.properties.mag || 0;
      return currentMag > maxMag ? current : max;
    }, null);

    // Find most recent earthquake
    const mostRecent = features.reduce((latest, current) => {
      const currentTime = current.properties.time;
      const latestTime = latest?.properties.time || 0;
      return currentTime > latestTime ? current : latest;
    }, null);

    return {
      total: features.length,
      byMagnitude,
      strongest,
      mostRecent,
      averageMagnitude: magnitudes.length > 0 
        ? (magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length).toFixed(2)
        : 0,
      totalByDepth
    };
  }

  /**
   * Get magnitude category for a given magnitude value
   * @param {number} magnitude - Earthquake magnitude
   * @returns {Object} Magnitude category object
   */
  getMagnitudeCategory(magnitude) {
    if (magnitude === null || magnitude === undefined) {
      return MAGNITUDE_CATEGORIES.MINOR;
    }

    return Object.values(MAGNITUDE_CATEGORIES).find(category => 
      magnitude >= category.min && magnitude <= category.max
    ) || MAGNITUDE_CATEGORIES.MINOR;
  }

  /**
   * Get marker size based on magnitude
   * @param {number} magnitude - Earthquake magnitude
   * @returns {number} Marker radius in pixels
   */
  getMarkerSize(magnitude) {
    if (magnitude === null || magnitude === undefined) return 5;
    
    // Scale marker size based on magnitude (minimum 5px, maximum 30px)
    return Math.max(5, Math.min(30, magnitude * 4));
  }

  /**
   * Format earthquake data for display
   * @param {Object} feature - GeoJSON feature
   * @returns {Object} Formatted earthquake data
   */
  formatEarthquakeData(feature) {
    const properties = feature.properties;
    const coordinates = feature.geometry.coordinates;
    
    return {
      id: properties.ids,
      magnitude: properties.mag,
      place: properties.place,
      time: new Date(properties.time).toLocaleString(),
      coordinates: {
        longitude: coordinates[0],
        latitude: coordinates[1],
        depth: coordinates[2]
      },
      url: properties.url,
      detail: properties.detail,
      felt: properties.felt,
      cdi: properties.cdi,
      mmi: properties.mmi,
      alert: properties.alert,
      status: properties.status,
      tsunami: properties.tsunami,
      significance: properties.sig,
      network: properties.net,
      code: properties.code,
      ids: properties.ids,
      sources: properties.sources,
      types: properties.types,
      title: properties.title
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get available time ranges
   * @returns {Array} Array of time range options
   */
  getTimeRanges() {
    return Object.values(TIME_RANGES);
  }
}

// Export singleton instance
const earthquakeServiceInstance = new EarthquakeService();
export default earthquakeServiceInstance;
