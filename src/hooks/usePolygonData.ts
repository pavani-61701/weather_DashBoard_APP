import { useCallback, useEffect } from 'react';
import {
  calculatePolygonCentroid,
  fetchWeatherData,
  getAverageValueForTimeRange,
  getValueForTimestamp
} from '../services/weatherApi';
import { useAppStore } from '../store/useAppStore';
import { PolygonData } from '../types';
import { applyColorRules } from '../utils/colorUtils';

export const usePolygonData = () => {
  const {
    polygons,
    currentTime,
    timeRange,
    isRangeMode,
    dataSources,
    isEditingPolygon,      
    setPolygonData,
    setIsLoading,
    updatePolygonColor,
  } = useAppStore();

  const normalizeLongitude = (lon: number) => {
    let n = lon;
    while (n < -180) n += 360;
    while (n > 180) n -= 360;
    return n;
  };

  const updatePolygonColors = useCallback(async () => {
    if (polygons.length === 0) return;

    setIsLoading(true);
    const newData: PolygonData[] = [];

    try {
      for (const polygon of polygons) {
        let centroid = calculatePolygonCentroid(polygon.coordinates);
        centroid = [centroid[0], normalizeLongitude(centroid[1])];

        const selectedDate = isRangeMode ? timeRange.start : currentTime;
        if (selectedDate > new Date()) {
          console.warn('Future date selected – skipping');
          updatePolygonColor(polygon.id, '#592020');
          continue;
        }

        const source = dataSources.find(ds => ds.id === polygon.dataSource);
        if (!source) continue;

        const startDate = isRangeMode ? timeRange.start : currentTime;
        const endDate   = isRangeMode ? timeRange.end   : currentTime;

        const weatherData = await fetchWeatherData(
          centroid[0], centroid[1], startDate, endDate
        );

        let val: number | null;
        if (isRangeMode) {
          val = getAverageValueForTimeRange(weatherData, startDate, endDate);
        } else {
          const roundT = new Date(currentTime);
          roundT.setMinutes(0, 0, 0);
          val = getValueForTimestamp(weatherData, roundT);
        }

        if (typeof val === 'number' && !isNaN(val)) {
          const col = applyColorRules(val, source.colorRules);
          updatePolygonColor(polygon.id, col);
          newData.push({ polygonId: polygon.id, value: val, timestamp: currentTime });
        } else {
          updatePolygonColor(polygon.id, '#d9d9d9');
        }
      }

      setPolygonData(newData);
    } catch (err) {
      console.error('updatePolygonColors failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [polygons, currentTime, timeRange, isRangeMode, dataSources, setPolygonData, setIsLoading, updatePolygonColor]);

  
  useEffect(() => {
    if (polygons.length === 0) return;
    if (isEditingPolygon) return; // ⛔ pause auto refresh while editing

    const id = setTimeout(() => {
      updatePolygonColors();
    }, 2000);

    return () => clearTimeout(id);
  }, [polygons, currentTime, timeRange.start, timeRange.end, isRangeMode, isEditingPolygon]);

  return { updatePolygonColors };
};
