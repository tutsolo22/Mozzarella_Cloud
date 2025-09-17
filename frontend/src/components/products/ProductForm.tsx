import { Modal, Form, Input, InputNumber, Select, Button, Upload, notification } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Product, ProductCategory } from '../../types/product';
import { createProduct, updateProduct, uploadProductImage, getProductCategories } from '../../services/api';

interface ProductFormProps {
  open: boolean;
  onClose: (shouldReload: boolean) => void;
  product: Product | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ open, onClose, product }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getProductCategories();
        setCategories(data);
      } catch (error) {
        notification.error({ message: 'Error al cargar categorías' });
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  useEffect(() => {
    if (product) {
      form.setFieldsValue(product);
      if (product.imageUrl) {
        setFileList([{ uid: '-1', name: 'imagen_actual.png', status: 'done', url: product.imageUrl }]);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [product, form, open]);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      let savedProduct;
      if (product) {
        savedProduct = await updateProduct(product.id, values);
      } else {
        savedProduct = await createProduct(values);
      }

      // Si hay un archivo nuevo para subir
      const newFile = fileList.find(f => f.originFileObj);
      if (newFile) {
        await uploadProductImage(savedProduct.id, newFile.originFileObj);
      }

      notification.success({ message: `Producto ${product ? 'actualizado' : 'creado'} con éxito` });
      onClose(true);
    } catch (err) {
      notification.error({ message: 'Error al guardar el producto' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList.slice(-1)); // Solo permitir un archivo
  };

  return (
    <Modal
      title={product ? 'Editar Producto' : 'Añadir Producto'}
      open={open}
      onCancel={() => onClose(false)}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="name" label="Nombre" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Descripción">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="price" label="Precio" rules={[{ required: true, type: 'number', min: 0 }]}>
          <InputNumber style={{ width: '100%' }} prefix="$" />
        </Form.Item>
        <Form.Item name="categoryId" label="Categoría" rules={[{ required: true }]}>
          <Select placeholder="Selecciona una categoría" loading={categories.length === 0}>
            {categories.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Imagen del Producto">
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false} // Prevenir subida automática
          >
            <Button icon={<UploadOutlined />}>Seleccionar Archivo</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            {product ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductForm;