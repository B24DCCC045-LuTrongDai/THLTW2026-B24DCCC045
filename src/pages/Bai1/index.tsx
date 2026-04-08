import React, { useState, useMemo } from 'react';
import { Tabs, Card, Row, Col, Select, Rate, Button, List, Form, Input, InputNumber, Upload, Table, Alert, Statistic, Modal, Progress } from 'antd';
import { UploadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import rules from '@/utils/rules';

const initialDestinations = [
  { id: 1, name: 'Vịnh Hạ Long', type: 'biển', image: 'https://cdn-media.sforum.vn/storage/app/media/anh-vinh-ha-long-45.jpg', rating: 5, desc: 'Kỳ quan thế giới', time: 4, food: 1000000, stay: 1500000, transport: 500000 },
  { id: 2, name: 'Sapa', type: 'núi', image: 'https://images.ctfassets.net/bth3mlrehms2/7FcLwVhbiIEnclUtcPl3Ua/15d6b769c12d2fbdafc43c4b3f9f6c21/Vietnam__Sapa__Reisterrassaen_und_Fluss.jpg?w=2122&h=1193&fl=progressive&q=50&fm=jpg', rating: 4, desc: 'Thành phố sương mù', time: 6, food: 800000, stay: 1200000, transport: 800000 },
  { id: 3, name: 'Đà Nẵng', type: 'thành phố', image: 'https://cdn3.ivivu.com/2022/09/c%E1%BA%A7u-r%E1%BB%93ng-%C4%91%C3%A0-n%E1%BA%B5ng-ivivu-4.jpg', rating: 5, desc: 'Thành phố đáng sống', time: 5, food: 1200000, stay: 2000000, transport: 600000 }
];

const Home = ({ destinations }) => {
  const [filterType, setFilterType] = useState('all');
  const [sortPrice, setSortPrice] = useState('asc');

  const filteredData = useMemo(() => {
    let data = filterType === 'all' ? [...destinations] : destinations.filter(d => d.type === filterType);
    return data.sort((a, b) => {
      const priceA = a.food + a.stay + a.transport;
      const priceB = b.food + b.stay + b.transport;
      return sortPrice === 'asc' ? priceA - priceB : priceB - priceA;
    });
  }, [destinations, filterType, sortPrice]);

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Select value={filterType} onChange={setFilterType} style={{ width: '100%' }}>
            <Select.Option value="all">Tất cả loại hình</Select.Option>
            <Select.Option value="biển">Biển</Select.Option>
            <Select.Option value="núi">Núi</Select.Option>
            <Select.Option value="thành phố">Thành phố</Select.Option>
          </Select>
        </Col>
        <Col xs={24} sm={12}>
          <Select value={sortPrice} onChange={setSortPrice} style={{ width: '100%' }}>
            <Select.Option value="asc">Giá tăng dần</Select.Option>
            <Select.Option value="desc">Giá giảm dần</Select.Option>
          </Select>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        {filteredData.map(item => (
          <Col xs={24} sm={12} md={8} key={item.id}>
            <Card 
              hoverable 
              cover={
                <img 
                  alt={item.name} 
                  src={item.image} 
                  style={{ height: 200, objectFit: 'cover' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200.png?text=Lỗi+Ảnh'; }} 
                />
              }
            >
              <Card.Meta title={item.name} description={item.desc} />
              <div style={{ marginTop: 10 }}>
                <Rate disabled defaultValue={item.rating} />
                <p>Tổng chi phí: {(item.food + item.stay + item.transport).toLocaleString()} VND</p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

const Planner = ({ destinations, itinerary, setItinerary }) => {
  const [selectedDest, setSelectedDest] = useState(null);
  const [day, setDay] = useState(1);

  const addDestination = () => {
    if (!selectedDest) return;
    const dest = destinations.find(d => d.id === selectedDest);
    setItinerary([...itinerary, { ...dest, itId: Date.now(), day }]);
  };

  const removeDestination = (itId) => {
    setItinerary(itinerary.filter(i => i.itId !== itId));
  };

  const move = (index, direction) => {
    const newIt = [...itinerary];
    if (direction === 'up' && index > 0) {
      [newIt[index - 1], newIt[index]] = [newIt[index], newIt[index - 1]];
    } else if (direction === 'down' && index < newIt.length - 1) {
      [newIt[index + 1], newIt[index]] = [newIt[index], newIt[index + 1]];
    }
    setItinerary(newIt);
  };

  const totalTime = itinerary.reduce((sum, item) => sum + item.time, 0);
  const totalCost = itinerary.reduce((sum, item) => sum + item.food + item.stay + item.transport, 0);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card title="Thêm điểm đến">
          <Select style={{ width: '100%', marginBottom: 10 }} placeholder="Chọn điểm đến" onChange={setSelectedDest}>
            {destinations.map(d => <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>)}
          </Select>
          <InputNumber min={1} value={day} onChange={setDay} style={{ width: '100%', marginBottom: 10 }} placeholder="Ngày thứ mấy" />
          <Button type="primary" onClick={addDestination} block>Thêm vào lịch trình</Button>
          <div style={{ marginTop: 20 }}>
            <p>Tổng thời gian: {totalTime} giờ</p>
            <p>Tổng ngân sách: {totalCost.toLocaleString()} VND</p>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={16}>
        <List
          header={<div>Lịch trình chi tiết</div>}
          bordered
          dataSource={itinerary}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <Button icon={<ArrowUpOutlined />} onClick={() => move(index, 'up')} />,
                <Button icon={<ArrowDownOutlined />} onClick={() => move(index, 'down')} />,
                <Button danger onClick={() => removeDestination(item.itId)}>Xóa</Button>
              ]}
            >
              <List.Item.Meta title={`Ngày ${item.day}: ${item.name}`} description={`${item.time} giờ - ${(item.food + item.stay + item.transport).toLocaleString()} VND`} />
            </List.Item>
          )}
        />
      </Col>
    </Row>
  );
};

const Budget = ({ itinerary }) => {
  const [budgetLimit, setBudgetLimit] = useState(5000000);

  let food = 0, stay = 0, transport = 0;
  itinerary.forEach(item => {
    food += item.food;
    stay += item.stay;
    transport += item.transport;
  });

  const totalCost = food + stay + transport;
  const getPercent = (value) => totalCost === 0 ? 0 : Number(((value / totalCost) * 100).toFixed(1));

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24}>
        <Card>
          <InputNumber style={{ width: 200 }} value={budgetLimit} onChange={setBudgetLimit} addonBefore="Ngân sách tối đa" />
          {totalCost > budgetLimit && (
            <Alert message="Cảnh báo: Lịch trình hiện tại đã vượt quá ngân sách!" type="error" showIcon style={{ marginTop: 10 }} />
          )}
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Phân bổ ngân sách (VNĐ)">
          <div style={{ marginBottom: 10 }}>Ăn uống ({food.toLocaleString()}) <Progress percent={getPercent(food)} strokeColor="#1890ff" /></div>
          <div style={{ marginBottom: 10 }}>Lưu trú ({stay.toLocaleString()}) <Progress percent={getPercent(stay)} strokeColor="#52c41a" /></div>
          <div style={{ marginBottom: 10 }}>Di chuyển ({transport.toLocaleString()}) <Progress percent={getPercent(transport)} strokeColor="#faad14" /></div>
        </Card>
      </Col>
    </Row>
  );
};

