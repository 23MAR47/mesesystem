/**
 * Home-page content, transcribed character-for-character from Figma
 * "Ternyon", frames "Concept 9. Block 1–6".
 * Placeholder data per obsidian/workflows/new-page.md step 7 — swap for a CMS
 * source when one is added.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface HeroProduct {
  /** Product name, rendered above the dimensions line. */
  name: string;
  /** Dimensions line, e.g. `32"W x 38"H`. */
  size: string;
  price: string;
}

export interface CategoryPreview {
  src: string;
  alt: string;
  /** Intrinsic pixels of the export — drives the plate's aspect ratio so the
   *  photograph is never cropped. */
  width: number;
  height: number;
}

export interface CatalogueCategory {
  label: string;
  count: string;
  /** The red band rests on this row when nothing is hovered (the comp state). */
  active?: boolean;
  /** Plate shown to the left of the list; absent where Figma has no node yet. */
  previewLeft?: CategoryPreview;
  /** Plate shown to the right of the list. */
  previewRight?: CategoryPreview;
}

export interface ProductFilter {
  label: string;
  active?: boolean;
}

export interface ProductCardData {
  /** Sequence label rendered over the image, e.g. `(01)`. */
  index: string;
  name: string;
  spec: string;
  badge: string;
  price: string;
  image: string;
  alt: string;
  /**
   * Figma crop of the source image inside the 326×438 plate, as CSS values.
   * Reproduced verbatim so the framing matches the comp.
   */
  crop: { width: string; height: string; left: string; top: string };
}

/** A tag's position inside the room plate, in rem at that comp's base width. */
export interface RoomHotspotSpot {
  left: string;
  top: string;
}

export interface RoomHotspotData {
  name: string;
  spec: string;
  /** Position inside the 1376×603 room plate, in rem at the 1440 base. */
  left: string;
  top: string;
  /** The comps re-place every tag, so each band carries its own coordinates. */
  at1024: RoomHotspotSpot;
  at768: RoomHotspotSpot;
  /** 390 shows the marks alone — coordinates are the circle's own top-left. */
  at390: RoomHotspotSpot;
  /**
   * Where the piece actually sits in the photograph, as a share of it. The tag
   * is placed for reading and the light is aimed at the furniture, so the two
   * are kept apart — a pill is as wide as its label and its middle lands well
   * to the side of the thing it names.
   */
  focus: { x: number; y: number };
}

export interface FooterColumn {
  heading: string;
  links: NavLink[];
}

/* -- Block 1 — hero ------------------------------------------------------- */

export const HERO_PRIMARY_NAV: NavLink[] = [
  { label: "Catalogue", href: "#" },
  { label: "Rooms", href: "#" },
  { label: "ABOUT", href: "#" },
  { label: "MATERIALS", href: "#" },
];

export const HERO_UTILITY_NAV: NavLink[] = [
  { label: "Search", href: "#" },
  { label: "Saved (3)", href: "#" },
  { label: "Bag (0)", href: "#" },
];

export const HERO_DINING_CHAIR: HeroProduct = {
  name: "dining chair",
  size: '32"W x 38"H',
  price: "$499.99",
};

export const HERO_MODULAR_SOFA: HeroProduct = {
  name: "modular sofa",
  size: '98"W x 38"H',
  price: "$2999.99",
};

/* -- Block 3 — catalogue -------------------------------------------------- */

