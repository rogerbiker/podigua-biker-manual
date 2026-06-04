import { useState } from "react";
import { Bike, Utensils, Users, Bell, DollarSign, Compass, Film, Menu, X, MapPin, MessageSquare, Camera } from "lucide-react";

export default function Header({ currentTab, setCurrentTab }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "首頁", icon: Compass },
    { id: "trip", label: "每日行程", icon: Bike },
    { id: "route", label: "路線地圖", icon: MapPin },
    { id: "reflections", label: "壯騎心得", icon: MessageSquare },
    { id: "media", label: "影像紀錄", icon: Camera },
    { id: "food-lodging", label: "住宿餐食", icon: Utensils },
    { id: "members", label: "成員名單", icon: Users },
    { id: "review", label: "2025回顧", icon: Film },
    { id: "reminders", label: "重要提醒", icon: Bell },
    { id: "cost", label: "費用整理", icon: DollarSign },
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
              2026 剖地瓜壯騎行程手冊
            </h1>
            <p className="text-[10px] text-slate-300 font-light mt-0.5 hidden md:block">
              富貴角燈塔出發，鵝鑾鼻燈塔完成；八天七夜，橫越台灣山海
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
        <div className="md:hidden bg-[#132354] border-t border-slate-800 py-3 px-4 shadow-lg animate-zoom-in">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-biker-orange text-white shadow-md"
                      : "text-slate-300 hover:text-white hover:bg-biker-navy/30"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
