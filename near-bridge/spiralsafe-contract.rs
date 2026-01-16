// SpiralSafe Vortex Smart Contract (NEAR Protocol)
//
// H&&S:WAVE - Immutable provenance for ATOM trail
//
// This contract stores:
// - ATOM decisions with coherence scores
// - H&&S:WAVE attribution markers
// - Cross-repo vortex state
// - Governance for ecosystem coherence

use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, Vector};
use near_sdk::json_types::U128;
use near_sdk::{env, near, AccountId, NearToken, PanicOnDefault};

// ATOM decision record
#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct ATOMOnChain {
    pub atom_tag: String,
    pub repo: String,
    pub coherence_score: u8,  // 0-100
    pub phases_passed: Vec<String>,
    pub markers: Vec<String>,  // H&&S markers
    pub contributor: String,
    pub timestamp: String,
    pub commit_hash: String,
    pub pr_number: Option<u32>,
}

// Vortex ecosystem state
#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct VortexState {
    pub total_atoms: u64,
    pub average_coherence: u8,
    pub snap_in_count: u64,
    pub last_update: String,
}

// Repository coherence tracking
#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct RepoState {
    pub repo: String,
    pub atom_count: u64,
    pub total_coherence: u64,
    pub average_coherence: u8,
    pub last_snap_in: Option<String>,
}

// Main contract
#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct SpiralSafeVortex {
    // ATOM storage: atom_tag -> ATOMOnChain
    atoms: LookupMap<String, ATOMOnChain>,

    // Repo state: repo_name -> RepoState
    repos: UnorderedMap<String, RepoState>,

    // Contributor trail: contributor -> Vec<atom_tag>
    contributor_atoms: LookupMap<String, Vector<String>>,

    // Global vortex state
    vortex_state: VortexState,

    // Governance
    owner: AccountId,
    snap_in_threshold: u8,  // Default 70
}

#[near]
impl SpiralSafeVortex {
    #[init]
    pub fn new(owner: AccountId) -> Self {
        Self {
            atoms: LookupMap::new(b"a"),
            repos: UnorderedMap::new(b"r"),
            contributor_atoms: LookupMap::new(b"c"),
            vortex_state: VortexState {
                total_atoms: 0,
                average_coherence: 0,
                snap_in_count: 0,
                last_update: env::block_timestamp().to_string(),
            },
            owner,
            snap_in_threshold: 70,
        }
    }

    // ==================== CHANGE METHODS ====================

    /// Record a single ATOM decision
    #[payable]
    pub fn record_atom(&mut self, atom: ATOMOnChain) -> String {
        // Validate
        assert!(atom.coherence_score <= 100, "Invalid coherence score");
        assert!(!atom.atom_tag.is_empty(), "ATOM tag required");

        // Store ATOM
        let atom_tag = atom.atom_tag.clone();
        self.atoms.insert(&atom_tag, &atom);

        // Update repo state
        self.update_repo_state(&atom);

        // Update contributor trail
        self.add_to_contributor_trail(&atom);

        // Update global vortex state
        self.update_vortex_state(&atom);

        // Check for ecosystem snap-in
        if atom.coherence_score >= self.snap_in_threshold {
            self.vortex_state.snap_in_count += 1;
            env::log_str(&format!(
                "SNAP-IN: {} achieved {}% coherence",
                atom.atom_tag, atom.coherence_score
            ));
        }

        // Return transaction hash equivalent
        format!("{}:{}", env::block_height(), atom_tag)
    }

    /// Batch record multiple ATOMs (gas efficient)
    #[payable]
    pub fn batch_record_atoms(&mut self, atoms: Vec<ATOMOnChain>) -> Vec<String> {
        atoms
            .into_iter()
            .map(|atom| self.record_atom(atom))
            .collect()
    }

    /// Update coherence for a repo (governance only)
    pub fn update_coherence(&mut self, repo: String, coherence: u8) {
        assert_eq!(
            env::predecessor_account_id(),
            self.owner,
            "Only owner can update coherence directly"
        );

        if let Some(mut state) = self.repos.get(&repo) {
            state.average_coherence = coherence;
            self.repos.insert(&repo, &state);
        }
    }

    /// Set snap-in threshold (governance only)
    pub fn set_snap_in_threshold(&mut self, threshold: u8) {
        assert_eq!(
            env::predecessor_account_id(),
            self.owner,
            "Only owner"
        );
        assert!(threshold <= 100, "Invalid threshold");
        self.snap_in_threshold = threshold;
    }

    // ==================== VIEW METHODS ====================

    /// Get a single ATOM by tag
    pub fn get_atom(&self, atom_tag: String) -> Option<ATOMOnChain> {
        self.atoms.get(&atom_tag)
    }

    /// Get vortex ecosystem state
    pub fn get_vortex_state(&self) -> VortexState {
        self.vortex_state.clone()
    }

    /// Get repo state
    pub fn get_repo_state(&self, repo: String) -> Option<RepoState> {
        self.repos.get(&repo)
    }

    /// Get all repo coherence scores
    pub fn get_repo_coherence(&self) -> Vec<(String, u8)> {
        self.repos
            .iter()
            .map(|(repo, state)| (repo, state.average_coherence))
            .collect()
    }

