import React from 'react';
import { Polyline } from 'react-leaflet';
import { Order } from '../../types/order';
import { LatLngExpression } from 'leaflet';

interface RoutePolylineProps {
  orders: Order[];
}

const RoutePolyline: React.FC<RoutePolylineProps> = ({ orders }) => {
  // Ordenamos los pedidos por la secuencia de entrega y filtramos los que tienen coordenadas
  const sortedPositions = orders
    .filter(o => o.latitude && o.longitude)
    .sort((a, b) => (a.deliverySequence ?? Infinity) - (b.deliverySequence ?? Infinity))
    .map(o => [o.latitude!, o.longitude!] as LatLngExpression);

  if (sortedPositions.length < 2) return null;

  return <Polyline pathOptions={{ color: 'blue' }} positions={sortedPositions} />;
};

export default RoutePolyline;