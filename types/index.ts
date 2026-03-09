export type FieldType =
  | "text"
  | "email"
  | "number"
  | "url"
  | "textarea"
  | "select"
  | "checkbox"
  | "date"
  | "logo";

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for select fields
  order: number;
}

export interface FormSchema {
  _id?: string;
  ownerId?: string;
  name: string;
  description?: string;
  fields: FormField[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FormSubmission {
  _id?: string;
  ownerId?: string;
  formId: string;
  formName: string;
  data: Record<string, unknown>;
  submittedAt?: string;
}

export interface LogoData {
  url: string;
  domain: string;
  name?: string;
}

export const APP_PERMISSIONS = [
  "forms:create",
  "forms:read",
  "forms:update",
  "forms:delete",
  "submissions:create",
  "submissions:read",
  "submissions:update",
  "submissions:delete",
  "users:manage",
  "notifications:read",
] as const;

export type Permission = (typeof APP_PERMISSIONS)[number];

export type UserRole = "super_admin" | "admin" | "user";

export interface AppUser {
  _id?: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppNotification {
  _id?: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionUser {
  userId: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}