const Admin = ({ destinations, setDestinations }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    let imageUrl = 'https://picsum.photos/300/200';
    
    // Lấy link ảnh thực tế mà người dùng tải lên thông qua URL.createObjectURL
    if (values.upload && values.upload.length > 0) {
      imageUrl = URL.createObjectURL(values.upload[0].originFileObj);
    }

    setDestinations([...destinations, { ...values, id: Date.now(), image: imageUrl }]);
    setIsModalOpen(false);
    form.resetFields();
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const columns = [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Loại', dataIndex: 'type', key: 'type' },
    { title: 'Đánh giá', dataIndex: 'rating', key: 'rating' },
    { title: 'Hành động', key: 'action', render: (_, record) => <Button danger onClick={() => setDestinations(destinations.filter(d => d.id !== record.id))}>Xóa</Button> }
  ];

  const statsData = [
    { month: 'Tháng 1', count: 120, revenue: 450000000 },
    { month: 'Tháng 2', count: 150, revenue: 600000000 },
    { month: 'Tháng 3', count: 180, revenue: 750000000 },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}><Card><Statistic title="Lượt tạo lịch trình" value={180} /></Card></Col>
        <Col xs={24} sm={8}><Card><Statistic title="Địa điểm phổ biến nhất" value="Vịnh Hạ Long" /></Card></Col>
        <Col xs={24} sm={8}><Card><Statistic title="Tổng doanh thu (VND)" value={750000000} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Thống kê lịch trình & doanh thu theo tháng">
            <List
              dataSource={statsData}
              renderItem={item => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div><strong>{item.month}</strong>: {item.count} lượt - Doanh thu: {item.revenue.toLocaleString()} VND</div>
                    <Progress percent={Number(((item.revenue / 750000000) * 100).toFixed(1))} status="active" />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Quản lý điểm đến" extra={<Button type="primary" onClick={() => setIsModalOpen(true)}>Thêm mới</Button>}>
            <Table dataSource={destinations} columns={columns} rowKey="id" scroll={{ x: 500 }} />
          </Card>
        </Col>
      </Row>

      <Modal title="Thêm điểm đến" visible={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="name" label="Tên địa điểm" rules={rules.ten}><Input /></Form.Item>
          <Form.Item name="type" label="Loại hình" rules={rules.required}><Select><Select.Option value="biển">Biển</Select.Option><Select.Option value="núi">Núi</Select.Option><Select.Option value="thành phố">Thành phố</Select.Option></Select></Form.Item>
          <Form.Item name="desc" label="Mô tả" rules={rules.text}><Input.TextArea /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="time" label="Thời gian tham quan (giờ)" rules={rules.float(24)}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="rating" label="Đánh giá" rules={rules.float(5)}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="food" label="Ăn uống" rules={rules.required}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="stay" label="Lưu trú" rules={rules.required}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="transport" label="Di chuyển" rules={rules.required}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="upload" label="Hình ảnh" valuePropName="fileList" getValueFromEvent={normFile}>
            <Upload beforeUpload={() => false} maxCount={1} accept="image/*">
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const TravelApp = () => {
  const [destinations, setDestinations] = useState(initialDestinations);
  const [itinerary, setItinerary] = useState([]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Trang chủ" key="1">
          <Home destinations={destinations} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Lên lịch trình" key="2">
          <Planner destinations={destinations} itinerary={itinerary} setItinerary={setItinerary} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Ngân sách" key="3">
          <Budget itinerary={itinerary} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Admin" key="4">
          <Admin destinations={destinations} setDestinations={setDestinations} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default TravelApp;