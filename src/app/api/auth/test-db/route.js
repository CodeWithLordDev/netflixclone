import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    return Response.json({ success: true, message: "MongoDB Connected 🚀" });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
