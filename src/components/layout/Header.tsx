"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border py-3 px-4 md:px-6 flex items-center justify-between h-[70px]">
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">T</span>
        </div>
        <h1 className="text-2xl font-bold">Tubio</h1>
      </div>

      {onSearch && (
        <form onSubmit={handleSearch} className="relative w-full max-w-sm mx-4">
          <Input
            type="text"
            placeholder="Search videos..."
            className="pl-10 pr-4 py-2 w-full rounded-full bg-muted/50"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button
            type="submit"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          >
            <Search size={18} />
          </button>
        </form>
      )}
    </header>
  );
};

export default Header;
