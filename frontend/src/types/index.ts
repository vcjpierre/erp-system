export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
export type CompanyStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "TRIAL";
export type BranchStatus = "ACTIVE" | "INACTIVE" | "CLOSED";

export interface Company {
  id: string;
  legalName: string;
  tradeName: string;
  taxId: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  status: CompanyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  status: UserStatus;
  isSuperAdmin: boolean;
  lastLoginAt?: string;
  companyId: string;
  roleId: string;
  company?: Company;
  role?: Role;
  branches?: UserBranch[];
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  companyId: string;
  rolePermissions?: RolePermission[];
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  granted: boolean;
  permission: Permission;
}

export interface Permission {
  id: string;
  module: ModuleName;
  action: ActionType;
  description?: string;
}

export type ModuleName = "FINANCE" | "SALES" | "INVENTORY" | "HR" | "PRODUCTION" | "PROJECTS" | "PURCHASES" | "REPORTS" | "SETTINGS" | "USERS" | "COMPANIES";
export type ActionType = "CREATE" | "UPDATE" | "DELETE" | "READ" | "EXPORT" | "IMPORT" | "APPROVE" | "REJECT" | "LOGIN" | "LOGOUT";

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  status: BranchStatus;
  isDefault: boolean;
  companyId: string;
  createdAt: string;
}

export interface UserBranch {
  userId: string;
  branchId: string;
  branch: Branch;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isDefault: boolean;
  isActive: boolean;
  companyId: string;
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
  type: string;
  isActive: boolean;
  companyId: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  isActive: boolean;
  companyId: string;
  branchId: string;
  branch?: Branch;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
  meta?: Record<string, unknown>;
}
