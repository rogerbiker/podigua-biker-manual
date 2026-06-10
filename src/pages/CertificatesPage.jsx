import { useState } from "react";
import { createPortal } from "react-dom";
import { certificates } from "../data/certificateData";
import { Award, Globe, X, ChevronRight } from "lucide-react";

// Image display wrapper with beautiful CSS fallback for missing or loading images
function CertificateThumb({ src, name, onClick }) {
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);

  const getFullUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const baseUrl = import.meta.env.BASE_URL || "/";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    const cleanUrl = url.startsWith("/") ? url.substring(1) : url;
    return `${cleanBase}${cleanUrl}`;
  };

  if (imgError || !src) {
    return (
      <div 
        onClick={onClick}
        className="w-full aspect-[4/3] bg-slate-50 border-2 border-dashed border-slate-200/80 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-slate-100/50 hover:border-slate-300 transition-all active:scale-[0.98]"
      >
        <span className="text-3xl mb-1.5 animate-pulse">📜</span>
        <span className="text-xs font-black text-slate-400">證書製作中</span>
        <span className="text-[9px] text-slate-300 mt-1 font-medium">{name} 完騎證明</span>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className="relative w-full aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-100 flex items-center justify-center cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all duration-200"
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-[10px] text-slate-400 font-bold">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-ping mr-1.5"></span>
          載入中...
        </div>
      )}
      <img
        src={getFullUrl(src)}
        alt={`${name} 完騎證書`}
        onLoad={() => setLoading(false)}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      <div className="absolute inset-0 bg-black/5 hover:bg-black/0 transition-colors" />
    </div>
  );
}

export default function CertificatesPage() {
  const [activeCert, setActiveCert] = useState(null);
  const [lightboxLang, setLightboxLang] = useState("zh"); // "zh" or "en"

  const openLightbox = (cert, initialLang = "zh") => {
    setActiveCert(cert);
    setLightboxLang(initialLang);
  };

  return (
    <div className="fade-in max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-12 text-slate-700">
      {/* Header section */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
          <span className="w-1.5 h-6 bg-biker-orange rounded-full"></span>
          <span>完騎證書專區 🏆</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          恭喜 2026 熟齡剖地瓜壯騎全體 8 位騎士順利完騎！此專區收錄了每位夥伴的完騎證書與珍貴的心路歷程感想。
        </p>
      </div>

      {/* Main card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <div 
            key={cert.id} 
            className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-200 hover:shadow-md transition-all duration-200"
          >
            {/* Top row: Name, Role and tags */}
            <div className="flex items-start justify-between w-full">
              <div className="text-left">
                <h4 className="text-lg font-black text-slate-800 tracking-tight">
                  {cert.name}
                </h4>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="inline-flex items-center text-[10px] font-bold text-biker-navy-dark bg-slate-100 border border-slate-200/50 px-2.5 py-0.5 rounded-full shadow-2xs">
                    {cert.role}
                  </span>
                  {cert.certificateEn && (
                    <span className="inline-flex items-center text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full shadow-2xs">
                      <Globe className="w-2.5 h-2.5 mr-0.5" />
                      中/EN 雙語版
                    </span>
                  )}
                </div>
              </div>
              <div className="text-slate-200 hover:text-biker-orange transition-colors">
                <Award className="w-8 h-8 stroke-1 fill-current opacity-70" />
              </div>
            </div>

            {/* Middle: Certificate Thumb */}
            <div className="space-y-2">
              <CertificateThumb 
                src={cert.certificateZh} 
                name={cert.name} 
                onClick={() => openLightbox(cert, "zh")} 
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold px-1">
                <span>點擊圖片可放大檢視</span>
                {cert.certificateEn && (
                  <button
                    type="button"
                    onClick={() => openLightbox(cert, "en")}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-0.5 focus:outline-none"
                  >
                    <span>切換英文版</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom: Highlight and Reflection */}
            <div className="pt-3 border-t border-slate-50 space-y-3 flex-1 flex flex-col justify-between text-left">
              {/* Highlight */}
              <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-2.5">
                <span className="block text-[10px] font-black text-biker-orange-dark uppercase tracking-wider">
                  完騎亮點
                </span>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-0.5">
                  {cert.highlight}
                </p>
              </div>

              {/* Reflection */}
              <div className="space-y-1 w-full">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400">
                  <span>完騎感言</span>
                  <span>{cert.reflectionDate}</span>
                </div>
                <p className={`text-xs leading-relaxed ${
                  cert.reflection.includes("待補") || cert.reflection.includes("敬請期待")
                    ? "text-slate-400 italic font-medium" 
                    : "text-slate-600 font-normal"
                } bg-slate-50/30 rounded-xl p-3 border border-slate-100/50 min-h-[72px] line-clamp-4 hover:line-clamp-none transition-all duration-300`}>
                  {cert.reflection}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Zoom Portal Overlay */}
      {activeCert && createPortal(
        <div 
          className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col justify-between p-4 md:p-6 fade-in"
          onClick={() => setActiveCert(null)}
        >
          {/* Top row: Close and Info */}
          <div className="w-full max-w-4xl mx-auto flex justify-between items-center text-white pb-2 border-b border-white/10 z-10">
            <div className="text-left">
              <h3 className="text-sm md:text-base font-black tracking-tight flex items-center space-x-1.5">
                <span>{activeCert.name} 的完騎證書</span>
                <span className="text-xs bg-biker-orange text-white px-2 py-0.5 rounded-full font-bold">
                  {activeCert.role}
                </span>
              </h3>
            </div>
            <button
              onClick={() => setActiveCert(null)}
              className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
              title="關閉"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center: Image viewport with Fallback */}
          <div 
            className="flex-1 flex items-center justify-center my-4 overflow-hidden relative max-w-4xl mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const currentImageSrc = lightboxLang === "zh" ? activeCert.certificateZh : activeCert.certificateEn;
              const cleanBase = (import.meta.env.BASE_URL || "/").endsWith("/") ? (import.meta.env.BASE_URL || "/") : `${import.meta.env.BASE_URL || "/"}/`;
              const fullSrc = currentImageSrc 
                ? (currentImageSrc.startsWith("http") ? currentImageSrc : `${cleanBase}${currentImageSrc.startsWith("/") ? currentImageSrc.substring(1) : currentImageSrc}`)
                : "";

              return !fullSrc ? (
                <div className="bg-slate-900 border border-white/10 text-white rounded-3xl p-8 max-w-sm text-center shadow-2xl">
                  <span className="text-4xl block mb-2">📜</span>
                  <p className="text-sm font-black">證書製作中</p>
                  <p className="text-xs text-white/50 mt-1">目前該版本證書尚在整理中，敬請期待！</p>
                </div>
              ) : (
                <img
                  src={fullSrc}
                  alt={`${activeCert.name} 完騎證書`}
                  className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl border border-white/5 animate-zoom-in"
                  onError={(e) => {
                    // Fallback to stylized text overlay if image fails to load
                    e.target.style.display = "none";
                    const parent = e.target.parentElement;
                    if (parent) {
                      const placeholder = document.createElement("div");
                      placeholder.className = "bg-slate-900 border border-white/10 text-white rounded-3xl p-8 max-w-sm text-center shadow-2xl animate-fade-in";
                      placeholder.innerHTML = `
                        <span class="text-4xl block mb-2">📜</span>
                        <p class="text-sm font-black">證書製作中</p>
                        <p class="text-xs text-white/50 mt-1">證書圖檔正在上傳整理中，敬請期待！</p>
                      `;
                      parent.appendChild(placeholder);
                    }
                  }}
                />
              );
            })()}
          </div>

          {/* Bottom row: Control Tab and Metadata */}
          <div 
            className="w-full max-w-4xl mx-auto bg-slate-900 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Language toggle if English version is available */}
            {activeCert.certificateEn ? (
              <div className="bg-slate-950 p-1 rounded-xl flex border border-white/5 shadow-inner">
                <button
                  onClick={() => setLightboxLang("zh")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    lightboxLang === "zh"
                      ? "bg-biker-orange text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  中文版證書
                </button>
                <button
                  onClick={() => setLightboxLang("en")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    lightboxLang === "en"
                      ? "bg-biker-orange text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  英文版證書
                </button>
              </div>
            ) : (
              <div className="text-xs font-bold text-slate-400 bg-slate-950/50 px-3 py-1.5 rounded-xl border border-white/5">
                ✨ 中文版證書
              </div>
            )}

            {/* Quick helper tip */}
            <p className="text-[10px] text-slate-400 font-bold text-center md:text-right max-w-md leading-relaxed">
              💡 行動裝置說明：若要儲存證書，您也可以在放大畫面後「長按證書圖片」直接將證書存入您的手機相簿。
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
