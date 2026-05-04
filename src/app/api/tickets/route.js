import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { findDocuments } from "@/lib/db-operations"; // আপনার পাথ অনুযায়ী চেক করে নিন

// ডাটা গেট করার জন্য (GET Method)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all"; 
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const collectionsMap = {
      "livestock": ["livestock-tickets"],
      "agro": ["agri-consaltancy-ticket"],
      "pet-care": ["pet-care-tickets"],
      "all": ["livestock-tickets", "agri-consaltancy-ticket", "pet-care-tickets"]
    };

    const targetCollections = collectionsMap[type] || collectionsMap["all"];
    let combinedData = [];

    for (const col of targetCollections) {
      const data = await findDocuments(col);
      if (!data) continue;

      const filteredData = status === "all" 
        ? data 
        : data.filter(item => (item.status || 'pending').toLowerCase() === status.toLowerCase());

      const formatted = filteredData.map(item => ({
        ...item,
        categoryType: col,
        // Livestock-এ bookingDate নেই, তাই createdAt ব্যবহার করা হয়েছে
        displayDate: item.bookingDate || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'),
        status: item.status || 'pending'
      }));

      combinedData = [...combinedData, ...formatted];
    }

    combinedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = combinedData.length;
    const paginatedData = combinedData.slice(skip, skip + limit);

    return NextResponse.json({ success: true, data: paginatedData, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// টিকেট আপডেট করার জন্য (PATCH Method)
export async function PATCH(req) {
  try {
    const { id, collection, status } = await req.json();
    
    if (!id || !collection || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || "agro_vet");

    const result = await db.collection(collection).updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: status } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, error: "No changes made" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Ticket updated successfully" });

  } catch (error) {
    console.error("PATCH API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// টিকেট ডিলিট করার জন্য (DELETE Method)
export async function DELETE(req) {
  try {
    const { id, collection } = await req.json();

    if (!id || !collection) {
      return NextResponse.json({ success: false, error: "ID and Collection name required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || "agro_vet");

    const result = await db.collection(collection).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Ticket deleted successfully" });

  } catch (error) {
    console.error("DELETE API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}