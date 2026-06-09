import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdClose, MdInfo } from 'react-icons/md';
import UserIdentity from './UserIdentity.jsx';
import { formatOnlyDate } from './ViewRows.jsx';
import { formatFolderSize, formatProjectSize } from '../../../../utils/formatSize.js';
import './PremiumModal.css';

function getWorkspaceMemberCount(workspace) {
  const hasOwner = (workspace.members || []).some(
    (member) => String(member.role || '').toUpperCase() === 'OWNER'
  );
  const count = (workspace.members || []).length;
  const finalCount = hasOwner ? count : count + 1;
  return `${finalCount} ${finalCount === 1 ? 'member' : 'members'}`;
}

const DetailRow = ({ label, children }) => (
  <div className="item-details-row">
    <span className="item-details-label">{label}</span>
    <div className="item-details-value">{children}</div>
  </div>
);

const ItemDetailsModal = ({ isOpen, onClose, itemType, item }) => {
  if (!item) return null;

  const typeLabel =
    itemType === 'workspace' ? 'Workspace' : itemType === 'folder' ? 'Folder' : 'Project';

  let rows = [];

  if (itemType === 'workspace') {
    rows = [
      { label: 'Owner', value: <UserIdentity name={item.ownerName} compact /> },
      { label: 'Date created', value: formatOnlyDate(item.createdAt) },
      {
        label: 'Modified by',
        value: <UserIdentity name={item.lastModifiedBy || item.ownerName} compact />
      },
      { label: 'Modified at', value: formatOnlyDate(item.lastModifiedAt || item.updatedAt) },
      { label: 'Size', value: getWorkspaceMemberCount(item) }
    ];
  } else if (itemType === 'folder') {
    rows = [
      { label: 'Owner', value: <UserIdentity name={item.createdBy} compact /> },
      { label: 'Date created', value: formatOnlyDate(item.createdAt) },
      { label: 'Modified by', value: <UserIdentity name={item.lastModifiedBy} compact /> },
      { label: 'Modified at', value: formatOnlyDate(item.lastModifiedAt) },
      { label: 'Size', value: item.displaySize || formatFolderSize(item) }
    ];
  } else {
    const modifiedBy = item.lastModifiedBy || item.lastEditedBy;
    const modifiedAt = item.lastModifiedAt || item.lastEditedAt;
    rows = [
      { label: 'Owner', value: <UserIdentity name={item.createdBy} compact /> },
      { label: 'Date created', value: formatOnlyDate(item.createdAt) },
      { label: 'Modified by', value: <UserIdentity name={modifiedBy} compact /> },
      { label: 'Modified at', value: formatOnlyDate(modifiedAt) },
      { label: 'Size', value: formatProjectSize(item) }
    ];
  }

  const itemName = item.name || item.title || 'Untitled';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay-wrapper">
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="modal-content astryd-modal item-details-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="astryd-header">
              <div className="astryd-title-group">
                <div className="astryd-icon-container">
                  <MdInfo size={20} />
                </div>
                <div>
                  <h2>{typeLabel} details</h2>
                  <p className="astryd-subtitle">{itemName}</p>
                </div>
              </div>
              <button className="astryd-close-btn" type="button" onClick={onClose} title="Close">
                <MdClose size={18} />
              </button>
            </div>

            <div className="astryd-form item-details-body">
              <div className="item-details-rows" style={{ width: '100%' }}>
                {rows.map((row) => (
                  <DetailRow key={row.label} label={row.label}>
                    {row.value}
                  </DetailRow>
                ))}
              </div>
              <div className="astryd-footer">
                <button type="button" className="astryd-btn-primary" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ItemDetailsModal;