    /// Get ATOMs for a repo
    pub fn get_repo_atoms(&self, repo: String, limit: u32) -> Vec<ATOMOnChain> {
        // This is simplified - production would use pagination
        let mut result = Vec::new();
        for (_, atom) in self.atoms.iter() {
            if atom.repo == repo && result.len() < limit as usize {
                result.push(atom);
            }
        }
        result
    }

    /// Get ATOMs for a contributor
    pub fn get_contributor_atoms(&self, contributor: String) -> Vec<ATOMOnChain> {
        if let Some(tags) = self.contributor_atoms.get(&contributor) {
            tags.iter()
                .filter_map(|tag| self.atoms.get(&tag))
                .collect()
        } else {
            Vec::new()
        }
    }

    /// Check if ecosystem has achieved snap-in
    pub fn check_ecosystem_snap_in(&self) -> (bool, u8) {
        let snap_in = self.vortex_state.average_coherence >= self.snap_in_threshold;
        (snap_in, self.vortex_state.average_coherence)
    }

    /// Get H&&S attribution for a contributor
    pub fn get_attribution(&self, contributor: String) -> (u64, u8, Vec<String>) {
        if let Some(tags) = self.contributor_atoms.get(&contributor) {
            let atoms: Vec<ATOMOnChain> = tags
                .iter()
                .filter_map(|tag| self.atoms.get(&tag))
                .collect();

            let count = atoms.len() as u64;
            let avg_coherence = if count > 0 {
                (atoms.iter().map(|a| a.coherence_score as u64).sum::<u64>() / count) as u8
            } else {
                0
            };

            let all_markers: Vec<String> = atoms
                .iter()
                .flat_map(|a| a.markers.clone())
                .collect();

            (count, avg_coherence, all_markers)
        } else {
            (0, 0, Vec::new())
        }
    }

    // ==================== INTERNAL METHODS ====================

    fn update_repo_state(&mut self, atom: &ATOMOnChain) {
        let mut state = self.repos.get(&atom.repo).unwrap_or(RepoState {
            repo: atom.repo.clone(),
            atom_count: 0,
            total_coherence: 0,
            average_coherence: 0,
            last_snap_in: None,
        });

        state.atom_count += 1;
        state.total_coherence += atom.coherence_score as u64;
        state.average_coherence =
            (state.total_coherence / state.atom_count) as u8;

        if atom.coherence_score >= self.snap_in_threshold {
            state.last_snap_in = Some(atom.timestamp.clone());
        }

        self.repos.insert(&atom.repo, &state);
    }

    fn add_to_contributor_trail(&mut self, atom: &ATOMOnChain) {
        let mut trail = self
            .contributor_atoms
            .get(&atom.contributor)
            .unwrap_or_else(|| Vector::new(atom.contributor.as_bytes()));

        trail.push(&atom.atom_tag);
        self.contributor_atoms.insert(&atom.contributor, &trail);
    }

    fn update_vortex_state(&mut self, atom: &ATOMOnChain) {
        let prev_total = self.vortex_state.total_atoms as u64
            * self.vortex_state.average_coherence as u64;

        self.vortex_state.total_atoms += 1;

        let new_avg = (prev_total + atom.coherence_score as u64)
            / self.vortex_state.total_atoms as u64;

        self.vortex_state.average_coherence = new_avg as u8;
        self.vortex_state.last_update = env::block_timestamp().to_string();
    }
}

// ==================== TESTS ====================

#[cfg(test)]
mod tests {
    use super::*;

    fn get_context() -> near_sdk::VMContext {
        near_sdk::test_utils::VMContextBuilder::new()
            .predecessor_account_id("owner.near".parse().unwrap())
            .build()
    }

    #[test]
    fn test_record_atom() {
        let context = get_context();
        near_sdk::testing_env!(context);

        let mut contract = SpiralSafeVortex::new("owner.near".parse().unwrap());

        let atom = ATOMOnChain {
            atom_tag: "ATOM-TEST-001".to_string(),
            repo: "QDI".to_string(),
            coherence_score: 75,
            phases_passed: vec!["KENL".to_string(), "AWI".to_string()],
            markers: vec!["WAVE".to_string(), "PASS".to_string()],
            contributor: "toolate28".to_string(),
            timestamp: "2026-01-17T00:00:00Z".to_string(),
            commit_hash: "abc123".to_string(),
            pr_number: Some(42),
        };

        let result = contract.record_atom(atom.clone());
        assert!(!result.is_empty());

        let retrieved = contract.get_atom("ATOM-TEST-001".to_string());
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().coherence_score, 75);
    }

    #[test]
    fn test_snap_in_detection() {
        let context = get_context();
        near_sdk::testing_env!(context);

        let mut contract = SpiralSafeVortex::new("owner.near".parse().unwrap());

        // Record atoms until snap-in
        for i in 0..5 {
            let atom = ATOMOnChain {
                atom_tag: format!("ATOM-TEST-{}", i),
                repo: "QDI".to_string(),
                coherence_score: 80,  // Above threshold
                phases_passed: vec![],
                markers: vec!["WAVE".to_string()],
                contributor: "test".to_string(),
                timestamp: "2026-01-17".to_string(),
                commit_hash: "abc".to_string(),
                pr_number: None,
            };
            contract.record_atom(atom);
        }

        let (snap_in, coherence) = contract.check_ecosystem_snap_in();
        assert!(snap_in);
        assert_eq!(coherence, 80);
    }
}
