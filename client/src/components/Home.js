import { useEffect, useState } from "react";
import Chats from "./chat/Chats";
import Chat from "./chat/Chat";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Home() {
  const [token, setToken] = useState();
  const [chat, setChat] = useState();
  const [id, setId] = useState(-1);
  const navigate = useNavigate();

  useEffect(() => {
    const authSesion = async () => {
      const localToken = localStorage.getItem("token");

      if (localToken) {
        try {
          const res = await axios({
            url: "https://userchatbackend.onrender.com/firstauth",
            method: "POST",
            headers: { Authorization: `bearer ${localToken}` },
          });

          if (!res.data.ok) return;

          localStorage.setItem("token", res.data.token);
          setToken(res.data.token);
          setId(res.data.id);
          return;
        } catch (error) {
          localStorage.removeItem("token");
        }
      }

      navigate("/login");
    };

    authSesion();
  });

  const handleChat = async (chatId, isGroup, name) => {
    try {
      const res = await axios({
        url: `https://userchatbackend.onrender.com/members/${chatId}`,
        method: "GET",
        headers: { Authorization: "bearer " + token },
      });

      if (!res.data.ok) return console.log("error");
      const members = res.data.members.reduce((acc, m) => {
        acc[m.id] = m.username;
        return acc;
      }, {});

      setChat({
        id: id,
        chatId: chatId,
        isGroup: isGroup,
        members: members,
        name: name,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div
      className="d-flex flex-rows m-0 p-0 flex-grow-1"
      style={{ width: "100%", height: "100%", backgroundColor: "#125A44" }}
    >
      <Chats handleChat={handleChat}></Chats>
      {chat && <Chat chat={chat}></Chat>}
    </div>
  );
}

export default Home;
