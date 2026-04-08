import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL이 필요합니다.' }, { status: 400 });
    }

    // 1. Check if yt-dlp is installed
    try {
      await execPromise('yt-dlp --version');
    } catch (err) {
      return NextResponse.json({ 
        error: '서버에 yt-dlp가 설치되어 있지 않습니다. README를 참고하여 설치해주세요.' 
      }, { status: 500 });
    }

    // 2. Fetch video metadata
    // -j: dump JSON, --flat-playlist: don't expand playlists
    const { stdout } = await execPromise(`yt-dlp -j --flat-playlist "${url}"`);
    const videoInfo = JSON.parse(stdout);

    // 3. Prepare response data
    const responseData = {
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      uploader: videoInfo.uploader,
      duration_string: videoInfo.duration_string,
      url: videoInfo.url || url, // If it's a direct link or we need to pass it back
      formats: videoInfo.formats?.map((f: any) => ({
        format_id: f.format_id,
        extension: f.ext,
        resolution: f.resolution,
        filesize: f.filesize,
      }))
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
