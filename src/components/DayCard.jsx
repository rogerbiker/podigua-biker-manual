import { Navigation, MapPin, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import DayDetail from "./DayDetail";

export default function DayCard({ dayData, isExpanded, onToggle }) {
  const {
    day,
    date,
    title,
    distanceKm,
    elevationM,
    routeUrl,
    lunch,
    lodging,
    dinner,
    reminders,
    otherNotes,
  } = dayData;

  // Format Date for better display (e.g. 5/27)
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // Helper to check if a navigation link is valid
  const hasLink = (obj) => obj && obj.url && obj.url.trim().length > 0;

  return (
    <div
      id={`day-${day}`}
      className={`bg-white rounded-2xl shadow-sm border border-slate-100 transition-all duration-200 overflow-hidden ${
        isExpanded ? "ring-2 ring-biker-navy/20 shadow-md" : "hover:border-slate-200 hover:shadow"
      }`}
    >
      {/* Header section clickable to toggle expansion */}
      <div
        onClick={onToggle}
        className="p-5 flex items-center justify-between cursor-pointer select-none bg-gradient-to-r hover:from-slate-50 hover:to-white transition-all duration-150"
      >
        <div className="flex items-center space-x-4">
          {/* Day Circle badge */}
          <div className="flex flex-col items-center justify-center bg-biker-navy-dark text-white rounded-xl py-2 px-3 min-w-[56px] shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Day</span>
            <span className="text-xl font-black leading-none">{day}</span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-biker-orange bg-biker-orange/15 px-2 py-0.5 rounded-md">
                {formatDate(date)}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {distanceKm > 0 ? `${distanceKm} km` : "非騎乘日"}
                {elevationM > 0 && ` / 爬升 ${elevationM} m`}
              </span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-slate-800 mt-1">
              {title}
            </h3>
          </div>
        </div>

        {/* Toggle Icon */}
        <div className="text-slate-400 p-1 hover:bg-slate-100 rounded-full transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Quick summary line (only when collapsed) */}
      {!isExpanded && (
        <div className="px-5 pb-4 pt-1 flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-500 border-t border-slate-50">
          {lunch && <span>🍛 中餐: {lunch.name}</span>}
          {lodging && <span>🏨 住宿: {lodging.name}</span>}
          {dinner && <span>🍲 晚餐: {dinner.name}</span>}
        </div>
      )}

      {/* Expanded Details section */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Schedule & Food & Lodging */}
            <div className="space-y-4">
              {/* Daily Stats Table */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  行程統計
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-400">預計距離：</span>
                    <span className="font-bold text-slate-700">{distanceKm > 0 ? `${distanceKm} km` : "－"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">總計爬升：</span>
                    <span className="font-bold text-slate-700">{elevationM > 0 ? `${elevationM} m` : "－"}</span>
                  </div>
                </div>
              </div>

              {/* Meals & Lodging */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  餐食與住宿安排
                </h4>

                {/* Lunch block */}
                {lunch && (
                  <div className="flex justify-between items-start text-sm">
                    <div>
                      <span className="text-slate-500 font-medium block">🍛 中餐</span>
                      <span className="font-bold text-slate-700">{lunch.name}</span>
                      {lunch.cost && (
                        <span className="text-xs text-biker-orange bg-biker-orange/10 px-1.5 py-0.5 rounded ml-2">
                          {lunch.cost}
                        </span>
                      )}
                      {lunch.note && <p className="text-xs text-slate-400 mt-0.5">{lunch.note}</p>}
                    </div>
                    {hasLink(lunch) && (
                      <a
                        href={lunch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-biker-navy-light hover:underline font-semibold"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>中餐地圖</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Lodging block */}
                {lodging && (
                  <div className="flex justify-between items-start text-sm border-t border-slate-50 pt-3">
                    <div>
                      <span className="text-slate-500 font-medium block">🏨 住宿</span>
                      <span className="font-bold text-slate-700">{lodging.name}</span>
                      {lodging.address && (
                        <span className="block text-xs text-slate-400 mt-0.5 font-light">
                          {lodging.address}
                        </span>
                      )}
                    </div>
                    {hasLink(lodging) && (
                      <a
                        href={lodging.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-biker-navy-light hover:underline font-semibold"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>住宿地圖</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Dinner block */}
                {dinner && (
                  <div className="flex justify-between items-start text-sm border-t border-slate-50 pt-3">
                    <div>
                      <span className="text-slate-500 font-medium block">🍲 晚餐</span>
                      <span className="font-bold text-slate-700">{dinner.name}</span>
                      {dinner.cost && (
                        <span className="text-xs text-biker-orange bg-biker-orange/10 px-1.5 py-0.5 rounded ml-2">
                          {dinner.cost}
                        </span>
                      )}
                      {dinner.note && <p className="text-xs text-slate-400 mt-0.5">{dinner.note}</p>}
                    </div>
                    {hasLink(dinner) && (
                      <a
                        href={dinner.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-biker-navy-light hover:underline font-semibold"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>晚餐地圖</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Reminders, Notes, Map Action Buttons */}
            <div className="space-y-4">
              {/* Daily Map & Action Buttons */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Google Maps 導航連結
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                  {routeUrl && (
                    <a
                      href={routeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="col-span-2 flex items-center justify-center space-x-2 bg-biker-navy text-white hover:bg-biker-navy-dark transition-colors py-2.5 px-4 rounded-xl text-xs font-bold shadow-sm"
                    >
                      <Navigation className="w-4 h-4 text-biker-orange-light animate-pulse" />
                      <span>今日路線導航</span>
                    </a>
                  )}

                  {lunch && hasLink(lunch) && (
                    <a
                      href={lunch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors py-2 px-3 rounded-xl text-xs font-bold"
                    >
                      <span>中餐導航</span>
                    </a>
                  )}

                  {lodging && hasLink(lodging) && (
                    <a
                      href={lodging.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors py-2 px-3 rounded-xl text-xs font-bold"
                    >
                      <span>住宿導航</span>
                    </a>
                  )}

                  {dinner && hasLink(dinner) && (
                    <a
                      href={dinner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors py-2 px-3 rounded-xl text-xs font-bold"
                    >
                      <span>晚餐導航</span>
                    </a>
                  )}
                </div>
                


                <p className="text-[10px] text-slate-400 mt-2.5 text-center font-medium">
                  ※ 導航起點預設為您手機的目前 GPS 位置
                </p>
              </div>

              {/* Reminders / Notes */}
              {((reminders && reminders.length > 0) || otherNotes) && (
                <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-biker-orange-dark mb-2 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>今日特別提醒</span>
                  </h4>
                  {reminders && reminders.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 font-medium">
                      {reminders.map((rem, index) => (
                        <li key={index} className="leading-relaxed">
                          {rem}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {otherNotes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Render Stage 2 Component Area inside DayDetail */}
          <DayDetail dayData={dayData} />
        </div>
      )}
    </div>
  );
}
