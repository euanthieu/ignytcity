import { Product, ProductSize } from "../types";

export const SIZES: ProductSize[] = ["M", "L", "XL", "2XL"];

export const PRODUCTS: Product[] = [
  {
    id: "burn-bright",
    name: "Burn Bright Tee",
    tagline: "Carry the Fire",
    colorway: "Black",
    fit: "Oversized",
    price: 450,
    front: "/products/black-burn-bright-front.jpg",
    back: "/products/black-burn-bright-back.jpg",
    story:
      "Fuel the vision that lights the way. Igniting a generation to outshine the darkness.",
  },
  {
    id: "bete-difference",
    name: "Be The Difference Tee",
    tagline: "Where Darkness Has to End",
    colorway: "Espresso Brown",
    fit: "Oversized",
    price: 450,
    front: "/products/brown-difference-front.jpg",
    back: "/products/brown-difference-back.jpg",
    story: "A quiet chest mark up front, a statement across the back.",
  },
  {
    id: "ignyt-heart",
    name: "IGNYT City Heart Crop",
    tagline: "Ignyt a Fire So Bright",
    colorway: "Sand",
    fit: "Boxy Crop",
    price: 450,
    front: "/products/sand-ignyt-heart-front.jpg",
    back: "/products/sand-ignyt-heart-back.jpg",
    story: "Lighting the way for generations to see. Flame-heart back graphic.",
  },
  {
    id: "ignyt-tour",
    name: "IGNYT City Tour Tee",
    tagline: "Light a Fire for All",
    colorway: "Black",
    fit: "Boxy Crop",
    price: 450,
    front: "/products/washed-ignyt-tour-front.jpg",
    back: "/products/washed-ignyt-tour-back.jpg",
    story:
      "Tour-poster back graphic. Clean black with a glowing IGNYT CITY chest mark.",
  },
];

export const SIZE_CHART = {
  unit: "in",
  rows: [
    { size: "M", width: 22, length: 22, sleeves: 9.5 },
    { size: "L", width: 23, length: 23, sleeves: 10 },
    { size: "XL", width: 24, length: 24, sleeves: 10.5 },
    { size: "2XL", width: 25, length: 25, sleeves: 11 },
  ],
  fabric: [
    "American size, combed cotton",
    "Density: 220 GSM",
    "80% cotton / 20% poly",
    '"Styles meets affordability"',
  ],
};
