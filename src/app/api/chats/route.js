import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || "agro_vet");

    const chats = await db.collection("chats").find({}).sort({ updatedAt: -1 }).toArray();

    return NextResponse.json({ success: true, data: chats }, { status: 200 });
  } catch (error) {
    console.error("GET_CHATS_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unable to fetch chats." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { chatId, message, sender } = body;

    if (!chatId || !message || !sender) {
      return NextResponse.json({ success: false, error: "Chat ID, message, and sender are required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || "agro_vet");

    const messageDoc = {
      chatId: new ObjectId(chatId),
      message,
      sender,
      createdAt: new Date(),
    };

    const result = await db.collection("messages").insertOne(messageDoc);

    // Update chat's last message and timestamp
    await db.collection("chats").updateOne(
      { _id: new ObjectId(chatId) },
      {
        $set: {
          lastMessage: message,
          updatedAt: new Date(),
        },
        $inc: { unreadCount: sender === "customer" ? 1 : 0 },
      }
    );

    return NextResponse.json({ success: true, insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("SEND_MESSAGE_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unable to send message." },
      { status: 500 }
    );
  }
}