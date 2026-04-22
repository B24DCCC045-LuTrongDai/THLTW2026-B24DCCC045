import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Modal, Form, Popconfirm, message } from 'antd';
import rules from '@/utils/rules';

export default function PostManagement() {
  const [posts, setPosts] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Load bài viết
    const savedPosts = localStorage.getItem('blog_posts');
    if (savedPosts) setPosts(JSON.parse(savedPosts));
    
    // Load thẻ có sẵn để chọn
    const savedTags = localStorage.getItem('blog_tags');
    if (savedTags) setAvailableTags(JSON.parse(savedTags));
  }, [visible]); // Load lại mỗi khi mở modal để cập nhật thẻ mới nhất

  const savePosts = (newPosts) => {
    setPosts(newPosts);
    localStorage.setItem('blog_posts', JSON.stringify(newPosts));
  };

  const handleFinish = (values) => {
    let newPosts = [];
    if (values.id) {
      newPosts = posts.map(p => p.id === values.id ? { ...p, ...values } : p);
    } else {
      newPosts = [...posts, { ...values, id: Date.now().toString(), views: 0, date: new Date().toLocaleDateString('vi-VN') }];
    }
    savePosts(newPosts);
    message.success('Đã lưu bài viết');
    setVisible(false);
  };

  return (
    <div>
      <Button type="primary" onClick={() => { form.resetFields(); setVisible(true); }}>Thêm bài viết</Button>
      <Table dataSource={posts} rowKey="id" style={{ marginTop: 20 }}>
        <Table.Column title="Tiêu đề" dataIndex="title" />
        <Table.Column title="Trạng thái" dataIndex="status" />
        <Table.Column title="Thẻ" dataIndex="tags" render={t => t?.join(', ')} />
        <Table.Column title="Hành động" render={(_, record) => (
          <>
            <Button type="link" onClick={() => { form.setFieldsValue(record); setVisible(true); }}>Sửa</Button>
            <Popconfirm title="Xóa?" onConfirm={() => savePosts(posts.filter(p => p.id !== record.id))}>
              <Button type="link" danger>Xóa</Button>
            </Popconfirm>
          </>
        )} />
      </Table>

      <Modal title="Bài viết" visible={visible} onCancel={() => setVisible(false)} onOk={() => form.submit()} width={700}>
        <Form form={form} onFinish={handleFinish} layout="vertical">
          <Form.Item name="id" hidden><Input /></Form.Item>
          <Form.Item name="title" label="Tiêu đề" rules={rules.required}><Input /></Form.Item>
          <Form.Item name="tags" label="Chọn thẻ" rules={rules.required}>
            <Select mode="multiple" placeholder="Chọn thẻ có sẵn">
              {availableTags.map(tag => (
                <Select.Option key={tag.name} value={tag.name}>{tag.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={rules.required}>
            <Select><Select.Option value="Nháp">Nháp</Select.Option><Select.Option value="Đã đăng">Đã đăng</Select.Option></Select>
          </Form.Item>
          <Form.Item name="content" label="Nội dung"><Input.TextArea rows={4} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}