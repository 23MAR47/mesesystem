/**
 * The magnetic control's pull.
 *
 * 📖 Docs: obsidian/frontend/components/common.md
 */
export const magneticConfig = {
  /**
   * How much of the pointer's offset from the control's centre the control
   * takes, 0–1.
   *
   * A **fraction**, not a distance, so the reach is proportional to the
   * control's own size: the wide address pill leans further than a small button
   * would, which is what keeps the gesture reading as the same gesture on both.
   *
   * 0.22 is enough to feel and small enough that the label never leaves the
   * plate it is written on.
   */
  pull: 0.22,

  /**
   * Soft, and deliberately slower than the pointer.
   *
   * The lag *is* the effect — a control that arrives with the cursor is just a
   * control that moved. Low tension against high friction gives a lean that
   * trails the hand and a return that eases home rather than snapping.
   */
  config: { tension: 150, friction: 26 },
} as const;
