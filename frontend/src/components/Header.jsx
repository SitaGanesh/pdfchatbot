// frontend/src/components/Header.jsx

import React from "react";
// import Logo from "../assets/AI Planet Logo.png";

export default function Header({ onUpload, isUploading, uploadedFileName }) {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    // Reset input so same file can be re‐uploaded
    e.target.value = "";
  };

  return (
    <header className="w-full">
      {/* ─────────────────────────────────────────────────────────────────────────────── */}
      {/* ─── Desktop Header (shown on ≥md) ───────────────────────────────────────────── */}
      <div className="hidden md:flex w-full max-w-[1439px] h-[77px] bg-white border-b border-gray-300 mx-auto justify-between items-center px-[56px]">
        {/* Logo Section (Left) */}
        <div className="flex items-center">
          <div className="w-[104.93px] h-[41px]">
            {/* Replace with your actual logo or image */}
            <span className="font-inter font-semibold text-[18px] text-black">
              <h2 style={{color:"green"}}><b>ChatPDF</b></h2>
            </span>
          </div>
        </div>

        {/* Filename + Upload Button Section (Right) */}
        <div className="flex items-center gap-[10px]">
          {uploadedFileName && (
            <div
              className="flex items-center gap-[7.84px] border-[0.78px] border-[rgba(15,169,88,0.44)] rounded-[3.92px] px-[7.84px] py-[7.84px]"
              style={{ width: "103.878px", height: "32.7408px" }}
            >
              <span className="text-green-400 text-sm">📄</span>
              <span className="text-sm text-black truncate max-w-[75px]">
                {uploadedFileName}
              </span>
            </div>
          )}

          <label
            className={`
              flex items-center justify-center gap-[12px]
     w-[179.875px] h-[39px]
     rounded-[4px]
     border border-black
     font-inter font-semibold text-[14px] leading-[100%] text-black
     bg-white hover:bg-gray-100
    transition-colors
            `}
          >
            <span className="w-[18px] h-[18px] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
                <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 24 13 L 24 24 L 13 24 L 13 26 L 24 26 L 24 37 L 26 37 L 26 26 L 37 26 L 37 24 L 26 24 L 26 13 L 24 13 z"></path>
              </svg>
            </span>
            <span>Upload PDF</span>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────── */}
      {/* ─── Mobile Header (shown on <md) ────────────────────────────────────────────── */}
      <div className="flex md:hidden w-full max-w-[414px] h-[71px] bg-white shadow-[0px_-8px_25px_0px_rgba(0,0,0,0.22)] mx-auto justify-between items-center px-[16px]">
        {/* Logo Section (Left) */}
        <div className="w-[104.93px] h-[41px]">
          <span className="font-inter font-semibold text-[18px] text-black">
            <h2 style={{color:"green"}}><b>ChatPDF</b></h2>
          </span>
        </div>

        {/* Filename + Upload Icon Section (Right) */}
        <div className="flex items-center gap-[10px]">
          {uploadedFileName && (
            <div
              className="flex items-center gap-[7.84px] border-[0.78px] border-[rgba(15,169,88,0.44)] rounded-[3.92px] px-[7.84px] py-[7.84px]"
              style={{ width: "103.878px", height: "32.7408px" }}
            >
              <span className="text-green-400 text-sm">📄</span>
              <span className="text-xs text-black truncate max-w-[60px]">
                {uploadedFileName}
              </span>
            </div>
          )}

          <label
            className={`
              w-[38px] h-[38px]
              flex items-center justify-center content
              rounded-[8px] border-[1px] border-black
              ${isUploading ? "bg-gray-200 cursor-not-allowed" : "bg-white hover:bg-gray-100"}
              transition-colors
            `}
          >
            <span
              className="w-[15.75px] h-[15.75px] flex items-center justify-center "
            >
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
                <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 24 13 L 24 24 L 13 24 L 13 26 L 24 26 L 24 37 L 26 37 L 26 26 L 37 26 L 37 24 L 26 24 L 26 13 L 24 13 z"></path>
              </svg>
            </span>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>
    </header>
  );
}
