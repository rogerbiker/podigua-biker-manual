import { reviewVideos2025 } from "../data/reviewData";
import { FileText, Film, ExternalLink, Clock } from "lucide-react";

export default function ReviewPage() {
  return (
    <div className="fade-in max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-12">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
          <span className="w-1.5 h-6 bg-biker-orange rounded-full"></span>
          <span>2025 剖地瓜回顧</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          重溫去年的壯騎精彩片段與記事，為 2026 的出發做好行前準備與心理建設！
        </p>
      </div>

      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-biker-navy-dark to-slate-900 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-8 translate-y-8 pointer-events-none">
          <Film className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-xl">
          <span className="inline-block bg-biker-orange text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-3">
            2025 歷史存檔
          </span>
          <h3 className="text-lg font-bold mb-2">暖身與行前回顧</h3>
          <p className="text-xs text-slate-300 leading-relaxed font-light">
            本頁面收錄 2025 年剖地瓜壯騎的每日短影片與遊記。您可以點選下方各天數的卡片觀看影片，感受騎乘氣氛，並參照當天路況與筆記。
          </p>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviewVideos2025.map((video) => {
          const hasVideo = !!video.videoUrl;
          const hasArticle = !!video.articleUrl;

          // Helper to get full video URL supporting base path
          const getFullVideoUrl = (url) => {
            if (!url) return "";
            let fullUrl = url;
            if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("data:")) {
              const baseUrl = import.meta.env.BASE_URL || "/";
              const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
              const cleanUrl = url.startsWith("/") ? url.substring(1) : url;
              fullUrl = `${cleanBase}${cleanUrl}`;
            }
            // Append #t=0.001 to force mobile browsers (like iOS Safari) to render the first frame as thumbnail
            return `${fullUrl}#t=0.001`;
          };

          return (
            <div
              key={video.day}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              {/* Media Player or Placeholder */}
              {hasVideo ? (
                <div className="relative w-full aspect-video bg-slate-950">
                  <video
                    src={getFullVideoUrl(video.videoUrl)}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    playsInline
                    controls
                  />
                </div>
              ) : (
                <div className="w-full aspect-video bg-slate-50 border-b border-slate-100 flex flex-col items-center justify-center text-slate-400 p-5">
                  <Clock className="w-8 h-8 mb-2 text-slate-300 animate-pulse" />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    影片整理中
                  </span>
                </div>
              )}

              {/* Text Info Section */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-[10px] font-black text-biker-navy bg-biker-navy/10 px-2.5 py-0.5 rounded">
                      Day {video.day}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-1">
                    {video.title}
                  </h4>
                  {video.note && (
                    <p className="text-[11px] text-slate-400 leading-relaxed font-light mb-3">
                      {video.note}
                    </p>
                  )}
                </div>

                {/* Article button (only if has article) */}
                {hasArticle && (
                  <a
                    href={video.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-xl border border-slate-200 transition-colors text-xs cursor-pointer mt-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>閱讀文章：{video.articleTitle || "查看紀實"}</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
