import { ArrowLeft, Download, FileText, Smartphone } from "lucide-react";

export default function Day1PdfPage({ setCurrentTab }) {
  const pdfUrl = `${import.meta.env.BASE_URL}downloads/Day1_從富貴角到礁溪_圖文手記正式母稿.pdf`;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased flex flex-col text-left">
      {/* Top Header Navigation */}
      <div className="sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <button
          onClick={() => setCurrentTab("story-day1")}
          className="flex items-center space-x-1.5 text-xs font-black text-slate-350 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回手記</span>
        </button>
        <span className="text-xs font-black text-slate-400 tracking-wider hidden sm:inline">
          Day 1 隨行手記 ｜ 完整 PDF 閱讀器
        </span>
        <a
          href={pdfUrl}
          download
          className="inline-flex items-center space-x-1.5 bg-biker-orange hover:bg-biker-orange-dark text-white text-xs font-black px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer animate-pulse"
        >
          <Download className="w-3.5 h-3.5" />
          <span>下載 PDF</span>
        </a>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-140px)] md:h-[calc(100vh-60px)]">
        {/* Mobile View: Warning & Action Panel */}
        <div className="block md:hidden p-6 text-center space-y-6 my-auto max-w-sm mx-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-center">
              <Smartphone className="w-12 h-12 text-biker-orange animate-bounce" />
            </div>
            <h3 className="text-base font-black text-slate-800">行動裝置 PDF 閱讀提示</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              部分手機瀏覽器不支援在網頁內直接滾動閱讀多頁 PDF。為獲得最佳閱讀體驗，您可以：
            </p>
            <div className="pt-2 flex flex-col gap-3">
              <a
                href={pdfUrl}
                download
                className="w-full inline-flex items-center justify-center space-x-2 bg-biker-orange hover:bg-biker-orange-dark text-white font-bold py-3 px-6 rounded-2xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>下載 PDF 檔案至手機</span>
              </a>
              <button
                onClick={() => setCurrentTab("story-day1")}
                className="w-full inline-flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-2xl text-xs border border-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回逐頁圖片模式</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop View: Embedded Native PDF Viewer */}
        <div className="hidden md:block flex-1 w-full h-full bg-slate-200">
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full border-none"
          >
            <iframe
              src={pdfUrl}
              className="w-full h-full border-none"
              title="Day 1 PDF Document Viewer"
            >
              <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4 bg-white">
                <FileText className="w-12 h-12 text-slate-400" />
                <p className="text-sm text-slate-600 font-medium">
                  您的瀏覽器不支援直接預覽 PDF。
                </p>
                <a
                  href={pdfUrl}
                  download
                  className="inline-flex items-center space-x-2 bg-biker-navy text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>下載 PDF 檔案</span>
                </a>
              </div>
            </iframe>
          </object>
        </div>
      </div>
    </div>
  );
}
