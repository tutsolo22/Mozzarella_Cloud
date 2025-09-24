import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Form, Typography } from 'antd';

const { Paragraph } = Typography;

// Corrige el problema del icono que no aparece en Leaflet con Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DeliveryZoneMapProps {
  value?: any; // GeoJSON Polygon
  onChange?: (value: any) => void;
}

const DeliveryZoneMap: React.FC<DeliveryZoneMapProps> = ({ value, onChange }) => {
  const featureGroupRef = useRef<L.FeatureGroup>(null);

  const handleCreate = (e: any) => {
    if (onChange) {
      onChange(e.layer.toGeoJSON());
    }
  };

  const handleEdit = (e: any) => {
    if (onChange) {
      const layers = e.layers.getLayers();
      if (layers.length > 0) {
        onChange(layers[0].toGeoJSON());
      }
    }
  };

  const handleDelete = () => {
    if (onChange) {
      onChange(null);
    }
  };

  // Convertir GeoJSON a LatLngExpression para el componente Polygon
  const polygonPositions: LatLngExpression[] | null = value?.coordinates?.[0]?.map((coord: number[]) => [coord[1], coord[0]]) || null;

  useEffect(() => {
    // Limpiar capas existentes al cambiar el valor para evitar duplicados
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      if (polygonPositions) {
        const polygon = new L.Polygon(polygonPositions);
        featureGroupRef.current.addLayer(polygon);
      }
    }
  }, [polygonPositions]);

  return (
    <div>
      <Paragraph>
        Dibuja un polígono en el mapa para definir tu área de entrega. Solo se puede tener una zona de entrega a la vez.
      </Paragraph>
      <MapContainer center={[19.4326, -99.1332]} zoom={11} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={handleCreate}
            onEdited={handleEdit}
            onDeleted={handleDelete}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
              polygon: !value, // Solo permitir dibujar si no hay un polígono existente
            }}
            edit={{
              featureGroup: featureGroupRef.current || new L.FeatureGroup(),
              remove: true,
            }}
          />
          {polygonPositions && <Polygon positions={polygonPositions} />}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default DeliveryZoneMap;