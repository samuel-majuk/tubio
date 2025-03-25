"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import VideoGrid from "@/components/discover/VideoGrid";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import { searchVideos, YouTubeVideo } from "@/lib/youtube";

export default function TrendingPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTrendingVideos();
  }, []);

  const fetchTrendingVideos = async (loadMore = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // For trending videos, we'll search for "trending" plus the current date
      // This is a workaround since YouTube API doesn't have a direct trending endpoint
      const today = new Date();
      const dateStr = today.getFullYear() + "-" + (today.getMonth() + 1);
      const trendingQuery = `trending ${dateStr}`;

      const result = await searchVideos(
        trendingQuery,
        "All", // Get trending from all niches
        20,
        loadMore ? nextPageToken : undefined,
      );

      if (loadMore) {
        setVideos((prev) => [...prev, ...result.videos]);
      } else {
        setVideos(result.videos);
      }

      setNextPageToken(result.nextPageToken);
    } catch (err) {
      console.error("Error fetching trending videos:", err);
      setError("Failed to load trending videos. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && nextPageToken) {
      fetchTrendingVideos(true);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // If search query is provided, search within trending videos
    if (query) {
      const filteredVideos = videos.filter(
        (video) =>
          video.title.toLowerCase().includes(query.toLowerCase()) ||
          video.channelName.toLowerCase().includes(query.toLowerCase()),
      );
      setVideos(filteredVideos);
    } else {
      // If search query is cleared, fetch trending videos again
      fetchTrendingVideos();
    }
  };

  const handleVideoClick = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

  const handleVideoSave = (videoId: string) => {
    setVideos(
      videos.map((video) =>
        video.id === videoId ? { ...video, isSaved: !video.isSaved } : video,
      ),
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onSearch={handleSearch} />

      <main className="flex-1 pb-20">
        <div className="p-4 bg-primary/5">
          <h1 className="text-2xl font-bold text-center mb-2">
            Trending Videos
          </h1>
          <p className="text-center text-muted-foreground">
            Discover what's popular right now across YouTube
          </p>
        </div>

        {error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => fetchTrendingVideos()} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : (
          <VideoGrid
            videos={videos}
            layout="grid"
            isLoading={isLoading}
            hasMore={!!nextPageToken}
            onLoadMore={handleLoadMore}
            onVideoClick={handleVideoClick}
            onVideoSave={handleVideoSave}
          />
        )}
      </main>

      <BottomNavigation activeItem="trending" />
    </div>
  );
}
