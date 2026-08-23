/**
 * SevaSetu Geospatial Distance & Dynamic Locality Matching Engine
 * SIH 2026 Innovation - Precision Labour Cooperative Proximity Dispatch
 */

// Known Coordinates Database for Major Indian Cities & Localities
const KNOWN_COORDINATES = {
  // Ghaziabad & Localities
  ghaziabad: [28.6692, 77.4538],
  abes: [28.636, 77.441],
  'lal kuan': [28.635, 77.442],
  'crossing republik': [28.628, 77.435],
  indirapuram: [28.6415, 77.3714],
  vaishali: [28.644, 77.34],
  vasundhara: [28.662, 77.375],
  kavi_nagar: [28.675, 77.45],
  raj_nagar: [28.692, 77.448],

  // Noida & Greater Noida
  noida: [28.5721, 77.3567],
  'sector 62': [28.628, 77.3649],
  'sector 18': [28.5708, 77.326],
  'greater noida': [28.4744, 77.504],

  // Delhi NCR
  delhi: [28.6139, 77.209],
  saket: [28.5245, 77.2066],
  'connaught place': [28.6315, 77.2167],
  'mayur vihar': [28.608, 77.295],
  dwarka: [28.5921, 77.046],
  rohini: [28.7159, 77.118],
  laxmi_nagar: [28.6304, 77.2773],

  // Gurgaon
  gurgaon: [28.4595, 77.0266],
  gurugram: [28.4595, 77.0266],
  'cyber city': [28.495, 77.089],

  // Mumbai & Localities
  mumbai: [19.076, 72.8777],
  dadar: [19.0178, 72.8478],
  andheri: [19.1136, 72.8697],
  bandra: [19.0596, 72.8295],
  borivali: [19.2307, 72.8567],
  thane: [19.2183, 72.9781],

  // Other Major Cities
  lucknow: [26.8467, 80.9462],
  kanpur: [26.4499, 80.3319],
  pune: [18.5204, 73.8567],
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  jaipur: [26.9124, 75.7873],
  hyderabad: [17.385, 78.4867],
  kolkata: [22.5726, 88.3639],
  chennai: [13.0827, 80.2707],
  chandigarh: [30.7333, 76.7794],
  ahmedabad: [23.0225, 72.5714],
};

const NCR_CLUSTER = ['delhi', 'noida', 'ghaziabad', 'gurgaon', 'gurugram', 'faridabad', 'greater_noida'];

/**
 * Clean & Normalize string into dynamic slug (Zero Hardcoding)
 */
const toCleanKey = (str) => {
  if (!str) return 'general';
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Extract Canonical City Name from any input / address
 */
const normalizeCityName = (cityOrAddress) => {
  if (!cityOrAddress) return 'delhi';
  const text = cityOrAddress.toString().toLowerCase();

  // Check known keywords in order
  if (text.includes('ghaziabad') || text.includes('abes') || text.includes('lal kuan') || text.includes('crossing') || text.includes('indirapuram') || text.includes('vaishali')) {
    return 'ghaziabad';
  }
  if (text.includes('noida') || text.includes('greater noida')) {
    return 'noida';
  }
  if (text.includes('gurgaon') || text.includes('gurugram')) {
    return 'gurgaon';
  }
  if (text.includes('mumbai') || text.includes('dadar') || text.includes('andheri') || text.includes('bandra') || text.includes('thane')) {
    return 'mumbai';
  }
  if (text.includes('lucknow')) return 'lucknow';
  if (text.includes('kanpur')) return 'kanpur';
  if (text.includes('pune')) return 'pune';
  if (text.includes('bangalore') || text.includes('bengaluru')) return 'bangalore';
  if (text.includes('jaipur')) return 'jaipur';
  if (text.includes('delhi') || text.includes('saket') || text.includes('mayur') || text.includes('dwarka') || text.includes('connaught')) {
    return 'delhi';
  }

  // Fallback to generic cleaned string (Supports any new Indian city seamlessly)
  return toCleanKey(cityOrAddress);
};

/**
 * Get GPS Coordinates for Location / Address
 */
const getCoordinatesForLocation = (cityOrAddress) => {
  if (!cityOrAddress) return KNOWN_COORDINATES.delhi;

  const text = cityOrAddress.toString().toLowerCase();

  // Exact landmark match
  for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
    if (text.includes(key)) {
      return coords;
    }
  }

  const normCity = normalizeCityName(cityOrAddress);
  if (KNOWN_COORDINATES[normCity]) {
    return KNOWN_COORDINATES[normCity];
  }

  // Default coordinate if city not pre-mapped
  return [28.6139, 77.209];
};

/**
 * Calculate accurate Great-Circle Distance (Haversine formula) in Kilometers
 */
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 === lat2 && lon1 === lon2) return 0.5;

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 10) / 10; // Round to 1 decimal
};

/**
 * Estimate Arrival Time (ETA) based on local distance
 */
const calculateEta = (distanceKm) => {
  const km = Number(distanceKm) || 2;
  if (km <= 2) return '8 - 12 Mins';
  if (km <= 5) return '15 - 20 Mins';
  if (km <= 10) return '20 - 30 Mins';
  if (km <= 25) return '35 - 50 Mins';
  return '1 - 2 Hours';
};

/**
 * Check if two cities belong to the same cluster or nearby radius
 */
const isSameCityCluster = (city1, city2) => {
  const c1 = normalizeCityName(city1);
  const c2 = normalizeCityName(city2);

  if (c1 === c2) return true;

  // Check NCR Cluster
  if (NCR_CLUSTER.includes(c1) && NCR_CLUSTER.includes(c2)) {
    return true;
  }

  return false;
};

module.exports = {
  toCleanKey,
  normalizeCityName,
  getCoordinatesForLocation,
  getDistanceKm,
  calculateEta,
  isSameCityCluster,
  KNOWN_COORDINATES,
};
