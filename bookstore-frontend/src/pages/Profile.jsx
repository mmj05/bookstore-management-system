import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    shippingAddress: '',
    billingAddress: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await usersAPI.getCurrentUser();
      const data = response.data.data;
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        shippingAddress: data.shippingAddress || '',
        billingAddress: data.billingAddress || '',
      });
    } catch (err) {
      setError('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await usersAPI.updateProfile(formData);
      setMessage('Profile updated successfully');
      setEditMode(false);
      fetchProfile();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    try {
      await usersAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage('Password changed successfully');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing password');
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading profile...</div></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p className="text-muted">Manage your account information</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid grid-2">
        {/* Profile Information */}
        <div className="card">
          <div className="flex flex-between flex-center mb-20">
            <h3 className="card-title" style={{ marginBottom: 0 }}>Account Information</h3>
            {!editMode && (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(true)}>
                Edit
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Shipping Address</label>
                <textarea
                  className="form-control"
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({...formData, shippingAddress: e.target.value})}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Billing Address</label>
                <textarea
                  className="form-control"
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({...formData, billingAddress: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="flex gap-10">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p><strong>Name:</strong> {profile?.firstName} {profile?.lastName}</p>
              <p><strong>Email:</strong> {profile?.email}</p>
              <p><strong>Phone:</strong> {profile?.phone || '-'}</p>
              <p><strong>Role:</strong> {profile?.role}</p>
              <p><strong>Shipping Address:</strong><br />{profile?.shippingAddress || '-'}</p>
              <p><strong>Billing Address:</strong><br />{profile?.billingAddress || '-'}</p>
              <p><strong>Member Since:</strong> {new Date(profile?.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Security */}
        <div className="card">
          <h3 className="card-title">Security</h3>
          
          {!showPasswordForm ? (
            <div>
              <p>Password: ********</p>
              <button 
                className="btn btn-secondary mt-10"
                onClick={() => setShowPasswordForm(true)}
              >
                Change Password
              </button>
            </div>
          ) : (
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                  minLength="8"
                />
              </div>
              
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                />
              </div>

              <div className="flex gap-10">
                <button type="submit" className="btn btn-primary">Update Password</button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <hr className="mt-20 mb-20" />

          <h4>Account Status</h4>
          <p>
            Status: {profile?.isActive ? (
              <span className="badge badge-success">Active</span>
            ) : (
              <span className="badge badge-danger">Inactive</span>
            )}
          </p>
          {profile?.lastLoginAt && (
            <p>Last Login: {new Date(profile.lastLoginAt).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
