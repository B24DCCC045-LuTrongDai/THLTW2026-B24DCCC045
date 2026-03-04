import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, DatePicker, InputNumber, Select, Progress, Tag, Tabs, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import rules from '@/utils/rules';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const Bai2 = () => {
  const [categories, setCategories] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY-MM'));
  
  const [form] = Form.useForm();

  useEffect(() => {
    const loadData = () => {
      setCategories(JSON.parse(localStorage.getItem('categories') || '[]'));
      setSessions(JSON.parse(localStorage.getItem('sessions') || '[]'));
      setGoals(JSON.parse(localStorage.getItem('goals') || '[]'));
    };
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  const showModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (item) {
      const values = { ...item };
      if (type === 'session' && item.studyDate) {
        values.studyDate = moment(item.studyDate);
      }
      form.setFieldsValue(values);
    } else {
      form.resetFields();
      if (type === 'session') form.setFieldsValue({ duration: 60 });
      if (type === 'goal') form.setFieldsValue({ type: 'subject', target: 300 });
    }
    setModalVisible(true);
  };

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    if (modalType === 'category') {
      if (editingItem) {
        setCategories(categories.map(c => c.id === editingItem.id ? { ...c, ...values } : c));
        message.success('Cập nhật thành công');
      } else {
        setCategories([...categories, { id: Date.now(), ...values }]);
        message.success('Thêm thành công');
      }
    }

    if (modalType === 'session') {
      const sessionData = { ...values, studyDate: values.studyDate.format() };
      if (editingItem) {
        setSessions(sessions.map(s => s.id === editingItem.id ? { ...s, ...sessionData } : s));
        message.success('Cập nhật thành công');
      } else {
        setSessions([...sessions, { id: Date.now(), ...sessionData }]);
        message.success('Thêm thành công');
      }
    }

    if (modalType === 'goal') {
      const goalData = { ...values, month: currentMonth };
      if (editingItem) {
        setGoals(goals.map(g => g.id === editingItem.id ? { ...g, ...goalData } : g));
        message.success('Cập nhật thành công');
      } else {
        setGoals([...goals, { id: Date.now(), ...goalData }]);
        message.success('Thêm thành công');
      }
    }

    setModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleDelete = (type, id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa?',
      onOk: () => {
        if (type === 'category') setCategories(categories.filter(c => c.id !== id));
        if (type === 'session') setSessions(sessions.filter(s => s.id !== id));
        if (type === 'goal') setGoals(goals.filter(g => g.id !== id));
        message.success('Xóa thành công');
      }
    });
  };

  const getProgress = (goal) => {
    const monthSessions = sessions.filter(s => moment(s.studyDate).format('YYYY-MM') === currentMonth);
    if (goal.type === 'subject') {
      const subjectSessions = monthSessions.filter(s => s.categoryId === goal.categoryId);
      const total = subjectSessions.reduce((sum, s) => sum + s.duration, 0);
      return Math.min(Math.round((total / goal.target) * 100), 100);
    }
    const total = monthSessions.reduce((sum, s) => sum + s.duration, 0);
    return Math.min(Math.round((total / goal.target) * 100), 100);
  };

  const columns = {
    category: [
      { title: 'Tên môn', dataIndex: 'name' },
      { title: 'Mô tả', dataIndex: 'description' },
      { title: '', render: (_, r) => <>
        <Button icon={<EditOutlined />} size="small" onClick={() => showModal('category', r)} />
        <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete('category', r.id)} />
      </> }
    ],
    session: [
      { title: 'Môn', render: (_, r) => categories.find(c => c.id === r.categoryId)?.name },
      { title: 'Thời gian', render: (_, r) => moment(r.studyDate).format('DD/MM/YYYY HH:mm') },
      { title: 'Thời lượng', dataIndex: 'duration' },
      { title: 'Nội dung', dataIndex: 'content' },
      { title: 'Ghi chú', dataIndex: 'notes' },
      { title: '', render: (_, r) => <>
        <Button icon={<EditOutlined />} size="small" onClick={() => showModal('session', r)} />
        <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete('session', r.id)} />
      </> }
    ],
    goal: [
      { title: 'Loại', render: (_, r) => r.type === 'subject' ? 'Theo môn' : 'Tổng thời lượng' },
      { title: 'Môn', render: (_, r) => r.categoryId ? categories.find(c => c.id === r.categoryId)?.name : 'Tất cả' },
      { title: 'Mục tiêu', render: (_, r) => `${r.target} phút` },
      { title: 'Tiến độ', render: (_, r) => {
        const p = getProgress(r);
        return <><Progress percent={p} size="small" /><Tag color={p >= 100 ? 'green' : 'orange'}>{p >= 100 ? 'Đạt' : 'Chưa đạt'}</Tag></>;
      }},
      { title: '', render: (_, r) => <>
        <Button icon={<EditOutlined />} size="small" onClick={() => showModal('goal', r)} />
        <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete('goal', r.id)} />
      </> }
    ]
  };

  return (
    <div style={{ padding: 20 }}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Danh mục môn học" key="1">
          <Card>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('category')}>Thêm môn</Button>
            <Table columns={columns.category} dataSource={categories} rowKey="id" pagination={{ pageSize: 5 }} />
          </Card>
        </TabPane>

        <TabPane tab="Quản lý lịch học" key="2">
          <Card>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('session')}>Thêm lịch</Button>
            <Table columns={columns.session} dataSource={sessions} rowKey="id" pagination={{ pageSize: 5 }} />
          </Card>
        </TabPane>

        <TabPane tab="Mục tiêu tháng" key="3">
          <Card>
            <Input type="month" value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)} style={{ width: 200, marginBottom: 16 }} />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('goal')}>Thêm mục tiêu</Button>
            <Table columns={columns.goal} dataSource={goals.filter(g => g.month === currentMonth)} rowKey="id" pagination={{ pageSize: 5 }} />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={`${editingItem ? 'Sửa' : 'Thêm'} ${
          modalType === 'category' ? 'môn học' : modalType === 'session' ? 'lịch học' : 'mục tiêu'
        }`}
        visible={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingItem ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={modalType === 'session' ? 600 : 520}
      >
        <Form form={form} onFinish={handleSubmit}>
          {modalType === 'category' && (
            <>
              <Form.Item name="name" label="Tên môn" rules={[...rules.required, ...rules.ten]}>
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Mô tả" rules={rules.text}>
                <TextArea rows={3} />
              </Form.Item>
            </>
          )}

          {modalType === 'session' && (
            <>
              <Form.Item name="categoryId" label="Môn học" rules={rules.required}>
                <Select>{categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}</Select>
              </Form.Item>
              <Form.Item name="studyDate" label="Thời gian" rules={rules.required}>
                <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="duration" label="Thời lượng" rules={[...rules.required, ...rules.number(480, 15)]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="content" label="Nội dung" rules={[...rules.required, ...rules.text]}>
                <TextArea rows={3} />
              </Form.Item>
              <Form.Item name="notes" label="Ghi chú" rules={rules.text}>
                <TextArea rows={2} />
              </Form.Item>
            </>
          )}

          {modalType === 'goal' && (
            <>
              <Form.Item name="type" label="Loại" rules={rules.required}>
                <Select>
                  <Option value="subject">Theo môn</Option>
                  <Option value="total">Tổng thời lượng</Option>
                </Select>
              </Form.Item>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => getFieldValue('type') === 'subject' && (
                  <Form.Item name="categoryId" label="Chọn môn" rules={rules.required}>
                    <Select>{categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}</Select>
                  </Form.Item>
                )}
              </Form.Item>
              <Form.Item name="target" label="Mục tiêu (phút)" rules={[...rules.required, ...rules.number(10000, 30)]}>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Bai2;