import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// মডেলটি আলাদা ভেরিয়েবলে রাখলে সুবিধা
const ChatSchema = new mongoose.Schema({
  userEmail: String,
  prompt: String,
  response: String,
  timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    // ID ফরম্যাট ঠিক আছে কি না চেক করা (Optional but Recommended)
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Chat ID" }, { status: 400 });
    }

    await connectDB();

    // ডিলিট অপারেশন
    const result = await Chat.deleteOne({ _id: id, userEmail: session.user.email });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Chat not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}