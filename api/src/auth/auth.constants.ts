export const ROLES = ["STUDENT", "TEACHER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];
