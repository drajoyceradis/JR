import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

// If running in development, we will import vite later.
let createViteServer: any;
if (process.env.NODE_ENV !== 'production') {
  createViteServer = async () => {
    const vite = await import('vite');
    return vite.createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // --- API Routes ---
  
  app.post('/api/generate-video', async (req, res) => {
    try {
      const { prompt, imageBytes, mimeType } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY missing' });

      const ai = new GoogleGenAI({ apiKey });
      
      const config: any = {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      };
      
      const options: any = {
        model: 'veo-3.1-fast-generate-preview',
        config
      };
      
      if (prompt) options.prompt = prompt;
      if (imageBytes && mimeType) {
        options.image = {
          imageBytes,
          mimeType
        };
      }
      
      const operation = await ai.models.generateVideos(options);
      res.json({ operationName: operation.name });
    } catch (error: any) {
      console.error('Video generation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/video-status', async (req, res) => {
    try {
      const { operationName } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY missing' });

      const ai = new GoogleGenAI({ apiKey });
      const { GenerateVideosOperation } = await import('@google/genai');
      
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      
      res.json({ done: updated.done, error: updated.error });
    } catch (error: any) {
      console.error('Status check error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/video-download', async (req, res) => {
    try {
      const { operationName } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY missing' });

      const ai = new GoogleGenAI({ apiKey });
      const { GenerateVideosOperation } = await import('@google/genai');
      
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) return res.status(404).json({ error: 'Video URI not found' });
      
      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': apiKey },
      });
      
      res.setHeader('Content-Type', 'video/mp4');
      videoRes.body!.pipeTo(
        new WritableStream({
          write(chunk) { res.write(chunk); },
          close() { res.end(); },
        })
      );
    } catch (error: any) {
      console.error('Video download error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/search-health', async (req, res) => {
    try {
      const { query } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: query,
        config: {
          systemInstruction: "You are a helpful medical assistant for Dra. Joyce Radis. Use Google Search to provide up-to-date health information, but remind the user to consult Dra. Joyce for medical advice.",
          tools: [{ googleSearch: {} }],
        }
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Error with Gemini:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production' && createViteServer) {
    const vite = await createViteServer();
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
