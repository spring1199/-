import { verifyToken } from "../services/token.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Нэвтрэх шаардлагатай." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
      name: payload.name,
      email: payload.email
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Нэвтрэх эрх хүчингүй." });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Нэвтрэх шаардлагатай." });
  }

  if (roles.length === 0 || roles.includes(req.user.role)) {
    return next();
  }

  return res.status(403).json({ error: "Энэ үйлдлийг хийх эрхгүй." });
};
