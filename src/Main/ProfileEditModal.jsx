// ProfileEditModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { BiArrowBack, BiCheck, BiPencil, BiSave } from 'react-icons/bi';
import MultiSelectDropdown from './MultiSelectDropdown'; // Импортируем новый компонент

function ProfileEditModal({ onClose, currentUser }) {
  // Локальные состояния для полей профиля
  const [email, setEmail] = useState(currentUser?.email || '');
  const [name, setName] = useState(currentUser?.name || '');
  const [surname, setSurname] = useState(currentUser?.surname || '');
  const [group, setGroup] = useState(currentUser?.group_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [patronymic, setPatronymic] = useState(currentUser?.patronymic || '');

  // Форматируем дату регистрации, используя currentUser.created_at
  const initialRegistrationDate =
    currentUser?.created_at && currentUser.created_at !== ''
      ? new Date(currentUser.created_at).toLocaleDateString('ru-RU')
      : 'Неизвестно';
  const [registrationDate, setRegistrationDate] = useState(initialRegistrationDate);
const toggleEditMode = (field) => {
  const setters = {
    email: setIsEmailEditable,
    name: setIsNameEditable,
    surname: setIsSurnameEditable,
    patronymic: setIsPatronymicEditable,
    group: setIsGroupEditable,
    phone: setIsPhoneEditable,
  };
  setters[field]?.((prev) => !prev);
};
  // Состояния для управления режимом редактирования каждого поля
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [isNameEditable, setIsNameEditable] = useState(false);
  const [isSurnameEditable, setIsSurnameEditable] = useState(false);
  const [isGroupEditable, setIsGroupEditable] = useState(false);
  const [isPhoneEditable, setIsPhoneEditable] = useState(false);
  const [isPatronymicEditable, setIsPatronymicEditable] = useState(false);
  const [userIdeas, setUserIdeas] = useState([]);

useEffect(() => {
  const fetchUserIdeas = async () => {
    if (!currentUser?.id) return;
    try {
      const response = await fetch(`http://localhost:5000/api/ideas?user_id=${currentUser.id}`);      if (!response.ok) throw new Error('Не удалось загрузить идеи пользователя');
      const data = await response.json();
      setUserIdeas(data.ideas || []);
    } catch (err) {
      setUserIdeas([]);
    }
  };
  fetchUserIdeas();
}, [currentUser]);

  // Состояния для компетенций
  const [allCompetencies, setAllCompetencies] = useState({}); // Все доступные компетенции, сгруппированные по типам
  const [userSelectedCompetencyIds, setUserSelectedCompetencyIds] = useState([]); // ID компетенций, выбранных пользователем с сервера

  // Отдельные состояния для выбранных компетенций по категориям
  const [selectedDevLanguages, setSelectedDevLanguages] = useState([]);
  const [selectedDatabases, setSelectedDatabases] = useState([]);
  const [selectedFrameworks, setSelectedFrameworks] = useState([]);
  const [selectedDevopsTech, setSelectedDevopsTech] = useState([]);

  // СОСТОЯНИЕ ДЛЯ АВАТАРА
  // Используем currentUser.avatar_url, если он есть, иначе заглушку
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(
    currentUser?.avatar_url ? `http://localhost:5000${currentUser.avatar_url}` : 'https://placehold.co/100x100/A0A0A0/FFFFFF?text=AVATAR'
  );
  const fileInputRef = useRef(null); // Реф для скрытого input type="file"
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null); // Для хранения выбранного файла аватара

  // Реф для отслеживания состояния закрытия и ссылки на элемент контента
  const isClosing = useRef(false);
  const contentRef = useRef(null);

  // Эффект для добавления класса 'open' к оверлею с задержкой при монтировании
  useEffect(() => {
    const overlay = document.querySelector('.profile-edit-modal-overlay');
    if (overlay) {
      const timer = setTimeout(() => {
        overlay.classList.add('open');
      }, 10);
      return () => {
        clearTimeout(timer);
      };
    } else {
      console.warn("Элемент .profile-edit-modal-overlay не найден при монтировании ProfileEditModal.");
    }
  }, []);

  // Эффект для добавления слушателя события transitionend
  useEffect(() => {
    const contentElement = contentRef.current;
    const handleTransitionEnd = (event) => {
      if (event.propertyName === 'transform' && isClosing.current) {
        onClose();
        isClosing.current = false;
      }
    };

    if (contentElement) {
      contentElement.addEventListener('transitionend', handleTransitionEnd);
    }
    return () => {
      if (contentElement) {
        contentElement.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
  }, [onClose]);

  const handleCloseWithAnimation = () => {
    if (isClosing.current) return;
    isClosing.current = true;
    const overlay = document.querySelector('.profile-edit-modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
    } else {
      onClose();
      isClosing.current = false;
    }
  };

  // useEffect для загрузки всех компетенций и компетенций пользователя
  useEffect(() => {
    const fetchCompetencies = async () => {
      try {
        // Загружаем все доступные компетенции
        const allCompsResponse = await fetch('http://localhost:5000/api/competencies');
        if (!allCompsResponse.ok) throw new Error('Не удалось загрузить список компетенций');
        const allCompsData = await allCompsResponse.json();
        setAllCompetencies(allCompsData);
        console.log('Все компетенции:', allCompsData);

        // Загружаем компетенции текущего пользователя
        if (currentUser && currentUser.id) {
          const userCompsResponse = await fetch(`http://localhost:5000/api/users/${currentUser.id}/competencies`);
          if (!userCompsResponse.ok) throw new Error('Не удалось загрузить компетенции пользователя');
          const userCompsData = await userCompsResponse.json();
          setUserSelectedCompetencyIds(userCompsData);
          console.log('Компетенции пользователя:', userCompsData);
        }

      } catch (error) {
        console.error('Ошибка загрузки компетенций:', error);
        // Можно показать сообщение об ошибке пользователю
      }
    };

    fetchCompetencies();
  }, [currentUser]); // Перезагружаем при изменении currentUser

  // ИНИЦИАЛИЗАЦИЯ ВЫБРАННЫХ КОМПЕТЕНЦИЙ ПОЛЬЗОВАТЕЛЯ ПО КАТЕГОРИЯМ ПРИ ЗАГРУЗКЕ
  useEffect(() => {
    if (Object.keys(allCompetencies).length > 0 && userSelectedCompetencyIds.length > 0) {
        const langIds = [];
        const dbIds = [];
        const fwIds = [];
        const devopsIds = [];

        // Создаем Map для быстрого доступа к типу компетенции по ее ID
        const competencyIdToTypeMap = new Map();
        Object.entries(allCompetencies).forEach(([type_name, competencies]) => {
            competencies.forEach(comp => {
                competencyIdToTypeMap.set(comp.id, type_name);
            });
        });

        userSelectedCompetencyIds.forEach(selectedId => {
            const typeName = competencyIdToTypeMap.get(selectedId);
            if (typeName) {
                if (typeName === 'Языки программирования') langIds.push(selectedId);
                else if (typeName === 'Базы данных') dbIds.push(selectedId);
                else if (typeName === 'Фреймворки') fwIds.push(selectedId);
                else if (typeName === 'DevOps Технологии') devopsIds.push(selectedId);
            }
        });

        setSelectedDevLanguages(langIds);
        setSelectedDatabases(dbIds);
        setSelectedFrameworks(fwIds);
        setSelectedDevopsTech(devopsIds);
    }
  }, [allCompetencies, userSelectedCompetencyIds]);


  // Вспомогательная функция для сортировки компетенций: выбранные сначала, затем остальные
  const sortCompetencies = (competencies, selectedIds) => {
    if (!competencies) return [];

    const selectedSet = new Set(selectedIds);
    const selected = [];
    const unselected = [];

    competencies.forEach(comp => {
      if (selectedSet.has(comp.id)) {
        selected.push(comp);
      } else {
        unselected.push(comp);
      }
    });

    // Сортируем выбранные и невыбранные компетенции по имени (алфавитный порядок)
    selected.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    unselected.sort((a, b) => a.name.localeCompare(b.name, 'ru'));

    return [...selected, ...unselected];
  };

  // НОВАЯ ФУНКЦИЯ: Обработчик изменения файла аватара
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedAvatarFile(file); // Сохраняем файл в состоянии
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreviewUrl(reader.result); // Устанавливаем Base64 для предпросмотра
      };
      reader.readAsDataURL(file); // Читаем файл как Base64
    }
  };

  // Обработчик сохранения данных профиля
  const handleSave = async () => {
    try {
      let newAvatarUrl = currentUser?.avatar_url; // Исходный URL аватара пользователя

      // 0. Загрузка нового аватара, если он был выбран
      if (selectedAvatarFile) {
        const formData = new FormData();
        formData.append('avatar', selectedAvatarFile); // 'avatar' должно соответствовать имени поля в Multer

        const uploadResponse = await fetch('http://localhost:5000/api/upload-avatar', {
          method: 'POST',
          body: formData, // FormData автоматически устанавливает Content-Type
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Не удалось загрузить аватар.');
        }
        const uploadResult = await uploadResponse.json();
        newAvatarUrl = uploadResult.avatarUrl; // Получаем новый URL аватара с сервера
        console.log('Аватар успешно загружен, URL:', newAvatarUrl);
      }

      // 1. Сохранение основной информации пользователя (включая новый URL аватара, если он есть)
      const userUpdatePayload = {
        email,
        group_name: group,
        name,
        surname,
        patronymic,
        phone,
      };

      if (newAvatarUrl !== currentUser?.avatar_url) { // Если URL аватара изменился
        userUpdatePayload.avatar_url = newAvatarUrl;
      }

      const userUpdateResponse = await fetch(`http://localhost:5000/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userUpdatePayload),
      });

      if (!userUpdateResponse.ok) {
        const errorData = await userUpdateResponse.json();
        throw new Error(errorData.error || 'Не удалось обновить основные данные профиля.');
      }

      const userUpdateResult = await userUpdateResponse.json();
      console.log('Основные данные профиля успешно обновлены:', userUpdateResult.user);

      // 2. Сохранение компетенций пользователя
      const allSelectedCompetencyIdsToSend = [
        ...selectedDevLanguages,
        ...selectedDatabases,
        ...selectedFrameworks,
        ...selectedDevopsTech
      ];

      const competenciesUpdateResponse = await fetch(`http://localhost:5000/api/users/${currentUser.id}/competencies`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedCompetencyIds: allSelectedCompetencyIdsToSend }),
      });

      if (!competenciesUpdateResponse.ok) {
        const errorData = await competenciesUpdateResponse.json();
        throw new Error(errorData.error || 'Не удалось обновить компетенции.');
      }

      console.log('Компетенции успешно обновлены!');

      // Обновляем localStorage с новыми данными пользователя
      const updatedUser = {
        ...currentUser,
        email: userUpdateResult.user.email,
        name: userUpdateResult.user.name,
        surname: userUpdateResult.user.surname,
        group_name: userUpdateResult.user.group_name,
        phone: userUpdateResult.user.phone,
        patronymic: userUpdateResult.user.patronymic,
        avatar_url: userUpdateResult.user.avatar_url // Обновляем avatar_url из ответа сервера
      };
      localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));


      handleCloseWithAnimation();
    } catch (err) {
      console.error('Ошибка сохранения профиля:', err);
      alert(err.message || 'Произошла ошибка при сохранении данных.');
    }
  };

  const userTypeName = currentUser?.user_type_id === 1 ? 'Студент' : 'Преподаватель';
  const displayFullName = `${currentUser?.name || 'Имя'} ${currentUser?.surname || 'Фамилия'}`;

  // Консольный вывод для отладки
  console.log('currentUser в ProfileEditModal:', currentUser);
  console.log('currentUser.created_at:', currentUser?.created_at);
  console.log('registrationDate (после форматирования):', registrationDate);
  console.log('Все доступные компетенции (allCompetencies):', allCompetencies);
  console.log('Выбранные языки разработки:', selectedDevLanguages);
  console.log('Выбранные базы данных:', selectedDatabases);
  console.log('Выбранные фреймворки:', selectedFrameworks);
  console.log('Выбранные DevOps технологии:', selectedDevopsTech);


  return (
    <div className="modal-overlay profile-edit-modal-overlay" onClick={handleCloseWithAnimation}>
      <div className="modal-content profile-edit-modal-content" ref={contentRef} onClick={(e) => e.stopPropagation()}>
        <button className="modal-back-button" onClick={handleCloseWithAnimation}>
          <BiArrowBack size={20} />
          Назад
        </button>
        <button className="modal-save-button" onClick={handleSave}>
          <BiCheck size={22} />
        </button>

        {/* Заголовок профиля */}
        <div className="profile-edit-header-block">
          {/* НОВЫЙ БЛОК: Аватар пользователя */}
          <div className="profile-avatar-wrapper" onClick={() => fileInputRef.current.click()}>
            <img src={avatarPreviewUrl} alt="Аватар пользователя" className="profile-avatar" />
            <div className="profile-avatar-overlay">
              <BiPencil size={24} className="profile-avatar-edit-icon" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <h2>
            {displayFullName} - {userTypeName}
          </h2>
        </div>

        {/* Основные блоки содержимого - Flex-контейнер для двух колонок */}
        <div className="profile-edit-main-content">
          {/* Левая колонка: Изменение информации */}
          <div className="profile-info-block">
            <h3>Изменение информации</h3>
            <div className="profile-input-group">
              <label htmlFor="email">Почта</label>
              <div className="input-with-edit-button">
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!isEmailEditable}
                  className={isEmailEditable ? '' : 'read-only'}
                />
                <button
                  className="edit-field-button"
                  onClick={() => toggleEditMode('email')}
                >
                  {isEmailEditable ? <BiSave size={18} /> : <BiPencil size={18} />}
                </button>
              </div>
            </div>
            <div className="profile-input-group">
              <label htmlFor="name">Имя</label>
              <div className="input-with-edit-button">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  readOnly={!isNameEditable}
                  className={isNameEditable ? '' : 'read-only'}
                />
                <button
                  className="edit-field-button"
                  onClick={() => toggleEditMode('name')}
                >
                  {isNameEditable ? <BiSave size={18} /> : <BiPencil size={18} />}
                </button>
              </div>
            </div>
            <div className="profile-input-group">
              <label htmlFor="surname">Фамилия</label>
              <div className="input-with-edit-button">
                <input
                  type="text"
                  id="surname"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  readOnly={!isSurnameEditable}
                  className={isSurnameEditable ? '' : 'read-only'}
                />
                <button
                  className="edit-field-button"
                  onClick={() => toggleEditMode('surname')}
                >
                  {isSurnameEditable ? <BiSave size={18} /> : <BiPencil size={18} />}
                </button>
              </div>
            </div>
            <div className="profile-input-group">
              <label htmlFor="patronymic">Отчество</label>
              <div className="input-with-edit-button">
                <input
                  type="text"
                  id="patronymic"
                  value={patronymic}
                  onChange={(e) => setPatronymic(e.target.value)}
                  readOnly={!isPatronymicEditable}
                  className={isPatronymicEditable ? '' : 'read-only'}
                />
                <button
                  className="edit-field-button"
                  onClick={() => toggleEditMode('patronymic')}
                >
                  {isPatronymicEditable ? <BiSave size={18} /> : <BiPencil size={18} />}
                </button>
              </div>
            </div>
            <div className="profile-input-group">
              <label htmlFor="group">Группа</label>
              <div className="input-with-edit-button">
                <input
                  type="text"
                  id="group"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  readOnly={!isGroupEditable}
                  className={isGroupEditable ? '' : 'read-only'}
                />
                <button
                  className="edit-field-button"
                  onClick={() => toggleEditMode('group')}
                >
                  {isGroupEditable ? <BiSave size={18} /> : <BiPencil size={18} />}
                </button>
              </div>
            </div>
            <div className="profile-input-group">
              <label htmlFor="phone">Телефон</label>
              <div className="input-with-edit-button">
                <input
                  type="text"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  readOnly={!isPhoneEditable}
                  className={isPhoneEditable ? '' : 'read-only'}
                />
                <button
                  className="edit-field-button"
                  onClick={() => toggleEditMode('phone')}
                >
                  {isPhoneEditable ? <BiSave size={18} /> : <BiPencil size={18} />}
                </button>
              </div>
            </div>
            {/* ПОЛЕ: Дата регистрации - всегда неизменяемо */}
            <div className="profile-input-group">
              <label htmlFor="registrationDate">Дата регистрации</label>
              <div className="input-with-edit-button">
                <input
                  type="text"
                  id="registrationDate"
                  value={registrationDate}
                  readOnly={true} // Всегда readOnly
                  className={'read-only'} // Всегда read-only стиль
                />
                {/* Кнопка редактирования удалена */}
              </div>
            </div>
          </div>

          {/* Правая колонка: Компетенции, Идеи, Портфолио */}
          <div className="profile-additional-blocks">
            {/* Блок Компетенции */}
            <div className="profile-competencies-block">
              <h3>Компетенции</h3>
              <div className="competencies-column"> {/* Левая колонка для компетенций */}
                {/* Языки разработки */}
                <MultiSelectDropdown
                  label="Языки разработки"
                  options={sortCompetencies(allCompetencies['Языки программирования'], selectedDevLanguages)}
                  selectedValues={selectedDevLanguages}
                  onChange={setSelectedDevLanguages}
                />
                {/* Фреймворки */}
                <MultiSelectDropdown
                  label="Фреймворки"
                  options={sortCompetencies(allCompetencies['Фреймворки'], selectedFrameworks)}
                  selectedValues={selectedFrameworks}
                  onChange={setSelectedFrameworks}
                />
              </div>
              <div className="competencies-column"> {/* Правая колонка для компетенций */}
                {/* Базы данных */}
                <MultiSelectDropdown
                  label="Базы данных"
                  options={sortCompetencies(allCompetencies['Базы данных'], selectedDatabases)}
                  selectedValues={selectedDatabases}
                  onChange={setSelectedDatabases}
                />
                {/* DevOps технологии */}
                <MultiSelectDropdown
                  label="DevOps Технологии"
                  options={sortCompetencies(allCompetencies['DevOps Технологии'], selectedDevopsTech)}
                  selectedValues={selectedDevopsTech}
                  onChange={setSelectedDevopsTech}
                />
              </div>
            </div>