export const CATALOGUE_CATEGORIES: CatalogueCategory[] = [
  {
    label: "All products",
    count: "152",
    // No dedicated frame — two items stand in for the whole catalogue.
    previewLeft: {
      src: "/assets/catalogue/beds-1.png",
      alt: "Beds — catalogue preview",
      width: 1134,
      height: 876,
    },
    previewRight: {
      src: "/assets/catalogue/mirrors-2.png",
      alt: "Mirrors — catalogue preview",
      width: 652,
      height: 876,
    },
  },
  {
    label: "Sofas",
    count: "12",
    previewLeft: {
      src: "/assets/catalogue/sofas-1.png",
      alt: "Sofas — catalogue preview",
      width: 634,
      height: 478,
    },
    previewRight: {
      src: "/assets/catalogue/sofas-2.png",
      alt: "Sofas — catalogue preview",
      width: 652,
      height: 876,
    },
  },
  {
    label: "Chairs",
    count: "34",
    active: true,
    previewLeft: {
      src: "/assets/catalogue/preview-left.png",
      alt: "Chairs — cream bouclé swivel armchair",
      width: 923,
      height: 698,
    },
    previewRight: {
      src: "/assets/catalogue/preview-right.png",
      alt: "Chairs — red lacquered dining chair",
      width: 609,
      height: 744,
    },
  },
  {
    label: "Tables",
    count: "21",
    previewLeft: {
      src: "/assets/catalogue/tables-1.png",
      alt: "Tables — catalogue preview",
      width: 652,
      height: 558,
    },
    previewRight: {
      src: "/assets/catalogue/tables-2.png",
      alt: "Tables — catalogue preview",
      width: 634,
      height: 478,
    },
  },
  {
    label: "Storage",
    count: "18",
    previewLeft: {
      src: "/assets/catalogue/storage-1.png",
      alt: "Storage — catalogue preview",
      width: 652,
      height: 582,
    },
    previewRight: {
      src: "/assets/catalogue/storage-2.png",
      alt: "Storage — catalogue preview",
      width: 634,
      height: 592,
    },
  },
  {
    label: "Beds",
    count: "9",
    previewLeft: {
      src: "/assets/catalogue/beds-1.png",
      alt: "Beds — catalogue preview",
      width: 1134,
      height: 876,
    },
    previewRight: {
      src: "/assets/catalogue/beds-2.png",
      alt: "Beds — catalogue preview",
      width: 1244,
      height: 876,
    },
  },
  {
    label: "Bedsides",
    count: "7",
    previewLeft: {
      src: "/assets/catalogue/bedsides-1.png",
      alt: "Bedsides — catalogue preview",
      width: 652,
      height: 530,
    },
    previewRight: {
      src: "/assets/catalogue/bedsides-2.png",
      alt: "Bedsides — catalogue preview",
      width: 634,
      height: 478,
    },
  },
  {
    label: "Lighting",
    count: "14",
    previewLeft: {
      src: "/assets/catalogue/lighting-1.png",
      alt: "Lighting — catalogue preview",
      width: 652,
      height: 658,
    },
    previewRight: {
      src: "/assets/catalogue/lighting-2.png",
      alt: "Lighting — catalogue preview",
      width: 652,
      height: 876,
    },
  },
  {
    label: "Mirrors",
    count: "11",
    previewLeft: {
      src: "/assets/catalogue/mirrors-1.png",
      alt: "Mirrors — catalogue preview",
      width: 652,
      height: 876,
    },
    previewRight: {
      src: "/assets/catalogue/mirrors-2.png",
      alt: "Mirrors — catalogue preview",
      width: 652,
      height: 876,
    },
  },
];

/* -- Block 4 — products --------------------------------------------------- */

export const PRODUCT_FILTERS: ProductFilter[] = [
  { label: "All (14)", active: true },
  { label: "Chairs (5)" },
  { label: "Tables (3)" },
  { label: "Seating (4)" },
  { label: "Storage (2)" },
];

export const PRODUCTS: ProductCardData[] = [
  {
    index: "(01)",
    name: "Elara Lounge Chair",
    spec: "Oiled oak, bouclé 12",
    badge: "Ships in 3 days",
    price: "€1,840",
    image: "/assets/products/elara-lounge-chair.png",
    alt: "Elara lounge chair in oiled oak with a bouclé seat",
    crop: { width: "118.31%", height: "100%", left: "-18.36%", top: "0%" },
  },
  {
    index: "(02)",
    name: "Ansel Dining Table",
    spec: "Solid ash, 220 cm",
    badge: "Ships in 3 days",
    price: "€3,120",
    image: "/assets/products/ansel-dining-table.png",
    alt: "Ansel oval dining table in solid ash",
    crop: { width: "107.19%", height: "106.21%", left: "-7.16%", top: "-3.1%" },
  },
  {
    index: "(03)",
    name: "Marlow Two-Seater",
    spec: "Walnut, wool 04",
    badge: "Ships in 5 days",
    price: "€4,460",
    image: "/assets/products/marlow-two-seater.png",
    alt: "Marlow two-seater sofa upholstered in red wool",
    crop: {
      width: "167.95%",
      height: "144.47%",
      left: "-30.48%",
      top: "-44.47%",
    },
  },
  {
    index: "(04)",
    name: "Vega Sideboard",
    spec: "Smoked oak, brass",
    badge: "Last one",
    price: "€2,290",
    image: "/assets/products/vega-sideboard.png",
    alt: "Vega sideboard in smoked oak with brass detailing",
    crop: { width: "108.3%", height: "107.31%", left: "-5.24%", top: "-3.2%" },
  },
];

