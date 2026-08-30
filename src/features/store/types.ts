export type ProductSize = "M" | "L" | "XL" | "2XL";

export interface Product {
  id: string;
  name: string;
  tagline: string;
  colorway: string;
  fit: string;
  price: number;
  front: string;
  back: string;
  story: string;
}

export interface CartLine {
  productId: string;
  size: ProductSize;
  qty: number;
}
