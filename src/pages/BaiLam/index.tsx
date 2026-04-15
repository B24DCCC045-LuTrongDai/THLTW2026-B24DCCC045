import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message, Space, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import rules from '@/utils/rules';

const { Option } = Select;

const roomTypes = ['Lý thuyết', 'Thực hành', 'Hội trường'];

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [managers, setManagers] = useState(['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C']);
  const [newManagerName, setNewManagerName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const filteredRooms = rooms.filter(
    (r) =>
      r.code.toLowerCase().includes(searchText.toLowerCase()) ||
      r.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDelete = (id) => {
    setRooms(rooms.filter((r) => r.id !== id));
    message.success('Đã xóa phòng thành công');
  };

  const handleAddManager = (e) => {
    e.preventDefault();
    const name = newManagerName.trim();
    if (name && !managers.includes(name)) {
      setManagers([...managers, name]);
      setNewManagerName('');
      message.success('Đã thêm người phụ trách');
    }
  };

  const handleDeleteManager = (name) => {
    setManagers(managers.filter((m) => m !== name));
    if (form.getFieldValue('manager') === name) {
      form.setFieldsValue({ manager: undefined });
    }
    message.success('Đã xóa người phụ trách');
  };

  const columns = [
    { title: 'Mã phòng', dataIndex: 'code' },
    { title: 'Tên phòng', dataIndex: 'name' },
    { title: 'Số chỗ ngồi', dataIndex: 'capacity', sorter: (a, b) => a.capacity - b.capacity },
    {
      title: 'Loại phòng',
      dataIndex: 'type',
      filters: roomTypes.map((t) => ({ text: t, value: t })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Người phụ trách',
      dataIndex: 'manager',
      filters: managers.map((m) => ({ text: m, value: m })),
      onFilter: (value, record) => record.manager === value,
    },
    {
      title: 'Hành động',
      render: (_, record) => (
        <Space>
          <Button onClick={() => openModal(record)}>Sửa</Button>
          {record.capacity < 30 && (
            <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.id)} okText="Có" cancelText="Không">
              <Button danger>Xóa</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const openModal = (record = null) => {
    setEditingId(record ? record.id : null);
    if (record) form.setFieldsValue(record);
    else form.resetFields();
    setIsModalVisible(true);
  };

  const handleFinish = (values) => {
    if (editingId) {
      setRooms(rooms.map((r) => (r.id === editingId ? { ...r, ...values } : r)));
    } else {
      setRooms([...rooms, { id: Date.now(), ...values }]);
    }
    setIsModalVisible(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm mã hoặc tên phòng"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
        <Button type="primary" onClick={() => openModal()}>Thêm phòng</Button>
      </Space>

      <Table columns={columns} dataSource={filteredRooms} rowKey="id" />

      <Modal
        title={editingId ? 'Chỉnh sửa phòng' : 'Thêm phòng học'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleFinish} layout="vertical">
          <Form.Item name="code" label="Mã phòng" rules={[...rules.required, ...rules.length(10)]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Tên phòng" rules={[...rules.required, ...rules.length(50)]}>
            <Input />
          </Form.Item>
          <Form.Item name="capacity" label="Số chỗ ngồi" rules={[...rules.required, ...rules.number(200, 10, false)]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="type" label="Loại phòng" rules={rules.required}>
            <Select placeholder="Chọn loại phòng">
              {roomTypes.map((t) => <Option key={t} value={t}>{t}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="manager" label="Người phụ trách" rules={rules.required}>
            <Select
              placeholder="Chọn hoặc thêm người phụ trách"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Space style={{ padding: '0 8px 4px' }}>
                    <Input
                      placeholder="Tên người mới"
                      value={newManagerName}
                      onChange={(e) => setNewManagerName(e.target.value)}
                      onPressEnter={handleAddManager}
                    />
                    <Button type="text" icon={<PlusOutlined />} onClick={handleAddManager}>
                      Thêm
                    </Button>
                  </Space>
                </>
              )}
            >
              {managers.map((m) => (
                <Option key={m} value={m} label={m}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{m}</span>
                    <div 
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Popconfirm 
                        title="Bạn có chắc muốn xóa người này?" 
                        onConfirm={() => handleDeleteManager(m)}
                        okText="Có"
                        cancelText="Không"
                      >
                        <DeleteOutlined style={{ color: '#ff4d4f', cursor: 'pointer' }} />
                      </Popconfirm>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomManagement;