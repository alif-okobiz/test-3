import { NextResponse } from "next/server";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_FOLDER = "admin-products";

async function uploadImage(base64Image) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signatureString = `folder=${CLOUDINARY_FOLDER}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

  const formData = new FormData();
  formData.append("file", base64Image);
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", timestamp.toString());
  formData.append("folder", CLOUDINARY_FOLDER);
  formData.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorBody}`);
  }

  return response.json();
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || "agro_vet");

    const products = await db.collection("all-products").find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error) {
    console.error("GET_PRODUCTS_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unable to fetch products." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, category, details, price, deliveryOption, images } = body;

    if (!name || !category || !details || !price || !deliveryOption) {
      return NextResponse.json({ success: false, error: "All required fields must be provided." }, { status: 400 });
    }

    if (!Array.isArray(images)) {
      return NextResponse.json({ success: false, error: "Images must be provided as an array." }, { status: 400 });
    }

    if (images.length > 5) {
      return NextResponse.json({ success: false, error: "A maximum of 5 images is allowed." }, { status: 400 });
    }

    const imageUrls = [];
    for (const image of images) {
      if (!image) continue;
      const uploadResult = await uploadImage(image);
      imageUrls.push(uploadResult.secure_url);
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || "agro_vet");

    const productDocument = {
      name,
      category,
      details,
      price: parseFloat(price),
      deliveryOption,
      images: imageUrls,
      createdAt: new Date(),
    };

    const result = await db.collection("all-products").insertOne(productDocument);

    return NextResponse.json({ success: true, insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("ADD_PRODUCT_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unable to save product at this time." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, name, category, details, price, deliveryOption, images } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required." }, { status: 400 });
    }

    if (!name || !category || !details || !price || !deliveryOption) {
      return NextResponse.json({ success: false, error: "All required fields must be provided." }, { status: 400 });
    }

    if (!Array.isArray(images)) {
      return NextResponse.json({ success: false, error: "Images must be provided as an array." }, { status: 400 });
    }

    if (images.length > 5) {
      return NextResponse.json({ success: false, error: "A maximum of 5 images is allowed." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || "agro_vet");

    const updateDocument = {
      name,
      category,
      details,
      price: parseFloat(price),
      deliveryOption,
      images,
      updatedAt: new Date(),
    };

    const result = await db.collection("all-products").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDocument }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("UPDATE_PRODUCT_ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unable to update product." },
      { status: 500 }
    );
  }
}
