import React from 'react';
import { Card, Avatar, Typography, Space } from 'antd';

const mockAuthor = {
  name: 'Admin Đẹp Trai',
  avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  bio: 'Chuyên gia gõ phím, đam mê fix bug.',
  skills: ['ReactJS', 'Ant Design', 'UmiJS'],
  social: [
    { name: 'GitHub', link: 'https://github.com' },
    { name: 'Facebook', link: 'https://facebook.com' }
  ]
};

export default function About({ author = mockAuthor }) {
  const safeAuthor = author || mockAuthor;

  return (
    <Card style={{ textAlign: 'center' }}>
      <Space direction="vertical" align="center" style={{ width: '100%' }}>
        <Avatar size={120} src={safeAuthor.avatar} />
        <Typography.Title level={3}>{safeAuthor.name}</Typography.Title>
        <p>{safeAuthor.bio}</p>
        <p><strong>Kỹ năng:</strong> {safeAuthor.skills?.join(', ')}</p>
        <Space>
          {safeAuthor.social?.map(s => (
            <a key={s.link} href={s.link} target="_blank" rel="noreferrer">{s.name}</a>
          ))}
        </Space>
      </Space>
    </Card>
  );
}