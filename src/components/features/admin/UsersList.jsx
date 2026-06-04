import React, { useEffect, useState } from 'react';
import { MdSync, MdSearch, MdFilterList, MdAdd, MdEdit, MdPowerSettingsNew, MdDeleteForever, MdRestore, MdOutlineFolderShared } from 'react-icons/md';
import UserProfileModal from './UserProfileModal';
import './UserProfileModal.css';

const roleOptions = ['Owner', 'Admin', 'Editor', 'Viewer', 'Super Admin', 'Workspace Admin', 'Member'];
const workspaceOptions = ['Global', 'Forge Studio', 'Pulse CRM', 'Beacon Media', 'Astra Ventures'];
const planOptions = ['Free', 'Pro', 'Enterprise'];
const userStatusOptions = ['Active', 'Suspended', 'Deactivated'];

const AddUserModal = ({ isOpen, onClose, onCreate }) => {
  const [formValues, setFormValues] = useState({
    name: '', email: '', role: 'Viewer', workspace: 'Global', plan: 'Pro', status: 'Active', credits: 0,
  });

  useEffect(() => {
    if (isOpen) {
      setFormValues({
        name: '',
        email: '',
        role: 'Viewer',
        workspace: 'Global',
        plan: 'Pro',
        status: 'Active',
        credits: 0,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field) => (event) => {
    setFormValues({ ...formValues, [field]: field === 'credits' ? Number(event.target.value) : event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formValues.name || !formValues.email) {
      alert('Please add a user name and email.');
      return;
    }
    onCreate(formValues);
    onClose();
  };

  return (
    <div className="user-profile-modal modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><MdDeleteForever /></button>
        <div className="modal-header">
          <div className="modal-header-top">
            <div className="user-avatar-large">+</div>
            <div className="user-info">
              <h2 style={{ margin: 0 }}>Add New User</h2>
              <p className="modal-subtitle">Create a new account and assign workspace access.</p>
            </div>
          </div>
        </div>

        <div className="modal-body">
          <form className="modal-section" onSubmit={handleSubmit}>
            <div className="profile-fields">
              <div className="field-row">
                <div className="field-group">
                  <label>Name</label>
                  <input className="modal-input" type="text" value={formValues.name} onChange={handleChange('name')} placeholder="Full name" />
                </div>
                <div className="field-group">
                  <label>Email</label>
                  <input className="modal-input" type="email" value={formValues.email} onChange={handleChange('email')} placeholder="Email address" />
                </div>
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label>Role</label>
                  <select className="modal-input" value={formValues.role} onChange={handleChange('role')}>
                    {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label>Workspace</label>
                  <select className="modal-input" value={formValues.workspace} onChange={handleChange('workspace')}>
                    {workspaceOptions.map((workspace) => <option key={workspace} value={workspace}>{workspace}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label>Plan</label>
                  <select className="modal-input" value={formValues.plan} onChange={handleChange('plan')}>
                    {planOptions.map((plan) => <option key={plan} value={plan}>{plan}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label>Status</label>
                  <select className="modal-input" value={formValues.status} onChange={handleChange('status')}>
                    {userStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field-group">
                  <label>Starting Credits</label>
                  <input className="modal-input" type="number" value={formValues.credits} onChange={handleChange('credits')} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '22px' }}>
              <button className="btn-primary" type="submit">Create User</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const UsersList = ({ users = [], setUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
      
    const workspacesList = user.workspaces || [{ name: user.workspace || '', role: user.role || '' }];
    const matchesWorkspace = workspacesList.some(ws => ws.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch || matchesWorkspace;
  });

  const handleCreateUser = (userData) => {
    const id = Math.max(0, ...users.map((user) => user.id)) + 1;
    const initialWorkspace = { name: userData.workspace, role: userData.role };
    setUsers([{ 
      ...userData, 
      id, 
      workspaces: [initialWorkspace], 
      joined: new Date().toISOString().slice(0, 10) 
    }, ...users]);
  };

  const handleUpdateUser = (updatedUser) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const handleToggleStatus = (user, event) => {
    event.stopPropagation();
    const status = user.status === 'Active' ? 'Suspended' : 'Active';
    handleUpdateUser({ ...user, status });
  };

  return (
    <section className="admin-card-section" style={{ marginTop: '24px' }}>
      <div className="user-management-header">
        <h2>User Management</h2>
        <p className="admin-placeholder-text">Manage users, assign workspace roles, and support account troubleshooting.</p>
      </div>

      <div className="user-toolbar">
        <div className="search-bar">
          <MdSearch />
          <input
            type="text"
            placeholder="Search users, roles, workspace..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="user-action-buttons">
          <button className="btn-secondary" onClick={() => setShowAddModal(true)}>
            <MdAdd /> Add user
          </button>
          <button className="btn-secondary">
            <MdFilterList /> Filter
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Workspaces</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Credits</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} onClick={() => setSelectedUser(user)}>
                <td>
                  <div style={{ fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </td>
                <td>{user.role}</td>
                <td>
                  {(() => {
                    const wsList = user.workspaces || [{ name: user.workspace, role: user.role }];
                    const count = wsList.length;
                    const tooltipText = wsList.map(ws => `${ws.name} (${ws.role})`).join('\n');
                    return (
                      <span className="workspace-count-badge" title={tooltipText}>
                        <MdOutlineFolderShared className="workspace-count-icon" size={16} />
                        <span>{count} {count === 1 ? 'Workspace' : 'Workspaces'}</span>
                      </span>
                    );
                  })()}
                </td>
                <td><span className="plan-tag">{user.plan}</span></td>
                <td>
                  <span className={`status-badge ${user.status === 'Active' ? 'status-active' : 'status-suspended'}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.joined}</td>
                <td>{user.credits.toLocaleString()}</td>
                <td>
                  <div className="table-action-group">
                    <button className="user-action-btn icon-only" title="Edit User" onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}>
                      <MdEdit size={18} />
                    </button>
                    <button className="user-action-btn icon-only" title={user.status === 'Active' ? 'Suspend User' : 'Reactivate User'} onClick={(e) => handleToggleStatus(user, e)}>
                      {user.status === 'Active' ? <MdPowerSettingsNew size={18} /> : <MdRestore size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdateUser={(updatedUser) => {
            handleUpdateUser(updatedUser);
            setSelectedUser(updatedUser);
          }}
          onDeleteUser={(userId) => {
            handleDeleteUser(userId);
            setSelectedUser(null);
          }}
        />
      )}

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreate={handleCreateUser}
      />
    </section>
  );
};

export default UsersList;
