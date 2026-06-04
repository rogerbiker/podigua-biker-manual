import { tripDays } from "../data/tripData";
import { DollarSign, ShieldAlert, Receipt } from "lucide-react";

export default function CostPage() {
  // Helper to format currency values
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || amount === 0) return "－";
    return `${amount.toLocaleString()} 元`;
  };

  // Dynamically map cost details from tripDays
  const costData = tripDays
    .filter((day) => day.lodging)
    .map((day) => {
      const dateParts = day.date.split("-");
      const formattedDate = `${parseInt(dateParts[1])}/${parseInt(dateParts[2])}`;
      
      const lunchDisplay = day.lunch 
        ? (day.lunch.cost || day.lunch.name || "－") 
        : "－";
        
      const dinnerDisplay = day.dinner 
        ? (day.dinner.cost || day.dinner.name || "－") 
        : "－";

      return {
        date: formattedDate,
        lodgingName: day.lodging.name,
        cost: day.lodging.cost,
        deposit: day.lodging.depositPaid,
        lunch: lunchDisplay,
        dinner: dinnerDisplay,
      };
    });

  const totalLodging = tripDays.reduce((sum, day) => {
    return sum + (day.lodging?.cost || 0);
  }, 0);

  const totalDeposit = tripDays.reduce((sum, day) => {
    return sum + (day.lodging?.depositPaid || 0);
  }, 0);

  return (
    <div className="fade-in max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
          <span className="w-1.5 h-6 bg-biker-orange rounded-full"></span>
          <span>費用預算整理</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          彙整已知之住宿費用、已支付定金及餐飲預算資訊。
        </p>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              住宿費粗估合計
            </span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">
              {totalLodging.toLocaleString()} 元
            </span>
          </div>
          <div className="p-3 bg-biker-navy/10 text-biker-navy rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              已知已付訂金合計
            </span>
            <span className="text-2xl font-black text-biker-green mt-1 block">
              {totalDeposit.toLocaleString()} 元
            </span>
          </div>
          <div className="p-3 bg-biker-green/10 text-biker-green rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Warning Alert banner */}
      <div className="bg-orange-50 border border-orange-100 text-orange-800 rounded-2xl p-5 mb-6 flex items-start space-x-3.5">
        <ShieldAlert className="w-5 h-5 text-biker-orange mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-xs md:text-sm font-bold text-slate-800">重要備註 ｜ 請勿在此進行分攤</h4>
          <p className="text-xs text-slate-600 leading-relaxed mt-1 font-medium">
            本頁僅進行「已知費用資料整理」，第一階段**暫不開放分攤計算器**。
            因為支援車租賃、油資過路費、停車費、公用補給物資、部分早餐餐費等各項資料尚未齊全，請勿以此數字進行最終分攤款項計算。
          </p>
        </div>
      </div>

      {/* Desktop Cost Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
              <th className="py-4 px-5 text-center">日期</th>
              <th className="py-4 px-5">🏨 住宿地點</th>
              <th className="py-4 px-5 text-right">已知住宿費</th>
              <th className="py-4 px-5 text-right">已付訂金</th>
              <th className="py-4 px-5">🍛 中餐預算</th>
              <th className="py-4 px-5">🍲 晚餐預算</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {costData.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50/50">
                <td className="py-4 px-5 font-bold text-slate-700 text-center whitespace-nowrap">
                  {item.date}
                </td>
                <td className="py-4 px-5 font-medium text-slate-800">{item.lodgingName}</td>
                <td className="py-4 px-5 text-right font-bold text-slate-700">
                  {formatAmount(item.cost)}
                </td>
                <td className="py-4 px-5 text-right font-bold text-biker-green">
                  {formatAmount(item.deposit)}
                </td>
                <td className="py-4 px-5 text-slate-500 font-medium">{item.lunch}</td>
                <td className="py-4 px-5 text-slate-500 font-medium">{item.dinner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cost Cards list */}
      <div className="md:hidden space-y-4">
        {costData.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2 mb-3">
              <span className="text-sm font-bold text-slate-800">{item.lodgingName}</span>
              <span className="text-xs font-black text-biker-orange bg-biker-orange/15 px-2 py-0.5 rounded">
                {item.date}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">已知住宿費</span>
                <span className="font-bold text-slate-700 text-sm block mt-0.5">
                  {formatAmount(item.cost)}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block">已付訂金</span>
                <span className="font-bold text-biker-green text-sm block mt-0.5">
                  {formatAmount(item.deposit)}
                </span>
              </div>

              <div className="border-t border-slate-50 pt-2.5 col-span-2 grid grid-cols-2 gap-2 text-slate-500 font-medium">
                <div>
                  <span className="text-slate-400 block text-[10px]">中餐</span>
                  <span className="mt-0.5 block">{item.lunch}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">晚餐</span>
                  <span className="mt-0.5 block">{item.dinner}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
