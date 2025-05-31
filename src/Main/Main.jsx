// A:\vsct\src\Main\Main.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate для навигации
import FilterComponent from './Filter'; // Компонент для фильтрации
import IdeasGrid from './Ideas'; // Компонент для отображения сетки идей
import SearchBar from './SearchBar'; // Компонент для поиска
import Profile from './Profile'; // Компонент для отображения профиля пользователя
import IdeaCreationModal from './IdeaCreationModal'; // Модальное окно для создания идеи
import ProfileEditModal from './ProfileEditModal'; // Модальное окно для редактирования профиля
import './desktop.css'; // Стили для десктопной версии
import './mobile.css'; // Стили для мобильной версии
import './modal.css'; // Стили для модальных окон
import bgImage from '../assets/back.png'; // Фоновое изображение
// Иконки из библиотеки react-icons
import { BiMenu, BiNote, BiGroup, BiCaretDownSquare, BiPencil, BiFolder, BiFilterAlt, BiExit } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';

function MainPage() {
  const navigate = useNavigate(); // Инициализируем хук для навигации

  // Состояния для фильтров и поискового запроса
  const [activeFilters, setActiveFilters] = useState({
    status: null, // Активный фильтр по статусу
    state: null   // Активный фильтр по состоянию
  });
  const [searchQuery, setSearchQuery] = useState(''); // Текущий поисковый запрос

  // Состояние для управления видимостью мобильной боковой панели
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Состояние для данных текущего пользователя
  const [currentUser, setCurrentUser] = useState(null);

  // Состояние для управления видимостью модального окна создания идеи
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);

  // Состояние для управления видимостью модального окна редактирования профиля
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);

  // Эффект для загрузки данных пользователя из localStorage при монтировании компонента
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser'); // Получаем данные пользователя из localStorage
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser); // Парсим JSON-строку в объект
        setCurrentUser(user); // Устанавливаем текущего пользователя
        console.log('Данные пользователя загружены из localStorage:', user);
      } catch (error) {
        console.error('Ошибка парсинга данных пользователя из localStorage:', error);
        localStorage.removeItem('loggedInUser'); // Удаляем некорректные данные из localStorage
      }
    } else {
      console.log('Данные пользователя не найдены в localStorage.');
    }
  }, []); // Пустой массив зависимостей означает, что эффект выполнится один раз при монтировании

  // Обработчик изменения фильтров
  const handleFilterChange = (filters) => {
    setActiveFilters({
      status: filters.group1, // Обновляем фильтр по статусу
      state: filters.group2   // Обновляем фильтр по состоянию
    });
  };

  // Обработчик изменения поискового запроса
  const handleSearchChange = (query) => {
    setSearchQuery(query); // Обновляем поисковый запрос
  };

  // Функция для переключения состояния мобильной боковой панели (открыть/закрыть)
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Функция для открытия модального окна создания идеи
  const openIdeaModal = () => {
    setIsIdeaModalOpen(true);
  };

  // Функция для закрытия модального окна создания идеи
  const closeIdeaModal = () => {
    setIsIdeaModalOpen(false);
  };

  // Функция для открытия модального окна редактирования профиля
  const openProfileEditModal = () => {
    setIsProfileEditModalOpen(true);
  };

  // Функция для закрытия модального окна редактирования профиля
  const closeProfileEditModal = () => {
    setIsProfileEditModalOpen(false);
  };

  return (
    <div className="app-container"> {/* Основной контейнер приложения */}
      <div className="background" style={{ backgroundImage: `url(${bgImage})` }}> {/* Фон страницы */}
        {/* Кнопка для открытия/закрытия мобильной боковой панели */}
        <button className="mobile-sidebar-toggle-button" onClick={toggleMobileSidebar}>
          <BiFilterAlt size={24} /> {/* Иконка фильтра */}
        </button>

        {/* Мобильная боковая панель (отображается, если isMobileSidebarOpen === true) */}
        {isMobileSidebarOpen && (
          <div className="mobile-sidebar-overlay"> {/* Оверлей для затемнения остального контента */}
            <div className="mobile-sidebar"> {/* Сама боковая панель */}
              <button className="mobile-sidebar-close-button" onClick={toggleMobileSidebar}>
                <IoClose size={24} /> {/* Иконка закрытия */}
              </button>
              {/* Отображаем профиль пользователя, если данные загружены */}
              {currentUser && <Profile user={currentUser} onProfileClick={openProfileEditModal} />} {/* Передаем обработчик клика по профилю */}
              {/* Компонент фильтров */}
              <FilterComponent onFilterChange={handleFilterChange} />
            </div>
          </div>
        )}

        {/* Основной контейнер для десктопной раскладки */}
        <div className="desktop-layout-container">
          {/* Колонка с кнопками навигации */}
          <div className="button-column">
            <div className="rounded-button-group"> {/* Группа кнопок */}
              <button onClick={() => navigate('/')} title="Выход"><BiExit size={20} /></button> {/* Предполагается, что '/' валидный маршрут (например, главная страница) */}
              <button className="active" onClick={() => navigate('/main')} title="Идеи"><BiNote size={20} /></button> {/* Кнопка "Идеи", активна на этой странице */}
              <button onClick={() => navigate('/teams')} title="Команды"><BiGroup size={20} /></button> {/* Кнопка "Команды" */}
              <button onClick={openIdeaModal} title="Создать идею"><BiPencil size={20} /></button> {/* Кнопка "Создать идею" */}
            </div>
          </div>

          {/* Центральная колонка с основным контентом */}
          <div className="central-content-column">
            <div className="search-ideas-container"> {/* Контейнер для поиска и идей */}
              {/* Компонент поиска */}
              <SearchBar searchQuery={searchQuery} setSearchQuery={handleSearchChange} />
              {/* Сетка для отображения идей */}
              <IdeasGrid activeFilters={activeFilters} searchQuery={searchQuery} />
            </div>
          </div>

          {/* Правая боковая панель */}
          <div className="right-sidebar">
            {/* Отображаем профиль пользователя, если данные загружены */}
            {currentUser && <Profile user={currentUser} onProfileClick={openProfileEditModal} />} {/* Передаем обработчик клика по профилю */}
            {/* Компонент фильтров */}
            <FilterComponent onFilterChange={handleFilterChange} />
          </div>
        </div>
      </div>

      {/* Модальное окно создания идеи (отображается, если isIdeaModalOpen === true) */}
      {isIdeaModalOpen && <IdeaCreationModal onClose={closeIdeaModal} currentUser={currentUser} />}
      {/* Модальное окно редактирования профиля (отображается, если isProfileEditModalOpen === true) */}
      {isProfileEditModalOpen && <ProfileEditModal onClose={closeProfileEditModal} currentUser={currentUser} />}
    </div>
  );
}

export default MainPage;
