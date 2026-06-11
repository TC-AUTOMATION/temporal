import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
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
      const fileName = `${baseName}-${timestamp}${ext}`;

      const publicDir = path.join(process.cwd(), 'public', 'clothes');
      const filePath = path.join(publicDir, fileName);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      uploadedPaths.push(`/clothes/${fileName}`);
    }

    return successResponse({ uploaded: uploadedPaths });
  } catch (error) {
    console.error('POST /api/admin/images/upload error:', error);
    return serverErrorResponse();
  }
}
