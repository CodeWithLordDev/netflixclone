import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { ACCESS_COOKIE, verifyJwt } from "@/lib/jwt";

function shape(method, idOverride) {
  return {
    id: idOverride || String(method._id || method.id || ""),
    brand: method.brand || "",
    last4: method.last4 || "",
    expMonth: method.expMonth || 0,
    expYear: method.expYear || 0,
    isDefault: Boolean(method.isDefault),
    createdAt: method.createdAt,
  };
}

export async function GET(req) {
  try {
    const access = req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get("token")?.value;
    if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const decoded = verifyJwt(access);
    if (!decoded?.id) return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    await connectDB();
    const user = await User.findById(decoded.id).select("paymentMethods").lean();
    return NextResponse.json({ items: (user?.paymentMethods || []).map(shape) });
  } catch (error) {
    return NextResponse.json({ message: "Failed to load payment methods", error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const access = req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get("token")?.value;
    if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const decoded = verifyJwt(access);
    if (!decoded?.id) return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    const { brand, last4, expMonth, expYear, isDefault } = await req.json();
    if (!brand || !last4 || String(last4).length !== 4) {
      return NextResponse.json({ message: "Brand and last4 are required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (isDefault) user.paymentMethods.forEach((m) => (m.isDefault = false));
    const created = {
      brand: String(brand),
      last4: String(last4),
      expMonth: Number(expMonth) || 0,
      expYear: Number(expYear) || 0,
      isDefault: Boolean(isDefault),
      createdAt: new Date(),
    };
    user.paymentMethods.push(created);
    if (user.paymentMethods.length === 1) user.paymentMethods[0].isDefault = true;
    await user.save();

    return NextResponse.json({ items: user.paymentMethods.map(shape) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to add payment method", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const access = req.cookies.get(ACCESS_COOKIE)?.value || req.cookies.get("token")?.value;
    if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const decoded = verifyJwt(access);
    if (!decoded?.id) return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ message: "Payment method id required" }, { status: 400 });

    await connectDB();
    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const method = user.paymentMethods.id(id);
    if (!method) return NextResponse.json({ message: "Payment method not found" }, { status: 404 });

    const wasDefault = Boolean(method.isDefault);
    method.remove();
    if (wasDefault && user.paymentMethods.length > 0) {
      user.paymentMethods[0].isDefault = true;
    }
    await user.save();

    return NextResponse.json({ items: user.paymentMethods.map(shape) });
  } catch (error) {
    return NextResponse.json({ message: "Failed to remove payment method", error: error.message }, { status: 500 });
  }
}
