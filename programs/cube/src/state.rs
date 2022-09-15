//! Definition of Data Accounts

use anchor_lang::prelude::*;

/// Cube state
#[account]
pub struct Cube {
    pub co: [u8; 8],
    pub cp: [u8; 8],
    pub eo: [u8; 12],
    pub ep: [u8; 12],
}
impl Cube {
    pub const LEN: usize =
        8 +             // Discriminator
        2 * (1 * 8) +   // Two [u8; 8]
        2 * (1 * 12)    // Two [u8; 12]
    ;
}
