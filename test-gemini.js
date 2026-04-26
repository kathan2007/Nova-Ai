
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function test() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return;

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Hi");
    console.log("Success! Response from 2.0 Flash:", result.response.text());
  } catch (e) {
    console.error("Test failed:", e.message);
  }
}

test();
