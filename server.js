const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function offlineReply(message) {
  return `I couldn't reach the free AI API right now, but here's an offline helper response: You asked "${message}". Please try again in a moment, or configure another free provider in server.js.`;
}

app.post("/api/chat", async (req, res) => {
  const { message } = req.body || {};

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  const cleanedMessage = message.trim();

  try {
    const url = new URL("https://api.affiliateplus.xyz/api/chatbot");
    url.searchParams.set("message", cleanedMessage);
    url.searchParams.set("botname", "ChatGPT Clone");
    url.searchParams.set("ownername", "User");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "chatgpt-like-agent/1.0",
      },
    });

    if (!response.ok) {
      return res.json({
        reply: offlineReply(cleanedMessage),
        source: "offline-fallback",
      });
    }

    const data = await response.json();
    const reply = typeof data.message === "string" ? data.message : offlineReply(cleanedMessage);

    return res.json({ reply, source: "affiliateplus" });
  } catch (_error) {
    return res.json({
      reply: offlineReply(cleanedMessage),
      source: "offline-fallback",
    });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
