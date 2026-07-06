import { useEffect, useState } from 'react';
import { ToggleLeft, ToggleRight, Trash2, Search } from 'lucide-react';
import type { User, PaginationMeta } from '../../types';
import { usersApi } from '../../api/users';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-purple-50 text-purple-700',
  SHOP_OWNER: 'bg-blue-50 text-blue-700',
  CUSTOMER: 'bg-gray-50 text-gray-600',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    usersApi.getAll({ page, limit: 15, search, ...(roleFilter && { role: roleFilter }) })
      .then(({ data }) => { setUsers(data.users); setMeta(data.meta); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, search, roleFilter]);

  const handleToggle = async (id: string, name: string, isActive: boolean) => {
    try {
      await usersApi.toggle(id);
      toast.success(`${name} ${isActive ? 'suspended' : 'activated'}`);
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    try {
      await usersApi.delete(id);
      toast.success('User deleted');
      fetchUsers();
    } catch { toast.error('Failed to delete user'); }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800">Users</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[180px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="SHOP_OWNER">Shop Owner</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Role', 'Phone', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-500">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_STYLES[user.role]}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{user.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {user.role !== 'ADMIN' && (
                          <>
                            <button onClick={() => handleToggle(user.id, `${user.firstName} ${user.lastName}`, user.isActive)}
                              className={`p-1.5 rounded-lg transition-colors ${user.isActive ? 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
                              title={user.isActive ? 'Suspend' : 'Activate'}>
                              {user.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            </button>
                            <button onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                        {user.role === 'ADMIN' && (
                          <span className="text-xs text-gray-400 italic">Protected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && <div className="px-5 py-3 border-t border-gray-50"><Pagination meta={meta} onPageChange={setPage} /></div>}
        </div>
      )}
    </div>
  );
}
