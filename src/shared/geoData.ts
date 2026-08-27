// World Geography, Map Features, Sovereign Boundaries, and Vector Cartography

export type MapMode = 'political' | 'alliances' | 'conflict' | 'economy' | 'population' | 'technology';

export interface WorldCountryGeo {
  id: string; // ISO 3 or Faction ID (e.g. USA, GBR, DEU, IND, CHN, RUS, JPN, BRA, etc.)
  name: string;
  shortName: string;
  continent: string;
  region: string;
  lat: number;
  lng: number;
  capital: string;
  populationEstimate: string;
  gdpIndex: number; // 0-100
  militaryIndex: number; // 0-100
  techIndex: number; // 0-100
  stability: number; // 0-100
  defaultIdeology: string;
  path: string; // SVG path representation on 1000x500 equirectangular canvas
  isSimulatedBorder?: boolean;
  borderChangeReason?: string;
  borderAgents?: string[];
  borderConfidence?: number;
  cities: Array<{ name: string; type: 'capital' | 'metro' | 'port' | 'tech' | 'economic'; lat: number; lng: number; pop: string }>;
  economicHubs: Array<{ name: string; resource: string; lat: number; lng: number }>;
  techHubs: Array<{ name: string; field: string; lat: number; lng: number }>;
}

export interface MapCity {
  id: string;
  name: string;
  countryId: string;
  lat: number;
  lng: number;
  type: 'capital' | 'economic' | 'tech' | 'population';
  population: string;
  description: string;
}

export interface MapTradeRoute {
  id: string;
  name: string;
  category: 'maritime' | 'continental' | 'high_speed';
  startPoint: string;
  endPoint: string;
  points: [number, number][]; // [lng, lat]
  volume: 'dominant' | 'high' | 'moderate';
  goods: string;
}

export interface MapConflictZone {
  id: string;
  name: string;
  type: 'active' | 'flashpoint' | 'disputed';
  lat: number;
  lng: number;
  factions: string[];
  risk: 'critical' | 'high' | 'moderate';
  descriptionHinglish: string;
  descriptionEnglish: string;
}

export interface MapMigrationFlow {
  id: string;
  fromName: string;
  toName: string;
  fromCoords: [number, number]; // [lng, lat]
  toCoords: [number, number];
  label: string;
}

// 1000 x 500 Equirectangular Coordinate Projection Helper
export function projectLatLng(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x, y };
}

