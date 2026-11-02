import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdCheckCircle,
  MdClose,
  MdCloudQueue,
  MdCreditCard,
  MdDashboard,
  MdEdit,
  MdErrorOutline,
  MdFolderShared,
  MdGeneratingTokens,
  MdHistory,
  MdGroupAdd,
  MdGroups,
  MdNotifications,
  MdOutlineBolt,
  MdRemoveCircleOutline,
  MdReplay,
  MdAddCircleOutline,
  MdCallMade,
  MdCallReceived,
  MdTune,
  MdPerson,
  MdSettings,
  MdVideoLibrary,
  MdWorkspaces,
} from 'react-icons/md'
import { useAuth } from '../../contexts/AuthContext'
import userService from '../../services/userService.js'
import creditsService from '../../services/creditsService.js'
import storageService from '../../services/storageService.js'
import videoLibraryService from '../../services/videoLibraryService.js'
import workspaceService from '../../services/workspaceService.js'
import { formatBytes } from '../../utils/formatSize.js'
import { isTeamWorkspaceType } from '../../utils/creditTransactions.js'
import { formatCredits, formatCreditsCompact } from '../../utils/formatCredits.js'
import LoadingDots from '../../components/ui/LoadingDots/LoadingDots.jsx'
import ProfileHero from './components/ProfileHero'
import ProfileSidePanel from './components/ProfileSidePanel'
import ProfileDetails from './components/ProfileDetails'
import { formatDate, formatRelativeTime } from './profileUtils'
import { buildProfileActivity } from './profileActivity.js'
import './Profile.css'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 2 * 1024 * 1024

// Icon + tone per activity kind (see profileActivity.js for the wording).
const ACTIVITY_LOOK = {
  workspace_created: { Icon: MdWorkspaces, tone: 'accent' },
  workspace_joined: { Icon: MdGroupAdd, tone: 'accent' },
  allocation: { Icon: MdCallMade, tone: 'info' },
  deallocation: { Icon: MdCallReceived, tone: 'info' },
  usage: { Icon: MdVideoLibrary, tone: 'neutral' },
  platform_grant: { Icon: MdAddCircleOutline, tone: 'success' },
  purchase: { Icon: MdAddCircleOutline, tone: 'success' },
  refund: { Icon: MdReplay, tone: 'success' },
  platform_revoke: { Icon: MdRemoveCircleOutline, tone: 'warning' },
  admin_adjustment: { Icon: MdTune, tone: 'neutral' },
}
const DEFAULT_ACTIVITY_LOOK = { Icon: MdGeneratingTokens, tone: 'neutral' }

const scrollToSection = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', target: 'prf-overview', icon: MdDashboard },
  { id: 'credits', label: 'Credits', target: 'prf-credits', icon: MdGeneratingTokens },
  { id: 'details', label: 'Personal details', target: 'prf-details', icon: MdPerson },
  { id: 'activity', label: 'Recent activity', target: 'prf-activity', icon: MdHistory },
]

