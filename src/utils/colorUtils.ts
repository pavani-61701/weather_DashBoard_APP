import { ColorRule } from '../types';

export const applyColorRules = (value: number, rules: ColorRule[]): string => {
  // Sort rules by value in descending order to apply highest threshold first
  const sortedRules = [...rules].sort((a, b) => b.value - a.value);
  
  for (const rule of sortedRules) {
    switch (rule.operator) {
      case '=':
        if (value === rule.value) return rule.color;
        break;
      case '<':
        if (value < rule.value) return rule.color;
        break;
      case '>':
        if (value > rule.value) return rule.color;
        break;
      case '<=':
        if (value <= rule.value) return rule.color;
        break;
      case '>=':
        if (value >= rule.value) return rule.color;
        break;
    }
  }
  
  // Default color if no rules match
  return '#d9d9d9';
};

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatTemperature = (value: number): string => {
  return `${value.toFixed(1)}°C`;
};