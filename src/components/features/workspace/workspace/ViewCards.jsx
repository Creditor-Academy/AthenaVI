import React, { useMemo } from 'react';
import {
    MdFolder,
    MdPerson,
    MdPeople,
    MdOutlineBolt,
    MdPlayArrow,
    MdFolderOpen,
    MdSchedule,
    MdVerified,
    MdAdd,
    MdWorkspaces,
    MdCreateNewFolder,
    MdMovieCreation,
} from 'react-icons/md';
import ContextMenu from './ContextMenu.jsx';
import UserIdentity from './UserIdentity.jsx';
import ProjectSceneThumbnail from './ProjectSceneThumbnail.jsx';
import { formatWorkspaceCredits } from './WorkspaceCreditsBadge.jsx';

function formatRelativeLabel(dateStr) {
    if (!dateStr) return 'Recently';
    const time = new Date(dateStr).getTime();
    if (Number.isNaN(time)) return 'Recently';
    const mins = Math.floor((Date.now() - time) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    return new Date(time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getWorkspacePeople(workspace) {
    const people = [];
    const seen = new Set();

    // Helper to add a person, deduplicating by name
    function addPerson(entry) {
        const key = (entry.name || '').toLowerCase().trim();
        if (!key || key === '-' || seen.has(key)) return;
        seen.add(key);
        people.push(entry);
    }

    // --- Owner ---
    const ownerName = workspace.ownerName ||
        workspace.owner?.name ||
        workspace.owner?.email ||
        workspace.owner?.username;
    if (ownerName && ownerName !== '-') {
        addPerson({
            key: 'owner',
            name: ownerName,
            profileImage:
                workspace.ownerProfileImage ||
                workspace.ownerAvatar ||
                workspace.owner?.profileImage ||
                workspace.owner?.avatarUrl ||
                null,
        });
    }

    // --- Members — handle multiple API shapes ---
    const members = Array.isArray(workspace.members) ? workspace.members : [];
    members.forEach((member, index) => {
        // Shape A: { user: { name, email, profileImage }, role }
        // Shape B: { name, email, userName, profileImage, avatarUrl }
        const name =
            member.user?.name ||
            member.user?.email ||
            member.user?.username ||
            member.name ||
            member.email ||
            member.userName ||
            member.username;

        const profileImage =
            member.user?.profileImage ||
            member.user?.avatarUrl ||
            member.user?.avatar ||
            member.profileImage ||
            member.avatarUrl ||
            member.avatar ||
            null;

        if (!name) return;

        addPerson({
            key: member.id || member.userId || member.user?.id || member.user?._id || `member-${index}`,
            name,
            profileImage,
        });
    });

    return people;
}

function getWorkspaceMemberCount(workspace) {
    if (Array.isArray(workspace.members)) {
        const hasOwner = workspace.members.some(
            (member) => String(member.role || '').toUpperCase() === 'OWNER'
        );
        const count = workspace.members.length;
        return hasOwner ? count : count + 1;
    }
    return workspace.type === 'personal' ? 1 : null;
}

/* ──────────────────────────────────────────────────────────────────────────── */
/*  WORKSPACE CARD                                                              */
/* ──────────────────────────────────────────────────────────────────────────── */

export const WorkspaceCard = ({
    workspace,
    onClick,
    contextProps,
    onAllocateCredits,
    showAllocateCredits = false,
}) => {
    const isPersonal = workspace.type === 'personal';
    const people = useMemo(() => getWorkspacePeople(workspace), [workspace]);
    const visiblePeople = people.slice(0, 4);
    const overflowCount = Math.max(0, people.length - visiblePeople.length);
    const memberCount = getWorkspaceMemberCount(workspace);
    const relative = formatRelativeLabel(
        workspace.lastModifiedAt || workspace.updatedAt || workspace.createdAt
    );
    const roleLabel = isPersonal
        ? 'Personal'
        : String(workspace.userRole || 'MEMBER').toUpperCase() === 'OWNER'
            ? 'Owner'
            : 'Member';

    return (
        <article
            className={`wsc-card wsc-workspace-card ${isPersonal ? 'wsc-workspace-card--personal' : 'wsc-workspace-card--team'}`}
            onClick={onClick}
        >
            {/* Gradient header — overflow:hidden clips gradient, so NO menu here */}
            <div className="wsc-workspace-card__header" aria-hidden="true">
                <div className="wsc-workspace-card__orb wsc-workspace-card__orb--1" />
                <div className="wsc-workspace-card__orb wsc-workspace-card__orb--2" />

                <div className="wsc-workspace-card__icon-wrap">
                    {isPersonal ? <MdPerson size={28} /> : <MdPeople size={28} />}
                </div>

                <div className="wsc-workspace-card__role-pill">
                    <MdVerified size={12} />
                    <span>{roleLabel}</span>
                </div>
            </div>

            {/* Body */}
            <div className="wsc-workspace-card__body">
                <div className="wsc-workspace-card__meta">
                    <MdSchedule size={12} />
                    <span>{relative}</span>
                </div>

                <h4 className="wsc-workspace-card__title">{workspace.name}</h4>

                {/* Footer */}
                <div className="wsc-workspace-card__footer">
                    <div className="wsc-workspace-card__people">
                        {visiblePeople.map((person) => (
                            <UserIdentity
                                key={person.key}
                                name={person.name}
                                profileImage={person.profileImage}
                                compact
                                showName={false}
                                className="wsc-workspace-card__avatar"
                            />
                        ))}
                        {overflowCount > 0 && (
                            <span className="wsc-workspace-card__overflow">+{overflowCount}</span>
                        )}
                        {visiblePeople.length === 0 && (
                            <UserIdentity
                                name={workspace.ownerName || 'Owner'}
                                compact
                                showName={false}
                                className="wsc-workspace-card__avatar"
                            />
                        )}
                    </div>

                    <div className="wsc-workspace-card__tools">
                        {!isPersonal && (
                            showAllocateCredits && onAllocateCredits ? (
                                <button
                                    type="button"
                                    className="wsc-workspace-card__tool wsc-workspace-card__tool--credits"
                                    title={`${formatWorkspaceCredits(workspace)} credits`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onAllocateCredits(workspace);
                                    }}
                                >
                                    <MdOutlineBolt size={13} />
                                    <span>{formatWorkspaceCredits(workspace)}</span>
                                </button>
                            ) : (
                                <span
                                    className="wsc-workspace-card__tool wsc-workspace-card__tool--credits"
                                    title={`${formatWorkspaceCredits(workspace)} credits`}
                                >
                                    <MdOutlineBolt size={13} />
                                </span>
                            )
                        )}
                        <span className="wsc-workspace-card__tool" title={memberCount != null ? `${memberCount} members` : 'Members'}>
                            <MdPeople size={13} />
                            {memberCount != null && <span>{memberCount}</span>}
                        </span>
                    </div>
                </div>
            </div>

            {/*
              ✅ Context menu is a DIRECT child of the card article (not inside header).
              The card has overflow:visible so the dropdown can escape the card boundary.
            */}
            <div
                className="wsc-card__menu"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                <ContextMenu type="workspace" {...contextProps} />
            </div>
        </article>
    );
};

/* ──────────────────────────────────────────────────────────────────────────── */
/*  FOLDER CARD                                                                 */
/* ──────────────────────────────────────────────────────────────────────────── */

export const FolderCard = ({ folder, onClick, contextProps }) => {
    const relative = formatRelativeLabel(folder.createdAt || folder.updatedAt);

    return (
        <div className="wsc-card wsc-folder-card" onClick={onClick}>
            {/* Thumbnail — overflow:hidden clips icon animation, so NO menu here */}
            <div className="wsc-folder-card__thumb" aria-hidden="true">
                <div className="wsc-folder-card__thumb-bg" />

                <div className="wsc-folder-card__icon-wrap">
                    <MdFolder size={36} className="wsc-folder-card__icon" />
                    <MdFolderOpen size={36} className="wsc-folder-card__icon-open" />
                </div>

                <div className="wsc-card__hover-overlay">
                    <span>Open Folder</span>
                </div>
            </div>

            {/* Meta */}
            <div className="wsc-folder-card__meta">
                <div className="wsc-folder-card__info">
                    <h4 className="wsc-folder-card__title">{folder.name}</h4>
                    <div className="wsc-folder-card__byline">
                        <MdSchedule size={11} />
                        <span>{relative}</span>
                        {folder.createdBy && (
                            <>
                                <span className="wsc-card__dot" aria-hidden="true">·</span>
                                <UserIdentity name={folder.createdBy} compact showName={false} />
                                <span className="wsc-folder-card__creator">{folder.createdBy}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ Menu at card root level — escapes thumbnail's overflow:hidden */}
            <div
                className="wsc-card__menu"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                <ContextMenu type="folder" {...contextProps} />
            </div>
        </div>
    );
};

/* ──────────────────────────────────────────────────────────────────────────── */
/*  VIDEO CARD                                                                  */
/* ──────────────────────────────────────────────────────────────────────────── */

export const VideoCard = ({ video, onClick, contextProps }) => {
    const relative = formatRelativeLabel(video.updatedAt || video.createdAt);
    const statusLabel = video.status
        ? String(video.status).charAt(0).toUpperCase() + String(video.status).slice(1).toLowerCase()
        : null;

    return (
        <div className="wsc-card wsc-video-card" onClick={onClick}>
            {/* Thumbnail — overflow:hidden clips video scale, so NO menu here */}
            <div className="wsc-video-card__thumb" aria-hidden="true">
                <div className="wsc-video-card__thumb-inner">
                    <ProjectSceneThumbnail video={video} />
                </div>

                <div className="wsc-card__hover-overlay">
                    <div className="wsc-video-card__play-btn">
                        <MdPlayArrow size={22} />
                    </div>
                    <span>Open Project</span>
                </div>

                {statusLabel && (
                    <div className={`wsc-video-card__status wsc-video-card__status--${(video.status || '').toLowerCase()}`}>
                        {statusLabel}
                    </div>
                )}
            </div>

            {/* Meta */}
            <div className="wsc-video-card__meta">
                <div className="wsc-video-card__info">
                    <h4 className="wsc-video-card__title">{video.name}</h4>
                    <div className="wsc-video-card__byline">
                        <MdSchedule size={11} />
                        <span>{relative}</span>
                        {video.createdBy && (
                            <>
                                <span className="wsc-card__dot" aria-hidden="true">·</span>
                                <UserIdentity name={video.createdBy} compact showName={false} />
                                <span className="wsc-video-card__creator">{video.createdBy}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ Menu at card root level — escapes thumbnail's overflow:hidden */}
            <div
                className="wsc-card__menu"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                <ContextMenu type="video" {...contextProps} />
            </div>
        </div>
    );
};

/* ──────────────────────────────────────────────────────────────────────────── */
/*  CREATE CARDS (Workspace · Folder · Video)                                   */
/* ──────────────────────────────────────────────────────────────────────────── */

export const CreateWorkspaceCard = ({ onClick }) => {
    return (
        <article
            className="wsc-card wsc-workspace-card wsc-create-card"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            }}
        >
            <div className="wsc-create-card__inner">
                <div className="wsc-create-card__icon-circle">
                    <MdAdd size={28} />
                </div>
                <div className="wsc-create-card__content">
                    <h4 className="wsc-create-card__title">Create Workspace</h4>
                </div>
                <div className="wsc-create-card__badge">
                    <MdWorkspaces size={13} />
                    <span>New Space</span>
                </div>
            </div>
        </article>
    );
};

export const CreateFolderCard = ({ onClick }) => {
    return (
        <div
            className="wsc-card wsc-folder-card wsc-create-card"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            }}
        >
            <div className="wsc-create-card__inner">
                <div className="wsc-create-card__icon-circle">
                    <MdAdd size={28} />
                </div>
                <div className="wsc-create-card__content">
                    <h4 className="wsc-create-card__title">Create Folder</h4>
                </div>
                <div className="wsc-create-card__badge">
                    <MdCreateNewFolder size={13} />
                    <span>New Folder</span>
                </div>
            </div>
        </div>
    );
};

export const CreateVideoCard = ({ onClick }) => {
    return (
        <div
            className="wsc-card wsc-video-card wsc-create-card"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            }}
        >
            <div className="wsc-create-card__inner">
                <div className="wsc-create-card__icon-circle">
                    <MdAdd size={28} />
                </div>
                <div className="wsc-create-card__content">
                    <h4 className="wsc-create-card__title">Create Project</h4>
                </div>
                <div className="wsc-create-card__badge">
                    <MdMovieCreation size={13} />
                    <span>Video or PPT</span>
                </div>
            </div>
        </div>
    );
};