<div className="profile-ideas-block">
  <h3>Мои идеи</h3>
  <div
    className="user-ideas-list"
    style={{
      maxHeight: 120,
      overflowY: 'auto',
      background: '#f7f7fa',
      borderRadius: 8,
      padding: 8,
    }}
  >
    {userIdeas.length === 0 ? (
      <div className="placeholder-block">
        <p>У вас пока нет идей</p>
      </div>
    ) : (
      userIdeas.map((idea, idx) => (
        <div
          key={idea.id}
          className="user-idea-item"
          style={{
            padding: '4px 0',
            borderBottom: idx < userIdeas.length - 1 ? '1px solid #e0e0e0' : 'none',
          }}
        >
          <span style={{ fontWeight: 500 }}>{idea.title}</span>
        </div>
      ))
    )}
  </div>
</div>

            {/* Блок Портфолио */}
            <div className="profile-portfolio-block">
              <h3>Портфолио</h3>
              <input type="text" placeholder="Поиск по портфолио..." className="portfolio-search-input" />
              <div className="placeholder-block">
                <p>Название команды: [заполнитель]</p>
                <p>Дата создания команды: [заполнитель]</p>
                <p>Дата расформирования команды: [заполнитель]</p>
                <p>Роль в команде: [заполнитель]</p>
              </div>
            </div>
          </div>
        </div>

        {/* Блок результатов тестирования */}
        <div className="profile-test-results-block">
          <h3>Результаты тестирования</h3>
          <div className="test-table-placeholder">
            <h4>Тест Белбина</h4>
            <p>Заполнитель для таблицы результатов Теста Белбина</p>
          </div>
          <div className="test-table-placeholder">
            <h4>Айзенка личностный опросник</h4>
            <p>Заполнитель для таблицы результатов Опросника Айзенка</p>
          </div>
          <div className="test-table-placeholder">
            <h4>Опросник "Стиль мышления"</h4>
            <p>Заполнитель для таблицы результатов Опросника "Стиль мышления"</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileEditModal;
