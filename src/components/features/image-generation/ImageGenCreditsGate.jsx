import { useState } from 'react';
import { Wallet, ArrowRightLeft, ShoppingBag, X } from 'lucide-react';
import AllocateCreditsModal from '../workspace/workspace/AllocateCreditsModal.jsx';
import './ImageGenCreditsGate.css';

export default function ImageGenCreditsGate({
  open,
  workspaceId,
  workspaceName = 'Workspace',
  needed = 1,
  pool = 0,
  personal = 0,
  isTeam = false,
  onClose,
  onReady,
  onBuy,
}) {
  const [allocateOpen, setAllocateOpen] = useState(false);

  if (!open || !workspaceId) return null;

  return (
    <>
      {!allocateOpen && (
      <div className="igcg-backdrop" onMouseDown={onClose}>
        <div className="igcg-card" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-labelledby="igcg-title">
          <button type="button" className="igcg-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
          <div className="igcg-icon">
            <Wallet size={22} />
          </div>
          <h2 id="igcg-title">Not enough credits</h2>
          <p>
            This generation needs <strong>{needed.toLocaleString()}</strong> credits.
            {isTeam
              ? ' Add credits to this workspace here — no need to open Settings.'
              : ' This workspace uses your personal credits. Buy more, then generate again.'}
          </p>
          <div className="igcg-pills">
            {isTeam && (
              <span>
                Workspace <b>{pool.toLocaleString()}</b>
              </span>
            )}
            <span>
              Personal <b>{personal.toLocaleString()}</b>
            </span>
          </div>
          <div className="igcg-actions">
            {isTeam && (
              <button type="button" className="igcg-primary" onClick={() => setAllocateOpen(true)}>
                <ArrowRightLeft size={16} />
                Add to workspace
              </button>
            )}
            {typeof onBuy === 'function' && (
              <button type="button" className={isTeam ? 'igcg-secondary' : 'igcg-primary'} onClick={onBuy}>
                <ShoppingBag size={16} />
                Buy credits
              </button>
            )}
          </div>
        </div>
      </div>
      )}
      <div className="igcg-allocate-layer">
        <AllocateCreditsModal
          isOpen={allocateOpen}
          workspace={{ id: workspaceId, name: workspaceName }}
          onClose={() => setAllocateOpen(false)}
          onSuccess={async () => {
            setAllocateOpen(false);
            if (onReady) await onReady();
          }}
        />
      </div>
    </>
  );
}
