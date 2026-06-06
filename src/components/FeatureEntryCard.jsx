import { ChevronRight } from "lucide-react";

export default function FeatureEntryCard({ item }) {
  const Icon = item.icon;

  return (
    <div
      onClick={item.onClick}
      style={{
        background: item.background,
        borderColor: item.borderColor,
        boxShadow: `0 5px 14px ${item.shadowColor}`,
      }}
      className="border rounded-xl p-3.5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <div className={`${item.iconBg} p-2.5 rounded-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-black text-slate-800 leading-tight">
            {item.title}
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-1 leading-snug">
            {item.description}
          </p>
          <div className="mt-2.5">
            <span className={`inline-flex items-center justify-center font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition-all active:scale-95 whitespace-nowrap ${item.btnClass}`}>
              <span>{item.buttonText}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
