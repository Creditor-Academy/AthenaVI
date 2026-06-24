import './skeleton.css';

const VoicesSkeleton = () => {
  return (
    <div className="videos-groups ps-page">
      <div className="items-container videos-export-items voices-library-items tile-view ps-grid ps-grid--4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="workspace-item-card ps-stack" style={{ gap: 0, border: 'none' }}>
            <div className="ps-block" style={{ height: 200, borderRadius: '12px 12px 0 0' }} />
            <div
              className="workspace-item-meta ps-stack"
              style={{
                padding: '12px 16px',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div className="ps-stack" style={{ gap: 4, flex: 1 }}>
                <div className="ps-block ps-block--line" style={{ height: 16, width: '60%' }} />
                <div className="ps-block ps-block--line" style={{ height: 12, width: '40%' }} />
              </div>
              <div className="ps-block" style={{ height: 32, width: 64, borderRadius: 8 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoicesSkeleton;
