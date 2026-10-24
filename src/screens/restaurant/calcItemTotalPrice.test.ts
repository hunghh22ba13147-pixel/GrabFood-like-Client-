import { CartItem, Dish } from '../../models/types';
import { buildCartItem } from './buildCartItem';
import {
  calcItemTotalPrice,
  calcItemTotalPriceFromParts,
  createDefaultSelectedOptions,
} from './calcItemTotalPrice';
import { SelectedOption } from './restaurantMenuTypes';

const sampleDish: Dish = {
  id: 'r1-d1',
  restaurantId: 'r1',
  name: 'Trà sữa trân châu',
  description: 'Trà sữa truyền thống',
  price: 45000,
  group: 'Best seller',
  image: 'https://picsum.photos/seed/r1-d1/400/400',
  options: [
    {
      id: 'size',
      name: 'Size',
      required: true,
      multiple: false,
      choices: [
        { id: 'M', name: 'M', price: 0 },
        { id: 'L', name: 'L', price: 7000 },
      ],
    },
    {
      id: 'topping',
      name: 'Topping',
      required: false,
      multiple: true,
      choices: [
        { id: 'pearl-white', name: 'Trân châu trắng', price: 8000 },
        { id: 'pearl-black', name: 'Trân châu đen', price: 8000 },
        { id: 'pudding', name: 'Pudding', price: 10000 },
      ],
    },
  ],
};

const noOptionDish: Dish = {
  id: 'r4-d1',
  restaurantId: 'r4',
  name: 'Cơm sườn bì chả',
  description: 'Sườn nướng than',
  price: 55000,
  group: 'Món chính',
  image: 'https://picsum.photos/seed/r4-d1/400/400',
  options: [],
};

let failed = 0;

function assertEqual<T>(actual: T, expected: T, name: string): void {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failed += 1;
    console.error(`FAIL ${name}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
    return;
  }
  console.log(`PASS ${name}`);
}

function assertTrue(condition: boolean, name: string): void {
  assertEqual(condition, true, name);
}

const sizeM: SelectedOption[] = [{ optionId: 'size', choiceIds: ['M'] }];
const sizeL: SelectedOption[] = [{ optionId: 'size', choiceIds: ['L'] }];
const sizeLToppings: SelectedOption[] = [
  { optionId: 'size', choiceIds: ['L'] },
  { optionId: 'topping', choiceIds: ['pearl-white', 'pudding'] },
];

assertEqual(calcItemTotalPrice(sampleDish, sizeM, 1), 45000, 'giá gốc Size M x1');
assertEqual(calcItemTotalPrice(sampleDish, sizeL, 1), 52000, 'Size L cộng extraPrice 7000');
assertEqual(
  calcItemTotalPrice(sampleDish, sizeLToppings, 2),
  (45000 + 7000 + 8000 + 10000) * 2,
  'Size L + 2 topping * quantity',
);
assertEqual(calcItemTotalPrice(sampleDish, sizeM, 0), 0, 'quantity 0 ra 0');
assertEqual(
  calcItemTotalPrice(sampleDish, [{ optionId: 'size', choiceIds: ['unknown'] }], 1),
  45000,
  'choiceId không tồn tại bị bỏ qua',
);
assertEqual(calcItemTotalPrice(noOptionDish, [], 3), 165000, 'món không option');
assertEqual(
  calcItemTotalPriceFromParts({ dishPrice: 45000, extraPrices: [7000, 8000], quantity: 2 }),
  120000,
  'công thức (price + sum extraPrice) * quantity',
);
assertEqual(createDefaultSelectedOptions(sampleDish), [{ optionId: 'size', choiceIds: ['M'] }], 'mặc định Size bắt buộc');

const cartItem = buildCartItem({
  dish: sampleDish,
  quantity: 2,
  selectedOptions: sizeLToppings,
  note: ' Ít đá, 50% đường ',
});

const requiredCartItemKeys: Array<keyof CartItem> = [
  'key',
  'dish',
  'quantity',
  'selectedOptions',
  'unitPrice',
  'note',
];
for (const field of requiredCartItemKeys) {
  assertTrue(field in cartItem, `CartItem có trường ${field}`);
}

assertEqual(cartItem.dish, sampleDish, 'CartItem.dish giữ nguyên món');
assertEqual(cartItem.quantity, 2, 'CartItem.quantity');
assertEqual(cartItem.unitPrice, 70000, 'unitPrice = price + extra, chưa nhân quantity');
assertEqual(cartItem.unitPrice * cartItem.quantity, 140000, 'itemTotalPrice = unitPrice * quantity');
assertEqual(cartItem.note, 'Ít đá, 50% đường', 'ghi chú được trim');
assertEqual(
  cartItem.selectedOptions,
  [
    { optionId: 'size', choiceIds: ['L'] },
    { optionId: 'topping', choiceIds: ['pearl-white', 'pudding'] },
  ],
  'selectedOptions đã chuẩn hoá',
);
assertTrue(cartItem.key.startsWith('r1-d1|'), 'key bắt đầu bằng dishId');

const withoutNote = buildCartItem({
  dish: noOptionDish,
  quantity: 1,
  selectedOptions: [],
  note: '   ',
});
assertTrue(withoutNote.note === undefined, 'note rỗng không được gắn vào CartItem');

if (failed > 0) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log('\nAll calcItemTotalPrice / buildCartItem tests passed');
