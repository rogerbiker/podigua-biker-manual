import { Calendar, MapPin, Navigation, Compass, Shield, Award, ChevronRight, BarChart2, Film, MessageSquare, Camera, BookOpen } from "lucide-react";

export default function HomePage({ setCurrentTab }) {
  const stats = [
    { label: "活動日期", value: "2026/5/27 － 6/3", icon: Calendar, color: "text-biker-navy" },
    { label: "行程天數", value: "8 天 (騎乘 7 天)", icon: Compass, color: "text-biker-navy" },
    { label: "總距離", value: "約 736 km", icon: Navigation, color: "text-biker-orange" },
    { label: "總爬升", value: "約 11,841 m", icon: BarChart2, color: "text-biker-green" },
    { label: "集合地點", value: "松山機場第一停車場", icon: MapPin, color: "text-slate-600", fullWidth: true },
    { label: "起訖點", value: "富貴角燈塔 ➡️ 鵝鑾鼻燈塔", icon: Award, color: "text-biker-orange", fullWidth: true },
    { label: "領騎與領隊", value: "山神 (領騎) / CP Volvo (領隊)", icon: Shield, color: "text-biker-green", fullWidth: true },
  ];

  const fuguijiaoImg = `${import.meta.env.BASE_URL}images/hero/fuguijiao-start.webp`;
  const eluanbiImg = `${import.meta.env.BASE_URL}images/hero/eluanbi-finish.webp`;

  return (
    <div className="fade-in w-full">
      {/* 首頁 Hero 區塊：融入水彩山海背景，橫式延展，無框線無陰影以自然銜接下方證書 */}
      <div 
        className="relative w-full text-center flex flex-col items-center justify-start pt-8 pb-14 md:pt-14 md:pb-24 bg-[size:100%_auto] md:bg-cover bg-bottom bg-no-repeat bg-white"
        style={{ 
          backgroundImage: `url(${import.meta.env.BASE_URL}images/hero/landscape-bg.jpg)`,
        }}
      >
        {/* 底部自然淡出至 slate-50 漸層，實現無縫銜接 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 pointer-events-none" />
        
        {/* 內容區：置於山海圖上方天空留白處，與底部的插圖分離以防重疊，文字選用優雅的宋體 */}
        <div className="relative z-10 space-y-3 px-4 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider text-slate-800 font-serif leading-tight drop-shadow-xs">
            熟齡剖地瓜壯騎
          </h1>
          
          <div className="w-16 h-0.5 bg-biker-orange mx-auto rounded-full my-1.5"></div>
          
          <div className="space-y-1">
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-700 font-bold max-w-xl mx-auto leading-relaxed">
              2026 富貴角燈塔至鵝鑾鼻燈塔壯騎紀錄
            </p>
            
            <p className="text-[10px] sm:text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
              富貴角燈塔出發，鵝鑾鼻燈塔完成；八天七夜，橫越台灣山海
            </p>
          </div>
        </div>
      </div>

      {/* 主要內容容器，維持原有的 max-w-4xl mx-auto px-4 結構，與 Hero 自然銜接，縮小間距以緊湊銜接 */}
      <div className="max-w-4xl mx-auto px-4 mt-2 md:mt-4">
        {/* 第一層：完騎證書主視覺 */}
      <div className="mb-6 rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-white">
        <img
          src={`${import.meta.env.BASE_URL}images/hero/2026-certificate.jpg`}
          alt="2026 剖地瓜壯騎團隊完騎證書"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* 第二層：年度前言文字 */}
      <div className="mb-6 bg-white border border-slate-100 p-6 rounded-2xl shadow-xs text-left">
        <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          <p>
            2026 年，剖地瓜壯騎團隊再度啟程，從台灣極北的富貴角燈塔出發，展開七天壯騎挑戰，最終抵達鵝鑾鼻燈塔。這趟旅程不只是一次單車路線的完成，更是一段由信任、節奏、互助與歡笑共同編織而成的團隊記憶。
          </p>
          <p>
            七天之中，隊友們一路穿越北台灣山海、中央山脈周邊、日月潭、阿里山、南迴與恆春半島，完成總距離 747.92 公里、總爬升 12,298 公尺的挑戰。面對長距離騎乘、連續爬升、天候變化與體力考驗，全隊以彼此支持、互相照應的方式，一站一站往南推進。
          </p>
          <p>
            本次行程由 <span className="font-bold text-slate-800">CP Volvo</span> 擔任團長與專案發起人，山神 <span className="font-bold text-slate-800">Evan</span> 安排行程並專業領騎，<span className="font-bold text-slate-800">莊茂昌</span> 提供支援車與後勤維修支援；其他隊友也分別在攝影紀錄、康樂互動、音樂陪伴與團隊照應中各司其職。正因為每一位成員都發揮團隊精神，這趟壯騎才能快快樂樂出門，平平安安回家。
          </p>
          <p>
            2026 剖地瓜 2 圓滿成功之後，團長已經啟動 2027 剖地瓜 3 的規劃與報名，日期暫定為 <span className="font-bold text-biker-orange">2027/5/26～6/2</span>，名額七位。這代表剖地瓜不只是一次挑戰，而是一段正在延續的團隊傳統。
          </p>
        </div>

        {/* 製作說明（較小字、低調但清楚可見） */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] sm:text-xs text-slate-400/80 font-normal leading-relaxed tracking-wide">
          特別感謝本網站由 <span className="font-medium text-slate-500">PP Roger</span> 統籌規劃，並帶領 AI 三劍客——阿亮（ChatGPT）、阿呆（Anti-gravity）、阿圖（Gemini Pro）協同製作，為 2026 剖地瓜壯騎留下完整而溫暖的團隊記錄。
        </div>
      </div>

      {/* 第三層：七言絕句圖文卡 */}
      <div className="mb-6 rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-white">
        <img
          src={`${import.meta.env.BASE_URL}images/hero/poem-card.jpg`}
          alt="七言絕句：北角揚風啟遠征，七日穿山踏海行。南燈一照同心路，剖瓜再續壯騎情。"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* 開始探索行程按鈕 (與絕句圖文卡保持適當留白，讓情緒先收束) */}
      <div className="mt-12 md:mt-16 mb-12 flex justify-center">
        <button
          onClick={() => setCurrentTab("trip")}
          className="inline-flex items-center justify-center bg-biker-orange hover:bg-biker-orange-dark text-white font-black px-8 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all duration-150 transform active:scale-95 group text-sm cursor-pointer"
        >
          <span>開始探索行程 ➡️</span>
        </button>
      </div>

      {/* 2026 互動與紀錄快捷入口 (三欄 Grid，手機版自動直欄) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* 隨行手記 Banner */}
        <div 
          onClick={() => setCurrentTab("story-day1")}
          className="bg-gradient-to-br from-amber-500/10 to-orange-500/15 border border-amber-200/50 hover:border-amber-300/80 hover:shadow-md hover:-translate-y-0.5 rounded-2xl p-5 md:p-6 transition-all duration-300 flex justify-between items-center gap-4 text-left cursor-pointer group"
        >
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-sm sm:text-base font-black text-slate-800 leading-tight">
              壯騎故事｜每日圖文手記
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
              閱讀 Day1 到 Day8 的每日圖文故事，重溫山海挑戰與團隊記憶。
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center bg-amber-600 group-hover:bg-amber-700 text-white font-black py-2 px-3.5 rounded-xl text-xs shadow-xs transition-all active:scale-95 whitespace-nowrap">
              閱讀故事
            </span>
          </div>
        </div>

        {/* 感想紀錄 Banner */}
        <div 
          onClick={() => setCurrentTab("reflections")}
          className="bg-gradient-to-br from-blue-500/10 to-indigo-500/15 border border-blue-200/50 hover:border-blue-300/80 hover:shadow-md hover:-translate-y-0.5 rounded-2xl p-5 md:p-6 transition-all duration-300 flex justify-between items-center gap-4 text-left cursor-pointer group"
        >
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-sm sm:text-base font-black text-slate-800 leading-tight">
              感想紀錄｜留下你的文字感想
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
              記錄自己的騎乘感受、挑戰片段與難忘時刻。
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center bg-biker-navy-light group-hover:bg-blue-600 text-white font-black py-2 px-3.5 rounded-xl text-xs shadow-xs transition-all active:scale-95 whitespace-nowrap">
              開始記錄
            </span>
          </div>
        </div>

        {/* 影像紀錄 Banner */}
        <div 
          onClick={() => setCurrentTab("media")}
          className="bg-gradient-to-br from-emerald-500/10 to-teal-500/15 border border-emerald-200/50 hover:border-emerald-300/80 hover:shadow-md hover:-translate-y-0.5 rounded-2xl p-5 md:p-6 transition-all duration-300 flex justify-between items-center gap-4 text-left cursor-pointer group"
        >
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-sm sm:text-base font-black text-slate-800 leading-tight">
              影像紀錄｜照片與短影片
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
              瀏覽每日精彩照片與短影片，重回壯騎現場。
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center bg-biker-green group-hover:bg-green-700 text-white font-black py-2 px-3.5 rounded-xl text-xs shadow-xs transition-all active:scale-95 whitespace-nowrap">
              瀏覽影像
            </span>
          </div>
        </div>
      </div>

      {/* 2025 歷史傳承與回顧 (已調輕量化，作為傳承區塊，已提升至行程統計資訊上方) */}
      <div className="mt-6 pt-8 border-t border-slate-200/60 text-left">
        <h3 className="text-base font-bold text-slate-700 mb-4 flex items-center space-x-2">
          <span className="w-1 h-4 bg-slate-400 rounded-full"></span>
          <span>歷史傳承 ｜ 2025 剖地瓜 1 回顧</span>
        </h3>
        
        <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-200/40 flex flex-col md:flex-row items-center gap-4">
          {/* 迷你起訖點照片對照組 (放大 1.3 倍) */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
            <div className="w-32 h-20 sm:w-36 sm:h-24 rounded-lg overflow-hidden relative shadow-xs border border-slate-200/60">
              <img src={fuguijiaoImg} className="w-full h-full object-cover object-center" alt="2025富貴角" />
              <span className="absolute bottom-1 left-1 text-[8px] text-white bg-slate-900/60 px-1 py-0.2 rounded font-bold">
                2025 起點
              </span>
            </div>
            <div className="text-slate-400 text-xs">➔</div>
            <div className="w-32 h-20 sm:w-36 sm:h-24 rounded-lg overflow-hidden relative shadow-xs border border-slate-200/60">
              <img src={eluanbiImg} className="w-full h-full object-cover object-center" alt="2025鵝鑾鼻" />
              <span className="absolute bottom-1 right-1 text-[8px] text-white bg-slate-900/60 px-1 py-0.2 rounded font-bold">
                2025 終點
              </span>
            </div>
          </div>
          
          {/* 文字說明與跳轉按鈕 */}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                2025 年首屆「剖地瓜 1」縱貫挑戰成功，奠定了團隊跨越山海的壯騎傳統。點擊右側按鈕，觀看去年的完整短影片與每日影像回顧。
              </p>
            </div>
            <button
              onClick={() => setCurrentTab("review")}
              className="flex-shrink-0 inline-flex items-center justify-center bg-biker-orange hover:bg-biker-orange-dark text-white font-black px-5 py-2.5 rounded-xl text-xs shadow-sm hover:shadow transition-all duration-150 transform active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>觀看 2025 回顧</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Split: Overview Grid & Quick Route Map (行程細部資訊移至底部) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-slate-200/60 mb-4">
        {/* Statistics Card List */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <span className="w-1.5 h-5 bg-biker-orange rounded-full"></span>
            <span>行程統計與基本資訊</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className={`flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-150 border border-slate-50 ${
                    stat.fullWidth ? "sm:col-span-2" : ""
                  }`}
                >
                  <div className={`p-2 bg-slate-100 rounded-lg ${stat.color} mt-0.5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <span className="block text-sm md:text-base font-bold text-slate-700 mt-0.5">
                      {stat.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visualized Route Map Graphic Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="w-1.5 h-5 bg-biker-green rounded-full"></span>
              <span>山海縱貫線</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              自富貴角北端起點，直剖中央脊梁山脈，穿越武嶺脊梁線至鵝鑾鼻終點。
            </p>
          </div>

          {/* Styled Route Visualization */}
          <div className="bg-slate-50 rounded-xl py-6 px-4 flex flex-col items-center justify-center border border-slate-100 relative overflow-hidden">
            {/* North Point */}
            <div className="flex items-center space-x-2 z-10">
              <div className="w-2.5 h-2.5 rounded-full bg-biker-navy border-2 border-white ring-4 ring-biker-navy/20"></div>
              <span className="text-xs font-bold text-slate-700">富貴角燈塔 (Day 1 起點)</span>
            </div>

            {/* Connecting Vertical Dotted Line */}
            <div className="h-24 w-0.5 border-l-2 border-dashed border-slate-300 my-1 relative flex items-center justify-center">
              {/* Mid Point Marker */}
              <div className="absolute top-1/2 -translate-y-1/2 bg-biker-orange text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-sm flex items-center space-x-0.5">
                <span>🏔️ 武嶺 3275m</span>
              </div>
            </div>

            {/* South Point */}
            <div className="flex items-center space-x-2 z-10">
              <div className="w-2.5 h-2.5 rounded-full bg-biker-orange border-2 border-white ring-4 ring-biker-orange/20"></div>
              <span className="text-xs font-bold text-slate-700">鵝鑾鼻燈塔 (Day 7 終點)</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => setCurrentTab("route")}
              className="w-full text-center bg-biker-orange hover:bg-biker-orange-dark text-white text-xs font-black py-2.5 px-4 rounded-xl transition-all duration-150 cursor-pointer shadow-sm hover:shadow active:scale-95 transform"
            >
              瀏覽壯騎紀錄 ➡️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
