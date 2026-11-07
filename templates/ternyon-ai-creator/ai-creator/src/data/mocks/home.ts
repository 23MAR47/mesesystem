/**
 * Placeholder content for the home view.
 *
 * Components never hardcode copy or media paths (see component-conventions.md);
 * they receive them from here via props. Replace these values with the real
 * content — nothing in the scene code needs to change.
 */

export const homeMocks = {
  hero: {
    name: "Elena Mirgut",
    claim: "Ads that look like a friend filmed them. Nobody did.",
    summary:
      "Vertical video for brands that need forty versions of one idea by Friday — hooks, demos, unboxings, and the testimonial that finally converts.",
    notes: ["/ Batch — 40 variants", "/ from €1,800"] as const,
    action: { label: "Book a batch", href: "#book" },
    aside: { label: "See recent runs", href: "#work" },
  },

  immersed: {
    headingTop: "One face,",
    headingBottom: "Four hundred takes",
    claims: [
      "Every face is licensed and disclosed",
      "Brands get the paperwork with the files",
    ] as const,
    stats: [
      {
        value: "3 days",
        body: "From approved brief to the first cut in your Drive.",
      },
      { value: "40", body: "Variants per batch, built from five concepts." },
      { value: "9", body: "Languages, lip-synced, one recognisable voice." },
    ],
    links: ["Method", "Deliverables", "Process", "Rates"] as const,
    action: { label: "Book a batch", href: "#book" },
  },

  delivery: {
    headingLeft: "What lands",
    headingRight: "in your Drive",
    lines: [
      { label: "/ Masters in three crops", left: 2.0833, top: 45.4167 },
      { label: "/ Captions in two styles", left: 2.0833, top: 47.6389 },
      { label: "/ Five hooks per concept", left: 8.75, top: 49.8611 },
      { label: "/ Voice and B-roll, unlocked", left: 8.8194, top: 52.0833 },
    ],
    note: "Files stay yours. Paid, organic, affiliates — no extra licence, no per-view fee.",
    links: ["Method", "Deliverables", "Process", "Rates"] as const,
    action: { label: "Book a batch", href: "#book" },
  },

  stage: {
    /** The section's heading. Announced to assistive technology, and the only
     *  text describing the canvas — replace it with the real hero copy. */
    label: "A 3D portrait scan on a white studio stage",
    posterSrc: "/assets/hero/model-poster.webp",
    /** The same bust cut out on transparency, its foot dissolved into the
     *  accent — captured from the scene for the closing screen (ADR-0125). */
    cutoutSrc: "/assets/hero/model-cutout.webp",
    cutoutSize: { width: 1300, height: 1872 },
    /** The second and third screens as stills, for the lite path: captured
     *  from the scene at phone aspect with each stage fully arrived (ADR-0126). */
    stills: {
      immersed: { src: "/assets/hero/immersed-still.webp", width: 880, height: 1912 },
      delivery: { src: "/assets/hero/delivery-still.webp", width: 880, height: 1912 },
    },
  },

  process: {
    steps: [
      {
        name: "Brief",
        body: "Send the product, the offer, and whatever you are already running. Thirty minutes, no deck.",
        left: 2.0833,
        align: "left",
      },
      {
        name: "Build",
        body: "I write the hooks and generate the creator. You sign off the face and the voice before anything is rendered.",
        left: 36.1111,
        align: "center",
      },
      {
        name: "Batch",
        body: "Forty variants arrive. You run them, we keep what wins, the rest gets cut next round.",
        left: 70.1389,
        align: "right",
      },
    ],
    rules: [32.9861, 67.0139],
    links: ["Method", "Deliverables", "Process", "Rates"] as const,
    action: { label: "Book a batch", href: "#book" },
  },

  gallery: {
    /** Never rendered visibly — the strip carries no UI. Names the section for
     *  assistive technology and keeps the heading outline intact. */
    heading: "Selected work",
    /**
     * The strip's artwork. `title` is never drawn — it is the card's accessible
     * name, so each one describes what is *in* the frame rather than repeating
     * the section's heading, and none of them claims a client the picture
     * cannot evidence.
     *
     * Ordered so neighbours differ: studio, then editorial, then outdoors, and
     * round again. The reader sees two or three at a time, and a run of similar
     * frames reads as one long picture rather than as separate work.
     */
    items: [
      {
        id: "work-01",
        title: "Studio shot in a maroon Nike Pro two-piece",
        src: "/assets/gallery/work-01.png",
      },
      {
        id: "work-02",
        title: "Portrait in a white Dior crop top against a bare wall",
        src: "/assets/gallery/work-02.png",
      },
      {
        id: "work-03",
        title: "Drinking from a coconut under palms in full sun",
        src: "/assets/gallery/work-03.png",
      },
      {
        id: "work-04",
        title: "Full-length lookbook shot in an olive linen set",
        src: "/assets/gallery/work-04.png",
      },
      {
        id: "work-05",
        title: "Seated with headphones beside a red exercise ball",
        src: "/assets/gallery/work-05.png",
      },
      {
        id: "work-06",
        title: "Portrait in a black slip dress in a lamplit room",
        src: "/assets/gallery/work-06.png",
      },
      {
        id: "work-07",
        title: "Waist-deep in the sea at dusk in an open shirt",
        src: "/assets/gallery/work-07.png",
      },
    ],
  },

  contact: {
    heading: "Book a batch",
    note: "Two slots left in October.",
    body: "Tell me the product and the offer, and three hooks come back the same week — before any money moves.",
    email: "hello@elenamirgut.com",
  },
} as const;
