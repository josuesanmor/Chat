import axios from "axios";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import AddForm from "./AddForm";

const socket = io("https://userchatbackend.onrender.com", {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 200,
  reconnectionDelayMax: 500,
  randomizationFactor: 0,
  timeout: 10000,
});

function Chat(props) {
  const { id, chatId, isGroup, members, name } = props.chat;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const token = localStorage.getItem("token");
  const scrollRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);

  const receiveMessage = (data) => {
    setMessages((state) => [...state, data]);
  };

  useEffect(() => {
    if (!token) return;

    socket.auth = { token: token };
    socket.connect();
  }, [token]);

  const loadChat = useCallback(async () => {
    try {
      const res = await axios({
        url: `https://userchatbackend.onrender.com/messages/${chatId}`,
        method: "GET",
        headers: { Authorization: "bearer " + token },
      });

      if (!res.data.ok) console.log("error");

      setMessages(res.data.chat);
    } catch (error) {
      console.log(error.message);
    }
  }, [chatId, token]);

  useEffect(() => {
    if (!socket) return console.log("Fallo");

    socket.on("message", receiveMessage);
    socket.on("connect", () => {
      socket.emit("join", chatId);
      if (chatId) loadChat();
    });

    socket.emit("join", chatId);
    if (chatId) loadChat();

    return () => {
      socket.off("connect");
      socket.emit("leave", chatId);
      socket.off("message", receiveMessage);
    };
  }, [loadChat, chatId]);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    if (!loaded && messages.length > 0) {
      container.scrollTo({ top: container.scrollHeight, behavior: "auto" });
      setLoaded(true);
      return;
    }

    const threshold = 150;

    const isAtBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + threshold;

    if (isAtBottom) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loaded]);

  const handleSubmit = (e) => {
    e.preventDefault();

    socket.emit("message", { chatId: chatId, data: message });
    //receiveMessage({ userid: id, content: message, messagedate: "27/01" });
    setMessage("");
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    setAdding(false);
  }, [chatId]);

  return (
    <div
      className="d-flex flex-column position-relative"
      style={{ width: "100%", height: "100%", backgroundColor: "#125A44" }}
    >
      <div
        className="bg-dark d-flex flex-rows"
        style={{ width: "100%", height: "60px" }}
      >
        <p
          className="display-6 ms-4"
          style={{ color: "white", width: "fit-content" }}
        >
          {name}
        </p>

        {isGroup && (
          <button
            className="btn btn-outline-primary ms-auto me-4 mt-2"
            style={{ height: "fit-content" }}
            onClick={() => setAdding(!adding)}
          >
            Agregar miembro
          </button>
        )}
      </div>
      <div
        ref={scrollRef}
        className="flex-grow-1 p-3 mb-2 d-flex flex-column"
        style={{ overflowX: "hidden", overflowY: "auto" }}
      >
        {messages.map((msg, idx) => {
          return (
            <div
              key={idx}
              className={`d-flex flex-column rounded-2 p-2 mb-2 text-white shadow ${msg.userid === id ? "ms-auto bg-success" : "me-auto bg-primary"}`}
              style={{
                width: "fit-content",
                maxWidth: "45%",
                wordBreak: "break-word",
              }}
            >
              <p
                className={`h5 color-secondary`}
                style={{ fontSize: "medium" }}
              >
                {isGroup && id !== msg.userid && members[msg.userid]}
              </p>
              <p className="h3 color-white" style={{ fontSize: "medium" }}>
                {msg.content}
              </p>
              <p
                className="h6 color-secondary ms-auto"
                style={{ fontSize: "small" }}
              >
                {msg.messagedate}
              </p>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={handleSubmit}
        className="d-flex flex-grow-1 mt-auto mx-3"
        style={{ height: "fit-content" }}
      >
        <input
          type="text"
          className="flex-grow-1 form-text mt-auto form-control rounded-4 border-0 m-2 bg-secondary"
          placeholder="Escribe tu mensaje"
          style={{
            backgroundColor: "gray",
            color: "white",
            height: "fit-content",
          }}
          value={message}
          onChange={handleChange}
        ></input>
      </form>
      {adding && (
        <AddForm chatId={chatId} handleAdding={() => setAdding(false)} />
      )}
    </div>
  );
}

export default Chat;

/*
{ senderId: 1, content: "Hola pedro", date: "27/01" },
    { senderId: 2, content: "Que tal pablo", date: "27/01" },
    { senderId: 2, content: "Como andas?", date: "27/01" },
    { senderId: 1, content: "Mejor que nunca pedro", date: "27/01" },
    {
      senderId: 2,
      content:
        "No hubo comunicado. No hubo explicación. Solo una cancelación silenciosa. El contexto importa. En Washington, endurecieron el mensaje: ni petróleo ni dinero para la isla. Y,  semanas después México cedió. ",
      date: "27/01",
    },
    {
      senderId: 1,
      content:
        "El cargamento programado para este mes fue retirado según documentos a los que tuvo acceso Bloomberg",
      date: "27/01",
    }
*/