/* -- Block 5 — room ------------------------------------------------------- */

export const ROOM_HOTSPOTS: RoomHotspotData[] = [
  {
    name: "Pendant Lamp",
    spec: "Enamel & steel — €410",
    left: "21.125rem",
    top: "4.3125rem",
    at1024: { left: "14.75rem", top: "3.4375rem" },
    at768: { left: "11rem", top: "2.0625rem" },
    at390: { left: "3.5rem", top: "0.09375rem" },
    focus: { x: 0.205, y: 0.275 },
  },
  {
    name: "Table Lamp",
    spec: "Glossy ceramic — €185",
    left: "38rem",
    top: "9.5625rem",
    at1024: { left: "26.5rem", top: "7.625rem" },
    at768: { left: "19.875rem", top: "5rem" },
    at390: { left: "8.9375rem", top: "1.625rem" },
    focus: { x: 0.413, y: 0.39 },
  },
  {
    name: "Ansel Dining Table",
    spec: "Solid ash, 220 cm — €3,120",
    left: "20.75rem",
    top: "18.5625rem",
    at1024: { left: "14.5rem", top: "14.75rem" },
    at768: { left: "3.75rem", top: "14.1875rem" },
    at390: { left: "3.4375rem", top: "4.5rem" },
    focus: { x: 0.22, y: 0.58 },
  },
  {
    name: "Sofa",
    spec: "Upholstered in fabric — €2.950",
    left: "60.75rem",
    top: "15.5rem",
    at1024: { left: "42.375rem", top: "12.3125rem" },
    at768: { left: "31.6875rem", top: "9.1875rem" },
    at390: { left: "16.1875rem", top: "3.5rem" },
    focus: { x: 0.8, y: 0.62 },
  },
  {
    name: "Ansel Dining Chair",
    spec: "Solid oak, woven seat — €640",
    left: "35.1875rem",
    top: "30.5rem",
    at1024: { left: "24.5625rem", top: "22.625rem" },
    at768: { left: "18.3125rem", top: "16.4375rem" },
    at390: { left: "8.0625rem", top: "8.3125rem" },
    focus: { x: 0.33, y: 0.67 },
  },
];

export const ROOM_CAPTION = "Apartment, Christianshavn — photographed May 2026";
export const ROOM_COUNTER = "01 / 06   ← →";

/* -- Block 6 — footer ----------------------------------------------------- */

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Shop",
    links: [
      { label: "Catalogue", href: "#" },
      { label: "In stock now", href: "#" },
      { label: "Gift cards", href: "#" },
      { label: "Trade & contract", href: "#" },
    ],
  },
  {
    heading: "Workshop",
    links: [
      { label: "Our story", href: "#" },
      { label: "Materials", href: "#" },
      { label: "Repairs", href: "#" },
      { label: "Journal", href: "#" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Delivery", href: "#" },
      { label: "Returns", href: "#" },
      { label: "Care guide", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

export const FOOTER_LEGAL = [
  "Halden Møbler ApS  ·  Refshalevej 88, 1432 København K  ·  +45 32 96 11 04",
  "© 2026  ·  Made in Denmark, mostly by hand",
];

export const FOOTER_SOCIAL = "Instagram  ·  Pinterest  ·  hello@halden.dk";