const Profile = ({ onNavigate }) => {
  const { isAuthenticated, updateUser } = useAuth()
  const [profile, setProfile] = useState({ name: '', email: '', phoneNumber: '', profileImage: null, createdAt: null })
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageBusy, setImageBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [personalCredits, setPersonalCredits] = useState(null)
  const [storageQuota, setStorageQuota] = useState(null)
  const [videosExported, setVideosExported] = useState(null)
  const [workspaceCount, setWorkspaceCount] = useState(null)
  // Team workspace pools, as in the credits pop-up; null until loaded.
  const [workspaceBalances, setWorkspaceBalances] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [editTick, setEditTick] = useState(0)

  // Loaded after the page renders so one slow workspace never blocks the profile.
  // A workspace whose balance can't be read is left out rather than failing all.
  const loadWorkspaceBalances = useCallback(async (workspaceList) => {
    const teams = workspaceList.filter((ws) => isTeamWorkspaceType(ws.type))
    if (!teams.length) {
      setWorkspaceBalances([])
      return
    }
    const balances = await Promise.all(
      teams.map((ws) =>
        creditsService
          .getWorkspaceBalance(ws.id)
          .then((b) => ({ id: ws.id, name: ws.name || 'Workspace', credits: Number(b.workspaceCredits ?? 0) }))
          .catch(() => null)
      )
    )
    setWorkspaceBalances(balances.filter(Boolean).sort((a, b) => a.name.localeCompare(b.name)))
  }, [])

  const loadUserProfile = useCallback(async () => {
    setPageLoading(true)
    setError('')
    try {
      const [userData, creditsResult, storageResult, videosResult, historyResult, workspaceList] =
        await Promise.all([
          userService.getUserProfile(),
          creditsService.getPersonalBalance().catch(() => null),
          storageService.getPersonalQuota().catch(() => null),
          videoLibraryService.listUserVideos({ take: 1, skip: 0, status: 'completed' }).catch(() => null),
          creditsService.getPersonalHistory({ page: 1, limit: 40 }).catch(() => null),
          workspaceService.listWorkspaces().catch(() => []),
        ])

      const nextProfile = {
        name: userData?.name || '',
        email: userData?.email || '',
        phoneNumber: userData?.phoneNumber || '',
        profileImage: userData?.profileImage || null,
        createdAt: userData?.createdAt || null,
      }
      setProfile(nextProfile)
      updateUser({
        name: nextProfile.name,
        email: nextProfile.email,
        phoneNumber: nextProfile.phoneNumber,
        profileImage: nextProfile.profileImage,
      })

      if (creditsResult) setPersonalCredits(creditsResult.personalCredits)
      if (storageResult) setStorageQuota(storageResult)
      if (videosResult) {
        setVideosExported(videosResult.pagination?.total ?? videosResult.videos?.length ?? 0)
      }
      setRecentActivity(
        buildProfileActivity({
          transactions: historyResult?.transactions || [],
          workspaces: Array.isArray(workspaceList) ? workspaceList : [],
          limit: 8,
        })
      )
      setWorkspaceCount(Array.isArray(workspaceList) ? workspaceList.length : 0)
      loadWorkspaceBalances(Array.isArray(workspaceList) ? workspaceList : [])
    } catch (err) {
      console.error('Error loading profile:', err)
      setError(err.message || 'Could not load your profile')
    } finally {
      setPageLoading(false)
    }
  }, [updateUser, loadWorkspaceBalances])

  useEffect(() => {
    if (isAuthenticated) {
      loadUserProfile()
    } else {
      setPageLoading(false)
      setError('User not authenticated')
    }
    // Load once per sign-in; updateUser identity changes must not refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  useEffect(() => {
    if (!success) return undefined
    const t = setTimeout(() => setSuccess(''), 3000)
    return () => clearTimeout(t)
  }, [success])

  const applyProfile = (patch) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch }
      updateUser({
        name: next.name,
        email: next.email,
        phoneNumber: next.phoneNumber,
        profileImage: next.profileImage,
      })
      return next
    })
  }

  const handleSaveField = async (field, value) => {
    setSaving(true)
    setError('')
    try {
      await userService.updateUserProfile({ ...profile, [field]: value })
      applyProfile({ [field]: value })
      setSuccess(field === 'name' ? 'Name updated' : 'Phone number updated')
      return true
    } catch (err) {
      setError(err.message || 'Could not save your changes')
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleUploadImage = async (file) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Please select a JPEG, PNG, or WebP image file')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image size should be less than 2MB')
      return
    }
    setImageBusy(true)
    setError('')
    try {
      const result = await userService.uploadProfileImage(file)
      const url = result.data?.profile?.profileImage || result.profileImage
      if (!url) throw new Error('Profile image uploaded but URL not found in response')
      applyProfile({ profileImage: url })
      setSuccess('Profile photo updated')
    } catch (err) {
      setError(err.message || 'Could not upload your photo')
    } finally {
      setImageBusy(false)
    }
  }

  const handleRemoveImage = async () => {
    setImageBusy(true)
    setError('')
    try {
      await userService.deleteProfileImage()
      applyProfile({ profileImage: null })
      setSuccess('Profile photo removed')
    } catch (err) {
      setError(err.message || 'Failed to remove profile image')
    } finally {
      setImageBusy(false)
    }
  }

  const planLabel = storageQuota?.tier?.label || 'Free'
  const storagePercent = Math.min(100, Math.round(Number(storageQuota?.percentUsed) || 0))
  const storageUsedLabel = storageQuota
    ? `${formatBytes(storageQuota.usedBytes)} of ${formatBytes(storageQuota.limitBytes)}`
    : '—'
  const teamCredits = (workspaceBalances || []).reduce((sum, ws) => sum + ws.credits, 0)
  const hasTeamPools = Boolean(workspaceBalances?.length)
  const creditsReady = personalCredits != null && workspaceBalances != null
  const totalCredits = Number(personalCredits ?? 0) + teamCredits
  const creditsBreakdown = hasTeamPools
    ? `${formatCredits(personalCredits)} personal · ${formatCredits(teamCredits)} across ${workspaceBalances.length} workspace${workspaceBalances.length === 1 ? '' : 's'}`
    : 'Personal pool · voice clones, avatars, private workspace'
  const go = (section) => (onNavigate ? () => onNavigate(section) : undefined)

  const heroStats = [
    {
      id: 'credits',
      icon: MdGeneratingTokens,
      value: creditsReady ? formatCreditsCompact(totalCredits) : '—',
      label: 'Credits',
      hint: creditsReady ? `${formatCredits(totalCredits)} total — ${creditsBreakdown}` : 'Credits',
      onClick: () => scrollToSection('prf-credits'),
    },
    {
      id: 'videos',
      icon: MdVideoLibrary,
      value: videosExported == null ? '—' : Number(videosExported).toLocaleString(),
      label: 'Videos',
      hint: 'Completed exports',
      onClick: go('my-work'),
    },
    {
      id: 'workspaces',
      icon: MdFolderShared,
      value: workspaceCount == null ? '—' : String(workspaceCount),
      label: 'Workspaces',
      hint: 'Your workspaces',
      onClick: go('workspace'),
    },
    {
      id: 'storage',
      icon: MdCloudQueue,
      value: storageQuota ? `${storagePercent}%` : '—',
      label: 'Storage',
      hint: storageUsedLabel,
      onClick: () => scrollToSection('prf-overview'),
    },
  ]

  const quickActions = useMemo(() => {
    const list = [
      {
        id: 'edit',
        label: 'Edit details',
        icon: MdEdit,
        onClick: () => {
          scrollToSection('prf-details')
          setEditTick((t) => t + 1)
        },
      },
    ]
    if (onNavigate) {
      list.push(
        { id: 'billing', label: 'Billing & credits', icon: MdCreditCard, onClick: () => onNavigate('credits') },
        { id: 'workspaces', label: 'Workspaces', icon: MdFolderShared, onClick: () => onNavigate('workspace') },
        { id: 'settings', label: 'Account settings', icon: MdSettings, onClick: () => onNavigate('settings') }
      )
    }
    return list
  }, [onNavigate])

  const aboutRows = [
    ['Member since', formatDate(profile.createdAt)],
    ['Email', profile.email || '—'],
    ['Phone', profile.phoneNumber || 'Not added'],
    ['Plan', planLabel],
    ['Workspaces', workspaceCount == null ? '—' : String(workspaceCount)],
  ]

  return (
    <motion.div
      className="prf-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="prf-workspace">
        <ProfileSidePanel items={NAV_ITEMS} actions={quickActions} />

        <div className="prf-main">
          <ProfileHero
            loading={pageLoading}
            profile={profile}
            planLabel={planLabel}
            stats={heroStats}
            imageBusy={imageBusy}
            onUploadImage={handleUploadImage}
            onRemoveImage={handleRemoveImage}
          />

          <section id="prf-overview" className="prf-overview">
            <article className="prf-block">
              <header className="prf-block-head">
                <h2>About</h2>
              </header>
              {pageLoading ? (
                <div className="prf-skel-stack">
                  {[70, 55, 80, 45, 60].map((w) => (
                    <div key={w} className="prf-skel prf-skel-line" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : (
                <dl className="prf-about">
                  {aboutRows.map(([label, value]) => (
                    <div key={label} className="prf-about-row">
                      <dt>{label}</dt>
                      <dd title={value}>{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </article>

            <article className="prf-block">
              <header className="prf-block-head">
                <h2>Usage</h2>
                <p>Storage and exports on your personal account.</p>
              </header>
              <div className="prf-progress" aria-label={`${storagePercent}% of storage used`}>
                <div className="prf-progress-meta">
                  <span>Storage used</span>
                  <span>{pageLoading ? <LoadingDots size="sm" /> : storageUsedLabel}</span>
                </div>
                <div className="prf-progress-track">
                  <div
                    className={`prf-progress-fill${storagePercent >= 90 ? ' is-high' : ''}`}
                    style={{ width: pageLoading ? '0%' : `${storagePercent}%` }}
                  />
                </div>
              </div>
              <div className="prf-usage-grid">
                <div className="prf-usage-stat">
                  <span>Videos exported</span>
                  <strong>{pageLoading ? <LoadingDots size="sm" /> : videosExported == null ? '—' : Number(videosExported).toLocaleString()}</strong>
                </div>
                <div className="prf-usage-stat">
                  <span>Plan</span>
                  <strong>{pageLoading ? <LoadingDots size="sm" /> : planLabel}</strong>
                </div>
              </div>
            </article>
          </section>

          <section id="prf-credits" className="prf-block prf-section">
            <header className="prf-block-head prf-block-head--row">
              <div>
                <h2>Credits</h2>
                <p>Personal credits cover voices, avatars and your private workspace. Team pools cover workspace videos and exports.</p>
              </div>
              {onNavigate ? (
                <button type="button" className="prf-link-btn" onClick={() => onNavigate('credits')}>
                  Manage billing
                </button>
              ) : null}
            </header>

            {!creditsReady ? (
              <div className="prf-skel-stack">
                <div className="prf-skel prf-skel-box" style={{ height: 84 }} />
                <div className="prf-skel prf-skel-box" />
              </div>
            ) : (
              <>
                <div className="prf-credits-total">
                  <span className="prf-credits-total-label">Total available</span>
                  <strong title={formatCredits(totalCredits)}>{formatCredits(totalCredits)}</strong>
                  <span className="prf-credits-total-meta">{creditsBreakdown}</span>
                </div>

                {/* With no team pools the total *is* the personal pool — no duplicate card. */}
                {hasTeamPools ? (
                  <div className="prf-pools">
                    <div className="prf-pool is-personal">
                      <div className="prf-pool-head">
                        <span className="prf-pool-ico" aria-hidden>
                          <MdPerson />
                        </span>
                        <span>Personal pool</span>
                      </div>
                      <strong className="prf-pool-value" title={formatCredits(personalCredits)}>
                        {formatCredits(personalCredits)}
                      </strong>
                      <span className="prf-pool-hint">Voice clones, avatars, private workspace</span>
                    </div>

                    <div className="prf-pool">
                      <div className="prf-pool-head">
                        <span className="prf-pool-ico" aria-hidden>
                          <MdGroups />
                        </span>
                        <span>Team workspaces</span>
                        <em title={formatCredits(teamCredits)}>{formatCreditsCompact(teamCredits)} total</em>
                      </div>
                      <ul className="prf-pool-list">
                        {workspaceBalances.map((ws) => (
                          <li key={ws.id}>
                            <MdOutlineBolt aria-hidden />
                            <span className="prf-pool-name" title={ws.name}>{ws.name}</span>
                            <strong>{formatCredits(ws.credits)}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </section>

          <section id="prf-details" className="prf-block prf-section">
            <header className="prf-block-head">
              <h2>Personal details</h2>
              <p>Keep your name and phone number up to date.</p>
            </header>
            <ProfileDetails
              profile={profile}
              saving={saving}
              editTick={editTick}
              onSave={handleSaveField}
              onError={setError}
            />
          </section>

          <section id="prf-activity" className="prf-block prf-section">
            <header className="prf-block-head">
              <h2>Recent activity</h2>
              <p>Workspaces you created or joined, and every credit movement on your account.</p>
            </header>
            {pageLoading ? (
              <div className="prf-skel-stack">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="prf-skel prf-skel-box" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="prf-empty">
                <MdNotifications aria-hidden />
                <p>Nothing here yet. Creating a workspace or using credits will show up here.</p>
              </div>
            ) : (
              <ul className="prf-activity">
                {recentActivity.map((item) => {
                  const look = ACTIVITY_LOOK[item.kind] || DEFAULT_ACTIVITY_LOOK
                  const ItemIcon = look.Icon
                  return (
                    <li key={item.id} className="prf-activity-item">
                      <span className={`prf-activity-ico is-${look.tone}`} aria-hidden>
                        <ItemIcon />
                      </span>
                      <div className="prf-activity-body">
                        <strong className="prf-activity-action">{item.action}</strong>
                        <p className="prf-activity-detail" title={item.detail}>{item.detail}</p>
                        {item.meta ? <p className="prf-activity-meta">{item.meta}</p> : null}
                      </div>
                      {/* Amount over time in one right-aligned column so every row's edge lines up. */}
                      <div className="prf-activity-side">
                        {item.amount != null && item.amount !== 0 ? (
                          <span className={`prf-activity-amount ${item.amount > 0 ? 'is-in' : 'is-out'}`}>
                            {item.amount > 0 ? '+' : '−'}
                            {formatCredits(Math.abs(item.amount))}
                          </span>
                        ) : null}
                        <time dateTime={item.at} title={new Date(item.at).toLocaleString()}>
                          {formatRelativeTime(item.at)}
                        </time>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            key="ok"
            className="prf-toast is-success"
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <MdCheckCircle aria-hidden />
            <span>{success}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            key="err"
            className="prf-toast is-error"
            role="alert"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <MdErrorOutline aria-hidden />
            <span>{error}</span>
            <button type="button" className="prf-toast-close" onClick={() => setError('')} aria-label="Dismiss">
              <MdClose />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Profile
