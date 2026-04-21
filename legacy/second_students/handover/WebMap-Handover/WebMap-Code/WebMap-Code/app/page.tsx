"use client";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    const clearSessionStorage = () => {
      sessionStorage.clear();
    };

    // Run on normal load
    clearSessionStorage();

    // Handle cases where the page is restored from the bfcache
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) {
        clearSessionStorage();
      }
    });

    return () => {
      window.removeEventListener("pageshow", clearSessionStorage);
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome!</h1>
        <div className="flex space-x-4">
          <a href="/mappingNY" className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600">MENY</a>
          <a href="/northamerica/landowners" className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600">North America - Landowners</a>
          <a href="/drawing" className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600">Drawing</a>
          <a href="/chronmaps" className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600">Global History Map</a>
        </div>
      </div>
    </main>
  );
}