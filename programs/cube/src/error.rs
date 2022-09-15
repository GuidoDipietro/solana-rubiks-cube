//! Custom error messages

use anchor_lang::prelude::*;

#[error_code]
pub enum Error {
    #[msg("Invalid move")]
    InvalidMove,

    #[msg("Cube is not solved")]
    UnsolvedCube,
}
