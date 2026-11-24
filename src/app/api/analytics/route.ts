import { fetchGAOverview } from "@/lib/analytics/ga-data.server";
import { NextResponse } from "next/server";

// * MUST RUN AT REQUEST TIME: GA CREDENTIALS ARE RUNTIME ENV (DOCKER env_file) AND
// * DO NOT EXIST DURING `next build`. A STATIC/ISR ROUTE WOULD BAKE IN THE BUILD-TIME ERROR.
export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 60 * 60 * 1000; // cache for 1 hour
let cache: {
  data: Awaited<ReturnType<typeof fetchGAOverview>>;
  expiresAt: number;
} | null = null;

export async function GET() {
  try {
    if (!cache || cache.expiresAt < Date.now()) {
      cache = { data: await fetchGAOverview(), expiresAt: Date.now() + CACHE_TTL_MS };
    }
    return NextResponse.json({ success: true, data: cache.data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch analytics";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
