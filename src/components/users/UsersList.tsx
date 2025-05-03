import React from 'react';
import { UserRole, isUserRoleArray, convertRolesToUserRoles } from '@/lib/auth-types';
import { Role } from '@/lib/auth-rbac-types';

interface UserListProps {
  // Add necessary props
  users: any[];
}

export const UsersList: React.FC<UserListProps> = ({ users }) => {
  // Function to process user roles correctly
  const processUserRoles = (roles: UserRole[] | Role[]): UserRole[] => {
    if (isUserRoleArray(roles)) {
      return roles as UserRole[];
    } else {
      return convertRolesToUserRoles(roles as Role[]);
    }
  };

  return (
    <div>
      {/* Render users with properly converted roles */}
      {users.map(user => {
        const userRoles = processUserRoles(user.roles);
        return (
          <div key={user.id}>
            {/* Use userRoles here */}
          </div>
        );
      })}
    </div>
  );
};

export default UsersList;
