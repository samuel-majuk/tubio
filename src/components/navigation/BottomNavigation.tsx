import React from "react";
import { cn } from "@/lib/utils";
import { Home, TrendingUp, BarChart2, Lightbulb } from "lucide-react";
import Link from "next/link";

interface BottomNavigationProps {
  activeItem?: "discover" | "trending" | "analytics" | "ideas";
}

export default function BottomNavigation({
  activeItem = "discover",
}: BottomNavigationProps) {
  const navItems = [
    {
      name: "Discover",
      icon: Home,
      href: "/",
      id: "discover",
    },
    {
      name: "Trending",
      icon: TrendingUp,
      href: "/trending",
      id: "trending",
    },
    {
      name: "Analytics",
      icon: BarChart2,
      href: "/analytics",
      id: "analytics",
    },
    {
      name: "Ideas",
      icon: Lightbulb,
      href: "/ideas",
      id: "ideas",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center items-center">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-3 flex-1 transition-colors",
                activeItem === item.id
                  ? "text-primary border-t-2 border-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 mb-1",
                  activeItem === item.id
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  activeItem === item.id
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
