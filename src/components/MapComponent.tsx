

import { CompassOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Input, Modal, Space, message } from 'antd';
import L, { LatLng, LeafletMouseEvent } from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import { FeatureGroup, MapContainer, Polygon, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

import { useAppStore } from '../store/useAppStore';
import { generateUniqueId } from '../utils/colorUtils';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DrawingHandlerProps {
  isDrawing: boolean;
  onAddPoint: (latlng: LatLng) => void;
}

const DrawingHandler: React.FC<DrawingHandlerProps> = ({ isDrawing, onAddPoint }) => {
  useMapEvents({
    click: (e: LeafletMouseEvent) => {
      if (isDrawing) onAddPoint(e.latlng);
    },
  });
  return null;
};

const MapController: React.FC = () => {
  const map = useMap();
  const { mapCenter, mapZoom, setMapCenter, setMapZoom } = useAppStore();

  useEffect(() => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    if (center.lat !== mapCenter[0] || center.lng !== mapCenter[1] || zoom !== mapZoom) {
      map.setView(mapCenter, mapZoom);
    }
  }, [mapCenter, mapZoom]);

  useEffect(() => {
    const handle = () => {
      const c = map.getCenter();
      const z = map.getZoom();
      if (c.lat !== mapCenter[0] || c.lng !== mapCenter[1] || z !== mapZoom) {
        setMapCenter([c.lat, c.lng]);
        setMapZoom(z);
      }
    };
    map.on('moveend zoomend', handle);
    return () => {
      map.off('moveend zoomend', handle);
    };
  }, [mapCenter, mapZoom, map]);

  return null;
};

const MapComponent: React.FC = () => {
  const {
    polygons,
    isDrawing,
    selectedDataSourceId,
    dataSources,
    mapCenter,
    mapZoom,
    addPolygon,
    removePolygon,
    updatePolygonCoordinates,
    setIsDrawing,
    setMapCenter,
    setIsEditingPolygon,
  } = useAppStore();

  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const [drawingPoints, setDrawingPoints] = useState<LatLng[]>([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [polygonName, setPolygonName] = useState('');

  const currentDataSource = dataSources.find((ds) => ds.id === selectedDataSourceId);

  const handleAddPoint = (latlng: LatLng) => {
    const pts = [...drawingPoints, latlng];
    if (pts.length > 12) {
      message.warning('Max 12 points allowed');
      return;
    }
    setDrawingPoints(pts);
  };

  const handleSavePolygon = () => {
    if (drawingPoints.length < 3) {
      message.error('Minimum 3 points required');
      return;
    }
    if (!polygonName.trim()) {
      message.error('Enter a name');
      return;
    }
    const coords: [number, number][] = drawingPoints.map((p) => [p.lat, p.lng]);
    addPolygon({
      id: generateUniqueId(),
      name: polygonName.trim(),
      coordinates: coords,
      dataSource: selectedDataSourceId,
      color: currentDataSource?.colorRules[0]?.color || '#1890ff',
      createdAt: new Date(),
    });
    setIsDrawing(false);
    setDrawingPoints([]);
    setPolygonName('');
    setShowNameModal(false);
  };

  const resetMapCenter = () => {
    setMapCenter([52.52, 13.405]);
    message.info('Map centered to Berlin');
  };

  return (
    <Card className="h-full shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Space>
            <Button
              type="primary"
              danger={isDrawing}
              icon={<CompassOutlined />}
              onClick={
                isDrawing
                  ? () => setIsDrawing(false)
                  : () => {
                      setDrawingPoints([]);
                      setIsDrawing(true);
                    }
              }
              disabled={!currentDataSource}
            >
              {isDrawing ? 'Cancel Drawing' : 'Draw Polygon'}
            </Button>

            {isDrawing && drawingPoints.length >= 3 && (
              <Button onClick={() => setShowNameModal(true)}>
                Finish ({drawingPoints.length})
              </Button>
            )}

            <Button icon={<ReloadOutlined />} onClick={resetMapCenter}>
              Reset Center
            </Button>
          </Space>
          <div>Polygons: {polygons.length}</div>
        </div>

        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: 500 }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <MapController />
          <DrawingHandler isDrawing={isDrawing} onAddPoint={handleAddPoint} />

          <FeatureGroup ref={featureGroupRef}>
            {/* Only render EditControl when ref is attached */}
            {featureGroupRef.current && (
              <EditControl
                position="topright"
                featureGroup={featureGroupRef.current}
                onEditStart={() => setIsEditingPolygon(true)}
                onEditStop={() => setIsEditingPolygon(false)}
                onEdited={(e) => {
                  e.layers.eachLayer((layer: any) => {
                    const id = layer.options.id;
                    const coords = layer.getLatLngs()[0].map((pt: any) => [pt.lat, pt.lng]);
                    updatePolygonCoordinates(id, coords);
                  });
                }}
                draw={{
                  polygon: false,
                  polyline: false,
                  rectangle: false,
                  circle: false,
                  marker: false,
                  circlemarker: false,
                }}
              />
            )}

            {polygons.map((poly) => (
              // @ts-ignore
              <Polygon
                key={poly.id}
                positions={poly.coordinates}
                options={{ id: poly.id }}
                pathOptions={{
                  color: poly.color,
                  fillColor: poly.color,
                  fillOpacity: 0.4,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => {
                    Modal.confirm({
                      title: `Delete "${poly.name}"?`,
                      onOk: () => removePolygon(poly.id),
                    });
                  },
                }}
              />
            ))}
          </FeatureGroup>

          {isDrawing && drawingPoints.length >= 3 && (
            <Polygon
              positions={drawingPoints.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: '#ff4d4f',
                fillColor: '#ff4d4f',
                fillOpacity: 0.2,
                weight: 2,
                dashArray: '5,5',
              }}
            />
          )}
        </MapContainer>

        <Modal
          title="Polygon Name"
          open={showNameModal}
          onOk={handleSavePolygon}
          onCancel={() => setShowNameModal(false)}
        >
          <Input value={polygonName} onChange={(e) => setPolygonName(e.target.value)} />
        </Modal>
      </div>
    </Card>
  );
};

export default MapComponent;
