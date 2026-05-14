import axios from "axios";
import { useEffect, useState } from "react";

function AddForm(props) {
  const token = localStorage.getItem("token");
  const [username, setUsername] = useState();
  const [message, setMessage] = useState("");
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

  const handleAddUser = async () => {
    if (!exists) return;

    try {
      const res = await axios({
        url: "https://userchatbackend.onrender.com/addUserChat",
        method: "POST",
        headers: { Authorization: "bearer " + token },
        data: {
          friendId: friendId,
          chatId: props.chatId,
        },
      });

      if (res.data.same) {
        setExists(false);
        setMessage(res.data.message);
        return;
      }

      if (res.data.already) {
        setExists(false);
        setMessage(res.data.message);
        return;
      }

      if (res.data.ok === undefined) console.log(res.data.message);
      props.handleAdding();

      return;
    } catch (error) {}
  };

  return (
    <div
      className="position-absolute d-flex align-items-center justify-content-center"
      style={{
        width: "100%",
        height: "calc(100% - 60px)",
        backgroundColor: "#1e272ec4",
        top: "60px",
      }}
    >
      <div
        className="d-flex flex-column rounded p-4"
        style={{ backgroundColor: "#1e272e", width: "24rem", height: "14rem" }}
      >
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
    </div>
  );
}

export default AddForm;
