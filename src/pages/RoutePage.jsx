import { BookOpen, Camera, Film, ChevronRight } from "lucide-react";

export default function RoutePage({ setCurrentTab }) {
  const entries = [
    {
      id: "story",
      title: "壯騎故事｜每日圖文手記",
      description: "閱讀 Day1 到 Day8 的每日圖文故事，重溫每一段山海挑戰與團隊記憶。",
      buttonText: "閱讀故事 →",
      icon: BookOpen,
      onClick: () => setCurrentTab("story-day1"),
      gradient: "from-amber-500/[0.02] to-orange-500/[0.02] hover:from-amber-500/[0.07] hover:to-orange-500/[0.07]",
      border: "border-slate-200/60 hover:border-amber-200/80",
      iconBg: "bg-amber-50/80 text-amber-600 border border-amber-100/50",
      btnClass: "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600",
    },
    {
      id: "photos",
      title: "影像紀錄｜照片牆",
      description: "瀏覽每日精彩照片，回到隊友同行、山海路線與休息片刻的現場。",
      buttonText: "瀏覽照片 →",
      icon: Camera,
      onClick: () => setCurrentTab("media"),
      gradient: "from-emerald-500/[0.02] to-teal-500/[0.02] hover:from-emerald-500/[0.07] hover:to-teal-500/[0.07]",
      border: "border-slate-200/60 hover:border-emerald-200/80",
      iconBg: "bg-emerald-50/80 text-emerald-600 border border-emerald-100/50",
      btnClass: "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600",
    },
    {
      id: "videos",
      title: "每日短影片｜壯騎回顧",
      description: "觀看每日短影片，快速重溫從富貴角到鵝鑾鼻的壯騎歷程。",
      buttonText: "觀看影片 →",
      icon: Film,
      onClick: () => setCurrentTab("media"),
      gradient: "from-blue-500/[0.02] to-indigo-500/[0.02] hover:from-blue-500/[0.07] hover:to-indigo-500/[0.07]",
      border: "border-slate-200/60 hover:border-blue-200/80",
      iconBg: "bg-blue-50/80 text-blue-600 border border-blue-100/50",
      btnClass: "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600",
    },
  ];

  return (
    <div className="fade-in max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-12 text-left animate-fade-in">
      {/* Page Header with Right-aligned Alert Box on Desktop (stacks on mobile) */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
            <span className="w-1.5 h-6 bg-biker-navy rounded-full"></span>
            <span>壯騎紀錄</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            2026 富貴角燈塔至鵝鑾鼻燈塔壯騎紀錄
          </p>
        </div>
        
        {/* Semi-transparent Light-colored Tip Box at Top Right */}
        <div className="max-w-md bg-blue-50/45 backdrop-blur-xs border border-blue-100/50 text-blue-800 rounded-2xl p-4 text-[11px] leading-relaxed font-medium shadow-xs">
          💡 <strong>測試溫馨提醒</strong>：點擊導航時，Google Maps 預設會以您手機的<strong>「目前即時 GPS 位置」</strong>作為出發起點。因此您現在在台北測試時，導航起點會抓取台北；實際出發騎乘時，手機就會自動以您當時在當地的位置作為起點。
        </div>
      </div>

      {/* Entry Cards List */}
      <div className="space-y-4">
        {entries.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={item.onClick}
              className={`bg-white/75 backdrop-blur-xs border ${item.border} bg-gradient-to-r ${item.gradient} rounded-2xl p-5 md:p-6 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer group`}
            >
              <div className="flex items-start md:items-center space-x-4">
                <div className={`${item.iconBg} p-3 rounded-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-103`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-black text-slate-800 group-hover:text-biker-orange transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex-shrink-0">
                <span className={`inline-flex items-center justify-center font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-all active:scale-95 whitespace-nowrap ${item.btnClass}`}>
                  <span>{item.buttonText}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
