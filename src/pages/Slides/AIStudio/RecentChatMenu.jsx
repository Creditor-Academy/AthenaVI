import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import './RecentChatMenu.css';

export default function RecentChatMenu({ open, onToggle, onRename, onDelete }) {
  const wrapRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !wrapRef.current) return undefined;
    const place = () => {
      const rect = wrapRef.current.getBoundingClientRect();
      const menuW = 176;
      const left = Math.min(rect.right + 6, window.innerWidth - menuW - 8);
      const top = Math.min(rect.top, window.innerHeight - 140);
      setPos({ top, left: Math.max(8, left) });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={`recent-chat-menu-wrap${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="recent-chat-more"
        title="Chat options"
        aria-label="Chat options"
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.();
        }}
      >
        <MoreHorizontal size={16} />
      </button>
      {open && createPortal(
        <div
          className="recent-chat-menu"
          role="menu"
          style={{ top: pos.top, left: pos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" role="menuitem" onClick={onRename}>
            <Pencil size={15} /> Rename
          </button>
          <button type="button" role="menuitem" className="is-danger" onClick={onDelete}>
            <Trash2 size={15} /> Delete
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
