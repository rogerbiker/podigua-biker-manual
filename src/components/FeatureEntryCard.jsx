import { ChevronRight } from "lucide-react";

export default function FeatureEntryCard({ item }) {
  // Define visual styles based on item.id to match the homepage card aesthetics
  let bgClass = "";
  let borderClass = "";
  let btnClass = "";

  if (item.id === "story") {
    bgClass = "bg-gradient-to-br from-amber-500/10 to-orange-500/15";
    borderClass = "border-amber-200/50 hover:border-amber-300/80";
    btnClass = "bg-amber-600 hover:bg-amber-700 text-white";
  } else if (item.id === "reflections" || item.id === "photos") {
    bgClass = "bg-gradient-to-br from-blue-500/10 to-indigo-500/15";
    borderClass = "border-blue-200/50 hover:border-blue-300/80";
    btnClass = "bg-blue-600 hover:bg-blue-700 text-white";
  } else if (item.id === "media" || item.id === "videos") {
    bgClass = "bg-gradient-to-br from-emerald-500/10 to-teal-500/15";
    borderClass = "border-emerald-200/50 hover:border-emerald-300/80";
    btnClass = "bg-biker-green hover:bg-biker-green-dark text-white";
  }

  return (
    <div
      onClick={item.onClick}
      className={`border rounded-2xl p-5 md:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex justify-between items-center gap-4 text-left cursor-pointer group ${bgClass} ${borderClass}`}
    >
      {/* Left Text Column */}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-sm sm:text-base font-black text-slate-800 leading-tight">
          {item.title}
        </h4>
        <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Right Button Column */}
      <div className="flex-shrink-0">
        <span className={`inline-flex items-center justify-center font-bold py-2 px-3.5 rounded-xl text-xs shadow-xs transition-all active:scale-95 whitespace-nowrap ${btnClass}`}>
          <span>{item.buttonText}</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </span>
      </div>
    </div>
  );
}
