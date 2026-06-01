import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MdAdd, MdMic, MdSearch, MdStar, MdAutoAwesome, MdCloudUpload, MdChevronLeft } from 'react-icons/md';
import { Loader2 } from 'lucide-react';
import heygenService from '../../../../services/heygenService';
import {
  extractHeygenList,
  filterAvatarIvLooks,
  formatAvatarTypeLabel,
  mapAvatarGroup,
  mapAvatarLook,
} from '../../../../utils/heygenAvatars';

const EditorSidebarAvatar = ({ activeScene, activeSceneId, scenes, autoCreateScene, updateScene, setShowTemplateModal, addLayer }) => {
  const [activeTab, setActiveTab] = useState('studio');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);
  const [pickerView, setPickerView] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [looks, setLooks] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingLooks, setLoadingLooks] = useState(false);
  const [looksError, setLooksError] = useState('');

  const ownershipForTab = activeTab === 'mine' ? 'private' : activeTab === 'team' ? 'workspace' : 'public';

  useEffect(() => {
    setPickerView('groups');
    setSelectedGroup(null);
    setLooks([]);
    setLooksError('');

    const fetchGroups = async () => {
      setLoading(true);
      try {
        const responseData = await heygenService.getAvatarGroups({
          ownership: ownershipForTab,
          limit: 20,
        });
        const groupList = extractHeygenList(responseData, ['avatar_groups', 'groups', 'avatars']);
        setGroups(groupList.map(mapAvatarGroup).filter((g) => g.id));
      } catch (err) {
        console.error('Failed to load avatar groups:', err);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [activeTab, ownershipForTab]);

  const fetchLooksForGroup = async (group) => {
    setLoadingLooks(true);
    setLooksError('');
    setSelectedGroup(group);
    setPickerView('looks');
    try {
      const responseData = await heygenService.getAvatarLooks({
        group_id: group.id,
        limit: 20,
      });
      const lookList = extractHeygenList(responseData, ['avatar_looks', 'looks', 'avatars']);
      const compatible = filterAvatarIvLooks(lookList)
        .map((look) => mapAvatarLook(look, group.name))
        .filter((look) => look.id);
      setLooks(compatible);
      if (compatible.length === 0) {
        setLooksError('No Avatar IV looks for this character.');
      }
    } catch (err) {
      console.error('Failed to load looks:', err);
      setLooks([]);
      setLooksError('Could not load looks.');
    } finally {
      setLoadingLooks(false);
    }
  };

  const applyLookToScene = useCallback(
    (look) => {
      const assign = (sceneId, clips = []) => {
        const avatarClipIndex = clips.findIndex((c) => c.role === 'avatar' || c.type === 'avatar');
        let updatedClips = [...clips];
        if (avatarClipIndex !== -1) {
          updatedClips[avatarClipIndex] = {
            ...updatedClips[avatarClipIndex],
            src: look.image,
            role: 'avatar',
            type: 'avatar',
          };
        } else if (addLayer) {
          addLayer('avatar', look.image);
        }

        updateScene(sceneId, {
          avatar: look.image,
          avatarType: look.id,
          avatarLookId: look.id,
          avatarKind: look.avatarType,
          avatarName: look.name,
          avatarGroupId: selectedGroup?.id,
          clips: updatedClips,
        });
      };

      if (!activeSceneId || scenes.length === 0) {
        if (autoCreateScene) {
          const { newScene } = autoCreateScene();
          assign(newScene.id, newScene.clips || []);
        } else {
          alert('Please add a scene or template first!');
          if (setShowTemplateModal) setShowTemplateModal(true);
        }
        return;
      }

      assign(activeSceneId, activeScene?.clips || []);
    },
    [
      activeScene,
      activeSceneId,
      scenes.length,
      selectedGroup,
      autoCreateScene,
      updateScene,
      addLayer,
      setShowTemplateModal,
    ]
  );


  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Preparing asset upload...');

    try {
      const type = file.type.startsWith('video/') ? 'digital_twin' : 'photo';
      
      setUploadStatus(`Creating ${type.replace('_', ' ')}...`);
      
      const payload = new FormData();
      payload.append('type', type);
      payload.append('name', file.name.split('.')[0] || 'Custom Persona');
      payload.append('file', file);

      const response = await heygenService.createAvatar(payload);
      
      const groupId = response?.avatar_group_id || response?.data?.avatar_group_id || response?.id;
      
      if (groupId) {
        setUploadStatus('Verifying ownership...');
        try {
          const consentRes = await heygenService.getAvatarConsent(groupId, window.location.href);
          if (consentRes && (consentRes.consent_url || consentRes.url)) {
            const url = consentRes.consent_url || consentRes.url;
            setUploadStatus('Redirecting to consent portal...');
            setTimeout(() => {
              window.open(url, '_blank');
              setIsUploading(false);
              setUploadStatus('');
              // Optionally refresh list
            }, 1500);
            return;
          }
        } catch (consentErr) {
          console.warn('Consent fetch failed or not required', consentErr);
        }
      }

      setUploadStatus('Persona created successfully!');
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus('');
      }, 3000);
      
    } catch (error) {
      console.error('Avatar creation failed:', error);
      setUploadStatus(`Error: ${error.message || 'Creation failed'}`);
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus('');
      }, 4000);
    }
  };

  const displayItems = pickerView === 'groups' ? groups : looks;
  const filteredItems = displayItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tool-panel-content elements-ui" style={{ padding: '0px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* Premium Header area with Gradient */}
      <div style={{
        padding: '24px 20px 16px',
        background: 'linear-gradient(180deg, rgba(26, 115, 232, 0.05) 0%, rgba(0,0,0,0) 100%)',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
               AI Presenters <MdAutoAwesome style={{ color: '#a855f7' }} size={16}/>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>High-fidelity virtual avatars</p>
          </div>
        </div>

        {/* Sophisticated Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '8px 12px',
          gap: '8px',
          transition: 'all 0.2s ease',
        }}>
          <MdSearch size={18} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search characters, styles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '13px'
            }}
          />
          <MdMic size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        padding: '0 20px',
        borderBottom: '1px solid var(--border-color)',
        gap: '20px',
        flexShrink: 0
      }}>
        {['studio', 'team', 'mine'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSearchQuery('');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '12px 0',
              fontSize: '13px',
              fontWeight: activeTab === tab ? '600' : '500',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease'
            }}
          >
            {tab === 'mine' ? 'My Avatars' : tab === 'team' ? 'Team Shared' : 'Studio'}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }} className="premium-scrollbar">
        {activeTab === 'mine' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 20px',
            textAlign: 'center',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px dashed var(--border-color)',
            marginBottom: '20px'
          }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="video/*,image/*" 
              onChange={handleFileChange} 
            />
            
            {isUploading ? (
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <Loader2 size={32} color="var(--primary)" style={{ margin: '0 auto 12px', animation: 'spin 2s linear infinite' }} />
                <p style={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: '500' }}>{uploadStatus}</p>
                <style>
                  {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
                </style>
              </div>
            ) : (
              <>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(26, 115, 232, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                   <MdCloudUpload size={20} style={{ color: 'var(--primary)' }} />
                </div>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 4px 0' }}>Create Custom Avatar</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                  Upload a 2-minute video of yourself to create a custom AI presenter.
                </p>
                <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={handleUploadClick}>
                  Upload Video
                </button>
              </>
            )}
          </div>
        )}

        <>
          {pickerView === 'looks' && selectedGroup && (
            <button
              type="button"
              onClick={() => {
                setPickerView('groups');
                setSelectedGroup(null);
                setLooks([]);
                setLooksError('');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '12px',
                padding: 0,
                border: 'none',
                background: 'none',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--primary)',
                cursor: 'pointer',
              }}
            >
              <MdChevronLeft size={16} /> {selectedGroup.name}
            </button>
          )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}>
              {(loading || loadingLooks) ? (
                <div style={{ gridColumn: '1 / -1', padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {pickerView === 'groups' ? 'Loading characters...' : 'Loading looks...'}
                </div>
              ) : looksError && pickerView === 'looks' ? (
                <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', color: '#ef4444', fontSize: '12px' }}>
                  {looksError}
                </div>
              ) : filteredItems.map((item) => {
                const isActive = pickerView === 'looks' && activeScene?.avatarType === item.id;
                const typeLabel = pickerView === 'looks' ? formatAvatarTypeLabel(item.avatarType) : '';
                
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (pickerView === 'groups') {
                        fetchLooksForGroup(item);
                        return;
                      }
                      applyLookToScene(item);
                    }}
                    style={{
                      position: 'relative',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 4px 12px rgba(26, 115, 232, 0.2)' : 'none',
                      transform: isActive ? 'translateY(-2px)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'var(--text-muted)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.transform = 'none';
                      }
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '3/4',
                      overflow: 'hidden',
                      background: '#f8f9fa'
                    }}>
                        {typeLabel && (
                          <span style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            zIndex: 2,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '9px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: 'rgba(0,0,0,0.65)',
                            color: '#fff',
                          }}>
                            {typeLabel}
                          </span>
                        )}
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                        />
                        {/* Premium Gradient Overlay */}
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '60%',
                          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          padding: '12px'
                        }}>
                          <span style={{ 
                            color: 'white', 
                            fontSize: '13px', 
                            fontWeight: '600',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                          }}>{item.name}</span>
                          <span style={{ 
                            color: 'rgba(255,255,255,0.7)', 
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '2px'
                          }}>
                             <MdStar size={12} color="#fbbf24" /> PRO
                          </span>
                        </div>

                        {isActive && (
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'var(--primary)',
                            color: 'white',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                          }}>
                            <span style={{fontSize: '12px', fontWeight: 'bold'}}>✓</span>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredItems.length === 0 && !loading && !loadingLooks && !looksError && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>{activeTab === 'mine' ? "You haven't created any custom avatars yet." : `No matches for "${searchQuery}"`}</p>
              </div>
            )}
        </>
      </div>
    </div>
  );
};

export default EditorSidebarAvatar;
