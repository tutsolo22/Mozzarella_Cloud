import React from 'react';
import { useState, useEffect } from 'react';
import { Row, Col, Typography, DatePicker, Button, Space } from 'antd';
import IngredientConsumptionReport from '../../components/IngredientConsumptionReport';
import SalesSummary from '../../components/SalesSummary';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AdminDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(() => [dayjs().startOf('month'), dayjs().endOf('month')]);
  const [reportTrigger, setReportTrigger] = useState(0);

  const handleGenerateReports = () => {
    setReportTrigger(prev => prev + 1);
  };

  // Automatically generate reports on initial load
  useEffect(() => {
    handleGenerateReports();
  }, []);

  return (
    <div>
      <Title level={2}>Dashboard de Administrador</Title>
      <Space style={{ marginBottom: 24 }}>
        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates as any)}
          presets={[
            { label: 'Este mes', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
            { label: 'Mes pasado', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
            { label: 'Últimos 7 días', value: [dayjs().subtract(6, 'days'), dayjs()] },
            { label: 'Últimos 30 días', value: [dayjs().subtract(29, 'days'), dayjs()] },
          ]}
        />
        <Button type="primary" onClick={handleGenerateReports}>
          Generar Reportes
        </Button>
      </Space>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <SalesSummary dateRange={dateRange} trigger={reportTrigger} />
        </Col>
        <Col xs={24} lg={12}>
          <IngredientConsumptionReport dateRange={dateRange} trigger={reportTrigger} />
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;