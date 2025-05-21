import React, { useState } from 'react';
// import './Main.css'; // Импорт удален

function FilterComponent({ onFilterChange }) {
  const [filters, setFilters] = useState({
    group1: null, // Например, статус: На редактировании, На согласовании, На утверждении
    group2: null  // Например, состояние: Утверждена, Опубликована, Новая
  });

  const handleCheckboxChange = (group, value) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      // Если выбран тот же фильтр, сбрасываем его
      newFilters[group] = prevFilters[group] === value ? null : value;
      // ИСПРАВЛЕНО: Удален setTimeout
      onFilterChange(newFilters); // Уведомляем родительский компонент об изменении
      return newFilters;
    });
  };

  const handleResetFilters = () => {
    const resetFilters = { group1: null, group2: null };
    setFilters(resetFilters);
    // ИСПРАВЛЕНО: Удален setTimeout
    onFilterChange(resetFilters); // Уведомляем родительский компонент
  };

  return (
    <div className="filters-container">
      <h3 className="filters-title">Фильтры</h3>
      <div className="filter-divider"></div>

      {/* Группа фильтров 1 (например, Статус) */}
      <div className="filter-group">
        <div className="filter-item" onClick={() => handleCheckboxChange('group1', 'На редактировании')}>
          <input
            type="checkbox"
            className="filter-checkbox"
            checked={filters.group1 === 'На редактировании'}
            readOnly // Используем readOnly, так как состояние управляется через onClick
          />
          <label className="filter-label">На редактировании</label>
        </div>
        <div className="filter-item" onClick={() => handleCheckboxChange('group1', 'На согласовании')}>
          <input
            type="checkbox"
            className="filter-checkbox"
            checked={filters.group1 === 'На согласовании'}
            readOnly
          />
          <label className="filter-label">На согласовании</label>
        </div>
        <div className="filter-item" onClick={() => handleCheckboxChange('group1', 'На утверждении')}>
          <input
            type="checkbox"
            className="filter-checkbox"
            checked={filters.group1 === 'На утверждении'}
            readOnly
          />
          <label className="filter-label">На утверждении</label>
        </div>
      </div>

       <div className="filter-divider"></div>

      {/* Группа фильтров 2 (например, Состояние) */}
      <div className="filter-group">
         <div className="filter-item" onClick={() => handleCheckboxChange('group2', 'Утверждена')}>
          <input
            type="checkbox"
            className="filter-checkbox"
            checked={filters.group2 === 'Утверждена'}
            readOnly
          />
          <label className="filter-label">Утверждена</label>
        </div>
         <div className="filter-item" onClick={() => handleCheckboxChange('group2', 'Опубликована')}>
          <input
            type="checkbox"
            className="filter-checkbox"
            checked={filters.group2 === 'Опубликована'}
            readOnly
          />
          <label className="filter-label">Опубликована</label>
        </div>
         <div className="filter-item" onClick={() => handleCheckboxChange('group2', 'Новая')}>
          <input
            type="checkbox"
            className="filter-checkbox"
            checked={filters.group2 === 'Новая'}
            readOnly
          />
          <label className="filter-label">Новая</label>
        </div>
      </div>


      <button className="reset-filters-button" onClick={handleResetFilters}>
        Сбросить фильтры &times;
      </button>
    </div>
  );
}

export default FilterComponent;
