import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble.jsx";

export default function ChatWindow({
  me,
  contact,
  messages,
  onSend,
  onDelete,
  onEdit
}) {
  const [text, setText] = useState("");
  const endRef = useRef(null);

  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, contact?._id]);

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-window">
      <header className="chat-header">
        <div className="avatar">{(contact.name || contact.wa_id)[0]}</div>
        <div className="meta">
          <div className="name">{contact.name || contact.wa_id}</div>
          <div className="sub">{contact.wa_id}</div>
        </div>
      </header>

      <section className="messages">
        {messages.map((m, idx) => (
          <MessageBubble
            key={m._id || `${m.wa_id}-${m.timestamp || Date.now()}-${idx}`}
            me={me}
            msg={m}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}

        <div ref={endRef} />
      </section>

      <footer className="composer">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message"
          rows={1}
        />
        <button onClick={send}>Send</button>
      </footer>
    </div>
  );
}
