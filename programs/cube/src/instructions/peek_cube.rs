use std::{borrow::BorrowMut, str::SplitWhitespace};

use anchor_lang::prelude::*;

use crate::{state::*, error::Error, moves::*};

#[derive(Accounts)]
pub struct PeekCube {
    // remaining accounts:
    // cube: Account<'info, Cube>,
}

pub fn handler(ctx: Context<PeekCube>, move_string: String) -> Result<Cube> {
    // Check if there is a cube in remaining accounts, otherwise use a solved one
    let cube_account = ctx.remaining_accounts.iter().next();

    let mut cube = 
        if let Some(_cube_account) = cube_account {
            Account::<Cube>::try_from(_cube_account)?.into_inner()
        }
        else {
            Cube {
                co: [0,0,0,0,0,0,0,0],
                cp: [1,2,3,4,5,6,7,8],
                eo: [0,0,0,0,0,0,0,0,0,0,0,0],
                ep: [1,2,3,4,5,6,7,8,9,10,11,12],
            }
        };

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

    msg!("{:?}", cube);

    Ok(cube.clone())
}
