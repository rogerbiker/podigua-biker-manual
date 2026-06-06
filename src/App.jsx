import { useState, useEffect } from "react";
import Header from "./components/Header";
import MobileNav from "./components/MobileNav";
import HomePage from "./pages/HomePage";
import TripOverview from "./pages/TripOverview";
import FoodLodgingPage from "./pages/FoodLodgingPage";
import MembersPage from "./pages/MembersPage";
import ReminderPage from "./pages/ReminderPage";
import CostPage from "./pages/CostPage";
import ReviewPage from "./pages/ReviewPage";
import RoutePage from "./pages/RoutePage";
import ReflectionPage from "./pages/ReflectionPage";
import MediaPage from "./pages/MediaPage";
import Day1StoryPage from "./pages/Day1StoryPage";
import Day1PdfPage from "./pages/Day1PdfPage";

export default function App() {
  const [currentTab, setCurrentTab] = useState("home");
  const [selectedDayId, setSelectedDayId] = useState(null);

  // Automatically scroll to the top of the page when changing tabs
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab]);

  // Check and persist stage 2 beta flag (enable on beta/admin/debug params or localhost)
  const [isBeta] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    const urlBeta = params.get("beta");
    const urlAdmin = params.get("admin");
    const urlDebug = params.get("debug");
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (urlBeta === "true" || urlAdmin === "true" || urlDebug === "true" || isLocal) {
      localStorage.setItem("stage2_beta", "true");
      return true;
    } else if (urlBeta === "false") {
      localStorage.removeItem("stage2_beta");
      return false;
    }
    return localStorage.getItem("stage2_beta") === "true";
  });

  // Helper to change page and optionally target a day
  const handleSelectDay = (dayId) => {
    setSelectedDayId(dayId);
  };

  // Switch renderer for pages
  const renderPage = () => {
    switch (currentTab) {
      case "home":
        return <HomePage setCurrentTab={setCurrentTab} />;
      case "trip":
        return (
          <TripOverview
            selectedDayId={selectedDayId}
            onSelectDay={handleSelectDay}
            setCurrentTab={setCurrentTab}
          />
        );
      case "route":
        return <RoutePage setCurrentTab={setCurrentTab} />;
      case "reflections":
        return <ReflectionPage />;
      case "media":
        return <MediaPage initialView="all" />;
      case "media-photos":
        return <MediaPage initialView="photos" />;
      case "media-videos":
        return <MediaPage initialView="videos" />;
      case "story-day1":
        return <Day1StoryPage setCurrentTab={setCurrentTab} />;
      case "story-day1-pdf":
        return <Day1PdfPage setCurrentTab={setCurrentTab} />;
      case "food-lodging":
        return <FoodLodgingPage />;
      case "members":
        return <MembersPage />;
      case "reminders":
        return <ReminderPage />;
      case "cost":
        return <CostPage />;
      case "review":
        return <ReviewPage />;
      default:
        return <HomePage setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header for desktop navigation */}
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} isBeta={isBeta} />

      {/* Main content container */}
      <main className="flex-1 max-w-6xl w-full mx-auto pb-16 md:pb-6">
        {renderPage()}
      </main>

      {/* Mobile Navigation bar */}
      <MobileNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onSelectDay={handleSelectDay}
        isBeta={isBeta}
      />
    </div>
  );
}
