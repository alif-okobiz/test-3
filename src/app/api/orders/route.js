import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || "agro_vet");

    const orders = await db.collection("orders").find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    console.error("GET_ORDERS_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unable to fetch orders." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Order ID and status are required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || "agro_vet");

    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, error: "Order not found or no changes made." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Order status updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("UPDATE_ORDER_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unable to update order." },
      { status: 500 }
    );
  }
}