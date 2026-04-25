export const WAVE_SIZES = ['1-2', '1-3', '2-3', '2-4', '3-4', '3-5', '4-5', '4-6', '4-7', '5-7+'] as const;
export type WaveSize = typeof WAVE_SIZES[number];

export const FIN_SETUPS = ['Single', 'Twin', 'Thruster', 'Quad'] as const;
export type FinSetup = typeof FIN_SETUPS[number];
export const FIN_CONFIGS = FIN_SETUPS; // For board fin_configurations multi-select
export type FinConfig = FinSetup;

export const LOCATION_TYPES = ['Beach Break', 'Point Break', 'Reef', 'Wave Pool'] as const;
export type LocationType = typeof LOCATION_TYPES[number];
export const LOCATION_TYPE_COLORS: Record<LocationType, string> = {
  'Beach Break': 'text-neon-cyan border-neon-cyan/40',
  'Point Break': 'text-neon-yellow border-neon-yellow/40',
  'Reef': 'text-neon-pink border-neon-pink/40',
  'Wave Pool': 'text-neon-purple border-neon-purple/40',
};

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;




