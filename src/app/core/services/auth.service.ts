import { Injectable, computed, inject, signal } from '@angular/core';
import { User, AuthResult } from '../models/user';
import { StorageService, STORAGE_KEYS } from './storage.service';
import { uid } from '../utils/id.util';

const AVATAR_COLORS = ['#4f46e5', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#0ea5e9'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(StorageService);

  private readonly _users = signal<User[]>(
    this.storage.getArray<User>(STORAGE_KEYS.users)
  );
  private readonly _current = signal<User | null>(
    this.storage.get<User | null>(STORAGE_KEYS.session, null)
  );

  readonly currentUser = this._current.asReadonly();
  readonly isAuthenticated = computed(() => this._current() !== null);

  constructor() {
    if (this._users().length === 0) {
      const demo: User = {
        id: uid('usr'),
        name: 'Alex Morgan',
        email: 'demo@finance.app',
        password: 'demo1234',
        currency: 'USD',
        avatarColor: '#4f46e5',
        createdAt: new Date().toISOString(),
      };
      this._users.set([demo]);
      this.persistUsers();
    }
  }

  login(email: string, password: string): AuthResult {
    const user = this._users().find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!user || user.password !== password) {
      return { ok: false, error: 'Invalid email or password.' };
    }
    this._current.set(user);
    this.storage.set(STORAGE_KEYS.session, user);
    return { ok: true };
  }

  register(payload: {
    name: string;
    email: string;
    password: string;
    currency: string;
  }): AuthResult {
    const email = payload.email.trim().toLowerCase();
    if (this._users().some((u) => u.email.toLowerCase() === email)) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    const user: User = {
      id: uid('usr'),
      name: payload.name.trim(),
      email,
      password: payload.password,
      currency: payload.currency,
      avatarColor: AVATAR_COLORS[this._users().length % AVATAR_COLORS.length],
      createdAt: new Date().toISOString(),
    };
    this._users.update((list) => [...list, user]);
    this._current.set(user);
    this.persistUsers();
    this.storage.set(STORAGE_KEYS.session, user);
    return { ok: true };
  }

  logout(): void {
    this._current.set(null);
    this.storage.remove(STORAGE_KEYS.session);
  }

  updateProfile(data: Partial<Pick<User, 'name' | 'currency' | 'avatarColor'>>): void {
    const current = this._current();
    if (!current) return;
    const updated = { ...current, ...data };
    this._current.set(updated);
    this._users.update((list) =>
      list.map((u) => (u.id === updated.id ? updated : u))
    );
    this.persistUsers();
    this.storage.set(STORAGE_KEYS.session, updated);
  }

  private persistUsers(): void {
    this.storage.set(STORAGE_KEYS.users, this._users());
  }
}
