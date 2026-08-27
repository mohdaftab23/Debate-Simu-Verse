// Instant zero-API Hinglish & simplicity translation dictionary, agent personas, and term explainers

export interface TermDefinition {
  term: string;
  simpleMeaning: string;
  hinglishMeaning: string;
  category: 'geopolitics' | 'science' | 'economics' | 'theory';
}

export const TECHNICAL_TERMS_DICTIONARY: Record<string, TermDefinition> = {
  counterfactual: {
    term: 'Counterfactual',
    simpleMeaning: 'A hypothetical "what-if" scenario imagining how history would change if an event happened differently.',
    hinglishMeaning: 'Jo actually hua nahi, but hum imagine karke dekh rahe hain ki agar aisa hota toh kya badalta.',
    category: 'theory'
  },
  causal_chain: {
    term: 'Causal Chain',
    simpleMeaning: 'A domino effect where one event directly triggers the next event over time.',
    hinglishMeaning: 'Ek event se doosra event, phir usse teesra event — jaise domino effect.',
    category: 'theory'
  },
  demographic_shift: {
    term: 'Demographic Shift',
    simpleMeaning: 'Changes in the size, age distribution, or location of a human population.',
    hinglishMeaning: 'Population ka size, age, ya rehne ki jagah mein bada badlaav.',
    category: 'science'
  },
  economic_bloc: {
    term: 'Economic Bloc',
    simpleMeaning: 'A coalition of countries with preferential trade rules, common tariffs, and economic pacts.',
    hinglishMeaning: 'Countries ka ek group jo aapas mein trade aur economy ko boost karne ke liye milkar kaam karta hai.',
    category: 'economics'
  },
  strategic_chokepoint: {
    term: 'Strategic Chokepoint',
    simpleMeaning: 'A narrow, critical geographic passageway (strait or canal) controlling global trade or naval transit.',
    hinglishMeaning: 'Aisa important rasta ya location jahan se trade ya military movement control ho sakta hai (jaise narrow sea canals).',
    category: 'geopolitics'
  },
  geopolitical_bloc: {
    term: 'Geopolitical Bloc',
    simpleMeaning: 'A group of nations bound together by military defense pacts and political alliances.',
    hinglishMeaning: 'Countries ka ek group jo ek doosre ke saath strategically aur security ke liye kaam karta hai.',
    category: 'geopolitics'
  },
  path_dependence: {
    term: 'Path Dependence',
    simpleMeaning: 'When early historical events lock a society or technology into a specific trajectory.',
    hinglishMeaning: 'Ek baar kisi country ya tech ne ek rasta pakad liya, toh future growth usi direction mein lock ho jaati hai.',
    category: 'theory'
  },
  hegemony: {
    term: 'Hegemony / Dominance',
    simpleMeaning: 'Dominant leadership or total authority by one superpower over other nations.',
    hinglishMeaning: 'Jab ek superpower country ka pure world ya region par sabse zyada control aur dabdaba ho.',
    category: 'geopolitics'
  },
  thermodynamic_efficiency: {
    term: 'Thermodynamic Limit',
    simpleMeaning: 'The fundamental physical laws limiting how much useful work or energy can be extracted.',
    hinglishMeaning: 'Physics ke basic rules jo decide karte hain ki kisi energy source se kitna maximum power mil sakta hai.',
    category: 'science'
  },
  flashpoint: {
    term: 'Flashpoint',
    simpleMeaning: 'A high-tension border or region where small sparks could ignite a major war.',
    hinglishMeaning: 'Aisi sensitive jagah jahan thodi si bhi misunderstanding se bada war ya conflict start ho sakta hai.',
    category: 'geopolitics'
  }
};

// Agent introductory statements in easy, friendly Hinglish
export const AGENT_HINGLISH_INTROS: Record<string, { intro: string; tagline: string; roleSimple: string }> = {
  historian: {
    roleSimple: 'Itihaas & Events Expert',
    tagline: 'History & Timeline Specialist',
    intro: 'Main history ke angle se dekhoonga — kya badalta, kya same rehta, aur ek event ke baad doosre events kaise change hote.'
  },
  economist: {
    roleSimple: 'Economy & Trade Modeler',
    tagline: 'Paisa, Factory & Trade Specialist',
    intro: 'Main dekhoonga ki paisa, factories, trade routes aur resources kaise circulate honge aur kaunse desh ameer ya gareeb banenge.'
  },
  geopolitician: {
    roleSimple: 'World Politics & War Specialist',
    tagline: 'Alliances & Country Borders',
    intro: 'Mera focus world powers, military alliances, borders aur disputes par hoga — kaun kiske saath deal karega aur kahan fight hogi.'
  },
  futurist: {
    roleSimple: 'Science & Society Visionary',
    tagline: 'Tech Trees & Long-term Shifts',
    intro: 'Main dekhoonga ki nayi technologies kaise invent hongi, society ka culture kaise badlega aur 100 saal baad duniya kaisi dikhegi.'
  },
  physicist: {
    roleSimple: 'Physics & Energy Analyst',
    tagline: 'Physical Laws & Energy Limits',
    intro: 'Main physics ke hard rules enforce karunga — machine aur energy waqai kaam karegi ya physically impossible hai.'
  },
  biologist: {
    roleSimple: 'Biology & Evolution Specialist',
    tagline: 'Body Evolution & Environment',
    intro: 'Main biologically check karunga ki human body aur environment is naye world mein kaise adapt karenge.'
  },
  psychologist: {
    roleSimple: 'Human Mind & Behavior Expert',
    tagline: 'Thinking & Social Psychology',
    intro: 'Main insani dimag aur behavior ko dekhoonga — log kaise react karenge, dar kya hoga aur belief systems kaise banenge.'
  },
  climate_scientist: {
    roleSimple: 'Mausam & Ocean Modeler',
    tagline: 'Climate & Planetary Systems',
    intro: 'Main weather, ocean currents aur global temperature ke shifts ko analyze karunga.'
  },
  engineer: {
    roleSimple: 'Machines & Structure Architect',
    tagline: 'Buildings, Power & Tech Build',
    intro: 'Main check karunga ki factories, bridges aur power grids technically kaise banenge aur kitna load jhel payenge.'
  },
  military_strategist: {
    roleSimple: 'Military Strategy & Defense',
    tagline: 'Troops, Tactics & Power Balance',
    intro: 'Main military tactics, weapons aur defence strategies ko test karunga ki kaunsi fauj jeetegi.'
  },
  political_scientist: {
    roleSimple: 'Government & Law Systems',
    tagline: 'Constitution & State Power',
    intro: 'Main governance, laws aur political parties ke power dynamics ko track karunga.'
  },
  sociologist: {
    roleSimple: 'Society & Culture Expert',
    tagline: 'Classes, Families & Traditions',
    intro: 'Main dekhunga ki aam logon ki daily life, family system aur social classes kaise evolve hongi.'
  }
};

