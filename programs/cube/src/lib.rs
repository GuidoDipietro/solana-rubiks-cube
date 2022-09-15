use anchor_lang::prelude::*;

pub mod instructions;
pub mod error;
pub mod state;
pub mod constants;
pub mod moves;

use crate::{instructions::*, state::Cube};

declare_id!("2xUjvPgGaAehA9qFz8y6U6whBeNaafkRJMeEuBoLXj9U");

#[program]
pub mod cube {
    use super::*;

    /// Initializes a scrambled Cube with a prize for whoever solves it
    pub fn init_cube(ctx: Context<InitCube>, cube: Cube, prize: u64) -> Result<()> {
        init_cube::handler(ctx, cube, prize)
    }

    /// Tries a move sequence and if it solves the cube, cashes the prize
    pub fn try_solution(ctx: Context<TrySolution>, move_string: String) -> Result<()> {
        try_solution::handler(ctx, move_string)
    }
}
