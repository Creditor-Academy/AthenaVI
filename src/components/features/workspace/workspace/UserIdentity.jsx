import React from 'react';
import { getAvatarColorForName, getNameInitials } from '../../../../utils/workspaceUsers.js';

const UserIdentity = ({ name, className = '', compact = false, showName = true }) => {
  const isEmpty = !name || name === '-';
  const displayName = isEmpty ? '-' : name;
  const initials = getNameInitials(isEmpty ? '' : name);
  const avatarColor = getAvatarColorForName(isEmpty ? '' : name);

  return (
    <div
      className={`user-identity ${compact ? 'user-identity--compact' : ''} ${className}`.trim()}
      title={isEmpty ? undefined : displayName}
    >
      <span
        className="user-identity-avatar"
        aria-hidden="true"
        style={{
          backgroundColor: avatarColor,
          boxShadow: `0 1px 3px color-mix(in srgb, ${avatarColor} 40%, transparent)`
        }}
      >
        {initials}
      </span>
      {showName && <span className="user-identity-name">{displayName}</span>}
    </div>
  );
};

export const UserMetaLine = ({ label, name }) => (
  <div className="meta-user-line">
    <span className="meta-user-line-label">{label}</span>
    <UserIdentity name={name} compact />
  </div>
);

export default UserIdentity;
