import { NextResponse } from "next/server";

export function apiOk(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message = "Server error", status = 500, details) {
  return NextResponse.json({ error: message, details: details || null }, { status });
}

export function parsePagination(searchParams) {
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPagedResult(items, total, page, limit) {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}
