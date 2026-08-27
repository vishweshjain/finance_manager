export interface Budget {
  id: string;
  /** Category id, or 'all' for the overall monthly budget */
  categoryId: string;
  limit: number;
  /** Target month in YYYY-MM format */
  month: string;
}
