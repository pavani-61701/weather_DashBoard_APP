export interface Polygon {
  id: string;
  name: string;
  coordinates: [number, number][];
  dataSource: string;
  color: string;
  createdAt: Date;
}

export interface DataSource {
  id: string;
  name: string;
  field: string;
  colorRules: ColorRule[];
}

export interface ColorRule {
  id: string;
  operator: '=' | '<' | '>' | '<=' | '>=';
  value: number;
  color: string;
  label: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}

export interface PolygonData {
  polygonId: string;
  value: number;
  timestamp: Date;
}