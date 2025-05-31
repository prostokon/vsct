// Login.jsx
import React, { useState,useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import bgImage from '../assets/back.png';
import LanguageSwitcher from './Language.jsx';

// Переводы для разных языков
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
    registrationLink: 'Зарегистрироваться',
    emailRequired: 'Поле email обязательно для заполнения.',
    invalidEmailFormat: 'Введите корректный формат email.',
    passwordRequired: 'Поле пароль обязательно для заполнения.',
    loginSuccess: 'Вход выполнен успешно!',
    loginFailed: 'Ошибка входа: ',
    networkError: 'Ошибка сети или сервера. Попробуйте позже.',
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
    registrationLink: 'Register',
    emailRequired: 'Email field is required.',
    invalidEmailFormat: 'Please enter a valid email format.',
    passwordRequired: 'Password field is required.',
    loginSuccess: 'Login successful!',
    loginFailed: 'Login failed: ',
    networkError: 'Network or server error. Please try again later.',
  },
};

// Компонент страницы авторизации
function LoginPage() {
  // Состояние для текущего языка
  const [language, setLanguage] = useState('ru');
  // Получаем переводы на основе текущего языка
  const t = translations[language];

  // Хук для навигации
  const navigate = useNavigate();

  // Состояния для полей ввода
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Состояние для ошибок валидации на клиенте
  const [errors, setErrors] = useState({});

  // Состояние для серверного сообщения (отдельный блок под кнопкой)
  const [serverMessage, setServerMessage] = useState(null);
  // Состояние, определяющее тип серверного сообщения (успех или ошибка)
  const [isSuccess, setIsSuccess] = useState(false);
  // Состояние для управления отображением блока серверного сообщения
  const [showServerMessageBlock, setShowServerMessageBlock] = useState(false);

  // Эффект для автоматического скрытия серверного сообщения
  useEffect(() => {
    let timer;
    if (serverMessage && showServerMessageBlock) {
      timer = setTimeout(() => {
        setServerMessage(null);
        setShowServerMessageBlock(false);
      }, 15000); // 15 секунд
    }
    return () => {
      clearTimeout(timer);
    };
  }, [serverMessage, showServerMessageBlock]);

  // Функция для смены языка
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  // Функция валидации формы на клиенте
  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = t.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = t.invalidEmailFormat;
    }

    if (!password.trim()) newErrors.password = t.passwordRequired;

    setErrors(newErrors);
    setServerMessage(null);
    setShowServerMessageBlock(false);

    return Object.keys(newErrors).length === 0;
  };

  // Обработчик отправки формы авторизации
  const handleSubmit = async (event) => {
    event.preventDefault();

    setServerMessage(null);
    setIsSuccess(false);
    setShowServerMessageBlock(false);

    const isValid = validateForm();

    if (isValid) {
      const credentials = {
        email: email.trim(),
        password: password.trim(),
      };

      try {
        const response = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (response.ok) {
          setServerMessage(t.loginSuccess);
          setIsSuccess(true);
          setShowServerMessageBlock(true);

          // ДОБАВЛЕНО: Консольный вывод объекта пользователя, полученного с сервера
          console.log('Данные пользователя, полученные с сервера после входа:', data.user);

          localStorage.setItem('loggedInUser', JSON.stringify(data.user));
          navigate('main'); // Переход на главную страницу после успешного входа
        } else {
          setServerMessage(`${t.loginFailed}${data.error || 'Unknown error'}`);
          setIsSuccess(false);
          setShowServerMessageBlock(true);
        }
      } catch (error) {
        console.error('Ошибка при отправке данных:', error);
        setServerMessage(t.networkError);
        setIsSuccess(false);
        setShowServerMessageBlock(true);
      }
    }
  };

  return (
    <div className="login-page-container">
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
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">{t.loginLabel}</label>
                <input
                  type="text"
                  id="email"
                  placeholder={t.loginPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="client-error-message">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="password">{t.passwordLabel}</label>
                <input
                  type="password"
                  id="password"
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="client-error-message">{errors.password}</p>}
              </div>

              <button type="submit" className="login-button">
                {t.loginButton}
              </button>

              {serverMessage && showServerMessageBlock && (
                <div className={isSuccess ? 'server-message-block success' : 'server-message-block error'}>
                  <p>{serverMessage}</p>
                </div>
              )}

            </form>

            <div className="login-links-container">
              <div className="forgot-password">
                <Link to="/fp" className="forgot-password-link-text">
                  {t.forgotPassword}
                </Link>
              </div>

              <div className="registration-link">
                <Link to="/registration" className="registration-link-text">
                  {t.registrationLink}
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
