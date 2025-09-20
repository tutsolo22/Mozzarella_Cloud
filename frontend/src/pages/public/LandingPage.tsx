import React from 'react';
import { Layout, Button, Typography, Row, Col, Card, Space } from 'antd';
import { WhatsAppOutlined, LoginOutlined, ShopOutlined, BarChartOutlined, SettingOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const LandingPage: React.FC = () => {
  return (
    <Layout className="layout">
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#000000', borderBottom: '1px solid #DAA520', padding: '0 50px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="logo">
          <Title level={3} style={{ margin: 0, color: '#DAA520' }}>Mozzarella Cloud</Title>
        </div>
        <Space>
          <Link to="/register">
            <Button icon={<UserAddOutlined />}>
              Crear Cuenta
            </Button>
          </Link>
          <Link to="/login">
            <Button type="primary" icon={<LoginOutlined />}>
              Iniciar Sesión
            </Button>
          </Link>
        </Space>
      </Header>

      <Content>
        {/* Hero Section */}
        <div style={{ background: '#333333', padding: '80px 24px', textAlign: 'center' }}>
          <Title style={{ color: '#DAA520' }}>Mozzarella Cloud</Title>
          <Title level={2} style={{ color: '#F5F5DC', marginTop: 0 }}>El Sistema de Gestión Definitivo para tu Negocio</Title>
          <Paragraph style={{ fontSize: '18px', maxWidth: '800px', margin: 'auto', color: '#F5F5DC' }}>
            "Optimiza tu negocio de alimentos con la máxima eficiencia y control, elevando la experiencia de cada pedido."
          </Paragraph>
          <Paragraph style={{ marginTop: '1rem', fontStyle: 'italic', color: '#F5F5DC' }}>
            Una aplicación de <Text strong style={{ color: '#DAA520' }}>MATS Hexalux</Text>.
          </Paragraph>
          <Button type="primary" size="large" href="#pricing" style={{ marginTop: 24 }}>
            Ver Planes
          </Button>
        </div>

        {/* Features Section */}
        <div style={{ padding: '50px 24px', background: '#F5F5DC' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 48, color: '#333333' }}>Funcionalidades Clave</Title>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card hoverable cover={<div style={{ fontSize: 64, textAlign: 'center', paddingTop: 20, color: '#DAA520' }}><ShopOutlined /></div>}>
                <Card.Meta title="Gestión Centralizada" description="Controla múltiples sucursales, usuarios, productos e inventario desde un solo lugar." />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card hoverable cover={<div style={{ fontSize: 64, textAlign: 'center', paddingTop: 20, color: '#8B8000' }}><TeamOutlined /></div>}>
                <Card.Meta title="Optimización de Reparto" description="Asigna repartidores, optimiza rutas y sigue las entregas en tiempo real para máxima eficiencia." />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card hoverable cover={<div style={{ fontSize: 64, textAlign: 'center', paddingTop: 20, color: '#DAA520' }}><BarChartOutlined /></div>}>
                <Card.Meta title="Reportes Inteligentes" description="Analiza ventas, rentabilidad y costos para tomar decisiones basadas en datos." />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card hoverable cover={<div style={{ fontSize: 64, textAlign: 'center', paddingTop: 20, color: '#8B8000' }}><SettingOutlined /></div>}>
                <Card.Meta title="Integraciones Poderosas" description="Conecta con WhatsApp para pedidos automáticos y procesa pagos en línea con Mercado Pago." />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Pricing Section */}
        <div id="pricing" style={{ background: '#333333', padding: '80px 24px', textAlign: 'center' }}>
          <Title style={{ color: '#F5F5DC' }}>Planes Flexibles para Cada Etapa de tu Negocio</Title>
          <Paragraph style={{ fontSize: '18px', maxWidth: '800px', margin: 'auto auto 48px auto', color: '#F5F5DC' }}>
            Elige el plan que impulsa tu crecimiento. Todas las funcionalidades de Mozzarella Cloud están incluidas en cada plan, sin sorpresas.
          </Paragraph>
          <Row gutter={[32, 48]} justify="center" align="stretch">
            {/* Plan Esencial */}
            <Col xs={24} md={12} lg={8} style={{ display: 'flex' }}>
              <Card
                title="Plan Esencial"
                headStyle={{ background: '#4A4A4A', color: '#fff', borderBottom: '1px solid #DAA520' }}
                style={{ width: '100%', background: '#222222', color: '#F5F5DC', borderColor: '#4A4A4A', textAlign: 'left', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <Paragraph style={{ color: '#BDBDBD' }}>Ideal para arrancar y consolidar tu operación en un solo local.</Paragraph>
                <Title level={2} style={{ color: '#F5F5DC', margin: '10px 0' }}>$399 <Text style={{ fontSize: '0.5em', color: '#BDBDBD' }}>/ mes</Text></Title>
                <ul style={{ paddingLeft: 20, color: '#F5F5DC', flexGrow: 1 }}>
                  <li><Text strong>1 Sucursal</Text></li>
                  <li>Hasta <Text strong>10 Empleados</Text></li>
                  <li><Text strong>Acceso completo</Text> a la plataforma</li>
                  <li>Soporte técnico remoto (respuesta en 48h)</li>
                </ul>
                <Link to="/register" style={{ width: '100%' }}>
                  <Button type="primary" block size="large" style={{ marginTop: 'auto', background: '#DAA520', borderColor: '#DAA520', color: '#000', fontWeight: 'bold' }}>Comenzar Ahora</Button>
                </Link>
              </Card>
            </Col>
            {/* Plan Crecimiento */}
            <Col xs={24} md={12} lg={8} style={{ display: 'flex' }}>
              <Card
                title="Plan Crecimiento"
                headStyle={{ background: '#DAA520', color: '#000', borderBottom: '1px solid #DAA520' }}
                style={{ width: '100%', background: '#222222', color: '#F5F5DC', borderColor: '#DAA520', borderTop: '5px solid #DAA520', textAlign: 'left', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                extra={<Text style={{ background: '#DAA520', color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>MÁS POPULAR</Text>}
              >
                <Paragraph style={{ color: '#BDBDBD' }}>Perfecto para expandir tu marca y gestionar múltiples sucursales con eficiencia.</Paragraph>
                <Title level={2} style={{ color: '#F5F5DC', margin: '10px 0' }}>$699 <Text style={{ fontSize: '0.5em', color: '#BDBDBD' }}>/ mes</Text></Title>
                <ul style={{ paddingLeft: 20, color: '#F5F5DC', flexGrow: 1 }}>
                  <li>Hasta <Text strong>5 Sucursales</Text></li>
                  <li>Hasta <Text strong>20 Empleados</Text></li>
                  <li><Text strong>Acceso completo</Text> a la plataforma</li>
                  <li>Soporte técnico remoto prioritario (respuesta en 24h)</li>
                </ul>
                <Link to="/register" style={{ width: '100%' }}>
                  <Button type="primary" block size="large" style={{ marginTop: 'auto', background: '#DAA520', borderColor: '#DAA520', color: '#000', fontWeight: 'bold' }}>Elegir Crecimiento</Button>
                </Link>
              </Card>
            </Col>
            {/* Plan Profesional */}
            <Col xs={24} md={12} lg={8} style={{ display: 'flex' }}>
              <Card
                title="Plan Profesional"
                headStyle={{ background: '#4A4A4A', color: '#fff', borderBottom: '1px solid #DAA520' }}
                style={{ width: '100%', background: '#222222', color: '#F5F5DC', borderColor: '#4A4A4A', textAlign: 'left', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <Paragraph style={{ color: '#BDBDBD' }}>La solución definitiva para cadenas de restaurantes que buscan la máxima optimización.</Paragraph>
                <Title level={2} style={{ color: '#F5F5DC', margin: '10px 0' }}>$999 <Text style={{ fontSize: '0.5em', color: '#BDBDBD' }}>/ mes</Text></Title>
                <ul style={{ paddingLeft: 20, color: '#F5F5DC', flexGrow: 1 }}>
                  <li>Hasta <Text strong>10 Sucursales</Text></li>
                  <li>Hasta <Text strong>30 Empleados</Text></li>
                  <li><Text strong>Acceso completo</Text> a la plataforma</li>
                  <li>Soporte premium (remoto y en sitio, respuesta en 6h)</li>
                </ul>
                <Link to="/register" style={{ width: '100%' }}>
                  <Button type="primary" block size="large" style={{ marginTop: 'auto', background: '#DAA520', borderColor: '#DAA520', color: '#000', fontWeight: 'bold' }}>Obtener Plan Pro</Button>
                </Link>
              </Card>
            </Col>
          </Row>
          <div style={{ marginTop: 48 }}>
            <Title level={3} style={{ color: '#F5F5DC' }}>¿Necesitas una solución a gran escala?</Title>
            <Paragraph style={{ fontSize: '16px', maxWidth: '800px', margin: 'auto', color: '#F5F5DC' }}>
              Nuestro <Text strong style={{ color: '#DAA520' }}>Plan Empresarial</Text> ofrece licencias sin límites, infraestructura dedicada y soporte personalizado para las necesidades únicas de tu corporación.
            </Paragraph>
            <Button size="large" style={{ marginTop: 24, background: '#4A4A4A', borderColor: '#4A4A4A', color: '#fff' }}>Contactar a Ventas</Button>
          </div>
        </div>

        {/* Contact Section */}
        <div style={{ padding: '50px 24px', textAlign: 'center', background: '#F5F5DC' }}>
          <Title level={2} style={{ color: '#333333' }}>¿Tienes preguntas?</Title>
          <Paragraph style={{ color: '#333333' }}>Nuestro equipo está listo para ayudarte a llevar tu negocio al siguiente nivel.</Paragraph>
          <Space size="large">
            <Button type="primary" icon={<WhatsAppOutlined />} size="large" href="https://wa.me/521XXXXXXXXXX" target="_blank">
              Chatea con nosotros
            </Button>
          </Space>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#000000', color: '#F5F5DC' }}>
        Mozzarella Cloud ©{new Date().getFullYear()} - Una aplicación de <Text strong style={{ color: '#DAA520' }}>MATS Hexalux</Text>
      </Footer>
    </Layout>
  );
};

export default LandingPage;