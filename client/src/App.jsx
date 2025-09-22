import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import "./App.css";

export default function App() {
  const [horses, setHorses] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [herds, setHerds] = useState([]);
  const [herdForm, setHerdForm] = useState({ name: "", stallion: "" });
  const [activeHerd, setActiveHerd] = useState("");
  const [herdSearch, setHerdSearch] = useState("");
  const [herdPage, setHerdPage] = useState(1);
  const [herdPages, setHerdPages] = useState(1);
  const [herdHorses, setHerdHorses] = useState([]);

  const [form, setForm] = useState({
    horseId: "",
    name: "",
    birthYear: "",
    color: "",
    owner: "",
    lineage: "",
    brandMark: "",
    sire: "",
    dam: "",
    herd: ""
  });

  const limit = 10;

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
    if (!herdId) { setHerdHorses([]); setHerdPage(1); setHerdPages(1); return; }
    const { data } = await api.get(`/herds/${herdId}/horses`, { params: { page: p, limit, q: query } });
    setHerdHorses(data.items);
    setHerdPage(data.page);
    setHerdPages(data.pages);
  };

  useEffect(() => { loadHorses(1, ""); loadHerds(""); }, []);

  const resetForm = () => setForm({
    horseId: "", name: "", birthYear: "", color: "", owner: "", lineage: "", brandMark: "", sire: "", dam: "", herd: ""
  });

  const createHorse = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      birthYear: form.birthYear ? Number(form.birthYear) : undefined,
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
    if (!confirm("Устгах уу?")) return;
    await api.delete(`/horses/${id}`);
    await loadHorses(page, q);
    if (activeHerd) await loadHerdHorses(activeHerd, herdPage, herdSearch);
  };

  const searchAll = async (e) => {
    e.preventDefault();
    await loadHorses(1, q);
  };

  const createHerd = async (e) => {
    e.preventDefault();
    const payload = { name: herdForm.name.trim(), stallion: herdForm.stallion || null };
    if (!payload.name) return alert("Сүргийн нэр оруулна уу.");
    try {
      await api.post("/herds", payload);
      await loadHerds("");
      setHerdForm({ name: "", stallion: "" });
      alert("Сүрэг амжилттай үүслээ.");
    } catch (err) {
      alert(err?.response?.data?.error || "Алдаа");
    }
  };

  const herdOptions = useMemo(
    () => herds.map(h => ({ value: h._id, label: `${h.name} — (тоо: ${h.membersCount})` })),
    [herds]
  );
  const horseOptions = useMemo(
    () => horses.map(h => ({ value: h._id, label: `${h.horseId} — ${h.name || ""}`.trim() })),
    [horses]
  );
  const stallionOptions = horseOptions;

  return (
    <div className="app-shell">
      <div className="app-container">
        <header className="card page-header">
          <div className="page-header__text">
            <h1>Адууны бүртгэлийн апп</h1>
            <p className="page-subtitle">Адуу бүрийн мэдээллийг эмх цэгцтэй хөтөлж, сүргүүдийн бүрэлдэхүүнийг бодит цагт хянах боломжтой.</p>
          </div>

          <form onSubmit={searchAll} className="search-form">
            <input
              value={q}
              onChange={e=>setQ(e.target.value)}
              placeholder="Хайх: дугаар, нэр, эзэмшигч, зүс, угшил, тамга, сүргийн нэр..."
            />
            <button type="submit" className="primary-button">Хайх</button>
          </form>
        </header>

        <section className="card">
          <details open className="collapsible">
            <summary><b>Шинэ адуу нэмэх</b></summary>
            <p className="section-subtitle">Анкетыг бөглөөд хадгалснаар адуу бүх жагсаалтад болон холбогдох сүргүүдэд автоматаар харагдана.</p>
            <form onSubmit={createHorse} className="form-grid">
              <input required placeholder="Адууны дугаар (давтагдашгүй)" value={form.horseId} onChange={e=>setForm(f=>({...f, horseId:e.target.value}))}/>
              <input placeholder="Нэр" value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))}/>
              <input placeholder="Төрсөн он" type="number" value={form.birthYear} onChange={e=>setForm(f=>({...f, birthYear:e.target.value}))}/>
              <input placeholder="Зүс" value={form.color} onChange={e=>setForm(f=>({...f, color:e.target.value}))}/>
              <input placeholder="Эзэмшигч" value={form.owner} onChange={e=>setForm(f=>({...f, owner:e.target.value}))}/>
              <input placeholder="Угшил" value={form.lineage} onChange={e=>setForm(f=>({...f, lineage:e.target.value}))}/>
              <input placeholder="Тамга" value={form.brandMark} onChange={e=>setForm(f=>({...f, brandMark:e.target.value}))}/>

              <select value={form.sire} onChange={e=>setForm(f=>({...f, sire:e.target.value}))}>
                <option value="">Эцэг (сонгох)</option>
                {horseOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={form.dam} onChange={e=>setForm(f=>({...f, dam:e.target.value}))}>
                <option value="">Эх (сонгох)</option>
                {horseOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              <select value={form.herd} onChange={e=>setForm(f=>({...f, herd:e.target.value}))}>
                <option value="">Сүрэг (сонгох)</option>
                {herdOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              <div className="form-actions">
                <button type="submit" className="primary-button">Нэмэх</button>
                <button type="button" className="secondary-button" onClick={resetForm}>Цэвэрлэх</button>
              </div>
            </form>
          </details>
        </section>

        <section className="card">
          <div className="section-heading">
            <div>
              <h2>Адуунуудын жагсаалт</h2>
              <p className="section-subtitle">Бүртгэлтэй бүх адууг харах, мэдээллийг засах эсвэл устгах боломжтой.</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Дугаар</th>
                  <th>Нэр</th>
                  <th>Төрсөн он</th>
                  <th>Зүс</th>
                  <th>Эзэмшигч</th>
                  <th>Угшил</th>
                  <th>Тамга</th>
                  <th>Эцэг</th>
                  <th>Эх</th>
                  <th>Сүрэг</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {horses.map(h => (
                  <tr key={h._id}>
                    <td>{h.horseId}</td>
                    <td>{h.name}</td>
                    <td>{h.birthYear}</td>
                    <td>{h.color}</td>
                    <td>{h.owner}</td>
                    <td>{h.lineage}</td>
                    <td>{h.brandMark}</td>
                    <td>{h.sire ? (h.sire.horseId + (h.sire.name ? ` (${h.sire.name})` : "")) : "-"}</td>
                    <td>{h.dam ? (h.dam.horseId + (h.dam.name ? ` (${h.dam.name})` : "")) : "-"}</td>
                    <td>{h.herd ? (h.herd.name) : "-"}</td>
                    <td>
                      <button type="button" className="ghost-button" onClick={()=>removeHorse(h._id)}>Устгах</button>
                    </td>
                  </tr>
                ))}
                {horses.length === 0 && (
                  <tr>
                    <td colSpan="11" className="empty-state">Мэдээлэл алга</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button disabled={page<=1} onClick={()=>loadHorses(page-1, q)} className="ghost-button">Өмнөх</button>
            <span>{page} / {pages}</span>
            <button disabled={page>=pages} onClick={()=>loadHorses(page+1, q)} className="ghost-button">Дараах</button>
          </div>
        </section>

        <section className="card">
          <div className="section-heading">
            <div>
              <h2>Сүргийн менежмент</h2>
              <p className="section-subtitle">Сүргүүдийг үүсгэж, тухайн сүрэгт харьяалагдах адууг нарийвчлан хянана.</p>
            </div>
          </div>

          <details open className="collapsible">
            <summary><b>Сүрэг үүсгэх</b></summary>
            <p className="section-subtitle">Азаргыг сонговол тухайн адуу тус сүргийн удирдагч азарга болж тэмдэглэгдэнэ.</p>
            <form onSubmit={createHerd} className="inline-form">
              <input placeholder="Сүргийн нэр" value={herdForm.name} onChange={e=>setHerdForm(f=>({...f, name:e.target.value}))}/>
              <select value={herdForm.stallion} onChange={e=>setHerdForm(f=>({...f, stallion:e.target.value}))}>
                <option value="">Азарга (сонгох)</option>
                {stallionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button type="submit" className="primary-button">Үүсгэх</button>
            </form>
          </details>

          <div className="split-layout">
            <div className="panel">
              <h3>Сүргүүд</h3>
              <ul className="herd-list">
                {herds.map(h => (
                  <li key={h._id}>
                    <button
                      type="button"
                      className={`herd-button${activeHerd === h._id ? " is-active" : ""}`}
                      onClick={() => { setActiveHerd(h._id); setHerdSearch(""); loadHerdHorses(h._id, 1, ""); }}
                    >
                      <span className="herd-name">{h.name}</span>
                      <span className="herd-meta">Гишүүд: {h.membersCount}</span>
                      {h.stallion && (
                        <span className="herd-meta">Азарга: {h.stallion.horseId}{h.stallion.name ? ` (${h.stallion.name})` : ""}</span>
                      )}
                    </button>
                  </li>
                ))}
                {herds.length === 0 && <li className="empty-state">Сүрэг алга</li>}
              </ul>
            </div>

            <div className="panel">
              <h3>Сонгосон сүргийн адуунууд</h3>
              {activeHerd ? (
                <>
                  <form
                    onSubmit={(e)=>{e.preventDefault(); loadHerdHorses(activeHerd, 1, herdSearch);}}
                    className="search-form search-form--compact"
                  >
                    <input value={herdSearch} onChange={e=>setHerdSearch(e.target.value)} placeholder="Сүрэг дотор: ямар ч мэдээллээр хайх"/>
                    <button type="submit" className="primary-button">Хайх</button>
                  </form>

                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Дугаар</th>
                          <th>Нэр</th>
                          <th>Төрсөн он</th>
                          <th>Зүс</th>
                          <th>Эзэмшигч</th>
                          <th>Эцэг</th>
                          <th>Эх</th>
                        </tr>
                      </thead>
                      <tbody>
                        {herdHorses.map(h => (
                          <tr key={h._id}>
                            <td>{h.horseId}</td>
                            <td>{h.name}</td>
                            <td>{h.birthYear}</td>
                            <td>{h.color}</td>
                            <td>{h.owner}</td>
                            <td>{h.sire ? (h.sire.horseId + (h.sire.name ? ` (${h.sire.name})` : "")) : "-"}</td>
                            <td>{h.dam ? (h.dam.horseId + (h.dam.name ? ` (${h.dam.name})` : "")) : "-"}</td>
                          </tr>
                        ))}
                        {herdHorses.length === 0 && (
                          <tr>
                            <td colSpan="7" className="empty-state">Мэдээлэл алга</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="pagination">
                    <button disabled={herdPage<=1} onClick={()=>loadHerdHorses(activeHerd, herdPage-1, herdSearch)} className="ghost-button">Өмнөх</button>
                    <span>{herdPage} / {herdPages}</span>
                    <button disabled={herdPage>=herdPages} onClick={()=>loadHerdHorses(activeHerd, herdPage+1, herdSearch)} className="ghost-button">Дараах</button>
                  </div>
                </>
              ) : (
                <div className="empty-state">Зүүн талаас сүрэг сонгоно уу.</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
