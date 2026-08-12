import React, { useEffect, useState } from 'react';
import { getAvatarColorForName, getNameInitials } from '../../../../utils/workspaceUsers.js';

const UserIdentity = ({
  name,
  profileImage = null,
  className = '',
  compact = false,
  showName = true,
  avatarSize,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedName =
    typeof name === 'string' || typeof name === 'number'
      ? String(name)
      : name?.name || name?.fullName || name?.displayName || name?.email || name?.username || '';
  const isEmpty = !resolvedName || resolvedName === '-';

  useEffect(() => {
    setImageFailed(false);
  }, [profileImage]);
  const displayName = isEmpty ? '-' : resolvedName;
  const initials = getNameInitials(isEmpty ? '' : resolvedName);
  const avatarColor = getAvatarColorForName(isEmpty ? '' : resolvedName);
  const showPhoto = Boolean(profileImage) && !imageFailed;

  return (
    <div
      className={`user-identity ${compact ? 'user-identity--compact' : ''} ${className}`.trim()}
      title={isEmpty ? undefined : displayName}
    >
      <span
        className={`user-identity-avatar${showPhoto ? ' user-identity-avatar--photo' : ''}`}
        aria-hidden="true"
        style={
          showPhoto
            ? undefined
            : {
                backgroundColor: avatarColor,
                boxShadow: `0 1px 3px color-mix(in srgb, ${avatarColor} 40%, transparent)`,
              }
        }
      >
        {showPhoto ? (
          <img
            src={profileImage}
            alt=""
            className="user-identity-avatar-img"
            onError={() => setImageFailed(true)}
            style={avatarSize ? { width: avatarSize, height: avatarSize } : undefined}
          />
        ) : (
          initials
        )}
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
