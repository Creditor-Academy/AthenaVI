import React, { useState } from 'react';
import { MdSync, MdSearch, MdFilterList } from 'react-icons/md';
import UserProfileModal from './UserProfileModal';

const UsersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const [users, setUsers] = useState([
    { id: 1, name: 'Alex Johnson', email: 'alex@example.com', plan: 'Enterprise', status: 'Active', joined: '2025-01-12', credits: 15000 },
    { id: 2, name: 'Sarah Chen', email: 'sarah.c@tech.com', plan: 'Pro', status: 'Active', joined: '2025-02-01', credits: 2500 },
    { id: 3, name: 'Michael Smith', email: 'mike.s@gmail.com', plan: 'Free', status: 'Suspended', joined: '2025-02-15', credits: 0 },
    { id: 4, name: 'Elena Gilbert', email: 'elena@mystic.com', plan: 'Pro', status: 'Active', joined: '2025-03-01', credits: 1200 },
    { id: 5, name: 'Harvey Specter', email: 'harvey@pearson.com', plan: 'Enterprise', status: 'Active', joined: '2025-03-05', credits: 50000 }
  ]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="admin-card-section" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>User Management</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px' }}>
            <MdSearch style={{ color: '#64748b', marginRight: '8px' }} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none' }}
            />
          </div>
          <button className="btn-admin-action" style={{ background: '#f1f5f9', color: '#334155' }}>
            <MdFilterList /> Filter
          </button>
        </div>
      </div>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Credits</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} onClick={() => setSelectedUser(user)} style={{ cursor: 'pointer' }}>
                <td>
                  <div style={{ fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email}</div>
                </td>
                <td><span className="plan-tag">{user.plan}</span></td>
                <td>
                  <span className={`status-badge ${user.status === 'Active' ? 'status-active' : 'status-suspended'}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.joined}</td>
                <td>{user.credits.toLocaleString()}</td>
                <td><MdSync style={{ color: '#64748b', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }} /></td>
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
            setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
            setSelectedUser(updatedUser);
          }}
          onDeleteUser={(userId) => {
            setUsers(users.filter(u => u.id !== userId));
            setSelectedUser(null);
          }}
        />
      )}
    </section>
  );
};

export default UsersList;
