import React from 'react';
import './Login.css';

function LanguageSwitcher({ language, onChangeLanguage }) {
  return (
    <div className="language-switcher">
      <button
        className={`language-btn ${language === 'ru' ? 'active' : ''}`}
        onClick={() => onChangeLanguage('ru')}
      >
        RUS
      </button>
      <button
        className={`language-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => onChangeLanguage('en')}
      >
        ENG
      </button>
    </div>
  );
}

export default LanguageSwitcher;