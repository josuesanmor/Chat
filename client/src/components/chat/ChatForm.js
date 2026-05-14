import axios from "axios";
import { useEffect, useState } from "react";

function ChatForm(props) {
  const token = localStorage.getItem("token");
  const [username, setUsername] = useState();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isGroup, setIsGroup] = useState(null);
  const [message, setMessage] = useState("no ta perro!");
  const [exists, setExists] = useState();
  const [friendId, setFriendId] = useState();

  useEffect(() => {
    if (!username) {
      setExists(false);
      setMessage("");
      return;
    }

    const RetrasarBuscar = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://userchatbackend.onrender.com/user/${username}`,
        );

        if (!res.data.ok) throw new Error("Error cargando usuario");

        if (res.data.exists) {
          setExists(true);
          setMessage("Usuario encontrado");
          setFriendId(res.data.exists.id);
        } else {
          setExists(false);
          setMessage("No encontrado");
        }
      } catch (error) {
        console.log(error.message);
      }
    }, 1000);

    return () => clearTimeout(RetrasarBuscar);
  }, [username]);

  const userForm = () => {
    return (
      <div className="d-flex flex-column">
        <label className="mb-2" style={{ color: "white" }}>
          USERNAME
        </label>
        <input
          type="text"
          placeholder="username"
          className="form-control mb-2"
          onChange={(e) => {
            setUsername(e.target.value);
            setMessage("Buscando...");
          }}
        />
        <p
          className="h6 d-flex justify-content-center"
          style={{ color: `${exists ? "green" : "red"} ` }}
        >
          {message}
        </p>
        <button
          disabled={!exists}
          onClick={handleAddUser}
          className="btn btn-outline-primary"
        >
          Agregar
        </button>
      </div>
    );
  };

  const groupForm = () => {
    return (
      <div className="d-flex flex-column">
        <label className="mb-2" style={{ color: "white" }}>
          NOMBRE DEL GRUPO
        </label>
        <input
          type="text"
          placeholder="nombre"
          className="form-control mb-2"
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <label className="mb-2" style={{ color: "white" }}>
          DESCRIPCIÓN
        </label>
        <textarea
          type="text"
          placeholder="descripcion"
          className="form-control mb-2"
          maxLength={120}
          rows={5}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
        />
        <button
          disabled={name.length < 2}
          onClick={handleAddGroup}
          className="btn btn-outline-primary"
        >
          Agregar
        </button>
      </div>
    );
  };

  const handleAddUser = async () => {
    if (!exists) return;

    try {
      const res = await axios({
        url: "https://userchatbackend.onrender.com/chat",
        method: "POST",
        headers: { Authorization: "bearer " + token },
        data: {
          friendId: friendId,
          isGroup: false,
        },
      });

      if (res.data.same) {
        setExists(false);
        setMessage(res.data.message);
        return;
      }

      if (res.data.ok === undefined) console.log("error");

      if (res.data.ok === false) {
        setMessage(res.data.message);
        setExists(false);
        return;
      }

      props.handleStarting();
      props.loadChats();
      return;
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleAddGroup = async () => {
    try {
      const res = await axios({
        url: "https://userchatbackend.onrender.com/chat",
        method: "POST",
        headers: { Authorization: "bearer " + token },
        data: {
          name: name,
          description: description,
          isGroup: true,
        },
      });

      if (!res.data.ok) return console.log(res.data.message);

      props.addChat(res.data.chat);
      props.handleStarting();
      return;
    } catch (error) {}
  };

  return (
    <div>
      <div className="d-flex justify-content-center">
        {isGroup == null && (
          <button
            className="btn btn-secondary me-4"
            onClick={() => setIsGroup(true)}
          >
            USUARIO
          </button>
        )}
        {isGroup == null && (
          <button
            className="btn btn-secondary"
            onClick={() => setIsGroup(false)}
          >
            GRUPO
          </button>
        )}

        {isGroup === true && userForm()}
        {isGroup === false && groupForm()}
      </div>
    </div>
  );
}

export default ChatForm;
