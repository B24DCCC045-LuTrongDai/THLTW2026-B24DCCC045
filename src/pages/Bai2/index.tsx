import React, { useState } from 'react';
import { Tabs, Table, Form, Input, Select, Button, message, InputNumber, Space, Card, Popconfirm, Modal } from 'antd';
import rules from '@/utils/rules';

const { Option } = Select;
const { TabPane } = Tabs;

export default function QuanLyThi() {
  const [dsKhoi, setDsKhoi] = useState([{ id: 1, tenKhoi: 'Tổng quan' }]);
  const [dsMon, setDsMon] = useState([{ maMon: 'IT01', tenMon: 'Lập trình Web', tinChi: 3 }]);
  const [dsCauHoi, setDsCauHoi] = useState([]);
  const [dsDeThi, setDsDeThi] = useState([]);
  const [deDangSua, setDeDangSua] = useState(null);

  const [formKhoi] = Form.useForm();
  const [formMon] = Form.useForm();
  const [formCauHoi] = Form.useForm();
  const [formDeThi] = Form.useForm();
  const [formSua] = Form.useForm();

  const themKhoi = (gt) => {
    setDsKhoi([...dsKhoi, { id: Date.now(), ...gt }]);
    formKhoi.resetFields();
  };

  const themMon = (gt) => {
    setDsMon([...dsMon, gt]);
    formMon.resetFields();
  };

  const themCauHoi = (gt) => {
    setDsCauHoi([...dsCauHoi, { maCau: `Q${Date.now()}`, ...gt }]);
    formCauHoi.resetFields();
  };

  const taoDeThi = (gt) => {
    let cauHoiDeThi = [];
    if (!gt.cauTruc || gt.cauTruc.length === 0) return message.error('Vui lòng thêm cấu trúc');
    
    for (const yc of gt.cauTruc) {
      const hopLe = dsCauHoi.filter(c => c.maMon === gt.maMon && c.tenKhoi === yc.tenKhoi && c.mucDo === yc.mucDo);
      if (hopLe.length < yc.soLuong) return message.error(`Thiếu câu hỏi: ${yc.tenKhoi} - ${yc.mucDo}`);
      cauHoiDeThi = [...cauHoiDeThi, ...hopLe.sort(() => 0.5 - Math.random()).slice(0, yc.soLuong)];
    }
    
    setDsDeThi([{ maDe: `DE-${Date.now()}`, maMon: gt.maMon, ds: cauHoiDeThi }, ...dsDeThi]);
    message.success('Tạo đề thành công');
  };

  const xoaDe = (maDe) => {
    setDsDeThi(dsDeThi.filter(d => d.maDe !== maDe));
    message.success('Đã xóa đề thi');
  };

  const moSuaDe = (d) => {
    setDeDangSua(d);
    formSua.setFieldsValue({ maDe: d.maDe });
  };

  const luuSuaDe = (gt) => {
    setDsDeThi(dsDeThi.map(d => d.maDe === deDangSua.maDe ? { ...d, maDe: gt.maDe } : d));
    setDeDangSua(null);
    message.success('Đã cập nhật mã đề');
  };

  const xoaCauTrongDe = (maDe, maCau) => {
    setDsDeThi(dsDeThi.map(d => d.maDe === maDe ? { ...d, ds: d.ds.filter(c => c.maCau !== maCau) } : d));
  };

  const cotKhoi = [{ title: 'Khối', dataIndex: 'tenKhoi' }];
  const cotMon = [{ title: 'Mã', dataIndex: 'maMon' }, { title: 'Môn', dataIndex: 'tenMon' }, { title: 'Tín chỉ', dataIndex: 'tinChi' }];
  const cotCau = [{ title: 'Mã', dataIndex: 'maCau' }, { title: 'Môn', dataIndex: 'maMon' }, { title: 'Khối', dataIndex: 'tenKhoi' }, { title: 'Độ khó', dataIndex: 'mucDo' }, { title: 'Nội dung', dataIndex: 'noiDung' }];
  const mucDoArr = ['Dễ', 'Trung bình', 'Khó', 'Rất khó'];

  return (
    <div style={{ padding: 20 }}>
      <Tabs defaultActiveKey="4">
        <TabPane tab="Khối kiến thức" key="1">
          <Card size="small">
            <Form form={formKhoi} layout="inline" onFinish={themKhoi}>
              <Form.Item name="tenKhoi" rules={[...rules.required, ...rules.ten]}><Input placeholder="Tên khối" /></Form.Item>
              <Button type="primary" htmlType="submit">Thêm</Button>
            </Form>
            <Table dataSource={dsKhoi} columns={cotKhoi} rowKey="id" size="small" style={{ marginTop: 15 }} />
          </Card>
        </TabPane>
        
        <TabPane tab="Môn học" key="2">
          <Card size="small">
            <Form form={formMon} layout="inline" onFinish={themMon}>
              <Form.Item name="maMon" rules={rules.required}><Input placeholder="Mã môn" /></Form.Item>
              <Form.Item name="tenMon" rules={[...rules.required, ...rules.ten]}><Input placeholder="Tên môn" /></Form.Item>
              <Form.Item name="tinChi" rules={[...rules.required, ...rules.number(10, 1, false)]}><Input placeholder="Tín chỉ" /></Form.Item>
              <Button type="primary" htmlType="submit">Thêm</Button>
            </Form>
            <Table dataSource={dsMon} columns={cotMon} rowKey="maMon" size="small" style={{ marginTop: 15 }} />
          </Card>
        </TabPane>
        
        <TabPane tab="Câu hỏi" key="3">
          <Card size="small">
            <Form form={formCauHoi} layout="inline" onFinish={themCauHoi}>
              <Form.Item name="maMon" rules={rules.required}>
                <Select placeholder="Môn" style={{ width: 120 }}>{dsMon.map(m => <Option key={m.maMon} value={m.maMon}>{m.tenMon}</Option>)}</Select>
              </Form.Item>
              <Form.Item name="tenKhoi" rules={rules.required}>
                <Select placeholder="Khối" style={{ width: 120 }}>{dsKhoi.map(k => <Option key={k.id} value={k.tenKhoi}>{k.tenKhoi}</Option>)}</Select>
              </Form.Item>
              <Form.Item name="mucDo" rules={rules.required}>
                <Select placeholder="Độ khó" style={{ width: 100 }}>{mucDoArr.map(d => <Option key={d} value={d}>{d}</Option>)}</Select>
              </Form.Item>
              <Form.Item name="noiDung" rules={rules.required}><Input placeholder="Nội dung" /></Form.Item>
              <Button type="primary" htmlType="submit">Thêm</Button>
            </Form>
            <Table dataSource={dsCauHoi} columns={cotCau} rowKey="maCau" size="small" style={{ marginTop: 15 }} />
          </Card>
        </TabPane>
        
        <TabPane tab="Tạo đề thi" key="4">
          <Card size="small">
            <Form form={formDeThi} layout="vertical" onFinish={taoDeThi}>
              <Form.Item name="maMon" label="Môn thi" rules={rules.required}>
                <Select placeholder="Chọn môn" style={{ width: 200 }}>{dsMon.map(m => <Option key={m.maMon} value={m.maMon}>{m.tenMon}</Option>)}</Select>
              </Form.Item>
              <Form.List name="cauTruc">
                {(truong, { add, remove }) => (
                  <>
                    {truong.map(({ key, name, ...rest }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item {...rest} name={[name, 'tenKhoi']} rules={rules.required}>
                          <Select placeholder="Khối" style={{ width: 120 }}>{dsKhoi.map(k => <Option key={k.id} value={k.tenKhoi}>{k.tenKhoi}</Option>)}</Select>
                        </Form.Item>
                        <Form.Item {...rest} name={[name, 'mucDo']} rules={rules.required}>
                          <Select placeholder="Mức độ" style={{ width: 100 }}>{mucDoArr.map(d => <Option key={d} value={d}>{d}</Option>)}</Select>
                        </Form.Item>
                        <Form.Item {...rest} name={[name, 'soLuong']} rules={rules.required}>
                          <InputNumber placeholder="SL" min={1} />
                        </Form.Item>
                        <Button onClick={() => remove(name)} danger>X</Button>
                      </Space>
                    ))}
                    <Form.Item><Button type="dashed" onClick={() => add()}>+ Thêm cấu trúc</Button></Form.Item>
                  </>
                )}
              </Form.List>
              <Form.Item><Button type="primary" htmlType="submit">Tạo đề thi</Button></Form.Item>
            </Form>

            {dsDeThi.map(d => (
              <Card 
                key={d.maDe} 
                title={`${d.maDe} - Môn: ${d.maMon}`} 
                size="small" 
                style={{ marginTop: 15, background: '#fafafa' }}
                extra={
                  <Space>
                    <Button size="small" onClick={() => moSuaDe(d)}>Sửa mã đề</Button>
                    <Popconfirm title="Bạn có chắc chắn muốn xóa đề này?" onConfirm={() => xoaDe(d.maDe)}>
                      <Button size="small" danger>Xóa đề</Button>
                    </Popconfirm>
                  </Space>
                }
              >
                <ol style={{ margin: 0, paddingLeft: 20 }}>
                  {d.ds.map(c => (
                    <li key={c.maCau} style={{ marginBottom: 8 }}>
                      <b>[{c.tenKhoi} - {c.mucDo}]</b> {c.noiDung}
                      <Button type="link" danger size="small" onClick={() => xoaCauTrongDe(d.maDe, c.maCau)}>Xóa câu này</Button>
                    </li>
                  ))}
                </ol>
              </Card>
            ))}
          </Card>
        </TabPane>
      </Tabs>

      <Modal title="Chỉnh sửa mã đề thi" visible={!!deDangSua} onCancel={() => setDeDangSua(null)} onOk={() => formSua.submit()}>
        <Form form={formSua} onFinish={luuSuaDe}>
          <Form.Item name="maDe" label="Mã đề" rules={rules.required}>
            <Input placeholder="Nhập mã đề mới" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}