import React, { useState, useRef, useEffect } from "react";
import { LANGUAGE_VERSIONS } from "../utils/constants";

const languages = Object.entries(LANGUAGE_VERSIONS);
const ACTIVE_COLOR = "text-blue-400";

const LanguageSelector = ({ language, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="ml-2 mb-4 relative" ref={menuRef}>
      <p className="mb-2 text-lg font-medium">Language:</p>
      <button
        onClick={toggleMenu}
        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
      >
        {language}
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-2 w-48 bg-[#110c1b] rounded shadow-md border border-gray-700">
          {languages.map(([lang, version]) => (
            <li
              key={lang}
              onClick={() => {
                onSelect(lang);
                setIsOpen(false);
              }}
              className={`flex justify-between px-4 py-2 cursor-pointer ${
                lang === language ? "bg-gray-900 text-blue-400" : "text-white"
              } hover:bg-gray-900 hover:text-blue-400`}
            >
              <span>{lang}</span>
              <span className="text-gray-500 text-sm ml-2">({version})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector;
