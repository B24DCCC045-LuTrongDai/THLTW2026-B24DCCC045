import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Button, Modal, Form, Input, InputNumber, Popconfirm, 
  message, Card, Tabs, Tag, Select, DatePicker, Row, Col, 
  Statistic, Slider, Space, Descriptions, Badge 
} from 'antd';
import { 
  DeleteOutlined, PlusOutlined, EditOutlined, 
  SearchOutlined, EyeOutlined, ShoppingCartOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

// --- DỮ LIỆU MẪU ---
const initialProducts = [
  { id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', price: 25000000, quantity: 15 },
  { id: 2, name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: 30000000, quantity: 8 },
  { id: 3, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22000000, quantity: 20 },
  { id: 4, name: 'iPad Air M2', category: 'Máy tính bảng', price: 18000000, quantity: 5 },
  { id: 5, name: 'MacBook Air M3', category: 'Laptop', price: 28000000, quantity: 12 },
  { id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
  { id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
  { id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 2500000, quantity: 25 },
];

const initialOrders = [
  { 
    id: 'DH001', 
    customerName: 'Nguyễn Văn A', 
    phone: '0912345678', 
    address: '123 Nguyễn Huệ, Q1, TP.HCM', 
    products: [{ productId: 1, productName: 'Laptop Dell XPS 13', quantity: 1, price: 25000000 }], 
    totalAmount: 25000000, 
    status: 'Chờ xử lý', 
    createdAt: '2024-01-15' 
  }
];

// --- COMPONENT CHÍNH ---
export default function ManagementApp() {
  // State quản lý dữ liệu
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  // State giao diện
  const [activeTab, setActiveTab] = useState('1');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  
  // State bộ lọc
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterPrice, setFilterPrice] = useState([0, 100000000]);
  const [filterStatus, setFilterStatus] = useState(null);
  
  const [formProduct] = Form.useForm();
  const [formOrder] = Form.useForm();

  // Lưu xuống LocalStorage mỗi khi data thay đổi
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // --- LOGIC THỐNG KÊ (DASHBOARD) ---
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const inventoryValue = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalOrders = orders.length;
    const revenue = orders
      .filter(o => o.status === 'Hoàn thành')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    
    return { totalProducts, inventoryValue, totalOrders, revenue };
  }, [products, orders]);

  // --- LOGIC SẢN PHẨM ---
  const getStockStatus = (qty) => {
    if (qty === 0) return { color: 'red', text: 'Hết hàng' };
    if (qty <= 10) return { color: 'orange', text: 'Sắp hết' };
    return { color: 'green', text: 'Còn hàng' };
  };

  const handleSaveProduct = (values) => {
    if (editingProduct) {
      const updated = products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...values } : p);
      setProducts(updated);
      message.success('Cập nhật sản phẩm thành công');
    } else {
      const newProduct = { ...values, id: Date.now() };
      setProducts([...products, newProduct]);
      message.success('Thêm sản phẩm thành công');
    }
    setIsProductModalOpen(false);
    formProduct.resetFields();
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
    message.success('Đã xóa sản phẩm');
  };

  const filteredProducts = products.filter(item => {
    const matchName = item.name.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory = filterCategory ? item.category === filterCategory : true;
    const matchPrice = item.price >= filterPrice[0] && item.price <= filterPrice[1];
    const status = getStockStatus(item.quantity).text;
    const matchStatus = filterStatus ? status === filterStatus : true;
    return matchName && matchCategory && matchPrice && matchStatus;
  });

  // --- LOGIC ĐƠN HÀNG ---
  const handleCreateOrder = (values) => {
    const selectedItems = [];
    let total = 0;

    // Xử lý dữ liệu từ form (values.items là mảng id sản phẩm)
    // Lưu ý: Form này cần custom lại một chút để nhập số lượng cho từng món
    // Ở đây mình làm đơn giản hóa: values.orderItems là mảng các object { productId, quantity }
    
    const orderDetails = values.orderItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      total += product.price * item.quantity;
      return {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity
      };
    });

    const newOrder = {
      id: `DH${Date.now()}`,
      customerName: values.customerName,
      phone: values.phone,
      address: values.address,
      products: orderDetails,
      totalAmount: total,
      status: 'Chờ xử lý',
      createdAt: dayjs().format('YYYY-MM-DD')
    };

    setOrders([newOrder, ...orders]);
    setIsOrderModalOpen(false);
    formOrder.resetFields();
    message.success('Tạo đơn hàng thành công');
  };

  const handleStatusChange = (orderId, newStatus) => {
    const currentOrder = orders.find(o => o.id === orderId);
    const oldStatus = currentOrder.status;

    // Cập nhật kho
    let newProducts = [...products];

    // Nếu chuyển sang Hoàn thành -> Trừ kho
    if (newStatus === 'Hoàn thành' && oldStatus !== 'Hoàn thành') {
      let enoughStock = true;
      currentOrder.products.forEach(item => {
        const productIndex = newProducts.findIndex(p => p.id === item.productId);
        if (newProducts[productIndex].quantity < item.quantity) enoughStock = false;
      });

      if (!enoughStock) {
        message.error('Không đủ tồn kho để hoàn thành đơn này!');
        return;
      }

      currentOrder.products.forEach(item => {
        const productIndex = newProducts.findIndex(p => p.id === item.productId);
        if (productIndex > -1) {
          newProducts[productIndex].quantity -= item.quantity;
        }
      });
      setProducts(newProducts);
    }

    // Nếu chuyển sang Đã hủy (từ Hoàn thành) -> Cộng lại kho
    if (newStatus === 'Đã hủy' && oldStatus === 'Hoàn thành') {
      currentOrder.products.forEach(item => {
        const productIndex = newProducts.findIndex(p => p.id === item.productId);
        if (productIndex > -1) {
          newProducts[productIndex].quantity += item.quantity;
        }
      });
      setProducts(newProducts);
    }

    // Cập nhật trạng thái đơn
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updatedOrders);
    message.success(`Đã chuyển trạng thái sang ${newStatus}`);
  };

  // --- COLUMN DEFINITIONS ---
  const productColumns = [
    { title: 'STT', render: (_, __, index) => index + 1 },
    { title: 'Tên sản phẩm', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Danh mục', dataIndex: 'category' },
    { title: 'Giá', dataIndex: 'price', render: v => v.toLocaleString() + ' đ', sorter: (a, b) => a.price - b.price },
    { title: 'SL', dataIndex: 'quantity', sorter: (a, b) => a.quantity - b.quantity },
    { 
      title: 'Trạng thái', 
      key: 'status',
      render: (_, r) => {
        const { color, text } = getStockStatus(r.quantity);
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => {
            setEditingProduct(r);
            formProduct.setFieldsValue(r);
            setIsProductModalOpen(true);
          }} />
          <Popconfirm title="Xóa?" onConfirm={() => handleDeleteProduct(r.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const orderColumns = [
    { title: 'Mã ĐH', dataIndex: 'id' },
    { title: 'Khách hàng', dataIndex: 'customerName' },
    { title: 'Ngày tạo', dataIndex: 'createdAt', sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix() },
    { title: 'Số SP', render: (_, r) => r.products.reduce((acc, i) => acc + i.quantity, 0) },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', render: v => v.toLocaleString() + ' đ', sorter: (a, b) => a.totalAmount - b.totalAmount },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status',
      render: (status, record) => (
        <Select 
          value={status} 
          onChange={(val) => handleStatusChange(record.id, val)}
          style={{ width: 120 }}
          disabled={status === 'Đã hủy'}
        >
          <Option value="Chờ xử lý">Chờ xử lý</Option>
          <Option value="Đang giao">Đang giao</Option>
          <Option value="Hoàn thành">Hoàn thành</Option>
          <Option value="Đã hủy">Đã hủy</Option>
        </Select>
      )
    },
    {
      title: 'Thao tác',
      render: (_, r) => (
        <Button icon={<EyeOutlined />} onClick={() => { setViewingOrder(r); setIsOrderDetailOpen(true); }} />
      )
    }
  ];

  // --- RENDER ---
  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      
      {/* 1. DASHBOARD */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="Tổng sản phẩm" value={stats.totalProducts} prefix={<ShoppingCartOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Giá trị tồn kho" value={stats.inventoryValue} suffix="đ" precision={0} /></Card></Col>
        <Col span={6}><Card><Statistic title="Tổng đơn hàng" value={stats.totalOrders} /></Card></Col>
        <Col span={6}><Card><Statistic title="Doanh thu" value={stats.revenue} suffix="đ" precision={0} valueStyle={{ color: '#3f8600' }} /></Card></Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          
          {/* 2. TAB QUẢN LÝ SẢN PHẨM */}
          <Tabs.TabPane tab="Quản lý Sản phẩm" key="1">
            <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
              <Input placeholder="Tìm tên SP" prefix={<SearchOutlined />} onChange={e => setSearchText(e.target.value)} style={{ width: 200 }} />
              <Select placeholder="Danh mục" allowClear onChange={setFilterCategory} style={{ width: 150 }}>
                {['Laptop', 'Điện thoại', 'Máy tính bảng', 'Phụ kiện'].map(c => <Option key={c} value={c}>{c}</Option>)}
              </Select>
              <Select placeholder="Trạng thái" allowClear onChange={setFilterStatus} style={{ width: 120 }}>
                <Option value="Còn hàng">Còn hàng</Option>
                <Option value="Sắp hết">Sắp hết</Option>
                <Option value="Hết hàng">Hết hàng</Option>
              </Select>
              <div style={{ width: 200, marginLeft: 10 }}>
                <Slider range defaultValue={[0, 100000000]} max={100000000} onChange={setFilterPrice} tooltip={{ formatter: v => (v/1000000) + 'tr' }} />
              </div>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingProduct(null); formProduct.resetFields(); setIsProductModalOpen(true); }}>Thêm mới</Button>
            </Space>
            
            <Table 
              dataSource={filteredProducts} 
              columns={productColumns} 
              rowKey="id" 
              pagination={{ pageSize: 5 }} 
            />
          </Tabs.TabPane>

          {/* 3. TAB QUẢN LÝ ĐƠN HÀNG */}
          <Tabs.TabPane tab="Quản lý Đơn hàng" key="2">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsOrderModalOpen(true)} style={{ marginBottom: 16 }}>Tạo đơn hàng</Button>
            <Table dataSource={orders} columns={orderColumns} rowKey="id" />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* MODAL THÊM/SỬA SẢN PHẨM */}
      <Modal 
        title={editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"} 
        open={isProductModalOpen} 
        onOk={() => formProduct.submit()} 
        onCancel={() => setIsProductModalOpen(false)}
      >
        <Form form={formProduct} layout="vertical" onFinish={handleSaveProduct}>
          <Form.Item name="name" label="Tên SP" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
            <Select>
              {['Laptop', 'Điện thoại', 'Máy tính bảng', 'Phụ kiện'].map(c => <Option key={c} value={c}>{c}</Option>)}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* MODAL TẠO ĐƠN HÀNG */}
      <Modal title="Tạo đơn hàng mới" width={700} open={isOrderModalOpen} onOk={() => formOrder.submit()} onCancel={() => setIsOrderModalOpen(false)}>
        <Form form={formOrder} layout="vertical" onFinish={handleCreateOrder}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="customerName" label="Tên khách hàng" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, pattern: /^[0-9]{10,11}$/, message: 'SĐT không hợp lệ' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          
          <Form.List name="orderItems" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                    <Col span={10}>
                      <Form.Item {...restField} name={[name, 'productId']} rules={[{ required: true, message: 'Chọn SP' }]} style={{ margin: 0 }}>
                        <Select placeholder="Chọn sản phẩm" onChange={() => {
                           // Trick để trigger re-render validation nếu cần
                           formOrder.validateFields();
                        }}>
                          {products.filter(p => p.quantity > 0).map(p => (
                            <Option key={p.id} value={p.id}>{p.name} (Tồn: {p.quantity})</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item 
                        {...restField} 
                        name={[name, 'quantity']} 
                        rules={[
                          { required: true, message: 'Nhập SL' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              // Custom Validation: Check tồn kho ngay lúc nhập
                              const row = getFieldValue(['orderItems', name]);
                              const product = products.find(p => p.id === row?.productId);
                              if (product && value > product.quantity) {
                                return Promise.reject(new Error(`Max: ${product.quantity}`));
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]} 
                        style={{ margin: 0 }}
                      >
                        <InputNumber placeholder="SL" min={1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Button danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm sản phẩm</Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      <Modal title="Chi tiết đơn hàng" open={isOrderDetailOpen} onCancel={() => setIsOrderDetailOpen(false)} footer={null} width={600}>
        {viewingOrder && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Mã ĐH">{viewingOrder.id}</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{viewingOrder.customerName} - {viewingOrder.phone}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{viewingOrder.address}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{viewingOrder.createdAt}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><Tag>{viewingOrder.status}</Tag></Descriptions.Item>
            </Descriptions>
            <Table 
              style={{ marginTop: 20 }}
              dataSource={viewingOrder.products}
              rowKey="productId"
              pagination={false}
              columns={[
                { title: 'Sản phẩm', dataIndex: 'productName' },
                { title: 'Đơn giá', dataIndex: 'price', render: v => v.toLocaleString() },
                { title: 'SL', dataIndex: 'quantity' },
                { title: 'Thành tiền', render: (_, r) => (r.price * r.quantity).toLocaleString() }
              ]}
            />
            <div style={{ textAlign: 'right', marginTop: 10, fontSize: 18, fontWeight: 'bold' }}>
              Tổng cộng: {viewingOrder.totalAmount.toLocaleString()} đ
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}