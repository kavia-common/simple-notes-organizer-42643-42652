import React from 'react';

// PUBLIC_INTERFACE
export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel }) {
  /** Basic confirm dialog with backdrop. */
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="dlg-title" aria-describedby="dlg-desc">
      <div className="dialog">
        <h3 id="dlg-title">{title}</h3>
        <p id="dlg-desc">{message}</p>
        <div className="actions">
          <button className="secondary" onClick={onCancel} autoFocus>
            {cancelLabel}
          </button>
          <button className="danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
