import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// এখানে তোমার authOptions ইমপোর্ট করতে হতে পারে
// import { authOptions } from "../auth/[...nextauth]/route"; 

const ChatSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  prompt: String,
  response: String,
  timestamp: { type: Date, default: Date.now }
});

// মডেলটিকে একটু সেফভাবে ডিফাইন করা
const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

export async function GET() {
  try {
    const session = await getServerSession(); // তোমার প্রোজেক্টে authOptions থাকলে সেটা এখানে পাস করো
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    await connectDB();
    
    const history = await Chat.find({ userEmail: session.user.email })
      .sort({ timestamp: -1 }) 
      .limit(20)
      .lean(); // .lean() দিলে কুয়েরি ফাস্ট হয় কারণ এটি শুধু প্লেইন অবজেক্ট রিটার্ন করে
    
    return NextResponse.json(history);
  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}