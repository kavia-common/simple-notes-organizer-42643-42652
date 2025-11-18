import React from 'react';
import { formatUpdatedAt, snippet } from '../utils.js';

// PUBLIC_INTERFACE
export default function NotesList({ notes, selectedId, onSelect }) {
  /** Renders the list of notes with title, snippet, and last updated time. */
  if (!notes || notes.length === 0) {
    return <div className="list list-empty">No notes yet. Create your first note.</div>;
  }

  return (
    <div className="list" role="list">
      {notes.map(n => (
        <button
          key={n.id}
          className={`note-item ${n.id === selectedId ? 'active' : ''}`}
          onClick={() => onSelect(n.id)}
          role="listitem"
          aria-current={n.id === selectedId ? 'true' : 'false'}
        >
          <div className="note-title" title={n.title || 'Untitled'}>
            {n.title || 'Untitled'}
          </div>
          <div className="note-updated" aria-label="Updated time">
            {formatUpdatedAt(n.updatedAt)}
          </div>
          <div className="note-snippet">{snippet(n.content || '')}</div>
        </button>
      ))}
    </div>
  );
}
