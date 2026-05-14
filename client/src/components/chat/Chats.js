import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Card, CardBody } from "react-bootstrap";
import ChatForm from "./ChatForm";
import { useNavigate } from "react-router-dom";

function Chats(props) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [chats, setChats] = useState([]);
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();

  const receiveChat = (chat) => {
    setChats((state) => [...state, chat]);
  };

  const loadChats = useCallback(async () => {
    if (!token) return;

    try {
      const res = await axios({
        url: "https://userchatbackend.onrender.com/chats",
        method: "GET",
        headers: { Authorization: "bearer " + token },
      });

      if (!res.data.ok) return console.log("error");

      setChats(res.data.chats);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/login");
  };

  return (
    <Card
      className=" border-0 shadow"
      style={{ width: "30vw", height: "100%" }}
    >
      <CardBody
        className="v-full d-flex flex-column shadow bg-dark"
        style={{ height: "100%" }}
      >
        <div
          className="d-flex align-items-center justify-content-center mb-3"
          style={{ height: "5rem", borderBottom: "solid gray 2px" }}
        >
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setStarting(!starting)}
          >
            Agregar conversacion
          </button>
        </div>

        <div
          className="d-flex flex-column my-4 mx-2"
          style={{ overflowY: "auto" }}
        >
          {!starting &&
            chats.map((chat, idx) => {
              return (
                <button
                  key={idx}
                  onClick={() =>
                    props.handleChat(chat.id, chat.isGroup, chat.name)
                  }
                  className="btn btn-outline-primary block mb-2 border-2"
                >
                  {chat.name}
                </button>
              );
            })}
          {starting && (
            <ChatForm
              loadChats={loadChats}
              handleStarting={() => setStarting(false)}
              addChat={receiveChat}
            />
          )}
        </div>
        <button
          onClick={handleLogout}
          className="mt-auto btn btn-outline-danger border-3 fw-semibold fs-5"
        >
          Cerrar sesión
        </button>
      </CardBody>
    </Card>
  );
}

export default Chats;
