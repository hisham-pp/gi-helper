/**
 * Weapons, artifacts and characters read by the scanners, on their way to
 * the inventory.
 *
 * Materials are merged by id (each shows once in the bag), but the same
 * weapon or artifact can be owned many times. Overlapping screenshots and
 * the frames of a recording are therefore stitched by rows: a new frame's
 * first rows are matched against the rows read so far (same items, levels
 * and refinements in the same columns), and only the rows past the overlap
 * are added. Characters (the party setup's list) are stitched the same way
 * and then kept once each. An artifact detail panel read beside the grid
 * (lib/artifact-panel) is attached to the card it describes before
 * stitching, so it travels with that card. Then each card becomes a GOOD
 * entry.
 */

export * from "./types/equipment.types";
export * from "./constants/orchestration.constants";
export * from "./engine/good-adapter";
export * from "./engine/equipment-stitcher";
