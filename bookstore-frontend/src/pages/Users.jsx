import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CUSTOMER',
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let response;
      if (roleFilter) {
        response = await usersAPI.getByRole(roleFilter);
      } else {
        response = await usersAPI.getAll();
      }
      setUsers(response.data.data);
    } catch (err) {
      setError('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }
    
    setLoading(true);
    try {
      const response = await usersAPI.search(searchQuery);
      setUsers(response.data.data);
    } catch (err) {
      setError('Error searching users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await usersAPI.create(newUser);
      setMessage('User created successfully');
      setShowCreateModal(false);
      setNewUser({
        email: '', password: '', firstName: '', lastName: '', phone: '', role: 'CUSTOMER',
      });
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersAPI.updateRole(userId, newRole);
      setMessage('User role updated');
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating role');
    }
  };

  const handleActivate = async (userId) => {
    try {
      await usersAPI.activate(userId);
      setMessage('User activated');
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error activating user');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      await usersAPI.deactivate(userId);
      setMessage('User deactivated');
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deactivating user');
    }
  };

  const handleUnlock = async (userId) => {
    try {
      await usersAPI.unlock(userId);
      setMessage('User account unlocked');
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error unlocking user');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  return (
    <div className="container users-page">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p className="text-muted">Manage user accounts and roles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create User
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Search and Filter */}
      <div className="card mb-20">
        <div className="users-filter-section">
          <form onSubmit={handleSearch} className="users-search-form">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          
          <div className="users-role-filter">
            <label>Role:</label>
            <select
              className="form-control"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMINISTRATOR">Administrator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users */}
      <div className="card">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="empty-state"><h3>No users found</h3></div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="users-mobile-view">
              {users.map(user => (
                <div key={user.id} className="user-card">
                  <div className="user-card-header">
                    <div>
                      <div className="user-card-name">{user.firstName} {user.lastName}</div>
                      <div className="user-card-email">{user.email}</div>
                    </div>
                    <div className="user-card-badges">
                      {user.isActive ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-danger">Inactive</span>
                      )}
                      {user.isLocked && (
                        <span className="badge badge-warning">Locked</span>
                      )}
                    </div>
                  </div>
                  <div className="user-card-details">
                    <div className="user-card-row">
                      <span className="user-card-label">Role:</span>
                      <select
                        className="form-control"
                        style={{ width: 'auto', padding: '5px' }}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMINISTRATOR">Administrator</option>
                      </select>
                    </div>
                    <div className="user-card-row">
                      <span className="user-card-label">Created:</span>
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                    <div className="user-card-row">
                      <span className="user-card-label">Last Login:</span>
                      <span>{formatDate(user.lastLoginAt)}</span>
                    </div>
                  </div>
                  <div className="user-card-actions">
                    {user.isActive ? (
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeactivate(user.id)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleActivate(user.id)}
                      >
                        Activate
                      </button>
                    )}
                    {user.isLocked && (
                      <button 
                        className="btn btn-warning btn-sm"
                        onClick={() => handleUnlock(user.id)}
                      >
                        Unlock
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="users-table-view">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Last Login</th>
                      <th className="actions-column">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            className="form-control"
                            style={{ width: 'auto', padding: '5px' }}
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          >
                            <option value="CUSTOMER">Customer</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMINISTRATOR">Administrator</option>
                          </select>
                        </td>
                        <td>
                          <div className="flex gap-5" style={{ flexWrap: 'wrap' }}>
                            {user.isActive ? (
                              <span className="badge badge-success">Active</span>
                            ) : (
                              <span className="badge badge-danger">Inactive</span>
                            )}
                            {user.isLocked && (
                              <span className="badge badge-warning">Locked</span>
                            )}
                          </div>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>{formatDate(user.lastLoginAt)}</td>
                        <td className="actions-column">
                          <div className="action-buttons">
                            {user.isActive ? (
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeactivate(user.id)}
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={() => handleActivate(user.id)}
                              >
                                Activate
                              </button>
                            )}
                            {user.isLocked && (
                              <button 
                                className="btn btn-warning btn-sm"
                                onClick={() => handleUnlock(user.id)}
                              >
                                Unlock
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <h3 className="card-title">Create New User</h3>
            <form onSubmit={handleCreateUser}>
              <div className="modal-form-grid">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  className="form-control"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                  minLength="8"
                />
                <small className="text-muted">Min 8 characters</small>
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Role *</label>
                <select
                  className="form-control"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Create User</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
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

export default Users;
