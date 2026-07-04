'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  loyaltyPoints: number;
  birthday: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'customer' as 'customer' | 'admin',
    loyaltyPoints: 0,
    birthday: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }

      toast.success('User created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          loyaltyPoints: formData.loyaltyPoints,
          birthday: formData.birthday || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      toast.success('User updated successfully!');
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name || '',
      role: user.role as 'customer' | 'admin',
      loyaltyPoints: user.loyaltyPoints,
      birthday: user.birthday || '',
    });
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'customer',
      loyaltyPoints: 0,
      birthday: '',
    });
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const customerCount = users.filter(u => u.role === 'customer').length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-1">User Management</h1>
              <p className="text-muted-foreground">Create and manage admin & customer accounts</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              + Create User
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Users</div>
            <div className="text-3xl font-bold">{users.length}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground mb-2">Admins</div>
            <div className="text-3xl font-bold text-orange-600">{adminCount}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground mb-2">Customers</div>
            <div className="text-3xl font-bold text-green-600">{customerCount}</div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* User List */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg truncate">
                      {user.name || 'No name'}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>📧 {user.email}</div>
                    <div>🎁 {user.loyaltyPoints} points</div>
                    {user.birthday && (
                      <div>🎂 {new Date(user.birthday).toLocaleDateString()}</div>
                    )}
                    <div>📅 Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(user)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No users found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-heading text-2xl font-bold mb-6">Create New User</h2>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Min 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'customer' | 'admin' })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Loyalty Points</label>
                <input
                  type="number"
                  min="0"
                  value={formData.loyaltyPoints}
                  onChange={(e) => setFormData({ ...formData, loyaltyPoints: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Birthday (Optional)</label>
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-accent transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-heading text-2xl font-bold mb-6">Edit User</h2>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Email (Cannot change)</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-border bg-muted text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'customer' | 'admin' })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Loyalty Points</label>
                <input
                  type="number"
                  min="0"
                  value={formData.loyaltyPoints}
                  onChange={(e) => setFormData({ ...formData, loyaltyPoints: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Birthday</label>
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
                >
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-accent transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