// Curated comprehensive real geographic world registry with simplified SVG polygon outlines
export const REAL_WORLD_COUNTRIES: WorldCountryGeo[] = [
  // North America
  {
    id: 'USA',
    name: 'United States of America',
    shortName: 'USA',
    continent: 'North America',
    region: 'North America',
    lat: 38.0,
    lng: -97.0,
    capital: 'Washington, D.C.',
    populationEstimate: '340 Million',
    gdpIndex: 94,
    militaryIndex: 96,
    techIndex: 95,
    stability: 85,
    defaultIdeology: 'Federal Constitutional Republic',
    path: 'M 180,140 L 290,140 L 305,175 L 295,215 L 250,230 L 220,225 L 175,190 Z',
    cities: [
      { name: 'Washington, D.C.', type: 'capital', lat: 38.9, lng: -77.0, pop: '5.5M' },
      { name: 'New York', type: 'metro', lat: 40.7, lng: -74.0, pop: '19.5M' },
      { name: 'San Francisco (Silicon Bay)', type: 'metro', lat: 37.7, lng: -122.4, pop: '7.8M' }
    ],
    economicHubs: [
      { name: 'Wall St Financial Hub', resource: 'Global Capital', lat: 40.7, lng: -74.0 },
      { name: 'Midwest Industrial Belt', resource: 'Heavy Manufacturing & Agriculture', lat: 41.8, lng: -87.6 }
    ],
    techHubs: [
      { name: 'Silicon Valley Innovation Hub', field: 'Semiconductors & AI', lat: 37.4, lng: -122.0 },
      { name: 'MIT/Boston Bio-Tech Complex', field: 'Bio-engineering', lat: 42.3, lng: -71.0 }
    ]
  },
  {
    id: 'CAN',
    name: 'Dominion of Canada',
    shortName: 'Canada',
    continent: 'North America',
    region: 'North America',
    lat: 56.0,
    lng: -106.0,
    capital: 'Ottawa',
    populationEstimate: '40 Million',
    gdpIndex: 82,
    militaryIndex: 70,
    techIndex: 86,
    stability: 92,
    defaultIdeology: 'Parliamentary Democracy',
    path: 'M 150,60 L 285,60 L 320,105 L 290,140 L 180,140 L 140,110 Z',
    cities: [
      { name: 'Ottawa', type: 'capital', lat: 45.4, lng: -75.7, pop: '1.4M' },
      { name: 'Toronto', type: 'metro', lat: 43.6, lng: -79.3, pop: '6.3M' }
    ],
    economicHubs: [{ name: 'Alberta Energy Corridor', resource: 'Oil, Gas & Hydro', lat: 53.5, lng: -113.5 }],
    techHubs: [{ name: 'Waterloo Quantum Lab', field: 'Quantum Computing', lat: 43.4, lng: -80.5 }]
  },
  {
    id: 'MEX',
    name: 'United Mexican States',
    shortName: 'Mexico',
    continent: 'North America',
    region: 'Central America',
    lat: 23.0,
    lng: -102.0,
    capital: 'Mexico City',
    populationEstimate: '130 Million',
    gdpIndex: 74,
    militaryIndex: 65,
    techIndex: 72,
    stability: 74,
    defaultIdeology: 'Federal Republic',
    path: 'M 185,200 L 245,215 L 255,260 L 220,265 L 180,225 Z',
    cities: [{ name: 'Mexico City', type: 'capital', lat: 19.4, lng: -99.1, pop: '22M' }],
    economicHubs: [{ name: 'Monterrey Industrial Hub', resource: 'Steel & Advanced Auto', lat: 25.6, lng: -100.3 }],
    techHubs: [{ name: 'Guadalajara Software Cluster', field: 'Electronics', lat: 20.6, lng: -103.3 }]
  },

  // South America
  {
    id: 'BRA',
    name: 'Federative Republic of Brazil',
    shortName: 'Brazil',
    continent: 'South America',
    region: 'South America',
    lat: -14.0,
    lng: -52.0,
    capital: 'Brasília',
    populationEstimate: '215 Million',
    gdpIndex: 79,
    militaryIndex: 74,
    techIndex: 75,
    stability: 78,
    defaultIdeology: 'Democratic Federal Republic',
    path: 'M 290,280 L 365,280 L 390,340 L 350,400 L 310,360 L 285,310 Z',
    cities: [
      { name: 'Brasília', type: 'capital', lat: -15.7, lng: -47.9, pop: '4.8M' },
      { name: 'São Paulo', type: 'metro', lat: -23.5, lng: -46.6, pop: '22.5M' },
      { name: 'Rio de Janeiro', type: 'port', lat: -22.9, lng: -43.1, pop: '13.5M' }
    ],
    economicHubs: [{ name: 'Santos Maritime Port', resource: 'Agri-Commodities & Minerals', lat: -23.9, lng: -46.3 }],
    techHubs: [{ name: 'Campinas Tech Pole', field: 'Bio-fuels & Agri-tech', lat: -22.9, lng: -47.0 }]
  },
  {
    id: 'ARG',
    name: 'Argentine Republic',
    shortName: 'Argentina',
    continent: 'South America',
    region: 'South America',
    lat: -38.0,
    lng: -64.0,
    capital: 'Buenos Aires',
    populationEstimate: '46 Million',
    gdpIndex: 71,
    militaryIndex: 62,
    techIndex: 73,
    stability: 70,
    defaultIdeology: 'Federal Republic',
    path: 'M 305,370 L 345,370 L 335,460 L 305,460 Z',
    cities: [{ name: 'Buenos Aires', type: 'capital', lat: -34.6, lng: -58.3, pop: '15.3M' }],
    economicHubs: [{ name: 'Pampas Agro-Belt', resource: 'Grain & Livestock', lat: -35.0, lng: -60.0 }],
    techHubs: [{ name: 'Bariloche Nuclear Center', field: 'Nuclear Tech', lat: -41.1, lng: -71.3 }]
  },

  // Europe
  {
    id: 'GBR',
    name: 'United Kingdom / British Commonwealth',
    shortName: 'UK',
    continent: 'Europe',
    region: 'Western Europe',
    lat: 55.0,
    lng: -3.0,
    capital: 'London',
    populationEstimate: '68 Million',
    gdpIndex: 88,
    militaryIndex: 88,
    techIndex: 91,
    stability: 88,
    defaultIdeology: 'Constitutional Monarchy',
    path: 'M 470,105 L 490,105 L 490,135 L 470,135 Z',
    cities: [{ name: 'London', type: 'capital', lat: 51.5, lng: -0.1, pop: '9.6M' }],
    economicHubs: [{ name: 'City of London Financial Hub', resource: 'Global Banking', lat: 51.5, lng: -0.1 }],
    techHubs: [{ name: 'Silicon Fen Cambridge', field: 'AI & Biotech', lat: 52.2, lng: 0.1 }]
  },
  {
    id: 'DEU',
    name: 'Federal Republic of Germany / Central League',
    shortName: 'Germany',
    continent: 'Europe',
    region: 'Central Europe',
    lat: 51.0,
    lng: 10.0,
    capital: 'Berlin',
    populationEstimate: '84 Million',
    gdpIndex: 91,
    militaryIndex: 80,
    techIndex: 92,
    stability: 90,
    defaultIdeology: 'Federal Parliamentary Republic',
    path: 'M 515,115 L 545,115 L 545,145 L 515,145 Z',
    cities: [
      { name: 'Berlin', type: 'capital', lat: 52.5, lng: 13.4, pop: '3.8M' },
      { name: 'Frankfurt', type: 'metro', lat: 50.1, lng: 8.6, pop: '2.5M' },
      { name: 'Munich', type: 'metro', lat: 48.1, lng: 11.5, pop: '2.8M' }
    ],
    economicHubs: [{ name: 'Ruhr Industrial Corridor', resource: 'Advanced Precision Machinery', lat: 51.4, lng: 7.0 }],
    techHubs: [{ name: 'Munich Aerospace Cluster', field: 'Robotics & Automotive', lat: 48.1, lng: 11.5 }]
  },
  {
    id: 'FRA',
    name: 'French Republic',
    shortName: 'France',
    continent: 'Europe',
    region: 'Western Europe',
    lat: 46.0,
    lng: 2.0,
    capital: 'Paris',
    populationEstimate: '68 Million',
    gdpIndex: 87,
    militaryIndex: 87,
    techIndex: 89,
    stability: 86,
    defaultIdeology: 'Semi-Presidential Republic',
    path: 'M 490,130 L 525,130 L 520,165 L 485,165 Z',
    cities: [{ name: 'Paris', type: 'capital', lat: 48.8, lng: 2.3, pop: '11.1M' }],
    economicHubs: [{ name: 'Marseille Mediterranean Gateway', resource: 'Trade & Petrochemical', lat: 43.3, lng: 5.3 }],
    techHubs: [{ name: 'Toulouse Aerospace Valley', field: 'Aeronautics & Space', lat: 43.6, lng: 1.4 }]
  },
  {
    id: 'RUS',
    name: 'Russian Eurasian Federation',
    shortName: 'Russia',
    continent: 'Europe',
    region: 'Northern Eurasia',
    lat: 60.0,
    lng: 90.0,
    capital: 'Moscow',
    populationEstimate: '144 Million',
    gdpIndex: 80,
    militaryIndex: 93,
    techIndex: 82,
    stability: 72,
    defaultIdeology: 'Semi-Authoritarian Federation',
    path: 'M 560,70 L 820,70 L 890,110 L 820,150 L 680,140 L 560,115 Z',
    cities: [
      { name: 'Moscow', type: 'capital', lat: 55.7, lng: 37.6, pop: '13.1M' },
      { name: 'St. Petersburg', type: 'port', lat: 59.9, lng: 30.3, pop: '5.6M' },
      { name: 'Vladivostok', type: 'port', lat: 43.1, lng: 131.9, pop: '1.2M' }
    ],
    economicHubs: [{ name: 'Siberian Natural Gas & Rare Earths', resource: 'Energy & Heavy Minerals', lat: 61.0, lng: 73.0 }],
    techHubs: [{ name: 'Skolkovo Innovation Hub', field: 'Nuclear & Defense AI', lat: 55.7, lng: 37.3 }]
  },
  {
    id: 'TUR',
    name: 'Republic of Turkey / Anatolian State',
    shortName: 'Turkey',
    continent: 'Middle East',
    region: 'Eurasian Crossroads',
    lat: 39.0,
    lng: 35.0,
    capital: 'Ankara',
    populationEstimate: '86 Million',
    gdpIndex: 77,
    militaryIndex: 84,
    techIndex: 78,
    stability: 75,
    defaultIdeology: 'Presidential Republic',
    path: 'M 570,160 L 630,160 L 625,185 L 575,185 Z',
    cities: [
      { name: 'Ankara', type: 'capital', lat: 39.9, lng: 32.8, pop: '5.8M' },
      { name: 'Istanbul (Bosphorus Chokepoint)', type: 'port', lat: 41.0, lng: 28.9, pop: '16M' }
    ],
    economicHubs: [{ name: 'Bosphorus Maritime Strait', resource: 'Strategic Transit Control', lat: 41.0, lng: 29.0 }],
    techHubs: [{ name: 'Baykar Autonomous Tech Hub', field: 'Drone Aviation', lat: 41.1, lng: 28.8 }]
  },

  // Asia & Middle East
  {
    id: 'CHN',
    name: 'People’s Republic of China / Sinic Realm',
    shortName: 'China',
    continent: 'Asia',
    region: 'East Asia',
    lat: 35.0,
    lng: 104.0,
    capital: 'Beijing',
    populationEstimate: '1.41 Billion',
    gdpIndex: 95,
    militaryIndex: 94,
    techIndex: 94,
    stability: 86,
    defaultIdeology: 'State Socialist Technocracy',
    path: 'M 720,155 L 840,155 L 850,230 L 780,245 L 720,205 Z',
    cities: [
      { name: 'Beijing', type: 'capital', lat: 39.9, lng: 116.4, pop: '21.8M' },
      { name: 'Shanghai', type: 'port', lat: 31.2, lng: 121.4, pop: '28.5M' },
      { name: 'Shenzhen', type: 'tech', lat: 22.5, lng: 114.0, pop: '17.6M' }
    ],
    economicHubs: [
      { name: 'Yangtze River Megacity Cluster', resource: 'World Manufacturing Center', lat: 31.2, lng: 121.4 },
      { name: 'Pearl River Tech Belt', resource: 'Hardware Electronics', lat: 22.5, lng: 114.0 }
    ],
    techHubs: [
      { name: 'Shenzhen Quantum & Hardware Hub', field: 'Semiconductors & 6G', lat: 22.5, lng: 114.0 },
      { name: 'Hefei Fusion Energy Reactor', field: 'Fusion Power (EAST)', lat: 31.8, lng: 117.2 }
    ]
  },
  {
    id: 'IND',
    name: 'Republic of India / Bharat Union',
    shortName: 'India',
    continent: 'Asia',
    region: 'South Asia',
    lat: 21.0,
    lng: 79.0,
    capital: 'New Delhi',
    populationEstimate: '1.43 Billion',
    gdpIndex: 90,
    militaryIndex: 91,
    techIndex: 90,
    stability: 84,
    defaultIdeology: 'Federal Sovereign Republic',
    path: 'M 690,205 L 745,205 L 755,275 L 715,310 L 690,265 Z',
    cities: [
      { name: 'New Delhi', type: 'capital', lat: 28.6, lng: 77.2, pop: '33M' },
      { name: 'Mumbai', type: 'port', lat: 19.0, lng: 72.8, pop: '21.5M' },
      { name: 'Bengaluru (Silicon Plateau)', type: 'tech', lat: 12.9, lng: 77.5, pop: '14M' }
    ],
    economicHubs: [
      { name: 'Mumbai Financial Core & JNPT Port', resource: 'Capital Markets & Trade', lat: 19.0, lng: 72.8 },
      { name: 'Gujarat Petrochemical Complex', resource: 'Energy Refining & Solar', lat: 22.3, lng: 70.8 }
    ],
    techHubs: [
      { name: 'Bengaluru Silicon Ecosystem', field: 'Software, Aerospace & AI', lat: 12.9, lng: 77.5 },
      { name: 'Hyderabad Genome Valley', field: 'Pharma & Biotech', lat: 17.4, lng: 78.4 }
    ]
  },
  {
    id: 'JPN',
    name: 'State of Japan',
    shortName: 'Japan',
    continent: 'Asia',
    region: 'East Asia',
    lat: 36.0,
    lng: 138.0,
    capital: 'Tokyo',
    populationEstimate: '124 Million',
    gdpIndex: 89,
    militaryIndex: 82,
    techIndex: 93,
    stability: 94,
    defaultIdeology: 'Constitutional Monarchy',
    path: 'M 870,170 L 895,170 L 890,205 L 865,205 Z',
    cities: [
      { name: 'Tokyo', type: 'capital', lat: 35.6, lng: 139.7, pop: '37.4M' },
      { name: 'Osaka', type: 'metro', lat: 34.6, lng: 135.5, pop: '19.2M' }
    ],
    economicHubs: [{ name: 'Tokyo-Yokohama Keihin Industrial Port', resource: 'High-Tech Exports', lat: 35.4, lng: 139.6 }],
    techHubs: [{ name: 'Tsukuba Science City', field: 'Robotics, Materials & Optics', lat: 36.0, lng: 140.1 }]
  },
  {
    id: 'SAU',
    name: 'Kingdom of Saudi Arabia / Gulf Compact',
    shortName: 'Saudi Arabia',
    continent: 'Middle East',
    region: 'Middle East',
    lat: 24.0,
    lng: 45.0,
    capital: 'Riyadh',
    populationEstimate: '37 Million',
    gdpIndex: 83,
    militaryIndex: 82,
    techIndex: 80,
    stability: 82,
    defaultIdeology: 'Unitary Monarchy',
    path: 'M 605,200 L 660,200 L 650,245 L 610,245 Z',
    cities: [
      { name: 'Riyadh', type: 'capital', lat: 24.7, lng: 46.6, pop: '7.6M' },
      { name: 'Dubai', type: 'port', lat: 25.2, lng: 55.3, pop: '3.6M' }
    ],
    economicHubs: [{ name: 'Ghawar Oil Field & Petrochem Hub', resource: 'Global Hydrocarbons & Hydrogen', lat: 25.0, lng: 49.5 }],
    techHubs: [{ name: 'NEOM Future Systems Core', field: 'Green Hydrogen & Desalination', lat: 28.0, lng: 35.2 }]
  },

  // Africa
  {
    id: 'EGY',
    name: 'Arab Republic of Egypt',
    shortName: 'Egypt',
    continent: 'Africa',
    region: 'North Africa',
    lat: 26.0,
    lng: 30.0,
    capital: 'Cairo',
    populationEstimate: '110 Million',
    gdpIndex: 72,
    militaryIndex: 81,
    techIndex: 70,
    stability: 72,
    defaultIdeology: 'Semi-Presidential Republic',
    path: 'M 560,195 L 605,195 L 600,240 L 565,240 Z',
    cities: [{ name: 'Cairo (Suez Chokepoint)', type: 'capital', lat: 30.0, lng: 31.2, pop: '22M' }],
    economicHubs: [{ name: 'Suez Canal Strategic Corridor', resource: 'Global Shipping Chokepoint', lat: 30.5, lng: 32.3 }],
    techHubs: [{ name: 'Smart Village Cairo', field: 'Telecoms & Logistics', lat: 30.1, lng: 31.0 }]
  },
  {
    id: 'ZAF',
    name: 'Republic of South Africa',
    shortName: 'South Africa',
    continent: 'Africa',
    region: 'Southern Africa',
    lat: -30.0,
    lng: 25.0,
    capital: 'Pretoria',
    populationEstimate: '60 Million',
    gdpIndex: 73,
    militaryIndex: 68,
    techIndex: 72,
    stability: 74,
    defaultIdeology: 'Parliamentary Republic',
    path: 'M 545,395 L 595,395 L 585,450 L 540,450 Z',
    cities: [{ name: 'Johannesburg', type: 'metro', lat: -26.2, lng: 28.0, pop: '6M' }],
    economicHubs: [{ name: 'Witwatersrand Mining Basin', resource: 'Platinum, Gold & Rare Earths', lat: -26.2, lng: 27.9 }],
    techHubs: [{ name: 'Cape Town Silicon Cape', field: 'Fintech & Renewable Grids', lat: -33.9, lng: 18.4 }]
  },

  // Oceania
  {
    id: 'AUS',
    name: 'Commonwealth of Australia',
    shortName: 'Australia',
    continent: 'Oceania',
    region: 'Oceania',
    lat: -25.0,
    lng: 133.0,
    capital: 'Canberra',
    populationEstimate: '26 Million',
    gdpIndex: 85,
    militaryIndex: 79,
    techIndex: 88,
    stability: 95,
    defaultIdeology: 'Federal Parliamentary Democracy',
    path: 'M 820,335 L 935,335 L 930,420 L 825,415 Z',
    cities: [
      { name: 'Canberra', type: 'capital', lat: -35.2, lng: 149.1, pop: '0.45M' },
      { name: 'Sydney', type: 'port', lat: -33.8, lng: 151.2, pop: '5.4M' },
      { name: 'Melbourne', type: 'metro', lat: -37.8, lng: 144.9, pop: '5.1M' }
    ],
    economicHubs: [{ name: 'Pilbara Iron & Lithium Basin', resource: 'Critical Clean-Energy Minerals', lat: -21.0, lng: 119.0 }],
    techHubs: [{ name: 'Sydney Quantum Academy', field: 'Quantum Physics & Space Comms', lat: -33.8, lng: 151.1 }]
  }
];

