import { VertexAI } from "@google-cloud/vertexai";

const vertex = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION,
});

const model = vertex.getGenerativeModel({ model: "gemini-2.5-pro" });
const res = await model.generateContent({ contents: [{ role: "user", parts: [{ text: "ping" }] }] });
console.log(res.response.candidates?.[0]?.content?.parts?.[0]?.text);
