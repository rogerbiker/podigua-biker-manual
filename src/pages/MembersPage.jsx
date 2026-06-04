import { useState } from "react";
import { createPortal } from "react-dom";
import { members } from "../data/tripData";
import { Shield, Heart, Users, Truck, X } from "lucide-react";

// Helper component to display member avatar with dynamic image loading error fallback
const MemberAvatar = ({ name, photoUrl, fallbackText, sizeClass = "w-20 h-20", isCircle = false, onClick }) => {
  const [imgError, setImgError] = useState(!photoUrl);

  // Prepend base URL if photoUrl is a local absolute path (starts with /)
  const getFullPhotoUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const baseUrl = import.meta.env.BASE_URL || "/";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    const cleanUrl = url.startsWith("/") ? url.substring(1) : url;
    return `${cleanBase}${cleanUrl}`;
  };

  const fullPhotoUrl = getFullPhotoUrl(photoUrl);

  const getInitials = () => {
    if (fallbackText) return fallbackText;
    if (!name) return "🚴";
    // Strip "PP " if present, take first letter or first two letters
    const cleanName = name.replace(/^PP\s+/, "");
    return cleanName.substring(0, 2);
  };

  const roundedClass = isCircle ? "rounded-full" : "rounded-2xl";

  // Dynamic text size based on avatar size class
  const textSizeClass = sizeClass.includes("w-20") || sizeClass.includes("w-24")
    ? "text-base"
    : sizeClass.includes("w-16")
    ? "text-sm"
    : "text-xs";

  if (imgError) {
    return (
      <div 
        onClick={onClick}
        className={`bg-slate-100 text-slate-500 font-bold flex items-center justify-center flex-shrink-0 select-none ${sizeClass} ${roundedClass} border border-slate-200 cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all duration-200`}
      >
        <span className={textSizeClass}>{getInitials()}</span>
      </div>
    );
  }

  return (
    <img
      src={fullPhotoUrl}
      alt={name}
      onError={() => setImgError(true)}
      onClick={onClick}
      className={`object-cover flex-shrink-0 ${sizeClass} ${roundedClass} border border-slate-200 shadow-sm cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all duration-200`}
    />
  );
};

