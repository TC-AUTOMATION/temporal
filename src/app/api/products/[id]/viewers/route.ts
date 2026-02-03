import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for active viewers
// Key: productId, Value: Map of visitorId -> lastSeen timestamp
const activeViewers = new Map<string, Map<string, number>>();

// Cleanup interval - remove viewers inactive for more than 30 seconds
const INACTIVE_THRESHOLD = 30 * 1000; // 30 seconds

// Generate a consistent base number for each product (2-5)
function getBaseViewers(productId: string): number {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    const char = productId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return (Math.abs(hash) % 4) + 2; // 2-5
}

// Cleanup old viewers
function cleanupViewers(productId: string) {
  const viewers = activeViewers.get(productId);
  if (!viewers) return;

  const now = Date.now();
  for (const [visitorId, lastSeen] of viewers.entries()) {
    if (now - lastSeen > INACTIVE_THRESHOLD) {
      viewers.delete(visitorId);
    }
  }

  if (viewers.size === 0) {
    activeViewers.delete(productId);
  }
}

// GET - Get current viewer count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;

  cleanupViewers(productId);

  const viewers = activeViewers.get(productId);
  const realViewers = viewers ? viewers.size : 0;
  const baseViewers = getBaseViewers(productId);

  return NextResponse.json({
    count: baseViewers + realViewers,
    real: realViewers,
    base: baseViewers,
  });
}

// POST - Register/heartbeat as a viewer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;

  try {
    const body = await request.json();
    const { visitorId } = body;

    if (!visitorId) {
      return NextResponse.json({ error: 'visitorId required' }, { status: 400 });
    }

    // Get or create viewers map for this product
    if (!activeViewers.has(productId)) {
      activeViewers.set(productId, new Map());
    }

    const viewers = activeViewers.get(productId)!;
    viewers.set(visitorId, Date.now());

    // Cleanup old viewers
    cleanupViewers(productId);

    const realViewers = viewers.size;
    const baseViewers = getBaseViewers(productId);

    return NextResponse.json({
      count: baseViewers + realViewers,
      real: realViewers,
      base: baseViewers,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// DELETE - Remove viewer (when leaving page)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;

  try {
    const body = await request.json();
    const { visitorId } = body;

    if (!visitorId) {
      return NextResponse.json({ error: 'visitorId required' }, { status: 400 });
    }

    const viewers = activeViewers.get(productId);
    if (viewers) {
      viewers.delete(visitorId);
      if (viewers.size === 0) {
        activeViewers.delete(productId);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
