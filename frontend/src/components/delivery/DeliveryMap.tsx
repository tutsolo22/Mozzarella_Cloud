import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Order } from '../../types/order';
import L, { LatLngExpression, LatLngBounds } from 'leaflet';
import RoutePolyline from './RoutePolyline';
import { Button } from 'antd';

// Icono por defecto para los marcadores
const defaultIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// Icono de advertencia para pedidos fuera de zona (rojo)
const warningIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// 1. Creamos un componente auxiliar para ajustar el mapa
const MapFitter: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const map = useMap(); // Obtenemos la instancia del mapa

  useEffect(() => {
    // Filtramos los pedidos que tienen coordenadas válidas
    const points = orders
      .filter(order => order.latitude && order.longitude)
      .map(order => [order.latitude!, order.longitude!] as [number, number]);

    if (points.length > 0) {
      // Creamos un objeto de límites (bounds) que contiene todos los puntos
      const bounds = new LatLngBounds(points);
      // Le decimos al mapa que se ajuste a estos límites, con un poco de espacio
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [orders, map]); // Este efecto se ejecuta cada vez que los pedidos cambian

  return null; // Este componente no renderiza nada en el DOM
};

interface DeliveryMapProps {
  orders: Order[];
  onMarkAsDelivered: (orderId: string) => void;
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({ orders, onMarkAsDelivered }) => {
  // Coordenadas de ejemplo para centrar el mapa (ej. Buenos Aires)
  const mapCenter: LatLngExpression = [-34.6037, -58.3816]; // Esto servirá como centro inicial

  return (
    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', minHeight: '400px', borderRadius: '8px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {orders.map(order => (
        // Solo renderizamos marcadores si tenemos latitud y longitud
        (order.latitude && order.longitude) && (
          <Marker
            key={order.id}
            position={[order.latitude, order.longitude]}
            icon={order.notes?.includes('¡ATENCIÓN! Pedido fuera del área de entrega.') ? warningIcon : defaultIcon}
          >
            <Popup minWidth={200}>
              <div onClick={(e) => e.stopPropagation()}>
                <b>Pedido #{order.shortId || order.id.substring(0, 8)}</b><br />
                {order.deliveryAddress}<br />
                Total: ${parseFloat(order.totalAmount).toFixed(2)}
                <Button
                  type="primary"
                  size="small"
                  style={{ marginTop: 8, width: '100%' }}
                  onClick={() => onMarkAsDelivered(order.id)}
                >
                  Marcar como Entregado
                </Button>
              </div>
            </Popup>
          </Marker>
        )
      ))}
      
      {/* 2. Añadimos nuestro componente de ajuste dentro del mapa */}
      <MapFitter orders={orders} />

      {/* 3. Añadimos el componente que dibuja la ruta */}
      <RoutePolyline orders={orders} />
    </MapContainer>
  );
};

export default DeliveryMap;