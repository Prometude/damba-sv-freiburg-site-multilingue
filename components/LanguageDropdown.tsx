"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  Language,
  useLanguage,
} from "./LanguageProvider";

const languages = [
  {
    code: "fr" as Language,
    label: "Français",
    flag: "/flag-fr.webp",
  },
  {
    code: "en" as Language,
    label: "English",
    flag: "/flag-en.webp",
  },
  {
    code: "de" as Language,
    label: "Deutsch",
    flag: "/flag-de.webp",
  },
];

export default function LanguageDropdown() {
  const { language, setLanguage } = useLanguage();

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedLanguage =
    languages.find(
      (item) => item.code === language
    ) ?? languages[0];

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  return (
    <div
      className="language-flag-dropdown"
      ref={wrapperRef}
    >
      <button
        type="button"
        className="language-flag-trigger"
        aria-label="Choisir la langue"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() =>
          setOpen((current) => !current)
        }
      >
        <Image
          src={selectedLanguage.flag}
          alt={selectedLanguage.label}
          width={36}
          height={24}
        />

        <span
          className={`language-chevron ${
            open ? "open" : ""
          }`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          className="language-flag-menu"
          role="menu"
        >
          {languages.map((item) => (
            <button
              type="button"
              key={item.code}
              role="menuitem"
              className={
                language === item.code
                  ? "active"
                  : ""
              }
              aria-label={item.label}
              title={item.label}
              onClick={() => {
                setLanguage(item.code);
                setOpen(false);
              }}
            >
              <Image
                src={item.flag}
                alt={item.label}
                width={42}
                height={28}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
