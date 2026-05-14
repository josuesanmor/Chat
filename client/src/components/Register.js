import { Card, CardBody } from "react-bootstrap";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [exists, setExists] = useState("");
  const [text, setText] = useState("");
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!username) {
      setExists(true);
      setText("");
      return;
    }
    setExists(true);

    const RetrasarBuscar = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://userchatbackend.onrender.com/user/${username}`,
        );

        if (!res.data.ok) throw new Error("Error cargando usuario");

        if (res.data.exists) {
          setExists(true);
          setText("Usuario no disponible");
        } else {
          setExists(false);
          setText("Usuario disponible");
        }
      } catch (error) {
        console.log(error.message);
      }
    }, 1000);

    return () => clearTimeout(RetrasarBuscar);
  }, [username]);

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
          navigate("/");
        } catch (error) {
          console.log(error.message);
        }
      }
    };

    authSesion();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!valid) return;

    const userData = {
      username: username,
      password: password,
    };

    try {
      const res = await axios({
        url: "https://userchatbackend.onrender.com/register",
        method: "POST",
        data: userData,
      });

      if (!res.data.ok) return setMessage(res.data.message);

      setText("Usuario registrado con exito");
      setExists(false);
      setTimeout(navigate("/login"), 1000);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    setValid(false);
    setMessage("");

    if (!password && !passwordConfirm) return;

    if (password !== passwordConfirm)
      return setMessage("Las contraseñas con coinciden");

    if (password.length < 4)
      return setMessage("Contraseña debe ser 4 o más carácters");

    setValid(true);
  }, [password, passwordConfirm]);

  return (
    <div
      className="d-flex flex-grow-1 bg-dark align-items-center justify-content-center"
      style={{ width: "100%", height: "100%" }}
    >
      <Card className="border-0 shadow">
        <CardBody
          style={{
            backgroundColor: "#1e272e",
            color: "white",
            width: "18rem",
            height: "25rem",
          }}
        >
          <form onSubmit={handleSubmit}>
            <label>USERNAME</label>
            <input
              className="form-control mb-1"
              type="text"
              placeholder="username"
              name="username"
              required
              onChange={(e) => setUsername(e.target.value)}
            />
            <p
              className="h6 d-flex justify-content-center"
              style={{ color: `${exists ? "red" : "green"} ` }}
            >
              {text}
            </p>
            <label>CONTRASEÑA</label>
            <input
              className="form-control mb-3"
              type="password"
              placeholder="********"
              name="password"
              autoComplete="off"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>CONFIRMAR CONTRASEÑA</label>
            <input
              className="form-control mb-3"
              type="password"
              placeholder="********"
              name="passwordConfirm"
              autoComplete="off"
              required
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
            <p className="h6 text-center" style={{ color: "red" }}>
              {message}
            </p>

            <div
              className="d-flex justify-content-center"
              style={{ width: "100%" }}
            >
              <div className="d-flex flex-column">
                <button
                  className="btn btn-primary justify-self-center"
                  style={{ width: "10rem" }}
                  disabled={!valid || exists}
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="btn btn-outline-primary btn-sm mt-2"
                >
                  Log in
                </button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default Register;
