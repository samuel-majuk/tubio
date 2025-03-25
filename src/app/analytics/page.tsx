"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import { searchVideos, YouTubeVideo } from "@/lib/youtube";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  LineChart,
  PieChart,
  Activity,
  TrendingUp,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";
import VideoCard from "@/components/discover/VideoCard";
import VideoSkeleton from "@/components/ui/video-skeleton";

export default function AnalyticsPage() {
  const [topVideos, setTopVideos] = useState<YouTubeVideo[]>([]);
  const [mostLikedVideos, setMostLikedVideos] = useState<YouTubeVideo[]>([]);
  const [mostCommentedVideos, setMostCommentedVideos] = useState<
    YouTubeVideo[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Define the niches we want to analyze
  const NICHES = ["Entertainment", "Sports", "Business", "AI", "Science"];

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const allVideos: YouTubeVideo[] = [];

      // Fetch videos from each niche for analysis
      for (const niche of NICHES) {
        try {
          const result = await searchVideos(
            "", // Empty search query to get popular videos
            niche,
            10, // Get 10 videos from each niche
            undefined,
          );

          // Add niche property to each video
          const videosWithNiche = result.videos.map((video) => ({
            ...video,
            niche: niche as any,
          }));

          allVideos.push(...videosWithNiche);
        } catch (error) {
          console.error(`Error fetching ${niche} videos:`, error);
        }
      }

      // Sort videos by different metrics
      const byViews = [...allVideos].sort((a, b) => b.viewCount - a.viewCount);
      const byLikes = [...allVideos].sort((a, b) => b.likeCount - a.likeCount);
      const byComments = [...allVideos].sort(
        (a, b) => b.commentCount - a.commentCount,
      );

      setTopVideos(byViews.slice(0, 5));
      setMostLikedVideos(byLikes.slice(0, 5));
      setMostCommentedVideos(byComments.slice(0, 5));
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // If search is implemented, we could filter the analytics data
    // For now, just log the search query
    console.log("Search query in analytics:", query);
  };

  // Calculate engagement metrics
  const calculateEngagementMetrics = () => {
    if (topVideos.length === 0)
      return { avgViews: 0, avgLikes: 0, avgComments: 0, engagementRate: 0 };

    const totalViews = topVideos.reduce(
      (sum, video) => sum + video.viewCount,
      0,
    );
    const totalLikes = topVideos.reduce(
      (sum, video) => sum + video.likeCount,
      0,
    );
    const totalComments = topVideos.reduce(
      (sum, video) => sum + video.commentCount,
      0,
    );

    const avgViews = Math.round(totalViews / topVideos.length);
    const avgLikes = Math.round(totalLikes / topVideos.length);
    const avgComments = Math.round(totalComments / topVideos.length);
    const engagementRate =
      Math.round(((totalLikes + totalComments) / totalViews) * 100 * 100) / 100; // Two decimal places

    return { avgViews, avgLikes, avgComments, engagementRate };
  };

  const metrics = calculateEngagementMetrics();

  // Calculate niche distribution
  const calculateNicheDistribution = () => {
    const distribution: Record<string, number> = {};

    NICHES.forEach((niche) => {
      distribution[niche] = topVideos.filter(
        (video) => video.niche === niche,
      ).length;
    });

    return distribution;
  };

  const nicheDistribution = calculateNicheDistribution();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onSearch={handleSearch} />

      <main className="flex-1 pb-20 px-4">
        <div className="py-4 bg-primary/5 -mx-4 px-4 mb-6">
          <h1 className="text-2xl font-bold text-center mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-center text-muted-foreground">
            Insights and trends to help you understand what's performing well
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="top-videos" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Top Videos</span>
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Engagement</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          <div className="h-4 w-24 bg-primary/10 rounded animate-pulse"></div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-8 w-16 bg-primary/10 rounded animate-pulse"></div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchAnalyticsData}>Try Again</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Average Views
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metrics.avgViews.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Per video across all niches
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Average Likes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metrics.avgLikes.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Per video across all niches
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Average Comments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metrics.avgComments.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Per video across all niches
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Engagement Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metrics.engagementRate}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        (Likes + Comments) / Views
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Niche Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center">
                        <div className="flex items-end h-48 gap-4 w-full max-w-md mx-auto">
                          {Object.entries(nicheDistribution).map(
                            ([niche, count]) => (
                              <div
                                key={niche}
                                className="flex flex-col items-center flex-1"
                              >
                                <div
                                  className="w-full rounded-t-md"
                                  style={{
                                    height: `${(count / 5) * 100}%`,
                                    backgroundColor:
                                      niche === "Entertainment"
                                        ? "rgba(239, 68, 68, 0.7)"
                                        : niche === "Sports"
                                          ? "rgba(16, 185, 129, 0.7)"
                                          : niche === "Business"
                                            ? "rgba(59, 130, 246, 0.7)"
                                            : niche === "AI"
                                              ? "rgba(139, 92, 246, 0.7)"
                                              : "rgba(245, 158, 11, 0.7)",
                                  }}
                                ></div>
                                <span className="text-xs mt-2">{niche}</span>
                                <span className="text-xs font-medium">
                                  {count}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Top Performing Niches
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {NICHES.map((niche) => {
                          const nicheVideos = topVideos.filter(
                            (v) => v.niche === niche,
                          );
                          const avgViews =
                            nicheVideos.length > 0
                              ? Math.round(
                                  nicheVideos.reduce(
                                    (sum, v) => sum + v.viewCount,
                                    0,
                                  ) / nicheVideos.length,
                                )
                              : 0;
                          const avgLikes =
                            nicheVideos.length > 0
                              ? Math.round(
                                  nicheVideos.reduce(
                                    (sum, v) => sum + v.likeCount,
                                    0,
                                  ) / nicheVideos.length,
                                )
                              : 0;

                          return (
                            <div
                              key={niche}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <h4 className="font-medium">{niche}</h4>
                                <div className="text-sm text-muted-foreground">
                                  {nicheVideos.length} videos in top results
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm flex items-center gap-2">
                                  <span>
                                    Avg. Views: {avgViews.toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-sm flex items-center gap-2">
                                  <span>
                                    Avg. Likes: {avgLikes.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="top-videos" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5" />
                    <span>Most Liked Videos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <VideoSkeleton key={i} />
                        ))}
                    </div>
                  ) : error ? (
                    <div className="text-center py-4">
                      <p className="text-red-500 mb-2">{error}</p>
                      <Button onClick={fetchAnalyticsData} size="sm">
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mostLikedVideos.map((video) => (
                        <VideoCard
                          key={video.id}
                          {...video}
                          onClick={() =>
                            window.open(
                              `https://www.youtube.com/watch?v=${video.id}`,
                              "_blank",
                            )
                          }
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Most Commented Videos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <VideoSkeleton key={i} />
                        ))}
                    </div>
                  ) : error ? (
                    <div className="text-center py-4">
                      <p className="text-red-500 mb-2">{error}</p>
                      <Button onClick={fetchAnalyticsData} size="sm">
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mostCommentedVideos.map((video) => (
                        <VideoCard
                          key={video.id}
                          {...video}
                          onClick={() =>
                            window.open(
                              `https://www.youtube.com/watch?v=${video.id}`,
                              "_blank",
                            )
                          }
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement by Niche</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    {isLoading ? (
                      <div className="w-full h-full bg-primary/5 animate-pulse rounded-md"></div>
                    ) : error ? (
                      <div className="text-center">
                        <p className="text-red-500 mb-2">{error}</p>
                        <Button onClick={fetchAnalyticsData} size="sm">
                          Try Again
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-end justify-around">
                        {NICHES.map((niche) => {
                          const nicheVideos = topVideos.filter(
                            (v) => v.niche === niche,
                          );
                          const engagementRate =
                            nicheVideos.length > 0
                              ? Math.round(
                                  ((nicheVideos.reduce(
                                    (sum, v) => sum + v.likeCount,
                                    0,
                                  ) +
                                    nicheVideos.reduce(
                                      (sum, v) => sum + v.commentCount,
                                      0,
                                    )) /
                                    nicheVideos.reduce(
                                      (sum, v) => sum + v.viewCount,
                                      0,
                                    )) *
                                    100 *
                                    100,
                                ) / 100
                              : 0;

                          return (
                            <div
                              key={niche}
                              className="flex flex-col items-center"
                            >
                              <div
                                className="w-16 rounded-t-md"
                                style={{
                                  height: `${engagementRate * 10}%`,
                                  backgroundColor:
                                    niche === "Entertainment"
                                      ? "rgba(239, 68, 68, 0.7)"
                                      : niche === "Sports"
                                        ? "rgba(16, 185, 129, 0.7)"
                                        : niche === "Business"
                                          ? "rgba(59, 130, 246, 0.7)"
                                          : niche === "AI"
                                            ? "rgba(139, 92, 246, 0.7)"
                                            : "rgba(245, 158, 11, 0.7)",
                                }}
                              ></div>
                              <span className="text-xs mt-2">{niche}</span>
                              <span className="text-xs font-medium">
                                {engagementRate}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Views vs. Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    {isLoading ? (
                      <div className="w-full h-full bg-primary/5 animate-pulse rounded-md"></div>
                    ) : error ? (
                      <div className="text-center">
                        <p className="text-red-500 mb-2">{error}</p>
                        <Button onClick={fetchAnalyticsData} size="sm">
                          Try Again
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col justify-center items-center">
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-medium">
                            Correlation Analysis
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Higher view counts generally correlate with{" "}
                            {topVideos.length > 0 &&
                              (topVideos[0].viewCount / topVideos[0].likeCount >
                              topVideos[topVideos.length - 1].viewCount /
                                topVideos[topVideos.length - 1].likeCount
                                ? "lower"
                                : "higher")}{" "}
                            engagement rates
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                          <div className="border rounded-md p-4 text-center">
                            <div className="text-sm font-medium mb-1">
                              High Views
                            </div>
                            <div className="text-2xl font-bold">
                              {topVideos.length > 0
                                ? (
                                    (topVideos[0].likeCount /
                                      topVideos[0].viewCount) *
                                    100
                                  ).toFixed(2)
                                : 0}
                              %
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Engagement Rate
                            </div>
                          </div>
                          <div className="border rounded-md p-4 text-center">
                            <div className="text-sm font-medium mb-1">
                              Low Views
                            </div>
                            <div className="text-2xl font-bold">
                              {topVideos.length > 0
                                ? (
                                    (topVideos[topVideos.length - 1].likeCount /
                                      topVideos[topVideos.length - 1]
                                        .viewCount) *
                                    100
                                  ).toFixed(2)
                                : 0}
                              %
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Engagement Rate
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation activeItem="analytics" />
    </div>
  );
}
