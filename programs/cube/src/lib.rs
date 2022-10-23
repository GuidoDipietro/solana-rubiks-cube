use anchor_lang::prelude::*;

pub mod instructions;
pub mod error;
pub mod state;
pub mod constants;
pub mod moves;

use crate::{instructions::*, state::*};

declare_id!("aJQboVi8BRg98ZYLkyun59madrxWjP3tpscvZ6jKmMU");

#[program]
pub mod cube {
    use super::*;

    /// Initializes a scrambled Cube with a prize for whoever solves it
    /// and creates a sponsor data account that holds info of the funder
    #[access_control(init_cube::validate(&sponsor_name, &sponsor_desc))]
    pub fn init_cube(ctx: Context<InitCube>, sponsor_name: String, sponsor_desc: String, cube: Cube, prize: u64) -> Result<()> {
        init_cube::handler(ctx, sponsor_name, sponsor_desc, cube, prize)
    }

    /// Tries a move sequence and if it solves the cube, cashes the prize
    pub fn try_solution(ctx: Context<TrySolution>, move_string: String) -> Result<()> {
        try_solution::handler(ctx, move_string)
    }

    /// Applies a sequence of moves to a solved cube to see how it looks like
    pub fn peek_cube(ctx: Context<PeekCube>, move_string: String) -> Result<Cube> {
        peek_cube::handler(ctx, move_string)
    }
}
