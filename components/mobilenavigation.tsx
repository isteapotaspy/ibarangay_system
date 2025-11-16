import Link from "next/link";
import { Home, ScrollText, Users, Bell } from "lucide-react";

export default function MobileNavigation() {
  const navItems = [
    { name: "Home", href: "/", icon: <Home /> },
    { name: "Residents", href: "/resident", icon: <Users /> },
    { name: "Services", href: "/services", icon: <ScrollText /> },
    { name: "Alerts", href: "/alerts", icon: <Bell /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white flex justify-around items-center py-3 md:hidden">
      {navItems.map(({ name, href, icon }) => (
        <Link key={name} href={href} className="flex flex-col items-center text-xs">
          {icon}
          <span>{name}</span>
        </Link>
      ))}
    </nav>
  );
}
