
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  raw_user_meta_data: {
    name?: string;
  };
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
}

interface ModeratorClass {
  id: string;
  user_id: string;
  class_code: string;
  created_at: string;
}

interface ModeratorTableProps {
  users: User[];
  userRoles: UserRole[];
  moderatorClasses: ModeratorClass[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const ModeratorTable: React.FC<ModeratorTableProps> = ({
  users,
  userRoles,
  moderatorClasses,
  loading,
  onEdit,
  onDelete,
}) => {
  const getUserRoles = (userId: string) => {
    return userRoles
      .filter(ur => ur.user_id === userId)
      .map(ur => ur.role);
  };

  const getUserClasses = (userId: string) => {
    return moderatorClasses
      .filter(mc => mc.user_id === userId)
      .map(mc => mc.class_code);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage administrators and moderators, and assign them to specific classes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-islamic-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Assigned Classes</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {user.raw_user_meta_data?.name || 'Unnamed User'}
                    </td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {getUserRoles(user.id).map(role => (
                          <Badge key={role} variant={role === 'admin' ? 'default' : 'outline'}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {getUserRoles(user.id).includes('admin') ? (
                          <span className="text-xs text-gray-500">All Classes</span>
                        ) : (
                          getUserClasses(user.id).map(classCode => (
                            <Badge key={classCode} variant="secondary">
                              {classCode}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(user)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDelete(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModeratorTable;
