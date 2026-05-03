"use client";

import HelloWorld from "./components/HelloWorld";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-6">
      <main className="max-w-md w-full animate-in fade-in zoom-in duration-700">
        <HelloWorld />

        <div className="mt-8 flex justify-center gap-6">
          <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            Next.js 14
          </div>
          <div className="w-px h-3 bg-gray-800" />
          <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            Tailwind CSS
          </div>
          <div className="w-px h-3 bg-gray-800" />
          <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            TypeScript
          </div>
        </div>
      </main>
    </div>
  );
}
