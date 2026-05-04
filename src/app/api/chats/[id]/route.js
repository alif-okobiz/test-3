import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Chat ID is required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || "agro_vet");

    const messages = await db.collection("messages")
      .find({ chatId: new ObjectId(id) })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({ success: true, data: messages }, { status: 200 });
  } catch (error) {
    console.error("GET_MESSAGES_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unable to fetch messages." },
      { status: 500 }
    );
  }
}