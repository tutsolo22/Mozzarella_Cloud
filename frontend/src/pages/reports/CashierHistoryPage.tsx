import React, { useState, useEffect } from 'react';
import {
  Table,
  Typography,
  Spin,
  Alert,
  DatePicker,
  Card,
  Button,
  Modal,
  Tag,
  Space,
} from 'antd';
import { EyeOutlined, CalendarOutlined, CarOutlined } from '@ant-design/icons';
import { getHistoricalSessions } from '../../services/api';
import { CashierSession } from '../../types/reports';
import SessionReportDetail from '../../components/Reports/SessionReportDetail';
import dayjs, { Dayjs } from 'dayjs';
import { Link } from 'react-router-dom';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const CashierHistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<CashierSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([dayjs().subtract(30, 'days'), dayjs()]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CashierSession | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const startDate = dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined;
        const endDate = dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined;
        const data = await getHistoricalSessions(startDate, endDate);
        setSessions(data);
      } catch (err) {
        setError('No se pudo cargar el historial de cortes.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [dateRange]);

  const handleViewDetails = (session: CashierSession) => {
    setSelectedSession(session);
    setIsModalVisible(true);
  };

  const getDifferenceTag = (differenceStr?: string) => {
    if (!differenceStr) return <Tag>N/A</Tag>;
    const difference = Number(differenceStr);
    if (difference === 0) return <Tag color="success">Perfecto</Tag>;
    if (difference > 0) return <Tag color="blue">Sobrante</Tag>;
    return <Tag color="error">Faltante</Tag>;
  };

  const columns = [
    {
      title: 'Fecha de Cierre',
      dataIndex: 'closedAt',
      key: 'closedAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a: CashierSession, b: CashierSession) => dayjs(a.closedAt).unix() - dayjs(b.closedAt).unix(),
      defaultSortOrder: 'descend' as const,
    },
    { title: 'Abierto por', dataIndex: ['openedByUser', 'fullName'], key: 'openedBy' },
    { title: 'Cerrado por', dataIndex: ['closedByUser', 'fullName'], key: 'closedBy' },
    {
      title: 'Ventas Totales',
      dataIndex: 'totalSales',
      key: 'totalSales',
      render: (val: string) => `$${Number(val).toFixed(2)}`,
      sorter: (a: CashierSession, b: CashierSession) => Number(a.totalSales) - Number(b.totalSales),
    },
    {
      title: 'Diferencia',
      dataIndex: 'difference',
      key: 'difference',
      render: (val: string) => (
        <>
          {getDifferenceTag(val)} ${Math.abs(Number(val)).toFixed(2)}
        </>
      ),
      sorter: (a: CashierSession, b: CashierSession) => Number(a.difference) - Number(b.difference),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: CashierSession) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>Ver Corte</Button>
          <Link to={`/reports/driver-settlement/${record.id}`}>
            <Button icon={<CarOutlined />}>Corte Repartidor</Button>
          </Link>
        </Space>
      ),
    },
  ];

  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}><CalendarOutlined /> Historial de Cortes de Caja</Title>
      <Card style={{ marginBottom: 24 }}>
        <RangePicker value={dateRange} onChange={(dates) => setDateRange(dates as any)} />
      </Card>
      {loading ? <Spin /> : <Table dataSource={sessions} columns={columns} rowKey="id" />}
      <Modal title={`Detalle del Corte - ${dayjs(selectedSession?.closedAt).format('DD/MM/YYYY')}`} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} width={800}>
        {selectedSession && <SessionReportDetail session={selectedSession} />}
      </Modal>
    </div>
  );
};

export default CashierHistoryPage;