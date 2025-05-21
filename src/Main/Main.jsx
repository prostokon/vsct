import React, { useState, useEffect } from 'react';
import FilterComponent from './Filter';
import IdeasGrid from './Ideas';
import SearchBar from './SearchBar';
import Profile from './Profile';
import IdeaCreationModal from './IdeaCreationModal'; // Импортируем компонент боковой панели
import './desktop.css';
import './mobile.css';
import bgImage from '../assets/back.png';
import { BiMenu, BiNote, BiGroup, BiCaretDownSquare, BiPencil, BiFolder, BiFilterAlt, BiUserCircle } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';

function MainPage() {
  // Состояния для фильтров и поиска
  const [activeFilters, setActiveFilters] = useState({
    status: null,
    state: null
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Состояние для управления видимостью мобильной боковой панели
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Состояние для данных текущего пользователя
  const [currentUser, setCurrentUser] = useState(null);

  // Состояние для управления видимостью боковой панели создания идеи
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);

  // Эффект для загрузки данных пользователя из localStorage при монтировании компонента
    useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      try {
        // Парсим строку JSON обратно в объект
        const user = JSON.parse(storedUser);
        setCurrentUser(user); // Сохраняем данные пользователя в состоянии
        console.log('Данные пользователя загружены из localStorage:', user);
      } catch (error) {
        console.error('Ошибка парсинга данных пользователя из localStorage:', error);
        // В случае ошибки парсинга, очищаем localStorage и, возможно, перенаправляем на логин
        localStorage.removeItem('loggedInUser');
        // navigate('/login'); // Если используется react-router-dom
      }
    } else {
      // Если данных пользователя нет, можно перенаправить на страницу логина
      // navigate('/login'); // Если используется react-router-dom
      console.log('Данные пользователя не найдены в localStorage.');
    }
  }, []); // Пустой массив зависимостей означает, что эффект выполнится только один раз при монтировании

  // Обработчик изменения фильтров
  const handleFilterChange = (filters) => {
    setActiveFilters({
      status: filters.group1,
      state: filters.group2
    });
  };

  // Обработчик изменения поискового запроса
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  // Функция для переключения состояния мобильной боковой панели
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Функция для открытия боковой панели создания идеи
  const openIdeaModal = () => {
    setIsIdeaModalOpen(true);
  };

  // Функция для закрытия боковой панели создания идеи
  const closeIdeaModal = () => {
    setIsIdeaModalOpen(false);
  };

  return (
    <div className="app-container">
      {/* Фон и основной контент */}
      <div className="background" style={{ backgroundImage: `url(${bgImage})` }}>

        {/* Кнопка для открытия мобильной боковой панели (видима только на мобильных) */}
        {/* Мы стилизуем ее видимость в CSS */}
        <button className="mobile-sidebar-toggle-button" onClick={toggleMobileSidebar}>
          {/* Можете выбрать подходящую иконку, например, BiFilterAlt или BiUser */}
          <BiFilterAlt size={24} />
        </button>

        {/* Мобильная боковая панель (появляется при нажатии на кнопку) */}
        {isMobileSidebarOpen && (
          // Мы стилизуем этот контейнер в CSS, чтобы он "всплывал"
          <div className="mobile-sidebar-overlay">
            <div className="mobile-sidebar">
              {/* Кнопка закрытия мобильной боковой панели */}
              <button className="mobile-sidebar-close-button" onClick={toggleMobileSidebar}>
                <IoClose size={24} />
              </button>
              {/* Компоненты профиля и фильтров внутри мобильной панели */}
              {currentUser && <Profile user={currentUser} />}
              {/* Передаем обработчик изменения фильтров */}
              <FilterComponent onFilterChange={handleFilterChange} />
            </div>
          </div>
        )}


        {/* Контейнер для десктопного макета (трехколоночный) */}
        {/* Стилизуется по-разному в desktop.css и mobile.css через медиа-запросы */}
        <div className="desktop-layout-container">

          {/* Левая колонка: Блок с кнопками */}
          <div className="button-column">
            <div className="rounded-button-group">
              <button><BiMenu size={20} /></button>
              <button><BiNote size={20} /></button>
              <button><BiGroup size={20} /></button>
              <button><BiCaretDownSquare size={20} /></button>
              {/* Добавляем обработчик onClick для кнопки BiPencil */}
              <button onClick={openIdeaModal}><BiPencil size={20} /></button>
              <button><BiFolder size={20} /></button>
            </div>
          </div>

          {/* Центральная колонка: Поиск, Идеи, Пагинация */}
          <div className="central-content-column">
             {/* Контейнер для поиска и идей */}
             <div className="search-ideas-container">
               <SearchBar searchQuery={searchQuery} setSearchQuery={handleSearchChange} />
               {/* activeFilters и searchQuery передаются в IdeasGrid */}
               <IdeasGrid activeFilters={activeFilters} searchQuery={searchQuery} />
               {/* Пагинация рендерится внутри IdeasGrid */}
             </div>
          </div>

          {/* Правая боковая панель для десктопа (скрыта на мобильных через CSS) */}
          <div className="right-sidebar">
            {currentUser && <Profile user={currentUser} />}
            <FilterComponent onFilterChange={handleFilterChange} />
          </div>

        </div>
      </div>

      {/* Рендерим боковую панель создания идеи, если isIdeaModalOpen равно true */}
      {isIdeaModalOpen && <IdeaCreationModal onClose={closeIdeaModal} currentUser={currentUser} />} {/* Передаем currentUser как проп */}
    </div>
  );
}

export default MainPage;
