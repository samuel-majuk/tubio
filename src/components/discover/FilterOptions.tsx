"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  SlidersHorizontal,
  Clock,
  BarChart4,
  ThumbsUp,
  MessageSquare,
  Eye,
  Calendar,
  LayoutGrid,
  List,
  Filter,
  X,
} from "lucide-react";

interface FilterOptionsProps {
  onSortChange?: (sortBy: string) => void;
  onViewChange?: (view: "grid" | "list") => void;
  onFilterChange?: (filters: FilterState) => void;
  currentView?: "grid" | "list";
}

interface FilterState {
  duration: [number, number];
  minViews: number;
  minLikes: number;
  minComments: number;
  uploadDate: string;
  includeSubtitles: boolean;
}

const FilterOptions = ({
  onSortChange = () => {},
  onViewChange = () => {},
  onFilterChange = () => {},
  currentView = "grid",
}: FilterOptionsProps) => {
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    duration: [0, 60],
    minViews: 1000,
    minLikes: 100,
    minComments: 10,
    uploadDate: "any",
    includeSubtitles: false,
  });

  // Track active filters count
  const [activeFilterCount, setActiveFilterCount] = useState<number>(0);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value);
  };

  const handleViewChange = (view: "grid" | "list") => {
    onViewChange(view);
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);

    // Count active filters
    let count = 0;
    if (updatedFilters.duration[0] > 0 || updatedFilters.duration[1] < 60)
      count++;
    if (updatedFilters.minViews > 1000) count++;
    if (updatedFilters.minLikes > 100) count++;
    if (updatedFilters.minComments > 10) count++;
    if (updatedFilters.uploadDate !== "any") count++;
    if (updatedFilters.includeSubtitles) count++;

    setActiveFilterCount(count);
  };

  const resetFilters = () => {
    const defaultFilters = {
      duration: [0, 60],
      minViews: 1000,
      minLikes: 100,
      minComments: 10,
      uploadDate: "any",
      includeSubtitles: false,
    };

    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setActiveFilterCount(0);
    setIsFilterOpen(false);
  };

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "date", label: "Upload Date" },
    { value: "views", label: "View Count" },
    { value: "rating", label: "Rating" },
    { value: "title", label: "Title" },
  ];

  const dateOptions = [
    { value: "any", label: "Any time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This week" },
    { value: "month", label: "This month" },
    { value: "year", label: "This year" },
  ];

  return (
    <div className="w-full bg-background border-b border-border py-4 px-4 md:px-6 sticky top-[70px] z-10 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 relative"
              >
                <Filter size={16} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 min-w-5 px-1 flex items-center justify-center bg-primary text-primary-foreground"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-8 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                    Clear all
                  </Button>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Clock size={16} /> Duration (minutes)
                  </h3>
                  <Slider
                    value={filters.duration}
                    max={60}
                    step={1}
                    onValueChange={(value) =>
                      handleFilterChange({
                        duration: value as [number, number],
                      })
                    }
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{filters.duration[0]} min</span>
                    <span>{filters.duration[1]} min</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Eye size={16} /> Minimum Views
                  </h3>
                  <Slider
                    value={[filters.minViews]}
                    min={0}
                    max={1000000}
                    step={1000}
                    onValueChange={(value) =>
                      handleFilterChange({ minViews: value[0] })
                    }
                    className="my-4"
                  />
                  <div className="text-xs text-muted-foreground">
                    {filters.minViews.toLocaleString()} views
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <ThumbsUp size={16} /> Minimum Likes
                  </h3>
                  <Slider
                    value={[filters.minLikes]}
                    min={0}
                    max={100000}
                    step={100}
                    onValueChange={(value) =>
                      handleFilterChange({ minLikes: value[0] })
                    }
                    className="my-4"
                  />
                  <div className="text-xs text-muted-foreground">
                    {filters.minLikes.toLocaleString()} likes
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <MessageSquare size={16} /> Minimum Comments
                  </h3>
                  <Slider
                    value={[filters.minComments]}
                    min={0}
                    max={10000}
                    step={10}
                    onValueChange={(value) =>
                      handleFilterChange({ minComments: value[0] })
                    }
                    className="my-4"
                  />
                  <div className="text-xs text-muted-foreground">
                    {filters.minComments.toLocaleString()} comments
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Calendar size={16} /> Upload Date
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {dateOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={
                          filters.uploadDate === option.value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          handleFilterChange({ uploadDate: option.value })
                        }
                        className="text-xs h-8"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="subtitles"
                      checked={filters.includeSubtitles}
                      onCheckedChange={(checked) =>
                        handleFilterChange({ includeSubtitles: checked })
                      }
                    />
                    <Label htmlFor="subtitles">Has subtitles</Label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart4 size={16} />
                <span>
                  Sort: {sortOptions.find((opt) => opt.value === sortBy)?.label}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="start">
              <div className="space-y-1">
                {sortOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      sortBy === option.value && "bg-accent",
                    )}
                    onClick={() => handleSortChange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={currentView === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => handleViewChange("grid")}
            className="h-9 w-9"
            aria-label="Grid view"
          >
            <LayoutGrid size={18} />
          </Button>
          <Button
            variant={currentView === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => handleViewChange("list")}
            className="h-9 w-9"
            aria-label="List view"
          >
            <List size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterOptions;