const renderCyclingInfo = (member, isCentered = false, isDarkMode = false) => {
  if (!member.cyclingStartYear) return null;
  
  const currentYear = new Date().getFullYear();
  const bikeYears = currentYear - member.cyclingStartYear;
  
  const hasYears = member.podiguaYears && member.podiguaYears.length > 0;
  const count = hasYears ? member.podiguaYears.length : (member.experienceCount || 0);
  
  const getChineseOrdinal = (num) => {
    const ordinals = ["", "第一", "第二", "第三", "第四", "第五", "第六", "第七", "第八", "第九", "第十"];
    return ordinals[num] || `第 ${num}`;
  };
  const experienceText = `${getChineseOrdinal(count)}次剖地瓜`;
  const yearsText = hasYears ? member.podiguaYears.join("、") : "年份待補";

  const separatorColor = isDarkMode ? "text-slate-600" : "text-slate-300";

  return (
    <div className={`text-[10px] font-bold flex flex-wrap items-center gap-1.5 ${
      isCentered === "always" ? "justify-center" : (isCentered ? "justify-center sm:justify-start" : "justify-start")
    }`}>
      <span className={`${
        isDarkMode ? "bg-slate-800 text-slate-300 border border-slate-700/50" : "bg-slate-100 text-slate-600 border border-slate-200/30"
      } px-2 py-0.5 rounded-md text-[10px] sm:text-xs whitespace-nowrap shadow-2xs`}>
        車齡 {bikeYears}年
      </span>
      <span className={`${separatorColor} font-light text-xs`}>｜</span>
      <span className={`${
        isDarkMode ? "bg-orange-950/40 text-orange-400 border border-orange-900/30" : "bg-biker-orange/10 text-biker-orange-dark border border-biker-orange/20"
      } px-2 py-0.5 rounded-md text-[10px] sm:text-xs whitespace-nowrap shadow-2xs`}>
        {experienceText}
      </span>
      <span className={`${separatorColor} font-light text-xs`}>｜</span>
      <span className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs whitespace-nowrap shadow-2xs border ${
        hasYears 
          ? (isDarkMode ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30" : "bg-emerald-50 text-emerald-700 border-emerald-100") 
          : (isDarkMode ? "bg-slate-800/60 text-slate-500 border border-slate-700/30" : "bg-slate-100 text-slate-400 border border-slate-200/50")
      }`}>
        {yearsText}
      </span>
    </div>
  );
};

export default function MembersPage() {
  const [zoomedMember, setZoomedMember] = useState(null);

  const handleZoom = (member) => {
    setZoomedMember({
      name: member.name,
      photoUrl: member.photoUrl,
      role: member.teamRole || "",
      desc: member.description || "",
      member: member
    });
  };

  return (
    <>
      <div className="fade-in max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-12">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
          <span className="w-1.5 h-6 bg-biker-green rounded-full"></span>
          <span>團隊成員與分工 ｜ Team & Roles</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          2026 剖地瓜壯騎全體成員與任務分工，兼顧個人騎乘背景與專業分工，共同攜手完成挑戰。
        </p>
      </div>

      {/* Unified Grid List of Members */}
      <div className="grid grid-cols-1 gap-6">
        {members.map((member, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm flex flex-col gap-3.5 hover:border-slate-200 hover:shadow-md transition-all duration-200"
          >
            {/* 第一層：人物識別區 (左圖右文) */}
            <div className="flex items-center gap-5 sm:gap-6 w-full text-left">
              <MemberAvatar
                name={member.name}
                photoUrl={member.photoUrl}
                sizeClass="w-24 h-32 sm:w-28 sm:h-36 flex-shrink-0"
                isCircle={false}
                onClick={() => handleZoom(member)}
              />
              
              <div className="flex-1 flex flex-col items-start space-y-2">
                {/* 姓名 */}
                <h4
                  onClick={() => handleZoom(member)}
                  className="text-lg sm:text-xl font-black text-slate-800 tracking-tight cursor-pointer hover:text-biker-orange transition-colors"
                >
                  {member.name}
                </h4>
                
                {/* 主要社會身分 */}
                <span className="text-[10px] sm:text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/30 px-2 py-0.5 rounded-md">
                  {member.socialTitle}
                </span>
                
                {/* 簡短團隊角色／執掌 */}
                <div className="pt-0.5">
                  <span className="inline-flex items-center text-xs font-bold text-biker-orange-dark bg-biker-orange/10 border border-biker-orange/20 px-2.5 py-0.5 rounded-full shadow-2xs">
                    {member.teamRole}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 第二層：騎乘資訊列 (放在人物識別區下方) */}
            {renderCyclingInfo(member, false, false)}
            
            {/* 第三層：完整角色描述 */}
            <p className="text-xs sm:text-[13px] text-slate-600 font-normal leading-relaxed pt-3.5 border-t border-slate-100 w-full text-left sm:text-justify">
              {member.description}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* Lightbox / Image Zoom Modal (rendered via Portal to prevent stacking context trapping) */}
    {zoomedMember && createPortal(
      <div
        className="fixed inset-0 z-[100] bg-slate-950/90 pt-16 pb-20 px-4 md:py-8 transition-opacity duration-200 cursor-zoom-out overflow-y-auto"
        onClick={() => setZoomedMember(null)}
      >
        <div 
          className="min-h-full flex items-center justify-center py-4"
        >
          <div
            className="relative max-w-sm md:max-w-md w-full flex flex-col items-center animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
              {/* Close Button */}
              <button
                className="absolute -top-12 right-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
                onClick={() => setZoomedMember(null)}
              >
                <X className="w-5 h-5" />
              </button>
 
              {/* Enlarged Avatar */}
              <div className="w-48 h-64 sm:w-60 sm:h-80 md:w-72 md:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 mb-4 flex-shrink-0">
                {!zoomedMember.photoUrl ? (
                  <div className="w-full h-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center select-none text-2xl">
                    <span>{zoomedMember.name.replace(/^PP\s+/, "").substring(0, 2)}</span>
                  </div>
                ) : (
                  <img
                    src={
                      zoomedMember.photoUrl.startsWith("http")
                        ? zoomedMember.photoUrl
                        : `${import.meta.env.BASE_URL || "/"}${zoomedMember.photoUrl.startsWith("/") ? zoomedMember.photoUrl.substring(1) : zoomedMember.photoUrl}`
                    }
                    alt={zoomedMember.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
 
              {/* Member details */}
              <div className="text-center px-4 flex flex-col items-center">
                {/* Layer 1: Social Title */}
                {zoomedMember.member?.socialTitle && (
                  <span className="inline-block text-[10px] font-black text-slate-400 bg-slate-800 border border-slate-700/30 px-2.5 py-0.5 rounded-md mb-1.5">
                    {zoomedMember.member.socialTitle}
                  </span>
                )}
                
                {/* Name */}
                <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  {zoomedMember.name}
                </h3>
                
                {/* Layer 2: Team Role */}
                {zoomedMember.member?.teamRole && (
                  <span className="inline-block text-xs font-black text-biker-orange bg-biker-orange/20 border border-biker-orange/30 px-2.5 py-0.5 rounded-md mt-1.5">
                    {zoomedMember.member.teamRole}
                  </span>
                )}
                
                {/* Layer 3: Cycling Info */}
                {zoomedMember.member && renderCyclingInfo(zoomedMember.member, "always", true)}
                
                {/* Layer 4: Description */}
                {zoomedMember.member?.description && (
                  <p className="text-xs md:text-sm text-slate-400 font-light mt-3 pt-2.5 border-t border-slate-800/60 leading-relaxed max-w-xs mx-auto">
                    {zoomedMember.member.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
