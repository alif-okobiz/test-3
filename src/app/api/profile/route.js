import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || "agro_vet");

    const profile = await db.collection("profiles").findOne({ role: "admin" });

    return NextResponse.json({
      success: true,
      data: profile || {
        name: "",
        email: "",
        phone: "",
        address: "",
        bio: "",
      }
    }, { status: 200 });
  } catch (error) {
    console.error("GET_PROFILE_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unable to fetch profile." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, bio } = body;

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || "agro_vet");

    const result = await db.collection("profiles").updateOne(
      { role: "admin" },
      {
        $set: {
          name,
          email,
          phone,
          address,
          bio,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          role: "admin",
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: "Profile updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("UPDATE_PROFILE_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unable to update profile." },
      { status: 500 }
    );
  }
}