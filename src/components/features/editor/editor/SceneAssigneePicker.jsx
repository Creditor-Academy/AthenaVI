import React from 'react';
import { MdCheck, MdPersonOff } from 'react-icons/md';
import './SceneAssigneePicker.css';

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Per-scene assignee picker — OWNER/ADMIN only, workflow tag (doesn't change who
 * can open/edit the project). Visual sibling of SceneTransitionPicker, swapped
 * into the same sidebar pane.
 */
function SceneAssigneePicker({
  canManage,
  assignee,
  members = [],
  membersLoading,
  busy,
  onAssign,
}) {
  if (!canManage) {
    return (
      <div className="scene-assignee-picker">
        <p className="scene-assignee-picker__lead">
          Assignee is a workflow tag — it doesn’t affect who can open or edit this scene.
        </p>
        <div className="scene-assignee-picker__row scene-assignee-picker__row--static">
          <span className={`scene-assignee-picker__avatar${assignee ? '' : ' scene-assignee-picker__avatar--empty'}`}>
            {assignee ? initials(assignee.name || assignee.email) : <MdPersonOff size={14} />}
          </span>
          <span className="scene-assignee-picker__name">
            {assignee ? assignee.name || assignee.email : 'Unassigned'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="scene-assignee-picker">
      <p className="scene-assignee-picker__lead">
        Assign this scene to a workspace member so the team knows who owns it.
      </p>
      <div className="scene-assignee-picker__list premium-scrollbar">
        <button
          type="button"
          className={`scene-assignee-picker__row ${!assignee ? 'scene-assignee-picker__row--active' : ''}`}
          disabled={busy}
          onClick={() => onAssign?.(null)}
        >
          <span className="scene-assignee-picker__avatar scene-assignee-picker__avatar--empty">
            <MdPersonOff size={14} />
          </span>
          <span className="scene-assignee-picker__name">Unassigned</span>
          {!assignee && <MdCheck className="scene-assignee-picker__check" size={16} />}
        </button>

        {membersLoading && <p className="scene-assignee-picker__hint">Loading members…</p>}
        {!membersLoading && !members.length && (
          <p className="scene-assignee-picker__hint">No members in this workspace.</p>
        )}
        {!membersLoading &&
          members.map((member) => {
            const memberUser = member.user || {};
            const memberId = memberUser.id || member.id;
            const selected = assignee?.id === memberId;
            const label = memberUser.name || memberUser.email || 'Member';
            return (
              <button
                key={memberId}
                type="button"
                className={`scene-assignee-picker__row ${selected ? 'scene-assignee-picker__row--active' : ''}`}
                disabled={busy}
                onClick={() => onAssign?.(memberId)}
              >
                <span className="scene-assignee-picker__avatar">{initials(label)}</span>
                <span className="scene-assignee-picker__copy">
                  <span className="scene-assignee-picker__name">{label}</span>
                  {memberUser.name && memberUser.email ? (
                    <span className="scene-assignee-picker__email">{memberUser.email}</span>
                  ) : null}
                </span>
                {selected && <MdCheck className="scene-assignee-picker__check" size={16} />}
              </button>
            );
          })}
      </div>
    </div>
  );
}

export default SceneAssigneePicker;
