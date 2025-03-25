"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, AlertCircle, Search, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface VoiceSearchModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSearch?: (query: string) => void;
}

export default function VoiceSearchModal({
  isOpen = true,
  onClose = () => {},
  onSearch = () => {},
}: VoiceSearchModalProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null,
  );
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [microphone, setMicrophone] =
    useState<MediaStreamAudioSourceNode | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Initialize speech recognition when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Initialize speech recognition if supported
    if (
      (typeof window !== "undefined" && "SpeechRecognition" in window) ||
      "webkitSpeechRecognition" in window
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);

        // If it's a final result
        if (event.results[current].isFinal) {
          setTimeout(() => {
            setListening(false);
          }, 1000);
        }
      };

      recognitionInstance.onerror = (event) => {
        if (event.error === "not-allowed") {
          setPermissionDenied(true);
          setError(
            "Microphone access denied. Please allow microphone access in your browser settings.",
          );
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
        setListening(false);
      };

      recognitionInstance.onend = () => {
        setListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setError("Speech recognition is not supported in your browser.");
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
      stopAudioVisualization();
    };
  }, [isOpen]);

  // Set up audio visualization
  const setupAudioVisualization = async () => {
    try {
      if (!audioContext) {
        const context = new (window.AudioContext ||
          window.webkitAudioContext)();
        const analyserNode = context.createAnalyser();
        analyserNode.fftSize = 256;

        setAudioContext(context);
        setAnalyser(analyserNode);

        // Get microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const source = context.createMediaStreamSource(stream);
        source.connect(analyserNode);
        setMicrophone(source);

        // Start visualization loop
        visualize(analyserNode);
      } else if (analyser) {
        visualize(analyser);
      }
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setPermissionDenied(true);
      setError("Could not access microphone. Please check your permissions.");
    }
  };

  const stopAudioVisualization = () => {
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
      setAnalyser(null);
      setMicrophone(null);
    }
  };

  const visualize = (analyserNode: AnalyserNode) => {
    if (!analyserNode) return;

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

    const updateLevel = () => {
      if (!listening) return;

      analyserNode.getByteFrequencyData(dataArray);

      // Calculate average level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;

      // Normalize to 0-100 range
      const level = Math.min(100, Math.max(0, avg * 1.5));
      setAudioLevel(level);

      // Continue loop if still listening
      if (listening) {
        requestAnimationFrame(updateLevel);
      }
    };

    requestAnimationFrame(updateLevel);
  };

  const startListening = async () => {
    setError(null);
    setTranscript("");
    setPermissionDenied(false);

    if (recognition) {
      try {
        await setupAudioVisualization();
        recognition.start();
        setListening(true);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        setError("Could not start speech recognition. Please try again.");
      }
    }
  };

  const stopListening = () => {
    if (recognition && listening) {
      recognition.stop();
      setListening(false);
    }
  };

  const handleSearch = () => {
    if (transcript) {
      onSearch(transcript);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Voice Search
          </DialogTitle>
          <DialogDescription className="text-center">
            {listening
              ? "Listening... Speak now"
              : transcript
                ? "Is this what you said?"
                : "Tap the microphone to start speaking"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div
            className={cn(
              "w-28 h-28 rounded-full flex items-center justify-center cursor-pointer transition-all relative",
              listening
                ? "bg-primary/10 animate-pulse"
                : permissionDenied
                  ? "bg-red-100"
                  : "bg-slate-100 hover:bg-slate-200",
            )}
            onClick={listening ? stopListening : startListening}
          >
            {listening ? (
              <>
                <Mic className="h-12 w-12 text-primary z-10" />
                <div
                  className="absolute inset-0 rounded-full bg-primary/10 animate-ping"
                  style={{
                    transform: `scale(${1 + audioLevel / 100})`,
                    opacity: 0.3 + audioLevel / 200,
                  }}
                />
              </>
            ) : permissionDenied ? (
              <MicOff className="h-12 w-12 text-red-500" />
            ) : (
              <Mic className="h-12 w-12 text-slate-500" />
            )}
          </div>

          {listening && (
            <div className="w-full max-w-xs flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Progress value={audioLevel} className="h-2" />
            </div>
          )}

          {transcript && (
            <div className="mt-4 p-4 bg-primary/5 rounded-md w-full max-w-sm border border-primary/10">
              <p className="text-center font-medium">"{transcript}"</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-md w-full max-w-sm border border-red-100">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSearch}
            disabled={!transcript}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
