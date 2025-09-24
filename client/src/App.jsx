import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import { api, setAuthToken } from "./api";

const initialFormState = {
  name: "",
  email: "",
  password: "",
  role: "customer"
};

export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    setAuthToken(token);
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setAuthToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
    setMode("login");
    setForm(initialFormState);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (mode === "login") {
        const { data } = await api.post("/auth/login", {
          email: form.email.trim(),
          password: form.password
        });
        localStorage.setItem("token", data.token);
        setAuthToken(data.token);
        setUser(data.user);
      } else {
        const { data } = await api.post("/auth/register", {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role
        });
        localStorage.setItem("token", data.token);
        setAuthToken(data.token);
        setUser(data.user);
      }
      setForm(initialFormState);
    } catch (err) {
      setError(err?.response?.data?.error || "Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setForm(initialFormState);
    setError("");
  };

  if (loading) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-brand">ХҮННҮ</div>
          <p>Түр хүлээнэ үү...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const isLogin = mode === "login";
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-brand">ХҮННҮ</div>
          <h1>{isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}</h1>
          <p className="auth-subtitle">
            {isLogin
              ? "Админ самбарт хандахын тулд имэйл болон нууц үгээ оруулна уу."
              : "Шинэ хэрэглэгч үүсгэж, эрхийн түвшнээ сонгоно уу."}
          </p>
          {error && <div className="auth-error">{error}</div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <label>
                  <span>Нэр</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Бүтэн нэр"
                    required
                  />
                </label>
              </>
            )}
            <label>
              <span>Имэйл</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="example@mail.com"
                required
              />
            </label>
            <label>
              <span>Нууц үг</span>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </label>
            {!isLogin && (
              <label>
                <span>Эрхийн түвшин</span>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                >
                  <option value="customer">Үйлчлүүлэгч</option>
                  <option value="admin">Админ</option>
                </select>
              </label>
            )}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Илгээж байна..." : isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
            </button>
          </form>
          <p className="auth-switch">
            {isLogin ? "Шинэ хэрэглэгч үү?" : "Бүртгэлтэй хэрэглэгч үү?"}
            <button type="button" className="auth-link" onClick={toggleMode}>
              {isLogin ? "Бүртгүүлэх" : "Нэвтрэх"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return <Dashboard user={user} onLogout={logout} />;
}
