import { tripDays } from "../data/tripData";
import { Utensils, Home, MapPin } from "lucide-react";

export default function FoodLodgingPage() {
  // Format Date (e.g. 5/27)
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // Helper to render map link
  const renderItemLink = (item) => {
    if (!item) return <span className="text-slate-400">－</span>;
    if (item.url && item.url.trim().length > 0) {
      return (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-biker-navy-light hover:underline font-semibold"
        >
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{item.name}</span>
        </a>
      );
    }
    return <span className="text-slate-700 font-medium">{item.name}</span>;
  };

  return (
    <div className="fade-in max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
          <span className="w-1.5 h-6 bg-biker-orange rounded-full"></span>
          <span>住宿餐食統整</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          快速瀏覽每一天的餐食與住宿安排。點擊名稱即可直接開啟 Google Maps 導航。
        </p>
      </div>

      {/* Desktop View Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
              <th className="py-4 px-6 text-center">日期</th>
              <th className="py-4 px-6">🍛 中餐</th>
              <th className="py-4 px-6">🏨 住宿</th>
              <th className="py-4 px-6">🍲 晚餐</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {tripDays.map((day) => {
              if (day.day === 8) {
                // Day 8 has special travel back info
                return (
                  <tr key={day.day} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-bold text-slate-600 text-center whitespace-nowrap">
                      <div>Day {day.day}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">{formatDate(day.date)}</div>
                    </td>
                    <td colSpan={3} className="py-4 px-6 text-slate-500 font-medium bg-slate-50/30">
                      🚚 恆春返家行程 (不提供食宿，細節待補)
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={day.day} className="hover:bg-slate-50/50">
                  {/* Date Column */}
                  <td className="py-4 px-6 font-bold text-slate-700 text-center whitespace-nowrap">
                    <div className="text-sm">Day {day.day}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">{formatDate(day.date)}</div>
                  </td>
                  {/* Lunch Column */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      {renderItemLink(day.lunch)}
                      {day.lunch?.cost && (
                        <span className="text-[10px] text-slate-400 mt-0.5">{day.lunch.cost}</span>
                      )}
                    </div>
                  </td>
                  {/* Lodging Column */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      {renderItemLink(day.lodging)}
                      {day.lodging?.rooms && (
                        <span className="text-[10px] text-slate-400 mt-0.5">{day.lodging.rooms}</span>
                      )}
                    </div>
                  </td>
                  {/* Dinner Column */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      {renderItemLink(day.dinner)}
                      {day.dinner?.cost && (
                        <span className="text-[10px] text-slate-400 mt-0.5">{day.dinner.cost}</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View Card List */}
      <div className="md:hidden space-y-4">
        {tripDays.map((day) => {
          const isDay8 = day.day === 8;
          return (
            <div key={day.day} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              {/* Day Header */}
              <div className="flex justify-between items-center border-b border-slate-50 pb-2.5 mb-3">
                <span className="text-sm font-black text-slate-800">
                  Day {day.day} ｜ {day.title}
                </span>
                <span className="text-xs font-bold text-biker-orange bg-biker-orange/15 px-2 py-0.5 rounded">
                  {formatDate(day.date)}
                </span>
              </div>

              {isDay8 ? (
                <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg leading-relaxed">
                  🚚 恆春返家行程 (不提供食宿，細節待補)
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3.5 text-xs">
                  {/* Lunch */}
                  <div className="flex items-start space-x-2.5">
                    <div className="p-1.5 bg-slate-50 rounded text-slate-400 mt-0.5">
                      <Utensils className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        中餐
                      </span>
                      <div className="mt-0.5">{renderItemLink(day.lunch)}</div>
                      {day.lunch?.cost && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">{day.lunch.cost}</span>
                      )}
                    </div>
                  </div>

                  {/* Lodging */}
                  <div className="flex items-start space-x-2.5 border-t border-slate-50 pt-3">
                    <div className="p-1.5 bg-slate-50 rounded text-slate-400 mt-0.5">
                      <Home className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        住宿
                      </span>
                      <div className="mt-0.5">{renderItemLink(day.lodging)}</div>
                      {day.lodging?.rooms && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">{day.lodging.rooms}</span>
                      )}
                    </div>
                  </div>

                  {/* Dinner */}
                  <div className="flex items-start space-x-2.5 border-t border-slate-50 pt-3">
                    <div className="p-1.5 bg-slate-50 rounded text-slate-400 mt-0.5">
                      <Utensils className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        晚餐
                      </span>
                      <div className="mt-0.5">{renderItemLink(day.dinner)}</div>
                      {day.dinner?.cost && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">{day.dinner.cost}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
