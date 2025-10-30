import { useState, useEffect } from 'react';
import { getWithdrawerFromMyValidator, VALIDATOR_RPC } from '../../../utils/solana';

export function ValidatorWithdrawer({ votePubkey, nodePubkey }: { 
  votePubkey: string; 
  nodePubkey: string;
}) {
  const [withdrawer, setWithdrawer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getWithdrawerFromMyValidator(votePubkey)
      .then(setWithdrawer)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [votePubkey]);

  const isHot = withdrawer === nodePubkey;

  return (
    <div>
      <div>
        {loading ? '⏳' : error ? '❌ RPC error' : withdrawer ? (
          <>
            <span style={{ color: isHot ? '#703da7' : '#000' }}>
              {withdrawer}
            </span>
            {isHot && (
              <span style={{ color: '#ff4444', fontWeight: 'bold', marginLeft: '8px' }}>
                ⚠️ HOT KEY (UNSAFE!)
              </span>
            )}
          </>
        ) : 'Not found'}
      </div>

      <div style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
        Source: <code>{VALIDATOR_RPC}</code>
      </div>
    </div>
  );
}

export default ValidatorWithdrawer;
