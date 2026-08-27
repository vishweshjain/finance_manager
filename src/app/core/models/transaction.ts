export type TxType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TxType;
  categoryId: string;
  date: string; // ISO date (yyyy-mm-dd)
  note?: string;
  createdAt: string;
}
