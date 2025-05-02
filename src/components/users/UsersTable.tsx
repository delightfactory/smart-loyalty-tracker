import React from 'react';
import { Table, Button, Space, Input, Tag } from 'antd';
import { format } from 'date-fns';

interface User {
  id: string;
  full_name: string;
  email: string;
  roles: string[];
  created_at: string;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onAdd: () => void;
  onSearch: (search: string) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, loading, onEdit, onDelete, onAdd, onSearch }) => {
  const [search, setSearch] = React.useState('');

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: (a: User, b: User) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => roles.map(role => <Tag color="blue" key={role}>{role}</Tag>),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => format(new Date(date), 'yyyy-MM-dd HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, user: User) => (
        <Space>
          <Button onClick={() => onEdit(user)} type="link">Edit</Button>
          <Button onClick={() => onDelete(user)} type="link" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search by name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onSearch={onSearch}
          allowClear
          style={{ width: 250 }}
        />
        <Button type="primary" onClick={onAdd}>Add User</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default UsersTable;
