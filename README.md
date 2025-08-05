# Weather Data Dashboard

A modern React TypeScript dashboard for visualizing weather data over interactive maps with timeline controls and polygon-based analysis.

## 🚀 Live Demo

https://precious-semolina-7530c9.netlify.app


## Features

### Core Functionality
- **Timeline Slider**: Interactive hourly timeline with 30-day window (15 days before/after current date)
  - Single time selection mode
  - Dual-ended range selection mode
  - Visual timeline markers and smooth animations

- **Interactive Map**: Leaflet-based map with polygon drawing capabilities
  - Draw polygons with 3-12 points
  - Polygon persistence and management
  - Map center reset and navigation controls

- **Data Source Integration**: Real-time weather data from Open-Meteo API
  - Temperature data visualization
  - Customizable color coding rules
  - Dynamic polygon coloring based on data values

- **Polygon Management**: Full CRUD operations for map polygons
  - Create, name, and delete polygons
  - Automatic data association
  - Visual feedback and status indicators

### Advanced Features
- **Color Rule System**: Customizable threshold-based coloring
  - Multiple comparison operators (=, <, >, <=, >=)
  - Custom color assignments
  - Rule management interface

- **State Management**: Zustand-powered global state
  - Persistent polygon data
  - Timeline state synchronization
  - Real-time updates across components

- **Responsive Design**: Modern UI with Ant Design components
  - Professional dashboard layout
  - Mobile-friendly responsive design
  - Smooth animations and transitions

## Tech Stack

### Required Dependencies
- **React 18** with TypeScript
- **Zustand** for state management
- **Leaflet & React-Leaflet** for mapping
- **Ant Design** for UI components
- **Axios** for API requests
- **date-fns** for date manipulation
- **rc-slider** for timeline controls

### APIs Used
- **Open-Meteo Archive API**: Historical weather data
  - Endpoint: `https://archive-api.open-meteo.com/v1/archive`
  - No API key required
  - Hourly temperature data

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/pavani-61701/weather_DashBoard_APP.git
cd weather_DashBoard_APP
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
No environment variables or API keys are required. The application uses the free Open-Meteo API which doesn't require authentication.

### 4. Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
```

### 6. Preview Production Build
```bash
npm run preview
```

## Usage Guide

### 1. Timeline Control
- Use the toggle switch to choose between single time or range selection modes
- Drag the slider handle(s) to select desired time periods
- Use "Next Hour" button for step-by-step navigation
- Click "Reset to Now" to return to current time

### 2. Drawing and editing Polygons
1. Click "Draw Polygon" button to start drawing mode
2. Click on the map to add points (minimum 3, maximum 12)
3. Click "Finish Polygon" when done adding points
4. Enter a name for your polygon in the modal
5. The polygon will be automatically colored based on current data source rules
6. Rename and delete polygons if required.
   

### 3. Managing Color Rules
1. In the sidebar, click "Add Rule" to create new color thresholds
2. Set comparison operator (=, <, >, <=, >=)
3. Enter threshold value
4. Choose color and label
5. Rules are applied automatically to all polygons

### 4. Data Visualization
- Polygons are automatically colored based on weather data at their location
- If the data received from API is null or if user selects a future date and time the polygon will be highlighted in black.
- Colors update dynamically when timeline changes
- Click polygons to delete them (with confirmation)

## API Integration Details

### Open-Meteo API
The application fetches historical weather data using the Open-Meteo Archive API:

**Endpoint Pattern:**
```
https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lng}&start_date={start}&end_date={end}&hourly=temperature_2m&timezone=auto
```

**Features:**
- No rate limiting for reasonable usage
- No API key required
- Historical data available from 1940 onwards
- Hourly resolution
- Global coverage

**Data Processing:**
- Polygon centroids are calculated for API requests
- Single time mode: Direct value lookup
- Range mode: Average calculation across time window
- Automatic error handling and fallbacks

## Development Notes

### Architecture Decisions
- **Zustand Store**: Chosen for simplicity and TypeScript support
- **Leaflet**: Selected for robust mapping features and polygon support
- **Ant Design**: Provides consistent, professional UI components
- **File Organization**: Modular structure with clear separation of concerns

### Performance Optimizations
- API call debouncing (3000ms) to prevent excessive requests
- Efficient polygon centroid calculations
- Memoized timeline markers
- Optimized re-renders with proper dependency arrays

### Error Handling
- Graceful API failure handling
- User feedback for all actions
- Input validation for polygon creation
- Network error recovery

## Project Structure

```
src/
├── components/           # React components
│   ├── TimelineSlider.tsx
│   ├── MapComponent.tsx
│   └── DataSourceSidebar.tsx
├── hooks/               # Custom React hooks
│   └── usePolygonData.ts
├── services/            # API integration
│   └── weatherApi.ts
├── store/               # Zustand store
│   └── useAppStore.ts
├── types/               # TypeScript definitions
│   └── index.ts
├── utils/               # Utility functions
│   └── colorUtils.ts
└── App.tsx              # Main application component
```

## Future Enhancements

### Potential Features
- Additional weather parameters (humidity, pressure, wind)
- Data export functionality
- Polygon shape editing capabilities
- Multi-layer data visualization
- Historical data comparison
- Custom map tile layers

### Performance Improvements
- Data caching implementation
- Virtual scrolling for large datasets
- Web worker integration for heavy calculations
- Progressive data loading

## Troubleshooting

### Common Issues

**Map not loading:**
- Check internet connection
- Verify OpenStreetMap tiles are accessible
- Clear browser cache

**API errors:**
- Ensure coordinates are within valid ranges (-90 to 90 lat, -180 to 180 lng)
- Check if dates are within API's supported range
- Verify network connectivity

**Performance issues:**
- Reduce number of active polygons
- Use shorter time ranges for better response times
- Clear browser data if experiencing memory issues

