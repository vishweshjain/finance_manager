import { Category } from '../models/category';
import { Transaction } from '../models/transaction';
import { Budget } from '../models/budget';
import { uid } from '../utils/id.util';
import { currentMonthKey, lastMonths, monthKeyFromISO, toISODate } from '../utils/date.util';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_salary', name: 'Salary', type: 'income', color: '#10b981', icon: '💼' },
  { id: 'cat_freelance', name: 'Freelance', type: 'income', color: '#14b8a6', icon: '🧑‍💻' },
  { id: 'cat_investment', name: 'Investments', type: 'income', color: '#3b82f6', icon: '📈' },
  { id: 'cat_gift', name: 'Gifts', type: 'income', color: '#8b5cf6', icon: '🎁' },

  { id: 'cat_food', name: 'Food & Dining', type: 'expense', color: '#ef4444', icon: '🍔' },
  { id: 'cat_transport', name: 'Transport', type: 'expense', color: '#f59e0b', icon: '🚗' },
  { id: 'cat_shopping', name: 'Shopping', type: 'expense', color: '#ec4899', icon: '🛍️' },
  { id: 'cat_bills', name: 'Bills & Utilities', type: 'expense', color: '#6366f1', icon: '🧾' },
  { id: 'cat_entertainment', name: 'Entertainment', type: 'expense', color: '#0ea5e9', icon: '🎬' },
  { id: 'cat_health', name: 'Health', type: 'expense', color: '#22c55e', icon: '💊' },
  { id: 'cat_home', name: 'Home', type: 'expense', color: '#a855f7', icon: '🏠' },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Build a realistic-looking set of transactions across recent months. */
export function seedTransactions(): Transaction[] {
  const months = lastMonths(6);
  const expenses: Array<[string, number, string]> = [
    ['Grocery shopping', 64, 'cat_food'],
    ['Lunch with team', 18, 'cat_food'],
    ['Monthly metro pass', 45, 'cat_transport'],
    ['Fuel', 52, 'cat_transport'],
    ['New running shoes', 89, 'cat_shopping'],
    ['Electricity bill', 73, 'cat_bills'],
    ['Internet', 39, 'cat_bills'],
    ['Movie night', 26, 'cat_entertainment'],
    ['Pharmacy', 22, 'cat_health'],
    ['Home supplies', 58, 'cat_home'],
    ['Coffee & snacks', 14, 'cat_food'],
    ['Online subscription', 12, 'cat_entertainment'],
  ];
  const incomes: Array<[string, number, string]> = [
    ['Monthly salary', 4200, 'cat_salary'],
    ['Freelance project', 650, 'cat_freelance'],
    ['Dividend payout', 120, 'cat_investment'],
    ['Birthday gift', 50, 'cat_gift'],
  ];

  const txns: Transaction[] = [];
  months.forEach((m, mi) => {
    const [y, mo] = m.split('-').map(Number);
    // a couple of incomes
    const incCount = mi === months.length - 1 ? 2 : 1 + (mi % 2);
    for (let i = 0; i < incCount; i++) {
      const [title, amount, categoryId] = pick(incomes);
      txns.push(makeTxn(title, amount, 'income', categoryId, y, mo));
    }
    // several expenses
    const expCount = 6 + (mi % 4);
    for (let i = 0; i < expCount; i++) {
      const [title, amount, categoryId] = pick(expenses);
      txns.push(makeTxn(title, amount, 'expense', categoryId, y, mo));
    }
  });
  return txns.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function makeTxn(
  title: string,
  amount: number,
  type: Transaction['type'],
  categoryId: string,
  y: number,
  mo: number
): Transaction {
  const day = 1 + Math.floor(Math.random() * 27);
  const date = toISODate(new Date(y, mo - 1, day));
  return {
    id: uid('txn'),
    title,
    amount: type === 'income' ? amount : amount,
    type,
    categoryId,
    date,
    note: '',
    createdAt: new Date().toISOString(),
  };
}

export function seedBudgets(): Budget[] {
  const month = currentMonthKey();
  return [
    { id: uid('bg'), categoryId: 'all', limit: 3000, month },
    { id: uid('bg'), categoryId: 'cat_food', limit: 500, month },
    { id: uid('bg'), categoryId: 'cat_transport', limit: 200, month },
    { id: uid('bg'), categoryId: 'cat_shopping', limit: 300, month },
    { id: uid('bg'), categoryId: 'cat_bills', limit: 250, month },
    { id: uid('bg'), categoryId: 'cat_entertainment', limit: 150, month },
  ];
}

export function findCategoryColor(categories: Category[], id: string): string {
  return categories.find((c) => c.id === id)?.color ?? '#64748b';
}
export function findCategoryName(categories: Category[], id: string): string {
  return categories.find((c) => c.id === id)?.name ?? 'Uncategorized';
}

export { monthKeyFromISO };
