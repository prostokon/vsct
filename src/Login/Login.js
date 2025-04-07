import React, { useState } from 'react';
import './Login.css';
import bgImage from './assets/back.png';
import LanguageSwitcher from './Language';

const translations = {
  ru: {
    languageName: 'RUS',
    header: 'Авторизация',
    loginLabel: 'Логин',
    passwordLabel: 'Пароль',
    loginPlaceholder: 'Введите логин',
    passwordPlaceholder: 'Введите пароль',
    loginButton: 'Войти',
    forgotPassword: 'Забыли пароль?',
  },
  en: {
    languageName: 'ENG',
    header: 'Authorization',
    loginLabel: 'Login',
    passwordLabel: 'Password',
    loginPlaceholder: 'Enter login',
    passwordPlaceholder: 'Enter password',
    loginButton: 'Log in',
    forgotPassword: 'Forgot password?',
  },
};

function LoginPage() {
  const [language, setLanguage] = useState('ru');
  const t = translations[language];

  // Функция для смены языка
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  return (
    <div className="login-page-container">
      {/* Передаём текущее значение языка и функцию для смены */}
      <LanguageSwitcher
        language={language}
        onChangeLanguage={handleLanguageChange}
      />

      <div
        className="background"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="login-wrapper">
          <div className="login-header-block">
            <h2>{t.header}</h2>
          </div>

          <div className="login-content-block">
            <form>
              <div className="form-group">
                <label htmlFor="login">{t.loginLabel}</label>
                <input
                  type="text"
                  id="login"
                  placeholder={t.loginPlaceholder}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">{t.passwordLabel}</label>
                <input
                  type="password"
                  id="password"
                  placeholder={t.passwordPlaceholder}
                />
              </div>

              <button type="submit" className="login-button">
                {t.loginButton}
              </button>
            </form>

            <div className="forgot-password">
              <a href="#!">{t.forgotPassword}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
