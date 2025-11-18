import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createNotesRepository } from '../data/notesRepository.js';
import NotesList from './NotesList.jsx';
import NoteEditor from './NoteEditor.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

function useRepository() {
  const repoRef = useRef(null);
  if (!repoRef.current) {
    repoRef.current = createNotesRepository();
  }
  return repoRef.current;
}

// PUBLIC_INTERFACE
export default function AppShell() {
  /**
   * Root application shell for the notes app.
   * Handles: loading notes, filtering, selection, create/update/delete, and persistence.
   */
  const repo = useRepository();
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [confirm, setConfirm] = useState(null); // { id, title }

  const selected = useMemo(() => notes.find(n => n.id === selectedId) || null, [notes, selectedId]);

  async function refresh(selectId) {
    const list = await repo.list();
    setNotes(list);
    if (selectId != null) setSelectedId(selectId);
    else if (list.length && !selectedId) setSelectedId(list[0].id);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(n =>
      (n.title || '').toLowerCase().includes(q) ||
      (n.content || '').toLowerCase().includes(q)
    );
  }, [notes, query]);

  async function handleCreate() {
    const created = await repo.create({ title: 'Untitled', content: '' });
    await refresh(created.id);
  }

  async function handleUpdate(id, patch) {
    const updated = await repo.update(id, patch);
    setNotes(prev => {
      const idx = prev.findIndex(n => n.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = updated;
      // keep list sorted by updatedAt desc
      next.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      return next;
    });
  }

  async function handleDeleteConfirmed() {
    if (!confirm) return;
    await repo.remove(confirm.id);
    setConfirm(null);
    await refresh();
    setSelectedId(prev => {
      const remaining = notes.filter(n => n.id !== (confirm?.id));
      return remaining[0]?.id ?? null;
    });
  }

  return (
    <div className="app" role="application" aria-label="Simple Notes Organizer">
      <header className="header">
        <div className="brand">
          <div className="brand-badge" aria-hidden="true" />
          <h1>Simple Notes Organizer</h1>
        </div>
        <div className="meta">Ocean Professional</div>
      </header>

      <aside className="sidebar" aria-label="Notes list">
        <div className="toolbar">
          <input
            aria-label="Search notes"
            className="input"
            placeholder="Search notes..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="primary" onClick={handleCreate} aria-label="Create note">
            + New
          </button>
        </div>
        <NotesList
          notes={filtered}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </aside>

      <main className="main" role="main">
        {selected ? (
          <NoteEditor
            key={selected.id}
            note={selected}
            onUpdate={handleUpdate}
            onDelete={() => setConfirm({ id: selected.id, title: selected.title || 'Untitled' })}
          />
        ) : (
          <div className="editor-card empty-state" role="status" aria-live="polite">
            <div>
              <h3>No note selected</h3>
              <p>Create a new note or select one from the list.</p>
            </div>
          </div>
        )}
      </main>

      {confirm && (
        <ConfirmDialog
          title="Delete note?"
          message={`Are you sure you want to delete "${confirm.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
