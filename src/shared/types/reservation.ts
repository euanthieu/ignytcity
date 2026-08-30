export type ReservationStatus =
  "RESERVED" | "CONSUMED" | "EXPIRED" | "RELEASED";

export interface InventoryReservation {
  id: string;
  inventoryId: string;
  buyerId: string;
  cartId?: string | null;
  orderId?: string | null;
  quantity: number;
  status: ReservationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}
