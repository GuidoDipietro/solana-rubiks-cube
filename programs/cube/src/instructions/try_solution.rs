use std::{borrow::BorrowMut, str::SplitWhitespace};

use anchor_lang::prelude::*;

use crate::{state::*, constants::*, error::Error, moves::*};

#[derive(Accounts)]
pub struct TrySolution<'info> {
    #[account(mut)]
    pub cuber: Signer<'info>,

    #[account(
        init_if_needed,
        seeds = [WINNER_TAG.as_ref(), cuber.key().as_ref()],
        bump,
        payer = cuber,
        space = Winner::LEN
    )]
    pub winner_data: Account<'info, Winner>,

    #[account(
        mut,
        close = cuber
    )]
    pub cube: Account<'info, Cube>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<TrySolution>, move_string: String) -> Result<()> {
    // Get cube
    let cube: &mut Account<Cube> = ctx.accounts.cube.borrow_mut();

    // Iterate through every move and apply it if valid
    let moves: SplitWhitespace = move_string.split_whitespace();
    for mov in moves {
        if ![
            "R","U","F","L","D","B",
            "R'","U'","F'","L'","D'","B'",
            "R2","U2","F2","L2","D2","B2",
        ].contains(&mov) {
            return Err(error!(Error::InvalidMove));
        }

        // Letter into index (shifted ASCII value)
        let base_move: usize = mov.chars().nth(0).unwrap() as usize - 66;
        // Direction
        if let Some(dir) = mov.chars().nth(1) {
            match dir {
                '\'' => move_cube(base_move + 1, cube.borrow_mut()),
                '2' => {
                    move_cube(base_move, cube.borrow_mut());
                    move_cube(base_move, cube.borrow_mut());
                },
                _ => (),
            }
        }
        else {
            move_cube(base_move, cube.borrow_mut());
        }
    }

    // If cube is solved this succeeds
    is_cube_solved(&cube)?;

    // Update winner account
    let winner = &mut ctx.accounts.winner_data;
    if winner.challenges_won == 0 {
        winner.winner = ctx.accounts.cuber.key();
    }
    winner.challenges_won += 1;
    winner.cashed_prize += ctx.accounts.cube.to_account_info().lamports();

    Ok(())
}
