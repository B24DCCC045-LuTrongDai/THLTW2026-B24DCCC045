import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Switch, Tabs, Space, Popconfirm, Card, Row, Col, Statistic, message } from 'antd';
import { Column } from '@ant-design/charts';
import moment from 'moment';
import rules from '@/utils/rules';

const { TabPane } = Tabs;

export default function ClubManagement() {
  const [clubs, setClubs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('1');

  const [clubForm] = Form.useForm();
  const [appForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [changeClubForm] = Form.useForm();

  const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isChangeClubModalOpen, setIsChangeClubModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [editingClub, setEditingClub] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [selectedAppKeys, setSelectedAppKeys] = useState([]);
  const [selectedMemberKeys, setSelectedMemberKeys] = useState([]);
  const [rejectingIds, setRejectingIds] = useState([]);

  const handleSaveClub = (values) => {
    if (editingClub) {
      setClubs(clubs.map(c => c.id === editingClub.id ? { ...c, ...values, date: values.date.format('YYYY-MM-DD') } : c));
    } else {
      setClubs([...clubs, { ...values, id: Date.now(), date: values.date.format('YYYY-MM-DD') }]);
    }
    setIsClubModalOpen(false);
    clubForm.resetFields();
  };

  const handleDeleteClub = (id) => {
    setClubs(clubs.filter(c => c.id !== id));
  };

  const handleSaveApp = (values) => {
    if (editingApp) {
      setApplications(applications.map(a => a.id === editingApp.id ? { ...a, ...values } : a));
    } else {
      setApplications([...applications, { ...values, id: Date.now(), status: 'Pending', note: '' }]);
    }
    setIsAppModalOpen(false);
    appForm.resetFields();
  };

  const handleDeleteApp = (id) => {
    setApplications(applications.filter(a => a.id !== id));
  };

  const logHistory = (action, ids, reason = '') => {
    const time = moment().format('HH:mm DD/MM/YYYY');
    const newLogs = ids.map(id => ({
      id: Date.now() + Math.random(),
      appId: id,
      log: `Admin đã ${action} vào lúc ${time}${reason ? ` với lý do: ${reason}` : ''}`
    }));
    setHistory([...history, ...newLogs]);
  };

  const handleApprove = (ids) => {
    setApplications(applications.map(a => ids.includes(a.id) ? { ...a, status: 'Approved' } : a));
    logHistory('Approved', ids);
    setSelectedAppKeys([]);
  };

  const handleRejectSubmit = (values) => {
    setApplications(applications.map(a => rejectingIds.includes(a.id) ? { ...a, status: 'Rejected', note: values.reason } : a));
    logHistory('Rejected', rejectingIds, values.reason);
    setIsRejectModalOpen(false);
    rejectForm.resetFields();
    setSelectedAppKeys([]);
  };

  const handleChangeClubSubmit = (values) => {
    setApplications(applications.map(a => selectedMemberKeys.includes(a.id) ? { ...a, clubId: values.newClubId } : a));
    setIsChangeClubModalOpen(false);
    changeClubForm.resetFields();
    setSelectedMemberKeys([]);
  };

  const clubColumns = [
    { title: 'Ảnh đại diện', dataIndex: 'avatar', render: t => <img src={t} alt="avatar" style={{width: 50, height: 50}} /> },
    { title: 'Tên CLB', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Ngày thành lập', dataIndex: 'date', sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix() },
    { title: 'Mô tả', dataIndex: 'description', render: t => <div dangerouslySetInnerHTML={{ __html: t }} /> },
    { title: 'Chủ nhiệm', dataIndex: 'president' },
    { title: 'Hoạt động', dataIndex: 'active', render: t => t ? 'Có' : 'Không' },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Space>
          <Button onClick={() => { setEditingClub(record); clubForm.setFieldsValue({ ...record, date: moment(record.date) }); setIsClubModalOpen(true); }}>Sửa</Button>
          <Popconfirm title="Xóa CLB?" onConfirm={() => handleDeleteClub(record.id)}><Button danger>Xóa</Button></Popconfirm>
          <Button onClick={() => { setActiveTab('3'); setSelectedMemberKeys([]); }}>Xem TV</Button>
        </Space>
      )
    }
  ];

  const appColumns = [
    { title: 'Họ tên', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'SĐT', dataIndex: 'phone' },
    { title: 'Giới tính', dataIndex: 'gender' },
    { title: 'CLB', dataIndex: 'clubId', render: id => clubs.find(c => c.id === id)?.name },
    { title: 'Trạng thái', dataIndex: 'status' },
    { title: 'Ghi chú', dataIndex: 'note' },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Space>
          <Button onClick={() => { setEditingApp(record); appForm.setFieldsValue(record); setIsAppModalOpen(true); }}>Sửa</Button>
          <Popconfirm title="Xóa?" onConfirm={() => handleDeleteApp(record.id)}><Button danger>Xóa</Button></Popconfirm>
          {record.status === 'Pending' && (
            <>
              <Button type="primary" onClick={() => handleApprove([record.id])}>Duyệt</Button>
              <Button danger onClick={() => { setRejectingIds([record.id]); setIsRejectModalOpen(true); }}>Từ chối</Button>
            </>
          )}
        </Space>
      )
    }
  ];

  const chartData = clubs.flatMap(club => ['Pending', 'Approved', 'Rejected'].map(status => ({
    club: club.name,
    status,
    count: applications.filter(a => a.clubId === club.id && a.status === status).length
  })));

  const chartConfig = {
    data: chartData,
    isGroup: true,
    xField: 'club',
    yField: 'count',
    seriesField: 'status',
  };

  return (
    <div style={{ padding: 24 }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Danh sách CLB" key="1">
          <Button type="primary" onClick={() => { setEditingClub(null); clubForm.resetFields(); setIsClubModalOpen(true); }} style={{ marginBottom: 16 }}>Thêm CLB</Button>
          <Table dataSource={clubs} columns={clubColumns} rowKey="id" />
        </TabPane>

        <TabPane tab="Quản lý đơn đăng ký" key="2">
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={() => { setEditingApp(null); appForm.resetFields(); setIsAppModalOpen(true); }}>Thêm đơn</Button>
            {selectedAppKeys.length > 0 && (
              <>
                <Button type="primary" onClick={() => handleApprove(selectedAppKeys)}>Duyệt {selectedAppKeys.length} đơn</Button>
                <Button danger onClick={() => { setRejectingIds(selectedAppKeys); setIsRejectModalOpen(true); }}>Từ chối {selectedAppKeys.length} đơn</Button>
              </>
            )}
            <Button onClick={() => setIsHistoryModalOpen(true)}>Xem lịch sử</Button>
          </Space>
          <Table 
            rowSelection={{ selectedRowKeys: selectedAppKeys, onChange: setSelectedAppKeys }} 
            dataSource={applications} 
            columns={appColumns} 
            rowKey="id" 
          />
        </TabPane>

        <TabPane tab="Quản lý thành viên" key="3">
          <Space style={{ marginBottom: 16 }}>
            <Button disabled={selectedMemberKeys.length === 0} type="primary" onClick={() => setIsChangeClubModalOpen(true)}>
              Đổi CLB cho {selectedMemberKeys.length} thành viên
            </Button>
          </Space>
          <Table 
            rowSelection={{ selectedRowKeys: selectedMemberKeys, onChange: setSelectedMemberKeys }} 
            dataSource={applications.filter(a => a.status === 'Approved')} 
            columns={appColumns.filter(c => c.title !== 'Trạng thái' && c.title !== 'Thao tác')} 
            rowKey="id" 
          />
        </TabPane>

        <TabPane tab="Báo cáo & Thống kê" key="4">
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}><Card><Statistic title="Số CLB" value={clubs.length} /></Card></Col>
            <Col span={6}><Card><Statistic title="Pending" value={applications.filter(a => a.status === 'Pending').length} /></Card></Col>
            <Col span={6}><Card><Statistic title="Approved" value={applications.filter(a => a.status === 'Approved').length} /></Card></Col>
            <Col span={6}><Card><Statistic title="Rejected" value={applications.filter(a => a.status === 'Rejected').length} /></Card></Col>
          </Row>
          <Card title="Số đơn đăng ký theo CLB">
            <Column {...chartConfig} />
          </Card>
        </TabPane>
      </Tabs>

      <Modal title={editingClub ? 'Sửa CLB' : 'Thêm CLB'} visible={isClubModalOpen} onCancel={() => setIsClubModalOpen(false)} onOk={() => clubForm.submit()}>
        <Form form={clubForm} onFinish={handleSaveClub} layout="vertical">
          <Form.Item name="avatar" label="Link Ảnh đại diện" rules={rules.httpLink}><Input /></Form.Item>
          <Form.Item name="name" label="Tên CLB" rules={rules.ten}><Input /></Form.Item>
          <Form.Item name="date" label="Ngày thành lập" rules={rules.required}><DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="description" label="Mô tả (HTML)"><Input.TextArea /></Form.Item>
          <Form.Item name="president" label="Chủ nhiệm" rules={rules.ten}><Input /></Form.Item>
          <Form.Item name="active" label="Hoạt động" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>

      <Modal title={editingApp ? 'Sửa đơn' : 'Thêm đơn'} visible={isAppModalOpen} onCancel={() => setIsAppModalOpen(false)} onOk={() => appForm.submit()}>
        <Form form={appForm} onFinish={handleSaveApp} layout="vertical">
          <Form.Item name="name" label="Họ tên" rules={rules.ten}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={rules.email}><Input /></Form.Item>
          <Form.Item name="phone" label="SĐT" rules={rules.soDienThoai}><Input /></Form.Item>
          <Form.Item name="gender" label="Giới tính"><Select options={[{ value: 'Nam', label: 'Nam' }, { value: 'Nữ', label: 'Nữ' }]} /></Form.Item>
          <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
          <Form.Item name="strengths" label="Sở trường"><Input /></Form.Item>
          <Form.Item name="clubId" label="Câu lạc bộ" rules={rules.required}>
            <Select options={clubs.map(c => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="reason" label="Lý do đăng ký"><Input.TextArea /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Lý do từ chối" visible={isRejectModalOpen} onCancel={() => setIsRejectModalOpen(false)} onOk={() => rejectForm.submit()}>
        <Form form={rejectForm} onFinish={handleRejectSubmit} layout="vertical">
          <Form.Item name="reason" label="Lý do" rules={rules.required}><Input.TextArea /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Đổi CLB" visible={isChangeClubModalOpen} onCancel={() => setIsChangeClubModalOpen(false)} onOk={() => changeClubForm.submit()}>
        <p>Đang đổi CLB cho {selectedMemberKeys.length} thành viên</p>
        <Form form={changeClubForm} onFinish={handleChangeClubSubmit} layout="vertical">
          <Form.Item name="newClubId" label="Chọn CLB mới" rules={rules.required}>
            <Select options={clubs.map(c => ({ value: c.id, label: c.name }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Lịch sử thao tác" visible={isHistoryModalOpen} onCancel={() => setIsHistoryModalOpen(false)} footer={null}>
        <Table dataSource={history} columns={[{ title: 'Chi tiết', dataIndex: 'log' }]} rowKey="id" pagination={false} />
      </Modal>
    </div>
  );
}