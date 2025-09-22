import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import horsesRouter from "./routes/horses.js";
import herdsRouter from "./routes/herds.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => res.send("Horse Registry API ажиллаж байна"));

app.use("/api/horses", horsesRouter);
app.use("/api/herds", herdsRouter);

const PORT = process.env.PORT || 4000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`API: http://localhost:${PORT}`)))
  .catch((err) => { console.error("MongoDB холболтын алдаа:", err.message); process.exit(1); });
