import React, { useState, useEffect } from 'react';
import { Tabs, Form, Input, Button, Table, Select, DatePicker, InputNumber, message, Card, Descriptions, Space } from 'antd';
import moment from 'moment';
import rules from '@/utils/rules';

const { TabPane } = Tabs;
const { Option } = Select;

const App = () => {
  const [books, setBooks] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [fields, setFields] = useState([]);
  const [diplomas, setDiplomas] = useState([]);
  
  const [bookForm] = Form.useForm();
  const [decisionForm] = Form.useForm();
  const [fieldForm] = Form.useForm();
  const [diplomaForm] = Form.useForm();
  const [searchForm] = Form.useForm();

  const [searchResults, setSearchResults] = useState([]);
  const selectedDecisionId = Form.useWatch('decisionId', diplomaForm);

  useEffect(() => {
    if (selectedDecisionId) {
      const decision = decisions.find(d => d.id === selectedDecisionId);
      if (decision) {
        const book = books.find(b => b.id === decision.bookId);
        if (book) {
          diplomaForm.setFieldsValue({ entryNumber: book.currentEntry });
        }
      }
    }
  }, [selectedDecisionId, decisions, books, diplomaForm]);

  const onAddBook = (values) => {
    setBooks([...books, { id: Date.now(), year: values.year, currentEntry: 1 }]);
    bookForm.resetFields();
  };

  const onAddDecision = (values) => {
    setDecisions([...decisions, { 
      id: Date.now(), 
      ...values, 
      date: values.date.format('YYYY-MM-DD'),
      lookupCount: 0 
    }]);
    decisionForm.resetFields();
  };

  const onAddField = (values) => {
    setFields([...fields, { id: Date.now(), ...values }]);
    fieldForm.resetFields();
  };

  const onDeleteField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const onAddDiploma = (values) => {
    const decision = decisions.find(d => d.id === values.decisionId);
    const bookIndex = books.findIndex(b => b.id === decision.bookId);
    
    const entryNumber = books[bookIndex].currentEntry;
    const newBooks = [...books];
    newBooks[bookIndex].currentEntry += 1;
    setBooks(newBooks);

    const formattedValues = {
      ...values,
      dob: values.dob.format('YYYY-MM-DD'),
      customData: values.customData ? Object.entries(values.customData).reduce((acc, [k, v]) => {
        acc[k] = moment.isMoment(v) ? v.format('YYYY-MM-DD') : v;
        return acc;
      }, {}) : {}
    };

    setDiplomas([...diplomas, { id: Date.now(), ...formattedValues, entryNumber }]);
    diplomaForm.resetFields();
  };

  const onSearch = (values) => {
    const activeParams = Object.keys(values).filter(key => values[key]);
    if (activeParams.length < 2) {
      message.error('Vui lòng nhập ít nhất 2 tham số tìm kiếm');
      return;
    }

    const results = diplomas.filter(dip => {
      let match = true;
      if (values.diplomaNumber && dip.diplomaNumber !== values.diplomaNumber) match = false;
      if (values.entryNumber && dip.entryNumber !== Number(values.entryNumber)) match = false;
      if (values.studentId && dip.studentId !== values.studentId) match = false;
      if (values.name && !dip.name.toLowerCase().includes(values.name.toLowerCase())) match = false;
      if (values.dob && dip.dob !== values.dob.format('YYYY-MM-DD')) match = false;
      return match;
    });

    if (results.length > 0) {
      const updatedDecisions = [...decisions];
      results.forEach(res => {
        const dIndex = updatedDecisions.findIndex(d => d.id === res.decisionId);
        if (dIndex > -1) {
          updatedDecisions[dIndex].lookupCount += 1;
        }
      });
      setDecisions(updatedDecisions);
    }

    setSearchResults(results);
  };

  return (
    <div style={{ padding: 24 }}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Quản lý sổ văn bằng" key="1">
          <Form form={bookForm} onFinish={onAddBook} layout="inline" style={{ marginBottom: 16 }}>
            <Form.Item name="year" label="Năm" rules={[rules.required[0], rules.sotaikhoan[0]]}>
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Thêm sổ mới</Button>
            </Form.Item>
          </Form>
          <Table 
            dataSource={books} 
            rowKey="id" 
            columns={[
              { title: 'Năm', dataIndex: 'year' },
              { title: 'Số vào sổ hiện tại', dataIndex: 'currentEntry' }
            ]} 
          />
        </TabPane>

        <TabPane tab="Quyết định tốt nghiệp" key="2">
          <Form form={decisionForm} onFinish={onAddDecision} layout="vertical">
            <Form.Item name="decisionNumber" label="Số QĐ" rules={rules.required}>
              <Input />
            </Form.Item>
            <Form.Item name="date" label="Ngày ban hành" rules={rules.required}>
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="summary" label="Trích yếu" rules={rules.required}>
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="bookId" label="Sổ văn bằng" rules={rules.required}>
              <Select>
                {books.map(b => <Option key={b.id} value={b.id}>{b.year}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Thêm quyết định</Button>
            </Form.Item>
          </Form>
          <Table 
            dataSource={decisions} 
            rowKey="id" 
            columns={[
              { title: 'Số QĐ', dataIndex: 'decisionNumber' },
              { title: 'Ngày ban hành', dataIndex: 'date' },
              { title: 'Trích yếu', dataIndex: 'summary' },
              { title: 'Sổ năm', render: (_, r) => books.find(b => b.id === r.bookId)?.year },
              { title: 'Lượt tra cứu', dataIndex: 'lookupCount' }
            ]} 
          />
        </TabPane>

        <TabPane tab="Cấu hình biểu mẫu" key="3">
          <Form form={fieldForm} onFinish={onAddField} layout="inline" style={{ marginBottom: 16 }}>
            <Form.Item name="name" label="Tên trường" rules={rules.required}>
              <Input />
            </Form.Item>
            <Form.Item name="type" label="Kiểu dữ liệu" rules={rules.required}>
              <Select style={{ width: 120 }}>
                <Option value="String">String</Option>
                <Option value="Number">Number</Option>
                <Option value="Date">Date</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Thêm trường</Button>
            </Form.Item>
          </Form>
          <Table 
            dataSource={fields} 
            rowKey="id" 
            columns={[
              { title: 'Tên trường', dataIndex: 'name' },
              { title: 'Kiểu dữ liệu', dataIndex: 'type' },
              { title: 'Thao tác', render: (_, r) => <Button danger onClick={() => onDeleteField(r.id)}>Xóa</Button> }
            ]} 
          />
        </TabPane>

        <TabPane tab="Thông tin văn bằng" key="4">
          <Form form={diplomaForm} onFinish={onAddDiploma} layout="vertical">
            <Form.Item name="decisionId" label="Quyết định tốt nghiệp" rules={rules.required}>
              <Select>
                {decisions.map(d => <Option key={d.id} value={d.id}>{d.decisionNumber} - {d.summary}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="entryNumber" label="Số vào sổ">
              <Input disabled />
            </Form.Item>
            <Form.Item name="diplomaNumber" label="Số hiệu văn bằng" rules={rules.required}>
              <Input />
            </Form.Item>
            <Form.Item name="studentId" label="Mã sinh viên" rules={rules.required}>
              <Input />
            </Form.Item>
            <Form.Item name="name" label="Họ tên" rules={rules.ten}>
              <Input />
            </Form.Item>
            <Form.Item name="dob" label="Ngày sinh" rules={rules.required}>
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>

            {fields.map(f => (
              <Form.Item key={f.id} name={['customData', f.id]} label={f.name} rules={rules.required}>
                {f.type === 'String' && <Input />}
                {f.type === 'Number' && <InputNumber style={{ width: '100%' }} />}
                {f.type === 'Date' && <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />}
              </Form.Item>
            ))}

            <Form.Item>
              <Button type="primary" htmlType="submit">Thêm văn bằng</Button>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab="Tra cứu văn bằng" key="5">
          <Form form={searchForm} onFinish={onSearch} layout="vertical">
            <Space size="middle" wrap>
              <Form.Item name="diplomaNumber" label="Số hiệu văn bằng"><Input /></Form.Item>
              <Form.Item name="entryNumber" label="Số vào sổ"><InputNumber style={{ width: '100%' }}/></Form.Item>
              <Form.Item name="studentId" label="Mã sinh viên"><Input /></Form.Item>
              <Form.Item name="name" label="Họ tên"><Input /></Form.Item>
              <Form.Item name="dob" label="Ngày sinh"><DatePicker format="DD/MM/YYYY" style={{ width: '100%' }}/></Form.Item>
            </Space>
            <Form.Item>
              <Button type="primary" htmlType="submit">Tra cứu</Button>
            </Form.Item>
          </Form>

          {searchResults.map(dip => {
            const decision = decisions.find(d => d.id === dip.decisionId);
            return (
              <Card key={dip.id} style={{ marginTop: 16 }}>
                <Descriptions title="Thông tin văn bằng" bordered column={2}>
                  <Descriptions.Item label="Họ tên">{dip.name}</Descriptions.Item>
                  <Descriptions.Item label="Mã SV">{dip.studentId}</Descriptions.Item>
                  <Descriptions.Item label="Ngày sinh">{moment(dip.dob).format('DD/MM/YYYY')}</Descriptions.Item>
                  <Descriptions.Item label="Số hiệu">{dip.diplomaNumber}</Descriptions.Item>
                  <Descriptions.Item label="Số vào sổ">{dip.entryNumber}</Descriptions.Item>
                  {fields.map(f => (
                    <Descriptions.Item key={f.id} label={f.name}>
                      {dip.customData[f.id]}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
                {decision && (
                  <Descriptions title="Quyết định tốt nghiệp" bordered column={2} style={{ marginTop: 16 }}>
                    <Descriptions.Item label="Số QĐ">{decision.decisionNumber}</Descriptions.Item>
                    <Descriptions.Item label="Ngày ban hành">{moment(decision.date).format('DD/MM/YYYY')}</Descriptions.Item>
                    <Descriptions.Item label="Trích yếu" span={2}>{decision.summary}</Descriptions.Item>
                  </Descriptions>
                )}
              </Card>
            );
          })}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default App;