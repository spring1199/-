import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../services/token.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

const sendAuthPayload = (res, user, status = 200) => {
  const token = signToken({
    sub: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  });

  return res.status(status).json({ token, user: buildUserResponse(user) });
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "customer" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Нэр, имэйл, нууц үг шаардлагатай." });
    }

    if (!["admin", "customer"].includes(role)) {
      return res.status(400).json({ error: "Буруу эрхийн түвшин." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Имэйл бүртгэлтэй байна." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    return sendAuthPayload(res, user, 201);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Имэйл болон нууц үг шаардлагатай." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Нэвтрэх мэдээлэл буруу." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Нэвтрэх мэдээлэл буруу." });
    }

    return sendAuthPayload(res, user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Хэрэглэгч олдсонгүй." });
    }

    return res.json({ user: buildUserResponse(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
