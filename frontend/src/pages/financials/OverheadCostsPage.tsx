import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Typography, Spin, Alert, notification, Space, Popconfirm, DatePicker, Card } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, DollarOutlined } from '@ant-design/icons';
import { getOverheadCosts, deleteOverheadCost } from '../../services/api';
import { OverheadCost } from '../../types/financials';
import OverheadCostModal from '../../components/Financials/OverheadCostModal';
import dayjs, { Dayjs } from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const frequencyMap = {
  'one-time': 'Una vez',
  'daily': 'Diario',
  'weekly': 'Semanal',
  'monthly': 'Mensual',
};

const OverheadCostsPage: React.FC = () => {
  const [costs, setCosts] = useState<OverheadCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCost, setEditingCost] = useState<Partial<OverheadCost> | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([dayjs().startOf('month'), dayjs().endOf('month')]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined;
      const endDate = dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined;
      const data = await getOverheadCosts(startDate, endDate);
      setCosts(data);
    } catch (err) {
      setError('No se pudieron cargar los costos operativos.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditingCost(null);
    setIsModalVisible(true);
  };

  const handleEdit = (cost: OverheadCost) => {
    setEditingCost(cost);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteOverheadCost(id);
      notification.success({ message: 'Costo eliminado' });
      fetchData();
    } catch (err) {
      notification.error({ message: 'Error al eliminar el costo' });
    }
  };

  const columns = [
    { title: 'Fecha', dataIndex: 'costDate', key: 'costDate', render: (date: string) => dayjs(date).format('DD/MM/YYYY'), sorter: (a: OverheadCost, b: OverheadCost) => dayjs(a.costDate).unix() - dayjs(b.costDate).unix(), defaultSortOrder: 'descend' as const },
    { title: 'Nombre', dataIndex: 'name', key: 'name', sorter: (a: OverheadCost, b: OverheadCost) => a.name.localeCompare(b.name) },
    { title: 'Monto', dataIndex: 'amount', key: 'amount', render: (val: string) => `$${Number(val).toFixed(2)}`, sorter: (a: OverheadCost, b: OverheadCost) => Number(a.amount) - Number(b.amount) },
    { title: 'Frecuencia', dataIndex: 'frequency', key: 'frequency', render: (val: keyof typeof frequencyMap) => frequencyMap[val] || val },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: OverheadCost) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="¿Seguro que quieres eliminar este costo?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) return <Alert message="Error" description={error} type="error" />;

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}><DollarOutlined /> Gestión de Costos Operativos</Title>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <RangePicker value={dateRange} onChange={(dates) => setDateRange(dates as any)} />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Añadir Costo
            </Button>
          </Space>
          {loading ? <Spin /> : <Table dataSource={costs} columns={columns} rowKey="id" />}
        </Space>
      </Card>
      <OverheadCostModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={fetchData}
        cost={editingCost}
      />
    </div>
  );
};

export default OverheadCostsPage;