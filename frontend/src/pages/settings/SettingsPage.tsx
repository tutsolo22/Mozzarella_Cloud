import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Spin,
  Tabs,
  Upload,
  Row,
  Col,
} from 'antd';
import { UploadOutlined, FacebookOutlined, InstagramOutlined, TikTokOutlined, PrinterOutlined, KeyOutlined, LinkOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { getTenantConfiguration, updateTenantConfiguration, uploadTenantLogo, uploadTenantLogoDark, uploadTenantFavicon } from '../../services/api';
import { TenantConfiguration } from '../../types/tenant';
import KdsSoundSettings from '../../components/Settings/KdsSettings'; // Reutilizamos el componente de sonido

const { Title, Paragraph } = Typography;

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States for file uploads
  const [logoFileList, setLogoFileList] = useState<UploadFile[]>([]);
  const [logoDarkFileList, setLogoDarkFileList] = useState<UploadFile[]>([]);
  const [faviconFileList, setFaviconFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const data = await getTenantConfiguration();
        form.setFieldsValue(data);

        // Populate file lists if URLs exist to show current files
        if (data.logoUrl) setLogoFileList([{ uid: '-1', name: 'Logo Actual', status: 'done', url: data.logoUrl }]);
        if (data.logoDarkUrl) setLogoDarkFileList([{ uid: '-2', name: 'Logo Oscuro Actual', status: 'done', url: data.logoDarkUrl }]);
        if (data.faviconUrl) setFaviconFileList([{ uid: '-3', name: 'Favicon Actual', status: 'done', url: data.faviconUrl }]);

      } catch (error) {
        message.error('Error al cargar la configuración del negocio.');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [form]);

  const handleFinish = async (values: TenantConfiguration) => {
    setSaving(true);

    try {
      // 1. Save text fields
      await updateTenantConfiguration(values);
      message.success('Configuración guardada con éxito.');

      // 2. Upload files if they have been changed by the user
      if (logoFileList.length > 0 && logoFileList[0].originFileObj) {
        await uploadTenantLogo(logoFileList[0].originFileObj);
        message.info('Logo principal actualizado.');
      }
      if (logoDarkFileList.length > 0 && logoDarkFileList[0].originFileObj) {
        await uploadTenantLogoDark(logoDarkFileList[0].originFileObj);
        message.info('Logo para modo oscuro actualizado.');
      }
      if (faviconFileList.length > 0 && faviconFileList[0].originFileObj) {
        await uploadTenantFavicon(faviconFileList[0].originFileObj);
        message.info('Favicon actualizado.');
      }

      // Refresh page to see all changes (like new logo in header)
      setTimeout(() => window.location.reload(), 1500);

    } catch (error) {
      message.error('Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  const tabItems = [
    {
      key: '1',
      label: 'Información General',
      children: (
        <Row gutter={24}>
          <Col xs={24} md={12}><Form.Item name="businessName" label="Razón Social"><Input placeholder="Mi Empresa S.A. de C.V." /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="slogan" label="Slogan del Negocio"><Input placeholder="El sabor que te encanta" /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="contactPhone" label="Teléfono de Contacto Principal"><Input placeholder="+52 55 1234 5678" /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="rfc" label="RFC"><Input placeholder="ABC010203XYZ" /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="taxRegime" label="Régimen Fiscal"><Input placeholder="Ej: 601 - General de Ley Personas Morales" /></Form.Item></Col>
          <Col xs={24}><Form.Item name="fiscalAddress" label="Dirección Fiscal"><Input.TextArea rows={3} placeholder="Calle, Número, Colonia, C.P., Ciudad, Estado" /></Form.Item></Col>
        </Row>
      ),
    },
    {
      key: '2',
      label: 'Personalización (Branding)',
      children: (
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Form.Item label="Logo Principal (fondos claros)">
              <Upload listType="picture" fileList={logoFileList} beforeUpload={() => false} onChange={({ fileList: newFileList }) => setLogoFileList(newFileList.slice(-1))} onRemove={() => setLogoFileList([])}>
                <Button icon={<UploadOutlined />}>Seleccionar Logo</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Logo para Fondos Oscuros">
              <Upload listType="picture" fileList={logoDarkFileList} beforeUpload={() => false} onChange={({ fileList: newFileList }) => setLogoDarkFileList(newFileList.slice(-1))} onRemove={() => setLogoDarkFileList([])}>
                <Button icon={<UploadOutlined />}>Seleccionar Logo</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Favicon (.ico, .png, .svg)">
              <Upload listType="picture" fileList={faviconFileList} beforeUpload={() => false} onChange={({ fileList: newFileList }) => setFaviconFileList(newFileList.slice(-1))} onRemove={() => setFaviconFileList([])}>
                <Button icon={<UploadOutlined />}>Seleccionar Favicon</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: '3',
      label: 'Integraciones',
      children: (
        <>
          <Card title="Integración con Sistema de Facturación Externo">
            <Paragraph type="secondary">Aquí puedes configurar el enlace a tu panel de facturación externo. La configuración de la API es gestionada por el administrador del sistema.</Paragraph>
            <Row gutter={24}>
              <Col xs={24}>
                <Form.Item name="invoicingAppUrl" label={<><LinkOutlined /> URL del Panel de Facturación</>} tooltip="El enlace que usarás para acceder a tu sistema de facturación.">
                  <Input placeholder="https://facturacion.tudominio.com" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </>
      ),
    },
    {
      key: '4',
      label: 'Redes Sociales',
      children: (
        <Row gutter={24}>
          <Col xs={24} md={8}><Form.Item name="facebookUrl" label={<><FacebookOutlined /> Facebook</>}><Input placeholder="https://facebook.com/tu_negocio" /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="instagramUrl" label={<><InstagramOutlined /> Instagram</>}><Input placeholder="https://instagram.com/tu_negocio" /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="tiktokUrl" label={<><TikTokOutlined /> TikTok</>}><Input placeholder="https://tiktok.com/@tu_negocio" /></Form.Item></Col>
        </Row>
      ),
    },
    {
      key: '5',
      label: 'Impresión y Sonidos',
      children: (
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Card title={<><PrinterOutlined /> Impresoras de Tickets</>}>
              <Form.Item name="primaryPrinterIp" label="IP Impresora Principal (Caja)" tooltip="Dirección IP local de la impresora de tickets para el área de caja.">
                <Input placeholder="Ej: 192.168.1.100" />
              </Form.Item>
              <Form.Item name="secondaryPrinterIp" label="IP Impresora Secundaria (Cocina)" tooltip="Dirección IP local de la impresora de tickets para el área de cocina.">
                <Input placeholder="Ej: 192.168.1.101" />
              </Form.Item>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <KdsSoundSettings />
          </Col>
        </Row>
      ),
    },
  ];

  if (loading) {
    return <Card><Spin tip="Cargando configuración..." /></Card>;
  }

  return (
    <Card>
      <Title level={2}>Configuración General del Negocio</Title>
      <Paragraph type="secondary">Administra la información principal, personalización y datos fiscales de tu negocio.</Paragraph>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Tabs defaultActiveKey="1" items={tabItems} />
        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={saving}>Guardar Cambios</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SettingsPage;