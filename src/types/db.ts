export interface Location {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  archived: boolean;
  types: string[];
  picture_url: string | null;
  user_id: string;
  latitude: number | null;
  longitude: number | null;
  default_board_id: string | null;
}

export interface Board {
  id: string;
  brand: string;
  model: string;
  length_inches: number;
  volume: number | null;
  description: string | null;
  fin_configurations: string[];
  picture_url: string | null;
  created_at: string;
  archived: boolean;
  user_id: string;
  default_fins_id: string | null;
}

export interface Fins {
  id: string;
  brand: string;
  model: string;
  setup: string;
  picture_url: string | null;
  created_at: string;
  archived: boolean;
  description: string | null;
  user_id: string;
}

export interface Session {
  id: string;
  date: string;
  location_id: string;
  board_id: string;
  fins_id: string;
  waves: string;
  notes: string;
  created_at: string;
  user_id: string;
  swell_height: number | null;
  swell_period: number | null;
  swell_direction: number | null;
  water_temp_c: number | null;
  // relation shapes from useSessions' SESSION_QUERY
  location: Pick<Location, 'id' | 'name' | 'latitude' | 'longitude'> | null;
  board: Pick<Board, 'id' | 'brand' | 'model' | 'length_inches'> | null;
  fins: Pick<Fins, 'id' | 'brand' | 'setup' | 'model'> | null;
}