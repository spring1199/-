import express from "express";
import Horse from "../models/Horse.js";
import Herd from "../models/Herd.js";
import { syncOffspring } from "../services/lineageSync.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { q = "", page = 1, limit = 10, herdId = "" } = req.query;
    const herdIdsFromQ = q
      ? (await Herd.find({ name: { $regex: q, $options: "i" } }, { _id: 1 })).map(h => h._id)
      : [];

    const filter = {
      ...(q
        ? {
            $or: [
              { horseId: { $regex: q, $options: "i" } },
              { name: { $regex: q, $options: "i" } },
              { owner: { $regex: q, $options: "i" } },
              { color: { $regex: q, $options: "i" } },
              { lineage: { $regex: q, $options: "i" } },
              { brandMark: { $regex: q, $options: "i" } },
              { herd: { $in: herdIdsFromQ } }
            ]
          }
        : {}),
      ...(herdId ? { herd: herdId } : {})
    };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Horse.find(filter)
        .populate("sire", "horseId name")
        .populate("dam", "horseId name")
        .populate("offspring", "horseId name")
        .populate("herd", "name stallion")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Horse.countDocuments(filter)
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const doc = await Horse.findById(req.params.id)
      .populate("sire", "horseId name")
      .populate("dam", "horseId name")
      .populate("offspring", "horseId name")
      .populate("herd", "name");
  if (!doc) return res.status(404).json({ error: "Олдсонгүй" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    const created = await Horse.create(payload);
    await syncOffspring({
      horseId: created._id,
      prevSireId: null,
      prevDamId: null,
      newSireId: created.sire,
      newDamId: created.dam
    });
    res.status(201).json(created);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ error: "Адууны дугаар (horseId) давхардсан байна." });
    }
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const before = await Horse.findById(req.params.id).select("sire dam");
    const updated = await Horse.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: "Олдсонгүй" });

    await syncOffspring({
      horseId: updated._id,
      prevSireId: before?.sire || null,
      prevDamId: before?.dam || null,
      newSireId: updated.sire || null,
      newDamId: updated.dam || null
    });

    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const doc = await Horse.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: "Олдсонгүй" });
    const ops = [];
    if (doc.sire) ops.push(Horse.updateOne({ _id: doc.sire }, { $pull: { offspring: doc._id } }));
    if (doc.dam) ops.push(Horse.updateOne({ _id: doc.dam }, { $pull: { offspring: doc._id } }));
    if (ops.length) await Promise.all(ops);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/by/horseId/:horseId", async (req, res) => {
  try {
    const doc = await Horse.findOne({ horseId: req.params.horseId })
      .populate("sire", "horseId name")
      .populate("dam", "horseId name")
      .populate("herd", "name");
    if (!doc) return res.status(404).json({ error: "Олдсонгүй" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
