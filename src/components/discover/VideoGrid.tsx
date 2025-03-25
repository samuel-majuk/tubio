"use client";

import React, { useState, useEffect, useRef } from "react";
import VideoCard from "./VideoCard";
import { cn } from "@/lib/utils";
import { Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoData {
  id: string;
  title: string;
  channelName: string;
  channelAvatar: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  publishedAt: string;
  niche: "Entertainment" | "Sports" | "Business" | "AI" | "Science";
  isSaved?: boolean;
}

interface VideoGridProps {
  videos?: VideoData[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  layout?: "grid" | "list";
  selectedNiche?:
    | "Entertainment"
    | "Sports"
    | "Business"
    | "AI"
    | "Science"
    | "All";
  onVideoClick?: (videoId: string) => void;
  onVideoSave?: (videoId: string) => void;
}

const VideoGrid = ({
  videos = mockVideos,
  isLoading = false,
  hasMore = true,
  onLoadMore = () => {},
  layout = "grid",
  selectedNiche = "All",
  onVideoClick = () => {},
  onVideoSave = () => {},
}: VideoGridProps) => {
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Filter videos by niche if a specific niche is selected
  const filteredVideos =
    selectedNiche === "All"
      ? videos
      : videos.filter((video) => video.niche === selectedNiche);

  useEffect(() => {
    // Set up intersection observer for infinite scroll
    if (loadMoreRef.current && hasMore) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isLoading && hasMore) {
            onLoadMore();
          }
        },
        { threshold: 0.1 },
      );

      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  const handleSaveVideo = (videoId: string) => {
    setSavedVideos((prev) => {
      const newSaved = new Set(prev);
      if (newSaved.has(videoId)) {
        newSaved.delete(videoId);
      } else {
        newSaved.add(videoId);
      }
      return newSaved;
    });
    onVideoSave(videoId);
  };

  if (filteredVideos.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <Filter className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No videos found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          {selectedNiche !== "All"
            ? `No videos found in the ${selectedNiche} category. Try selecting a different category.`
            : "No videos match your current filters. Try adjusting your filter settings."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-[500px] p-4">
      <div
        className={cn(
          "w-full gap-6",
          layout === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "flex flex-col",
        )}
      >
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className={cn(
              "transition-all duration-200",
              layout === "list" && "w-full",
            )}
          >
            <VideoCard
              {...video}
              isSaved={savedVideos.has(video.id)}
              onClick={() => onVideoClick(video.id)}
              onSave={() => handleSaveVideo(video.id)}
            />
          </div>
        ))}
      </div>

      {/* Loading indicator and load more trigger */}
      <div
        ref={loadMoreRef}
        className="w-full flex justify-center items-center py-8"
      >
        {isLoading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Loading more videos...
            </p>
          </div>
        ) : hasMore ? (
          <Button
            variant="outline"
            onClick={onLoadMore}
            className="bg-white dark:bg-gray-800"
          >
            Load more videos
          </Button>
        ) : filteredVideos.length > 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You've reached the end of the list
          </p>
        ) : null}
      </div>
    </div>
  );
};

// Mock data for default state
const mockVideos: VideoData[] = [
  {
    id: "video1",
    title: "10 Advanced React Patterns Every Developer Should Know",
    channelName: "React Masters",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=react",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&q=80",
    viewCount: 345000,
    likeCount: 28500,
    commentCount: 1820,
    duration: "18:24",
    publishedAt: "2023-08-15T10:30:00Z",
    niche: "Entertainment",
  },
  {
    id: "video2",
    title: "The Future of AI in Web Development - 2023 Trends",
    channelName: "Tech Insights",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tech",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1677442135136-760c813028c0?w=800&q=80",
    viewCount: 189000,
    likeCount: 15700,
    commentCount: 932,
    duration: "14:52",
    publishedAt: "2023-09-02T14:15:00Z",
    niche: "AI",
  },
  {
    id: "video3",
    title: "How Top Athletes Prepare for Game Day",
    channelName: "Sports Analysis",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sports",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
    viewCount: 427000,
    likeCount: 32100,
    commentCount: 2140,
    duration: "22:17",
    publishedAt: "2023-07-28T08:45:00Z",
    niche: "Sports",
  },
  {
    id: "video4",
    title: "Startup Funding Strategies That Actually Work",
    channelName: "Business Accelerator",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=business",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1664575599736-c5197c684128?w=800&q=80",
    viewCount: 215000,
    likeCount: 18900,
    commentCount: 1560,
    duration: "26:08",
    publishedAt: "2023-08-05T16:20:00Z",
    niche: "Business",
  },
  {
    id: "video5",
    title: "Quantum Computing Explained Simply",
    channelName: "Science Simplified",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=science",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    viewCount: 298000,
    likeCount: 24300,
    commentCount: 1870,
    duration: "15:42",
    publishedAt: "2023-09-10T11:00:00Z",
    niche: "Science",
  },
  {
    id: "video6",
    title: "Behind the Scenes: Making of Blockbuster Movie",
    channelName: "Film Insider",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=film",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
    viewCount: 512000,
    likeCount: 41200,
    commentCount: 3150,
    duration: "28:36",
    publishedAt: "2023-07-15T09:30:00Z",
    niche: "Entertainment",
  },
  {
    id: "video7",
    title: "Machine Learning for Beginners - Complete Guide",
    channelName: "AI Academy",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ai",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
    viewCount: 378000,
    likeCount: 29800,
    commentCount: 2240,
    duration: "32:15",
    publishedAt: "2023-08-22T13:45:00Z",
    niche: "AI",
  },
  {
    id: "video8",
    title: "The Science of Climate Change - Latest Research",
    channelName: "Earth Science",
    channelAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=earth",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1569163139599-0f4517e36f31?w=800&q=80",
    viewCount: 265000,
    likeCount: 22700,
    commentCount: 1980,
    duration: "24:53",
    publishedAt: "2023-09-05T15:10:00Z",
    niche: "Science",
  },
];

export default VideoGrid;
