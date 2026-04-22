import React, { useState, useEffect } from 'react';
import { List, Card, Tag } from 'antd';
import { history } from 'umi';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const savedPosts = localStorage.getItem('blog_posts');
    if (savedPosts) {
      // Chỉ hiện những bài "Đã đăng" theo yêu cầu quản lý
      const published = JSON.parse(savedPosts).filter(p => p.status === 'Đã đăng');
      setPosts(published);
    }
  }, []);

  return (
    <List
      grid={{ gutter: 16, column: 3 }}
      dataSource={posts}
      renderItem={item => (
        <List.Item>
          <Card 
            hoverable 
            title={item.title} 
            onClick={() => history.push(`/post/${item.id}`)}
          >
            <p>{item.date}</p>
            {item.tags?.map(t => <Tag key={t} color="blue">{t}</Tag>)}
          </Card>
        </List.Item>
      )}
    />
  );
}