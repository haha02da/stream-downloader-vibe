import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const getYTPath = () => {
  const localBinPath = path.join(process.cwd(), 'bin', 'yt-dlp');
  if (fs.existsSync(localBinPath)) {
    return localBinPath;
  }
  return 'yt-dlp';
};

export async function GET(req: NextRequest) {
  const YT_PATH = getYTPath();
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  const formatId = searchParams.get('formatId') || 'best';
  const title = searchParams.get('title') || 'video';

  if (!url) {
    return new Response('URL이 필요합니다.', { status: 400 });
  }

  // yt-dlp arguments:
  // -o - : pipe output to stdout
  // -f : specify format
  // --no-playlist : only download single video
  const ytProcess = spawn(YT_PATH, [
    '-f', formatId,
    '-o', '-',
    '--no-playlist',
    url
  ]);

  // Convert Node.js Readable stream (ytProcess.stdout) to Web Stream (ReadableStream)
  const stream = new ReadableStream({
    start(controller) {
      ytProcess.stdout.on('data', (chunk) => controller.enqueue(chunk));
      ytProcess.stdout.on('end', () => controller.close());
      ytProcess.stdout.on('error', (err) => controller.error(err));
      
      ytProcess.stderr.on('data', (data) => {
        // Optional: log progress/errors from yt-dlp to server console
        console.log(`yt-dlp log: ${data}`);
      });
    },
    cancel() {
      // If the client cancels the download, kill the yt-dlp process
      ytProcess.kill();
    }
  });

  const sanitizedTitle = encodeURIComponent(title.replace(/[^\w\s-]/g, ''));
  const filename = `${sanitizedTitle}.mp4`; // Extension should ideally match the format, but mp4 is safe

  return new Response(stream, {
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'video/mp4', // Most common, yt-dlp will stream whatever format it fetches
    },
  });
}
