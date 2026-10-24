import { Dish } from '../../models/types';
import { CalcItemTotalPriceInput, SelectedOption } from './restaurantMenuTypes';

/**
 * extraPrice trong kế hoạch = field `price` của từng choice (models/types.ts).
 * itemTotalPrice = (dish.price + tổng extraPrice) * quantity
 */
export function sumExtraPrice(extraPrices: number[]): number {
  return extraPrices.reduce((sum, extraPrice) => sum + extraPrice, 0);
}

export function calcItemTotalPriceFromParts(input: CalcItemTotalPriceInput): number {
  const quantity = Math.max(0, input.quantity);
  return (input.dishPrice + sumExtraPrice(input.extraPrices)) * quantity;
}

export function collectExtraPrices(dish: Dish, selectedOptions: SelectedOption[]): number[] {
  const extraPrices: number[] = [];
  for (const selected of selectedOptions) {
    const option = dish.options.find((item) => item.id === selected.optionId);
    if (!option) continue;
    for (const choiceId of selected.choiceIds) {
      const choice = option.choices.find((item) => item.id === choiceId);
      if (choice) extraPrices.push(choice.price);
    }
  }
  return extraPrices;
}

export function calcItemTotalPrice(
  dish: Dish,
  selectedOptions: SelectedOption[],
  quantity: number,
): number {
  return calcItemTotalPriceFromParts({
    dishPrice: dish.price,
    extraPrices: collectExtraPrices(dish, selectedOptions),
    quantity,
  });
}

export function calcUnitPrice(dish: Dish, selectedOptions: SelectedOption[]): number {
  return dish.price + sumExtraPrice(collectExtraPrices(dish, selectedOptions));
}

export function getMissingRequiredOptionNames(
  dish: Dish,
  selectedOptions: SelectedOption[],
): string[] {
  return dish.options
    .filter((option) => option.required)
    .filter((option) => {
      const selected = selectedOptions.find((item) => item.optionId === option.id);
      return !selected || selected.choiceIds.length === 0;
    })
    .map((option) => option.name);
}

export function createDefaultSelectedOptions(dish: Dish): SelectedOption[] {
  return dish.options
    .filter((option) => option.required && !option.multiple && option.choices.length > 0)
    .map((option) => ({
      optionId: option.id,
      choiceIds: [option.choices[0].id],
    }));
}

export function toggleSelectedChoice(
  selectedOptions: SelectedOption[],
  optionId: string,
  choiceId: string,
  multiple: boolean,
): SelectedOption[] {
  const current = selectedOptions.find((item) => item.optionId === optionId);
  if (!multiple) {
    const next: SelectedOption = { optionId, choiceIds: [choiceId] };
    if (!current) return [...selectedOptions, next];
    return selectedOptions.map((item) => (item.optionId === optionId ? next : item));
  }

  const choiceIds = current ? [...current.choiceIds] : [];
  const index = choiceIds.indexOf(choiceId);
  if (index >= 0) choiceIds.splice(index, 1);
  else choiceIds.push(choiceId);

  if (!current) {
    return choiceIds.length === 0 ? selectedOptions : [...selectedOptions, { optionId, choiceIds }];
  }
  if (choiceIds.length === 0) {
    return selectedOptions.filter((item) => item.optionId !== optionId);
  }
  return selectedOptions.map((item) => (item.optionId === optionId ? { optionId, choiceIds } : item));
}
