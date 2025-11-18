/* global localStorage, fetch, crypto */
const STORAGE_KEY = 'notes:v1';

function nowISO() {
  return new Date().toISOString();
}

function safeUuid() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Note shape:
 * { id: string, title: string, content: string, createdAt: string, updatedAt: string }
 */

/* Local repository */
class LocalNotesRepository {
  constructor() {
    this.key = STORAGE_KEY;
    this._ensure();
  }
  _ensure() {
    const raw = localStorage.getItem(this.key);
    if (!raw) localStorage.setItem(this.key, JSON.stringify([]));
  }
  _read() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  _write(notes) {
    localStorage.setItem(this.key, JSON.stringify(notes));
  }
  // PUBLIC_INTERFACE
  async list() {
    /** Return notes sorted by updatedAt desc. */
    const notes = this._read();
    notes.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    return notes;
  }
  // PUBLIC_INTERFACE
  async create(note) {
    /** Create a note locally. */
    const id = safeUuid();
    const ts = nowISO();
    const newNote = { id, title: '', content: '', createdAt: ts, updatedAt: ts, ...note };
    const notes = this._read();
    notes.push(newNote);
    this._write(notes);
    return newNote;
  }
  // PUBLIC_INTERFACE
  async update(id, patch) {
    /** Patch an existing note by id. */
    const notes = this._read();
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) throw new Error('Note not found');
    const updated = { ...notes[idx], ...patch, updatedAt: nowISO() };
    notes[idx] = updated;
    this._write(notes);
    return updated;
  }
  // PUBLIC_INTERFACE
  async remove(id) {
    /** Remove note by id. */
    const notes = this._read().filter(n => n.id !== id);
    this._write(notes);
    return { ok: true };
  }
}

/* Remote repository */
class RemoteNotesRepository {
  constructor(base) {
    this.base = base.replace(/\/+$/, '');
    this.url = `${this.base}/notes`;
  }
  async _json(res) {
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    if (res.status === 204) return null;
    return res.json();
  }
  // PUBLIC_INTERFACE
  async list() {
    /** Fetch notes from remote, expect array of notes. */
    const r = await fetch(this.url, { credentials: 'include' });
    const notes = await this._json(r);
    return (notes || []).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }
  // PUBLIC_INTERFACE
  async create(note) {
    /** Create remote note via POST /notes */
    const r = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(note || {}),
    });
    return this._json(r);
  }
  // PUBLIC_INTERFACE
  async update(id, patch) {
    /** Update note via PATCH /notes/:id */
    const r = await fetch(`${this.url}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(patch || {}),
    });
    return this._json(r);
  }
  // PUBLIC_INTERFACE
  async remove(id) {
    /** Delete note via DELETE /notes/:id */
    const r = await fetch(`${this.url}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    await this._json(r);
    return { ok: true };
  }
}

// PUBLIC_INTERFACE
export function createNotesRepository() {
  /**
   * Select a repository implementation:
   * - If VITE_API_BASE or VITE_BACKEND_URL is defined, use remote REST endpoints at `${base}/notes`.
   * - Otherwise, use localStorage.
   */
  const base = import.meta?.env?.VITE_API_BASE || import.meta?.env?.VITE_BACKEND_URL || '';
  if (typeof base === 'string' && base.trim().length > 0) {
    return new RemoteNotesRepository(base.trim());
  }
  return new LocalNotesRepository();
}
