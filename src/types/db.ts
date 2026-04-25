export interface Location {
  id: string;
  name: string;
  description: string;
  created_at: string;
  archived: boolean;
  types: string[];
  picture_url: string;
  user_id: string;
  latitude: number | null;
  longitude: number | null;
  default_board_id: string | null;
}