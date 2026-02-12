"use client";

import { useEffect, useRef, useState } from "react";

type ApiResult = {
  transcript?: string;
  answer?: string;
  matches?: Array<any>;
  error?: string;
};

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("พร้อมคุยแล้วจ้า ✨");
  const [result, setResult] = useState<ApiResult>({});

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("⚠️ เบราว์เซอร์นี้ไม่รองรับน้องไมค์ (แนะนำ Chrome นะคะ)");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "th-TH";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setStatus("👂 กำลังตั้งใจฟัง... พูดมาได้เลย!");
    };

    rec.onend = () => {
      setIsListening(false);
      // ถ้าหยุดโดยยังไม่ได้ผลลัพธ์ (เช่น กดหยุดเอง) ให้รีเซ็ตสถานะ
      setStatus((prev) => (prev.includes("กำลังส่ง") ? prev : "พักหูแป๊บ 💤"));
    };

    rec.onerror = (e: any) => {
      setIsListening(false);
      setStatus(`😿 เกิดข้อผิดพลาด: ${e?.error || "unknown"}`);
      setResult({ error: e?.error || "speech error" });
    };

    rec.onresult = async (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setStatus("🚀 ได้ข้อความแล้ว! กำลังวิ่งไปถามให้...");
      setResult({ transcript });

      try {
        const resp = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: transcript }),
        });

        const data: ApiResult = await resp.json();
        setResult(data);
        setStatus(data.error ? "มีปัญหาในการตอบนิดหน่อย 🥺" : "ตอบเสร็จแล้วจ้า 🎉");
      } catch (err) {
         setStatus("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้แฮะ 🥺");
      }
    };

    recognitionRef.current = rec;
  }, []);

  function start() {
    setResult({});
    try {
      recognitionRef.current?.start();
    } catch {
      // Ignore double start
    }
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  return (
    // พื้นหลัง Gradient สีพาสเทลสดใส
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 font-sans">
      
      {/* การ์ดหลักตรงกลาง */}
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
        
        {/* หัวข้อ */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            🎤 IT Shop ผู้ช่วยเสียงใส
          </h1>
          <p className="text-gray-500 mt-3 text-sm font-medium">
            กดปุ่มเริ่มแล้วถามได้เลย เช่น <br/>
            <span className="text-purple-400">"มี SSD 1TB ไหม ราคาเท่าไหร่คะ"</span> 🛍️
          </p>
        </header>

        {/* โซนปุ่มควบคุมและสถานะ */}
        <div className="flex flex-col items-center gap-4 mb-8">
          
          {/* ปุ่ม Start/Stop */}
          <div className="relative group">
            {/* เอฟเฟกต์แสงวิบวับตอนฟัง */}
            {isListening && (
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            )}
            
            {!isListening ? (
              <button
                className="relative px-8 py-3 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 text-white font-bold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 active:scale-95 flex items-center gap-2"
                onClick={start}
              >
                <span>🎙️</span> เริ่มคุยกันเถอะ
              </button>
            ) : (
              <button
                className="relative px-8 py-3 rounded-full bg-gradient-to-r from-rose-400 to-orange-400 text-white font-bold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 active:scale-95 flex items-center gap-2"
                onClick={stop}
              >
                <span>🛑</span> พอแค่นี้ก่อน
              </button>
            )}
          </div>

          {/* แถบสถานะ */}
          <div
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 shadow-sm border
              ${isListening 
                ? "bg-green-100 text-green-700 border-green-200 animate-pulse" 
                : "bg-gray-100 text-gray-600 border-gray-200"
              }`}
          >
            {isListening && <span className="animate-spin">💫</span>}
            {status}
          </div>
        </div>

        {/* โซนแสดงผลลัพธ์ */}
        <section className="space-y-5">
          
          {/* Bubble: สิ่งที่เราพูด */}
          <div className={`transition-all duration-500 transform ${result.transcript ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {result.transcript && (
              <div className="bg-blue-50 p-5 rounded-2xl rounded-tr-sm shadow-sm border border-blue-100 ml-4 relative">
                 <div className="absolute -top-3 -left-3 bg-blue-200 text-blue-800 rounded-full p-1 shadow-sm">🗣️</div>
                <div className="font-semibold text-blue-800 mb-1">คุณลูกค้าพูดว่า:</div>
                <div className="text-gray-700 leading-relaxed">“{result.transcript}”</div>
              </div>
            )}
          </div>

          {/* Bubble: คำตอบจากระบบ */}
          <div className={`transition-all duration-500 delay-100 transform ${result.answer || result.error ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {(result.answer || result.error) && (
              <div
                className={`p-5 rounded-2xl rounded-tl-sm shadow-sm border mr-4 relative
                  ${result.error 
                    ? "bg-red-50 border-red-100 text-red-700" 
                    : "bg-purple-50 border-purple-100 text-purple-900"
                  }`}
              >
                <div className="absolute -top-3 -right-3 bg-purple-200 text-purple-800 rounded-full p-1 shadow-sm">🤖</div>
                <div className="font-semibold mb-1">
                  {result.error ? "😿 น้องบอทแจ้งว่า:" : "✨ คำตอบคือ:"}
                </div>
                <div className="leading-relaxed whitespace-pre-wrap">
                  {result.answer || result.error}
                </div>
              </div>
            )}
          </div>

        </section>

        {/* Footer เล็กๆ */}
        <div className="mt-8 text-center text-xs text-gray-400">
          Powered by Web Speech API & Pastel Love 💖
        </div>

      </div>
    </main>
  );
}