import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPassword.css'; // Импортируем новый CSS файл
import bgImage from '../assets/back.png'; // Предполагается то же фоновое изображение
import LanguageSwitcher from '../Login/Language.jsx'; // Предполагается наличие компонента LanguageSwitcher

// Переводы для разных языков
const translations = {
  ru: {
    languageName: 'RUS',
    header: 'Сброс пароля',
    emailLabel: 'Почта',
    emailPlaceholder: 'Введите вашу почту',
    sendCodeButton: 'Отправить код', // Добавлен перевод
    codeLabel: 'Код из сообщения',
    codePlaceholder: 'Введите код из сообщения',
    newPasswordLabel: 'Новый пароль',
    newPasswordPlaceholder: 'Введите новый пароль',
    resetButton: 'Сбросить пароль',
    backToLogin: 'Вернуться к входу',
    emailRequired: 'Поле почты обязательно для заполнения.',
    invalidEmailFormat: 'Введите корректный формат почты.',
    emailNotFound: 'Пользователь с такой почтой не найден.', // Добавлен перевод для email не найден
    codeRequired: 'Поле кода обязательно для заполнения.',
    newPasswordRequired: 'Поле нового пароля обязательно для заполнения.',
    resetSuccess: 'Пароль успешно сброшен!',
    resetFailed: 'Ошибка сброса пароля: ',
    networkError: 'Ошибка сети или сервера. Попробуйте позже.',
    codeSentSuccess: 'Код отправлен на вашу почту!', // Добавлен перевод
    codeSentFailed: 'Не удалось отправить код: ', // Добавлен перевод
    sendingCode: 'Отправка кода...', // Добавлен перевод
  },
  en: {
    languageName: 'ENG',
    header: 'Password Reset',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter your email',
    sendCodeButton: 'Send Code', // Added translation
    codeLabel: 'Code from message',
    codePlaceholder: 'Enter code from message',
    newPasswordLabel: 'New Password',
    newPasswordPlaceholder: 'Enter new password',
    resetButton: 'Reset Password',
    backToLogin: 'Back to Login',
    emailRequired: 'Email field is required.',
    invalidEmailFormat: 'Please enter a valid email format.',
    emailNotFound: 'User with this email not found.', // Added translation for email not found
    codeRequired: 'Code field is required.',
    newPasswordRequired: 'New password field is required.',
    resetSuccess: 'Password reset successful!',
    resetFailed: 'Password reset failed: ',
    networkError: 'Network or server error. Please try again later.',
    codeSentSuccess: 'Code sent to your email!', // Added translation
    codeSentFailed: 'Failed to send code: ', // Added translation
    sendingCode: 'Sending code...', // Added translation
  },
};

