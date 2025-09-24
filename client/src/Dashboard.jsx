import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const formatHorseOption = (horse) => ({
  value: horse._id,
  label: `${horse.horseId} — ${horse.name || ""}`.trim()
});

export default function Dashboard({ user, onLogout }) {
  const [horses, setHorses] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [herds, setHerds] = useState([]);
  const [herdForm, setHerdForm] = useState({ name: "", stallion: "" });
  const [editingHerdId, setEditingHerdId] = useState("");
  const [activeHerd, setActiveHerd] = useState("");
  const [herdSearch, setHerdSearch] = useState("");
  const [herdPage, setHerdPage] = useState(1);
  const [herdPages, setHerdPages] = useState(1);
  const [herdHorses, setHerdHorses] = useState([]);

  const [form, setForm] = useState({
    horseId: "",
    name: "",
    birthYear: "",
    sex: "",
    color: "",
    owner: "",
    lineage: "",
    brandMark: "",
    sire: "",
    dam: "",
    herd: ""
  });

  const isAdmin = user?.role === "admin";
  const userInitial = user?.name?.[0]?.toUpperCase() || "Х";
  const roleLabel = isAdmin ? "Админ" : "Үйлчлүүлэгч";

  const limit = 10;
  const sexLabels = { male: "Эр", female: "Эм" };

  const loadHorses = async (p = 1, query = "", herdId = "") => {
    const { data } = await api.get("/horses", { params: { page: p, limit, q: query, herdId } });
    setHorses(data.items);
    setPage(data.page);
    setPages(data.pages);
  };

  const loadHerds = async (query = "") => {
    const { data } = await api.get("/herds", { params: { q: query } });
    setHerds(data);
  };

  const loadHerdHorses = async (herdId, p = 1, query = "") => {
    if (!herdId) {
      setHerdHorses([]);
      setHerdPage(1);
      setHerdPages(1);
      return;
    }
    const { data } = await api.get(`/herds/${herdId}/horses`, { params: { page: p, limit, q: query } });
    setHerdHorses(data.items);
    setHerdPage(data.page);
    setHerdPages(data.pages);
  };

  useEffect(() => {
    loadHorses(1, "");
    loadHerds("");
  }, []);

  const resetForm = () =>
    setForm({
      horseId: "",
      name: "",
      birthYear: "",
      sex: "",
      color: "",
      owner: "",
      lineage: "",
      brandMark: "",
      sire: "",
      dam: "",
      herd: ""
    });

  const createHorse = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const payload = {
      ...form,
      birthYear: form.birthYear ? Number(form.birthYear) : undefined,
      sex: form.sex,
      sire: form.sire || null,
      dam: form.dam || null,
      herd: form.herd || null
    };
    try {
      await api.post("/horses", payload);
      await loadHorses(page, q);
      if (activeHerd) await loadHerdHorses(activeHerd, herdPage, herdSearch);
      resetForm();
      alert("Амжилттай нэмлээ.");
    } catch (err) {
      alert(err?.response?.data?.error || "Алдаа");
    }
  };

  const removeHorse = async (id) => {
    if (!isAdmin) return;
    if (!confirm("Устгах уу?")) return;
    await api.delete(`/horses/${id}`);
    await loadHorses(page, q);
    if (activeHerd) await loadHerdHorses(activeHerd, herdPage, herdSearch);
  };

  const searchAll = async (e) => {
    e.preventDefault();
    await loadHorses(1, q);
  };

  const resetHerdForm = () => {
    setHerdForm({ name: "", stallion: "" });
    setEditingHerdId("");
  };

  const submitHerd = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const payload = { name: herdForm.name.trim(), stallion: herdForm.stallion || null };
    if (!payload.name) return alert("Сүргийн нэр оруулна уу.");
    try {
      if (editingHerdId) {
        await api.put(`/herds/${editingHerdId}`, payload);
        alert("Сүргийн мэдээллийг шинэчиллээ.");
      } else {
        await api.post("/herds", payload);
        alert("Сүрэг амжилттай үүслээ.");
      }
      await loadHerds("");
      resetHerdForm();
    } catch (err) {
      alert(err?.response?.data?.error || "Алдаа");
    }
  };

  const startEditHerd = (herd) => {
    setEditingHerdId(herd._id);
    setHerdForm({ name: herd.name, stallion: herd?.stallion?._id || "" });
  };

  const deleteHerd = async (herdId) => {
    if (!isAdmin) return;
    if (!confirm("Сүргийг устгах уу?")) return;
    try {
      await api.delete(`/herds/${herdId}`);
      if (activeHerd === herdId) {
        setActiveHerd("");
        setHerdHorses([]);
        setHerdPage(1);
        setHerdPages(1);
      }
      if (editingHerdId === herdId) {
        resetHerdForm();
      }
      await loadHerds("");
      alert("Сүргийг устгалаа.");
    } catch (err) {
      alert(err?.response?.data?.error || "Алдаа");
    }
  };

  const herdOptions = useMemo(
    () => herds.map((h) => ({ value: h._id, label: `${h.name} — (тоо: ${h.membersCount})` })),
    [herds]
  );
  const maleHorseOptions = useMemo(
    () =>
      horses
        .filter((h) => h.sex === "male")
        .map(formatHorseOption),
    [horses]
  );
  const femaleHorseOptions = useMemo(
    () =>
      horses
        .filter((h) => h.sex === "female")
        .map(formatHorseOption),
    [horses]
  );
  const stallionOptions = maleHorseOptions;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="brand-icon">Х</div>
          <div>
            <div className="brand-title">ХҮННҮ</div>
            <div className="brand-subtitle">Админ самбар</div>
          </div>
        </div>
        <nav className="sidebar__nav">
          <span className="nav-label">Глобал</span>
          <button type="button" className="nav-item active">Дашбоард</button>
          <span className="nav-label">Менежмент</span>
          <button type="button" className="nav-item">Тохиргоо</button>
        </nav>
        <div className="sidebar__footer">
          <button type="button" className="btn btn-light" onClick={onLogout}>
            Гарах
          </button>
        </div>
      </aside>

      <div className="content-area">
        <header className="topbar">
          <div>
            <div className="topbar__eyebrow">Сургалтын модуль байршил</div>
            <h1 className="topbar__title">Бүртгэлийн маягт</h1>
          </div>
          <div className="topbar__actions">
            <button type="button" className="btn btn-light">Тусламж</button>
            <div className="user-chip">
              <div className="user-chip__avatar">{userInitial}</div>
              <div>
                <div className="user-chip__name">{user?.name}</div>
                <div className="user-chip__role">{roleLabel}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="page-wrapper">
          <section className="page-hero">
            <div>
              <div className="hero-eyebrow">Бүртгэлийн модуль</div>
              <h2>Адууны бүртгэлийн удирдлага</h2>
              <p>Сүрэг, угшил болон эзэмшигчийн мэдээллийг нэг дор удирдаарай.</p>
              <div className="hero-actions">
                <button type="button" className="btn btn-primary">Шинэ маягт</button>
                <button type="button" className="btn btn-ghost">Хуваалцах</button>
              </div>
            </div>
            <div className="hero-stats">
              <div className="stat-card">
                <span className="stat-label">Адуунууд</span>
                <strong>{horses.length}</strong>
                <small>энэ хуудсан дахь бүртгэл</small>
              </div>
              <div className="stat-card">
                <span className="stat-label">Сүргүүд</span>
                <strong>{herds.length}</strong>
                <small>идэвхтэй бүртгэл</small>
              </div>
            </div>
          </section>

          <section className="card">
            <header className="card__header">
              <div>
                <h3>Ерөнхий хайлт</h3>
                <p>Адуу, эзэмшигч эсвэл сүргийн нэрээр хайлт хийх боломжтой.</p>
              </div>
            </header>
            <form onSubmit={searchAll} className="search-form">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Хайх: дугаар, нэр, эзэмшигч, зүс, угшил, тамга, сүргийн нэр..."
              />
              <button type="submit" className="btn btn-primary">Хайх</button>
            </form>
          </section>

          {isAdmin && (
            <section className="card">
              <header className="card__header">
                <div>
                  <h3>Шинэ адуу нэмэх</h3>
                  <p>Адууны угшил болон сүргийн мэдээллийг дэлгэрэнгүй бөглөнө үү.</p>
                </div>
              </header>
              <form onSubmit={createHorse} className="form-grid">
                <input
                  required
                  placeholder="Адууны дугаар (давтагдашгүй)"
                  value={form.horseId}
                  onChange={(e) => setForm((f) => ({ ...f, horseId: e.target.value }))}
                />
                <input
                  placeholder="Нэр"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                <input
                  placeholder="Төрсөн он"
                  type="number"
                  value={form.birthYear}
                  onChange={(e) => setForm((f) => ({ ...f, birthYear: e.target.value }))}
                />
                <select
                  required
                  value={form.sex}
                  onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value }))}
                >
                  <option value="" disabled>
                    Хүйс (сонгох)
                  </option>
                  <option value="male">Эр</option>
                  <option value="female">Эм</option>
                </select>
                <input
                  placeholder="Зүс"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                />
                <input
                  placeholder="Эзэмшигч"
                  value={form.owner}
                  onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
                />
                <input
                  placeholder="Угшил"
                  value={form.lineage}
                  onChange={(e) => setForm((f) => ({ ...f, lineage: e.target.value }))}
                />
                <input
                  placeholder="Тамга"
                  value={form.brandMark}
                  onChange={(e) => setForm((f) => ({ ...f, brandMark: e.target.value }))}
                />

                <select value={form.sire} onChange={(e) => setForm((f) => ({ ...f, sire: e.target.value }))}>
                  <option value="">Эцэг (сонгох)</option>
                  {maleHorseOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <select value={form.dam} onChange={(e) => setForm((f) => ({ ...f, dam: e.target.value }))}>
                  <option value="">Эх (сонгох)</option>
                  {femaleHorseOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <select value={form.herd} onChange={(e) => setForm((f) => ({ ...f, herd: e.target.value }))}>
                  <option value="">Сүрэг (сонгох)</option>
                  {herdOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Нэмэх
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={resetForm}>
                    Цэвэрлэх
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="card">
            <header className="card__header">
              <div>
                <h3>Адуунуудын жагсаалт</h3>
                <p>Хуудас хооронд шилжиж, шаардлагатай үед бүртгэлийг устгана уу.</p>
              </div>
            </header>
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Дугаар</th>
                    <th>Нэр</th>
                    <th>Төрсөн он</th>
                    <th>Хүйс</th>
                    <th>Зүс</th>
                    <th>Эзэмшигч</th>
                    <th>Угшил</th>
                    <th>Тамга</th>
                    <th>Эцэг</th>
                    <th>Эх</th>
                    <th>Сүрэг</th>
                    {isAdmin && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {horses.map((h) => (
                    <tr key={h._id}>
                      <td>{h.horseId}</td>
                      <td>{h.name}</td>
                      <td>{h.birthYear}</td>
                      <td>{sexLabels[h.sex] || "-"}</td>
                      <td>{h.color}</td>
                      <td>{h.owner}</td>
                      <td>{h.lineage}</td>
                      <td>{h.brandMark}</td>
                      <td>{h.sire ? h.sire.horseId + (h.sire.name ? ` (${h.sire.name})` : "") : "-"}</td>
                      <td>{h.dam ? h.dam.horseId + (h.dam.name ? ` (${h.dam.name})` : "") : "-"}</td>
                      <td>{h.herd ? h.herd.name : "-"}</td>
                      {isAdmin && (
                        <td className="table-actions">
                          <button type="button" className="btn btn-danger" onClick={() => removeHorse(h._id)}>
                            Устгах
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {horses.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 12 : 11} style={{ textAlign: "center" }}>
                        Мэдээлэл алга
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                type="button"
                className="btn btn-light"
                disabled={page <= 1}
                onClick={() => loadHorses(page - 1, q)}
              >
                Өмнөх
              </button>
              <span className="pagination__status">
                {page} / {pages}
              </span>
              <button
                type="button"
                className="btn btn-light"
                disabled={page >= pages}
                onClick={() => loadHorses(page + 1, q)}
              >
                Дараах
              </button>
            </div>
          </section>

          <section className="card">
            <header className="card__header">
              <div>
                <h3>Сүрэг удирдлага</h3>
                <p>Сүрэг үүсгэж, гишүүдийн жагсаалтыг удирдаарай.</p>
              </div>
            </header>
            {isAdmin && (
              <form onSubmit={submitHerd} className="herd-form">
                <input
                  placeholder="Сүргийн нэр"
                  value={herdForm.name}
                  onChange={(e) => setHerdForm((f) => ({ ...f, name: e.target.value }))}
                />
                <select
                  value={herdForm.stallion}
                  onChange={(e) => setHerdForm((f) => ({ ...f, stallion: e.target.value }))}
                >
                  <option value="">Азарга (сонгох)</option>
                  {stallionOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <div className="herd-form__actions">
                  <button type="submit" className="btn btn-primary">
                    {editingHerdId ? "Шинэчлэх" : "Үүсгэх"}
                  </button>
                  {editingHerdId && (
                    <button type="button" className="btn btn-ghost" onClick={resetHerdForm}>
                      Цуцлах
                    </button>
                  )}
                </div>
              </form>
            )}

            <div className="split-panels">
              <div className="panel">
                <div className="panel__header">
                  <h4>Сүргүүд</h4>
                  <span className="panel__meta">Нийт {herds.length}</span>
                </div>
                <ul className="herd-list">
                  {herds.map((h) => (
                    <li key={h._id} className={activeHerd === h._id ? "active" : ""}>
                      <div className="herd-list__item">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveHerd(h._id);
                            setHerdSearch("");
                            loadHerdHorses(h._id, 1, "");
                          }}
                        >
                          <span className="herd-name">{h.name}</span>
                          <span className="herd-meta">Гишүүд: {h.membersCount}</span>
                          {h.stallion ? (
                            <span className="herd-meta">
                              Азарга: {h.stallion.horseId}
                              {h.stallion.name ? ` (${h.stallion.name})` : ""}
                            </span>
                          ) : null}
                        </button>
                        {isAdmin && (
                          <div className="herd-actions">
                            <button type="button" className="btn btn-ghost" onClick={() => startEditHerd(h)}>
                              Засах
                            </button>
                            <button type="button" className="btn btn-danger" onClick={() => deleteHerd(h._id)}>
                              Устгах
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                  {herds.length === 0 && <li className="empty">Сүрэг алга</li>}
                </ul>
              </div>

              <div className="panel">
                <div className="panel__header">
                  <h4>Сонгосон сүргийн адуунууд</h4>
                  {activeHerd && <span className="panel__meta">{herdHorses.length} илэрц</span>}
                </div>
                {activeHerd ? (
                  <>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        loadHerdHorses(activeHerd, 1, herdSearch);
                      }}
                      className="search-form search-form--compact"
                    >
                      <input
                        value={herdSearch}
                        onChange={(e) => setHerdSearch(e.target.value)}
                        placeholder="Сүрэг дотор: ямар ч мэдээллээр хайх"
                      />
                      <button type="submit" className="btn btn-primary">
                        Хайх
                      </button>
                    </form>

                    <div className="table-card">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Дугаар</th>
                            <th>Нэр</th>
                            <th>Төрсөн он</th>
                            <th>Хүйс</th>
                            <th>Зүс</th>
                            <th>Эзэмшигч</th>
                            <th>Эцэг</th>
                            <th>Эх</th>
                          </tr>
                        </thead>
                        <tbody>
                          {herdHorses.map((h) => (
                            <tr key={h._id}>
                              <td>{h.horseId}</td>
                              <td>{h.name}</td>
                              <td>{h.birthYear}</td>
                              <td>{sexLabels[h.sex] || "-"}</td>
                              <td>{h.color}</td>
                              <td>{h.owner}</td>
                              <td>{h.sire ? h.sire.horseId + (h.sire.name ? ` (${h.sire.name})` : "") : "-"}</td>
                              <td>{h.dam ? h.dam.horseId + (h.dam.name ? ` (${h.dam.name})` : "") : "-"}</td>
                            </tr>
                          ))}
                          {herdHorses.length === 0 && (
                            <tr>
                              <td colSpan="8" style={{ textAlign: "center" }}>
                                Мэдээлэл алга
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="pagination">
                      <button
                        type="button"
                        className="btn btn-light"
                        disabled={herdPage <= 1}
                        onClick={() => loadHerdHorses(activeHerd, herdPage - 1, herdSearch)}
                      >
                        Өмнөх
                      </button>
                      <span className="pagination__status">
                        {herdPage} / {herdPages}
                      </span>
                      <button
                        type="button"
                        className="btn btn-light"
                        disabled={herdPage >= herdPages}
                        onClick={() => loadHerdHorses(activeHerd, herdPage + 1, herdSearch)}
                      >
                        Дараах
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="empty-panel">Зүүн талаас сүрэг сонгоно уу.</div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
