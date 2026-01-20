import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Popconfirm, message, Card } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

// Dữ liệu mẫu
const initialData = [
  { id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
  { id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
  { id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
  { id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
];

export default function ProductPage() {
  const [dataSource, setDataSource] = useState(initialData); // Dữ liệu gốc
  const [displayData, setDisplayData] = useState(initialData); // Dữ liệu hiển thị (sau khi lọc)
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái Modal
  const [form] = Form.useForm(); // Hook của Form

  // 1. Hàm Xóa
  const handleDelete = (id: number) => {
    const newData = dataSource.filter((item) => item.id !== id);
    setDataSource(newData);
    setDisplayData(newData);
    message.success('Xóa thành công!');
  };

  // 2. Hàm Tìm kiếm Realtime
  const handleSearch = (e: any) => {
    const currValue = e.target.value;
    const filteredData = dataSource.filter((entry) =>
      entry.name.toLowerCase().includes(currValue.toLowerCase())
    );
    setDisplayData(filteredData);
  };

  // 3. Hàm Thêm mới (khi bấm OK ở Modal)
  const onFinish = (values: any) => {
    const newProduct = {
      id: Date.now(), // Fake ID
      name: values.name,
      price: values.price,
      quantity: values.quantity,
    };
    
    // Cập nhật state
    const newData = [...dataSource, newProduct];
    setDataSource(newData);
    setDisplayData(newData); // Cập nhật luôn bảng hiển thị
    
    // Đóng và reset
    setIsModalOpen(false);
    form.resetFields();
    message.success('Thêm mới thành công!');
  };

  // Cấu hình cột bảng
  const columns = [
    { title: 'STT', render: (_: any, __: any, index: number) => index + 1 },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    { 
      title: 'Giá', 
      dataIndex: 'price', 
      key: 'price',
      render: (val: number) => val.toLocaleString() + ' đ' 
    },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Popconfirm
          title="Xác nhận xóa?"
          description="Hành động này không thể hoàn tác"
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button danger type="dashed" icon={<DeleteOutlined />}>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Card title="Quản lý sản phẩm" extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Thêm sản phẩm
          </Button>
      }>
        
        {/* Ô Tìm kiếm */}
        <Input.Search
          placeholder="Tìm theo tên sản phẩm..."
          onChange={handleSearch}
          style={{ marginBottom: 16, maxWidth: 400 }}
          allowClear
        />

        {/* Bảng dữ liệu */}
        <Table 
            dataSource={displayData} 
            columns={columns} 
            rowKey="id" 
            bordered
        />

        {/* Modal Thêm mới */}
        <Modal
          title="Thêm sản phẩm mới"
          open={isModalOpen}
          onOk={() => form.submit()} // Khi bấm OK thì kích hoạt submit form
          onCancel={() => setIsModalOpen(false)}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="name"
              label="Tên sản phẩm"
              rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
            >
              <Input placeholder="Nhập tên sản phẩm" />
            </Form.Item>

            <Form.Item
              name="price"
              label="Giá"
              rules={[
                { required: true, message: 'Vui lòng nhập giá!' },
                { type: 'number', min: 1, message: 'Giá phải lớn hơn 0' }
              ]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="Nhập giá" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng!' },
                { type: 'number', min: 1, message: 'Phải là số nguyên dương' }
              ]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="Nhập số lượng" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
}