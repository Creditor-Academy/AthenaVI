import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MdAdd,
  MdFace,
  MdGridView,
  MdLock,
  MdPeople,
  MdPublic,
  MdViewList,
} from 'react-icons/md';
import heygenService from '../../services/heygenService';
import '../../components/features/workspace/workspace/WorkspaceStyles.css';
import AvatarsSkeleton from '../page-skeleton/AvatarsSkeleton';
import VideosToolbar from '../Videos/VideosToolbar.jsx';
import '../Videos/Videos.css';
import AvatarCreationCard from './AvatarCreationCard.jsx';
import AvatarLibraryCard from './AvatarLibraryCard.jsx';
import AvatarLibraryRow from './AvatarLibraryRow.jsx';
import AvatarPersona from './AvatarPersona';
import {
  applyAvatarFilters,
  AVATAR_FILTER_OPTIONS,
  AVATAR_GROUP_OPTIONS,
  AVATAR_SECTION_TABS,
  AVATAR_SORT_OPTIONS,
  getAvatarEmptyHint,
  getAvatarEmptyTitle,
  getAvatarSectionSubtitle,
  groupAvatars,
  sortAvatars,
} from './avatarsUtils';
import './Avatars.css';

const TAB_ICONS = {
  public: MdPublic,
  private: MdLock,
  workspace: MdPeople,
};

const PAGE_LIMIT = 20;

function mapAvatarList(avatarList, ownership) {
  return (avatarList || []).map((av, idx) => ({
    id: av.avatar_group_id || av.id || `group-${idx}`,
    name: av.name || av.group_name || 'AI Presenter',
    role: av.role || 'Virtual Presenter',
    description: av.description || 'High-fidelity Athena VI avatar.',
    image:
      av.preview_image_url ||
      av.thumbnail_url ||
      av.normal_image_url ||
      av.image_url ||
      'https://via.placeholder.com/300x400?text=Avatar',
    preview: av.preview_video_url || null,
    category: av.category || (ownership === 'public' ? 'Professional' : 'All'),
    gender: av.gender || 'Unknown',
    style: av.style || 'Modern',
    rating: 4.9,
    rawLooks: av.avatar_looks || [],
  }));
}

function extractAvatarList(responseData) {
  const data = responseData?.data || responseData;
  if (Array.isArray(data)) return data;
  if (data?.avatar_groups) return data.avatar_groups;
  if (data?.avatar_looks) return data.avatar_looks;
  if (data?.avatars) return data.avatars;
  if (responseData?.avatar_looks) return responseData.avatar_looks;
  if (responseData?.avatar_groups) return responseData.avatar_groups;
  return [];
}

