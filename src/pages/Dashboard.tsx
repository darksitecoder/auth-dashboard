import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../components/ui/Modal';
import { Form, FormField, FormActions } from '../components/ui/Form';
import { Input } from '../components/ui/Input';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { 
    users, 
    pendingUsers,
    isLoading, 
    error, 
    totalPages, 
    currentPage,
    fetchUsers, 
    fetchPendingUsers,
    createUser, 
    updateUser, 
    deleteUser,
    approveUser,
    rejectUser,
    clearError 
  } = useUserStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'pending'>('users');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    avatar: ''
  });

  useEffect(() => {
    fetchUsers();
    if (user?.isAdmin) {
      fetchPendingUsers();
    }
  }, [fetchUsers, fetchPendingUsers, user?.isAdmin]);

  const handleLogout = () => {
    logout();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Generate a random avatar URL if not provided
      const userData = {
        ...formData,
        avatar: formData.avatar || `https://reqres.in/img/faces/${Math.floor(Math.random() * 12) + 1}-image.jpg`
      };
      await createUser(userData);
      setIsCreateModalOpen(false);
      setFormData({ first_name: '', last_name: '', email: '', avatar: '' });
    } catch (err) {
      // Error handled by store
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      await updateUser(editingUser.id, formData);
      setIsEditModalOpen(false);
      setEditingUser(null);
      setFormData({ first_name: '', last_name: '', email: '', avatar: '' });
    } catch (err) {
      // Error handled by store
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
      } catch (err) {
        // Error handled by store
      }
    }
  };

  const handleApproveUser = async (id: number) => {
    if (window.confirm('Are you sure you want to approve this user?')) {
      try {
        await approveUser(id);
      } catch (err) {
        // Error handled by store
      }
    }
  };

  const handleRejectUser = async (id: number) => {
    if (window.confirm('Are you sure you want to reject this user?')) {
      try {
        await rejectUser(id);
      } catch (err) {
        // Error handled by store
      }
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      avatar: user.avatar
    });
    setIsEditModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              {user?.isAdmin && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src={user?.avatar} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-gray-700">
                  Welcome, {user?.first_name} {user?.last_name}
                </span>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearError}
                className="mt-2"
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* Tabs for Admin */}
          {user?.isAdmin && (
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Approved Users ({users.length})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pending'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pending Approval ({pendingUsers.length})
                </button>
              </nav>
            </div>
          )}

          {/* Actions */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab === 'users' ? 'Users' : 'Pending Users'}
            </h2>
            {activeTab === 'users' && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                Add User
              </Button>
            )}
          </div>

          {/* Users Grid */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'users' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.map((user) => (
                    <Card key={user.id}>
                      <CardBody>
                        <div className="flex items-center space-x-4">
                          <img 
                            src={user.avatar} 
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditModal(user)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'pending' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingUsers.map((user) => (
                    <Card key={user.id}>
                      <CardBody>
                        <div className="flex items-center space-x-4">
                          <img 
                            src={user.avatar} 
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">
                              Requested: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleApproveUser(user.id)}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleRejectUser(user.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                  {pendingUsers.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No pending users to approve
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Pagination - Only for approved users */}
          {activeTab === 'users' && totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create User Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ModalHeader>
          <h3 className="text-lg font-medium text-gray-900">Create New User</h3>
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={handleCreateUser}>
            <FormField label="First Name" required>
              <Input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="Enter first name"
                required
              />
            </FormField>
            <FormField label="Last Name" required>
              <Input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Enter last name"
                required
              />
            </FormField>
            <FormField label="Email" required>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email"
                required
              />
            </FormField>
            <FormField label="Avatar URL">
              <Input
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                placeholder="Enter avatar URL (optional)"
              />
            </FormField>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateUser} isLoading={isLoading}>
            Create User
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalHeader>
          <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={handleEditUser}>
            <FormField label="First Name" required>
              <Input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="Enter first name"
                required
              />
            </FormField>
            <FormField label="Last Name" required>
              <Input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Enter last name"
                required
              />
            </FormField>
            <FormField label="Email" required>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email"
                required
              />
            </FormField>
            <FormField label="Avatar URL">
              <Input
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                placeholder="Enter avatar URL"
              />
            </FormField>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleEditUser} isLoading={isLoading}>
            Update User
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
