// client/src/pages/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './UserManagement.css';

const UserManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [currentPage, searchTerm, departmentFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/bulk-users/all', {
        headers: { 'x-auth-token': token },
        params: {
          page: currentPage,
          limit: 20,
          search: searchTerm,
          department: departmentFilter
        }
      });
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/bulk-users/departments', {
        headers: { 'x-auth-token': token }
      });
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadStatus(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert(t('userManagement.alerts.selectFile'));
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('csvFile', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/bulk-users/upload', formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadStatus({
        type: 'success',
        message: res.data.message,
        details: res.data
      });

      setSelectedFile(null);
      fetchUsers();
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: err.response?.data?.message || 'Upload failed',
        details: err.response?.data
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/bulk-users/template', {
        headers: { 'x-auth-token': token },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user-upload-template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading template:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t('userManagement.confirmations.deleteUser'))) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/bulk-users/${userId}/delete`, {}, {
        headers: { 'x-auth-token': token }
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || t('userManagement.alerts.deleteError'));
    }
  };

  const handleResendInvitation = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/bulk-users/resend-invitation/${userId}`, {}, {
        headers: { 'x-auth-token': token }
      });
      alert(res.data.message || t('userManagement.alerts.resendSuccess'));
    } catch (err) {
      alert(err.response?.data?.message || t('userManagement.alerts.resendError'));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/bulk-users/${editingUser.id}/update`, editingUser, {
        headers: { 'x-auth-token': token }
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || t('userManagement.alerts.updateError'));
    }
  };

  if (loading) return <div className="loading-spinner"><p>{t('userManagement.loading')}</p></div>;

  return (
    <div className="user-management">
      <div className="page-header">
        <div className="header-left">
          <Link to="/admin" className="back-link">← {t('userManagement.backToAdmin')}</Link>
          <h1>{t('userManagement.title')}</h1>
        </div>
      </div>

      {/* Bulk Upload Section */}
      <div className="upload-section">
        <h2>{t('userManagement.bulkUpload.title')}</h2>
        <p>{t('userManagement.bulkUpload.description')}</p>
        
        <div className="upload-controls">
          <button onClick={handleDownloadTemplate} className="btn-secondary">
            📥 {t('userManagement.bulkUpload.downloadTemplate')}
          </button>
          
          <div className="file-upload">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              id="csvFile"
            />
            <label htmlFor="csvFile" className="file-label">
              {selectedFile ? selectedFile.name : t('userManagement.bulkUpload.chooseFile')}
            </label>
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="btn-primary"
          >
            {uploading ? t('userManagement.bulkUpload.uploading') : `📤 ${t('userManagement.bulkUpload.uploadButton')}`}
          </button>
        </div>

        {uploadStatus && (
          <div className={`upload-status ${uploadStatus.type}`}>
            <p><strong>{uploadStatus.message}</strong></p>
            {uploadStatus.details?.created && (
              <div className="status-details">
                <p>✅ {t('userManagement.uploadStatus.created')}: {uploadStatus.details.created.length} {t('userManagement.uploadStatus.users')}</p>
                <p>⏭️ {t('userManagement.uploadStatus.skipped')}: {uploadStatus.details.skipped.length} {t('userManagement.uploadStatus.users')}</p>
                <p>❌ {t('userManagement.uploadStatus.errors')}: {uploadStatus.details.errors.length}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <input
          type="text"
          placeholder={t('userManagement.filters.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="department-filter"
        >
          <option value="">{t('userManagement.filters.allDepartments')}</option>
          {departments.map((dept, idx) => (
            <option key={idx} value={dept}>{dept}</option>
          ))}
        </select>

        <button onClick={() => { setSearchTerm(''); setDepartmentFilter(''); }} className="btn-secondary">
          {t('userManagement.filters.clearFilters')}
        </button>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>{t('userManagement.table.name')}</th>
              <th>{t('userManagement.table.email')}</th>
              <th>{t('userManagement.table.department')}</th>
              <th>{t('userManagement.table.admin')}</th>
              <th>{t('userManagement.table.joined')}</th>
              <th>{t('userManagement.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.department || '-'}</td>
                <td>{user.isAdmin ? `✅ ${t('userManagement.table.yes')}` : t('userManagement.table.no')}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button onClick={() => handleEditUser(user)} className="btn-icon" title={t('userManagement.table.editTitle')}>
                    ✏️
                  </button>
                  <button onClick={() => handleResendInvitation(user.id)} className="btn-icon" title={t('userManagement.table.resendTitle')}>
                    📧
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)} className="btn-icon btn-danger" title={t('userManagement.table.deleteTitle')}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="btn-secondary"
        >
          {t('userManagement.pagination.previous')}
        </button>
        <span>{t('userManagement.pagination.pageOf', { current: currentPage, total: totalPages })}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="btn-secondary"
        >
          {t('userManagement.pagination.next')}
        </button>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{t('userManagement.editModal.title')}</h2>
            <div className="form-group">
              <label>{t('userManagement.editModal.name')}</label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t('userManagement.editModal.email')}</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t('userManagement.editModal.department')}</label>
              <input
                type="text"
                value={editingUser.department || ''}
                onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={editingUser.isAdmin}
                  onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.checked })}
                />
                {t('userManagement.editModal.adminUser')}
              </label>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveEdit} className="btn-primary">{t('userManagement.editModal.save')}</button>
              <button onClick={() => setEditingUser(null)} className="btn-secondary">{t('userManagement.editModal.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
