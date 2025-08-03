import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, canWatchVideos } from '@/lib/auth';
import { createReadStream, existsSync, statSync } from 'fs';
import { join } from 'path';

// Allowed file types for security
const ALLOWED_EXTENSIONS = [
    '.mp4', '.webm', '.mov', '.avi', '.mkv', // Videos
    '.jpg', '.jpeg', '.png', '.webp', '.avif', // Images
    '.srt', '.vtt', '.ass', '.ssa' // Subtitles
];

const ALLOWED_DIRECTORIES = ['posters', 'videos', 'subtitles'];

function getMimeType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes: { [key: string]: string } = {
        // Video
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mov': 'video/quicktime',
        'avi': 'video/x-msvideo',
        'mkv': 'video/x-matroska',
        // Images
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp',
        'avif': 'image/avif',
        // Subtitles
        'srt': 'text/srt',
        'vtt': 'text/vtt',
        'ass': 'text/x-ass',
        'ssa': 'text/x-ssa'
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
}

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string[] } }
) {
    try {
        const slug = params.slug;
        if (!slug || slug.length !== 2) {
            return NextResponse.json({
                error: 'Invalid path format. Expected: /api/data/{type}/{filename}'
            }, { status: 400 });
        }

        const [type, filename] = slug;

        // Validate directory type
        if (!ALLOWED_DIRECTORIES.includes(type)) {
            return NextResponse.json({
                error: 'Invalid file type. Allowed types: ' + ALLOWED_DIRECTORIES.join(', ')
            }, { status: 400 });
        }

        // Validate file extension
        const hasValidExtension = ALLOWED_EXTENSIONS.some(ext =>
            filename.toLowerCase().endsWith(ext)
        );
        if (!hasValidExtension) {
            return NextResponse.json({
                error: 'Invalid file extension'
            }, { status: 400 });
        }

        // Prevent directory traversal attacks
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return NextResponse.json({
                error: 'Invalid filename'
            }, { status: 400 });
        }

        // Access control based on content type
        if (type === 'videos' || type === 'subtitles') {
            // Check authentication for videos and subtitles
            const session = await getServerSession(authOptions);
            if (!session?.user?.email) {
                return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
            }

            // Check subscription access for videos and subtitles
            const canWatch = await canWatchVideos(session.user.email);
            if (!canWatch) {
                return NextResponse.json({
                    error: 'Subscription required to access this content'
                }, { status: 403 });
            }
        }
        // Note: Posters are accessible to all users (no authentication required)

        // Construct file path
        const dataDir = join(process.cwd(), 'data');
        const filePath = join(dataDir, type, filename);

        console.log(`Serving file: ${filePath}, type: ${type}`);

        // Check if file exists
        if (!existsSync(filePath)) {
            return NextResponse.json({
                error: 'File not found'
            }, { status: 404 });
        }

        // Get file stats
        const stats = statSync(filePath);
        const fileSize = stats.size;
        const mimeType = getMimeType(filename);

        // Handle range requests for video streaming
        const range = request.headers.get('range');
        if (range) {
            console.log(`Range request: ${range} for file: ${filePath}`);
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;

            const stream = createReadStream(filePath, { start, end });

            return new NextResponse(stream as any, {
                status: 206,
                headers: {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize.toString(),
                    'Content-Type': mimeType,
                    'Cache-Control': 'public, max-age=31536000',
                    'Cross-Origin-Resource-Policy': 'cross-origin'
                }
            });
        }

        // Regular file streaming without range
        const stream = createReadStream(filePath);
        console.log(`Streaming file: ${filePath}`);

        return new NextResponse(stream as any, {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Content-Length': fileSize.toString(),
                'Cache-Control': 'public, max-age=31536000',
                'Accept-Ranges': 'bytes',
                'Cross-Origin-Resource-Policy': 'cross-origin',
                'Content-Disposition': type === 'videos' ? 'inline' : `inline; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('File streaming error:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}