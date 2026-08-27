import { TxType } from './transaction';

export interface Category {
  id: string;
  name: string;
  type: TxType;
  color: string;
  icon: string; // emoji glyph
}
