import { useState } from "react";
import { login, register } from "../services/authService";
import { useAuthContext } from "../context/AuthContext";
import { FaUser, FaEnvelope, FaLock, FaPhone } from "react-icons/fa";
import Swal from "sweetalert2";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";
import "../styles/authPage.css";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [localLoading, setLocalLoading] = useState(false); // Loader local para login/registro
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    telefono: "",
  });
  const [error, setError] = useState(null);
  const { login: setAuth, setRedirectToDashboard } = useAuthContext();
  const navigate = useNavigate();

  const handleSwitch = () => {
    setIsLogin(!isLogin);
    setError(null);
    setFormData({ nombre: "", email: "", password: "", telefono: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLocalLoading(true);
      if (isLogin) {
        // Proceso de inicio de sesión
        const { email, password } = formData;
        // Capturamos la respuesta del login
        const userData = await login({ email, password });
        // Actualizamos el contexto con los datos del usuario
        setAuth(userData);

        const result = await Swal.fire({
          icon: "success",
          title: "Inicio de sesión exitoso",
          text: "¡Bienvenido de nuevo!",
          showConfirmButton: true,
        });

        if (result.isConfirmed) {
          setRedirectToDashboard(true);
        }
        setError(null);
      } else {
        // Proceso de registro
        const { nombre, email, password, telefono } = formData;
        await register({ nombre, email, password, telefono });

        await Swal.fire({
          icon: "success",
          title: "Registro exitoso",
          text: "Ahora puedes iniciar sesión.",
          showConfirmButton: true,
        });

        setError(null);
        // Limpia el formulario y cambia a la vista de login
        setFormData({ nombre: "", email: "", password: "", telefono: "" });
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || "Error al procesar la solicitud");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <section className="form-container-auth">
      {localLoading && <Loader />}
      <div className="form-wrapper">
        <div className="tabs">
          <button
            type="button"
            className={`tab ${isLogin ? "active" : ""}`}
            onClick={handleSwitch}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className={`tab ${!isLogin ? "active" : ""}`}
            onClick={handleSwitch}
          >
            Registrarse
          </button>
        </div>

        <form
          className={`form ${isLogin ? "slide-in-right" : "slide-in-left"}`}
          onSubmit={handleSubmit}
        >
          {!isLogin && (
            <div className="input-group">
              <span className="input-icon">
                <FaUser />
              </span>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="input"
                placeholder="Nombre"
                required
              />
            </div>
          )}

          <div className="input-group">
            <span className="input-icon">
              <FaEnvelope />
            </span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input"
              placeholder="Correo electrónico"
              required
            />
          </div>

          <div className="input-group">
            <span className="input-icon">
              <FaLock />
            </span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="input"
              placeholder="Contraseña"
              required
            />
          </div>

          {!isLogin && (
            <div className="input-group">
              <span className="input-icon">
                <FaPhone />
              </span>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="input"
                placeholder="Teléfono"
                required
              />
            </div>
          )}

          <div className="submit-container">
            <button className="submit-button" type="submit">
              {isLogin ? "Iniciar Sesión" : "Registrarse"}
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </section>
  );
};

export default AuthPage;
