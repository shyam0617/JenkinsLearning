// A minimal Express server — just enough to see the pipeline deploy something.
import express from "express";
import { greet } from "./greet.js";

const app = express();

// Read the port from an environment variable, default to 3000.
// (Env vars are the standard way to configure apps in Docker/production.)
const PORT = process.env.PORT || 3000;

// Home route — returns a greeting. Try: /  or  /?name=Shyam
app.get("/", (req, res) => {
  res.send(greet(req.query.name));
});

// Health route — used to check the app is alive (common in CI/CD & Docker).
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
