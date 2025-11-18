import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from '../utils.js';

// PUBLIC_INTERFACE
export default function NoteEditor({ note, onUpdate, onDelete }) {
  /** Editor for title and content with debounced autosave. */
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');

  useEffect(() => {
    setTitle(note.title || '');
    setContent(note.content || '');
  }, [note.id]); // reset when note changes

  const debouncedSave = useMemo(() => debounce(onUpdate, 500), [onUpdate]);

  const handleTitle = useCallback((e) => {
    const v = e.target.value;
    setTitle(v);
    debouncedSave(note.id, { title: v });
  }, [debouncedSave, note.id]);

  const handleContent = useCallback((e) => {
    const v = e.target.value;
    setContent(v);
    debouncedSave(note.id, { content: v });
  }, [debouncedSave, note.id]);

  return (
    <section className="editor-card" aria-label="Note editor">
      <label style={{ display: 'block' }}>
        <span className="sr-only">Title</span>
        <input
          className="title-input"
          value={title}
          onChange={handleTitle}
          placeholder="Title"
          aria-label="Note title"
        />
      </label>
      <label style={{ display: 'block' }}>
        <span className="sr-only">Content</span>
        <textarea
          className="content-input"
          value={content}
          onChange={handleContent}
          placeholder="Start typing your note..."
          aria-label="Note content"
        />
      </label>
      <div className="editor-actions">
        <div aria-live="polite" style={{ color: 'var(--muted)', fontSize: 12 }}>
          Autosaved
        </div>
        <div>
          <button className="secondary" onClick={() => {
            setTitle(note.title || '');
            setContent(note.content || '');
          }} aria-label="Reset edits">
            Reset
          </button>
          {' '}
          <button className="danger" onClick={onDelete} aria-label="Delete note">
            Delete
          </button>
        </div>
      </div>
    </section>
  );
}
