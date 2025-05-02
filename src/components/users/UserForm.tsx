import React from 'react';
import { Modal, Form, Input, Select, message } from 'antd';

interface UserFormProps {
  visible: boolean;
  confirmLoading: boolean;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  initialValues?: any;
  roles: string[];
}

const UserForm: React.FC<UserFormProps> = ({ visible, confirmLoading, onSubmit, onCancel, initialValues, roles }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  return (
    <Modal
      visible={visible}
      title={initialValues ? 'Edit User' : 'Add User'}
      okText={initialValues ? 'Update' : 'Create'}
      cancelText="Cancel"
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            onSubmit(values);
          })
          .catch(() => {
            message.error('Please fill all required fields correctly.');
          });
      }}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item name="full_name" label="Full Name" rules={[{ required: true, message: 'Please enter full name' }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select a role' }]}> 
          <Select>
            {roles.map(role => <Select.Option value={role} key={role}>{role}</Select.Option>)}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserForm;