// Компонент страницы сброса пароля
function ForgotPasswordPage() {
  // Состояние для языка
  const [language, setLanguage] = useState('ru');
  // Получаем переводы на основе текущего языка
  const t = translations[language];

  // Хук для навигации
  const navigate = useNavigate();

  // Состояние для полей ввода
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Состояние для ошибок клиентской валидации
  const [errors, setErrors] = useState({});

  // Состояние для сообщения от сервера (для отдельного блока под кнопкой)
  const [serverMessage, setServerMessage] = useState(null);
  // Состояние для определения типа сообщения от сервера (успех или ошибка)
  const [isSuccess, setIsSuccess] = useState(false);
  // Состояние для управления видимостью блока сообщения от сервера
  const [showServerMessageBlock, setShowServerMessageBlock] = useState(false);

  // Состояние для отслеживания процесса отправки кода
  const [isSendingCode, setIsSendingCode] = useState(false);
  // Состояние для сообщения, связанного с отправкой кода
  const [sendCodeMessage, setSendCodeMessage] = useState(null);
  // Состояние для определения типа сообщения об отправке кода (успех или ошибка)
  const [isSendCodeSuccess, setIsSendCodeSuccess] = useState(false);
  // Состояние для управления видимостью блока сообщения об отправке кода
  const [showSendCodeMessageBlock, setShowSendCodeMessageBlock] = useState(false);

  // Состояние для управления видимостью кнопки отправки кода (для CSS класса)
  const [isSendCodeButtonVisible, setIsSendCodeButtonVisible] = useState(false);


  // Эффект для автоматического скрытия сообщений
  useEffect(() => {
    let timer;
    if ((serverMessage && showServerMessageBlock) || (sendCodeMessage && showSendCodeMessageBlock)) {
      timer = setTimeout(() => {
        setServerMessage(null);
        setShowServerMessageBlock(false);
        setSendCodeMessage(null);
        setShowSendCodeMessageBlock(false);
      }, 15000); // 15 секунд
    }
    return () => {
      clearTimeout(timer);
    };
  }, [serverMessage, showServerMessageBlock, sendCodeMessage, showSendCodeMessageBlock]);

  // Функция для смены языка
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  // Функция для клиентской валидации формы (для сброса пароля)
  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = t.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = t.invalidEmailFormat;
    }

    if (!code.trim()) newErrors.code = t.codeRequired;
    if (!newPassword.trim()) newErrors.newPassword = t.newPasswordRequired;

    setErrors(newErrors);
    setServerMessage(null);
    setShowServerMessageBlock(false);
    setSendCodeMessage(null); // Очищаем сообщение об отправке кода при валидации основной формы
    setShowSendCodeMessageBlock(false);

    return Object.keys(newErrors).length === 0;
  };

  // Функция для проверки формата email (наличие @ и .)
  const validateEmailFormat = (email) => {
    // Простая проверка на наличие '@' и '.'
    return email.includes('@') && email.includes('.');
  };

  // Обработчик изменения поля ввода почты
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    // Устанавливаем состояние видимости кнопки на основе формата email
    setIsSendCodeButtonVisible(validateEmailFormat(newEmail.trim()));
    // Очищаем ошибки, связанные с email, при вводе
    setErrors(prevErrors => ({ ...prevErrors, email: null }));
    setSendCodeMessage(null); // Очищаем сообщение об отправке кода
    setShowSendCodeMessageBlock(false);
  };


  // Обработчик отправки кода сброса пароля
  const handleSendCode = async () => {
    // Выполняем полную валидацию email перед отправкой кода
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = t.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = t.invalidEmailFormat;
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && !isSendingCode) {
      setIsSendingCode(true);
      setSendCodeMessage(t.sendingCode);
      setIsSendCodeSuccess(false); // Предполагаем неуспех, пока не подтверждено
      setShowSendCodeMessageBlock(true);
      setServerMessage(null); // Очищаем основное сообщение от сервера


      try {
        // TODO: Заменить на реальный API эндпоинт для отправки кода сброса пароля
        const response = await fetch('http://localhost:5000/api/send-reset-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim() }),
        });

        const data = await response.json();

        if (response.ok) {
          setSendCodeMessage(t.codeSentSuccess);
          setIsSendCodeSuccess(true);
          setShowSendCodeMessageBlock(true);
          console.log('Код сброса пароля успешно отправлен');
        } else {
          // Обрабатываем специфические ошибки, например, email не найден
          if (response.status === 404) { // Пример кода статуса для "не найдено"
            setSendCodeMessage(t.emailNotFound);
          } else {
            setSendCodeMessage(`${t.codeSentFailed}${data.error || 'Неизвестная ошибка'}`);
          }
          setIsSendCodeSuccess(false);
          setShowSendCodeMessageBlock(true);
        }
      } catch (error) {
        console.error('Ошибка при отправке кода:', error);
        setSendCodeMessage(t.networkError);
        setIsSendCodeSuccess(false);
        setShowSendCodeMessageBlock(true);
      } finally {
        setIsSendingCode(false);
      }
    }
  };


  // Обработчик отправки формы сброса пароля
  const handleSubmit = async (event) => {
    event.preventDefault();

    setServerMessage(null);
    setIsSuccess(false);
    setShowServerMessageBlock(false);
    setSendCodeMessage(null); // Очищаем сообщение об отправке кода при отправке основной формы
    setShowSendCodeMessageBlock(false);


    const isValid = validateForm();

    if (isValid) {
      const resetData = {
        email: email.trim(),
        code: code.trim(),
        newPassword: newPassword.trim(),
      };

      try {
        // TODO: Заменить на реальный API эндпоинт для сброса пароля
        const response = await fetch('http://localhost:5000/api/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resetData),
        });

        const data = await response.json();

        if (response.ok) {
          setServerMessage(t.resetSuccess);
          setIsSuccess(true);
          setShowServerMessageBlock(true);

          console.log('Пароль успешно сброшен');
          // Перенаправляем на главную страницу или страницу входа после успешного сброса
          // Согласно запросу пользователя, перенаправляем на 'main'. Рекомендуется перенаправлять на '/login'.
          navigate('/main');
        } else {
          setServerMessage(`${t.resetFailed}${data.error || 'Неизвестная ошибка'}`);
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
    <div className="forgot-password-page-container">
      <LanguageSwitcher
        language={language}
        onChangeLanguage={handleLanguageChange}
      />

      <div
        className="background"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="forgot-password-wrapper">
          <div className="forgot-password-header-block">
            <h2>{t.header}</h2>
          </div>

          <div className="forgot-password-content-block">
            <form onSubmit={handleSubmit}>
              {/* Группа ввода email с кнопкой отправки кода */}
              <div className="form-group">
                <label htmlFor="email">{t.emailLabel}</label>
                <div className="email-input-container"> {/* Контейнер для поля ввода и кнопки */}
                  <input
                    type="text"
                    id="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={handleEmailChange} // Используем новый обработчик
                  />
                  {/* Кнопка отправки кода всегда рендерится, видимость контролируется CSS классом */}
                  <button
                    type="button" // Используем type="button" для предотвращения отправки формы
                    className={`send-code-button ${isSendCodeButtonVisible ? 'send-code-button-visible' : ''}`} // Добавляем класс для анимации
                    onClick={handleSendCode}
                    disabled={isSendingCode || !isSendCodeButtonVisible} // Отключаем кнопку во время отправки или если она невидима
                    title={t.sendCodeButton} // Подсказка
                  >
                    {/* Иконка бумажного самолетика (встроенный SVG) */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-send"
                     >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
                {/* Отображение ошибки клиентской валидации для email */}
                {errors.email && <p className="client-error-message">{errors.email}</p>}
                {/* Отображение сообщения от сервера об отправке кода */}
                {sendCodeMessage && showSendCodeMessageBlock && (
                  <div className={isSendCodeSuccess ? 'server-message-block success' : 'server-message-block error'}>
                    <p>{sendCodeMessage}</p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="code">{t.codeLabel}</label>
                <input
                  type="text"
                  id="code"
                  placeholder={t.codePlaceholder}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                {errors.code && <p className="client-error-message">{errors.code}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">{t.newPasswordLabel}</label>
                <input
                  type="password"
                  id="newPassword"
                  placeholder={t.newPasswordPlaceholder}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {errors.newPassword && <p className="client-error-message">{errors.newPassword}</p>}
              </div>

              <button type="submit" className="reset-button">
                {t.resetButton}
              </button>

              {/* Основной блок сообщений от сервера */}
              {serverMessage && showServerMessageBlock && (
                <div className={isSuccess ? 'server-message-block success' : 'server-message-block error'}>
                  <p>{serverMessage}</p>
                </div>
              )}

            </form>

            <div className="forgot-password-links-container">
              <div className="back-to-login">
                <Link to="/" className="back-to-login-link-text">
                  {t.backToLogin}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
