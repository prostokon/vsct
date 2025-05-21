// Registration.jsx
import React, { useState, useEffect } from 'react'; // Импортируем useEffect
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import './Registration.css';
import bgImage from '../assets/back.png';

function RegistrationPage() {
  // Состояние для каждого поля ввода формы
  const [email, setEmail] = useState('');
  const [group, setGroup] = useState('');
  const [password, setPassword] = useState('');
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [patronymic, setPatronymic] = useState('');

  const navigate = useNavigate();

  // Состояние для хранения ошибок клиентской валидации формы (под полями ввода)
  const [errors, setErrors] = useState({});

  // Состояние для сообщения от сервера (для отдельного блока под кнопкой)
  const [serverMessage, setServerMessage] = useState(null);
  // Состояние для определения типа сообщения от сервера (успех или ошибка)
  const [isSuccess, setIsSuccess] = useState(false);

  // Состояние для управления видимостью блока сообщения от сервера
  const [showServerMessageBlock, setShowServerMessageBlock] = useState(false);

  // Эффект для автоматического скрытия сообщения от сервера
  useEffect(() => {
    let timer;
    // Если есть сообщение от сервера и блок должен быть показан
    if (serverMessage && showServerMessageBlock) {
      // Устанавливаем таймер на 15 секунд (15000 миллисекунд)
      timer = setTimeout(() => {
        setServerMessage(null); // Скрываем сообщение
        setShowServerMessageBlock(false); // Скрываем блок
      }, 15000);
    }

    // Функция очистки таймера при изменении serverMessage или showServerMessageBlock,
    // или при размонтировании компонента
    return () => {
      clearTimeout(timer);
    };
  }, [serverMessage, showServerMessageBlock]); // Зависимости эффекта

  // Функция для выполнения клиентской валидации формы
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) newErrors.email = 'Почта обязательна для заполнения.';
    if (!group.trim()) newErrors.group = 'Группа обязательна для заполнения.';
    if (!password.trim()) newErrors.password = 'Пароль обязателен для заполнения.';
    if (!surname.trim()) newErrors.surname = 'Фамилия обязательна для заполнения.';
    if (!name.trim()) newErrors.name = 'Имя обязательно для заполнения.';

    if (password && password.length < 8) {
      newErrors.password = 'Пароль должен быть не менее 8 символов.';
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Введите корректный формат почты.';
    }

    setErrors(newErrors);
    // Сбрасываем серверное сообщение и его видимость при новой валидации формы
    setServerMessage(null);
    setShowServerMessageBlock(false);

    return Object.keys(newErrors).length === 0;
  };

  // Асинхронный обработчик отправки формы
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Сбрасываем предыдущие сообщения от сервера и их видимость
    setServerMessage(null);
    setIsSuccess(false);
    setShowServerMessageBlock(false);

    const isValid = validateForm();

    if (isValid) {
      const userData = {
        email: email.trim(),
        group: group.trim(),
        password: password.trim(),
        surname: surname.trim(),
        name: name.trim(),
        patronymic: patronymic.trim(),
      };

      try {
        const response = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.ok) {
          setServerMessage('Регистрация прошла успешно!');
          setIsSuccess(true);
          setShowServerMessageBlock(true); // Показываем блок успешного сообщения
          navigate('/'); // Перенаправляем на страницу логина после успешной регистрации
        } else {
          setServerMessage(`Ошибка регистрации: ${data.error || 'Неизвестная ошибка'}`);
          setIsSuccess(false);
          setShowServerMessageBlock(true); // Показываем блок сообщения об ошибке
        }
      } catch (error) {
        console.error('Ошибка при отправке данных:', error);
        setServerMessage('Произошла ошибка при попытке регистрации. Возможно, сервер недоступен.');
        setIsSuccess(false);
        setShowServerMessageBlock(true); // Показываем блок сообщения об ошибке
      }
    }
  };

  return (
    <div className="background" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="reg-wrapper">
        <div className="reg-header-block">
          <h2>Регистрация</h2>
        </div>
        <div className="reg-content-block">
          <form onSubmit={handleSubmit}>

            {/* Поля ввода и их ошибки */}
            <div className="form-group">
              <label htmlFor="mail">Почта *</label>
              <input
                type="text"
                id="mail"
                placeholder="Введите почту"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {/* Ошибки клиентской валидации отображаются под соответствующим полем */}
              {errors.email && <p className="client-error-message">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="group">Группа *</label>
              <input
                type="text"
                id="group"
                placeholder="Введите группу"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              />
              {errors.group && <p className="client-error-message">{errors.group}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль *</label>
              <input
                type="password"
                id="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="client-error-message">{errors.password}</p>}
            </div>

            <div className='form-group fio-group'>
              <div className="fio-item">
                <label htmlFor='surname'>Фамилия *</label>
                <input
                  type='text'
                  id='surname'
                  placeholder='Введите фамилию'
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                />
                {errors.surname && <p className="client-error-message">{errors.surname}</p>}
              </div>
              <div className="fio-item">
                <label htmlFor='name'>Имя *</label>
                <input
                  type='text'
                  id='name'
                  placeholder='Введите имя'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="client-error-message">{errors.name}</p>}
              </div>
              <div className="fio-item">
                <label htmlFor='patronymic'>Отчество</label>
                <input
                  type='text'
                  id='patronymic'
                  placeholder='Введите отчество'
                  value={patronymic}
                  onChange={(e) => setPatronymic(e.target.value)}
                />
                {/* Для отчества нет обязательной валидации */}
              </div>
            </div>

            {/* Кнопка отправки формы */}
            <button type="submit" className="reg-button">
              Зарегистрироваться
            </button>

            {/* Блок для отображения сообщений от сервера */}
            {/* Отображается только если есть serverMessage И showServerMessageBlock === true */}
            {serverMessage && showServerMessageBlock && (
              <div className={isSuccess ? 'server-message-block success' : 'server-message-block error'}>
                <p>{serverMessage}</p>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistrationPage;