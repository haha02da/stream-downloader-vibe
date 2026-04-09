'use client';

import { useState } from 'react';
import { Download, Youtube, Globe, Info, AlertCircle, CheckCircle2, Loader2, ChevronDown, Monitor, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState<null | 'success' | 'error'>(null);
  const [message, setMessage] = useState('');
  const [videoData, setVideoData] = useState<any>(null);
  const [selectedFormat, setSelectedFormat] = useState('best');

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setStatus(null);
    setMessage('');
    setVideoData(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('영상을 성공적으로 가져왔습니다!');
        setVideoData(data.videoInfo);
        // Default to the first format found
        if (data.videoInfo.formats?.length > 0) {
          setSelectedFormat(data.videoInfo.formats[0].format_id);
        }
      } else {
        setStatus('error');
        setMessage(data.error || '다운로드 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('서버와의 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!videoData) return;
    
    setDownloading(true);
    
    // Construct the stream URL
    const streamUrl = `/api/stream?url=${encodeURIComponent(url)}&formatId=${selectedFormat}&title=${encodeURIComponent(videoData.title)}`;
    
    // Trigger download by creating an invisible anchor tag
    // This allows browser to handle it as a file download without blocking the UI
    const link = document.createElement('a');
    link.href = streamUrl;
    link.setAttribute('download', `${videoData.title}.mp4`); // Browser will follow Content-Disposition header
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Give some feedback that the download started
    setTimeout(() => {
        setDownloading(false);
        setMessage('브라우저에서 다운로드가 시작되었습니다!');
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <header className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6"
          >
            <Download className="w-4 h-4" />
            Powerful Stream Downloader
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl font-black mb-6 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent"
          >
            Streaming Video Downloader
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            유튜브, 트위치, 인스타그램 등 수천 개의 사이트에서 영상을 고화질로 다운로드하세요. 
            URL만 입력하면 바로 시작됩니다.
          </motion.p>
        </header>

        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <form onSubmit={handleFetch} className="space-y-6">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                <Globe className="w-6 h-6" />
              </div>
              <input
                type="url"
                required
                placeholder="영상의 URL을 입력하세요 (예: https://youtube.com/watch?v=...)"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-5 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-gray-600"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <button
              disabled={loading || downloading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Download className="w-6 h-6" />
                  영상 분석하기
                </>
              )}
            </button>
          </form>

          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-6 p-5 rounded-2xl border flex gap-3 items-center ${
                  status === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}
              >
                {status === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <p className="font-medium">{message}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {videoData && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl"
          >
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="w-full lg:w-72 shrink-0">
                <div className="aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-2xl relative group mb-4">
                  <img src={videoData.thumbnail} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Youtube className="w-12 h-12 text-red-500 opacity-80" />
                  </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold line-clamp-2 leading-tight">{videoData.title}</h3>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    {videoData.uploader} • {videoData.duration_string}
                    </p>
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">포맷 및 해상도 선택</label>
                  <div className="grid grid-cols-1 gap-3">
                    {videoData.formats && videoData.formats.length > 0 ? (
                      videoData.formats.map((f: any) => (
                        <button
                          key={f.format_id}
                          onClick={() => setSelectedFormat(f.format_id)}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                            selectedFormat === f.format_id
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${selectedFormat === f.format_id ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                {f.vcodec !== 'none' ? <Monitor className="w-5 h-5" /> : <Music className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="font-bold">{f.resolution} ({f.extension})</p>
                                <p className="text-xs text-gray-500 italic">Codec: {f.vcodec?.split('.')[0] || 'Unknown'} / {f.acodec?.split('.')[0] || 'None'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium">
                                {f.filesize ? `${(f.filesize / (1024 * 1024)).toFixed(1)} MB` : 'N/A'}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-gray-500 italic p-4 bg-white/5 rounded-2xl border border-white/10">
                        선택 가능한 포맷이 없습니다. 기본 품질로 다운로드합니다.
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-indigo-400 hover:text-white transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-xl"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      다운로드 진행 중...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      지금 컴퓨터에 다운로드
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.section>
        )}

        <footer className="mt-20 flex flex-col items-center gap-6">
          <div className="flex gap-12 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              yt-dlp Engine
            </div>
            <div>Open Source</div>
            <div>Full Privacy</div>
          </div>
          <p className="text-gray-600 text-xs text-center max-w-md">
            이 도구는 교육 및 개인 소장 목적으로만 사용해야 합니다. 
            타인의 저작권을 침해하지 않도록 각 서비스의 이용약관을 준수하세요.
          </p>
        </footer>
      </div>
    </main>
  );
}
