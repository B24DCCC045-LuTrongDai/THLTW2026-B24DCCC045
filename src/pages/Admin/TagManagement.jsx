import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Input, Popconfirm, Modal, message } from 'antd';
import rules from '@/utils/rules';

export default function TagManagement() {
  const [tags, setTags] = useState([]);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  // Hàm load dữ liệu và tính toán số lượng bài viết sử dụng thẻ
  const loadData = () => {
    const savedTags = JSON.parse(localStorage.getItem('blog_tags') || '[]');
    const savedPosts = JSON.parse(localStorage.getItem('blog_posts') || '[]');

    // Duyệt qua từng thẻ và đếm số bài viết (chỉ đếm bài "Đã đăng") có chứa thẻ đó
    const tagsWithCount = savedTags.map(tag => {
      const usageCount = savedPosts.filter(post => 
        post.status === 'Đã đăng' && post.tags?.includes(tag.name)
      ).length;
      
      return { ...tag, count: usageCount };
    });

    setTags(tagsWithCount);
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveToStorage = (newTags) => {
    localStorage.setItem('blog_tags', JSON.stringify(newTags));
    loadData(); // Load lại để cập nhật danh sách và số lượng hiển thị
  };

  const handleFinish = (values) => {
    let newTags = [];
    const currentTags = JSON.parse(localStorage.getItem('blog_tags') || '[]');

    if (values.id) {
      // Sửa tên thẻ
      newTags = currentTags.map(t => t.id === values.id ? { ...t, name: values.name } : t);
      message.success('Cập nhật thẻ thành công');
    } else {
      // Thêm thẻ mới (id là string để đồng bộ)
      newTags = [...currentTags, { id: Date.now().toString(), name: values.name }];
      message.success('Thêm thẻ mới thành công');
    }
    
    saveToStorage(newTags);
    setVisible(false);
  };

  const handleDelete = (id) => {
    const currentTags = JSON.parse(localStorage.getItem('blog_tags') || '[]');
    const filteredTags = currentTags.filter(t => t.id !== id);
    saveToStorage(filteredTags);
    message.success('Đã xóa thẻ');
  };

  return (
    <div>
      <Button 
        type="primary" 
        onClick={() => { form.resetFields(); setVisible(true); }}
      >
        Thêm thẻ mới
      </Button>

      <Table dataSource={tags} rowKey="id" style={{ marginTop: 20 }}>
        {/* Cột Tên thẻ: Lấy từ thuộc tính 'name' của object thẻ */}
        <Table.Column title="Tên thẻ" dataIndex="name" key="name" />
        
        {/* Cột Số bài viết: Hiển thị giá trị 'count' đã tính toán ở trên */}
        <Table.Column 
          title="Số bài viết đang sử dụng" 
          dataIndex="count" 
          key="count"
          render={(count) => <strong style={{ color: '#1890ff' }}>{count}</strong>}
        />

        <Table.Column 
          title="Hành động" 
          key="action"
          render={(_, record) => (
            <>
              <Button type="link" onClick={() => { form.setFieldsValue(record); setVisible(true); }}>Sửa</Button>
              <Popconfirm title="Xóa thẻ này?" onConfirm={() => handleDelete(record.id)}>
                <Button type="link" danger>Xóa</Button>
              </Popconfirm>
            </>
          )} 
        />
      </Table>

      <Modal 
        title="Quản lý thẻ" 
        visible={visible} 
        onCancel={() => setVisible(false)} 
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleFinish} layout="vertical">
          <Form.Item name="id" hidden><Input /></Form.Item>
          <Form.Item 
            name="name" 
            label="Tên thẻ" 
            rules={rules.required}
          >
            <Input placeholder="Ví dụ: ReactJS, Frontend..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}