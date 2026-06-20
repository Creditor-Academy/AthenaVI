import React from 'react';
import { MdMonetizationOn } from 'react-icons/md';

export const getWorkspaceCreditsValue = (workspace) =>
  Number(workspace?.workspaceCredits ?? workspace?.credits ?? 0);

export const formatWorkspaceCredits = (workspace) =>
  getWorkspaceCreditsValue(workspace).toLocaleString();

const WorkspaceCreditsBadge = ({
  workspace,
  onClick,
  clickable = false,
  className = '',
}) => {
  if (workspace?.type !== 'workspace') return null;

  const credits = formatWorkspaceCredits(workspace);
  const content = (
    <>
      <MdMonetizationOn className="workspace-credits-badge__icon" size={15} aria-hidden />
      <span className="workspace-credits-badge__amount">{credits}</span>
    </>
  );

  if (clickable && onClick) {
    return (
      <button
        type="button"
        className={`workspace-credits-badge workspace-credits-badge--clickable ${className}`.trim()}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick(workspace);
        }}
        title="Transfer credit"
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`workspace-credits-badge ${className}`.trim()} title="Available credits">
      {content}
    </div>
  );
};

export default WorkspaceCreditsBadge;
