import React, { useState, useEffect } from 'react';
import { Card, Statistic, Table, Spin, Alert, Row, Col } from 'antd';
import { getWasteReport } from '../../services/api';
import { DeleteOutlined } from '@ant-design/icons';

interface WasteSummaryProps {
  startDate?: string;
  endDate?: string;
}

const WasteSummary: React.FC<WasteSummaryProps> = ({ startDate, endDate }) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getWasteReport(startDate, endDate);
        setReport(data);
      } catch (err) {
        setError('Error al cargar el reporte de mermas.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [startDate, endDate]);

  const columns = [
    { title: 'Ingrediente', dataIndex: 'ingredientName', key: 'ingredientName' },
    { title: 'Cantidad Desperdiciada', dataIndex: 'totalQuantity', key: 'totalQuantity', render: (val: number, record: any) => `${val.toFixed(3)} ${record.unit}` },
    { title: 'Nº de Registros', dataIndex: 'entries', key: 'entries' },
  ];

  if (loading) {
    return <Card><Spin tip="Cargando..." /></Card>;
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  return (
    <Card title="Resumen de Mermas">
       <Row gutter={16}>
        <Col span={24}>
          <Statistic title="Total Registros de Merma" value={report?.totalWasteEntries} prefix={<DeleteOutlined />} />
        </Col>
      </Row>
      <Table
        dataSource={report?.summary}
        columns={columns}
        rowKey="ingredientId"
        pagination={false}
        style={{ marginTop: 24 }}
      />
    </Card>
  );
};

export default WasteSummary;