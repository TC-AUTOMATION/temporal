import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for active site visitors
// Key: visitorId, Value: lastSeen timestamp
const activeVisitors = new Map<string, number>();

// Remove visitors inactive for more than 30 seconds
const INACTIVE_THRESHOLD = 30 * 1000;

function cleanupVisitors() {
  const now = Date.now();
  for (const [visitorId, lastSeen] of activeVisitors.entries()) {
    if (now - lastSeen > INACTIVE_THRESHOLD) {
      activeVisitors.delete(visitorId);
    }
  }
}

// GET - Get current online visitor count (for admin dashboard)
export async function GET() {
  cleanupVisitors();
  return NextResponse.json({ count: activeVisitors.size });
}

// POST - Register/heartbeat as an active visitor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitorId } = body;

    if (!visitorId) {
      return NextResponse.json({ error: 'visitorId required' }, { status: 400 });
    }

    activeVisitors.set(visitorId, Date.now());
    cleanupVisitors();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// DELETE - Remove visitor (when leaving site)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitorId } = body;

    if (!visitorId) {
      return NextResponse.json({ error: 'visitorId required' }, { status: 400 });
    }

    activeVisitors.delete(visitorId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
