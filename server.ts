import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { apiRouter } from "./src/server/routes.ts";
import { seedDatabase } from "./src/server/db.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Standard JSON and URL encoded parser body limits
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Seed the file-based database on startup for full demo ready
  seedDatabase();

  // API Router registration
  app.use("/api", apiRouter);

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Vite development or static files production handler middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting full-stack development mode with Vite HMR middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting full-stack production mode with static serving...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Deadline Guardian AI server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical: Failed to boot Express + Vite Server:", err);
});
