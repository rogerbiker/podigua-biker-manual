import { useState } from "react";
import { Bike, Users, Compass, Menu, X, MessageSquare, BookOpen, Settings } from "lucide-react";

export default function Header({ currentTab, setCurrentTab }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            {/* Prominent Home Card */}
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
                  className={`w-full flex items-center justify-center space-x-2.5 p-3.5 rounded-xl text-base font-bold transition-all duration-150 cursor-pointer border ${
                    isActive
                      ? "bg-biker-orange border-biker-orange text-white shadow-md"
                      : "bg-[#1d2d5f] border-slate-700/50 text-slate-100 hover:bg-[#253975]"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{homeItem.label}</span>
                </button>
              );
            })()}

            {/* 2x2 Grid for other items (行程, 記錄, 感想, 成員) */}
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
                    className={`flex flex-col items-center justify-center py-3.5 px-3 rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer border space-y-1.5 ${
                      isActive
                        ? "bg-biker-orange border-biker-orange text-white shadow-md"
                        : "bg-[#1d2d5f] border-slate-700/50 text-slate-200 hover:bg-[#253975]"
                    }`}
                  >
                    <div className={`p-2 rounded-full ${isActive ? "bg-white/20" : "bg-[#132354]"}`}>
                      <Icon className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Admin Tools Panel Button */}
            {isAdminMode && (
              <button
                onClick={() => {
                  window.location.hash = "#admin-diagnostics";
                  setCurrentTab("reflections");
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center justify-center space-x-2 p-3 mt-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border ${
                  currentTab === "reflections" && window.location.hash === "#admin-diagnostics"
                    ? "bg-amber-600 border-amber-600 text-white shadow-md"
                    : "bg-[#1d2d5f]/40 border-amber-500/30 text-amber-400 hover:bg-[#253975]/40"
                }`}
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span>⚙️ 管理員工具</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
