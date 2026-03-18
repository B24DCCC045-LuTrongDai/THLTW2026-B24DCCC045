import React, { useState } from 'react';
import { Tabs, Table, Form, Input, Button, Select, DatePicker, TimePicker, message, Rate, Row, Col, Card, Modal } from 'antd';
import moment from 'moment';
import rules from '@/utils/rules';

const App = () => {
	const [employees, setEmployees] = useState([]);
	const [services, setServices] = useState([]);
	const [appointments, setAppointments] = useState([]);
	const [reviews, setReviews] = useState([]);

	const [formEmp] = Form.useForm();
	const [formSvc] = Form.useForm();
	const [formAppt] = Form.useForm();
	const [formEditEmp] = Form.useForm();
	const [formEditSvc] = Form.useForm();

	const [editingEmp, setEditingEmp] = useState(null);
	const [editingSvc, setEditingSvc] = useState(null);

	const handleAddEmployee = (val) => {
		setEmployees([...employees, { ...val, id: Date.now() }]);
		formEmp.resetFields();
	};

	const handleEditEmployee = (val) => {
		setEmployees(employees.map(e => e.id === editingEmp.id ? { ...e, ...val } : e));
		setEditingEmp(null);
	};

	const handleDeleteEmployee = (id) => setEmployees(employees.filter((e) => e.id !== id));

	const handleAddService = (val) => {
		setServices([...services, { ...val, id: Date.now() }]);
		formSvc.resetFields();
	};

	const handleEditService = (val) => {
		setServices(services.map(s => s.id === editingSvc.id ? { ...s, ...val } : s));
		setEditingSvc(null);
	};

	const handleDeleteService = (id) => setServices(services.filter((s) => s.id !== id));

	const handleBookAppointment = (val) => {
		const emp = employees.find((e) => e.id === val.empId);
		const dateStr = val.date.format('YYYY-MM-DD');
		const monthStr = val.date.format('YYYY-MM');
		const timeStr = val.time.format('HH:mm');

		const dailyCount = appointments.filter((a) => a.empId === val.empId && a.dateStr === dateStr && a.status !== 'Hủy').length;
		if (dailyCount >= Number(emp.max)) {
			message.error('Nhân viên đã đạt giới hạn khách trong ngày!');
			return;
		}

		const isOverlap = appointments.some(
			(a) => a.empId === val.empId && a.dateStr === dateStr && a.timeStr === timeStr && a.status !== 'Hủy',
		);
		if (isOverlap) {
			message.error('Lịch hẹn bị trùng!');
			return;
		}

		setAppointments([...appointments, { ...val, id: Date.now(), dateStr, monthStr, timeStr, status: 'Chờ duyệt' }]);
		formAppt.resetFields();
		message.success('Đặt lịch thành công!');
	};

	const updateApptStatus = (id, status) => setAppointments(appointments.map((a) => (a.id === id ? { ...a, status } : a)));

	const handleAddReview = (apptId, rating, comment) => setReviews([...reviews, { id: Date.now(), apptId, rating, comment, reply: '' }]);

	const handleReplyReview = (id, reply) => setReviews(reviews.map((r) => (r.id === id ? { ...r, reply } : r)));

	const completedAppointments = appointments.filter((a) => a.status === 'Hoàn thành');

	const getStats = () => {
		const byDate = {};
		const byMonth = {};
		const revByEmp = {};
		const revBySvc = {};

		appointments.forEach(a => {
			byDate[a.dateStr] = (byDate[a.dateStr] || 0) + 1;
			byMonth[a.monthStr] = (byMonth[a.monthStr] || 0) + 1;
		});

		completedAppointments.forEach(a => {
			const svc = services.find(s => s.id === a.svcId);
			const price = svc ? Number(svc.price) : 0;
			const empName = employees.find(e => e.id === a.empId)?.name || 'N/A';
			const svcName = svc?.name || 'N/A';

			revByEmp[empName] = (revByEmp[empName] || 0) + price;
			revBySvc[svcName] = (revBySvc[svcName] || 0) + price;
		});

		return { byDate, byMonth, revByEmp, revBySvc };
	};

	const stats = getStats();

	const empColumns = [
		{ title: 'Tên nhân viên', dataIndex: 'name' },
		{ title: 'Giới hạn khách/ngày', dataIndex: 'max' },
		{ title: 'Lịch làm việc', dataIndex: 'schedule' },
		{
			title: 'Đánh giá TB',
			render: (_, r) => {
				const empAppts = appointments.filter((a) => a.empId === r.id).map((a) => a.id);
				const empReviews = reviews.filter((rev) => empAppts.includes(rev.apptId));
				const avg = empReviews.length ? empReviews.reduce((sum, rev) => sum + rev.rating, 0) / empReviews.length : 0;
				return <Rate disabled value={avg} />;
			},
		},
		{
			title: 'Hành động',
			render: (_, r) => (
				<>
					<Button onClick={() => { setEditingEmp(r); formEditEmp.setFieldsValue(r); }} style={{ marginRight: 8 }}>Sửa</Button>
					<Button danger onClick={() => handleDeleteEmployee(r.id)}>Xóa</Button>
				</>
			),
		},
	];

	const svcColumns = [
		{ title: 'Tên dịch vụ', dataIndex: 'name' },
		{ title: 'Giá', dataIndex: 'price' },
		{ title: 'Thời gian (phút)', dataIndex: 'duration' },
		{
			title: 'Hành động',
			render: (_, r) => (
				<>
					<Button onClick={() => { setEditingSvc(r); formEditSvc.setFieldsValue(r); }} style={{ marginRight: 8 }}>Sửa</Button>
					<Button danger onClick={() => handleDeleteService(r.id)}>Xóa</Button>
				</>
			),
		},
	];

	const apptColumns = [
		{ title: 'Khách hàng', dataIndex: 'customer' },
		{ title: 'Dịch vụ', render: (_, r) => services.find((s) => s.id === r.svcId)?.name },
		{ title: 'Nhân viên', render: (_, r) => employees.find((e) => e.id === r.empId)?.name },
		{ title: 'Ngày', dataIndex: 'dateStr' },
		{ title: 'Giờ', dataIndex: 'timeStr' },
		{
			title: 'Trạng thái',
			render: (_, r) => (
				<Select value={r.status} onChange={(v) => updateApptStatus(r.id, v)}>
					<Select.Option value="Chờ duyệt">Chờ duyệt</Select.Option>
					<Select.Option value="Xác nhận">Xác nhận</Select.Option>
					<Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
					<Select.Option value="Hủy">Hủy</Select.Option>
				</Select>
			),
		},
	];

	const reviewColumns = [
		{ title: 'Khách hàng', render: (_, r) => appointments.find((a) => a.id === r.apptId)?.customer },
		{ title: 'Đánh giá', render: (_, r) => <Rate disabled value={r.rating} /> },
		{ title: 'Nhận xét', dataIndex: 'comment' },
		{
			title: 'Phản hồi NV',
			render: (_, r) => r.reply ? <span>{r.reply}</span> : <Input.Search enterButton="Gửi" onSearch={(v) => handleReplyReview(r.id, v)} />,
		},
	];

	return (
		<div style={{ padding: 24 }}>
			<Tabs defaultActiveKey="1">
				<Tabs.TabPane tab="Nhân viên & Dịch vụ" key="1">
					<Row gutter={24}>
						<Col span={12}>
							<Form form={formEmp} layout="inline" onFinish={handleAddEmployee}>
								<Form.Item name="name" rules={rules.ten}><Input placeholder="Tên nhân viên" /></Form.Item>
								<Form.Item name="max" rules={rules.number(100, 1, false)}><Input placeholder="Giới hạn/ngày" /></Form.Item>
								<Form.Item name="schedule" rules={rules.required}><Input placeholder="Lịch làm việc" /></Form.Item>
								<Button type="primary" htmlType="submit">Thêm NV</Button>
							</Form>
							<Table dataSource={employees} columns={empColumns} rowKey="id" style={{ marginTop: 16 }} />
						</Col>
						<Col span={12}>
							<Form form={formSvc} layout="inline" onFinish={handleAddService}>
								<Form.Item name="name" rules={rules.required}><Input placeholder="Tên dịch vụ" /></Form.Item>
								<Form.Item name="price" rules={rules.number(100000000, 0, false)}><Input placeholder="Giá" /></Form.Item>
								<Form.Item name="duration" rules={rules.number(500, 1, false)}><Input placeholder="Phút" /></Form.Item>
								<Button type="primary" htmlType="submit">Thêm DV</Button>
							</Form>
							<Table dataSource={services} columns={svcColumns} rowKey="id" style={{ marginTop: 16 }} />
						</Col>
					</Row>
				</Tabs.TabPane>

				<Tabs.TabPane tab="Quản lý Lịch hẹn" key="2">
					<Form form={formAppt} layout="inline" onFinish={handleBookAppointment}>
						<Form.Item name="customer" rules={rules.ten}><Input placeholder="Tên khách hàng" /></Form.Item>
						<Form.Item name="svcId" rules={rules.required}>
							<Select placeholder="Chọn dịch vụ" style={{ width: 150 }}>
								{services.map((s) => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
							</Select>
						</Form.Item>
						<Form.Item name="empId" rules={rules.required}>
							<Select placeholder="Chọn nhân viên" style={{ width: 150 }}>
								{employees.map((e) => <Select.Option key={e.id} value={e.id}>{e.name}</Select.Option>)}
							</Select>
						</Form.Item>
						<Form.Item name="date" rules={rules.sauHomNay}><DatePicker placeholder="Ngày" /></Form.Item>
						<Form.Item name="time" rules={rules.required}><TimePicker format="HH:mm" placeholder="Giờ" /></Form.Item>
						<Button type="primary" htmlType="submit">Đặt lịch</Button>
					</Form>
					<Table dataSource={appointments} columns={apptColumns} rowKey="id" style={{ marginTop: 16 }} />
				</Tabs.TabPane>

				<Tabs.TabPane tab="Đánh giá" key="3">
					<h3>Lịch hẹn hoàn thành (chưa đánh giá)</h3>
					<Table
						dataSource={completedAppointments.filter((a) => !reviews.some((r) => r.apptId === a.id))}
						rowKey="id"
						columns={[
							{ title: 'Khách', dataIndex: 'customer' },
							{ title: 'Ngày', dataIndex: 'dateStr' },
							{
								title: 'Đánh giá',
								render: (_, r) => {
									let rating = 0; let comment = '';
									return (
										<div style={{ display: 'flex', gap: 8 }}>
											<Rate onChange={(v) => rating = v} />
											<Input placeholder="Nhận xét" onChange={(e) => comment = e.target.value} />
											<Button onClick={() => handleAddReview(r.id, rating, comment)}>Gửi</Button>
										</div>
									);
								},
							},
						]}
					/>
					<h3 style={{ marginTop: 24 }}>Danh sách đánh giá</h3>
					<Table dataSource={reviews} columns={reviewColumns} rowKey="id" />
				</Tabs.TabPane>

				<Tabs.TabPane tab="Thống kê" key="4">
					<Row gutter={16}>
						<Col span={6}>
							<Card title="Lịch hẹn theo ngày">
								{Object.entries(stats.byDate).map(([date, count]) => <div key={date}>{date}: {count} lịch</div>)}
							</Card>
						</Col>
						<Col span={6}>
							<Card title="Lịch hẹn theo tháng">
								{Object.entries(stats.byMonth).map(([month, count]) => <div key={month}>{month}: {count} lịch</div>)}
							</Card>
						</Col>
						<Col span={6}>
							<Card title="Doanh thu theo dịch vụ">
								{Object.entries(stats.revBySvc).map(([svc, rev]) => <div key={svc}>{svc}: {rev.toLocaleString()} đ</div>)}
							</Card>
						</Col>
						<Col span={6}>
							<Card title="Doanh thu theo nhân viên">
								{Object.entries(stats.revByEmp).map(([emp, rev]) => <div key={emp}>{emp}: {rev.toLocaleString()} đ</div>)}
							</Card>
						</Col>
					</Row>
				</Tabs.TabPane>
			</Tabs>

			<Modal title="Sửa nhân viên" open={!!editingEmp} visible={!!editingEmp} forceRender onCancel={() => setEditingEmp(null)} onOk={() => formEditEmp.submit()}>
				<Form form={formEditEmp} layout="vertical" onFinish={handleEditEmployee}>
					<Form.Item name="name" label="Tên" rules={rules.ten}><Input /></Form.Item>
					<Form.Item name="max" label="Giới hạn/ngày" rules={rules.number(100, 1, false)}><Input /></Form.Item>
					<Form.Item name="schedule" label="Lịch làm việc" rules={rules.required}><Input /></Form.Item>
				</Form>
			</Modal>

			<Modal title="Sửa dịch vụ" open={!!editingSvc} visible={!!editingSvc} forceRender onCancel={() => setEditingSvc(null)} onOk={() => formEditSvc.submit()}>
				<Form form={formEditSvc} layout="vertical" onFinish={handleEditService}>
					<Form.Item name="name" label="Tên dịch vụ" rules={rules.required}><Input /></Form.Item>
					<Form.Item name="price" label="Giá" rules={rules.number(100000000, 0, false)}><Input /></Form.Item>
					<Form.Item name="duration" label="Thời gian (phút)" rules={rules.number(500, 1, false)}><Input /></Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default App;