import { NextRequest } from 'next/server';
import { readdir, stat, unlink } from 'fs/promises';
import path from 'path';
import { getCurrentUser } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/response';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const FOLDERS = ['clothes', 'stickers'] as const;
const IMAGE_REGEX = /\.(webp|png|jpg|jpeg|gif|svg)$/i;

interface ImageUser {
  type: string;
  id: string;
  label: string;
}

/**
 * Build a map of every image URL referenced anywhere in the database to the
 * list of records that use it. Keys are normalized "folder/basename" (without
 * extension) so that a .webp and its legacy .png/.jpg twin are treated as the
 * same logical image.
 */
async function buildUsageMap(): Promise<Map<string, ImageUser[]>> {
  const usage = new Map<string, ImageUser[]>();

  const add = (url: string | null | undefined, user: ImageUser) => {
    if (!url || typeof url !== 'string') return;
    const key = normalizeKey(url);
    if (!key) return;
    const list = usage.get(key);
    if (list) {
      if (!list.some((u) => u.type === user.type && u.id === user.id)) list.push(user);
    } else {
      usage.set(key, [user]);
    }
  };

  const [products, packs, popups, upsells, categories, contests, settings] = await Promise.all([
    prisma.product.findMany({ select: { id: true, name: true, images: true } }),
    prisma.pack.findMany({ select: { id: true, name: true, image: true, images: true } }),
    prisma.popup.findMany({ select: { id: true, titleFr: true, image: true, images: true } }),
    prisma.upsell.findMany({ select: { id: true, name: true, image: true } }),
    prisma.category.findMany({ select: { id: true, name: true, image: true } }),
    prisma.contest.findMany({ select: { id: true, prizeName: true, prizeImage: true } }),
    prisma.setting.findMany({ select: { key: true, value: true } }),
  ]);

  for (const p of products) {
    const u = { type: 'product', id: p.id, label: p.name };
    p.images.forEach((img) => add(img, u));
  }
  for (const p of packs) {
    const u = { type: 'pack', id: p.id, label: p.name };
    add(p.image, u);
    p.images.forEach((img) => add(img, u));
  }
  for (const p of popups) {
    const u = { type: 'popup', id: p.id, label: p.titleFr };
    add(p.image, u);
    p.images.forEach((img) => add(img, u));
  }
  for (const u of upsells) {
    add(u.image, { type: 'upsell', id: u.id, label: u.name });
  }
  for (const c of categories) {
    add(c.image, { type: 'category', id: c.id, label: c.name });
  }
  for (const c of contests) {
    add(c.prizeImage, { type: 'contest', id: c.id, label: c.prizeName });
  }

  // Settings store arbitrary JSON; scan the stringified value for image paths.
  for (const s of settings) {
    const raw = JSON.stringify(s.value ?? '');
    const matches = raw.match(/\/(?:clothes|stickers)\/[^"'\\]+\.(?:webp|png|jpg|jpeg|gif|svg)/gi);
    if (matches) {
      const seen = new Set<string>();
      for (const m of matches) {
        const key = normalizeKey(m);
        if (key && !seen.has(key)) {
          seen.add(key);
          add(m, { type: 'setting', id: s.key, label: s.key });
        }
      }
    }
  }

  return usage;
}

/** Normalize an image URL to "folder/basename" without extension. */
function normalizeKey(url: string): string | null {
  const match = url.match(/\/(clothes|stickers)\/(.+)$/i);
  if (!match) return null;
  const folder = match[1].toLowerCase();
  const file = match[2].replace(IMAGE_REGEX, '');
  return `${folder}/${file}`;
}

/** Validate a public image URL and resolve it to an absolute path safely. */
function resolveImagePath(url: string): string | null {
  if (typeof url !== 'string') return null;
  const match = url.match(/^\/(clothes|stickers)\/([^/]+)$/);
  if (!match) return null;
  const folder = match[1];
  const fileName = match[2];
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) return null;
  if (!IMAGE_REGEX.test(fileName)) return null;
  const resolved = path.join(PUBLIC_DIR, folder, fileName);
  // Ensure the resolved path stays inside the allowed folder
  const folderDir = path.join(PUBLIC_DIR, folder);
  if (!resolved.startsWith(folderDir + path.sep)) return null;
  return resolved;
}

/**
 * GET /api/admin/images/manage
 * Full media inventory with usage analysis.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const usage = await buildUsageMap();

    const images: Array<{
      url: string;
      folder: string;
      name: string;
      size: number;
      modified: string;
      usedBy: ImageUser[];
      orphan: boolean;
    }> = [];

    for (const folder of FOLDERS) {
      const dirPath = path.join(PUBLIC_DIR, folder);
      let files: string[];
      try {
        files = await readdir(dirPath);
      } catch {
        continue;
      }
      for (const file of files) {
        if (!IMAGE_REGEX.test(file)) continue;
        const url = `/${folder}/${file}`;
        let size = 0;
        let modified = new Date(0).toISOString();
        try {
          const st = await stat(path.join(dirPath, file));
          size = st.size;
          modified = st.mtime.toISOString();
        } catch {
          continue;
        }
        const usedBy = usage.get(`${folder}/${file.replace(IMAGE_REGEX, '')}`) || [];
        images.push({
          url,
          folder,
          name: file,
          size,
          modified,
          usedBy,
          orphan: usedBy.length === 0,
        });
      }
    }

    images.sort((a, b) => {
      // Orphans first, then by most recent
      if (a.orphan !== b.orphan) return a.orphan ? -1 : 1;
      return b.modified.localeCompare(a.modified);
    });

    const stats = {
      total: images.length,
      used: images.filter((i) => !i.orphan).length,
      orphan: images.filter((i) => i.orphan).length,
      totalSize: images.reduce((sum, i) => sum + i.size, 0),
    };

    return successResponse({ images, stats });
  } catch (error) {
    console.error('GET /api/admin/images/manage error:', error);
    return serverErrorResponse();
  }
}

/**
 * DELETE /api/admin/images/manage
 * Permanently delete image files from the filesystem.
 * Body: { urls: string[] }
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const body = await request.json().catch(() => null);
    const urls: unknown = body?.urls;
    if (!Array.isArray(urls) || urls.length === 0) {
      return errorResponse('Aucune image fournie');
    }

    const deleted: string[] = [];
    const failed: Array<{ url: string; error: string }> = [];

    for (const rawUrl of urls) {
      const url = String(rawUrl);
      const filePath = resolveImagePath(url);
      if (!filePath) {
        failed.push({ url, error: 'Chemin invalide' });
        continue;
      }
      try {
        await unlink(filePath);
        deleted.push(url);
      } catch (err) {
        const code = (err as NodeJS.ErrnoException)?.code;
        if (code === 'ENOENT') {
          // Already gone — treat as success
          deleted.push(url);
        } else {
          failed.push({ url, error: 'Suppression impossible' });
        }
      }
    }

    return successResponse({ deleted, failed });
  } catch (error) {
    console.error('DELETE /api/admin/images/manage error:', error);
    return serverErrorResponse();
  }
}

/**
 * PATCH /api/admin/images/manage
 * Replace an image URL everywhere in the database.
 * Body: { from: string, to: string, deleteOld?: boolean }
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    if (!user.isAdmin) return forbiddenResponse();

    const body = await request.json().catch(() => null);
    const from = typeof body?.from === 'string' ? body.from : '';
    const to = typeof body?.to === 'string' ? body.to : '';
    const deleteOld = body?.deleteOld === true;

    if (!from || !to) {
      return errorResponse('Paramètres "from" et "to" requis');
    }
    if (from === to) {
      return errorResponse("L'ancienne et la nouvelle image sont identiques");
    }

    let updated = 0;

    // Products (images array)
    const products = await prisma.product.findMany({
      where: { images: { has: from } },
      select: { id: true, images: true },
    });
    for (const p of products) {
      await prisma.product.update({
        where: { id: p.id },
        data: { images: p.images.map((img) => (img === from ? to : img)) },
      });
      updated++;
    }

    // Packs (image + images array)
    const packs = await prisma.pack.findMany({
      where: { OR: [{ image: from }, { images: { has: from } }] },
      select: { id: true, image: true, images: true },
    });
    for (const p of packs) {
      await prisma.pack.update({
        where: { id: p.id },
        data: {
          image: p.image === from ? to : p.image,
          images: p.images.map((img) => (img === from ? to : img)),
        },
      });
      updated++;
    }

    // Popups (image + images array)
    const popups = await prisma.popup.findMany({
      where: { OR: [{ image: from }, { images: { has: from } }] },
      select: { id: true, image: true, images: true },
    });
    for (const p of popups) {
      await prisma.popup.update({
        where: { id: p.id },
        data: {
          image: p.image === from ? to : p.image,
          images: p.images.map((img) => (img === from ? to : img)),
        },
      });
      updated++;
    }

    // Upsells (single image)
    const upsellRes = await prisma.upsell.updateMany({
      where: { image: from },
      data: { image: to },
    });
    updated += upsellRes.count;

    // Categories (single image)
    const catRes = await prisma.category.updateMany({
      where: { image: from },
      data: { image: to },
    });
    updated += catRes.count;

    // Contests (prize image)
    const contestRes = await prisma.contest.updateMany({
      where: { prizeImage: from },
      data: { prizeImage: to },
    });
    updated += contestRes.count;

    // Delete the old file if requested and it is no longer referenced
    let oldDeleted = false;
    if (deleteOld) {
      const oldPath = resolveImagePath(from);
      if (oldPath) {
        try {
          await unlink(oldPath);
          oldDeleted = true;
        } catch (err) {
          const code = (err as NodeJS.ErrnoException)?.code;
          if (code === 'ENOENT') oldDeleted = true;
        }
      }
    }

    return successResponse({ updated, oldDeleted });
  } catch (error) {
    console.error('PATCH /api/admin/images/manage error:', error);
    return serverErrorResponse();
  }
}
