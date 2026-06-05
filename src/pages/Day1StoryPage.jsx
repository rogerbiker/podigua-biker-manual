import { ArrowLeft, Download, FileText, ExternalLink, Image as ImageIcon } from "lucide-react";

export default function Day1StoryPage({ setCurrentTab }) {
  const totalPages = 10;
  const pageImages = Array.from({ length: totalPages }, (_, i) => {
    const pageNum = String(i + 1).padStart(2, "0");
    return `${import.meta.env.BASE_URL}images/story/day1/day1-page-${pageNum}.png`;
  });

  const pdfUrl = `${import.meta.env.BASE_URL}downloads/Day1_從富貴角到礁溪_圖文手記正式母稿.pdf`;

  return (
    <div className="bg-[#f1f5f9] min-h-screen text-slate-800 antialiased pb-24 text-left">
      {/* Navigation Top Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          onClick={() => setCurrentTab("trip")}
          className="flex items-center space-x-1.5 text-xs font-black text-slate-600 hover:text-biker-navy transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回行程</span>
        </button>
        <span className="text-xs font-black text-slate-500 tracking-wider hidden sm:inline">
          DAY 1 圖文隨行手記 (原始排版展示)
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentTab("story-day1-pdf")}
            className="inline-flex items-center space-x-1 bg-biker-orange hover:bg-biker-orange-dark text-white text-[10px] md:text-xs font-black px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>開啟完整 PDF</span>
          </button>
        </div>
      </div>

      {/* Intro Header Section */}
      <div className="max-w-2xl mx-auto px-4 mt-6 text-center space-y-2.5">
        <span className="inline-flex items-center space-x-1 bg-biker-navy text-white text-[9px] md:text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-xs">
          熟齡剖地瓜壯騎 ｜ DAY 1 隨行手記
        </span>
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
          Day 1｜從富貴角到礁溪
        </h1>
        <p className="text-xs md:text-sm text-slate-500 font-medium">
          「不是暖身，是一場130公里的壓力測試」
        </p>
        <div className="text-[10px] text-slate-400 font-bold border-t border-b border-slate-200/80 py-2 mt-4 flex justify-center space-x-4">
          <span>📅 日期: 2026.05.27</span>
          <span>🚴 距離: 約 130 km</span>
          <span>🏔️ 爬升: 近 2,000 m</span>
          <span>✍️ 撰文: Roger Coach & 阿亮</span>
        </div>
      </div>

      {/* Pages Container (手機友善的直向閱讀模式，無裁切，有間距) */}
      <div className="max-w-2xl mx-auto px-2 sm:px-4 mt-6 space-y-4 md:space-y-6">
        {pageImages.map((src, index) => (
          <div 
            key={index} 
            className="bg-white rounded-2xl shadow-xs border border-slate-200/60 overflow-hidden relative"
          >
            {/* Page number badge */}
            <div className="absolute top-3 right-3 z-10 bg-slate-900/65 backdrop-blur-xs text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full select-none">
              頁 {index + 1} / {totalPages}
            </div>
            
            <img
              src={src}
              alt={`Day 1 圖文手記 - 第 ${index + 1} 頁`}
              className="w-full h-auto object-contain block"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Footer Action Panel */}
      <div className="max-w-2xl mx-auto px-4 mt-12 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-4.5">
          <div className="flex flex-col items-center space-y-1.5">
            <FileText className="w-9 h-9 text-biker-orange" />
            <h4 className="text-sm font-black text-slate-800">下載或檢視完整 PDF 檔案</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md">
              此手記為已排版設計的完整圖文作品。您可以下載原始 PDF 檔案以利離線閱讀與分享，或點擊頂部「開啟完整 PDF」在線上檢視。
            </p>
          </div>
          
          <div className="flex justify-center">
            <a
              href={pdfUrl}
              download
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-biker-navy hover:bg-biker-navy-dark text-white font-bold py-2.5 px-8 rounded-xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載完整 PDF 檔案</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
