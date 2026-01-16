/**
 * NEAR Blockchain Bridge: Immutable ATOM Trail Provenance
 *
 * H&&S:WAVE - This bridge writes ATOM decisions to NEAR blockchain
 *             for permanent, verifiable provenance tracking.
 *
 * Features:
 * - ATOM trail entries become immutable on-chain records
 * - H&&S:WAVE attributions are cryptographically verifiable
 * - Coherence scores form a public trust metric
 * - Cross-repo governance via smart contracts
 */

import { connect, keyStores, Contract, WalletConnection } from 'near-api-js';

// NEAR network configuration
const NEAR_CONFIG = {
  networkId: 'testnet',  // Switch to 'mainnet' for production
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://testnet.mynearwallet.com/',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://testnet.nearblocks.io',
};

// SpiralSafe contract (deployed separately)
const CONTRACT_ID = 'spiralsafe-vortex.testnet';

interface ATOMOnChain {
  atomTag: string;
  repo: string;
  coherenceScore: number;
  phasesPassed: string[];
  markers: string[];       // H&&S markers
  contributor: string;     // NEAR account or GitHub username
  timestamp: string;
  commitHash: string;
  prNumber?: number;
}

interface VortexState {
  totalAtoms: number;
  averageCoherence: number;
  snapInCount: number;
  repoCoherence: Record<string, number>;
  lastUpdate: string;
}

// Contract interface (mirrors Rust contract)
interface SpiralSafeContract extends Contract {
  // View methods (free)
  get_atom: (args: { atom_tag: string }) => Promise<ATOMOnChain | null>;
  get_vortex_state: () => Promise<VortexState>;
  get_repo_atoms: (args: { repo: string; limit: number }) => Promise<ATOMOnChain[]>;
  get_contributor_atoms: (args: { contributor: string }) => Promise<ATOMOnChain[]>;

  // Change methods (require gas)
  record_atom: (args: { atom: ATOMOnChain }) => Promise<string>;
  batch_record_atoms: (args: { atoms: ATOMOnChain[] }) => Promise<string[]>;
  update_coherence: (args: { repo: string; coherence: number }) => Promise<void>;
}

class NEARAtomBridge {
  private near: any;
  private wallet: WalletConnection | null = null;
  private contract: SpiralSafeContract | null = null;

  async initialize(accountId?: string): Promise<void> {
    // Connect to NEAR
    this.near = await connect({
      ...NEAR_CONFIG,
      keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    });

    // Create wallet connection
    this.wallet = new WalletConnection(this.near, 'spiralsafe-vortex');

    // Initialize contract
    if (this.wallet.isSignedIn() || accountId) {
      const account = accountId
        ? await this.near.account(accountId)
        : this.wallet.account();

      this.contract = new Contract(account, CONTRACT_ID, {
        viewMethods: [
          'get_atom',
          'get_vortex_state',
          'get_repo_atoms',
          'get_contributor_atoms',
        ],
        changeMethods: [
          'record_atom',
          'batch_record_atoms',
          'update_coherence',
        ],
      }) as SpiralSafeContract;
    }
  }

  /**
   * Record an ATOM decision to the blockchain
   * This creates an immutable, verifiable record
   */
  async recordAtom(atom: ATOMOnChain): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }

    // Validate coherence score
    if (atom.coherenceScore < 0 || atom.coherenceScore > 100) {
      throw new Error('Coherence score must be between 0 and 100');
    }

    // Record to chain
    const txHash = await this.contract.record_atom({ atom });

    console.log(`ATOM recorded on-chain: ${atom.atomTag}`);
    console.log(`Transaction: ${NEAR_CONFIG.explorerUrl}/txns/${txHash}`);

    return txHash;
  }

  /**
   * Batch record multiple ATOMs (more gas efficient)
   */
  async recordAtomBatch(atoms: ATOMOnChain[]): Promise<string[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    return this.contract.batch_record_atoms({ atoms });
  }

  /**
   * Get vortex state from chain
   */
  async getVortexState(): Promise<VortexState> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    return this.contract.get_vortex_state();
  }

  /**
   * Check if ecosystem has achieved snap-in
   */
  async checkEcosystemSnapIn(): Promise<{
    snapIn: boolean;
    coherence: number;
    repos: Record<string, number>;
  }> {
    const state = await this.getVortexState();

    const SNAP_IN_THRESHOLD = 70;
    const snapIn = state.averageCoherence >= SNAP_IN_THRESHOLD;

    return {
      snapIn,
      coherence: state.averageCoherence,
      repos: state.repoCoherence,
    };
  }

  /**
   * Get ATOM trail for a specific contributor
   * Useful for H&&S:WAVE attribution verification
   */
  async getContributorTrail(contributor: string): Promise<ATOMOnChain[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    return this.contract.get_contributor_atoms({ contributor });
  }

  /**
   * Sign in with NEAR wallet (browser only)
   */
  async signIn(): Promise<void> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    await this.wallet.requestSignIn({
      contractId: CONTRACT_ID,
      methodNames: ['record_atom', 'batch_record_atoms', 'update_coherence'],
    });
  }

  /**
   * Sign out
   */
  signOut(): void {
    if (this.wallet) {
      this.wallet.signOut();
    }
  }

  /**
   * Check if signed in
   */
  isSignedIn(): boolean {
    return this.wallet?.isSignedIn() ?? false;
  }

  /**
   * Get current account ID
   */
  getAccountId(): string | null {
    return this.wallet?.getAccountId() ?? null;
  }
}

// GitHub Actions integration for automated recording
export async function recordAtomFromCI(
  atom: Omit<ATOMOnChain, 'timestamp'>,
  privateKey?: string
): Promise<string> {
  // For CI, use environment variable for key
  const key = privateKey || process.env.NEAR_PRIVATE_KEY;
  if (!key) {
    console.warn('NEAR_PRIVATE_KEY not set, skipping blockchain record');
    return 'skipped';
  }

  const keyStore = new keyStores.InMemoryKeyStore();
  const keyPair = await (await import('near-api-js')).utils.KeyPair.fromString(key);
  await keyStore.setKey(NEAR_CONFIG.networkId, CONTRACT_ID, keyPair);

  const near = await connect({
    ...NEAR_CONFIG,
    keyStore,
  });

  const account = await near.account(CONTRACT_ID);
  const contract = new Contract(account, CONTRACT_ID, {
    viewMethods: [],
    changeMethods: ['record_atom'],
  }) as SpiralSafeContract;

  const fullAtom: ATOMOnChain = {
    ...atom,
    timestamp: new Date().toISOString(),
  };

  return contract.record_atom({ atom: fullAtom });
}

// Convert local ATOM entry to on-chain format
export function toOnChainAtom(
  localEntry: any,
  repo: string,
  contributor: string,
  commitHash: string,
  prNumber?: number
): ATOMOnChain {
  return {
    atomTag: localEntry.atomTag,
    repo,
    coherenceScore: Math.round(localEntry.coherence?.coherence?.score ?? 0),
    phasesPassed: localEntry.gatesPassed || [],
    markers: localEntry.markers || [],
    contributor,
    timestamp: localEntry.timestamp || new Date().toISOString(),
    commitHash,
    prNumber,
  };
}

// Export for use in other bridges
export const NEARBridge = {
  NEARAtomBridge,
  recordAtomFromCI,
  toOnChainAtom,
  NEAR_CONFIG,
  CONTRACT_ID,
};

export default NEARAtomBridge;
