
export interface Refuel {
  id?: number;
  date: number; // timestamp
  litres: number;
  pricePerLitre: number;
  totalCost: number;
  odometerKm?: number;
}

export interface Ride {
  id?: number;
  dateStart: number; // timestamp
  dateEnd: number; // timestamp
  distanceKm: number;
  fuelUsed: number;
  avgSpeedKmH: number;
  maxSpeedKmH: number;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  speed: number | null; // in meters/second
  accuracy: number;
  timestamp: number;
}
