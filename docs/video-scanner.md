# Video Scanner

Recognises the materials in a screen recording of the inventory: the user
scrolls through the Character Development Items tab while recording, drops the
video into the **Video** tab on `/`, and gets one entry per material with its
quantity. Everything runs on-device with the
[material recognizer](material-detector.md); no API key, nothing uploaded.

- Library: `src/lib/video-scanner/` (`scanVideo`, pure frame selection and merging)
- UI: `src/components/scanner/VideoScannerView.tsx`
- Sample: `public/samples/test-set-02/` (22 s, 1584 × 720 phone recording; the "Try a sample recording" button)
- Tests: `tests/video-scanner.test.ts`

## Pipeline

| # | Stage | Module | What it does |
|---|-------|--------|--------------|
| 1 | Open | `video.ts` | Validates the file and opens it in two hidden `<video>` elements (one for the analysis, one for grabbing frames), so both seek independently. |
| 2 | Analyse | `keyframes.ts` | Seeks every 0.2 s (coarser for videos over 4 minutes) and reduces each frame to a 128-px grayscale thumbnail. `KeyframePicker` picks the frames where scrolling settles: local minima of the difference to the previous sample, and still stretches. A frame that looks like the previous pick is skipped, so a pause is scanned once. |
| 3 | Scan | `scan-video.ts` | Picked frames are grabbed at full resolution (one ahead per worker) and scanned by two `MaterialScanClient` workers (`scanFrame`) while the analysis continues. Once a frame shows a clear grid (6+ cards), later frames only run grid detection on its columns (`lockRegion`), falling back to the full frame when nothing is found there. |
| 4 | Fill gaps | `keyframes.ts` | Two neighbouring scanned frames that both show inventory but share no `matched` material may have skipped rows: the calmest sample near the middle of the gap is scanned, until every pair overlaps or no sample is left in between. |
| 5 | Merge | `merge.ts` | `SightingMerger` keeps one entry per material. Each sighting votes for the quantity it read, weighted by its confidence (uncertain cards count less), so a frame where a touch marker or compression smeared the digits is outvoted. A runner-up with a third or more of the vote is flagged. |

Card crops for the review modal are cut from the clearest sighting of each
(material, quantity) pair as frames are scanned; their encoding finishes in
the background.

## Review reasons

| Reason | When |
|---|---|
| Low confidence | No frame recognised the material with confidence. |
| Quantity unreadable | No frame could read the digits. |
| Frames disagree on quantity | Another quantity got a third or more of the vote. |
| Check quantity | The best agreeing reading is not sure of its digits. |

## Results on the sample

`public/samples/test-set-02` was recorded on 2026-10-13, four days after the
screenshots of `test-set-01`. Measured 2026-10-14 in the production build
(headless Chrome, Intel Core 5 120U, two workers):

- 113 frames analysed, 29 scanned (one of them to fill a gap), 576 card readings.
- 274 materials: all 270 of `test-set-01/expected.json`, plus Hero's Wit and
  Adventurer's Experience (missing from that file) and two talent books.
- 252 quantities equal `expected.json`. The other 18 were checked against
  their crops and are what the recording shows (mostly items farmed since the
  screenshots; Guide to Conflict is the known error in `expected.json`).
- 1 material flagged for review (correct, but `uncertain`).
- 28–30 s end to end. Each frame costs about 0.5 s of grid detection and 0.5 s
  of recognition per worker; a busy machine can make it much slower.

## Recording tips (shown in the UI)

- Record the Character Development Items tab, scrolling at a steady pace and
  pausing briefly between flicks. Fast flings still work (gaps are filled),
  but settled frames read best.
- MP4 (H.264), WebM and MOV work wherever the browser can play them. HEVC
  recordings may not play in every browser.

## Limits

- 10 minutes and 2 GB per video; at most 400 frames are scanned.
- Frames are read with `<video>` seeking (~35 ms per seek), which is reliable
  in every browser but slower than decoding with WebCodecs.
- A material is identified per frame; the merge does not track cards between
  frames, so a card misidentified in one frame shows up as an extra entry
  (flagged when the recognizer was unsure).
