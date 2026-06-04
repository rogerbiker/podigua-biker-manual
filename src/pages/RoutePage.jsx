import { Navigation, MapPin, ExternalLink, Activity } from "lucide-react";
import { tripDays } from "../data/tripData";

export default function RoutePage() {
  const hasLink = (obj) => obj && obj.url && obj.url.trim().length > 0;

  return (
    <div className="fade-in max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-12">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
          <span className="w-1.5 h-6 bg-biker-green rounded-full"></span>
          <span>每日路線導航</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          專為騎乘中單手操作設計。點擊按鈕可直接啟動手機 Google Maps 進行路線或餐食、住宿導航。
        </p>
        
        {/* Navigation GPS Tip */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-[11px] leading-relaxed font-medium">
          💡 <strong>測試溫馨提醒</strong>：點擊導航時，Google Maps 預設會以您手機的<strong>「目前即時 GPS 位置」</strong>作為出發起點。因此您現在在台北測試時，導航起點會抓取台北；實際出發騎乘時，手機就會自動以您當時在當地的位置作為起點。
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tripDays.map((dayData) => {
          const { day, date, title, distanceKm, elevationM, routeUrl, lunch, lodging, dinner } = dayData;
          const formattedDate = new Date(date).toLocaleDateString("zh-TW", {
            month: "numeric",
            day: "numeric",
          });

          return (
            <div
              key={day}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200 transition-all duration-200 flex flex-col justify-between"
            >
              {/* Header Info */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-biker-navy-dark text-white font-black text-xs px-2.5 py-1 rounded-lg">
                      Day {day}
                    </span>
                    <span className="text-xs font-bold text-biker-orange bg-biker-orange/15 px-2 py-0.5 rounded-md">
                      {formattedDate}
                    </span>
                  </div>
                  {distanceKm > 0 ? (
                    <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                      <Activity className="w-3.5 h-3.5 text-biker-orange" />
                      <span>{distanceKm} km / 爬升 {elevationM} m</span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">非騎乘日</span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-800 mb-4 line-clamp-1">
                  {title}
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-auto">
                {routeUrl ? (
                  <a
                    href={routeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 bg-biker-navy text-white hover:bg-biker-navy-dark active:scale-[0.98] transition-all py-2.5 px-4 rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                  >
                    <Navigation className="w-4 h-4 text-biker-orange-light animate-pulse" />
                    <span>今日騎乘路線導航</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                ) : (
                  <div className="w-full py-2.5 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 font-medium">
                    今日無騎乘路線
                  </div>
                )}

                {/* Sub-destinations maps */}
                <div className="grid grid-cols-3 gap-2">
                  {lunch && hasLink(lunch) ? (
                    <a
                      href={lunch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:text-biker-orange active:scale-95 transition-all p-2 rounded-xl border border-slate-100 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-slate-400 hover:text-biker-orange" />
                      <span className="text-[9px] font-bold text-slate-600 mt-1">中餐點</span>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center justify-center bg-slate-50/50 p-2 rounded-xl border border-dashed border-slate-200 opacity-40">
                      <MapPin className="w-4 h-4 text-slate-300" />
                      <span className="text-[9px] font-medium text-slate-400 mt-1">中餐點</span>
                    </div>
                  )}

                  {lodging && hasLink(lodging) ? (
                    <a
                      href={lodging.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:text-biker-orange active:scale-95 transition-all p-2 rounded-xl border border-slate-100 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-slate-400 hover:text-biker-orange" />
                      <span className="text-[9px] font-bold text-slate-600 mt-1">住宿點</span>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center justify-center bg-slate-50/50 p-2 rounded-xl border border-dashed border-slate-200 opacity-40">
                      <MapPin className="w-4 h-4 text-slate-300" />
                      <span className="text-[9px] font-medium text-slate-400 mt-1">住宿點</span>
                    </div>
                  )}

                  {dinner && hasLink(dinner) ? (
                    <a
                      href={dinner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:text-biker-orange active:scale-95 transition-all p-2 rounded-xl border border-slate-100 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-slate-400 hover:text-biker-orange" />
                      <span className="text-[9px] font-bold text-slate-600 mt-1">晚餐點</span>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center justify-center bg-slate-50/50 p-2 rounded-xl border border-dashed border-slate-200 opacity-40">
                      <MapPin className="w-4 h-4 text-slate-300" />
                      <span className="text-[9px] font-medium text-slate-400 mt-1">晚餐點</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