// UI Control Tooltips in Easy Hinglish & English
export const CONTROL_TOOLTIPS = {
  rigor: {
    title: 'Simulation Rigor',
    hinglish: 'AI kitna strict realism follow karega — kya bilkul solid logic chahiye ya thoda flexible.',
    english: 'Controls how strictly the model obeys real-world scientific & historical invariants.'
  },
  creativity: {
    title: 'Creativity / Idea Space',
    hinglish: 'AI kitne unusual but possible ideas explore karega.',
    english: 'How boldly the experts explore unexpected but causally coherent outcomes.'
  },
  rounds: {
    title: 'Debate Rounds',
    hinglish: 'Experts kitni baar ek doosre ki theories ko challenge karenge.',
    english: 'Number of iterative dialectic challenge & defense cycles between experts.'
  },
  horizon: {
    title: 'Simulation Horizon',
    hinglish: 'Kitne saal tak alternate world ko simulate karke aage badhana hai.',
    english: 'The target destination year for the simulated timeline.'
  },
  scope: {
    title: 'Geographic Scope',
    hinglish: 'World ke kis area par main focus rakhna hai.',
    english: 'The primary geographic or domain theater for analysis.'
  },
  communication: {
    title: 'Communication Mode',
    hinglish: 'Language ka level — Hinglish (aam bolchaal), Simple English, ya Academic Expert.',
    english: 'The linguistic style used by the AI models during debate and final dossiers.'
  }
};

// Instant Zero-API Local Text Simplifier / Hinglish Explainer
export function explainSimplyLocal(text: string, isHinglish: boolean = true): string {
  if (!text) return 'Explanation unavailable.';

  // Quick patterns for common statements
  const clean = text.trim();

  if (isHinglish) {
    if (clean.toLowerCase().includes('christian') || clean.toLowerCase().includes('religion') || clean.toLowerCase().includes('rome')) {
      return 'Agar religious aur cultural system badalta hai, toh kings aur governments ko apni power justify karne ke liye doosre systems par rely karna padta. Education aur science ka track bhi bilkul alag ho jata.';
    }
    if (clean.toLowerCase().includes('water') || clean.toLowerCase().includes('ocean') || clean.toLowerCase().includes('sonar')) {
      return 'Pani ke andar aag (fire) nahi jal sakti, isliye human civilization ne electricity, sonar aur deep-sea hydrothermal vents se energy banana shuru kiya. Cities deep ocean trenches mein bani.';
    }
    if (clean.toLowerCase().includes('mars') || clean.toLowerCase().includes('gravity') || clean.toLowerCase().includes('moon')) {
      return 'Kam gravity ki wajah se buildings bohot oonchi bani aur atmospheric pressure maintain karne ke liye log deep underground canyons aur biosphere domes mein settle hue.';
    }
    if (clean.toLowerCase().includes('trade') || clean.toLowerCase().includes('economic') || clean.toLowerCase().includes('gdp')) {
      return 'Naye trade routes aur resources ki wajah se paisa aur factories un deshon mein shift ho gaye jinke paas raw materials aur shipping routes the.';
    }
    if (clean.toLowerCase().includes('alliance') || clean.toLowerCase().includes('war') || clean.toLowerCase().includes('conflict')) {
      return 'Jab do bade countries ke beech competition badha, toh unhone smaller deshon ke saath milkar military pacts banaye taaki ek doosre par dabdaba bana rahe.';
    }
    return `Aasan shabdon mein: "${clean.slice(0, 140)}..." iska matlab hai ki history ka ek bada decision change hone se pure system ka balance naye tareeqe se settle hua.`;
  }

  return `In simple terms: An early shift in historical conditions changed the balance of power, leading to new alliances, trade patterns, and technological developments over time.`;
}

// Convert complicated English text into conversational Hinglish if needed
export function toConversationalHinglish(text: string): string {
  if (!text) return '';
  let res = text;
  
  // Clean academic headers if present
  res = res.replace(/Furthermore,\s*/gi, 'Aur iske saath hi, ');
  res = res.replace(/Consequently,\s*/gi, 'Iska nateeja ye hua ki ');
  res = res.replace(/In summary,\s*/gi, 'Simple shabdon mein, ');
  res = res.replace(/Nevertheless,\s*/gi, 'Lekin fir bhi, ');
  
  return res;
}
