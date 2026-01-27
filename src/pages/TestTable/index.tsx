import {Table, Button, Modal, Form, Checkbox, Input} from 'antd';
import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import title from '@/locales/vi-VN/global/title';

export default function TestTable() {
        const [isModalOpen, setIsModalOpen] = useState(false);

        const onFinish = values => {
  console.log('Success:', values);
};
const onFinishFailed = errorInfo => {
  console.log('Failed:', errorInfo);
};
        const showModal = () => {
            setIsModalOpen(true);
        };
        const handleOk = () => {
            setIsModalOpen(false);
        };
        const handleCancel = () => {
            setIsModalOpen(false);
        };

        const dataSource = [
            {
                key: '1',
                name: 'Mike',
                age: 32,
                address: '10 Downing Street',
            },
            {
                key: '2',
                name: 'John',
                age: 42,
                address: '2-4 Oxford Street',
            },
        ];

        const columns = [
            {
                title: 'STT',
                dataIndex: 'key',
                key: 'key',
            },
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: 'Age',
                dataIndex: 'age',
                key: 'age',
            },
            {
                title: 'Address',
                dataIndex: 'address',
                key: 'address',
            },
            {
                title: 'Action',
                key: 'action',
                render: () => (<Button type = 'primary' onClick={showModal}>Edit</Button>)
            }
        ];


    return(
        <div>
            <h1>Test Table Page</h1>
            <Button type='primary' icon={<PlusOutlined />} style={{marginBottom: 16}}
                onClick={showModal}>
                Add new
            </Button>
            <Table dataSource={dataSource} columns={columns}/>
            <Modal 
                title='Edit User'
                visible={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form
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
                    rules={[{ required: true, message: 'Please input your age!', }]}
                    >
                    <Input />
                    </Form.Item>

                    <Form.Item
                    label="Address"
                    name="address"
                    rules={[{ required: true, message: 'Please input your address!' }]}
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
    )
}