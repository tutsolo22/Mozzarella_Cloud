import React, { useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, GeoJSON } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { LatLngExpression, FeatureGroup as LeafletFeatureGroup } from 'leaflet';

interface DeliveryZoneMapProps {
  zone: any; // Objeto GeoJSON
  onZoneChange: (zone: any) => void;
}

const DeliveryZoneMap: React.FC<DeliveryZoneMapProps> = ({ zone, onZoneChange }) => {
  const featureGroupRef = useRef<LeafletFeatureGroup>(null);
  const mapCenter: LatLngExpression = [-34.6037, -58.3816]; // Buenos Aires

  const handleCreated = (e: any) => {
    // Borra capas anteriores para permitir solo un polígono
    featureGroupRef.current?.clearLayers();
    const layer = e.layer;
    featureGroupRef.current?.addLayer(layer);
    onZoneChange(layer.toGeoJSON());
  };

  const handleEdited = (e: any) => {
    e.layers.eachLayer((layer: any) => {
      onZoneChange(layer.toGeoJSON());
    });
  };

  const handleDeleted = () => {
    onZoneChange(null);
  };

  return (
    <MapContainer center={mapCenter} zoom={12} style={{ height: '400px', width: '100%', borderRadius: '8px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <FeatureGroup ref={featureGroupRef}>
        <EditControl
          position="topright"
          onCreated={handleCreated}
          onEdited={handleEdited}
          onDeleted={handleDeleted}
          draw={{
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false,
            polygon: {
              allowIntersection: false,
              shapeOptions: { color: '#e91e63' },
            },
          }}
        />
        {zone && <GeoJSON data={zone} style={{ color: '#e91e63' }} />}
      </FeatureGroup>
    </MapContainer>
  );
};

export default DeliveryZoneMap;