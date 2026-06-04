import { Info, Home, Video, Image, MessageSquare } from "lucide-react";

export default function DayDetail({ dayData }) {
  const { lodging, media } = dayData;

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      {/* Lodging Detail & Rooms */}
      {lodging && (
        <div className="bg-white rounded-xl p-4 border border-slate-100 mb-4 text-xs md:text-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
            <Home className="w-3.5 h-3.5 text-biker-navy" />
            <span>住宿房型與費用明細</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <span className="text-slate-400">房間數量/房型：</span>
                <span className="font-semibold text-slate-700 block mt-0.5">{lodging.rooms || "－"}</span>
              </div>
              {lodging.address && (
                <div>
                  <span className="text-slate-400">詳細地址：</span>
                  <span className="font-medium text-slate-700 block mt-0.5">{lodging.address}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex space-x-4">
                <div>
                  <span className="text-slate-400">房價估計：</span>
                  <span className="font-bold text-slate-800 block mt-0.5">
                    {lodging.cost ? `${lodging.cost.toLocaleString()} 元` : "－"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">已付訂金：</span>
                  <span className="font-bold text-slate-800 block mt-0.5">
                    {lodging.depositPaid ? `${lodging.depositPaid.toLocaleString()} 元` : "－"}
                  </span>
                </div>
              </div>
              {lodging.note && (
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">入住提醒：</span>
                  <span className="text-slate-600 font-medium text-xs leading-relaxed">
                    {lodging.note}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stage 2 Future Expansion Placeholders (Visually Sleek but Inactive) */}
      <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>第二階段 壯騎紀錄預留欄位</span>
          </h4>
          <span className="text-[10px] bg-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded-full">
            待啟用
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400 mt-3">
          <div className="bg-white/60 rounded-lg p-2.5 border border-slate-100 flex items-center space-x-2">
            <Video className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <div>
              <span className="block font-semibold">每日團隊影片</span>
              <span className="text-[10px] text-slate-300">media.teamVideoUrl</span>
            </div>
          </div>

          <div className="bg-white/60 rounded-lg p-2.5 border border-slate-100 flex items-center space-x-2">
            <Image className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <div>
              <span className="block font-semibold">壯騎花絮照片 ({media?.photos?.length || 0})</span>
              <span className="text-[10px] text-slate-300">media.photos / videos</span>
            </div>
          </div>

          <div className="bg-white/60 rounded-lg p-2.5 border border-slate-100 flex items-center space-x-2 md:col-span-2">
            <MessageSquare className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <div className="w-full">
              <span className="block font-semibold">每日領隊觀察 & 隊友個人感言</span>
              <span className="text-[10px] text-slate-300 block">
                reflections.rogerNote / teamNotes / personalComments
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
