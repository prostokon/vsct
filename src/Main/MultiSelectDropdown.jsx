// MultiSelectDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { BiChevronDown, BiCheck } from 'react-icons/bi'; // Для иконки стрелки вниз и галочки

function MultiSelectDropdown({ label, options, selectedValues, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Обработчик клика вне компонента для закрытия выпадающего списка
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Обработчик изменения выбора
  const handleOptionClick = (value) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value) // Удаляем, если уже выбрано
      : [...selectedValues, value]; // Добавляем, если не выбрано
    onChange(newSelectedValues);
  };

  // Текст для отображения выбранных значений
  const displayValue = selectedValues.length > 0
    ? selectedValues.map(value => options.find(opt => opt.id === value)?.name).join(', ')
    : `Выберите ${label.toLowerCase()}`;

  return (
    <div className="multi-select-dropdown" ref={dropdownRef}>
      <label className="multi-select-label">{label}</label>
      <div className="multi-select-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="multi-select-display-value">
          {displayValue}
        </div>
        <BiChevronDown className={`multi-select-arrow ${isOpen ? 'open' : ''}`} size={20} />
      </div>

      {isOpen && (
        <div className="multi-select-options">
          {options.length > 0 ? (
            options.map((option) => (
              <div
                key={option.id}
                className={`multi-select-option ${selectedValues.includes(option.id) ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option.id)}
              >
                <BiCheck className="multi-select-checkbox-icon" size={18} />
                {option.name}
              </div>
            ))
          ) : (
            <div className="multi-select-no-options">Нет доступных опций</div>
          )}
        </div>
      )}
    </div>
  );
}

export default MultiSelectDropdown;
