import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

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
      <h1>Адууны бүртгэлийн апп</h1>

      <form onSubmit={searchAll} className="search-form primary-search">
        <input
          className="input-grow"
          value={q}
          onChange={e=>setQ(e.target.value)}
          placeholder="Хайх: дугаар, нэр, эзэмшигч, зүс, угшил, тамга, СҮРГИЙН НЭР..."
        />
        <button type="submit">Хайх</button>
      </form>

      <details open className="section-card">
        <summary><b>Шинэ адуу нэмэх</b></summary>
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
            <button type="submit">Нэмэх</button>
            <button type="button" onClick={resetForm}>Цэвэрлэх</button>
          </div>
        </form>
      </details>

      <table className="data-table">
        <thead>
          <tr>
            <th>Дугаар</th><th>Нэр</th><th>Төрсөн он</th><th>Зүс</th><th>Эзэмшигч</th>
            <th>Угшил</th><th>Тамга</th><th>Эцэг</th><th>Эх</th><th>Сүрэг</th><th></th>
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
              <td><button onClick={()=>removeHorse(h._id)}>Устгах</button></td>
            </tr>
          ))}
          {horses.length === 0 && <tr><td colSpan="11" className="empty-cell">Мэдээлэл алга</td></tr>}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={page<=1} onClick={()=>loadHorses(page-1, q)}>Өмнөх</button>
        <span>{page} / {pages}</span>
        <button disabled={page>=pages} onClick={()=>loadHorses(page+1, q)}>Дараах</button>
      </div>

      <hr className="section-divider" />
      <h2>Сүрэг</h2>

      <details open className="section-card">
        <summary><b>Сүрэг үүсгэх</b> (азаргыг сонговол тухайн адуу тэр сүргийн азарга болно)</summary>
        <form onSubmit={createHerd} className="inline-form">
          <input placeholder="Сүргийн нэр" value={herdForm.name} onChange={e=>setHerdForm(f=>({...f, name:e.target.value}))}/>
          <select value={herdForm.stallion} onChange={e=>setHerdForm(f=>({...f, stallion:e.target.value}))}>
            <option value="">Азарга (сонгох)</option>
            {stallionOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button type="submit">Үүсгэх</button>
        </form>
      </details>

      <div className="split-grid">
        <div>
          <b>Сүргүүд</b>
          <ul className="herd-list">
            {herds.map(h => (
              <li key={h._id} className="herd-list-item">
                <button
                  type="button"
                  className="herd-list-button"
                  onClick={() => { setActiveHerd(h._id); setHerdSearch(""); loadHerdHorses(h._id, 1, ""); }}
                >
                  {h.name} — гишүүд: {h.membersCount} {h.stallion ? ` | азарга: ${h.stallion.horseId}${h.stallion.name?` (${h.stallion.name})`:""}` : ""}
                </button>
              </li>
            ))}
            {herds.length === 0 && <i>Сүрэг алга</i>}
          </ul>
        </div>

        <div>
          <b>Сонгосон сүргийн адуунууд</b>
          {activeHerd ? (
            <>
              <form onSubmit={(e)=>{e.preventDefault(); loadHerdHorses(activeHerd, 1, herdSearch);}} className="search-form herd-search-form">
                <input className="input-grow" value={herdSearch} onChange={e=>setHerdSearch(e.target.value)} placeholder="Сүрэг дотор: ямар ч мэдээллээр хайх"/>
                <button type="submit">Хайх</button>
              </form>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Дугаар</th><th>Нэр</th><th>Төрсөн он</th><th>Зүс</th><th>Эзэмшигч</th><th>Эцэг</th><th>Эх</th>
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
                  {herdHorses.length === 0 && <tr><td colSpan="7" className="empty-cell">Мэдээлэл алга</td></tr>}
                </tbody>
              </table>

              <div className="pagination">
                <button disabled={herdPage<=1} onClick={()=>loadHerdHorses(activeHerd, herdPage-1, herdSearch)}>Өмнөх</button>
                <span>{herdPage} / {herdPages}</span>
                <button disabled={herdPage>=herdPages} onClick={()=>loadHerdHorses(activeHerd, herdPage+1, herdSearch)}>Дараах</button>
              </div>
            </>
          ) : <div className="empty-state">Зүүн талаас сүрэг сонгоно уу.</div>}
        </div>
      </div>
    </div>
  );
}
