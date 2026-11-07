/**
 * `flank` — the object sits centre frame, so copy splits into two
 *           columns that hug the outer edges and leave it a gutter.
 * `left`   — the object has moved to the right, so copy claims the
 *           whole left half.
 * `right`  — the mirror of it: the object is on the left and the copy
 *           takes the right half.
 */
export type SectionLayout = "flank" | "left" | "right";

export interface Cta {
  label: string;
  variant: "primary" | "ghost";
}

export interface Stat {
  value: string;
  label: string;
}

export interface SectionContent {
  id: string;
  index: string;
  eyebrow: string;
  /** explicit line breaks — the display type is set, not flowed */
  title: string[];
  body: string;
  /** small mono footnote under the body */
  note?: string;
  ctas?: Cta[];
  stats?: Stat[];
  layout: SectionLayout;
}

export const SECTIONS: SectionContent[] = [
  {
    id: "instrument",
    index: "01",
    eyebrow: "Aperture — an instrument of light",
    title: ["Everything you", "remember arrived", "through glass"],
    body: "Eleven elements, one plane of silicon, and a shutter that decides what the world was for four thousandths of a second. Here is that machine, and here is every piece of it.",
    ctas: [
      { label: "Take it apart", variant: "primary" },
      { label: "The optical thesis", variant: "ghost" },
    ],
    layout: "left",
  },
  {
    id: "disassembly",
    index: "02",
    eyebrow: "Disassembly",
    title: ["Nothing here", "is decoration"],
    body: "Every ring, every contact, every sprung washer exists to hold a piece of glass exactly where it must be — and to keep holding it through heat, rain and ten years of being put down too hard.",
    note: "Exploded view — 57 assemblies",
    stats: [
      { value: "57", label: "Parts" },
      { value: "11", label: "Elements" },
      { value: "0.02", label: "mm tolerance" },
    ],
    layout: "flank",
  },
  {
    id: "optics",
    index: "03",
    eyebrow: "The optical group",
    title: ["Light does not", "bend willingly"],
    body: "Eleven elements in eight groups. Two ground from extra-low-dispersion glass, one aspherical, all of them coated to give back less than half a percent of what strikes them. The barrel exists only to stop them arguing.",
    stats: [
      { value: "f/1.2", label: "Maximum" },
      { value: "9", label: "Blades" },
      { value: "0.4%", label: "Reflectance" },
    ],
    layout: "left",
  },
  {
    id: "chassis",
    index: "04",
    eyebrow: "The chassis",
    title: ["A body built", "to be forgotten"],
    body: "Magnesium where it has to be rigid, glass where it has to be honest. Sealed at twelve points against the weather that would otherwise end the afternoon. You should never once think about it.",
    note: "Flange depth — 20 mm / sealed at 12 points",
    layout: "flank",
  },
  {
    id: "core",
    index: "05",
    eyebrow: "The core",
    title: ["Silicon holds", "still for light"],
    body: "A full-frame sensor, back-illuminated: forty-five million wells waiting to be filled. Behind it, a board that empties all of them in eight milliseconds and never mentions it again.",
    stats: [
      { value: "45.7", label: "Megapixels" },
      { value: "8ms", label: "Readout" },
      { value: "15", label: "Stops" },
    ],
    layout: "right",
  },
  {
    id: "system",
    index: "06",
    eyebrow: "The system",
    title: ["Then it closes,", "and it is simply", "a camera"],
    body: "Assembled, it disappears into the hand. Every control has already been found by the finger that needed it. The screen shows you what you asked for and nothing you didn't.",
    ctas: [
      { label: "Reserve a body", variant: "primary" },
      { label: "Full specification", variant: "ghost" },
    ],
    layout: "flank",
  },
];

export const NAV_LINKS = ["Optics", "Bodies", "System", "Journal"];

/* ------------------------------------------------------------------ *
 * Feature callouts
 *
 * `anchor` is a point in the camera's *local* space — the rig projects
 * it through whatever transform the section has put the model under, so
 * a label stays welded to its part through the rotation in §06.
 * `side` is which way the leader line runs out of the dot.
 * ------------------------------------------------------------------ */

export interface Annotation {
  id: string;
  /** section index this callout belongs to */
  section: number;
  anchor: [number, number, number];
  label: string;
  value: string;
  side: "left" | "right";
}

export const ANNOTATIONS: Annotation[] = [
  // §03 — optics
  {
    id: "front-element",
    section: 2,
    anchor: [0, 0.22, 1.16],
    label: "Front element",
    value: "ø82 · ED glass",
    side: "left",
  },
  {
    id: "focus-ring",
    section: 2,
    anchor: [0.26, 0.1, 0.7],
    label: "Focus ring",
    value: "Linear · 120°",
    side: "right",
  },
  {
    id: "coating",
    section: 2,
    anchor: [-0.22, -0.15, 1.0],
    label: "Coating stack",
    value: "11 layers",
    side: "left",
  },
  {
    id: "bayonet",
    section: 2,
    anchor: [0.08, -0.24, 0.3],
    label: "Bayonet",
    value: "12 contacts",
    side: "right",
  },

  // §04 — chassis
  {
    id: "prism",
    section: 3,
    anchor: [0.05, 0.8, 0.02],
    label: "Pentaprism",
    value: "0.78× · 100%",
    side: "right",
  },
  {
    id: "top-plate",
    section: 3,
    anchor: [-0.44, 0.58, -0.08],
    label: "Top plate",
    value: "Magnesium",
    side: "left",
  },
  {
    id: "grip",
    section: 3,
    anchor: [-0.8, -0.12, 0.12],
    label: "Grip",
    value: "Sealed · 12 pts",
    side: "left",
  },
  {
    id: "flange",
    section: 3,
    anchor: [0.42, -0.4, 0.26],
    label: "Flange",
    value: "20 mm",
    side: "right",
  },

  // §05 — core
  {
    id: "sensor",
    section: 4,
    anchor: [0, 0.14, 0.12],
    label: "Sensor",
    value: "45.7 MP BSI",
    side: "left",
  },
  {
    id: "board",
    section: 4,
    anchor: [0.44, -0.26, -0.1],
    label: "Logic board",
    value: "8 ms readout",
    side: "left",
  },
  {
    id: "cell",
    section: 4,
    anchor: [-0.62, -0.32, -0.02],
    label: "Cell",
    value: "2 300 frames",
    side: "left",
  },

  // §06 — system, seen from behind
  {
    id: "display",
    section: 5,
    anchor: [0.08, 0.0, -0.34],
    label: "Rear display",
    value: '3.2" · 2.1 M',
    side: "right",
  },
  {
    id: "mode-dial",
    section: 5,
    anchor: [0.48, 0.66, -0.04],
    label: "Mode dial",
    value: "Nine stops",
    side: "right",
  },
  {
    id: "eyecup",
    section: 5,
    anchor: [0.02, 0.44, -0.36],
    label: "Eyecup",
    value: "−3 to +1 dpt",
    side: "left",
  },
  {
    id: "selector",
    section: 5,
    anchor: [0.5, -0.16, -0.32],
    label: "Selector",
    value: "Eight-way",
    side: "right",
  },
  {
    id: "command",
    section: 5,
    anchor: [-0.52, 0.61, 0.1],
    label: "Command dial",
    value: "Front · click",
    side: "left",
  },
];
