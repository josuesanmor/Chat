import { Card, CardBody } from "react-bootstrap";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [message, setMessage] = useState("");
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
          navigate("/");
        } catch (error) {
          console.log(error.message);
        }
      }
    };

    authSesion();
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      username: e.target.elements.username.value.trim(),
      password: e.target.elements.password.value.trim(),
    };

    try {
      const res = await axios({
        url: "https://userchatbackend.onrender.com/login",
        method: "POST",
        data: userData,
      });

      if (!res.data.ok) return setMessage(res.data.message);

      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };
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
            height: "19rem",
          }}
        >
          <form onSubmit={handleSubmit}>
            <label>USERNAME</label>
            <input
              className="form-control mb-4"
              type="text"
              placeholder="username"
              name="username"
              required
            />
            <label>CONTRASEÑA</label>
            <input
              className="form-control mb-3"
              type="password"
              placeholder="********"
              name="password"
              autoComplete="off"
              required
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
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="btn btn-outline-primary btn-sm mt-2"
                >
                  Sign in
                </button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default Login;
