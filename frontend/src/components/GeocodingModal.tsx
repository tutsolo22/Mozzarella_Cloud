import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, Button, Spin, notification } from 'antd';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Order } from '../types/order';
import { LatLngExpression, Marker as LeafletMarker } from 'leaflet';
import { updateOrderCoordinates } from '../services/api';

interface GeocodingModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedOrder: Order) => void;
}

// Componente para centrar el mapa en la nueva posición
const MapUpdater: React.FC<{ position: LatLngExpression }> = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 16);
  }, [position, map]);
  return null;
};

const GeocodingModal: React.FC<GeocodingModalProps> = ({ order, open, onClose, onSave }) => {
  const [position, setPosition] = useState<LatLngExpression | null>(null);
  const [loading, setLoading] = useState(false);
  const markerRef = useRef<LeafletMarker>(null);

  useEffect(() => {
    if (order) {
      // Usamos las coordenadas existentes o un valor por defecto (ej. centro de la ciudad)
      const initialPosition: LatLngExpression = (order.latitude && order.longitude)
        ? [order.latitude, order.longitude]
        : [-34.6037, -58.3816]; // Default a Buenos Aires
      setPosition(initialPosition);
    }
  }, [order]);

  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        setPosition(marker.getLatLng());
      }
    },
  }), []);

  const handleSave = async () => {
    if (!order || !position) return;
    setLoading(true);
    try {
      const newCoords = Array.isArray(position) ? { latitude: position[0], longitude: position[1] } : { latitude: position.lat, longitude: position.lng };
      const updatedOrder = await updateOrderCoordinates(order.id, newCoords.latitude, newCoords.longitude);
      notification.success({ message: 'Ubicación actualizada con éxito' });
      onSave(updatedOrder);
      onClose();
    } catch (error) {
      notification.error({ message: 'Error al guardar la ubicación' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Ajustar ubicación para Pedido #${order?.shortId}`}
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={loading}
      width={800}
    >
      {position ? (
        <MapContainer center={position} zoom={16} style={{ height: '500px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} />
          <MapUpdater position={position} />
        </MapContainer>
      ) : <Spin tip="Cargando mapa..." />}
    </Modal>
  );
};

export default GeocodingModal;