function Avatars({ onCreate, onCreateAvatar, onCreateLooks }) {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextToken, setNextToken] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [activeSection, setActiveSection] = useState('public');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');
  const [groupBy, setGroupBy] = useState('none');
  const fetchRequestRef = useRef(0);

  const fetchAvatars = useCallback(async ({ ownership, token, append = false } = {}) => {
    const requestId = append ? fetchRequestRef.current : ++fetchRequestRef.current;

    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const responseData = await heygenService.getAvatarGroups({
        ownership,
        limit: PAGE_LIMIT,
        ...(token ? { token } : {}),
      });

      if (requestId !== fetchRequestRef.current) return;

      const avatarList = extractAvatarList(responseData);
      const data = responseData?.data || responseData;
      const mappedAvatars = mapAvatarList(avatarList, ownership);

      setAvatars((prev) => {
        if (!append) return mappedAvatars;
        const seen = new Set(prev.map((avatar) => avatar.id));
        const next = [...prev];
        mappedAvatars.forEach((avatar) => {
          if (avatar?.id && !seen.has(avatar.id)) next.push(avatar);
        });
        return next;
      });

      setHasMore(!!(data?.has_more ?? responseData?.has_more));
      setNextToken(
        data?.token ??
          responseData?.token ??
          data?.next_token ??
          responseData?.next_token ??
          null
      );
    } catch (error) {
      if (requestId !== fetchRequestRef.current) return;
      console.error('Failed to fetch avatars:', error);
      if (!append) setAvatars([]);
      setHasMore(false);
      setNextToken(null);
    } finally {
      if (requestId !== fetchRequestRef.current) return;
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setSearchQuery('');
    setFilterBy('all');
    setAvatars([]);
    setHasMore(false);
    setNextToken(null);
    fetchAvatars({ ownership: activeSection });
  }, [activeSection, fetchAvatars]);

  const filteredAvatars = useMemo(() => {
    const filtered = applyAvatarFilters(avatars, { searchQuery, filterBy });
    return sortAvatars(filtered, sortBy);
  }, [avatars, searchQuery, filterBy, sortBy]);

  const avatarGroups = useMemo(
    () => groupAvatars(filteredAvatars, groupBy),
    [filteredAvatars, groupBy]
  );

  const hasSearch = Boolean(searchQuery.trim()) || filterBy !== 'all';
  const showCreateCard = activeSection === 'private' && onCreateAvatar && !hasSearch;

  const openAvatarDetails = (avatar) => {
    setSelectedAvatar(avatar);
  };

  const closeDetails = () => {
    setSelectedAvatar(null);
  };

  const handleCreateVideo = () => {
    if (onCreate) onCreate();
    closeDetails();
  };

  const loadMoreAvatars = () => {
    if (!hasMore || !nextToken || loadingMore) return;
    fetchAvatars({ ownership: activeSection, token: nextToken, append: true });
  };

  const renderAvatarCollection = (collection) => (
    <div
      className={`items-container videos-export-items avatars-library-items ${
        viewMode === 'grid' ? 'tile-view' : 'list-view export-list-view'
      }`}
    >
      {viewMode === 'list' ? (
        <div className="list-header export-list-header">
          <div className="col" />
          <div className="col">Name</div>
          <div className="col">Role</div>
          <div className="col">Gender</div>
          <div className="col">Style</div>
          <div className="col">Looks</div>
          <div className="col" />
        </div>
      ) : null}

      {showCreateCard && viewMode === 'grid' ? (
        <AvatarCreationCard onClick={onCreateAvatar} />
      ) : null}

      {collection.map((avatar) =>
        viewMode === 'grid' ? (
          <AvatarLibraryCard key={avatar.id} avatar={avatar} onOpen={openAvatarDetails} />
        ) : (
          <AvatarLibraryRow key={avatar.id} avatar={avatar} onOpen={openAvatarDetails} />
        )
      )}
    </div>
  );

  if (selectedAvatar) {
    return (
      <div className="avatars-persona-shell">
        <AvatarPersona
          selectedAvatar={selectedAvatar}
          closeDetails={closeDetails}
          onCreate={handleCreateVideo}
          isPrivate={activeSection === 'private'}
          onCreateLooks={
            activeSection === 'private' && onCreateLooks
              ? (ctx) => {
                  onCreateLooks(ctx);
                  closeDetails();
                }
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="videos-page avatars-page">
      <div className="videos-shell">
        <header className="videos-page-header">
          <div className="videos-title-section">
            <h1 className="videos-page-title">Avatars</h1>
            <p className="videos-page-subtitle">{getAvatarSectionSubtitle(activeSection)}</p>
          </div>
          <div className="videos-actions">
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
                type="button"
              >
                <MdGridView />
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
                type="button"
              >
                <MdViewList />
              </button>
            </div>
            {activeSection === 'private' && onCreateAvatar ? (
              <button
                type="button"
                className="btn-primary videos-create-btn"
                onClick={onCreateAvatar}
              >
                <MdAdd size={18} />
                Create Avatar
              </button>
            ) : onCreate ? (
              <button type="button" className="btn-primary videos-create-btn" onClick={onCreate}>
                <MdAdd size={18} />
                Create Video
              </button>
            ) : null}
          </div>
        </header>

        <div className="videos-tab-switch" role="tablist" aria-label="Avatar sections">
          {AVATAR_SECTION_TABS.map((tab) => {
            const Icon = TAB_ICONS[tab.id];
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`videos-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveSection(tab.id)}
              >
                <span className="videos-tab-icon" aria-hidden>
                  <Icon size={18} />
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <VideosToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterBy={filterBy}
          onFilterChange={setFilterBy}
          sortBy={sortBy}
          onSortChange={setSortBy}
          groupBy={groupBy}
          onGroupChange={setGroupBy}
          filterOptions={AVATAR_FILTER_OPTIONS}
          sortOptions={AVATAR_SORT_OPTIONS}
          groupOptions={AVATAR_GROUP_OPTIONS}
          searchPlaceholder="Search avatars by name or role…"
          searchAriaLabel="Search avatars"
        />

        <main className="videos-main">
          {loading ? (
            <AvatarsSkeleton />
          ) : filteredAvatars.length === 0 && !showCreateCard ? (
            <div className="videos-empty-state">
              <div className="videos-empty-state__card">
                <span className="videos-empty-state__icon-wrap" aria-hidden>
                  <MdFace size={28} />
                </span>
                <p className="videos-empty-state__eyebrow">
                  {hasSearch ? 'No results' : 'Nothing here yet'}
                </p>
                <h3 className="videos-empty-state__title">
                  {getAvatarEmptyTitle(activeSection, hasSearch)}
                </h3>
                <p className="videos-empty-state__description">
                  {getAvatarEmptyHint(activeSection, hasSearch)}
                </p>
                {!hasSearch && activeSection === 'private' && onCreateAvatar ? (
                  <button
                    type="button"
                    className="videos-empty-state__cta"
                    onClick={onCreateAvatar}
                  >
                    <MdAdd size={16} aria-hidden />
                    Create Avatar
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="videos-groups">
              {avatarGroups.map((group) => (
                <section key={group.key} className="videos-group">
                  {group.label ? (
                    <h3 className="videos-group__heading">{group.label}</h3>
                  ) : null}
                  {renderAvatarCollection(group.avatars)}
                </section>
              ))}
            </div>
          )}

          {hasMore && !loading ? (
            <div className="videos-load-more">
              <button
                type="button"
                className="btn-primary"
                disabled={loadingMore}
                onClick={loadMoreAvatars}
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default Avatars;
