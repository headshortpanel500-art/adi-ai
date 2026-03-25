import mongoose, { Schema, Document, Model } from "mongoose";

// ১. টাইপস্ক্রিপ্ট ইন্টারফেস (এটি কোড লিখতে সাহায্য করবে)
export interface IMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  userEmail: string;
  messages: IMessage[];
  lastUpdated: Date;
}

// ২. চ্যাট স্কিমা ডিফাইন করা
const ChatSchema: Schema = new Schema({
  // ইউজারের ইমেইল (যাতে শুধু ওই ইউজার তার চ্যাট দেখতে পায়)
  userEmail: { 
    type: String, 
    required: true, 
    index: true // দ্রুত খোঁজার জন্য ইনডেক্স করা হলো
  },
  
  // পুরো চ্যাট সেশনটি একটি অ্যারের ভেতরে থাকবে
  messages: [
    {
      role: { 
        type: String, 
        enum: ["user", "assistant"], 
        required: true 
      },
      content: { 
        type: String, 
        required: true 
      },
      timestamp: { 
        type: Date, 
        default: Date.now 
      }
    }
  ],
  
  // সর্বশেষ কবে কথা হয়েছে তা ট্র্যাক করা (হিস্ট্রি সর্ট করার জন্য)
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
});

// ৩. মডেল এক্সপোর্ট করা (Next.js এর জন্য সেফ ওয়েতে)
export const Chat: Model<IChat> = 
  mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);