// A:\vsct\src\Team\team.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchInput from '../Main/SearchBar'; // Компонент строки поиска
import ProfileContainer from '../Main/Profile'; // Компонент отображения профиля
import TeamFilters from './TeamFilter'; // Компонент фильтров для команд
import Pagination from './Pagination'; // Компонент пагинации
import TeamTitle from './teamtitle'; // Компонент для отображения плитки команды
import TeamDetailsModal from './TeamDetailsModal'; // Модальное окно с деталями команды
import TeamCreationModal from './TeamCreationModal'; // Модальное окно для создания команды


// Иконки
import { BiMenu, BiNote, BiGroup, BiCaretDownSquare, BiPencil, BiFolder, BiFilterAlt, BiExit } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5'; // Иконка закрытия для мобильного сайдбара
import teamsBgImage from '../assets/back.png'; // Фоновое изображение

const TeamsPage = () => {
  const [selectedTeam, setSelectedTeam] = useState(null); // Выбранная команда для детального просмотра
  const [isTeamDetailsModalOpen, setIsTeamDetailsModalOpen] = useState(false); // Состояние модального окна деталей команды
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(''); // Поисковый запрос для общей строки поиска
  const [techStackSearchTerm, setTechStackSearchTerm] = useState(''); // НОВОЕ: Поисковый запрос для стека технологий
  const [currentPage, setCurrentPage] = useState(1); // Текущая страница пагинации
  const [teamsData, setTeamsData] = useState([]); // Данные команд
  const [loading, setLoading] = useState(true); // Состояние загрузки данных
  const [error, setError] = useState(null); // Сообщение об ошибке
  const [totalPages, setTotalPages] = useState(1); // Общее количество страниц
  const [activeTeamFilters, setActiveTeamFilters] = useState({ // Активные фильтры
    isOccupied: null, // Фильтр по занятости команды
    pollStatus: null, // Фильтр по статусу опроса
    searchScope: 'everywhere', // Область поиска (везде, в стеке и т.д.)
  });
  const [currentUser, setCurrentUser] = useState(null); // Данные текущего пользователя
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // Состояние мобильной боковой панели
  const [isTeamCreationModalOpen, setIsTeamCreationModalOpen] = useState(false);
  const openTeamCreationModal = () => setIsTeamCreationModalOpen(true);
  const closeTeamCreationModal = () => setIsTeamCreationModalOpen(false);
  // Загрузка данных пользователя из localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Ошибка парсинга данных пользователя:', error);
        localStorage.removeItem('loggedInUser');
      }
    }
  }, []);

  // Функция для загрузки данных команд с сервера
  const fetchTeamsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const itemsPerPage = 10; // Количество элементов на странице
      const queryParams = new URLSearchParams(); // Параметры запроса

      // Добавление поискового запроса в зависимости от области поиска
      if (activeTeamFilters.searchScope === 'tech_stack') {
        if (techStackSearchTerm) { // Используем techStackSearchTerm для поиска по стеку
          queryParams.append('tech_stack_search', techStackSearchTerm);
        }
      } else if (activeTeamFilters.searchScope === 'everywhere') { // НОВОЕ: Если область поиска "везде"
        if (searchTerm) {
          queryParams.append('search', searchTerm); // Добавляем общий поисковый запрос
        }
        if (techStackSearchTerm) {
          queryParams.append('tech_stack_search', techStackSearchTerm); // Добавляем поисковый запрос по стеку
        }
      } else { // 'vacancies' или любая другая область, где применяется только общий поиск
        if (searchTerm) { // Используем searchTerm для общего поиска
          queryParams.append('search', searchTerm);
        }
      }

      // Добавление фильтров
      if (activeTeamFilters.isOccupied !== null) queryParams.append('is_occupied', activeTeamFilters.isOccupied);
      if (activeTeamFilters.pollStatus !== null) queryParams.append('poll_passed', activeTeamFilters.pollStatus);
      queryParams.append('search_scope', activeTeamFilters.searchScope);
      queryParams.append('page', currentPage);
      queryParams.append('limit', itemsPerPage);

      // Добавление ID текущего пользователя для получения информации о его участии
      if (currentUser?.id) {
        queryParams.append('userId', currentUser.id);
      }

      const response = await fetch(`http://localhost:5000/api/teams?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP ошибка! статус: ${response.status}`);
      }
      const data = await response.json();
      setTeamsData(data.teams || []); // Устанавливаем данные команд, или пустой массив если их нет
      setTotalPages(data.pagination?.totalPages || 1); // Устанавливаем общее кол-во страниц
    } catch (err) {
      console.error("Ошибка при загрузке команд:", err);
      setError("Не удалось загрузить команды.");
      setTeamsData([]); // Сбрасываем данные команд при ошибке
      setTotalPages(1); // Сбрасываем кол-во страниц
    } finally {
      setLoading(false); // Завершение загрузки
    }
  }, [activeTeamFilters, searchTerm, techStackSearchTerm, currentPage, currentUser]); // Добавили techStackSearchTerm в зависимости

  // Загрузка данных при изменении зависимостей
  useEffect(() => {
    fetchTeamsData();
  }, [fetchTeamsData]); // fetchTeamsData теперь мемоизирован

  // Обработчик изменения поискового запроса для основной строки поиска
  const handleSearchChange = useCallback((query) => {
    setSearchTerm(query);
    setCurrentPage(1); // Сброс на первую страницу при новом поиске
  }, []);

  // Обработчик изменения страницы пагинации
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Обработчик изменения фильтров команд
  const handleTeamFilterChange = useCallback((newFilters) => {
    setActiveTeamFilters(newFilters);
    setCurrentPage(1); // Сброс на первую страницу при изменении фильтров
    // Если область поиска меняется на что-то другое, кроме tech_stack, очищаем techStackSearchTerm
    // Если область поиска меняется на что-то другое, кроме everywhere, очищаем searchTerm
    if (newFilters.searchScope !== 'tech_stack' && newFilters.searchScope !== 'everywhere') {
      setTechStackSearchTerm('');
    }
    if (newFilters.searchScope !== 'everywhere' && newFilters.searchScope !== 'vacancies') {
      setSearchTerm('');
    }
  }, []);

  // Обработчик сброса фильтров команд
  const handleResetTeamFilters = useCallback(() => {
    setActiveTeamFilters({
      isOccupied: null,
      pollStatus: null,
      searchScope: 'everywhere',
    });
    setSearchTerm(''); // Очистка поискового запроса для основной строки поиска
    setTechStackSearchTerm(''); // НОВОЕ: Очистка поискового запроса для стека технологий
    setCurrentPage(1); // Сброс на первую страницу
  }, []);

  // Обработчик клика по плитке команды (открытие модального окна)
  const handleTeamTitleClick = (team) => {
    setSelectedTeam(team);
    setIsTeamDetailsModalOpen(true);
  };

  // Обработчик закрытия модального окна деталей команды
  const closeTeamDetailsModal = () => {
    setIsTeamDetailsModalOpen(false);
    setSelectedTeam(null); // Сброс выбранной команды
  };

  // Функция для переключения видимости мобильной боковой панели
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

    // Заглушка для функции открытия модального окна редактирования профиля
  const openProfileEditModal = () => {
    console.log("Открыть модальное окно редактирования профиля со страницы Команды");
    // Здесь может быть логика открытия модального окна редактирования профиля
  };


  return (
    <div className="app-container"> {/* Основной контейнер страницы */}
      <div className="background" style={{ backgroundImage: `url(${teamsBgImage})` }}>
        {/* Кнопка для открытия/закрытия мобильной боковой панели */}
        <button className="mobile-sidebar-toggle-button" onClick={toggleMobileSidebar}>
          <BiFilterAlt size={24} />
        </button>

        {/* Мобильная боковая панель */}
        {isMobileSidebarOpen && (
          <div className="mobile-sidebar-overlay">
            <div className="mobile-sidebar">
              <button className="mobile-sidebar-close-button" onClick={toggleMobileSidebar}>
                <IoClose size={24} />
              </button>
              {currentUser && <ProfileContainer user={currentUser} onProfileClick={openProfileEditModal} />}
              <TeamFilters
                onFilterChange={handleTeamFilterChange}
                onResetFilters={handleResetTeamFilters}
                searchTerm={techStackSearchTerm} // НОВОЕ: Передаем techStackSearchTerm для фильтра по стеку
                setSearchTerm={setTechStackSearchTerm} // НОВОЕ: Передаем setSearchTerm для фильтра по стеку
              />
            </div>
          </div>
        )}

        {/* Десктопная раскладка */}
        <div className="desktop-layout-container">
          {/* Левая колонка с кнопками навигации */}
          <div className="button-column">
            <div className="rounded-button-group">
              <button onClick={() => navigate('/')} title="Выход"><BiExit size={20} /></button>
              <button onClick={() => navigate('/main')} title="Идеи"><BiNote size={20} /></button>
              <button className="active" onClick={() => navigate('/teams')} title="Команды"><BiGroup size={20} /></button> {/* Активная кнопка "Команды" */}
              <button onClick={openTeamCreationModal} title="Создать Команду"><BiPencil size={20} /></button>              
            </div>
          </div>

          {/* Центральная колонка с контентом */}
          <div className="central-content-column">
            <div className="search-ideas-container"> {/* Контейнер для поиска (используется общий класс) */}
              <SearchInput
                searchQuery={searchTerm}
                setSearchQuery={handleSearchChange} // Передача обработчика для изменения поискового запроса
                placeholder="Искать команды..."
              />
            </div>

            <div className="ideas-container"> {/* Контейнер для списка команд (используется общий класс) */}
              <div className="ideas-grid"> {/* Сетка для команд (используется общий класс) */}
                {loading ? (
                  <div className="loading">Загрузка команд...</div>
                ) : error ? (
                  <div className="error">{error}</div>
                ) : teamsData.length === 0 ? (
                  <div className="no-results" style={{textAlign: 'center', marginTop: '20px'}}>Команды не найдены.</div>
                ) : (
                  teamsData.map(team => (
                    <TeamTitle
                      key={team.id}
                      team={team}
                      onTeamClick={handleTeamTitleClick} // Передача обработчика клика по плитке команды
                    />
                  ))
                )}
              </div>
            </div>

            {/* Пагинация (отображается если нет загрузки, ошибок, есть данные и больше одной страницы) */}
            {!loading && !error && teamsData.length > 0 && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>

          {/* Правая боковая панель */}
          <div className="right-sidebar">
            {currentUser && <ProfileContainer user={currentUser} onProfileClick={openProfileEditModal}/>}
            <TeamFilters
              onFilterChange={handleTeamFilterChange}
              onResetFilters={handleResetTeamFilters}
              searchTerm={techStackSearchTerm} // НОВОЕ: Передаем techStackSearchTerm для фильтра по стеку
              setSearchTerm={setTechStackSearchTerm} // НОВОЕ: Передаем setSearchTerm для фильтра по стеку
            />
          </div>
        </div>
      </div>

      {/* Модальное окно с деталями команды */}
      {isTeamDetailsModalOpen && selectedTeam && (
        <TeamDetailsModal
          team={selectedTeam}
          onClose={closeTeamDetailsModal}
          currentUser={currentUser}
        />
      )}
        {isTeamCreationModalOpen && (
      <TeamCreationModal
      onClose={closeTeamCreationModal}
      currentUser={currentUser}
      />
  )}
    </div>
  );
};

export default TeamsPage;
