import type { auth } from "../auth";

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
export type AuthSessionData = NonNullable<AuthSession>;
