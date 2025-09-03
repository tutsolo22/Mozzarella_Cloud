import React, { useState } from 'react';
import { DatePicker, Button, Spin, Typography, Card, Row, Col, Table, Alert } from 'antd';
import { getIngredientConsumptionReport } from '../../services/reports';
import { useLocationContext } from '../../contexts/LocationContext';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const IngredientConsumptionReportPage: React.FC = () => {
  const { selectedLocationId, loading: locationLoading } = useLocationContext();
  const [dates, setDates] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    if (!selectedLocationId) {
      setError('Por favor, selecciona una sucursal.');
      return;
    }
    if (!dates || !dates[0] || !dates[1]) {
      setError('Por favor, selecciona un rango de fechas.');
      return;
    }

    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const params = {
        locationId: selectedLocationId,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      };
      const data = await getIngredientConsumptionReport(params);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al generar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Ingrediente', dataIndex: 'ingredientName', key: 'ingredientName' },
    { title: 'Total Consumido', dataIndex: 'totalConsumed', key: 'totalConsumed', align: 'right' as const, render: (val: number) => val.toFixed(3) },
    { title: 'Unidad', dataIndex: 'unit', key: 'unit' },
  ];

  return (
    <Card>
      <Title level={2}>Reporte de Consumo de Ingredientes</Title>
      <Row gutter={16} align="bottom" style={{ marginBottom: 24 }}>
        <Col>
          <Text>Rango de Fechas</Text><br />
          <RangePicker onChange={(values) => setDates(values)} />
        </Col>
        <Col>
          <Button type="primary" onClick={handleGenerateReport} loading={loading || locationLoading} disabled={!selectedLocationId}>
            Generar Reporte
          </Button>
        </Col>
      </Row>

      {error && <Alert message={error} type="error" showIcon style={{ marginTop: 16 }} />}
      
      {!selectedLocationId && !locationLoading && (
        <Alert message="Por favor selecciona una sucursal para generar un reporte." type="info" showIcon style={{ marginTop: 16 }} />
      )}

      {loading && <Spin style={{ marginTop: 24, display: 'block' }} />}

      {reportData && (
        <div>
          <Title level={4} style={{ marginTop: 24 }}>Consumo en el periodo</Title>
          <Table dataSource={reportData.consumedIngredients} columns={columns} rowKey="ingredientId" pagination={false} />
        </div>
      )}
    </Card>
  );
};

export default IngredientConsumptionReportPage;