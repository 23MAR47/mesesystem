// 📖 Docs: obsidian/frontend/components/common.md

/**
 * The closing screen — the invitation, over a second 3D stage.
 *
 * Two layers again, around a **still** instance of the scene: the heading goes
 * behind the canvas so the model stands in front of it, exactly as on the first
 * screen, and the copy goes over it.
 *
 * The scene here never advances — it is held at progress 0, the textured model
 * on its ground, with the pointer's mark live. None of the scroll choreography
 * belongs to this block; what it borrows is the subject and the hover.
 *
 * Its ground is the accent blue, not porcelain, so the viewer is given that
 * token: the model dissolves *towards* the ground at its foot, and a scene told
 * the wrong ground smears the wrong colour over the block on the way out.
 */

import { sceneConfig } from "@/lib/scene/scene.config";

import { Magnetic } from "@/components/common/magnetic";

import { StageBottom, StageFrame, stackChild } from "./stage-frame";
import { StageReveal } from "./stage-reveal";
import { stageRise } from "./stage-rise";

/** The copy's stagger, in reading order: note, body, address. */
const [noteAt, bodyAt, addressAt] = sceneConfig.arrival.copyStagger;

export interface ContactStageContent {
  /** The invitation, set across the block. */
  heading: string;
  /** The scarcity line. */
  note: string;
  /** What happens next. */
  body: string;
  /** The address, in its own pill. */
  email: string;
}

/** Behind the canvas: the invitation the model stands in front of. */
export const ContactStageTitle = ({
  heading,
}: Pick<ContactStageContent, "heading">) => (
  <StageFrame>
    {/* Resolved letter by letter in the DOM, not painted by a scene: the
        closing screen has none (ADR-0125). The heading is the farthest plane,
        so it lags the panel it rides on — `1 - travel`, gone at the top, for
        the reason `<ContactStageCopy>` gives. */}
    <StageReveal
      tag="h2"
      unit="letter"
      className="absolute left-[2.0833vw] top-[2.0833vw] whitespace-nowrap font-display text-[17.9366vw] font-light leading-[0.9] text-stage-immersed-ink stacked:left-frame-gutter stacked:top-frame-gutter stacked:text-[15vw]"
      style={{
        transform: `translate3d(0, calc((1 - var(--closing-travel, 0)) * ${sceneConfig.closingParallax.heading}vw), 0)`,
      }}
    >
      {heading}
    </StageReveal>
  </StageFrame>
);

/** Over the canvas: the copy and the address. */
export const ContactStageCopy = ({
  content,
}: {
  content: Omit<ContactStageContent, "heading">;
}) => (
  <StageFrame>
    <StageBottom stack>
      {/* The nearest plane, so it travels furthest against the panel. Absolute
          and inset, so the children below keep positioning against the same box
          they always did — this only adds the offset.

          `1 - travel`: the offset belongs to the climb and must be **gone** at
          the top. Against the travel itself it was largest once the panel had
          landed, which left the copy resting 3.6vw above its designed foot —
          drifted in toward the middle of the screen, and that is the frame the
          reader actually sits and reads. */}
      <div
        className="absolute inset-0 stacked:static stacked:flex stacked:w-full stacked:flex-col stacked:items-start stacked:gap-4"
        style={{
          transform: `translate3d(0, calc((1 - var(--closing-travel, 0)) * ${sceneConfig.closingParallax.copy}vw), 0)`,
        }}
      >
        <StageReveal
          tag="p"
          className={`absolute left-[2.0833vw] top-[40.4167vw] whitespace-nowrap font-serif text-frame-lead leading-none text-stage-immersed-ink ${stackChild}`}
          style={stageRise(noteAt)}
        >
          {content.note}
        </StageReveal>

        <p
          className={`absolute left-[2.0833vw] top-[49.3056vw] w-[27.2222vw] font-sans text-frame-body leading-[1.1] text-stage-immersed-ink ${stackChild}`}
          style={stageRise(bodyAt)}
        >
          {content.body}
        </p>

        {/* The frame is `pointer-events-none`, like every stage frame; the
        address takes the pointer back for itself.

        On a phone the pill's design proportions — a 46vw plate with a 12vw
        indent — come to a 180px box with a 46px lead-in, which is neither a
        readable address nor a hittable control. It becomes a full-width pill
        with the address centred in it, which is the same object doing the same
        job at a size a thumb can use. */}
        <a
          href={`mailto:${content.email}`}
          className={`pointer-events-auto absolute left-[51.5278vw] top-[40.4167vw] flex h-[13.0556vw] w-[46.3889vw] items-center rounded-[34.7222vw] bg-stage-pill pl-[11.9444vw] font-serif text-frame-lead leading-none text-stage-pill-ink ${stackChild} stacked:h-[calc(var(--frame-control)*2)] stacked:justify-center stacked:rounded-full stacked:px-4 stacked:pl-4`}
          style={stageRise(addressAt)}
        >
          {/* The plate holds still and the address leans — a button that slides
              with the cursor comes loose from the layout and drags its own hover
              area out from under the pointer. `<Magnetic>` listens on this `a`
              and moves only the span.

              **No `overflow-hidden` to keep it in.** The lean is bounded at
              `pull` of the half-width — 73px against 172 of lead-in and as much
              again to spare on the right — so it cannot reach an edge, and a
              clip here would have to fight `leading-none` for the glyphs
              (hard rule #3). */}
          <Magnetic className="block will-change-transform">
            {content.email}
          </Magnetic>
        </a>
      </div>
    </StageBottom>
  </StageFrame>
);
