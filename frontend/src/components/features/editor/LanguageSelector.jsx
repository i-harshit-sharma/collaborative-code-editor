import React, { useState, useRef, useEffect } from "react";
import { LANGUAGE_VERSIONS } from "../../../utils/constants";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Code2, Check, Info } from "lucide-react";
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiCplusplus,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";

const languages = Object.entries(LANGUAGE_VERSIONS);

const ICONS = {
  javascript: <SiJavascript className="text-yellow-400" />,
  typescript: <SiTypescript className="text-blue-500" />,
  python: <SiPython className="text-blue-400" />,
  java: <FaJava className="text-red-500" />,
  cpp: <SiCplusplus className="text-blue-600" />,
};

const LanguageSelector = ({ language, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-6 relative w-fit" ref={menuRef}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Code2 size={16} />
          Language
        </p>
        <div 
          className="relative ml-2"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
        >
          <Info size={14} className="text-gray-500 cursor-help hover:text-blue-400 transition-colors" />
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute left-6 top-0 z-[60] w-36 px-2 py-1.5 bg-gray-900 border border-gray-700 rounded shadow-xl text-[10px] text-gray-300 pointer-events-none"
              >
                Max execution time: <span className="text-blue-400 font-bold">30s</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <button
        onClick={toggleMenu}
        className="flex items-center gap-3 px-4 py-2 bg-[#1e1e2e] text-white rounded-lg border border-gray-700/50 hover:border-blue-500/50 hover:bg-[#252539] transition-all duration-200 shadow-lg min-w-[160px] justify-between group"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl transition-transform duration-200">
            {ICONS[language]}
          </span>
          <div className="flex flex-col items-start leading-tight">
            <span className="font-medium capitalize">{language}</span>
            <span className="text-[10px] text-gray-500 font-mono italic">v{LANGUAGE_VERSIONS[language]}</span>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-gray-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 mt-2 w-52 bg-[#1e1e2e]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden py-1"
          >
            <div className="px-3 py-2 text-[10px] font-medium text-gray-500 border-b border-gray-700/50 mb-1 tracking-tight">
              Select Environment
            </div>
            {languages.map(([lang, version]) => (
              <button
                key={lang}
                onClick={() => {
                  onSelect(lang);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 transition-colors group ${lang === language
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-gray-300 hover:bg-gray-700/30 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg transition-transform ${lang === language ? "scale-110" : "group-hover:scale-105"}`}>
                    {ICONS[lang]}
                  </span>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium capitalize">{lang}</span>
                    <span className="text-[9px] text-gray-500 font-mono italic">v{version}</span>
                  </div>
                </div>
                {lang === language && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-blue-500/20 p-1 rounded-full"
                  >
                    <Check size={10} className="text-blue-400" />
                  </motion.div>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
