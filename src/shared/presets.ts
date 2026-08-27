import { SimulationConfig, Simulation } from './types.ts';

export interface PresetScenario {
  id: string;
  title: string;
  tagline: string;
  description: string;
  startingYear: number;
  endYear: number;
  geographicScope: SimulationConfig['geographicScope'];
  keyPremise: string;
  divergencePoint: string;
  category: 'historical' | 'technological' | 'geopolitical' | 'speculative';
  tags: string[];
  mockSimulation?: Partial<Simulation>;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'no-world-wars',
    title: 'No World War I & No World War II',
    tagline: 'Imperial balance preserved, gradual decolonization & European dynastic rivalry',
    description: 'Archduke Franz Ferdinand survives the 1914 Sarajevo visit. The July Crisis is defused diplomatically through the Treaty of Vienna (1915). Without the cataclysms of 1914–1918 and 1939–1945, European empires, monarchies, and colonial networks evolve under prolonged diplomatic tension rather than sudden collapse.',
    startingYear: 1914,
    endYear: 2026,
    geographicScope: 'global',
    keyPremise: 'The assassination of Franz Ferdinand is foiled by local gendarmerie; European great powers manage crises via the Concert of Nations framework.',
    divergencePoint: 'June 28, 1914 - Sarajevo, Austro-Hungarian Empire',
    category: 'historical',
    tags: ['Empire Survival', 'No Fascism/Bolshevism', 'Industrial Coalitions', 'Steampunk/Early Atomic']
  },
  {
    id: 'roman-empire-1800',
    title: 'The Roman Empire Survives until 1800',
    tagline: 'Mediterranean Pax Romana meets the dawn of the Industrial Revolution',
    description: 'The Roman Empire enacts constitutional decentralization in the 3rd century, averting barbarian collapses and fragmentation. By the late 18th century, Roman water-mill engineering and Mediterranean road infrastructure spark an early steam-powered industrial boom centered in Alexandria, Rome, and Byzantium.',
    startingYear: 250,
    endYear: 1850,
    geographicScope: 'eurasia',
    keyPremise: 'Emperor Aurelian institutes a permanent federal senatorial council and codifies a standardized monetary and civil service system.',
    divergencePoint: '275 AD - Rome & Constantinople',
    category: 'historical',
    tags: ['Ancient World', 'Mediterranean Hegemony', 'Early Steam', 'Latin-Greek Lingua Franca']
  },
  {
    id: 'no-internet-distributed',
    title: 'The Internet was Never Invented',
    tagline: 'Decentralized tele-data networks, optical disc libraries & hyper-efficient print systems',
    description: 'ARPANET research is canceled following budget reallocations in 1969. Computing evolves toward ultra-powerful standalone mainframes, dedicated satellite data broadcasts, telex-based pneumatic logistics, and localized mesh radio networks rather than a unified global World Wide Web.',
    startingYear: 1969,
    endYear: 2026,
    geographicScope: 'global',
    keyPremise: 'US Department of Defense defunds packet-switching networking, investing instead into optical storage and isolated cybernetic mainframes.',
    divergencePoint: 'October 1969 - DARPA Computing Research Division, Arlington, VA',
    category: 'technological',
    tags: ['Cybernetics', 'Micro-Networks', 'Print Renaissance', 'Dedicated Mainframes']
  },
  {
    id: 'mars-landing-1975',
    title: 'Humans Land on Mars in 1975',
    tagline: 'Accelerated Cold War space race, nuclear thermal propulsion & permanent orbital colonies',
    description: 'The Apollo program is expanded tenfold following Soviet achievements with the N1 rocket. Project NERVA (Nuclear Engine for Rocket Vehicle Application) is prioritized with unlimited funding, leading to the joint American-Soviet Ares-1 landing in Valles Marineris in November 1975.',
    startingYear: 1968,
    endYear: 2026,
    geographicScope: 'global',
    keyPremise: 'Massive resource redirection into nuclear thermal rockets and closed-loop biosystems accelerates deep space colonization by 50 years.',
    divergencePoint: 'March 1968 - NASA & Soviet Space Commission',
    category: 'speculative',
    tags: ['Space Age', 'Nuclear Rockets', 'Martian Colonies', 'Geopolitical Detente']
  },
  {
    id: 'no-nuclear-weapons',
    title: 'Nuclear Fission Physics Blocked',
    tagline: 'A 20th century governed by massive conventional deterrence, orbital kinetic weapons, and chemical energy',
    description: 'Theoretical physics determines that sustained chain reactions in fissile isotopes are physically impossible due to prompt neutron absorption dynamics. The Cold War is contested through massive conventional armies, hyper-sonic artillery, synthetic fuels, and satellite kinetic weapons.',
    startingYear: 1938,
    endYear: 2026,
    geographicScope: 'global',
    keyPremise: 'Neutron capture physics renders self-sustaining atomic chain reactions unachievable under terrestrial physical laws.',
    divergencePoint: 'December 1938 - Berlin & Cambridge Laboratories',
    category: 'technological',
    tags: ['No Atomic Bomb', 'Large-Scale Conventional Armies', 'Geothermal Prowess', 'Proxy Fronts']
  },
  {
    id: 'ming-dynasty-industrial',
    title: '15th Century Chinese Industrial Revolution',
    tagline: 'Song-Ming blast furnaces ignite global trade dominance and eastern maritime supremacy',
    description: 'Emperor Yongle sustains Admiral Zheng He’s treasure voyages while state-chartered blast furnaces in Shanxi successfully scale coking coal metallurgy in 1430. China establishes a global maritime trading commonwealth 300 years before European industrialization.',
    startingYear: 1405,
    endYear: 1800,
    geographicScope: 'asia_pacific',
    keyPremise: 'The Ming court fully commercializes maritime expeditions and codifies patent protections for steam pump and smelting inventors.',
    divergencePoint: '1433 - Nanjing & Beijing Imperial Court',
    category: 'historical',
    tags: ['Maritime Silk Road', 'Sinosphere Hegemony', 'Early Metallurgy', 'Eastern Enlightenment']
  },
  {
    id: 'no-oil-discovery',
    title: 'Petroleum Replaced by Early Geothermal & Bio-Ethanol',
    tagline: 'Clean high-torque steam turbines, electric rail grids & solar-thermal chemistry',
    description: 'Crude petroleum deposits are geologically scarce and economically unviable. Modern industrial growth is powered by deep geothermal tap wells, high-capacity dry-cell batteries, electrified continental rail networks, and compressed hydrogen dirigibles.',
    startingYear: 1859,
    endYear: 2026,
    geographicScope: 'global',
    keyPremise: 'The 1859 Titusville Pennsylvania oil strike yields dry rock; chemistry pivots permanently toward bio-fuels and geothermal electricity.',
    divergencePoint: 'August 1859 - Titusville, Pennsylvania',
    category: 'technological',
    tags: ['Zero Fossil Oil', 'Geothermal Grid', 'Electric Rail Corridors', 'Hydrogen Airships']
  }
];
