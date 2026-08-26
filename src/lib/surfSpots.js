/**
 * Curated well-known California spots for the Explore section of the
 * Forecast tab. Coordinates are approximate (nearest ocean point) — the
 * Open-Meteo marine grid is ~5km, so lineup-level precision doesn't matter.
 * `faces` is the compass direction the beach faces, used for
 * offshore/onshore wind judgment.
 */
export const SURF_REGIONS = [
  {
    name: 'San Diego',
    spots: [
      { name: 'Blacks Beach', latitude: 32.8785, longitude: -117.2530, faces: 260 },
      { name: 'Scripps Pier', latitude: 32.8663, longitude: -117.2570, faces: 265 },
      { name: 'Windansea', latitude: 32.8339, longitude: -117.2822, faces: 260 },
      { name: 'Pacific Beach', latitude: 32.7944, longitude: -117.2560, faces: 255 },
      { name: 'Ocean Beach', latitude: 32.7473, longitude: -117.2540, faces: 250 },
      { name: 'Sunset Cliffs', latitude: 32.7157, longitude: -117.2557, faces: 245 },
    ],
  },
  {
    name: 'SD North County',
    spots: [
      { name: "Swami's", latitude: 33.0343, longitude: -117.2960, faces: 240 },
      { name: 'Cardiff Reef', latitude: 33.0142, longitude: -117.2810, faces: 240 },
      { name: 'Ponto', latitude: 33.0730, longitude: -117.3100, faces: 250 },
      { name: 'Oceanside Pier', latitude: 33.1930, longitude: -117.3860, faces: 250 },
    ],
  },
  {
    name: 'Orange County',
    spots: [
      { name: 'Lower Trestles', latitude: 33.3823, longitude: -117.5890, faces: 210 },
      { name: "San Onofre (Old Man's)", latitude: 33.3720, longitude: -117.5680, faces: 220 },
      { name: 'T-Street', latitude: 33.4180, longitude: -117.6190, faces: 220 },
      { name: 'Salt Creek', latitude: 33.4760, longitude: -117.7250, faces: 210 },
      { name: 'The Wedge', latitude: 33.5934, longitude: -117.8823, faces: 170 },
      { name: 'Huntington Pier', latitude: 33.6553, longitude: -118.0032, faces: 215 },
    ],
  },
  {
    name: 'Los Angeles',
    spots: [
      { name: 'Malibu (First Point)', latitude: 34.0330, longitude: -118.6770, faces: 165 },
      { name: 'Topanga', latitude: 34.0384, longitude: -118.5830, faces: 190 },
      { name: 'El Porto', latitude: 33.9020, longitude: -118.4230, faces: 250 },
      { name: 'Zuma', latitude: 34.0080, longitude: -118.8200, faces: 215 },
      { name: 'County Line', latitude: 34.0510, longitude: -118.9630, faces: 200 },
    ],
  },
  {
    name: 'Ventura / Santa Barbara',
    spots: [
      { name: 'Rincon', latitude: 34.3728, longitude: -119.4770, faces: 200 },
      { name: 'C Street (Surfers Point)', latitude: 34.2755, longitude: -119.3050, faces: 200 },
    ],
  },
  {
    name: 'Santa Cruz / NorCal',
    spots: [
      { name: 'Steamer Lane', latitude: 36.9515, longitude: -122.0260, faces: 160 },
      { name: 'Pleasure Point', latitude: 36.9540, longitude: -121.9660, faces: 175 },
      { name: 'Ocean Beach SF', latitude: 37.7599, longitude: -122.5109, faces: 265 },
      { name: 'Mavericks', latitude: 37.4936, longitude: -122.5010, faces: 240 },
    ],
  },
]
