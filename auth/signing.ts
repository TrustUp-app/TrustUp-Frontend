import type { VerifyRequestDto } from '../api/auth';
import { Keypair } from '@stellar/stellar-sdk';

export type SignNonceFn = (wallet: string, nonce: string) => Promise<string>;

/**
 * Lobstr signing (best-effort placeholder).
 *
 * IMPORTANT:
 * - Proper Lobstr signing requires invoking the Lobstr wallet via deep links / wallet SDK.
 * - This repo does not currently contain that integration.
 *
 * What this does now:
 * - If the app already has a Stellar secret key available (it should NOT), it will sign.
 * - Otherwise it throws a clear error telling you that the wallet deep-link/integration is missing.
 *
 * Replace this module once the Lobstr callback/deep-link flow is known.
 */
export const signNonceWithWallet: SignNonceFn = async (wallet, nonce) => {
  // Nonce signing requires the user to sign via their wallet.
  // Since we don't have that integration in this repo yet, fail loudly.
  // (Never log or persist secrets.)
  const maybeSecret = (globalThis as any).__TRUSTUP_STELLAR_SECRET as string | undefined;
  if (!maybeSecret) {
    throw new Error(
      'Lobstr wallet signing integration is missing in this repo. '
        + 'Implement the Lobstr deep-link / callback flow to produce the signature for auth/verify.'
    );
  }

  // WARNING: Using secret keys in the frontend is insecure.
  // This branch is only here to make the flow testable in dev.
  const kp = Keypair.fromSecret(maybeSecret);
  if (kp.publicKey() !== wallet) {
    throw new Error('Provided wallet address does not match the configured signing key.');
  }

  // Sign the nonce as bytes (ed25519)
  const signature = kp.sign(Buffer.from(nonce, 'utf8')).toString('base64');
  return signature;
};

export async function buildVerifyPayload(params: {
  wallet: string;
  nonce: string;
  signature: string;
}): Promise<VerifyRequestDto> {
  return {
    wallet: params.wallet,
    nonce: params.nonce,
    signature: params.signature,
  };
}


