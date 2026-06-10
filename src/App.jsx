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
import CertificatesPage from "./pages/CertificatesPage";

export default function App() {
  const [currentTab, setCurrentTab] = useState("home");
  const [selectedDayId, setSelectedDayId] = useState(null);
  
  // Automatically scroll to the top of the page when changing tabs
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab]);

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
      case "certificates":
        return <CertificatesPage />;
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
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main content container */}
      <main className="flex-1 max-w-6xl w-full mx-auto pb-16 md:pb-6">
        {renderPage()}
      </main>

      {/* Mobile Navigation bar */}
      <MobileNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onSelectDay={handleSelectDay}
      />
    </div>
  );
}
