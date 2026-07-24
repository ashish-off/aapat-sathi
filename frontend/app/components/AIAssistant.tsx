"use client";

import { useState, useEffect, useRef } from "react";

type AIResult = {
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  symptomsSummary: string;
  requiredCapabilities: string[];
  recommendedAction: string;
};

export default function AIAssistant() {
  const [inputText, setInputText] = useState("");
  const [language, setLanguage] = useState<"en-US" | "ne-NP">("ne-NP");
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
    recognition.lang = language;

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
  }, [language]);

  const toggleListening = () => {
    if (!speechSupported) {
      alert("Speech recognition is not supported in your browser. Please type your emergency description.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = language;
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
      let summary = "Emergency distress reported. Requires immediate medical attention.";
      let action = "Dispatching nearest emergency provider with trauma and ICU readiness.";

      if (lower.includes("chest pain") || lower.includes("heart") || lower.includes("छाती") || lower.includes("मुटु")) {
        urgency = "CRITICAL";
        capabilities = ["Cardiology", "ICU", "Cath Lab", "Oxygen"];
        summary = "Possible acute cardiac event or severe chest distress.";
        action = "High-priority cardiology & ICU facility required immediately.";
      } else if (lower.includes("accident") || lower.includes("bleed") || lower.includes("दुर्घटना") || lower.includes("रगत")) {
        urgency = "CRITICAL";
        capabilities = ["Trauma", "Surgery", "Blood Bank", "ICU"];
        summary = "Trauma/injury requiring immediate surgical evaluation.";
        action = "Directing to emergency trauma center with open operating theater.";
      } else if (lower.includes("baby") || lower.includes("pregnancy") || lower.includes("गर्भवती") || lower.includes("सुत्केरी")) {
        urgency = "HIGH";
        capabilities = ["Maternity", "NICU", "Pediatrics", "Emergency Care"];
        summary = "Obstetric emergency / maternal healthcare distress.";
        action = "Connecting to specialized maternity hospital with NICU.";
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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/60 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              Emergency Triage Assistant
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Describe Emergency Details
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              State patient condition or symptoms in English or Nepali.
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-center border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setLanguage("ne-NP");
                if (isListening) {
                  recognitionRef.current?.stop();
                  setIsListening(false);
                }
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                language === "ne-NP"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🇳🇵 नेपाली
            </button>
            <button
              type="button"
              onClick={() => {
                setLanguage("en-US");
                if (isListening) {
                  recognitionRef.current?.stop();
                  setIsListening(false);
                }
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                language === "en-US"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="relative">
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                language === "ne-NP"
                  ? "बिरामीको अवस्था वा लक्षणहरू वर्णन गर्नुहोस् (उदा. मुटु दुखाई, श्वासप्रश्वासमा समस्या)..."
                  : "Describe symptoms or situation (e.g., severe chest pain, breathing difficulty, accident)..."
              }
              className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 rounded-xl p-4 text-slate-900 text-base placeholder:text-slate-400 resize-none transition-all"
            />

            {/* Voice Input Trigger */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isListening
                    ? "bg-red-600 text-white border-red-700 animate-pulse shadow-md"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900 shadow-xs"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                {isListening
                  ? language === "ne-NP"
                    ? "सुन्दैछ..."
                    : "Listening..."
                  : language === "ne-NP"
                  ? "बोल्नुहोस् (Speak)"
                  : "Speak to Sathi"}
              </button>
            </div>
          </div>

          {/* Speech Active Banner */}
          {isListening && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span>
                {language === "ne-NP"
                  ? "नेपालीमा बोलिरहनु भएको छ... (Speak now in Nepali)"
                  : "Speaking in English... State patient symptoms clearly."}
              </span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Instant Triage & Hospital Capability Matching
            </span>
            <button
              type="submit"
              disabled={isAnalyzing || !inputText.trim()}
              className="w-full sm:w-auto ml-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Evaluating Triage...
                </>
              ) : (
                <>
                  <span>Evaluate Emergency Needs</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        {/* AI Analysis Preview Result */}
        {analysisResult && (
          <div className="mt-6 p-5 bg-slate-900 text-white rounded-xl space-y-4 transition-all">
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
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Clear
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
                    className="bg-slate-800 border border-slate-700 text-blue-300 text-xs px-2.5 py-1 rounded-md font-medium"
                  >
                    ✓ {cap}
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
