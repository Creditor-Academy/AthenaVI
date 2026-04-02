import React, { useState } from 'react';
import { MdAdd, MdMic, MdSearch, MdStar, MdAutoAwesome, MdCloudUpload } from 'react-icons/md';
import { predefinedAvatars } from '../../../../constants/editorData';

const EditorSidebarAvatar = ({ activeScene, activeSceneId, scenes, autoCreateScene, updateScene, setShowTemplateModal }) => {
  const [activeTab, setActiveTab] = useState('studio');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAvatars = predefinedAvatars.filter(av => 
    av.name.toLowerCase().includes(searchQuery.toLowerCase())
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
        gap: '24px',
        flexShrink: 0
      }}>
        {['studio', 'photo', 'mine'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
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
            {tab === 'mine' ? 'My Avatars' : `${tab} Avatars`}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }} className="premium-scrollbar">
        {activeTab === 'mine' ? (
           <div style={{
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center',
             justifyContent: 'center',
             padding: '40px 20px',
             textAlign: 'center',
             background: 'var(--bg-card)',
             borderRadius: '12px',
             border: '1px dashed var(--border-color)'
           }}>
             <div style={{
               width: '48px',
               height: '48px',
               borderRadius: '50%',
               background: 'rgba(26, 115, 232, 0.1)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               marginBottom: '16px'
             }}>
                <MdCloudUpload size={24} style={{ color: 'var(--primary)' }} />
             </div>
             <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 8px 0' }}>Create Custom Avatar</h4>
             <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: '1.5' }}>
               Upload a 2-minute video of yourself to create a custom AI presenter.
             </p>
             <button className="btn-primary" style={{ fontSize: '12px', padding: '8px 16px' }}>
               Get Started
             </button>
           </div>
        ) : (
          <>
            <div className="elements-chips-scroll" style={{ marginBottom: '20px', paddingBottom: '4px' }}>
              <button className="elements-chip" style={{ background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' }}>All</button>
              <button className="elements-chip">Business</button>
              <button className="elements-chip">Casual</button>
              <button className="elements-chip">News</button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}>
              {filteredAvatars.map((avatar) => {
                const isActive = activeScene?.avatarType === avatar.id;
                
                return (
                  <div
                    key={avatar.id}
                    onClick={() => {
                        if (!activeSceneId || scenes.length === 0) {
                            if (autoCreateScene) {
                                const { newScene } = autoCreateScene();
                                updateScene(newScene.id, {
                                    avatar: avatar.image,
                                    avatarType: avatar.id
                                });
                            } else {
                                alert('Please add a scene or template first!');
                                if (setShowTemplateModal) setShowTemplateModal(true);
                            }
                            return;
                        }
                        updateScene(activeSceneId, {
                            avatar: avatar.image,
                            avatarType: avatar.id
                        });
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
                        <img 
                          src={avatar.image} 
                          alt={avatar.name} 
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
                          }}>{avatar.name}</span>
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
            
            {filteredAvatars.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No avatars found matching "{searchQuery}"</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EditorSidebarAvatar;
