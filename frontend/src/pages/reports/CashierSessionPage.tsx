import React, { useState, useEffect, FC } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Button,
  Typography,
  message,
  Spin,
  Row,
  Col,
  Descriptions,
  Input,
  Statistic,
} from 'antd';
import {
  getActiveSession,
  openSession,
  closeSession,
} from '../../services/reports';
import { CashierSession } from '../../types/reports';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CashierSessionPage: FC = () => {
  const [activeSession, setActiveSession] = useState<CashierSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const fetchActiveSession = async () => {
    setLoading(true);
    try {
      const session = await getActiveSession();
      setActiveSession(session);
    } catch (error) {
      message.error('Error al obtener la sesión de caja activa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSession();
  }, []);

  const handleOpenSession = async (values: { openingBalance: number }) => {
    try {
      const newSession = await openSession(values.openingBalance);
      setActiveSession(newSession);
      message.success('Caja abierta con éxito.');
      form.resetFields();
    } catch (error) {
      message.error('Error al abrir la caja.');
    }
  };

  const handleCloseSession = async (values: { closingBalance: number; notes?: string }) => {
    try {
      await closeSession(values);
      setActiveSession(null);
      message.success('Caja cerrada con éxito. Se generará el reporte.');
      form.resetFields();
    } catch (error) {
      message.error('Error al cerrar la caja.');
    }
  };

  if (loading) {
    return (
      <Card>
        <Spin tip="Cargando información de la caja..." />
      </Card>
    );
  }

  return (
    <Card>
      <Title level={2}>Gestión de Caja</Title>
      {!activeSession ? (
        <Row justify="center">
          <Col xs={24} sm={16} md={12} lg={8}>
            <Card title="Abrir Nueva Caja">
              <Text>No hay ninguna caja abierta. Para comenzar a operar, por favor ingresa el saldo inicial.</Text>
              <Form form={form} layout="vertical" onFinish={handleOpenSession} style={{ marginTop: 24 }}>
                <Form.Item
                  name="openingBalance"
                  label="Saldo Inicial en Efectivo"
                  rules={[{ required: true, message: 'El saldo inicial es obligatorio.' }]}
                >
                  <InputNumber
                    prefix="$"
                    style={{ width: '100%' }}
                    min={0 as number}
                    step={100}
                    formatter={(value) => (value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                    parser={(value) => Number((value || '').replace(/\$\s?|,/g, ''))}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    Abrir Caja
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={4}>Información de la Sesión Actual</Title>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Cajero de Apertura">{activeSession.openedByUser.fullName}</Descriptions.Item>
              <Descriptions.Item label="Fecha de Apertura">
                {new Date(activeSession.openedAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Saldo Inicial">
                <Statistic value={activeSession.openingBalance} prefix="$" precision={2} />
              </Descriptions.Item>
              <Descriptions.Item label="Ventas Totales (Calculado)">
                <Statistic value={activeSession.totalSales || 0} prefix="$" precision={2} />
              </Descriptions.Item>
              <Descriptions.Item label="Efectivo Esperado en Caja">
                <Statistic value={activeSession.calculatedCash || 0} prefix="$" precision={2} />
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={12}>
            <Title level={4}>Cerrar Caja</Title>
            <Form form={form} layout="vertical" onFinish={handleCloseSession}>
              <Form.Item
                name="closingBalance"
                label="Saldo Final en Efectivo (Contado)"
                rules={[{ required: true, message: 'El saldo final es obligatorio.' }]}
              >
                <InputNumber
                  prefix="$"
                  style={{ width: '100%' }}
                  min={0 as number}
                  step={100}
                  formatter={(value) => (value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                  parser={(value) => Number((value || '').replace(/\$\s?|,/g, ''))}
                />
              </Form.Item>
              <Form.Item name="notes" label="Notas Adicionales">
                <TextArea rows={4} placeholder="Ej: Faltante por error en vuelto, sobrante por propina." />
              </Form.Item>
              <Form.Item>
                <Button type="primary" danger htmlType="submit" block>
                  Realizar Cierre de Caja
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default CashierSessionPage;