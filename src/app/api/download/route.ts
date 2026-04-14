import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

/**
 * Vercel environment is read-only except for /tmp.
 * We copy the binary to /tmp and give it execution permissions.
 */
const getYTPath = async () => {
  const localBinPath = path.join(process.cwd(), 'bin', 'yt-dlp');
  const tempBinPath = path.join('/tmp', 'yt-dlp');

  if (fs.existsSync(localBinPath)) {
    try {
      if (!fs.existsSync(tempBinPath)) {
        fs.copyFileSync(localBinPath, tempBinPath);
        fs.chmodSync(tempBinPath, '755');
      }
      return tempBinPath;
    } catch (err) {
      console.error('Error setting up yt-dlp in /tmp:', err);
      return localBinPath;
    }
  }
  return 'yt-dlp';
};

export async function POST(req: NextRequest) {
  const YT_PATH = await getYTPath();
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL이 필요합니다.' }, { status: 400 });
    }

    // Debugging info
    let pythonVersion = 'Unknown';
    try {
      const { stdout } = await execPromise('python3 --version');
      pythonVersion = stdout.trim();
    } catch (e) {
      pythonVersion = 'Not found';
    }

    // 1. Check if yt-dlp is executable
    try {
      await execPromise(`${YT_PATH} --version`);
    } catch (err: any) {
      console.error('yt-dlp execution failed:', err);
      return NextResponse.json({ 
        error: `yt-dlp 실행 실패 (Path: ${YT_PATH})`,
        details: err.message,
        python: pythonVersion,
        env: process.env.NODE_ENV
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
