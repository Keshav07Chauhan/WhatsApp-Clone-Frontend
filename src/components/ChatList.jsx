export default function ChatList({ contacts, unread, active, onSelect }) {
  return (
    <div className="chat-list">
      {contacts?.length ? (
        contacts.map((c) => {
          const isActive = active?._id === c._id;
          return (
            <button
              key={`${c._id || c.wa_id}`}

              onClick={() => onSelect(c)}
              className={`chat-list-item ${isActive ? "active" : ""}`}
              title={c.wa_id}
            >
              <div className="avatar">{(c.name || c.wa_id || "?")[0]}</div>
              <div className="meta">
                <div className="name">{c.name || c.wa_id}</div>
                <div className="sub">{c.wa_id}</div>
              </div>
              {!!unread?.[c.wa_id] && (
                <span className="badge">{unread[c.wa_id]}</span>
              )}
            </button>
          );
        })
      ) : (
        <div className="empty">No contacts yet</div>
      )}
    </div>
  );
}
