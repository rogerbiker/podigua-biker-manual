import { Bike, BookOpen, Users, Compass, MessageSquare } from "lucide-react";

export default function MobileNav({ currentTab, setCurrentTab, onSelectDay }) {
  const menuItems = [
    {
      id: "home",
      label: "首頁",
      icon: Compass,
      onClick: () => setCurrentTab("home"),
      isActive: currentTab === "home",
    },
    {
      id: "trip",
      label: "行程",
      icon: Bike,
      onClick: () => {
        setCurrentTab("trip");
        if (onSelectDay) onSelectDay(null);
      },
      isActive: currentTab === "trip",
    },
    {
      id: "route",
      label: "記錄",
      icon: BookOpen,
      onClick: () => {
        setCurrentTab("route");
      },
      isActive: currentTab === "route",
    },
    {
      id: "reflections",
      label: "感想",
      icon: MessageSquare,
      onClick: () => setCurrentTab("reflections"),
      isActive: currentTab === "reflections",
    },
    {
      id: "members",
      label: "成員",
      icon: Users,
      onClick: () => setCurrentTab("members"),
      isActive: currentTab === "members",
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 z-40 pb-safe-bottom">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="flex flex-col items-center justify-center flex-1 py-1 text-slate-500 active:text-biker-orange active:scale-95 transition-all duration-150 relative cursor-pointer"
            >
              <div
                className={`p-1.5 rounded-full transition-all duration-200 ${
                  active ? "bg-biker-orange/10 text-biker-orange scale-110" : "text-slate-500"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] mt-0.5 font-medium transition-colors ${
                  active ? "text-biker-orange font-bold" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
