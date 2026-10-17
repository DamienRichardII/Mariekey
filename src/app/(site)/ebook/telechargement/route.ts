import { NextResponse, type NextRequest } from "next/server";
import { ebookSignedUrl, isPaidSession } from "@/lib/ebook-access";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("session_id") ?? undefined;
  if (!(await isPaidSession(id))) return NextResponse.redirect(new URL("/ebook", req.url));
  const url = await ebookSignedUrl();
  if (!url) return NextResponse.redirect(new URL(`/ebook/merci?session_id=${id}&pdf=0`, req.url));
  return NextResponse.redirect(url);
}