// Strategic Maritime and Continental Trade Corridors
export const GLOBAL_TRADE_ROUTES: MapTradeRoute[] = [
  {
    id: 'tr_suez_malacca',
    name: 'Indo-Pacific Maritime Highway',
    category: 'maritime',
    startPoint: 'Rotterdam / London',
    endPoint: 'Shanghai / Tokyo',
    points: [[-0.1, 51.5], [5.3, 43.3], [32.3, 30.5], [55.3, 25.2], [72.8, 19.0], [103.8, 1.3], [121.4, 31.2], [139.7, 35.6]],
    volume: 'dominant',
    goods: 'Electronics, Oil, Manufactured Goods, Microchips'
  },
  {
    id: 'tr_transatlantic',
    name: 'Transatlantic Technology & Capital Corridor',
    category: 'maritime',
    startPoint: 'New York (USA)',
    endPoint: 'London / Frankfurt (Europe)',
    points: [[-74.0, 40.7], [-30.0, 48.0], [-0.1, 51.5], [8.6, 50.1]],
    volume: 'dominant',
    goods: 'High-Tech Machinery, Aviation Parts, Financial Instruments'
  },
  {
    id: 'tr_transpacific',
    name: 'Transpacific Mega-Vessel Highway',
    category: 'maritime',
    startPoint: 'Shenzhen / Shanghai',
    endPoint: 'San Francisco / Los Angeles',
    points: [[121.4, 31.2], [170.0, 35.0], [-140.0, 37.0], [-122.4, 37.7]],
    volume: 'dominant',
    goods: 'Consumer Hardware, Battery Packs, Precision Instruments'
  },
  {
    id: 'tr_silk_rail',
    name: 'Eurasian Continental Rail Corridor',
    category: 'continental',
    startPoint: 'Duisburg / Berlin',
    endPoint: 'Chongqing / Beijing',
    points: [[13.4, 52.5], [37.6, 55.7], [73.0, 61.0], [87.6, 43.8], [116.4, 39.9]],
    volume: 'high',
    goods: 'Automotive Sub-assemblies, High-Value Minerals, Express Cargo'
  }
];

