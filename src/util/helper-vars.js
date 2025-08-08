export const phaseToAllowedCostCodes = {
  0: [0], // Nothing
  100: [50], // Project Management phase ➔ Cost Code 50
  200: [100, 200], // Engineering phase ➔ Control Eng / Mech Eng
  300: [300, 400, 425, 475], // Staging / Mod Build ➔ Software-related cost codes
  400: [475, 500], // Install / Commission ➔ Install/Process Prog
  500: [600, 700], // System Debug ➔ Service, Training
  600: [500, 600, 700], // Startup ➔ Service, Training
  700: [700, 800], // Prod Support ➔ Documentation, Admin
  800: [800, 825], // Closeout ➔ Admin, Product Development
  900: [825, 900, 925], // Sales/Administration ➔ Manufacturing, Shop Labor
  950: [950], // Paid Time Off ➔ Paid Time Off
  960: [960], // Unpaid Time Off ➔ Unpaid Time Off
  999: [999], // Unallocated
};

export const projectsToAllowedMixPhasesCostCodes = {
  Admin: [900, 800],
  Vacation: [950, 950],
  Holiday: [950, 950],
  Proposal: [900, 977],
  PDEV: [900, 825],
  Sales: [900, 976],
  Sick: [900, 975],
  "Jury Duty": [900, 975],
  Bereavement: [900, 975],
  ProjOver: [900, 975],
  Training: [900, 800],
  SpareParts: [900, 975],
  COVID19: [999, 999],
  Unnassigned: [950, 950],
  PDUP: [999, 999],
};
