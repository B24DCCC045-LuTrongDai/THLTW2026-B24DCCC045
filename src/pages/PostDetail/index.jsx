import React, { useState, useEffect } from 'react';
import { useParams, history } from 'umi';
import { Card, Button, Typography, Tag, Divider, List, Empty } from 'antd';
import ReactMarkdown from 'react-markdown';

export default function PostDetail() {
  const { id } = useParams(); // Lấy ID từ URL
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    // 1. Lấy danh sách bài viết từ localStorage
    const savedPosts = localStorage.getItem('blog_posts');
    if (savedPosts) {
      const allPosts = JSON.parse(savedPosts);
      // Tìm vị trí bài viết hiện tại
      const postIndex = allPosts.findIndex((p) => String(p.id) === String(id));

      if (postIndex !== -1) {
        // 2. Logic tăng lượt xem: Cộng 1 vào views
        allPosts[postIndex].views = (Number(allPosts[postIndex].views) || 0) + 1;

        // 3. Lưu lại danh sách mới đã cập nhật lượt xem vào localStorage
        localStorage.setItem('blog_posts', JSON.stringify(allPosts));

        // Cập nhật state để hiển thị
        const currentPost = allPosts[postIndex];
        setPost(currentPost);

        // 4. Tìm bài viết liên quan (cùng tag, không phải bài hiện tại, trạng thái Đã đăng)
        const related = allPosts.filter(
          (p) =>
            String(p.id) !== String(id) &&
            p.status === 'Đã đăng' &&
            p.tags?.some((tag) => currentPost.tags?.includes(tag))
        );
        setRelatedPosts(related);
      }
    }
  }, [id]); // Chạy lại mỗi khi đổi bài viết (ID thay đổi)

  if (!post) {
    return (
      <Card>
        <Empty description="Không tìm thấy bài viết" />
        <Button onClick={() => history.push('/home')}>Quay lại trang chủ</Button>
      </Card>
    );
  }

  return (
    <Card>
      <Button onClick={() => history.push('/home')} style={{ marginBottom: 20 }}>
        Quay lại danh sách
      </Button>

      <Typography.Title>{post.title}</Typography.Title>
      
      <p style={{ color: 'gray' }}>
        Tác giả: {post.author || 'Admin'} | Ngày đăng: {post.date} | 
        Lượt xem: <strong style={{ color: '#1890ff' }}>{post.views}</strong>
      </p>

      <div style={{ marginBottom: 20 }}>
        {post.tags?.map((t) => (
          <Tag color="blue" key={t}>{t}</Tag>
        ))}
      </div>

      <Divider />

      {/* Hiển thị nội dung bài viết bằng Markdown */}
      <div className="markdown-content" style={{ fontSize: '16px', lineHeight: '1.8', minHeight: '200px' }}>
        <ReactMarkdown>{post.content || ''}</ReactMarkdown>
      </div>

      <Divider />

      {/* Phần bài viết liên quan theo yêu cầu */}
      <Typography.Title level={4}>Bài viết liên quan</Typography.Title>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={relatedPosts}
        renderItem={(item) => (
          <List.Item>
            <Card 
              hoverable 
              size="small" 
              title={item.title}
              onClick={() => history.push(`/post/${item.id}`)}
            >
              <div style={{ fontSize: '12px', color: 'gray' }}>{item.date}</div>
            </Card>
          </List.Item>
        )}
      />
    </Card>
  );
}