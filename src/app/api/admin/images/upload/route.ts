import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * POST /api/admin/images/upload
 * Upload image files to public/clothes/ directory
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/webp', 'image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'];
    const maxSize = 25 * 1024 * 1024; // 25MB

    const uploadedPaths: string[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `Type non autorise: ${file.type}. Formats acceptes: webp, png, jpg, gif, svg` },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: `Fichier trop volumineux: ${file.name} (max 25MB)` },
          { status: 400 }
        );
      }

      // Sanitize filename: lowercase, replace spaces with dashes, keep only safe chars
      const ext = path.extname(file.name).toLowerCase();
      const baseName = path.basename(file.name, path.extname(file.name))
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Add timestamp to avoid conflicts
      const timestamp = Date.now().toString(36);

      const publicDir = path.join(process.cwd(), 'public', 'clothes');
      const bytes = await file.arrayBuffer();
      const inputBuffer = Buffer.from(bytes);

      // Compress raster images (png/jpg/webp) to a resized WebP for fast loading.
      // Vector/animated formats (svg, gif) are stored as-is.
      const isRaster = ['image/webp', 'image/png', 'image/jpeg'].includes(file.type);
      let fileName: string;
      let outputBuffer: Buffer;

      if (isRaster) {
        outputBuffer = await sharp(inputBuffer)
          .rotate() // honor EXIF orientation from phone photos
          .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        fileName = `${baseName}-${timestamp}.webp`;
      } else {
        outputBuffer = inputBuffer;
        fileName = `${baseName}-${timestamp}${ext}`;
      }

      const filePath = path.join(publicDir, fileName);
      await writeFile(filePath, outputBuffer);

      uploadedPaths.push(`/clothes/${fileName}`);
    }

    return successResponse({ uploaded: uploadedPaths });
  } catch (error) {
    console.error('POST /api/admin/images/upload error:', error);
    return serverErrorResponse();
  }
}
