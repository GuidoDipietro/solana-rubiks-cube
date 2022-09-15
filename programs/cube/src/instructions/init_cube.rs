use anchor_lang::prelude::*;
use anchor_lang::solana_program::{system_instruction::transfer, program::invoke};

use crate::{state::*, constants::*};

#[derive(Accounts)]
pub struct InitCube<'info> {
    #[account(mut)]
    pub challenger: Signer<'info>,

    #[account(
        init,
        seeds = [CUBE_TAG.as_ref(), challenger.key().as_ref()],
        bump,
        payer = challenger,
        space = Cube::LEN
    )]
    pub cube: Account<'info, Cube>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitCube>, cube: Cube, prize: u64) -> Result<()> {
    let new_cube = &mut ctx.accounts.cube;

    new_cube.co = cube.co;
    new_cube.cp = cube.cp;
    new_cube.eo = cube.eo;
    new_cube.ep = cube.ep;

    invoke(
        &transfer(
            &ctx.accounts.challenger.key(),
            &ctx.accounts.cube.key(),
            prize,
        ),
        &[
            ctx.accounts.challenger.to_account_info(),
            ctx.accounts.cube.to_account_info(),
        ],
    )?;

    Ok(())
}
