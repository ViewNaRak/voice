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
      setStatus("👂 กำลังตั้งใจฟัง... อยากได้อะไรพูดมาได้เลย!");
    };

    rec.onend = () => {
      setIsListening(false);
      setStatus((prev) => (prev.includes("กำลังส่ง") || prev.includes("ได้ข้อความ") ? prev : "พักหูแป๊บ 💤"));
    };

    rec.onerror = (e: any) => {
      setIsListening(false);
      setStatus(`😿 เกิดข้อผิดพลาด: ${e?.error || "unknown"}`);
      setResult({ error: e?.error || "speech error" });
    };

    rec.onresult = async (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setStatus("🚀 จดออเดอร์แล้ว! กำลังวิ่งไปหาของให้...");
      setResult({ transcript });

      try {
        const resp = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: transcript }),
        });

        const data: ApiResult = await resp.json();
        setResult(data);
        setStatus(data.error ? "มีปัญหาในการตอบนิดหน่อย 🥺" : "หาของเสร็จแล้วจ้า 🎉");
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
    // เปลี่ยนมาใช้ linear gradient แบบชัวร์ๆ บังคับสีโทนสว่าง ไม่ให้ติด Dark Mode
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 font-sans selection:bg-purple-200 text-gray-800">
      
      {/* การ์ดหลักตรงกลาง */}
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-8 sm:p-10 border border-white relative overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)]">
        
        {/* แสงวิ้งๆ ตรงมุมขวาบน (ตกแต่ง) */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-gradient-to-tr from-blue-200 to-indigo-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        {/* หัวข้อ */}
        <header className="text-center mb-10 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4 border border-purple-100">
            <span className="text-3xl">🧞‍♂️</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500 drop-shadow-sm tracking-tight">
            AI ผู้ช่วยหาของสารพัดอย่าง
          </h1>
          <p className="text-gray-500 mt-4 text-sm sm:text-base font-medium leading-relaxed">
            กดปุ่มเริ่มแล้วบอกสิ่งที่คุณตามหาได้เลย เช่น <br className="hidden sm:block"/>
            <span className="text-violet-600 bg-violet-100 px-2 py-0.5 rounded-md">"อยากได้หม้อทอดไร้น้ำมัน"</span> หรือ <span className="text-fuchsia-600 bg-fuchsia-100 px-2 py-0.5 rounded-md">"หากระเป๋าสีพาสเทล"</span> 🛍️
          </p>
        </header>

        {/* โซนปุ่มควบคุมและสถานะ */}
        <div className="flex flex-col items-center gap-5 mb-10 relative z-10">
          
          <div className="relative group">
            {/* เอฟเฟกต์แสงวิบวับตอนฟัง */}
            {isListening && (
              <div className="absolute -inset-2 bg-gradient-to-r from-fuchsia-400 to-violet-400 rounded-full blur-lg opacity-50 group-hover:opacity-70 transition duration-500 animate-pulse"></div>
            )}
            
            {!isListening ? (
              <button
                className="relative px-8 py-3.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center gap-3"
                onClick={start}
              >
                <span className="bg-white/20 p-1.5 rounded-full">🎙️</span> 
                <span>เริ่มบอกสิ่งที่อยากได้</span>
              </button>
            ) : (
              <button
                className="relative px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center gap-3 ring-2 ring-white/50"
                onClick={stop}
              >
                <span className="bg-white/20 p-1.5 rounded-full text-sm">🛑</span> 
                <span>พอแค่นี้ก่อน</span>
              </button>
            )}
          </div>

          {/* แถบสถานะ */}
          <div
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-500 flex items-center gap-2.5 shadow-sm border backdrop-blur-md
              ${isListening 
                ? "bg-emerald-50 text-emerald-600 border-emerald-200 scale-105" 
                : "bg-white/80 text-gray-500 border-gray-200"
              }`}
          >
            {isListening && <span className="animate-spin text-emerald-500">💫</span>}
            {status}
          </div>
        </div>

        {/* โซนแสดงผลลัพธ์ */}
        <section className="space-y-6 relative z-10">
          
          {/* Bubble: สิ่งที่เราพูด */}
          <div className={`transition-all duration-700 ease-out transform ${result.transcript ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
            {result.transcript && (
              <div className="flex flex-col items-end">
                <div className="flex items-end gap-2 max-w-[85%]">
                  <div className="bg-blue-50 p-5 rounded-[1.5rem] rounded-tr-sm shadow-sm border border-blue-100">
                    <div className="text-xs font-bold text-blue-500 mb-1 uppercase tracking-wider">You</div>
                    <div className="text-blue-900 leading-relaxed font-medium">“{result.transcript}”</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shadow-sm border border-white text-sm flex-shrink-0">
                    🗣️
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bubble: คำตอบจากระบบ */}
          <div className={`transition-all duration-700 delay-150 ease-out transform ${result.answer || result.error ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
            {(result.answer || result.error) && (
              <div className="flex flex-col items-start mt-2">
                <div className="flex items-end gap-2 max-w-[90%]">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shadow-sm border border-white text-lg flex-shrink-0 mb-1">
                    🧞‍♂️
                  </div>
                  <div
                    className={`p-5 rounded-[1.5rem] rounded-tl-sm shadow-sm border
                      ${result.error 
                        ? "bg-rose-50 border-rose-100 text-rose-800" 
                        : "bg-white border-purple-100 text-gray-800"
                      }`}
                  >
                    <div className={`text-xs font-bold mb-2 uppercase tracking-wider ${result.error ? 'text-rose-400' : 'text-purple-500'}`}>
                      {result.error ? "System Error" : "Assistant"}
                    </div>
                    <div className="leading-relaxed whitespace-pre-wrap font-medium">
                      {result.answer || result.error}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </section>

        {/* Footer เล็กๆ */}
        <div className="mt-10 text-center text-xs font-medium text-gray-400 tracking-wide relative z-10">
          Powered by Web Speech API & Universal Finder Magic 🎁
        </div>

      </div>
    </main>
  );
}