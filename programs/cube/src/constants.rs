//! Definition of move constants to describe the Rubik's Cube

/// For PDAs
pub const CUBE_TAG: &str = "CUBE";
pub const SPONSOR_TAG: &str = "SPONSOR";
pub const WINNER_TAG: &str = "WINNER";

// Permutation vectors + Orientation masks

/// UBL UBR UFR UFL DFL DFR DBR DBL
pub static CP: &[[usize; 4]] = &[
    [7,6,1,0],
    [0,1,6,7], // inv
    [4,5,6,7],
    [7,6,5,4], // inv
    [2,5,4,3],
    [3,4,5,2], // inv
    [0,0,0,0], // fill
    [0,0,0,0], // fill
    [0,0,0,0], // fill
    [0,0,0,0], // fill
    [3,4,7,0],
    [0,7,4,3], // inv
    [0,0,0,0], // fill
    [0,0,0,0], // fill
    [0,0,0,0], // fill
    [0,0,0,0], // fill
    [6,5,2,1],
    [1,2,5,6], // inv
    [0,0,0,0], // fill
    [0,1,2,3],
    [3,2,1,0], // inv
];

/// UB UR UF UL BL BR FR FL DF DR DB DL
pub static EP: &[[usize; 4]] = &[
    [4,10,5,0],
    [0,5,10,4],  // inv
    [8,9,10,11],
    [11,10,9,8], // inv
    [2,6,8,7],
    [7,8,6,2],   // inv
    [0,0,0,0],   // fill
    [0,0,0,0],   // fill
    [0,0,0,0],   // fill
    [0,0,0,0],   // fill
    [3,7,11,4],
    [4,11,7,3],  // inv
    [0,0,0,0],   // fill
    [0,0,0,0],   // fill
    [0,0,0,0],   // fill
    [0,0,0,0],   // fill
    [1,5,9,6],
    [6,9,5,1],   // inv
    [0,0,0,0],   // fill
    [0,1,2,3],
    [3,2,1,0],   // inv
];

/// 0 = none, 1 = cw, 2 = ccw
pub static CO: &[Option<[u8; 8]>] = &[
    Some([1,2,0,0,0,0,1,2]),
    Some([1,2,0,0,0,0,1,2]),    // inv
    None,
    None,                       // inv
    Some([0,0,1,2,1,2,0,0]),
    Some([0,0,1,2,1,2,0,0]),    // inv
    None,                       // fill
    None,                       // fill
    None,                       // fill
    None,                       // fill
    Some([2,0,0,1,2,0,0,1]),
    Some([2,0,0,1,2,0,0,1]),    // inv
    None,                       // fill
    None,                       // fill
    None,                       // fill
    None,                       // fill
    Some([0,1,2,0,0,1,2,0]),
    Some([0,1,2,0,0,1,2,0]),    // inv
    None,                       // fill
    None,
    None,                       // inv
];

/// 1 = unoriented
pub static EO: &[Option<[u8; 12]>] = &[
    Some([1,0,0,0,1,1,0,0,0,0,1,0]),
    Some([1,0,0,0,1,1,0,0,0,0,1,0]),    // inv
    None,
    None,                               // fill
    Some([0,0,1,0,0,0,1,1,1,0,0,0]),
    Some([0,0,1,0,0,0,1,1,1,0,0,0]),    // inv
    None,                               // fill
    None,                               // fill
    None,                               // fill
    None,                               // fill
    None,
    None,                               // fill
    None,                               // fill
    None,                               // fill
    None,                               // fill
    None,                               // fill
    None,
    None,                               // fill
    None,                               // fill
    None,
    None,                               // fill
];
