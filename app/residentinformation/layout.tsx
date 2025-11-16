"use client";

import { useState, ReactNode } from "react";
import { FaUsers, FaMapMarkerAlt, FaChartBar, FaShieldAlt, FaHome, FaPeopleArrows, FaInfo } from "react-icons/fa";

// Import your pages/components
import Profiling from "./profile/profiling";
import SeePuroksView from "./seepurok/SeePurokView";

// NavItem type
type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
};

// Sidebar NavItem component
function NavItem({ icon, label, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-md w-full transition ${
        isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

// Layout props
type LayoutProps = {
  children?: ReactNode; // optional
};

export default function ResidentInformationLayout({ children }: LayoutProps) {
  const [activeNav, setActiveNav] = useState<string>("none"); // keep track of current nav

  // Function to render the main content based on activeNav
  const renderContent = () => {
    switch (activeNav) {
      case "seePuroks":
        return <SeePuroksView />;
      case "Profiling":
        return <Profiling />;
      case "vulnerableSectors":
        return <div>Vulnerable Sectors Content</div>;
      case "projectServiceDelivery":
        return <div>Project & Service Delivery Content</div>;
      case "dashboardStatistics":
        return <div>Dashboard Statistics Content</div>;
      case "peaceOrder":
        return <div>Peace & Order Content</div>;
      default:
        return <div className="text-gray-500 text-center">Select a section from the sidebar</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="bg-gray-900 text-white flex flex-col md:w-64 w-16 relative">
        <h1 className="text-xl font-bold mb-6 flex items-center justify-center md:justify-start px-2">
          <span className="md:mr-2">🏘</span>
          <span className="hidden md:inline">iBarangay</span>
        </h1>

        <nav className="flex flex-col gap-1">
          <NavItem
            icon={<FaHome />}
            label="Project & Service Delivery"
            isActive={activeNav === "projectServiceDelivery"}
            onClick={() => setActiveNav("projectServiceDelivery")}
          />

          {/* Resident Management */}
          <div>
            <NavItem
              icon={<FaUsers />}
              label="Resident Management"
              isActive={activeNav.startsWith("resident") || activeNav === "seePuroks" || activeNav === "Profiling"}
              onClick={() => setActiveNav((prev) => (prev.startsWith("resident") ? "none" : "residentMain"))}
            />
            <div
              className={`ml-8 flex flex-col gap-1 transition-all overflow-hidden ${
                activeNav.startsWith("resident") || activeNav === "seePuroks" || activeNav === "Profiling"
                  ? "max-h-40"
                  : "max-h-0"
              }`}
            >
              <button
                className={`flex items-center gap-2 text-gray-300 hover:text-white text-sm px-2 py-1 rounded-md ${
                  activeNav === "seePuroks" ? "bg-gray-700" : ""
                }`}
                onClick={() => setActiveNav("seePuroks")}
              >
                <FaMapMarkerAlt /> See Puroks
              </button>
              <button
                className={`flex items-center gap-2 text-gray-300 hover:text-white text-sm px-2 py-1 rounded-md ${
                  activeNav === "Profiling" ? "bg-gray-700" : ""
                }`}
                onClick={() => setActiveNav("Profiling")}
              >
                <FaInfo /> Profiling
              </button>
              <button
                className={`flex items-center gap-2 text-gray-300 hover:text-white text-sm px-2 py-1 rounded-md ${
                  activeNav === "vulnerableSectors" ? "bg-gray-700" : ""
                }`}
                onClick={() => setActiveNav("vulnerableSectors")}
              >
                <FaPeopleArrows /> Vulnerable Sectors
              </button>
            </div>
          </div>

          {/* Dashboard */}
          <NavItem
            icon={<FaChartBar />}
            label="Dashboard"
            isActive={activeNav === "dashboardStatistics"}
            onClick={() => setActiveNav("dashboardStatistics")}
          />

          {/* Peace & Order */}
          <NavItem
            icon={<FaShieldAlt />}
            label="Peace & Order"
            isActive={activeNav === "peaceOrder"}
            onClick={() => setActiveNav("peaceOrder")}
          />
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8">{renderContent()}</main>
    </div>
  );
}
