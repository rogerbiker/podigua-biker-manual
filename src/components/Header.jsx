import { useState } from "react";
import { Bike, Users, Compass, Menu, X, MessageSquare, BookOpen, Settings } from "lucide-react";

export default function Header({ currentTab, setCurrentTab }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminSubMenuOpen, setIsAdminSubMenuOpen] = useState(false);

  const [isAdminMode, setIsAdminMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.has("admin") || params.has("debug") || params.has("beta");
  });

  const navItems = [
    { id: "home", label: "首頁", icon: Compass },
    { id: "trip", label: "行程", icon: Bike },
    { id: "route", label: "記錄", icon: BookOpen },
    { id: "reflections", label: "感想", icon: MessageSquare },
    { id: "members", label: "成員", icon: Users },
  ];

  return (
    <header className="bg-biker-navy-dark text-white shadow-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Title Section */}
        <div 
          className="flex items-center space-x-3 cursor-pointer" 
          onClick={() => {
            setCurrentTab("home");
            setIsMenuOpen(false);
          }}
        >
          <div className="bg-biker-orange p-2 rounded-full text-white shadow-sm flex items-center justify-center animate-bounce-slow">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base md:text-xl font-bold tracking-tight text-white m-0">
              熟齡剖地瓜壯騎
            </h1>
            <p className="text-[10px] text-slate-300 font-light mt-0.5 hidden md:block">
              2026 富貴角燈塔至鵝鑾鼻燈塔壯騎紀錄
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-biker-orange text-white shadow"
                    : "text-slate-300 hover:text-white hover:bg-biker-navy/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-1.5 text-slate-300 hover:text-white hover:bg-biker-navy/50 rounded-xl transition-colors cursor-pointer"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Navigation Panel */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#132354] border-t border-slate-800 py-4 px-4 shadow-xl animate-zoom-in rounded-b-2xl">
          <div className="flex flex-col space-y-3">
            {/* Title Area and Settings Trigger */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 tracking-wider">🗺️ 騎旅選單</span>
              {/* Gear Icon with 40x40px click area */}
              <button
                type="button"
                onClick={() => setIsAdminSubMenuOpen(!isAdminSubMenuOpen)}
                className="w-10 h-10 -mr-2 flex items-center justify-center focus:outline-none transition-all duration-150 active:scale-95 cursor-pointer"
                title="系統管理選單"
              >
                <div className={`w-7 h-7 flex items-center justify-center rounded-full border transition-colors ${
                  isAdminSubMenuOpen
                    ? "bg-[#1d2d5f] border-amber-500/50 text-amber-400"
                    : "bg-[#132354] border-slate-700/50 text-slate-400 hover:text-slate-200"
                }`}>
                  <Settings className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Expanded Second-level Admin Menu */}
            {isAdminSubMenuOpen && (
              <div className="bg-[#0f1b40]/80 border border-slate-800 rounded-xl p-2.5 space-y-2 animate-fade-in text-[11px] shadow-inner text-left">
                <span className="block font-bold text-slate-400 mb-1 border-b border-slate-800 pb-0.5">🛠️ 系統功能入口 (預覽/需驗證)</span>
                <div className="flex flex-col space-y-1.5">
                  <button
                    onClick={() => {
                      setCurrentTab("media");
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#1d2d5f]/60 hover:bg-[#253975] text-slate-300 hover:text-white border border-slate-700/30 text-left transition-colors cursor-pointer"
                  >
                    <span>📷 影像紀錄管理 (後台準備中)</span>
                    <span className="text-[9px] text-slate-500 font-medium">前台頁面</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTab("reflections");
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#1d2d5f]/60 hover:bg-[#253975] text-slate-300 hover:text-white border border-slate-700/30 text-left transition-colors cursor-pointer"
                  >
                    <span>📝 心得記錄管理 (前台連結)</span>
                    <span className="text-[9px] text-slate-500 font-medium">前台頁面</span>
                  </button>

                  <button
                    onClick={() => {
                      window.location.hash = "#admin-diagnostics";
                      setCurrentTab("reflections");
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#1d2d5f]/60 hover:bg-[#253975] text-amber-400 hover:text-amber-300 border border-amber-500/20 text-left transition-colors cursor-pointer"
                  >
                    <span>🧹 本機暫存診斷 (需參數)</span>
                    <span className="text-[9px] text-amber-600 font-bold">開啟診斷</span>
                  </button>
                </div>
              </div>
            )}

            {/* Prominent Home Card (橘色主按鈕) */}
            {(() => {
              const homeItem = navItems.find(i => i.id === "home");
              if (!homeItem) return null;
              const Icon = homeItem.icon;
              const isActive = currentTab === homeItem.id && (!window.location.hash || window.location.hash !== "#admin-diagnostics");
              return (
                <button
                  onClick={() => {
                    setCurrentTab(homeItem.id);
                    if (window.location.hash) {
                      window.location.hash = "";
                    }
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-center space-x-2 p-2.5 rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer border ${
                    isActive
                      ? "bg-biker-orange border-biker-orange text-white shadow-sm"
                      : "bg-[#1d2d5f] border-slate-700/50 text-slate-100 hover:bg-[#253975]"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>{homeItem.label}</span>
                </button>
              );
            })()}

            {/* 2x2 Grid for other items (行程, 記錄, 感想, 成員) - 較柔和的卡片式按鈕 */}
            <div className="grid grid-cols-2 gap-3">
              {navItems.filter(i => i.id !== "home").map((item) => {
                const Icon = item.icon;
                const isDiagnosticsActive = window.location.hash === "#admin-diagnostics";
                const isActive = currentTab === item.id && !(item.id === "reflections" && isDiagnosticsActive);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      if (window.location.hash) {
                        window.location.hash = "";
                      }
                      setIsMenuOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center py-3.5 px-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border space-y-1.5 shadow-sm ${
                      isActive
                        ? "bg-[#1c2e69] border-biker-orange text-biker-orange font-black"
                        : "bg-[#1d2d5f] border-slate-700/50 text-slate-300 hover:bg-[#253975] hover:text-white"
                    }`}
                  >
                    <div className={`p-1.5 rounded-full ${isActive ? "bg-biker-orange/15 text-biker-orange" : "bg-[#132354] text-slate-400"}`}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
