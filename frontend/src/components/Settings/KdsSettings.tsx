import React, { useState, useEffect } from 'react';
import { Card, Spin, Alert, Typography, Button, Upload, message, Popconfirm } from 'antd';
import { UploadOutlined, SoundOutlined, DeleteOutlined } from '@ant-design/icons';
import { getTenantConfiguration, uploadKdsSound, deleteKdsSound } from '../../services/api';
import { TenantConfiguration } from '../../types/tenant';
import type { UploadProps } from 'antd';

const { Paragraph } = Typography;

const KdsSoundSettings: React.FC = () => {
  const [config, setConfig] = useState<TenantConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getTenantConfiguration();
        setConfig(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'No se pudo cargar la configuración.');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSoundUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      const updatedConfig = await uploadKdsSound(file as File);
      setConfig(updatedConfig);
      if (onSuccess) onSuccess(updatedConfig);
      message.success('Sonido de notificación actualizado.');
    } catch (err: any) {
      if (onError) onError(err);
      const errorMsg = err.response?.data?.message;
      if (Array.isArray(errorMsg)) {
        message.error(errorMsg.join(', '));
      } else {
        message.error(errorMsg || 'Error al subir el archivo.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveSound = async () => {
    try {
      await deleteKdsSound();
      setConfig((prev) => (prev ? { ...prev, kdsNotificationSoundUrl: null } : null));
      message.success('Sonido de notificación restablecido al predeterminado.');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Error al quitar el sonido.');
    }
  };

  if (loading) return <Spin />;
  if (error) return <Alert message={error} type="error" />;

  return (
    <Card title={<><SoundOutlined /> Sonido de Notificación del KDS</>} style={{ height: '100%' }}>
      <Paragraph>
        Sube un archivo MP3 personalizado (máx. 1MB) para las notificaciones de nuevos pedidos en el KDS.
      </Paragraph>
      {config?.kdsNotificationSoundUrl && (
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <Paragraph style={{ marginBottom: 4 }}>Sonido actual:</Paragraph>
            <audio src={config.kdsNotificationSoundUrl} controls preload="none" />
          </div>
          <Popconfirm title="¿Restablecer al sonido por defecto?" onConfirm={handleRemoveSound} okText="Sí" cancelText="No">
            <Button icon={<DeleteOutlined />} danger>Quitar</Button>
          </Popconfirm>
        </div>
      )}
      <Upload customRequest={handleSoundUpload} accept=".mp3" maxCount={1} showUploadList={false}>
        <Button icon={<UploadOutlined />} loading={uploading}>
          {config?.kdsNotificationSoundUrl ? 'Cambiar Sonido' : 'Seleccionar Sonido'}
        </Button>
      </Upload>
    </Card>
  );
};

export default KdsSoundSettings;