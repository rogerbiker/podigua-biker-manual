import { useState } from "react";
import { tripDays } from "../data/tripData";
import DayCard from "../components/DayCard";
import { FileText } from "lucide-react";

export default function TripOverview({ selectedDayId, setCurrentTab }) {
  // Store expanded state for each day
  const [expandedDays, setExpandedDays] = useState({});
  const [prevSelectedDayId, setPrevSelectedDayId] = useState(null);

  // Sync prop changes to state during render (officially recommended React pattern)
  if (selectedDayId !== prevSelectedDayId) {
    setPrevSelectedDayId(selectedDayId);
    if (selectedDayId) {
      setExpandedDays((prev) => ({
        ...prev,
        [selectedDayId]: true,
      }));
    } else {
      // Clear expanded days when returning to overview list mode
      setExpandedDays({});
    }
  }

  // Expand all / Collapse all helper
  const handleToggleAll = (expand) => {
    const newState = {};
    tripDays.forEach((day) => {
      newState[day.day] = expand;
    });
    setExpandedDays(newState);
  };

  // Toggle single day card
  const handleToggleDay = (dayNum) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNum]: !prev[dayNum],
    }));
  };

  return (
    <div className="fade-in max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
            <span className="w-1.5 h-6 bg-biker-navy rounded-full"></span>
            <span>每日行程明細</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            點擊行程卡片可展開查看詳細地圖導航、入住須知與預留欄位。
          </p>
        </div>

        {/* Global toggles */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleToggleAll(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-lg transition-colors"
          >
            展開全部
          </button>
          <button
            onClick={() => handleToggleAll(false)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-lg transition-colors"
          >
            收合全部
          </button>
        </div>
      </div>

      {/* 隨行手記宣傳 Banner */}
      <div 
        onClick={() => setCurrentTab("story-day1")}
        className="mb-6 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 rounded-2xl p-4 flex items-center justify-between cursor-pointer group transition-all duration-200"
      >
        <div className="flex items-center space-x-3.5 text-left">
          <div className="bg-biker-orange text-white p-2.5 rounded-xl shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 group-hover:text-biker-orange transition-colors">📖 2026 剖地瓜圖文隨行手記已上線！</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
              記錄每日壯騎的點滴挑戰與精彩故事，點擊即可閱讀 Day 1 「從富貴角到礁溪」的隨行手記。
            </p>
          </div>
        </div>
        <span className="text-xs font-black text-biker-orange flex items-center whitespace-nowrap ml-2">
          立即閱讀 ➔
        </span>
      </div>

      {/* Trip Days Cards Stack */}
      <div className="space-y-4">
        {tripDays.map((dayData) => (
          <DayCard
            key={dayData.day}
            dayData={dayData}
            isExpanded={!!expandedDays[dayData.day]}
            onToggle={() => handleToggleDay(dayData.day)}
            setCurrentTab={setCurrentTab}
          />
        ))}
      </div>
    </div>
  );
}
