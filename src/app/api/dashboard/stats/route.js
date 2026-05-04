import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "Today";
    
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || "agro_vet");

    // ১. টাইমরেঞ্জ সেট করা
    let startDate = new Date();
    if (filter === "Today") startDate.setHours(0, 0, 0, 0);
    else if (filter === "Yesterday") {
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
    } 
    else if (filter === "Last Week") startDate.setDate(startDate.getDate() - 7);
    else if (filter === "Last Month") startDate.setMonth(startDate.getMonth() - 1);
    else if (filter === "Last Year") startDate.setFullYear(startDate.getFullYear() - 1);
    else startDate = new Date(0); // All Time

    const query = { createdAt: { $gte: startDate } };

    // ২. প্যারালাল ডাটা ফেচিং (Performance-এর জন্য)
    const [orders, agriTickets, petTickets, livestockTickets] = await Promise.all([
      db.collection("orders").find(query).toArray(),
      db.collection("agri-consaltancy-ticket").find(query).toArray(),
      db.collection("pet-care-tickets").find(query).toArray(),
      db.collection("livestock-tickets").find(query).toArray()
    ]);

    // ৩. ক্যালকুলেশন
    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const productsSold = orders.reduce((sum, order) => sum + (order.items?.length || 0), 0);
    
    const allTickets = [...agriTickets, ...petTickets, ...livestockTickets];
    const ticketsBooked = allTickets.length;
    const ticketsCompleted = allTickets.filter(t => t.status === "completed").length;

    return NextResponse.json({
      success: true,
      stats: {
        totalSales: `৳ ${totalSales.toLocaleString()}`,
        productsSold,
        ticketsBooked,
        ticketsCompleted
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}