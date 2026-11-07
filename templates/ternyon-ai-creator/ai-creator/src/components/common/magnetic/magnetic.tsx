// 📖 Docs: obsidian/frontend/components/common.md

/**
 * Type that leans toward the pointer inside a control that stays put.
 *
 * **Two elements, two jobs, and that separation is the whole component.** The
 * element it wraps is what *moves*; the element that contains it is the area
 * that is *felt*. A magnetic control that slides the plate as well as the label
 * stops reading as a plate — the button appears to come loose from the layout —
 * and it drags its own hover area around under the cursor, so the pointer can
 * leave a control that moved out from under it.
 *
 * So the listeners go on the parent and the transform goes on the child. Wrap
 * the label; the button around it is what the reader is pointing at.
 *
 * The pull is a **fraction of the offset from the control's centre**, not a
 * fixed distance, so the reach is proportional to the control's own size: a wide
 * address pill leans further than a small button, which is what keeps the
 * gesture reading as the same gesture on both.
 *
 * **Bare `SpringValue`s whose `onChange` writes the transform**, the same
 * bargain `<StageNavBar>`, the scene's entrance and the opening curtain already
 * make: a pointer crossing a control is a hundred updates a second, and none of
 * them is a reason to re-render React. The lag is the effect — type that arrives
 * with the cursor is just type that moved.
 *
 * **Nothing is attached without a pointer.** On a touch device there is no hover
 * to answer, and an unmoved cursor would resolve to the control's own centre
 * anyway — so the listeners are never bound and the child renders untouched.
 */

"use client";

import { SpringValue } from "@react-spring/web";
import type { AnimationResult } from "@react-spring/web";
import { useEffect, useRef } from "react";

import { magneticConfig } from "@/lib/magnetic/magnetic.config";
import { deviceTier, wantsPointer } from "@/lib/scene/device";

const { pull, config } = magneticConfig;

export interface MagneticProps {
  children: React.ReactNode;
  className?: string;
}

export const Magnetic = ({ children, className }: MagneticProps) => {
  const hostRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !wantsPointer(deviceTier())) return;
    // The control, not the label. Falls back to the label itself so a
    // `<Magnetic>` with no wrapper still does something sensible rather than
    // nothing at all.
    const area = host.parentElement ?? host;

    const x = new SpringValue(0);
    const y = new SpringValue(0);
    const paint = () => {
      host.style.transform = `translate3d(${x.get()}px, ${y.get()}px, 0)`;
    };
    // **Both** springs repaint. Hung on one of them, a move along that axis's
    // own centre line leaves the other spring travelling with nothing to write
    // it out — the control does not move, and only for pointer paths that
    // happen to cross the middle.
    const onChange = (_result: AnimationResult<SpringValue<number>>) => paint();

    const onMove = (event: PointerEvent) => {
      // Measured per move, not cached: the closing screen this sits on is
      // carried up by a rising panel, so the box is somewhere different on
      // every frame of the climb and a remembered rect would aim at where the
      // control used to be.
      const box = area.getBoundingClientRect();
      const toX = (event.clientX - (box.left + box.width / 2)) * pull;
      const toY = (event.clientY - (box.top + box.height / 2)) * pull;
      void x.start({ to: toX, config, onChange });
      void y.start({ to: toY, config, onChange });
    };

    const onLeave = () => {
      void x.start({ to: 0, config, onChange });
      void y.start({ to: 0, config, onChange });
    };

    // `pointerleave` rather than `pointerout`: `out` fires when the pointer
    // crosses onto a child, and the area always has one — the label.
    area.addEventListener("pointermove", onMove, { passive: true });
    area.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
      x.stop();
      y.stop();
      host.style.transform = "";
    };
  }, []);

  return (
    <span ref={hostRef} className={className}>
      {children}
    </span>
  );
};
