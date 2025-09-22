import express from "express";
import Herd from "../models/Herd.js";
import Horse from "../models/Horse.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { q = "" } = req.query;
    const baseFilter = q ? { name: { $regex: q, $options: "i" } } : {};
    const herds = await Herd.find(baseFilter)
      .populate("stallion", "horseId name")
      .sort({ createdAt: -1 });

    const counts = await Horse.aggregate([
      { $match: { herd: { $ne: null } } },
      { $group: { _id: "$herd", count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map(c => [String(c._id), c.count]));

    res.json(
      herds.map(h => ({
        _id: h._id,
        name: h.name,
        stallion: h.stallion,
        membersCount: countMap.get(String(h._id)) || 0
      }))
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/:herdId/horses", async (req, res) => {
  try {
    const { herdId } = req.params;
    const { q = "", page = 1, limit = 10 } = req.query;
    const filter = {
      herd: herdId,
      ...(q ? {
        $or: [
          { horseId: { $regex: q, $options: "i" } },
          { name: { $regex: q, $options: "i" } },
          { owner: { $regex: q, $options: "i" } },
          { color: { $regex: q, $options: "i" } },
          { lineage: { $regex: q, $options: "i" } },
          { brandMark: { $regex: q, $options: "i" } }
        ]
      } : {})
    };
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Horse.find(filter)
        .populate("sire", "horseId name")
        .populate("dam", "horseId name")
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

router.post("/", async (req, res) => {
  try {
    const created = await Herd.create({ name: req.body.name, stallion: req.body.stallion || null });
    res.status(201).json(created);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "Сүргийн нэр давхардсан байна." });
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Herd.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, stallion: req.body.stallion || null },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Олдсонгүй" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await Horse.updateMany({ herd: id }, { $set: { herd: null } });
    await Herd.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
