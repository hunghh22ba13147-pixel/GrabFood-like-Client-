import { CartItem } from '../../models/types';

/** Lựa chọn Size/Topping đã tick — khớp CartItem.selectedOptions trong models/types.ts */
export type SelectedOption = CartItem['selectedOptions'][number];

export interface CalcItemTotalPriceInput {
  dishPrice: number;
  extraPrices: number[];
  quantity: number;
}

export interface BuildCartItemInput {
  dish: CartItem['dish'];
  quantity: number;
  selectedOptions: SelectedOption[];
  note?: string;
}