// Strategic Conflict Flashpoints and Chokepoints
export const DEFAULT_CONFLICT_FLASHPOINTS: MapConflictZone[] = [
  {
    id: 'cf_taiwan_strait',
    name: 'Taiwan Strait Strategic Horizon',
    type: 'flashpoint',
    lat: 24.0,
    lng: 120.0,
    factions: ['CHN', 'USA', 'JPN'],
    risk: 'critical',
    descriptionHinglish: 'Duniya ke 60% advanced microchips yahan se aate hain. Is narrow sea zone mein US aur China ke beech military tension rehti hai.',
    descriptionEnglish: 'Global center of advanced semiconductor fabs and highest naval chokepoint tension.'
  },
  {
    id: 'cf_bosphorus',
    name: 'Bosphorus & Black Sea Passage',
    type: 'disputed',
    lat: 41.0,
    lng: 29.0,
    factions: ['TUR', 'RUS', 'DEU'],
    risk: 'high',
    descriptionHinglish: 'Black Sea aur Mediterranean ka ek lauta maritime door — yahan se oil aur wheat ka transport control hota hai.',
    descriptionEnglish: 'Crucial naval choke connecting the Black Sea to global trade routes.'
  },
  {
    id: 'cf_hormuz',
    name: 'Strait of Hormuz Energy Chokepoint',
    type: 'flashpoint',
    lat: 26.5,
    lng: 56.5,
    factions: ['SAU', 'USA', 'IND'],
    risk: 'critical',
    descriptionHinglish: 'Duniya ka 20% petroleum yahan ke 30-km narrow raste se guzarta hai. Yahan block hone se pure world ki energy prices skyrocket ho sakti hain.',
    descriptionEnglish: 'Critical petroleum transit corridor where 20% of world oil flows through a narrow maritime gap.'
  },
  {
    id: 'cf_malacca',
    name: 'Strait of Malacca Transit Spine',
    type: 'active',
    lat: 2.5,
    lng: 101.5,
    factions: ['IND', 'CHN', 'USA'],
    risk: 'high',
    descriptionHinglish: 'India aur Pacific Ocean ke beech ka main sea route — East Asia ki manufacturing industry is raste par 100% dependent hai.',
    descriptionEnglish: 'Primary shipping spine connecting the Indian and Pacific Oceans.'
  }
];

// Simulated Border Definition Helper
export interface SimulatedBorderFeature {
  id: string;
  countryName: string;
  originalCountryId: string;
  simulatedName: string;
  changeType: 'annexation' | 'independence' | 'confederation' | 'buffer_zone' | 'demilitarized';
  reasonHinglish: string;
  reasonEnglish: string;
  supportingAgents: string[];
  confidence: number;
  svgPathDivergent: string;
  lat: number;
  lng: number;
}
