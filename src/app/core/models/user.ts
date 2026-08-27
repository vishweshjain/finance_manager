export interface User {
  id: string;
  name: string;
  email: string;
  /** Mock only — never do this in production */
  password: string;
  currency: string;
  avatarColor: string;
  createdAt: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}
