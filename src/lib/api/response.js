import { NextResponse } from "next/server";

export function ok(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(code, message, status = 400, fieldErrors = undefined) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(fieldErrors ? { fieldErrors } : {}),
      },
    },
    { status }
  );
}

export function paged(items, total, page, limit) {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}
