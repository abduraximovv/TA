"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCompletion } from "@ai-sdk/react";
import { Mic, MicOff, Send, History, WifiOff, Globe2, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/src/components/Button";
import { Card } from "@repo/ui/src/components/Card";
import { Input } from "@repo/ui/src/components/input";
import commonPhrases from "../lib/constants/common-phrases.json";

// Types for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type TranslationHistory = {
  id: string;
  original: string;
  translation: string;
  context: string;
  date: string;
};

export const ContextualTranslator = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const recognitionRef = useRef<any>(null);

  // useCompletion hook from Vercel AI SDK
  const {
    completion,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setInput,
  } = useCompletion({
    api: "/api/v1/ai/translate",
    // Make sure we pass the Authorization header assuming user is authenticated. 
    // In a real app, you'd get the token from your auth context (e.g. Supabase session).
    // For demo purposes, we're safely omitting it here or leaving it to be handled by an interceptor,
    // but the API route expects it. 
    // We will just let `ai/react` fetch do its thing. If auth is needed, headers can be passed here:
    // headers: { Authorization: `Bearer ${session?.access_token}` }
    onFinish: (prompt: string, result: string) => {
      saveToHistory(prompt, result);
    },
  });

  useEffect(() => {
    // Online/Offline detection
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Load History
    const savedHistory = localStorage.getItem("translator_history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    // Initialize Speech Recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US"; // Can be dynamic

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInput((prev: string) => prev + transcript + " ");
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setInput]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const saveToHistory = (original: string, fullResult: string) => {
    const parts = parseResult(fullResult);
    const newEntry: TranslationHistory = {
      id: Date.now().toString(),
      original,
      translation: parts.translation,
      context: parts.context,
      date: new Date().toISOString(),
    };
    
    const updatedHistory = [newEntry, ...history].slice(0, 50); // Keep last 50
    setHistory(updatedHistory);
    localStorage.setItem("translator_history", JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("translator_history");
  };

  const parseResult = (text: string) => {
    let translation = text;
    let context = "";

    if (text.includes("CULTURAL NOTES:")) {
      const parts = text.split("CULTURAL NOTES:");
      translation = parts[0].replace("TRANSLATION:", "").trim();
      context = parts[1].trim();
    } else {
      translation = text.replace("TRANSLATION:", "").trim();
    }

    return { translation, context };
  };

  const currentResult = parseResult(completion);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Globe2 className="w-6 h-6 text-teal-700" />
          Contextual Translator
        </h2>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <span className="flex items-center gap-1 text-sm text-amber-500 font-medium">
              <WifiOff className="w-4 h-4" /> Offline
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            {showHistory ? "Translate" : "History"}
          </Button>
        </div>
      </div>

      {showHistory ? (
        <Card className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Translation History</h3>
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No history yet.</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="border-b pb-4 last:border-0">
                <p className="text-sm text-gray-500 mb-1">{item.original}</p>
                <p className="font-medium text-lg">{item.translation}</p>
                {item.context && item.context !== "None" && (
                  <p className="text-sm text-teal-700 bg-accent/10 p-2 rounded mt-2">
                    💡 {item.context}
                  </p>
                )}
              </div>
            ))
          )}
        </Card>
      ) : isOnline ? (
        <Card className="p-4 space-y-4">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type or say something to translate..."
              className="pr-24 text-lg py-6"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleListening}
                className={`rounded-full ${isListening ? 'text-red-500 animate-pulse bg-red-50' : 'text-gray-500'}`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button
                type="submit"
                variant="default"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="rounded-full"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              Failed to translate: {error.message}
            </div>
          )}

          {completion && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-4 border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">
                  Translation
                </p>
                <p className="text-xl font-medium text-gray-900">
                  {currentResult.translation}
                </p>
              </div>

              {currentResult.context && currentResult.context !== "None" && (
                <div className="bg-accent/5 p-3 rounded-md border border-accent/20">
                  <p className="text-xs text-teal-700 uppercase font-semibold tracking-wider mb-1">
                    Cultural Note
                  </p>
                  <p className="text-sm text-emerald-950">
                    {currentResult.context}
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-4 space-y-6">
          <div className="text-center p-6 bg-amber-50 rounded-lg border border-amber-100">
            <WifiOff className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-amber-900">You are offline</h3>
            <p className="text-amber-700 text-sm">
              Live translation requires an internet connection. Here are some common phrases to help you out.
            </p>
          </div>

          <div className="space-y-6">
            {commonPhrases.map((category, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-gray-900 mb-3 border-b pb-1">
                  {category.category}
                </h4>
                <div className="space-y-3">
                  {category.phrases.map((phrase, pIdx) => (
                    <div key={pIdx} className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500 mb-1">{phrase.en}</p>
                      <p className="font-medium text-lg">{phrase.uz}</p>
                      <p className="text-sm text-gray-600 mt-1 italic">{phrase.ru}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
