import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "aapat-sathi-backend" });
});

app.use("/api", apiRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
