import { Bell, AlertCircle, Waves, Utensils, RefreshCw, Truck } from "lucide-react";

export default function ReminderPage() {
  const reminders = [
    {
      id: 1,
      date: "5/27 (Day 1)",
      title: "礁溪秘境需帶泳衣",
      content: "戶外溫泉池開放使用，需穿泳裝（僅開放湯屋與溫泉池）。",
      icon: Waves,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      id: 2,
      date: "5/31 (Day 5)",
      title: "阿宏の家需提前點餐",
      content: "最晚必須在 5/29 前完成點餐。菜單包含沙茶鍋，沒有大骨鍋的版本才是最新版。",
      icon: Utensils,
      color: "bg-amber-50 text-amber-700 border-amber-100",
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      id: 3,
      date: "6/3 (Day 8)",
      title: "返程安排待補",
      content: "需補上全體人員返程交通、單車裝箱運送、支援車動線以及行李分流方式。",
      icon: RefreshCw,
      color: "bg-orange-50 text-orange-700 border-orange-100",
      badgeColor: "bg-orange-100 text-orange-800",
    },
    {
      id: 4,
      date: "行前",
      title: "支援車司機：莊茂昌",
      content: "本次壯騎後勤支援車司機由莊茂昌大哥擔任，將全程陪伴並提供補給與行李運送服務。",
      icon: Truck,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
  ];

  return (
    <div className="fade-in max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-12">
      {/* Page Header */}
      <div className="mb-6 flex items-center space-x-3">
        <div className="bg-biker-orange/10 p-2.5 rounded-full text-biker-orange">
          <Bell className="w-6 h-6 animate-swing" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">重要提醒事項</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            過濾瑣碎內容，僅保留最關鍵的行前準備與注意事項。
          </p>
        </div>
      </div>

      {/* Critical Reminders Stack */}
      <div className="space-y-4">
        {reminders.map((rem) => {
          const Icon = rem.icon;
          return (
            <div
              key={rem.id}
              className={`rounded-2xl border p-5 transition-all duration-150 flex items-start space-x-4 bg-white hover:shadow-sm`}
            >
              {/* Decorative side badge */}
              <div className={`p-2.5 rounded-xl ${rem.color} border flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${rem.badgeColor}`}>
                    {rem.date}
                  </span>
                </div>
                <h3 className="text-sm md:text-base font-bold text-slate-800 mt-2">
                  {rem.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed mt-1 font-medium">
                  {rem.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tip Banner */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mt-8 flex items-start space-x-2.5">
        <AlertCircle className="w-5 h-5 text-biker-navy-light mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-biker-navy-dark">手冊查閱小技巧</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
            建議在出發前將此手冊加到手機的主畫面（Add to Home Screen），即可像手機 App 一樣全螢幕快速查閱，即使在山區也能隨時參照。
          </p>
        </div>
      </div>
    </div>
  );
}
