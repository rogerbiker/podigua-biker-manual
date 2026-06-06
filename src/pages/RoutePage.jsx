import { BookOpen, Camera, Film } from "lucide-react";
import FeatureEntryCard from "../components/FeatureEntryCard";

export default function RoutePage({ setCurrentTab }) {
  const entries = [
    {
      id: "story",
      title: "壯騎故事｜每日圖文手記",
      description: "閱讀 Day1 到 Day8 的每日圖文故事，重溫每一段山海挑戰與團隊記憶。",
      buttonText: "閱讀故事",
      icon: BookOpen,
      onClick: () => setCurrentTab("story-day1"),
      background: "linear-gradient(135deg, #F8D77A 0%, #FCE9B5 100%)",
      borderColor: "#E7B93E",
      shadowColor: "rgba(180, 125, 15, 0.22)",
      iconBg: "bg-white/80 text-amber-700 border border-amber-300",
      btnClass: "bg-white/90 hover:bg-amber-600 border border-amber-300 text-slate-700 group-hover:text-white group-hover:border-amber-600",
    },
    {
      id: "photos",
      title: "影像紀錄｜照片牆",
      description: "瀏覽每日精彩照片，回到隊友同行、山海路線與休息片刻的現場。",
      buttonText: "瀏覽照片",
      icon: Camera,
      onClick: () => setCurrentTab("media-photos"),
      background: "linear-gradient(135deg, #A9E2CE 0%, #D1F2E7 100%)",
      borderColor: "#54B997",
      shadowColor: "rgba(22, 133, 98, 0.20)",
      iconBg: "bg-white/80 text-emerald-700 border border-emerald-300",
      btnClass: "bg-white/90 hover:bg-emerald-600 border border-emerald-300 text-slate-700 group-hover:text-white group-hover:border-emerald-600",
    },
    {
      id: "videos",
      title: "每日短影片｜壯騎回顧",
      description: "觀看每日短影片，快速重溫從富貴角到鵝鑾鼻的壯騎歷程。",
      buttonText: "觀看影片",
      icon: Film,
      onClick: () => setCurrentTab("media-videos"),
      background: "linear-gradient(135deg, #B7D2F4 0%, #D7E3F8 100%)",
      borderColor: "#6D9DDB",
      shadowColor: "rgba(45, 101, 180, 0.20)",
      iconBg: "bg-white/80 text-blue-700 border border-blue-300",
      btnClass: "bg-white/90 hover:bg-blue-600 border border-blue-300 text-slate-700 group-hover:text-white group-hover:border-blue-600",
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
      <div className="space-y-2.5">
        {entries.map((item) => (
          <FeatureEntryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
