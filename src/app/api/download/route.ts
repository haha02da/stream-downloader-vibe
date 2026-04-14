import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

// Vercel environments use a read-only filesystem, but /tmp is writable.
// However, bin/yt-dlp is included in the deployment and is executable.
const getYTPath = () => {
  // Try to find it in project bin/ directory (for Vercel/Production)
  const localBinPath = path.join(process.cwd(), 'bin', 'yt-dlp');
  if (fs.existsSync(localBinPath)) {
    return localBinPath;
  }
  // Fallback to system yt-dlp (for Local development)
  return 'yt-dlp';
};

export async function POST(req: NextRequest) {
  const YT_PATH = getYTPath();
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL이 필요합니다.' }, { status: 400 });
    }

    // 1. Check if yt-dlp is installed
    try {
      await execPromise(`${YT_PATH} --version`);
    } catch (err: any) {
      console.error('yt-dlp check error:', err);
      return NextResponse.json({ 
        error: `서버에 yt-dlp가 설치되어 있지 않거나 실행할 수 없습니다. (Path: ${YT_PATH})`,
        details: err.message
      }, { status: 500 });
    }

    // 2. Fetch video metadata
    const { stdout } = await execPromise(`${YT_PATH} -j --flat-playlist "${url}"`);
    const videoInfo = JSON.parse(stdout);

    // 3. Prepare response data
    // Only include formats with video AND audio (best for simple download)
    // Or just provide a few common resolutions.
    const formats = videoInfo.formats
      ?.filter((f: any) => f.vcodec !== 'none' && (f.acodec !== 'none' || f.audio_ext !== 'none'))
      .map((f: any) => ({
        format_id: f.format_id,
        extension: f.ext,
        resolution: f.resolution || f.format_note || 'Unknown',
        filesize: f.filesize || f.filesize_approx,
        vcodec: f.vcodec,
        acodec: f.acodec
      }))
      .sort((a: any, b: any) => (b.filesize || 0) - (a.filesize || 0)); // Sort by size/quality

    const responseData = {
      id: videoInfo.id,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      uploader: videoInfo.uploader,
      duration_string: videoInfo.duration_string,
      formats: formats?.slice(0, 10) || [] // Limit to 10 best options
    };

    return NextResponse.json({ 
      message: '성공', 
      videoInfo: responseData 
    });

  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ 
      error: '영상을 분석할 수 없습니다. 올바른 URL인지 확인해주세요.',
      details: error.message 
    }, { status: 500 });
  }
}
