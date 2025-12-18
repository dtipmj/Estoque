import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import "../styles/activate.css";
import Logo from "../assets/logo.png";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function ActivateAccount() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = params.get("token");
  const email = params.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!token || !email) {
      setError("Link inválido. Solicite um novo convite.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);

    try {
      await api.setPassword({ email, token, password });
      navigate("/login");
    } catch (err) {
      setError(err.message || "Erro ao ativar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="activate-page">
      <form className="activate-card" onSubmit={handleSubmit}>
        <div className="activate-header">
          <img src={Logo} alt="Logo" className="activate-logo" />
          <h2 className="activate-title">Prefeitura de Jaru</h2>
          <p className="activate-subtitle">Ativação de conta</p>
        </div>

        <div className="activate-email">
          <span className="activate-email-label">E-mail</span>
          <span className="activate-email-value">{email || "-"}</span>
        </div>

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <div className="password-field">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
          >
            {showConfirm ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {error && <div className="activate-error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Ativando..." : "Ativar conta"}
        </button>

        <button
          type="button"
          className="activate-back"
          onClick={() => navigate("/login")}
          disabled={loading}
        >
          Voltar para login
        </button>
      </form>
    </div>
  );
}
