import { useState } from "react";
import dayjs from "dayjs";

export default function MessageBubble({ me, msg, onDelete, onEdit }) {
  const mine = msg.from === me;
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(msg.text || "");

  const canAct = mine && msg._id; // can only edit/delete if persisted (has _id)
  const created = msg.createdAt ? dayjs(msg.createdAt).format("HH:mm") : "";

  const saveEdit = async () => {
    if (val.trim() && val.trim() !== msg.text) {
      await onEdit(msg, val.trim());
    }
    setEditing(false);
  };

  return (
    <div className={`bubble-row ${mine ? "out" : "in"}`}>
      <div className={`bubble ${mine ? "out" : "in"}`}>
        {editing ? (
          <div className="edit-wrap">
            <input value={val} onChange={(e) => setVal(e.target.value)} />
            <div className="edit-actions">
              <button onClick={saveEdit}>Save</button>
              <button className="secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text">{msg.text}</div>
            <div className="meta">
              <span className="time">{created}</span>
              {msg.status && <span className="status"> · {msg.status}</span>}
              {msg._optimistic && <span className="status"> · sending…</span>}
            </div>
          </>
        )}
      </div>

      {canAct && !editing && (
        <div className="bubble-menu">
          <button onClick={() => setEditing(true)}>Edit</button>
          <button className="danger" onClick={() => onDelete(msg)}>Delete</button>
        </div>
      )}
    </div>
  );
}
