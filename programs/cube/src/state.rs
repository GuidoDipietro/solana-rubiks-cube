//! Definition of Data Accounts

use anchor_lang::prelude::*;

/// Cube state
#[account]
#[derive(Debug)]
pub struct Cube {
    /// Corner orientation vector
    pub co: [u8; 8],
    /// Corner permutation vector
    pub cp: [u8; 8],
    /// Edge orientation vector
    pub eo: [u8; 12],
    /// Edge permutation vector
    pub ep: [u8; 12],
}
impl Cube {
    pub const LEN: usize =
        8 +             // Discriminator
        2 * (1 * 8) +   // Two [u8; 8]
        2 * (1 * 12)    // Two [u8; 12]
    ;
}

/// Sponsor
#[account]
pub struct Sponsor {
    /// Owner of this sponsor
    pub owner: Pubkey,
    /// Name of the company (30 bytes)
    pub name: String,
    /// Extra info (70 bytes)
    pub desc: String,
    /// Number of challenges created so far
    pub challenges_created: u64,
    /// Total lamports locked in challenges
    pub total_fund: u64,
}
impl Sponsor {
    pub const MAX_NAME_LEN: usize = 30;
    pub const MAX_DESC_LEN: usize = 70;

    pub const LEN: usize =
        8 +                     // Discriminator
        32 +                    // One Pubkey
        2 * 8 +                 // Two u64
        Self::MAX_NAME_LEN +    // Name
        Self::MAX_DESC_LEN      // Desc
    ;
}

/// Register of someone that won
#[account]
pub struct Winner {
    pub winner: Pubkey,
    pub challenges_won: u64,
    pub cashed_prize: u64,
    pub name: String,
}
impl Winner {
    pub const LEN: usize =
        8 +             // Discriminator
        32 +            // One Pubkey
        2 * 8 +         // Two u64
        100             // Name max length
    ;
}
