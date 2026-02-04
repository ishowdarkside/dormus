export const BillStatusNotPaid = "not_paid";
export const BillStatusPaid = "paid";
export interface Bill {
  id: number;
  name: string;
  due_date: Date;
  created_at: Date;
  creator_id: number;
  family_id: number;
  price: number;
  status: string;
}
