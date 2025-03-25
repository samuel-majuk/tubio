"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import { searchVideos, YouTubeVideo } from "@/lib/youtube";
import {
  Lightbulb,
  RefreshCw,
  Copy,
  ThumbsUp,
  MessageCircle,
  Eye,
  Clock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentIdea {
  id: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: string;
  relatedVideos: YouTubeVideo[];
  inspirationSource?: string;
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [generatingIdea, setGeneratingIdea] = useState(false);

  // Define the niches we want to use for ideas
  const NICHES = ["Entertainment", "Sports", "Business", "AI", "Science"];

  useEffect(() => {
    generateInitialIdeas();
  }, []);

  const generateInitialIdeas = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate 5 initial ideas based on trending content
      const generatedIdeas: ContentIdea[] = [];

      // For each niche, generate one idea
      for (const niche of NICHES) {
        try {
          // Get trending videos in this niche
          const result = await searchVideos(
            "trending",
            niche,
            5, // Get 5 videos for inspiration
            undefined,
          );

          if (result.videos.length > 0) {
            // Use the trending videos to generate an idea
            const relatedVideos = result.videos;
            const mainVideo = relatedVideos[0];

            // Create an idea based on the trending video
            const idea = generateIdeaFromVideo(mainVideo, relatedVideos, niche);
            generatedIdeas.push(idea);
          }
        } catch (error) {
          console.error(`Error generating idea for ${niche}:`, error);
        }
      }

      setIdeas(generatedIdeas);
    } catch (err) {
      console.error("Error generating ideas:", err);
      setError("Failed to generate content ideas. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateIdeaFromVideo = (
    video: YouTubeVideo,
    relatedVideos: YouTubeVideo[],
    niche: string,
  ): ContentIdea => {
    // Extract keywords from the video title
    const keywords = video.title
      .split(" ")
      .filter((word) => word.length > 4)
      .slice(0, 3);

    // Generate a new title based on the original but not identical
    let newTitle = "";
    switch (niche) {
      case "Entertainment":
        newTitle = `Top 10 ${keywords[0] || "Trending"} ${keywords[1] || "Entertainment"} Moments of ${new Date().getFullYear()}`;
        break;
      case "Sports":
        newTitle = `How to Master ${keywords[0] || "Professional"} ${keywords[1] || "Sports"} Techniques`;
        break;
      case "Business":
        newTitle = `${keywords[0] || "Successful"} ${keywords[1] || "Business"} Strategies for Beginners`;
        break;
      case "AI":
        newTitle = `The Future of ${keywords[0] || "Artificial"} ${keywords[1] || "Intelligence"}: What's Coming Next`;
        break;
      case "Science":
        newTitle = `Explaining ${keywords[0] || "Complex"} ${keywords[1] || "Scientific"} Concepts Simply`;
        break;
      default:
        newTitle = `How to Create Engaging Content About ${keywords[0] || "Popular"} ${keywords[1] || "Topics"}`;
    }

    // Generate tags based on the video and niche
    const tags = [
      niche,
      keywords[0] || "content",
      keywords[1] || "creator",
      "tutorial",
      "guide",
      `${new Date().getFullYear()}`,
    ];

    // Generate a description
    const description = `Create a comprehensive ${niche.toLowerCase()} video that explores ${newTitle.toLowerCase()}. Based on trending content, this topic has high viewer interest and engagement potential.`;

    // Determine difficulty based on video stats
    let difficulty: "Easy" | "Medium" | "Hard" = "Medium";
    if (video.viewCount > 500000) {
      difficulty = "Hard"; // High competition
    } else if (video.viewCount < 100000) {
      difficulty = "Easy"; // Lower competition
    }

    // Estimate time based on difficulty
    const estimatedTime =
      difficulty === "Easy"
        ? "2-3 hours"
        : difficulty === "Medium"
          ? "4-6 hours"
          : "8+ hours";

    return {
      id: `idea-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: newTitle,
      description,
      tags,
      difficulty,
      estimatedTime,
      relatedVideos,
      inspirationSource: video.title,
    };
  };

  const generateNewIdea = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic to generate an idea");
      return;
    }

    try {
      setGeneratingIdea(true);

      // Search for videos related to the topic
      const result = await searchVideos(
        topic,
        "All", // Search across all niches
        5,
        undefined,
      );

      if (result.videos.length > 0) {
        // Determine which niche this topic belongs to based on the first video
        const mainVideo = result.videos[0];
        const niche = mainVideo.niche;

        // Generate an idea based on the search results
        const newIdea = generateIdeaFromVideo(mainVideo, result.videos, niche);

        // Add the new idea to the list
        setIdeas((prevIdeas) => [newIdea, ...prevIdeas]);

        // Clear the topic input
        setTopic("");
      } else {
        alert("No videos found for this topic. Try a different topic.");
      }
    } catch (err) {
      console.error("Error generating new idea:", err);
      alert("Failed to generate a new idea. Please try again.");
    } finally {
      setGeneratingIdea(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // Filter ideas based on search query
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      const filteredIdeas = ideas.filter(
        (idea) =>
          idea.title.toLowerCase().includes(lowercaseQuery) ||
          idea.description.toLowerCase().includes(lowercaseQuery) ||
          idea.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
      );

      // If we have filtered ideas, show them, otherwise keep the original list
      if (filteredIdeas.length > 0) {
        setIdeas(filteredIdeas);
      } else {
        // If no matches, we could show a message, but for now just keep the original list
        // and let the user know there are no matches
        alert("No ideas match your search. Showing all ideas.");
      }
    } else {
      // If search is cleared, regenerate initial ideas
      generateInitialIdeas();
    }
  };

  const copyIdeaToClipboard = (idea: ContentIdea) => {
    const ideaText = `
      Title: ${idea.title}
      
      Description: ${idea.description}
      
      Tags: ${idea.tags.join(", ")}
      
      Difficulty: ${idea.difficulty}
      
      Estimated Time: ${idea.estimatedTime}
      
      Inspiration: ${idea.inspirationSource}
    `;

    navigator.clipboard.writeText(ideaText.trim());
    alert("Idea copied to clipboard!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onSearch={handleSearch} />

      <main className="flex-1 pb-20 px-4">
        <div className="py-4 bg-primary/5 -mx-4 px-4 mb-6">
          <h1 className="text-2xl font-bold text-center mb-2">Content Ideas</h1>
          <p className="text-center text-muted-foreground">
            Get inspired with trending content ideas for your next video
          </p>
        </div>

        {/* Idea generator */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span>Generate New Idea</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Enter a topic (e.g., React tutorials, cooking tips)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={generateNewIdea}
                disabled={generatingIdea || !topic.trim()}
                className="whitespace-nowrap"
              >
                {generatingIdea ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Idea"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ideas list */}
        {error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={generateInitialIdeas} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              // Skeleton loaders for ideas
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <Card key={`skeleton-${index}`} className="overflow-hidden">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-9 w-20" />
                    </CardFooter>
                  </Card>
                ))
            ) : ideas.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No ideas found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Try generating new ideas or changing your search query
                </p>
                <Button onClick={generateInitialIdeas}>Generate Ideas</Button>
              </div>
            ) : (
              ideas.map((idea) => (
                <Card key={idea.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {idea.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {idea.description}
                    </p>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{idea.estimatedTime}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`
                          ${idea.difficulty === "Easy" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
                          ${idea.difficulty === "Medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : ""}
                          ${idea.difficulty === "Hard" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : ""}
                        `}
                      >
                        {idea.difficulty}
                      </Badge>
                    </div>
                  </CardContent>
                  <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50">
                    <h4 className="text-sm font-medium mb-2">
                      Inspiration Videos
                    </h4>
                    <div className="space-y-2">
                      {idea.relatedVideos.slice(0, 2).map((video) => (
                        <div
                          key={video.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-16 h-9 object-cover rounded"
                          />
                          <div className="flex-1 overflow-hidden">
                            <p className="font-medium truncate">
                              {video.title}
                            </p>
                            <div className="flex items-center gap-2 text-gray-500">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>
                                  {(video.viewCount / 1000).toFixed(0)}K
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                <span>
                                  {(video.likeCount / 1000).toFixed(0)}K
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <CardFooter className="flex justify-between py-3">
                    <div className="text-xs text-gray-500">
                      Based on trending{" "}
                      {idea.relatedVideos[0]?.niche || "content"}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => copyIdeaToClipboard(idea)}
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      <BottomNavigation activeItem="ideas" />
    </div>
  );
}
