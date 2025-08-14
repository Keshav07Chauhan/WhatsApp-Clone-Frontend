import { useEffect, useState, useRef } from "react";
import { useAuth } from "../state/AuthContext";
import { apiGetContacts, apiAddContact } from "../api/contacts";
import { apiGetConversation, apiUnreadCount } from "../api/messages";
import {ChatList, ChatWindow, SplashScreen, AddContactIcon, MoreOptionsIcon} from "../components";
import { socket } from "../socket";

export default function ChatPage() {
  const { user, logout } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [unread, setUnread] = useState({});
  const [active, setActive] = useState(() => {
    const saved = localStorage.getItem("activeChat");
    return saved ? JSON.parse(saved) : null;
  });
  const [messagesByContact, setMessagesByContact] = useState(() => {
    const saved = localStorage.getItem("messagesByContact");
    return saved ? JSON.parse(saved) : {};
  });

  // ⬇️ NEW: show splash while booting contacts + unread
  const [booting, setBooting] = useState(true);

  const myWaId = user?.wa_id;
  const activeChatIdRef = useRef(active?.wa_id || null);

  // Persist messages
  useEffect(() => {
    localStorage.setItem("messagesByContact", JSON.stringify(messagesByContact));
  }, [messagesByContact]);

  // === Data loaders ===
  const fetchContacts = async () => {
    const res = await apiGetContacts();
    const list = res?.data?.data || [];
    setContacts(list);
    return list; // return so we can chain unread fetch during boot
  };

  const fetchUnreadCounts = async (list) => {
    const base = list || contacts;
    if (!base?.length) {
      setUnread({});
      return;
    }
    const entries = await Promise.all(
      base.map(async (c) => {
        try {
          const { data } = await apiUnreadCount(c.wa_id);
          return [c.wa_id, data?.data?.unreadCount || 0];
        } catch {
          return [c.wa_id, 0];
        }
      })
    );
    setUnread(Object.fromEntries(entries));
  };

  // Open chat
  const openChat = async (contact) => {
    setActive(contact);
    activeChatIdRef.current = contact.wa_id;

    if (!messagesByContact[contact.wa_id]) {
      const currentChatId = contact.wa_id;
      const res = await apiGetConversation(contact.wa_id);
      if (activeChatIdRef.current === currentChatId) {
        setMessagesByContact((prev) => ({
          ...prev,
          [contact.wa_id]: res?.data?.data || []
        }));
      }
    }

    socket.emit("mark_read", { from: contact.wa_id, to: myWaId });
    setUnread((u) => ({ ...u, [contact.wa_id]: 0 }));
  };

  // Send message
  const handleSend = (text) => {
    if (!active || !text.trim()) return;

    const newMsg = {
      from: myWaId,
      to: active.wa_id,
      text: text.trim(),
      type: "text",
      createdAt: new Date().toISOString()
    };

    setMessagesByContact((prev) => ({
      ...prev,
      [active.wa_id]: [
        ...(prev[active.wa_id] || []),
        { ...newMsg, status: "created", _optimistic: true }
      ]
    }));

    socket.emit("send_message", newMsg);
  };

  // Add contact
  const handleAddContact = async () => {
    const phone = prompt("Enter wa_id (phone) to add:");
    if (!phone) return;
    try {
      const res = await apiAddContact(phone);
      const list = await fetchContacts(); // refresh contacts
      await fetchUnreadCounts(list);      // refresh unread
      alert(`Added: ${res?.data?.data?.wa_id}`);
    } catch (e) {
      alert(e.message);
    }
  };

  // === Boot sequence: after login/refresh, show Splash until contacts+unread are ready ===
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await fetchContacts();
        await fetchUnreadCounts(list);
      } finally {
        if (mounted) setBooting(false); // hide splash
      }
    })();
    return () => { mounted = false; };
    // NOTE: runs once per mount; this is the splash you wanted after login/refresh
  }, []);

  // Keep unread up-to-date if contacts later change (e.g., after adding contact)
  useEffect(() => {
    if (contacts.length) fetchUnreadCounts(contacts);
  }, [contacts.length]);

  // Restore last active chat messages from backend after refresh (if any)
  useEffect(() => {
    if (active?.wa_id) {
      apiGetConversation(active.wa_id).then(res => {
        setMessagesByContact(prev => ({
          ...prev,
          [active.wa_id]: res?.data?.data || []
        }));
      });
    }
  }, [active?.wa_id]);

  // Socket setup
  useEffect(() => {
    if (!myWaId) return;

    socket.connect();
    socket.emit("join", myWaId);

    socket.on("receive_message", (message) => {
      const contactId = message.from === myWaId ? message.to : message.from;

      setMessagesByContact((prev) => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), message]
      }));

      if (activeChatIdRef.current !== contactId) {
        setUnread((u) => ({
          ...u,
          [contactId]: (u[contactId] || 0) + 1
        }));
      }
    });

    socket.on("message_status_update", ({ id, status }) => {
      setMessagesByContact((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((cid) => {
          updated[cid] = updated[cid].map((m) =>
            m._id === id ? { ...m, status } : m
          );
        });
        return updated;
      });
    });

    socket.on("messages_marked_read", ({ by }) => {
      setMessagesByContact((prev) => ({
        ...prev,
        [by]: (prev[by] || []).map((m) =>
          m.from === by ? { ...m, status: "read" } : m
        )
      }));
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_status_update");
      socket.off("messages_marked_read");
      socket.disconnect();
    };
  }, [myWaId]);

  // ⬇️ Render splash while loading contacts/unread after login/refresh
  if (booting) {
    return <SplashScreen />;
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <header className="sidebar-header">
          <div className="me" style={{fontSize: "20px",
  fontWeight: "bold"}}>
            {/* <div className="me-name">{user?.name || user?.wa_id}</div>
            <div className="me-id">{user?.wa_id}</div> */}
            WhatsApp
          </div>
          <div className="sidebar-actions">
            {/* Add Contact (SVG preserved) */}
            <button onClick={handleAddContact}>
              <AddContactIcon />
            </button>

            {/* Three-dots (you can hook dropdown here if you want) */}
            <button onClick={logout}>
              <MoreOptionsIcon />
            </button>
          </div>
        </header>

        <ChatList
          contacts={contacts}
          unread={unread}
          active={active}
          onSelect={openChat}
        />
      </aside>

      <main className="main">
        {active ? (
          <ChatWindow
            me={myWaId}
            contact={active}
            messages={messagesByContact[active.wa_id] || []}
            onSend={handleSend}
          />
        ) : (
          <div className="placeholder">
            <div className="textAlign">
              <img width="320" alt="" src="https://static.whatsapp.net/rsrc.php/v4/y6/r/wa669aeJeom.png"/>  
            </div>
            <div className="textAlign">
              <h1 >Download WhatsApp for Windows</h1>
              <div  className="textAlign">Make calls, share your screen and get a faster experience when you download the Windows app.</div>
            </div>
            <div className="textAlign">
              <button className="downloadButton" onClick={() => window.open("https://www.whatsapp.com/download", "_blank")}>Download</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
