import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/generate-music", async (req, res) => {
    const { genre } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY not set" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
      const response = await ai.models.generateContentStream({
        model: "lyria-3-clip-preview",
        contents: `Generate a 30-second ${genre} track.`,
      });

      let audioBase64 = "";
      let mimeType = "audio/wav";

      for await (const chunk of response) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;

        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
        }
      }

      res.json({ audio: audioBase64, mimeType });
    } catch (error) {
      console.error("Error generating music:", error);
      res.status(500).json({ error: "Failed to generate music" });
    }
  });

  app.post("/api/generate-skeleton", async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY not set" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
      const prompt = `Generate a 16-step music sequencer pattern for a Christian Hip-Hop track. The structure must be exactly: { "grid": boolean[8][16], "sounds": string[8] }. The grid is an array of 8 arrays (representing 8 tracks), and each array has 16 booleans. Sounds must be selected from the following list: ['kick-1', 'snare-5', 'hat-1', 'hat-5', 'perc-3', 'synth-1', 'synth-10', 'synth-20', 'bass-1', 'piano-1']. Return only the raw JSON.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
      });

      const text = response.text() || "";
      const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
      const skeleton = JSON.parse(jsonStr);

      res.json(skeleton);
    } catch (error) {
      console.error("Error generating skeleton:", error);
      res.status(500).json({ error: "Failed to generate skeleton" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === "true" ? false : undefined
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const wss = new WebSocketServer({ server, path: "/api/ws" });
  
  const clients = new Map<WebSocket, { id: string; color: string }>();
  let nextId = 1;
  const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

  wss.on("connection", (ws) => {
    const id = `User ${nextId++}`;
    const color = colors[nextId % colors.length];
    clients.set(ws, { id, color });
    
    // Broadcast join
    const activeUsers = Array.from(clients.values());
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'presence', users: activeUsers }));
      }
    });

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'cursor') {
          data.userId = id;
          data.color = color;
        }
        
        // Broadcast to all other clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (e) {
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message.toString());
          }
        });
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      const remainingUsers = Array.from(clients.values());
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'presence', users: remainingUsers }));
        }
      });
    });
  });
}

startServer();
