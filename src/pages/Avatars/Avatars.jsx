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
import { AvatarConsentModal } from '../../components/ui/AvatarConsentStep/AvatarConsentStep';
import ConfirmDialog from '../../components/ui/ConfirmDialog/ConfirmDialog.jsx';
import { getConsentUrlFromResponse, buildAvatarPresenterSeed, canUseAvatarInVideo, fetchMappedGroupLooks, mapAvatarLook, mapLookTile } from '../../utils/heygenAvatars';
import { getAvatarDeleteMessage, isOwnedPrivateAvatar, resolvePairedVoiceId } from '../../utils/heygenDelete';
import { getSanitizedErrorMessage } from '../../utils/userFacingMessage';
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
    consentStatus: av.consent_status ?? av.consentStatus ?? null,
    trainingStatus: av.status ?? av.training_status ?? null,
    defaultVoiceId: av.default_voice_id ?? av.defaultVoiceId ?? null,
    raw: av,
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
  const [consentBanner, setConsentBanner] = useState('');
  const [consentBannerTone, setConsentBannerTone] = useState('info');
  const [consentModal, setConsentModal] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const fetchRequestRef = useRef(0);
  const bannerTimeoutRef = useRef(null);

  const showBanner = useCallback((message, tone = 'info') => {
    setConsentBanner(message);
    setConsentBannerTone(tone);
    if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
    bannerTimeoutRef.current = setTimeout(() => setConsentBanner(''), 4200);
  }, []);

  const openConfirmDialog = useCallback((message, onConfirm, options = {}) => {
    setConfirmDialog({ message, onConfirm, ...options });
  }, []);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const consentDone = params.get('consent');
    const groupId = params.get('groupId');
    if (consentDone !== 'done' || !groupId) return;

    showBanner("Thanks — we're verifying your consent. Refresh if your avatar doesn't update yet.");
    setActiveSection('private');
    fetchAvatars({ ownership: 'private' });

    const openConsent = async () => {
      try {
        const consentRes = await heygenService.getAvatarConsent(groupId);
        setConsentModal({
          groupId,
          avatarName: 'Your Digital Twin',
          consentUrl: getConsentUrlFromResponse(consentRes),
          consentStatus: consentRes?.avatar_group?.consent_status ?? 'pending',
        });
      } catch (error) {
        console.warn('Could not reopen consent flow after redirect', error);
        setConsentModal({
          groupId,
          avatarName: 'Your Digital Twin',
          consentUrl: '',
          consentStatus: 'pending',
        });
      }
    };

    openConsent();

    params.delete('consent');
    params.delete('groupId');
    const nextSearch = params.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`
    );
  }, [fetchAvatars, showBanner]);

  useEffect(
    () => () => {
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
    },
    []
  );

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

  const handleCreateVideo = (context = null) => {
    if (onCreate) onCreate(context || null);
    closeDetails();
  };

  const openUseInProject = async (avatar, event) => {
    event?.stopPropagation?.();
    if (!onCreate || !avatar?.id) return;

    let look = null;
    if (avatar.rawLooks?.length) {
      const mapped = avatar.rawLooks
        .map((raw) => mapAvatarLook(raw, avatar.name))
        .filter((l) => l.id);
      look = mapped.find((l) => canUseAvatarInVideo(avatar, mapLookTile(l, l.name, l.image))) || mapped[0];
    }

    if (!look) {
      try {
        const { mappedLooks } = await fetchMappedGroupLooks(heygenService, avatar, {
          ownership: activeSection === 'private' ? 'private' : activeSection === 'workspace' ? 'workspace' : 'public',
          limit: 20,
        });
        const ready = mappedLooks.find((l) => canUseAvatarInVideo(avatar, mapLookTile(l, l.name, l.image)));
        look = ready || mappedLooks[0];
      } catch {
        openAvatarDetails(avatar);
        return;
      }
    }

    if (!look || !canUseAvatarInVideo(avatar, mapLookTile(look, look.name, look.image))) {
      openAvatarDetails(avatar);
      return;
    }

    onCreate({ presenterSeed: buildAvatarPresenterSeed(avatar, look) });
  };

  const loadMoreAvatars = () => {
    if (!hasMore || !nextToken || loadingMore) return;
    fetchAvatars({ ownership: activeSection, token: nextToken, append: true });
  };

  const openConsentForAvatar = async (avatar, event) => {
    event?.stopPropagation?.();
    if (!avatar?.id) return;
    try {
      const consentRes = await heygenService.getAvatarConsent(avatar.id);
      setConsentModal({
        groupId: avatar.id,
        avatarName: avatar.name,
        consentUrl: getConsentUrlFromResponse(consentRes),
        consentStatus: consentRes?.avatar_group?.consent_status ?? avatar.consentStatus ?? 'pending',
      });
    } catch (error) {
      console.error('Failed to open consent flow:', error);
      setConsentModal({
        groupId: avatar.id,
        avatarName: avatar.name,
        consentUrl: '',
        consentStatus: avatar.consentStatus ?? 'pending',
      });
    }
  };

  const handleConsentRefresh = () => {
    fetchAvatars({ ownership: activeSection });
  };

  const handleConsentComplete = () => {
    showBanner('Consent approved — your Digital Twin will finish processing shortly.', 'success');
    fetchAvatars({ ownership: activeSection });
  };

  const canDeleteFromSection = isOwnedPrivateAvatar(activeSection);

  const performDeleteAvatar = async (avatar) => {
    if (!avatar?.id) return;
    try {
      let voiceId = resolvePairedVoiceId(avatar);
      if (!voiceId) {
        const group = await heygenService.getAvatarGroup(avatar.id);
        voiceId = resolvePairedVoiceId(group);
      }
      await heygenService.deleteAvatarGroup(avatar.id, voiceId ? { voiceId } : {});
      showBanner(`Deleted avatar "${avatar.name}".`, 'success');
      if (selectedAvatar?.id === avatar.id) closeDetails();
      fetchAvatars({ ownership: 'private' });
    } catch (error) {
      showBanner(getSanitizedErrorMessage(error, 'Failed to delete avatar.'), 'error');
    }
  };

  const requestDeleteAvatar = async (avatar, event) => {
    event?.stopPropagation?.();
    if (!canDeleteFromSection || !avatar?.id) return;
    openConfirmDialog(
      getAvatarDeleteMessage(avatar),
      async () => {
        await performDeleteAvatar(avatar);
      },
      { title: 'Delete avatar', confirmLabel: 'Delete avatar', variant: 'danger' }
    );
  };

  const deleteLook = async (avatar, look) => {
    if (!avatar?.id || !look?.id) return { cascadedGroupDelete: false };
    try {
      const voiceId = resolvePairedVoiceId(avatar);
      const res = await heygenService.deleteAvatarLook(look.id, voiceId ? { voiceId } : {});
      const cascadedGroupDelete = Boolean(res?.cascadedGroupDelete ?? res?.cascaded_group_delete);
      showBanner(
        cascadedGroupDelete
          ? `Deleted look "${look.name}" and removed avatar "${avatar.name}".`
          : `Deleted look "${look.name}".`,
        'success'
      );
      fetchAvatars({ ownership: 'private' });
      return { cascadedGroupDelete };
    } catch (error) {
      showBanner(getSanitizedErrorMessage(error, 'Failed to delete look.'), 'error');
      return { cascadedGroupDelete: false };
    }
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
          <AvatarLibraryCard
            key={avatar.id}
            avatar={avatar}
            onOpen={openAvatarDetails}
            onCompleteConsent={openConsentForAvatar}
            onUseInProject={activeSection !== 'public' ? openUseInProject : undefined}
            canDelete={canDeleteFromSection}
            onDelete={requestDeleteAvatar}
          />
        ) : (
          <AvatarLibraryRow
            key={avatar.id}
            avatar={avatar}
            onOpen={openAvatarDetails}
            onCompleteConsent={openConsentForAvatar}
            onUseInProject={activeSection !== 'public' ? openUseInProject : undefined}
            canDelete={canDeleteFromSection}
            onDelete={requestDeleteAvatar}
          />
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
          onCompleteConsent={openConsentForAvatar}
          onDeleteAvatar={performDeleteAvatar}
          onDeleteLook={deleteLook}
          onOpenConfirm={openConfirmDialog}
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
              <>
                <button
                  type="button"
                  className="btn-secondary videos-create-btn"
                  onClick={() => onCreate?.()}
                >
                  <MdAdd size={18} />
                  Create Video
                </button>
                <button
                  type="button"
                  className="btn-primary videos-create-btn"
                  onClick={onCreateAvatar}
                >
                  <MdAdd size={18} />
                  Create Avatar
                </button>
              </>
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
          {consentBanner ? (
            <div className={`avatars-consent-banner avatars-consent-banner--${consentBannerTone}`} role="status">
              {consentBanner}
            </div>
          ) : null}
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

      <AvatarConsentModal
        isOpen={Boolean(consentModal)}
        groupId={consentModal?.groupId}
        avatarName={consentModal?.avatarName}
        consentUrl={consentModal?.consentUrl}
        consentStatus={consentModal?.consentStatus}
        onClose={() => setConsentModal(null)}
        onComplete={handleConsentComplete}
        onRefresh={handleConsentRefresh}
      />
      <ConfirmDialog dialog={confirmDialog} onCancel={() => setConfirmDialog(null)} />
    </div>
  );
}

export default Avatars;
