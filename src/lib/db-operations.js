import clientPromise from "./mongodb";


const DB_NAME = process.env.DB_NAME || "agro_vet";

/**
 * Helper function to connect to a specific MongoDB collection.
 * Includes error handling for connection failures.
 */
async function getCollection(collectionName) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    return db.collection(collectionName);
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to the database");
  }
}

/**
 * common function to save a document to any collection.
 * Automatically adds a 'createdAt' timestamp to the data.
 */
export async function insertDocument(collectionName, data) {
  try {
    const collection = await getCollection(collectionName);
    const result = await collection.insertOne({
      ...data,
      createdAt: new Date(),
    });
    return result;
  } catch (error) {
    console.error(`Error inserting document into ${collectionName}:`, error);
    throw error;
  }
}

/**
 * common function to fetch all documents from a specific collection.
 * Sorts the results by 'createdAt' in descending order (latest first).
 */
export async function findDocuments(collectionName) {
  try {
    const collection = await getCollection(collectionName);
    return await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    throw error;
  }
}