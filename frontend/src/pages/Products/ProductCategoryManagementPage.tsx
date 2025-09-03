import React, { useState, useEffect, FC, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Space,
  Card,
  Typography,
  Switch,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MenuOutlined,
  UndoOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ProductCategory,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from '../../types/product-category';
import {
  getAllProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  restoreProductCategory,
  reorderProductCategories,
  importProductCategories,
  exportProductCategories,
} from '../../services/productCategories';
import { downloadCsv } from '../../services/csv';

const { Title } = Typography;

interface DraggableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const DraggableRow: FC<DraggableRowProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    cursor: 'move',
    ...(isDragging ? { position: 'relative', zIndex: 1 } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </tr>
  );
};

const ProductCategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [form] = Form.useForm();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllProductCategories(showDeleted);
      setCategories(data);
    } catch (error) {
      message.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const showModal = (category?: ProductCategory) => {
    if (category) {
      setEditingCategory(category);
      form.setFieldsValue(category);
    } else {
      setEditingCategory(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        await updateProductCategory(editingCategory.id, values as UpdateProductCategoryDto);
        message.success('Categoría actualizada con éxito');
      } else {
        await createProductCategory(values as CreateProductCategoryDto);
        message.success('Categoría creada con éxito');
      }
      fetchCategories();
      handleCancel();
    } catch (error) {
      message.error('Ocurrió un error al guardar la categoría');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProductCategory(id);
      message.success('Categoría eliminada con éxito');
      fetchCategories();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al eliminar la categoría. Asegúrese de que no tenga productos asociados.');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreProductCategory(id);
      message.success('Categoría restaurada con éxito');
      fetchCategories();
    } catch (error) {
      message.error('Error al restaurar la categoría');
    }
  };

  const handleExport = async () => {
    try {
      const csvData = await exportProductCategories();
      downloadCsv(csvData, 'product-categories.csv');
      message.success('Exportación de categorías completada.');
    } catch (error) {
      message.error('Error al exportar las categorías.');
    }
  };

  const handleImport = async (file: File) => {
    try {
      const response = await importProductCategories(file);
      message.success(`Importación completada: ${response.created} creadas, ${response.updated} actualizadas.`);
      fetchCategories();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al importar el archivo.';
      message.error(errorMessage);
    }
    return false; // Evita la subida automática de Ant Design
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Permite hacer clic en los botones sin iniciar el arrastre
        distance: 1,
      },
    }),
  );

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const oldCategories = [...categories];
      const activeIndex = oldCategories.findIndex((i) => i.id === active.id);
      const overIndex = oldCategories.findIndex((i) => i.id === over?.id);
      const newCategories = arrayMove(oldCategories, activeIndex, overIndex);
      setCategories(newCategories); // Actualización optimista

      try {
        const orderedIds = newCategories.map((cat: ProductCategory) => cat.id);
        await reorderProductCategories(orderedIds);
        message.success('Orden de categorías actualizado.');
      } catch (error) {
        message.error('No se pudo actualizar el orden. Revirtiendo cambios.');
        setCategories(oldCategories); // Revertir en caso de error
      }
    }
  };

  const columns = [
    { key: 'sort', align: 'center' as const, width: 60, render: () => <MenuOutlined style={{ cursor: 'grab', touchAction: 'none' }} /> },
    { title: 'Nombre', dataIndex: 'name', key: 'name', sorter: (a: ProductCategory, b: ProductCategory) => a.name.localeCompare(b.name) },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: ProductCategory) => (
        record.deletedAt ? (
          <Popconfirm
            title="¿Restaurar esta categoría?"
            onConfirm={() => handleRestore(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<UndoOutlined />} type="link">Restaurar</Button>
          </Popconfirm>
        ) : (
          <Space size="middle">
            <Button icon={<EditOutlined />} type="link" onClick={() => showModal(record)}>
              Editar
            </Button>
            <Popconfirm
              title="¿Estás seguro de eliminar esta categoría?"
              description="Los productos asociados no se eliminarán."
              onConfirm={() => handleDelete(record.id)}
              okText="Sí"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} type="link" danger>
                Eliminar
              </Button>
            </Popconfirm>
          </Space>
        )
      ),
    },
  ];

  return (
    <Card>
      <Title level={2}>Gestión de Categorías de Productos</Title>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Crear Categoría
        </Button>
        <Space>
          <span>Mostrar eliminadas</span>
          <Switch checked={showDeleted} onChange={setShowDeleted} />
        </Space>
      </Space>
      <DndContext sensors={sensors} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={categories.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <Table
            components={{
              body: {
                row: DraggableRow,
              },
            }}
            columns={columns}
            dataSource={categories}
            rowKey="id"
            loading={loading}
            pagination={false}
            rowClassName={(record) => (record.deletedAt ? 'deleted-row' : '')}
          />
        </SortableContext>
      </DndContext>
      <Modal
        title={editingCategory ? 'Editar Categoría' : 'Crear Categoría'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Guardar"
        cancelText="Cancelar"
        destroyOnClose
      >
        <Form form={form} layout="vertical" name="category_form">
          <Form.Item
            name="name"
            label="Nombre de la Categoría"
            rules={[{ required: true, message: 'Por favor, ingresa el nombre.' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProductCategoryManagementPage;