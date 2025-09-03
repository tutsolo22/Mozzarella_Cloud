import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import { Order } from '../../types/order';
import { ActiveDriver } from '../../pages/Delivery/DispatchPage';


// Icono para los pedidos
const orderIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// Icono para los repartidores (un punto verde para simplicidad)
const driverIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Componente auxiliar para centrar y hacer zoom en el mapa dinámicamente
const MapUpdater: React.FC<{ path: LatLngExpression[] }> = ({ path }) => {
  const map = useMap();
  useEffect(() => {
    if (path && path.length > 0) {
      map.fitBounds(path, { padding: [50, 50] });
    }
  }, [path, map]);
  return null;
};

interface DispatchMapProps {
  orders: Order[];
  drivers: Record<string, ActiveDriver>;
  routePath?: LatLngExpression[];
}

const DispatchMap: React.FC<DispatchMapProps> = ({ orders, drivers, routePath }) => {
  const mapCenter: LatLngExpression = [-34.6037, -58.3816]; // Centro inicial

  return (
    <MapContainer center={mapCenter} zoom={13} style={{ height: '60vh', width: '100%', borderRadius: '8px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Marcadores de Pedidos Listos */}
      {orders.map(order => (
        (order.latitude && order.longitude) && (
          <Marker key={`order-${order.id}`} position={[order.latitude, order.longitude]} icon={orderIcon}>
            <Popup>
              <b>Pedido #{order.shortId}</b><br />
              {order.deliveryAddress}
            </Popup>
          </Marker>
        )
      ))}

      {/* Marcadores de Repartidores Activos */}
      {Object.entries(drivers).map(([driverId, driverData]) => (
        driverData.location && (
          <Marker 
            key={`driver-${driverId}`} 
            position={[driverData.location.lat, driverData.location.lng]} 
            icon={driverIcon}
            zIndexOffset={1000} // Para que siempre estén por encima de los pedidos
          >
            <Popup>
              <b>Repartidor:</b><br />
              {driverData.name}
            </Popup>
          </Marker>
        )
      ))}

      {/* Línea de la ruta previsualizada */}
      {routePath && routePath.length > 0 && (
        <>
          <Polyline pathOptions={{ color: 'blue', weight: 5, opacity: 0.7 }} positions={routePath} />
          <MapUpdater path={routePath} />
        </>
      )}
    </MapContainer>
  );
};

export default DispatchMap;