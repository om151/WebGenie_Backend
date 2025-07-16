// db.js
import mongoose from 'mongoose'; // ✅ ESM import

let isConnected = false;

export async function connectToDb() {
    if (isConnected) {
        console.log("🔄 Using existing database connection.");
        return;
    }
    try {
        await mongoose.connect(process.env.DB_CONNECT, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = true;
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ Database Connection Error:", err);
        process.exit(1);
    }
}
