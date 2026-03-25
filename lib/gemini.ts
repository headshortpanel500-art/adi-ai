import { GoogleGenerativeAI } from "@google/generative-ai";

// তোমার পরিবেশ চলক (Environment Variable) থেকে কি-টি নিয়ে আসা হচ্ছে
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function askGemini(prompt: string) {
  // আমরা এখানে gemini-1.5-flash মডেল ব্যবহার করছি কারণ এটি অনেক দ্রুত
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}