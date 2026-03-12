import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { ACCESS_COOKIE, verifyJwt } from "@/lib/jwt";

function pickProfileShape(profile) {
  return {
    id: String(profile._id || profile.id || ""),
    name: profile.name,
    type: profile.type,
    isDefault: Boolean(profile.isDefault),
  };
}

export async function GET(req) {
  try {
    const access = req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get("token")?.value;
    if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const decoded = verifyJwt(access);
    if (!decoded?.id) return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    await connectDB();
    const user = await User.findById(decoded.id).select("profiles").lean();
    return NextResponse.json({ items: (user?.profiles || []).map(pickProfileShape) });
  } catch (error) {
    return NextResponse.json({ message: "Failed to load profiles", error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const access = req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get("token")?.value;
    if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const decoded = verifyJwt(access);
    if (!decoded?.id) return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    const { name, type } = await req.json();
    if (!name || !String(name).trim()) {
      return NextResponse.json({ message: "Profile name is required" }, { status: 400 });
    }
    const safeType = ["kids", "personal", "family"].includes(String(type)) ? String(type) : "personal";

    await connectDB();
    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const isFirst = (user.profiles || []).length === 0;
    user.profiles.push({ name: String(name).trim(), type: safeType, isDefault: isFirst });
    await user.save();

    return NextResponse.json({ items: user.profiles.map(pickProfileShape) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create profile", error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const access = req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get("token")?.value;
    if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const decoded = verifyJwt(access);
    if (!decoded?.id) return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    const { id, name, type, isDefault } = await req.json();
    if (!id) return NextResponse.json({ message: "Profile id required" }, { status: 400 });

    await connectDB();
    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const profile = user.profiles.id(id);
    if (!profile) return NextResponse.json({ message: "Profile not found" }, { status: 404 });

    if (name) profile.name = String(name).trim();
    if (type && ["kids", "personal", "family"].includes(String(type))) profile.type = String(type);

    if (typeof isDefault === "boolean" && isDefault) {
      user.profiles.forEach((p) => (p.isDefault = false));
      profile.isDefault = true;
    }

    await user.save();
    return NextResponse.json({ items: user.profiles.map(pickProfileShape) });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update profile", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const access = req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get("token")?.value;
    if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const decoded = verifyJwt(access);
    if (!decoded?.id) return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ message: "Profile id required" }, { status: 400 });

    await connectDB();
    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const profile = user.profiles.id(id);
    if (!profile) return NextResponse.json({ message: "Profile not found" }, { status: 404 });

    const wasDefault = Boolean(profile.isDefault);
    profile.remove();
    if (wasDefault && user.profiles.length > 0) {
      user.profiles[0].isDefault = true;
    }
    await user.save();

    return NextResponse.json({ items: user.profiles.map(pickProfileShape) });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete profile", error: error.message }, { status: 500 });
  }
}
