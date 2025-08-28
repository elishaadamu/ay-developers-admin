export interface User {
  id?: number;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photo?: string;
  role: "manager" | "ambassador" | "user";
  status: "Active" | "Suspended" | "Inactive";
  suspended: boolean;
  createdAt: string; // Standardize on createdAt
  performance?: {
    totalSales: number;
    totalCommission: number;
    activeClients: number;
  };
}
