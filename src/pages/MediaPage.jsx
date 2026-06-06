import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { db } from "../lib/firebase";
import { dailyVideos } from "../data/tripData";
import { 
  collection, 
  addDoc, 
  doc, 
  setDoc,
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from "firebase/firestore";
import { 
  Film, 
  Trash2, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Play, 
  Image, 
  Eye,
  Settings
} from "lucide-react";

export default function MediaPage({ initialView = "all" }) {
  const [selectedDay, setSelectedDay] = useState(1);
  const days = [1, 2, 3, 4, 5, 6, 7, 8];

  // Admin Mode detection
  const [isAdminMode, setIsAdminMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.has("admin") || params.has("debug") || params.has("beta") ||
           window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ||
           localStorage.getItem("podigua_admin_mode") === "true";
  });

  // Admin password states
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem("biker_admin_password") || "");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordVerified, setIsPasswordVerified] = useState(() => {
    const saved = localStorage.getItem("biker_admin_password") || "";
    return saved === "podigua2026";
  });

  // Database loading states
  const [photos, setPhotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [loadingVideo, setLoadingVideo] = useState(true);

  // Lightbox zoom state
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  // Video intermediate modal states (Roger UX design)
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [modalVideo, setModalVideo] = useState(null);

  // Video play state for inline player
  const [isPlayerActive, setIsPlayerActive] = useState(false);

  // Thumbnail loading failure fallback state
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  // Video links states (Roger inputs)
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [savingVideo, setSavingVideo] = useState(false);
  const [deletingVideo, setDeletingVideo] = useState(false);
  const [videoStatusMessage, setVideoStatusMessage] = useState({ text: "", type: "" });

  // Photo uploads states (Roger multiple uploads)
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFilesCount, setUploadingFilesCount] = useState(0);
  const [currentUploadingIndex, setCurrentUploadingIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Progressive batch loading state
  const [visiblePhotosCount, setVisiblePhotosCount] = useState(8);

  // Reset visible photos count when day changes
  useEffect(() => {
    setVisiblePhotosCount(8);
  }, [selectedDay]);

  // Progressive batch loading effect: load 8 more photos every 150ms
  useEffect(() => {
    if (initialView !== "videos" && photos.length > visiblePhotosCount) {
      const timer = setTimeout(() => {
        setVisiblePhotosCount((prev) => Math.min(prev + 8, photos.length));
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [photos.length, visiblePhotosCount, initialView]);

  // Live database updates
  useEffect(() => {
    // If in videos-only mode, bypass loading photos entirely
    if (initialView === "videos") {
      setPhotos([]);
      setLoadingPhotos(false);
      return;
    }

    Promise.resolve().then(() => {
      setLoadingPhotos(true);
    });
    const q = query(
      collection(db, "photos"),
      where("day", "==", selectedDay)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      // Sort in memory by createdAt descending to avoid needing a Firestore composite index
      data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
      setPhotos(data);
      setLoadingPhotos(false);
    }, (error) => {
      console.error("Error loading photos:", error);
      setLoadingPhotos(false);
    });

    return () => unsubscribe();
  }, [selectedDay, initialView]);

  useEffect(() => {
    // If in photos-only mode, bypass loading videos entirely
    if (initialView === "photos") {
      setVideo(null);
      setLoadingVideo(false);
      return;
    }

    Promise.resolve().then(() => {
      setLoadingVideo(true);
    });
    const docRef = doc(db, "videos", `day-${selectedDay}`);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setVideo(docSnap.data());
      } else {
        setVideo(null);
      }
      setLoadingVideo(false);
    }, (error) => {
      console.error("Error loading video:", error);
      setLoadingVideo(false);
    });

    return () => unsubscribe();
  }, [selectedDay, initialView]);

  // Pre-populate videoUrlInput when Day changes or video document updates
  useEffect(() => {
    setVideoUrlInput(video?.url || "");
  }, [selectedDay, video?.url]);

  useEffect(() => {
    Promise.resolve().then(() => {
      setIsPlayerActive(false);
      setThumbnailFailed(false);
    });
  }, [selectedDay]);

  // Verify Admin Password
  const handleVerifyPassword = (e) => {
    e.preventDefault();
    if (passwordInput === "podigua2026") {
      setIsPasswordVerified(true);
      setAdminPassword("podigua2026");
      setPasswordError("");
      localStorage.setItem("biker_admin_password", "podigua2026");
      localStorage.setItem("podigua_admin_mode", "true");
    } else {
      setIsPasswordVerified(false);
      setPasswordError("管理密碼錯誤，請重新輸入！");
    }
  };

  // Exit Admin Mode
  const handleExitAdmin = () => {
    setIsPasswordVerified(false);
    setAdminPassword("");
    setPasswordInput("");
    localStorage.removeItem("biker_admin_password");
    localStorage.removeItem("podigua_admin_mode");
    setIsAdminMode(false);
  };

  // Helper to extract YouTube video ID
  const getYouTubeVideoId = (url) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  // Video URL parser for iframe embed
  const getYouTubeEmbedUrl = (url) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  };

  // Helper to validate URL format
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return url.startsWith("http://") || url.startsWith("https://");
    } catch (_) {
      return false;
    }
  };

  // Save Video Link
  const handleSaveVideoUrl = async (e) => {
    e.preventDefault();
    if (savingVideo) return;

    const trimmedUrl = videoUrlInput.trim();
    if (!trimmedUrl) {
      alert("請貼上影片網址連結！");
      return;
    }
    if (!isPasswordVerified) {
      alert("請先輸入正確的管理密碼！");
      return;
    }

    // URL format validation
    if (!isValidUrl(trimmedUrl)) {
      alert("請輸入有效的影片網址（必須以 http:// 或 https:// 開頭）！");
      return;
    }

    // Check link type for warnings
    const isYoutube = getYouTubeVideoId(trimmedUrl) !== "";
    const isGooglePhotos = trimmedUrl.includes("photos.app.goo.gl") || trimmedUrl.includes("photos.google.com");
    if (!isYoutube && !isGooglePhotos) {
      if (!window.confirm("⚠️ 偵測到此連結既非 YouTube 也非 Google 相簿網址。這可能會導致車友點開後無法正常觀看。確定要儲存此網址嗎？")) {
        return;
      }
    }

    setSavingVideo(true);
    setVideoStatusMessage({ text: "", type: "" });
    let success = false;
    let errMsg = "";

    try {
      await setDoc(doc(db, "videos", `day-${selectedDay}`), {
        day: selectedDay,
        url: trimmedUrl,
        adminToken: adminPassword,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      success = true;
    } catch (error) {
      console.error("Error saving video URL:", error);
      errMsg = error.message || String(error);
    } finally {
      setSavingVideo(false);
    }

    if (success) {
      setVideoStatusMessage({ text: `🎉 Day ${selectedDay} 短影片連結更新完成！`, type: "success" });
      setTimeout(() => {
        alert(`🎉 Day ${selectedDay} 短影片連結更新完成！`);
      }, 50);
    } else {
      setVideoStatusMessage({ text: `❌ 更新失敗：${errMsg}`, type: "error" });
      setTimeout(() => {
        alert(`更新失敗：${errMsg}`);
      }, 50);
    }
  };

  // Delete Video Link
  const handleDeleteVideo = async () => {
    if (!isPasswordVerified || deletingVideo) return;
    if (!window.confirm(`確定要清除 Day ${selectedDay} 的短影片連結，並還原為預設影片嗎？`)) return;

    setDeletingVideo(true);
    setVideoStatusMessage({ text: "", type: "" });
    let success = false;
    let errMsg = "";

    try {
      await deleteDoc(doc(db, "videos", `day-${selectedDay}`));
      setVideoUrlInput("");
      success = true;
    } catch (error) {
      console.error("Error deleting video:", error);
      errMsg = error.message || String(error);
    } finally {
      setDeletingVideo(false);
    }

    if (success) {
      setVideoStatusMessage({ text: `🗑️ Day ${selectedDay} 影片連結已清除，已還原為預設影片。`, type: "success" });
      setTimeout(() => {
        alert("影片連結已成功清除，已還原為預設影片。");
      }, 50);
    } else {
      setVideoStatusMessage({ text: `❌ 清除失敗：${errMsg}`, type: "error" });
      setTimeout(() => {
        alert(`清除失敗：${errMsg}`);
      }, 50);
    }
  };

  // Client-side image compression helper to avoid exceeding 1MB Firestore doc limit
  const compressImage = (file, maxWidth = 1000, maxHeight = 1000, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Maintain aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Export as compressed base64 JPEG
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Upload Multiple Photos (Compress to Base64 and save to Firestore directly)
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (!isPasswordVerified) {
      alert("請先驗證管理密碼再上傳！");
      return;
    }

    setIsUploading(true);
    setUploadingFilesCount(files.length);
    setCurrentUploadingIndex(0);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentUploadingIndex(i + 1);
      setUploadProgress(20);

      try {
        // 1. Compress image in browser to base64
        setUploadProgress(50);
        const base64Data = await compressImage(file, 1000, 1000, 0.7);
        
        // 2. Upload directly to Firestore containing password token for rules check
        setUploadProgress(80);
        await addDoc(collection(db, "photos"), {
          day: selectedDay,
          url: base64Data, // Stored directly as data URI
          adminToken: adminPassword,
          createdAt: new Date().toISOString()
        });
        setUploadProgress(100);
      } catch (err) {
        console.error("Image processing/upload failed:", err);
        alert(`相片 ${file.name} 上傳失敗，原因：${err.message || String(err)}`);
      }
    }

    setIsUploading(false);
    setUploadingFilesCount(0);
    e.target.value = ""; // reset file input
    setTimeout(() => {
      alert("🎉 所有選擇的照片均已成功上傳照片牆！");
    }, 50);
  };

  // Delete Single Photo (Firestore document delete only, no Storage calls)
  const handleDeletePhoto = async (photo, e) => {
    e.stopPropagation(); // Avoid triggering Lightbox
    if (!isPasswordVerified) return;
    if (!window.confirm("確定要刪除這張照片嗎？（此動作無法復原）")) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "photos", photo.id));
      setTimeout(() => {
        alert("照片已成功從照片牆刪除。");
      }, 50);
    } catch (error) {
      console.error("Error deleting photo:", error);
      setTimeout(() => {
        alert("刪除失敗：" + (error.message || String(error)));
      }, 50);
    }
  };

  // Direct download file from data URL
  const handleDownload = async (url, photoId) => {
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = `biker-day-${selectedDay}-${photoId || Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn("Direct download failed, opening in new tab:", err);
      window.open(url, "_blank");
    }
  };

  // Look up static video metadata and combine with Firestore live database URL
  const staticVideo = dailyVideos.find((v) => v.day === selectedDay);

  // Decide active video variables
  const dbVideoUrl = video?.url?.trim() || "";
  const isDbVideo = !!dbVideoUrl;

  const activeVideoType = isDbVideo
    ? (getYouTubeEmbedUrl(dbVideoUrl) ? "youtube" : "googlePhotos")
    : (staticVideo?.videoType || "googlePhotos");

  const activeYoutubeUrl = isDbVideo
    ? (getYouTubeEmbedUrl(dbVideoUrl) ? dbVideoUrl : "")
    : (staticVideo?.youtubeUrl || "");

  const activeYoutubeEmbedUrl = isDbVideo
    ? (getYouTubeEmbedUrl(dbVideoUrl) ? getYouTubeEmbedUrl(dbVideoUrl) : "")
    : (staticVideo?.youtubeEmbedUrl || "");

  const activeGooglePhotosUrl = isDbVideo
    ? (getYouTubeEmbedUrl(dbVideoUrl) ? "" : dbVideoUrl)
    : (staticVideo?.googlePhotosUrl || "");

  const activeVideoUrl = dbVideoUrl || (activeVideoType === "youtube" ? activeYoutubeUrl : activeGooglePhotosUrl) || "";
  const activeThumbnail = staticVideo?.thumbnail || (activeVideoType === "youtube" && activeVideoUrl ? `https://i.ytimg.com/vi/${getYouTubeVideoId(activeVideoUrl)}/hqdefault.jpg` : "");
  const activeTitle = staticVideo?.title || `Day ${selectedDay} 精選短片`;

  return (
    <div className="fade-in max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-12 text-slate-700">
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
          <span className="w-1.5 h-6 bg-biker-orange rounded-full"></span>
          <span>壯騎影像紀錄 📸</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          收錄每日精挑細選的壯騎精彩相片牆與當日短影片，讓感動與回憶隨身下載攜帶！
        </p>
      </div>

      {/* Day Selector Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner flex overflow-x-auto space-x-1.5 no-scrollbar mb-6">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`flex-1 min-w-[70px] text-center py-2.5 rounded-xl text-xs font-black transition-all duration-150 cursor-pointer whitespace-nowrap ${
              selectedDay === d
                ? "bg-biker-navy text-white shadow-md scale-102"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            Day {d}
          </button>
        ))}
      </div>

      {/* Admin Mode - Password Verification Panel */}
      {isAdminMode && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/50 pb-3 mb-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-biker-orange" />
              <span>🛠️ Roger 專屬管理員模式 (Day {selectedDay})</span>
            </h3>
            {isPasswordVerified && (
              <button
                type="button"
                onClick={handleExitAdmin}
                className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-all"
              >
                登出管理模式 ✖
              </button>
            )}
          </div>

          {!isPasswordVerified ? (
            <form onSubmit={handleVerifyPassword} className="flex gap-2">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="請輸入 Roger 的管理密碼以啟用上傳"
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
              />
              <button
                type="submit"
                className="bg-biker-orange hover:bg-biker-orange-dark text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                認證登入
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-[10px] text-green-700 bg-green-50 border border-green-200 p-2.5 rounded-xl font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>密碼驗證成功！您現在可以上傳 Day {selectedDay} 的照片牆與儲存短影片連結。</span>
              </div>

              {/* Upload photo controls */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-inner space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  📸 上傳 Day {selectedDay} 照片 (支援多張選取)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-biker-navy file:text-white hover:file:bg-biker-navy-dark file:cursor-pointer cursor-pointer"
                />
                
                {isUploading && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-biker-navy">
                      <span>正在上傳相片：第 {currentUploadingIndex} / {uploadingFilesCount} 張...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div 
                        className="bg-biker-orange h-full rounded-full transition-all duration-150" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {passwordError && (
            <p className="text-[10px] text-red-600 font-bold mt-2 pl-1 flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{passwordError}</span>
            </p>
          )}
        </div>
      )}

      {/* Layout Content */}
      <div className="space-y-6">
        
        {/* SECTION 1: Daily Video Player */}
        {initialView !== "photos" && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
          <h3 className="text-sm font-black text-slate-800 flex items-center space-x-2 border-b border-slate-50 pb-2">
            <span className="bg-orange-100 text-biker-orange p-1 rounded-lg">🎥</span>
            <span>Day {selectedDay} 每日精選短影片</span>
          </h3>

          {loadingVideo ? (
            <div className="text-center py-12 text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 text-slate-300 animate-spin" />
              <span>影片資料載入中...</span>
            </div>
          ) : activeVideoUrl ? (
            <div className="space-y-3">
              {/* If YouTube type (directly plays inline) */}
              {activeVideoType === "youtube" ? (
                isPlayerActive ? (
                  /* YouTube Inline iframe player */
                  <div className="space-y-3">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-black animate-fade-in">
                      <iframe
                        src={`${activeYoutubeEmbedUrl}?autoplay=1&rel=0`}
                        className="absolute inset-0 w-full h-full"
                        title={activeTitle}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                    <p className="text-[10px] text-green-600 font-bold text-center mt-2 flex items-center justify-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                      <span>影片可直接在手冊內播放，不會離開網站。</span>
                    </p>
                    {activeGooglePhotosUrl && (
                      <div className="flex justify-center pt-1.5">
                        <a
                          href={activeGooglePhotosUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-slate-500 hover:text-biker-orange bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-xl border border-slate-200/50 transition-colors shadow-xs"
                        >
                          <span>改用 Google Photos 觀看</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ) : (activeThumbnail && !thumbnailFailed) ? (
                  /* YouTube cover image button (aspect-video to fit 16:9 perfectly) */
                  <button
                    type="button"
                    onClick={() => setIsPlayerActive(true)}
                    className="block max-w-md mx-auto aspect-video w-full relative rounded-2xl overflow-hidden shadow-md border border-slate-100/60 group cursor-pointer text-left focus:outline-none"
                  >
                    <img
                      src={activeThumbnail}
                      alt={activeTitle}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      onError={(e) => {
                        // Fallback sequence for YouTube thumbnails
                        if (e.target.src.includes("i.ytimg.com")) {
                          // Try img.youtube.com
                          e.target.src = e.target.src.replace("i.ytimg.com", "img.youtube.com");
                        } else if (e.target.src.includes("hqdefault.jpg")) {
                          // Try mqdefault
                          e.target.src = e.target.src.replace("hqdefault.jpg", "mqdefault.jpg");
                        } else if (e.target.src.includes("mqdefault.jpg")) {
                          // Try 0.jpg
                          e.target.src = e.target.src.replace("mqdefault.jpg", "0.jpg");
                        } else {
                          // Fallback to text play button
                          setThumbnailFailed(true);
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/45" />
                    <div className="absolute inset-0 flex flex-col items-center justify-between p-5 z-10">
                      <div className="bg-slate-900/60 backdrop-blur-xs text-white px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase">
                        Day {selectedDay} 精選短片
                      </div>
                      <div className="bg-biker-orange text-white p-3.5 rounded-full shadow-lg transition-transform group-hover:scale-110 active:scale-95 duration-200">
                        <Play className="w-6 h-6 fill-current translate-x-0.5" />
                      </div>
                      <div className="text-center">
                        <span className="block text-xs font-black text-white drop-shadow-md text-center">
                          播放 Day {selectedDay} 精選短片
                        </span>
                        <span className="inline-flex items-center text-[9px] text-slate-200 mt-1 font-bold">
                          <span>在手冊內直接播放</span>
                        </span>
                      </div>
                    </div>
                  </button>
                ) : (
                  /* YouTube fallback button if no thumbnail */
                  <button
                    type="button"
                    onClick={() => setIsPlayerActive(true)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 hover:bg-slate-100/50 transition-colors shadow-sm group cursor-pointer focus:outline-none text-center"
                  >
                    <div className="bg-biker-orange text-white p-3 rounded-full shadow group-hover:scale-105 transition-transform">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                    <div className="text-center">
                      <span className="block text-xs font-bold text-slate-700">播放 Day {selectedDay} 精選短片</span>
                    </div>
                    <div className="text-[10px] text-biker-navy font-bold flex items-center space-x-0.5 mx-auto">
                      <span>在手冊內直接播放</span>
                    </div>
                  </button>
                )
              ) : (
                /* Google Photos video type (original intermediate modal popup behaviour) */
                <>
                  {activeThumbnail ? (
                    /* Beautiful custom cover image card triggering the intermediate confirmation modal */
                    <button
                      type="button"
                      onClick={() => {
                        setModalVideo({ url: activeVideoUrl, thumbnail: activeThumbnail, title: activeTitle, day: selectedDay });
                        setVideoModalOpen(true);
                      }}
                      className="block max-w-md mx-auto aspect-[4/3] w-full relative rounded-2xl overflow-hidden shadow-md border border-slate-100/60 group cursor-pointer text-left focus:outline-none"
                    >
                      <img
                        src={activeThumbnail}
                        alt={activeTitle}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                      <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/45" />
                      <div className="absolute inset-0 flex flex-col items-center justify-between p-5 z-10">
                        <div className="bg-slate-900/60 backdrop-blur-xs text-white px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase">
                          Day {selectedDay} 精選短片
                        </div>
                        <div className="bg-biker-orange text-white p-3.5 rounded-full shadow-lg transition-transform group-hover:scale-110 active:scale-95 duration-200">
                          <Play className="w-6 h-6 fill-current translate-x-0.5" />
                        </div>
                        <div className="text-center">
                          <span className="block text-xs font-black text-white drop-shadow-md text-center">
                            觀看 Day {selectedDay} 精選短片
                          </span>
                          <span className="inline-flex items-center text-[9px] text-slate-200 mt-1 font-bold">
                            <span>開啟播放引導頁</span>
                            <ExternalLink className="w-3 h-3 ml-1 opacity-80" />
                          </span>
                        </div>
                      </div>
                    </button>
                  ) : (
                    /* Fallback Non-YouTube link card triggering the intermediate confirmation modal */
                    <button
                      type="button"
                      onClick={() => {
                        setModalVideo({ url: activeVideoUrl, thumbnail: "", title: activeTitle, day: selectedDay });
                        setVideoModalOpen(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 hover:bg-slate-100/50 transition-colors shadow-sm group cursor-pointer focus:outline-none text-center"
                    >
                      <div className="bg-biker-orange text-white p-3 rounded-full shadow group-hover:scale-105 transition-transform">
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                      <div className="text-center">
                        <span className="block text-xs font-bold text-slate-700">觀看 Day {selectedDay} 精選短片</span>
                        <span className="block text-[9px] text-slate-400 mt-0.5 max-w-xs break-all mx-auto">{activeVideoUrl}</span>
                      </div>
                      <div className="text-[10px] text-biker-navy font-bold flex items-center space-x-0.5 mx-auto">
                        <span>開啟播放引導頁</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </button>
                  )}

                  {/* Added helpful tip to guide riders back to the site */}
                  <p className="text-[10px] text-slate-400 font-bold text-center mt-2 leading-relaxed px-4">
                    💡 提示：影片將開啟 Google Photos；觀看後請切回原本的手冊頁面。
                  </p>
                </>
              )}
            </div>
          ) : (
            /* No video placeholder */
            <div className="bg-slate-50 rounded-2xl py-10 border border-dashed border-slate-200 text-center text-slate-400 text-xs font-semibold">
              <Film className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-pulse" />
              <span>小秘書短影片整理中，敬請期待！🎬</span>
            </div>
          )}

          {/* Admin form to paste video URL always shown at bottom when verified */}
          {isPasswordVerified && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              {video && (
                <div className="text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 break-all font-mono">
                  <span className="font-bold text-slate-700">目前已儲存的網址：</span>
                  <a 
                    href={video.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-biker-navy underline hover:text-biker-orange font-medium"
                  >
                    {video.url}
                  </a>
                </div>
              )}
              {videoStatusMessage.text && (
                <div className={`text-[10px] p-2.5 rounded-xl border font-bold flex items-center space-x-1.5 ${
                  videoStatusMessage.type === "success" 
                    ? "bg-green-50 text-green-700 border-green-200 animate-fade-in" 
                    : "bg-red-50 text-red-700 border-red-200 animate-fade-in"
                }`}>
                  {videoStatusMessage.type === "success" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                  )}
                  <span>{videoStatusMessage.text}</span>
                </div>
              )}
              <form onSubmit={handleSaveVideoUrl} className="flex gap-2">
                <input
                  type="text"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder={video ? "輸入新網址以覆寫目前影片" : "請貼上當日影片網址 (如 Google Photos 連結)"}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white"
                  disabled={savingVideo || deletingVideo}
                />
                <button
                  type="submit"
                  disabled={savingVideo || deletingVideo}
                  className={`bg-biker-navy hover:bg-biker-navy-dark text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                    (savingVideo || deletingVideo) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {savingVideo ? (
                    <span className="flex items-center space-x-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>儲存中...</span>
                    </span>
                  ) : "儲存影片網址"}
                </button>
              </form>
              {video && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleDeleteVideo}
                    disabled={savingVideo || deletingVideo}
                    className={`text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer ${
                      (savingVideo || deletingVideo) ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {deletingVideo ? (
                      <span className="flex items-center space-x-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>正在清除...</span>
                      </span>
                    ) : (
                      <>
                        <Trash2 className="w-3 h-3" />
                        <span>清除 Day {selectedDay} 影片連結，回到預設狀態</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {/* SECTION 2: Photo Wall Grid */}
        {initialView !== "videos" && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
          <h3 className="text-sm font-black text-slate-800 flex items-center space-x-2 border-b border-slate-50 pb-2">
            <span className="bg-green-100 text-biker-green p-1 rounded-lg">🖼️</span>
            <span>Day {selectedDay} 壯騎照片牆</span>
          </h3>

          {loadingPhotos ? (
            <div className="text-center py-12 text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 text-slate-300 animate-spin" />
              <span>照片載入中...</span>
            </div>
          ) : photos.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl py-14 border border-dashed border-slate-200 text-center text-slate-400 text-xs font-semibold">
              <Image className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <span>今日照片牆尚未上傳，請等候 Roger 上傳當日照片！📸</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.slice(0, visiblePhotosCount).map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square rounded-2xl overflow-hidden shadow-xs border border-slate-100 bg-slate-100 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                  onClick={() => setLightboxPhoto(photo)}
                >
                  <img
                    src={photo.url}
                    alt={`Day ${selectedDay} Biker Photo`}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-103"
                  />

                  {/* Desktop overlay options on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5">
                    {/* Top action row */}
                    <div className="flex justify-end space-x-1.5">
                      {isPasswordVerified && (
                        <button
                          type="button"
                          onClick={(e) => handleDeletePhoto(photo, e)}
                          className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg transition-transform active:scale-90"
                          title="刪除照片"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Bottom action row */}
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] bg-slate-900/60 text-white px-2 py-0.5 rounded font-black tracking-wider shadow">
                        DAY {selectedDay}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(photo.url, photo.id);
                          }}
                          className="bg-biker-orange hover:bg-biker-orange-dark text-white p-1.5 rounded-lg shadow transition-transform active:scale-90"
                          title="下載原始圖"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <span className="bg-white/80 hover:bg-white text-slate-800 p-1.5 rounded-lg shadow">
                          <Eye className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile simple download & delete overlay (always visible, separated to avoid misclicks) */}
                  {/* Delete button (Top Right) */}
                  {isPasswordVerified && (
                    <button
                      type="button"
                      onClick={(e) => handleDeletePhoto(photo, e)}
                      className="md:hidden absolute top-2 right-2 bg-red-600/90 text-white p-2 rounded-xl shadow-md pointer-events-auto z-10"
                      title="刪除照片"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Day Tag (Bottom Left) */}
                  <div className="md:hidden absolute bottom-2 left-2 bg-slate-900/70 text-white px-2 py-0.5 rounded-lg font-bold text-[9px] pointer-events-none">
                    Day {selectedDay}
                  </div>

                  {/* Download button (Bottom Right) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(photo.url, photo.id);
                    }}
                    className="md:hidden absolute bottom-2 right-2 bg-biker-orange/90 text-white p-2 rounded-xl shadow-md pointer-events-auto z-10"
                    title="下載照片"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>

      {/* Video Confirmation Intermediate Modal (Roger UX design) */}
      {videoModalOpen && modalVideo && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 fade-in"
          onClick={() => setVideoModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 flex flex-col justify-between items-center text-center space-y-4 animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cover image thumbnail */}
            {modalVideo.thumbnail ? (
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow border border-slate-100 relative">
                <img
                  src={modalVideo.thumbnail}
                  alt={modalVideo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className="w-10 h-10 text-white fill-current opacity-80" />
                </div>
              </div>
            ) : (
              <div className="w-full aspect-[4/3] bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-5">
                <Film className="w-10 h-10 mb-2 text-slate-350 animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  {modalVideo.title}
                </span>
              </div>
            )}

            {/* Text descriptions */}
            <div className="space-y-2">
              <h4 className="text-sm font-black text-slate-800 tracking-tight">
                即將前往 Google Photos 觀看短影片
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 text-left">
                「影片會在 Google Photos 開啟。觀看後若沒有自動回到手冊，請切回原本的瀏覽器分頁或回到剖地瓜手冊網站。」
              </p>
            </div>

            {/* Buttons row */}
            <div className="w-full flex flex-col space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.open(modalVideo.url, "_blank", "noopener,noreferrer");
                }}
                className="w-full bg-biker-orange hover:bg-biker-orange-dark text-white font-black py-3 px-4 rounded-xl text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>開啟 Google Photos 影片</span>
              </button>
              
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200/60 font-bold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                留在手冊
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Lightbox / Zoom Dialog Modal */}
      {lightboxPhoto && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 fade-in"
          onClick={() => setLightboxPhoto(null)}
        >
          <div 
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col justify-between items-center animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute -top-12 right-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Enlarged image */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl w-full flex items-center justify-center max-h-[75vh]">
              <img
                src={lightboxPhoto.url}
                alt="Enlarged gallery view"
                className="max-w-full max-h-[75vh] object-contain"
              />
            </div>

            {/* Lightbox actions panel */}
            <div className="w-full flex items-center justify-between mt-4 px-2">
              <span className="text-xs text-white/60 font-bold bg-white/5 px-3 py-1 rounded-lg">
                📆 Day {selectedDay} 壯騎照片
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleDownload(lightboxPhoto.url, lightboxPhoto.id)}
                  className="bg-biker-orange hover:bg-biker-orange-dark text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>下載此照片</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(null)}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Secret gear button at the bottom to trigger/exit Admin Password box */}
      <div className="flex justify-center mt-12 pb-4">
        <button 
          type="button"
          onClick={() => {
            setIsAdminMode(!isAdminMode);
          }}
          className={`transition-all p-2 rounded-lg ${isAdminMode ? "text-biker-orange" : "text-slate-300 hover:text-slate-400"}`}
          title="切換管理模式"
        >
          <Settings className="w-4 h-4 opacity-50 hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
}
