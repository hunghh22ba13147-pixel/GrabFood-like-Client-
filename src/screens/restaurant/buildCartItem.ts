import { CartItem } from '../../models/types';
import { calcUnitPrice } from './calcItemTotalPrice';
import { BuildCartItemInput, SelectedOption } from './restaurantMenuTypes';

function normalizeSelectedOptions(selectedOptions: SelectedOption[]): SelectedOption[] {
  return selectedOptions
    .map((item) => ({
      optionId: item.optionId,
      choiceIds: [...item.choiceIds].sort(),
    }))
    .filter((item) => item.choiceIds.length > 0)
    .sort((a, b) => a.optionId.localeCompare(b.optionId));
}

export function makeCartItemKey(dishId: string, selectedOptions: SelectedOption[]): string {
  const normalized = normalizeSelectedOptions(selectedOptions);
  return dishId + '|' + JSON.stringify(normalized.map((item) => [item.optionId, item.choiceIds]));
}

/** Đóng gói đúng 100% các trường CartItem trong src/models/types.ts */
export function buildCartItem(input: BuildCartItemInput): CartItem {
  const selectedOptions = normalizeSelectedOptions(input.selectedOptions);
  const note = input.note?.trim();
  const cartItem: CartItem = {
    key: makeCartItemKey(input.dish.id, selectedOptions),
    dish: input.dish,
    quantity: input.quantity,
    selectedOptions,
    unitPrice: calcUnitPrice(input.dish, selectedOptions),
  };
  if (note) cartItem.note = note;
  return cartItem;
}
