import React, { useState } from 'react';
import { Table, Button, Modal, Form, Checkbox, Input } from 'antd';

const dataSource = [
  { key: '1', name: 'John Brown', age: 32, size: 'L' },
  { key: '2', name: 'Jim Green', age: 42, size: 'M' },
  { key: '3', name: 'Joe Black', age: 32, size: 'S' },
  { key: '4', name: 'Jim Red', age: 32, size: 'L' },
  { key: '5', name: 'Jim Red', age: 32, size: 'L' },
  { key: '6', name: 'Jim Red', age: 32, size: 'L' },
];

export default function BaiTap3() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  
const [thamChieuForm] = Form.useForm();  

const onFinish = values => {
  console.log('Success:', values);
};
const onFinishFailed = errorInfo => {
  console.log('Failed:', errorInfo);
};

  const columns = [
    { title: 'STT', dataIndex: 'key', key: 'key' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Age', dataIndex: 'age', key: 'age' },
    { title: 'Size', dataIndex: 'size', key: 'size' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => {
          thamChieuForm.setFieldsValue(record);
          showModal();
        }}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1>Bài Tập 3 - Table Ant Design</h1>
      <Table
        dataSource={dataSource}
        pagination={{ pageSize: 4 }}
        columns={columns}
      />
      <Modal
        title="Basic Modal"
        visible={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
    <Form
    form = {thamChieuForm}
    name="basic"
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    style={{ maxWidth: 600 }}
    initialValues={{ remember: true }}
    onFinish={onFinish}
    onFinishFailed={onFinishFailed}
    autoComplete="off"
    >
    <Form.Item
      label="Name"
      name="name"
      rules={[{ required: true, message: 'Please input your name!' }]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      label="Age"
      name="age"
      rules={[{ required: true, message: 'Please input your age!' }]}
    >
      <Input type="number" />
    </Form.Item>

        <Form.Item
      label="Size"
      name="size"
      rules={[{ required: true, message: 'Please input your size!' }]}
    >
      <Input />
    </Form.Item>

    <Form.Item name="remember" valuePropName="checked" label={null}>
      <Checkbox>Remember me</Checkbox>
    </Form.Item>

    <Form.Item label={null}>
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </Form.Item>
  </Form>
      </Modal>
      
    </div>
  );
}
