import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

const ChatSchema = new mongoose.Schema({
  userEmail: String,
  prompt: String,
  response: String,
  timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(); 
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "আগে লগইন করো বন্ধু! 🔑" }, { status: 401 });
    }

    const userEmail = session.user.email;
    const { message } = await req.json();
    await connectDB();

    const previousChats = await Chat.find({ userEmail })
      .sort({ timestamp: -1 })
      .limit(5);
    
    let history = previousChats.reverse().flatMap((chat) => [
      { role: "user", content: chat.prompt },
      { role: "assistant", content: chat.response }
    ]);

    const apiKey = process.env.GROQ_API_KEY;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", 
        messages: [
          { 
            role: "system", 
            content: `তুমি একজন অত্যন্ত মিষ্টি এবং প্রফেশনাল এআই (AI)। তোমার সৃষ্টিকর্তার নাম হলো 'ADIAT SARKER'। 
            
            তোমার কথা বলার নতুন রুলস:
            🌟 তুমি সবসময় খুব মিষ্টি করে এবং আন্তরিকতার সাথে কথা বলবে।
            💎 প্রতিটি উত্তরে প্রাসঙ্গিক ইমোজি (Emoji) ব্যবহার করবে।
            🚀 তোমার বস বা ক্রিয়েটর 'ADIAT SARKER' সম্পর্কে কেউ জানতে চাইলে খুব গর্বের সাথে বলবে।
            💬 সাধারণ হাই/হ্যালো বা ছোট কথার ক্ষেত্রে খুব শর্ট এবং কিউট উত্তর দিবে। 🤐
            📚 যদি ইউজার কোনো কিছু বুঝাতে বলে বা টেকনিক্যাল কিছু জানতে চায়, তবে সেটা খুব বড় এবং ডিটেইলসে সুন্দর করে বুঝিয়ে বলবে। 📖
            🤝 রোবটের মতো বারবার প্রশ্ন করবে না, বরং বন্ধুর মতো কথা বলবে। যেমন: দিনকাল কেমন যাচ্ছে বা শরীর কেমন—এই টাইপ ফ্রেন্ডলি আলাপ করবে। ☕
            📝 কোনো কিছু পয়েন্ট আকারে লিখলে প্রতিটি লাইনের শুরুতে সুন্দর ইমোজি ব্যবহার করবে।
            🇧🇩 সবসময় বাংলা ভাষায় কথা বলবে এবং ইউজারের নাম ${session.user.name} ধরে সম্বোধন করবে।
            🧠 আগের কথা মনে রেখে বুদ্ধিমত্তার সাথে উত্তর দিবে।`
          },
          ...history, 
          { role: "user", content: message },
        ],
        temperature: 0.7, 
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    await Chat.create({ 
      userEmail, 
      prompt: message, 
      response: aiResponse 
    });

    return NextResponse.json({ answer: aiResponse });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "মেমোরিতে সমস্যা হয়েছে বন্ধু! 🥺" }, { status: 500 });
  }
}