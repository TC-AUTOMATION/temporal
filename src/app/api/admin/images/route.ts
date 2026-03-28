import { NextRequest } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * GET /api/admin/images
 * List all available images from public/clothes/ and public/stickers/ directories
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const publicDir = path.join(process.cwd(), 'public');
    const folders = ['clothes', 'stickers'];
    const result: Record<string, string[]> = {};

    for (const folder of folders) {
      try {
        const dirPath = path.join(publicDir, folder);
        const files = await readdir(dirPath);
        // Only include image files (webp, png, jpg, jpeg)
        const imageFiles = files
          .filter((file) => /\.(webp|png|jpg|jpeg|gif|svg)$/i.test(file))
          .sort()
          .map((file) => `/${folder}/${file}`);
        result[folder] = imageFiles;
      } catch {
        // Directory doesn't exist, skip
        result[folder] = [];
      }
    }

    return successResponse(result);
  } catch (error) {
    console.error('GET /api/admin/images error:', error);
    return serverErrorResponse();
  }
}
