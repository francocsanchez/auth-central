export const appRoleValues = ["admin", "user", "viewer"] as const;

export type AppRole = (typeof appRoleValues)[number];

export type ApplicationRecord = {
  id?: string;
  key: string;
  name: string;
  url?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserApplicationAccessRecord = {
  id?: string;
  userId: string;
  appKey: string;
  role: AppRole;
  createdAt: Date;
  updatedAt: Date;
};

export type CentralSessionPayload = {
  user: {
    id: string;
    name: string | null;
    email: string;
    isActive: boolean;
    isCentralAdmin: boolean;
  };
  session: {
    id: string;
    expiresAt: string;
  };
  access: Array<{
    appKey: string;
    role: AppRole;
  }>;
};
