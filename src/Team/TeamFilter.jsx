// A:\vsct\src\Team\TeamFilter.jsx
import React, { useState, useEffect } from 'react';
import { BiFilterAlt } from 'react-icons/bi'; // Импортируем иконку фильтра

// Принимаем searchTerm и setSearchTerm как пропсы
function TeamFilter({ onFilterChange, onResetFilters, searchTerm, setSearchTerm }) {
  // Состояния для новых фильтров
  const [isOccupiedFilter, setIsOccupiedFilter] = useState(null); // null: все, true: занята, false: не занята
  const [pollStatusFilter, setPollStatusFilter] = useState(null); // null: все, true: пройден, false: не пройден
  const [searchScope, setSearchScope] = useState('everywhere'); // 'everywhere', 'vacancies', 'tech_stack'
  // techStackSearch теперь управляется извне через searchTerm пропс

  // Эффект для вызова onFilterChange при изменении любого фильтра
  useEffect(() => {
    onFilterChange({
      isOccupied: isOccupiedFilter,
      pollStatus: pollStatusFilter,
      searchScope: searchScope,
      // techStackSearch больше не передается отдельно отсюда,
      // так как он теперь часть общего searchTerm
    });
  }, [isOccupiedFilter, pollStatusFilter, searchScope, onFilterChange, searchTerm]); // Добавили searchTerm сюда!

  // СбрасываемsearchTerm при сбросе фильтров
  const handleReset = () => {
    setIsOccupiedFilter(null);
    setPollStatusFilter(null);
    setSearchScope('everywhere');
    setSearchTerm(''); // Сбрасываем общий поисковый запрос
    onResetFilters(); // Вызываем пропс для сброса других связанных состояний (например, search term)
  };

  // Обработчик изменения области поиска
  const handleSearchScopeChange = (scope) => {
    setSearchScope(scope);
    // При смене области поиска, если ранее был введен текст в поле "Поиск по стеку технологий",
    // и теперь выбрана другая область, этот текст останется в searchTerm.
    // Если требуется сброс searchTerm при смене области, можно добавить:
    // if (scope !== 'tech_stack' && searchScope === 'tech_stack') {
    //   setSearchTerm('');
    // }
  };

  return (
    <div className="filter-container">
      <div className="filters-container">
        <h3 className="filters-title">
          Фильтры
        </h3>
        <div className="filter-divider"></div>

        {/* 1. Фильтр по занятости команды */}
        <div className="filter-group">
          <label className="filter-label" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            Занятость команды:
          </label>
          <div className="filter-item">
            <input
              type="radio" // Используем radio для выбора одного из трех
              id="occupied-all"
              name="occupied-filter"
              className="filter-checkbox"
              checked={isOccupiedFilter === null}
              onChange={() => setIsOccupiedFilter(null)}
            />
            <label htmlFor="occupied-all" className="filter-label">Все</label>
          </div>
          {/* ОБНОВЛЕНО: Открытая команда (is_occupied: false) */}
          <div className="filter-item">
            <input
              type="radio"
              id="occupied-true"
              name="occupied-filter"
              className="filter-checkbox"
              checked={isOccupiedFilter === false} // Логика изменена на false
              onChange={() => setIsOccupiedFilter(false)} // Логика изменена на false
            />
            <label htmlFor="occupied-true" className="filter-label">Открытая команда</label>
          </div>
          {/* ОБНОВЛЕНО: Закрытая команда (is_occupied: true) */}
          <div className="filter-item">
            <input
              type="radio"
              id="occupied-false"
              name="occupied-filter"
              className="filter-checkbox"
              checked={isOccupiedFilter === true} // Логика изменена на true
              onChange={() => setIsOccupiedFilter(true)} // Логика изменена на true
            />
            <label htmlFor="occupied-false" className="filter-label">Закрытая команда</label>
          </div>
        </div>

        <div className="filter-divider"></div>

        {/* 2. Фильтр по статусу опроса */}
        <div className="filter-group">
          <label className="filter-label" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            Статус опроса:
          </label>
          <div className="filter-item">
            <input
              type="radio" // Используем radio для выбора одного из трех
              id="poll-all"
              name="poll-status-filter"
              className="filter-checkbox"
              checked={pollStatusFilter === null}
              onChange={() => setPollStatusFilter(null)}
            />
            <label htmlFor="poll-all" className="filter-label">Все</label>
          </div>
          <div className="filter-item">
            <input
              type="radio"
              id="poll-passed"
              name="poll-status-filter"
              className="filter-checkbox"
              checked={pollStatusFilter === true}
              onChange={() => setPollStatusFilter(true)}
            />
            <label htmlFor="poll-passed" className="filter-label">Опрос пройден</label>
          </div>
          <div className="filter-item">
            <input
              type="radio"
              id="poll-not-passed"
              name="poll-status-filter"
              className="filter-checkbox"
              checked={pollStatusFilter === false}
              onChange={() => setPollStatusFilter(false)}
            />
            <label htmlFor="poll-not-passed" className="filter-label">Опрос не пройден</label>
          </div>
        </div>

        <div className="filter-divider"></div>

        {/* 3. Выбор области поиска */}
        <div className="filter-group">
          <label className="filter-label" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            Область поиска:
          </label>
          <div className="filter-item">
            <input
              type="radio"
              id="search-everywhere"
              name="search-scope"
              className="filter-checkbox"
              checked={searchScope === 'everywhere'}
              onChange={() => handleSearchScopeChange('everywhere')}
            />
            <label htmlFor="search-everywhere" className="filter-label">Искать везде</label>
          </div>
          <div className="filter-item">
            <input
              type="radio"
              id="search-vacancies"
              name="search-scope"
              className="filter-checkbox"
              checked={searchScope === 'vacancies'}
              onChange={() => handleSearchScopeChange('vacancies')}
            />
            <label htmlFor="search-vacancies" className="filter-label">Искать по вакансиям</label>
          </div>
          {/* НОВОЕ: Добавляем опцию для поиска по стеку технологий */}
          <div className="filter-item">
            <input
              type="radio"
              id="search-tech-stack"
              name="search-scope"
              className="filter-checkbox"
              checked={searchScope === 'tech_stack'}
              onChange={() => handleSearchScopeChange('tech_stack')}
            />
            <label htmlFor="search-tech-stack" className="filter-label">Искать по стеку технологий</label>
          </div>
        </div>

        <div className="filter-divider"></div>

        {/* 4. Поиск по требуемым стекам технологий */}
        <div className="filter-group">
          <label htmlFor="tech-stack-search" className="filter-label" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            Поиск по стеку технологий:
          </label>
          <input
            type="text"
            id="tech-stack-search"
            className="search-input" // Используем существующий стиль search-input
            placeholder="Например: React, Node.js"
            value={searchTerm} // Теперь используем searchTerm из пропсов
            onChange={(e) => setSearchTerm(e.target.value)} // Обновляем searchTerm через пропс
            style={{ marginBottom: '10px' }} // Добавляем небольшой отступ
            disabled={searchScope !== 'tech_stack'} // Отключаем поле, если не выбран поиск по стеку
          />
        </div>

        <button className="reset-filters-button" onClick={handleReset}>
          Сбросить фильтры
        </button>
      </div>
    </div>
  );
}

export default TeamFilter;
