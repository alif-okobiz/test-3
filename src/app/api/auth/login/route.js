import { NextResponse } from "next/server";
import { findDocuments } from "@/lib/db-operations";
import { createToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // fetch data from admins colloection
    const admins = await findDocuments("admins");
    const admin = admins.find((u) => u.email === email);

    if (!admin) {
      return NextResponse.json({ success: false, error: "Invalid Credentials" }, { status: 401 });
    }

    // password check
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ success: false, error: "Invalid Credentials" }, { status: 401 });
    }

    // create tocken
    const token = await createToken({ id: admin._id, email: admin.email });

    // set cookies
    const response = NextResponse.json({ success: true, message: "Logged in successfully" });
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7200, //2h
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}