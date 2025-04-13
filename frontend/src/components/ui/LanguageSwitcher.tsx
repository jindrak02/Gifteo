import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'cs', label: 'CS' }
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(prev => !prev);
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        className="btn btn-sm btn-outline-secondary dropdown-toggle"
        onClick={toggleDropdown}
        type="button"
        aria-expanded={isOpen}
      >
        {currentLang.label}
      </button>
      {isOpen && (
        <ul className="dropdown-menu show">
          {languages
            .filter(lang => lang.code !== i18n.language)
            .map(lang => (
              <li key={lang.code}>
                <button
                  className="dropdown-item"
                  onClick={() => changeLanguage(lang.code)}
                >
                  {lang.label}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
