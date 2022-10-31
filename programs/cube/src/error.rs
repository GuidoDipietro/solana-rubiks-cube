//! Custom error messages

use anchor_lang::prelude::*;

#[error_code]
pub enum Error {
    #[msg("Invalid move")]
    InvalidMove,

    #[msg("Cube is not solved")]
    UnsolvedCube,

    #[msg("The sponsor's name is too long!")]
    SponsorNameTooLong,

    #[msg("The sponsor's description is too long!")]
    SponsorDescTooLong,

    #[msg("The winner's name is too long!")]
    WinnerNameTooLong,
}
