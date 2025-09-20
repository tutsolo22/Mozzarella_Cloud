import React, { useState, useEffect, useCallback } from 'react';
import { Select, Card, Spin, Alert, Typography, InputNumber, Button, Row, Col, message } from 'antd';
import { getLogFiles, getLogContent } from '../../services/api';
import { EyeOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const LogsViewerPage: React.FC = () => {
  const [logFiles, setLogFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | undefined>(undefined);
  const [lines, setLines] = useState<number>(200);
  const [logContent, setLogContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchingContent, setFetchingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogContent = useCallback(async () => {
    if (!selectedFile) {
      message.error('Por favor, selecciona un archivo de log.');
      return;
    }
    try {
      setFetchingContent(true);
      setError(null);
      const data = await getLogContent(selectedFile, lines);
      setLogContent(data.log);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cargar el contenido del log.';
      setError(errorMessage);
      setLogContent('');
    } finally {
      setFetchingContent(false);
    }
  }, [selectedFile, lines]);

  useEffect(() => {
    const fetchLogFiles = async () => {
      try {
        setLoading(true);
        const files = await getLogFiles();
        setLogFiles(files);
        if (files.length > 0) {
          setSelectedFile(files[0]);
        } else {
          setError('No se encontraron archivos de log. Asegúrate de que el logging a archivos esté configurado en el backend.');
        }
      } catch (err) {
        setError('No se pudieron cargar los archivos de log. Asegúrate de tener permisos de Super Administrador.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogFiles();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      fetchLogContent();
    }
  }, [selectedFile, fetchLogContent]);

  if (loading) {
    return <Spin tip="Cargando archivos de log..." size="large" style={{ display: 'block', marginTop: 50 }} />;
  }

  return (
    <Card>
      <Title level={2} style={{ color: '#DAA520' }}>Visor de Logs del Sistema</Title>
      <Paragraph type="secondary">
        Aquí puedes ver los logs generados por el sistema para depurar problemas. Selecciona el archivo y el número de líneas a mostrar.
      </Paragraph>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      
      <Row gutter={16} align="bottom" style={{ marginBottom: 24 }}>
        <Col>
          <Typography.Text>Archivo de Log:</Typography.Text><br />
          <Select style={{ width: 200 }} value={selectedFile} onChange={(value) => setSelectedFile(value)} placeholder="Selecciona un archivo">
            {logFiles.map(file => (<Option key={file} value={file}>{file}</Option>))}
          </Select>
        </Col>
        <Col>
          <Typography.Text>Últimas Líneas:</Typography.Text><br />
          <InputNumber min={10} max={5000} value={lines} onChange={(value) => setLines(value || 200)} />
        </Col>
        <Col>
          <Button type="primary" onClick={fetchLogContent} loading={fetchingContent} icon={<EyeOutlined />} disabled={!selectedFile}>
            Actualizar
          </Button>
        </Col>
      </Row>

      <pre style={{ background: '#262626', color: '#F5F5DC', padding: '15px', borderRadius: '4px', maxHeight: '60vh', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {fetchingContent ? <Spin /> : (logContent || 'No hay contenido para mostrar o el archivo está vacío.')}
      </pre>
    </Card>
  );
};

export default LogsViewerPage;