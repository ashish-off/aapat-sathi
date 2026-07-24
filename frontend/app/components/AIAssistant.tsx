"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Activity, AlertTriangle, Loader2, ArrowRight, X, CheckCircle2 } from "lucide-react";

type AIResult = {
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  symptomsSummary: string;
  requiredCapabilities: string[];
  recommendedAction: string;
};

export default function AIAssistant() {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIResult | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = ""; 

    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setInputText(currentTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!speechSupported) {
      alert("Speech recognition is not supported in your browser. Please type your emergency details.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (err) {
        console.error("Failed to start speech recognition", err);
      }
    }
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    // Simulated AI response (Mock UI demonstration for now)
    setTimeout(() => {
      const lower = inputText.toLowerCase();
      let urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "HIGH";
      let capabilities = ["ICU", "Emergency Care", "Oxygen"];
      let summary = "Emergency distress & location received. Matching nearby dispatch units.";
      let action = "Locating nearest medical facility with trauma & ICU readiness.";

      if (lower.includes("chest pain") || lower.includes("heart") || lower.includes("छाती") || lower.includes("मुटु")) {
        urgency = "CRITICAL";
        capabilities = ["Cardiology", "ICU", "Cath Lab", "Oxygen"];
        summary = "Possible acute cardiac distress reported.";
        action = "Matching nearest cardiology & ICU facility for priority dispatch.";
      } else if (lower.includes("accident") || lower.includes("bleed") || lower.includes("दुर्घटना") || lower.includes("रगत")) {
        urgency = "CRITICAL";
        capabilities = ["Trauma", "Surgery", "Blood Bank", "ICU"];
        summary = "Trauma/injury requiring immediate surgical team.";
        action = "Directing to emergency trauma center with active surgical availability.";
      } else if (lower.includes("baby") || lower.includes("pregnancy") || lower.includes("गर्भवती") || lower.includes("सुत्केरी")) {
        urgency = "HIGH";
        capabilities = ["Maternity", "NICU", "Pediatrics", "Emergency Care"];
        summary = "Obstetric emergency / maternal healthcare distress.";
        action = "Connecting to specialized maternity hospital with active NICU.";
      }

      setAnalysisResult({
        urgency,
        symptomsSummary: summary,
        requiredCapabilities: capabilities,
        recommendedAction: action,
      });

      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-6">
      {/* Dispatch Assistance Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all space-y-6">
        {/* Card Header & Notice */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/60">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              Emergency Dispatch Assistant
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Report Emergency & Location
          </h2>
          
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-950">Required Information:</span>
              Please include both <strong>Emergency Details / Symptoms</strong> and your <strong>Current Location</strong> (city, area, or landmark) for accurate triage and hospital matching.
            </div>
          </div>
        </div>

        {/* Separate Prominent "Speak to Aapat Sathi" Button */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isListening ? "bg-red-600 text-white animate-bounce" : "bg-red-100 text-red-600"
            }`}>
              {isListening ? <Mic className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Speak to Aapat Sathi</h3>
              <p className="text-xs text-slate-500">Speak naturally in any language (Nepali, English, etc.)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleListening}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
              isListening
                ? "bg-red-600 text-white border border-red-700 animate-pulse shadow-md"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isListening ? "Listening... (Click to Stop)" : "Start Voice Input"}</span>
          </button>
        </div>

        {/* Live Listening Banner */}
        {isListening && (
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <span>Listening to your voice... Speak your emergency details and location now.</span>
          </div>
        )}

        {/* Input Form for Text */}
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Emergency & Location Description</span>
              <span className="text-slate-400 font-normal">Type or review spoken text</span>
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe emergency symptoms and location. E.g.: 'Severe chest pain and difficulty breathing near New Road, Kathmandu' or 'गम्भीर दुर्घटना, नयाँ बानेश्वर, काठमाडौँ'..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 rounded-xl p-4 text-slate-900 text-sm placeholder:text-slate-400 resize-none transition-all"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Instant Triage & Capability Matching Engine
            </span>
            <button
              type="submit"
              disabled={isAnalyzing || !inputText.trim()}
              className="w-full sm:w-auto ml-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Evaluating Triage...
                </>
              ) : (
                <>
                  <span>Evaluate Emergency Needs</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* AI Analysis Preview Result */}
        {analysisResult && (
          <div className="p-5 bg-slate-900 text-white rounded-xl space-y-4 transition-all">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Triage Assessment</span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    analysisResult.urgency === "CRITICAL"
                      ? "bg-red-600 text-white"
                      : analysisResult.urgency === "HIGH"
                      ? "bg-orange-600 text-white"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {analysisResult.urgency} URGENCY
                </span>
              </div>
              <button
                onClick={() => setAnalysisResult(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-100">{analysisResult.symptomsSummary}</p>
              <p className="text-xs text-slate-400 mt-1">{analysisResult.recommendedAction}</p>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-2">Required Medical Capabilities:</span>
              <div className="flex flex-wrap gap-2">
                {analysisResult.requiredCapabilities.map((cap) => (
                  <span
                    key={cap}
                    className="bg-slate-800 border border-slate-700 text-blue-300 text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
