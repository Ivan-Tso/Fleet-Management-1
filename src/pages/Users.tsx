import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, UserPlus, Users as UsersIcon, Shield, Loader2 } from 'lucide-react';
import { AddUserModal } from '../components/AddUserModal';

type User = {
  id: string;
  username: string;
  role: string;
  created_at: string;
};

export function Users() {
  const { language, t } = useLanguage();
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Localization fallbacks
  const tUsers = {
    title: language === 'zh' ? '用户管理' : 'User Management',
    desc: language === 'zh' ? '分配和管理系统用户账户' : 'Assign and manage system user accounts',
    addUser: language === 'zh' ? '添加用户' : 'Add User',
    username: language === 'zh' ? '用户名' : 'Username',
    role: language === 'zh' ? '角色' : 'Role',
    createdAt: language === 'zh' ? '创建时间' : 'Created At',
    actions: language === 'zh' ? '操作' : 'Actions',
    adminRole: language === 'zh' ? '管理员' : 'Admin',
    userRole: language === 'zh' ? '普通用户' : 'User',
    deleteConfirm: language === 'zh' ? '确定要删除此用户吗？这也会删除其所有关联数据！' : 'Are you sure you want to delete this user? This will also delete all their associated data!',
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        const text = await res.text();
        console.error('Failed to fetch users:', text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm(tUsers.deleteConfirm)) return;
    
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchUsers();
      } else {
        alert(language === 'zh' ? '删除失败' : 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        <p>{language === 'zh' ? '仅管理员可访问此页面' : 'Only administrators can access this page'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 uppercase">{tUsers.title}</h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">{tUsers.desc}</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {tUsers.addUser}
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-zinc-500 uppercase tracking-widest bg-zinc-900/50 border-b border-zinc-900">
              <tr>
                <th className="px-6 py-4 font-medium">{tUsers.username}</th>
                <th className="px-6 py-4 font-medium">{tUsers.role}</th>
                <th className="px-6 py-4 font-medium">{tUsers.createdAt}</th>
                <th className="px-6 py-4 font-medium text-right">{tUsers.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    {language === 'zh' ? '暂无用户' : 'No users found'}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center font-medium text-zinc-300">
                        {u.username}
                        {u.id === String(currentUser.id) && (
                          <span className="ml-2 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">
                            {language === 'zh' ? '您' : 'You'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {u.role === 'admin' ? <Shield className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> : <UsersIcon className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />}
                        <span className={u.role === 'admin' ? 'text-blue-400' : 'text-zinc-400'}>
                          {u.role === 'admin' ? tUsers.adminRole : tUsers.userRole}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-mono">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.id !== String(currentUser.id) && (
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-zinc-500 hover:text-red-400 p-2 rounded-full hover:bg-zinc-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchUsers} 
      />
    </div>
  );
}
