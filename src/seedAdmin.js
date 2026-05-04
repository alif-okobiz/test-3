// src/seedAdmin.js
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function createAdmin() {
  const uri = "mongodb+srv://agro_vet:VhqLOQeuKO4b4Ar3@cluster0.ysbqcll.mongodb.net/?appName=Cluster0";
  const dbName = process.env.DB_NAME || "agro_vet";

  
  if (!uri) {
    console.error("Error: MONGODB_URI is not defined in .env file!");
    console.log("Current Directory:", __dirname);
    return;
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const adminCollection = db.collection("admins");

    const email = "admin@agrovet.com"; 
    const password = "admin123@password"; 
    
    const hashedPassword = await bcrypt.hash(password, 10);

    await adminCollection.updateOne(
      { email: email }, 
      { $set: { email, password: hashedPassword, role: "admin", createdAt: new Date() } },
      { upsert: true }
    );

    console.log("✅ Success: Admin account is ready!");
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
  } finally {
    await client.close();
  }
}

createAdmin();