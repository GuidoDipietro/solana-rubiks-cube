use anchor_lang::prelude::*;
use anchor_lang::solana_program::{system_instruction::transfer, program::invoke};

use crate::{state::*, constants::*, error::Error};

#[derive(Accounts)]
#[instruction(sponsor_name: String)]
pub struct InitCube<'info> {
    #[account(mut)]
    pub sponsor: Signer<'info>,

    #[account(
        init_if_needed,
        seeds = [SPONSOR_TAG.as_ref(), sponsor.key().as_ref(), sponsor_name.as_ref()],
        bump,
        payer = sponsor,
        space = Sponsor::LEN
    )]
    pub sponsor_data: Account<'info, Sponsor>,

    #[account(
        init,
        seeds = [CUBE_TAG.as_ref(), sponsor_data.key().as_ref(), sponsor_data.challenges_created.to_le_bytes().as_ref()],
        bump,
        payer = sponsor,
        space = Cube::LEN
    )]
    pub cube: Account<'info, Cube>,

    pub system_program: Program<'info, System>,
}

pub fn validate(sponsor_name: &String, sponsor_desc: &String) -> Result<()> {
    if sponsor_name.len() > Sponsor::MAX_NAME_LEN {
        return Err(error!(Error::SponsorNameTooLong));
    }
    if sponsor_desc.len() > Sponsor::MAX_DESC_LEN {
        return Err(error!(Error::SponsorDescTooLong));
    }

    Ok(())
}

pub fn handler(ctx: Context<InitCube>, sponsor_name: String, sponsor_desc: String, cube: Cube, prize: u64) -> Result<()> {  
    // Create cube
    let new_cube = &mut ctx.accounts.cube;

    new_cube.co = cube.co;
    new_cube.cp = cube.cp;
    new_cube.eo = cube.eo;
    new_cube.ep = cube.ep;

    // Create or update sponsor
    let sponsor_data = &mut ctx.accounts.sponsor_data;

    if sponsor_data.challenges_created == 0 {
        sponsor_data.owner = ctx.accounts.sponsor.key();
        sponsor_data.name = sponsor_name;
        sponsor_data.desc = sponsor_desc;
    }
    sponsor_data.challenges_created += 1;
    sponsor_data.total_fund += prize;

    // Lock prize
    invoke(
        &transfer(
            &ctx.accounts.sponsor.key(),
            &ctx.accounts.cube.key(),
            prize,
        ),
        &[
            ctx.accounts.sponsor.to_account_info(),
            ctx.accounts.cube.to_account_info(),
        ],
    )?;

    Ok(())
}
