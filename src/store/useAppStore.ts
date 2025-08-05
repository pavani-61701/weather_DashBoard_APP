
import { addHours } from 'date-fns';
import { create } from 'zustand';
import { DataSource, Polygon, PolygonData, TimeRange } from '../types';

interface AppState {
  // Timeline state
  currentTime: Date;
  timeRange: TimeRange;
  isRangeMode: boolean;

  // Map state
  mapCenter: [number, number];
  mapZoom: number;

  // Polygon state
  polygons: Polygon[];
  isDrawing: boolean;
  selectedPolygonId: string | null;

  // Data source state
  dataSources: DataSource[];
  selectedDataSourceId: string;

  // Data state
  polygonData: PolygonData[];
  isLoading: boolean;

  // NEW: flag to pause fetching during editing
  isEditingPolygon: boolean;
  setIsEditingPolygon: (f: boolean) => void;

  // Actions
  setCurrentTime: (time: Date) => void;
  setTimeRange: (range: TimeRange) => void;
  setRangeMode: (isRange: boolean) => void;
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  addPolygon: (polygon: Polygon) => void;
  removePolygon: (id: string) => void;
  renamePolygon: (id: string, newName: string) => void;
  updatePolygonColor: (id: string, color: string) => void;
  updatePolygonCoordinates: (id: string, coords: [number, number][]) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setSelectedPolygonId: (id: string | null) => void;
  updateDataSource: (dataSource: DataSource) => void;
  setSelectedDataSourceId: (id: string) => void;
  setPolygonData: (data: PolygonData[]) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const now = new Date();
const defaultDataSource: DataSource = {
  id: 'open-meteo-temp',
  name: 'Temperature (°C)',
  field: 'temperature_2m',
  colorRules: [
    { id: '4', operator: '>=', value: 30, color: '#ff4d4f', label: 'Above 30°C' },
    { id: '3', operator: '>=', value: 20, color: '#faad14', label: '20-30°C' },
    { id: '2', operator: '>=', value: 0, color: '#52c41a', label: '0-20°C' },
    { id: '1', operator: '<', value: 0, color: '#1890ff', label: 'Below 0°C' },
  ],
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentTime: now,
  timeRange: { start: now, end: addHours(now, 1) },
  isRangeMode: false,
  mapCenter: [52.52, 13.405],
  mapZoom: 10,
  polygons: [],
  isDrawing: false,
  selectedPolygonId: null,
  dataSources: [defaultDataSource],
  selectedDataSourceId: defaultDataSource.id,
  polygonData: [],
  isLoading: false,

  // NEW
  isEditingPolygon: false,
  setIsEditingPolygon: (flag) => set({ isEditingPolygon: flag }),

  // Actions
  setCurrentTime: (time) => set({ currentTime: time }),
  setTimeRange: (range) => set({ timeRange: range }),
  setRangeMode: (isRange) => set({ isRangeMode: isRange }),
  setMapCenter: (c) => set({ mapCenter: c }),
  setMapZoom: (z) => set({ mapZoom: z }),

  addPolygon: (p) => set((st) => ({ polygons: [...st.polygons, p] })),

  removePolygon: (id) => set((st) => ({
    polygons: st.polygons.filter((p) => p.id !== id),
    selectedPolygonId: st.selectedPolygonId === id ? null : st.selectedPolygonId,
  })),

  renamePolygon: (id, name) => set((st) => ({
    polygons: st.polygons.map((p) => (p.id === id ? { ...p, name } : p)),
  })),

  updatePolygonColor: (id, color) => set((st) => ({
    polygons: st.polygons.map((p) => (p.id === id ? { ...p, color } : p)),
  })),

  updatePolygonCoordinates: (id, coords) => set((st) => ({
    polygons: st.polygons.map((p) =>
      p.id === id ? { ...p, coordinates: coords } : p
    ),
  })),

  setIsDrawing: (d) => set({ isDrawing: d }),
  setSelectedPolygonId: (id) => set({ selectedPolygonId: id }),

  updateDataSource: (dataSource) =>
    set((st) => ({
      dataSources: st.dataSources.map((ds) =>
        ds.id === dataSource.id ? dataSource : ds
      ),
    })),

  setSelectedDataSourceId: (id) => set({ selectedDataSourceId: id }),
  setPolygonData: (d) => set({ polygonData: d }),
  setIsLoading: (b) => set({ isLoading: b }),
}));
