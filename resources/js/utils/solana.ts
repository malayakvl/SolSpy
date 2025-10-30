// resources/js/utils/solana.ts
import { Connection, PublicKey } from '@solana/web3.js';

// ТВОЙ ВАЛИДАТОР RPC
export const VALIDATOR_RPC = 'http://103.167.235.81:8899';
const connection = new Connection(VALIDATOR_RPC, 'confirmed');

export async function getWithdrawerFromMyValidator(
  votePubkey: string
): Promise<string | null> {
  try {
    const pubkey = new PublicKey(votePubkey);
    const accountInfo = await connection.getAccountInfo(pubkey);

    if (!accountInfo || accountInfo.data.length < 136) {
      return null;
    }

    // authorizedWithdrawer — байты 104–135
    const withdrawer = new PublicKey(accountInfo.data.slice(104, 136));
    return withdrawer.toBase58();
  } catch (error) {
    console.error('RPC Error:', error);
    return null;
  }
}