import React, { useState, useEffect } from 'react';
// import './Main.css'; // Импорт удален

// Моковые данные для идей (увеличено количество и добавлены свойства для фильтрации)
const mockIdeas = Array.from({ length: 120 }, (_, i) => {
  const statusOptions = ['На редактировании', 'На согласовании', 'На утверждении'];
  const stateOptions = ['Утверждена', 'Опубликована', 'Новая'];
  return {
    id: i + 1,
    title: `Идея ${i + 1} : ${i % 3 === 0 ? 'Исправление ошибки' : i % 3 === 1 ? 'Общее предложение' : 'Улучшение интерфейса'}`,
    date: ` ${(i % 20) + 1}.${(i % 12) + 1}.2025`, // Генерируем разнообразные даты
    // Добавлены свойства для фильтрации
    status: statusOptions[i % statusOptions.length],
    state: stateOptions[i % stateOptions.length]
  };
});


function IdeasGrid({ activeFilters, searchQuery }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Количество идей на странице

  // Фильтрация идей на основе активных фильтров и поискового запроса
  const filteredIdeas = mockIdeas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase());

    // ИСПРАВЛЕНО: Включена логика фильтрации по activeFilters
    const matchesFilters =
      (activeFilters.status === null || idea.status === activeFilters.status) &&
      (activeFilters.state === null || idea.state === activeFilters.state);

    return matchesSearch && matchesFilters;
  });

  // Расчет общего количества страниц
  const totalPages = Math.ceil(filteredIdeas.length / itemsPerPage);

  // Получение идей для текущей страницы
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentIdeas = filteredIdeas.slice(startIndex, startIndex + itemsPerPage);

  // Сбрасываем страницу на первую при изменении фильтров или поискового запроса
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters, searchQuery]);


  // Обработчик смены страницы
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Генерация кнопок пагинации
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5; // Максимальное количество видимых кнопок пагинации
    const start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);

    // Кнопка "Назад"
    buttons.push(
      <button key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
        Назад
      </button>
    );

    // Кнопки страниц
    if (start > 1) {
      buttons.push(<button key={1} onClick={() => handlePageChange(1)}>1</button>);
      if (start > 2) {
        buttons.push(<span key="ellipsis-start" className="ellipsis">...</span>);
      }
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <button key={i} onClick={() => handlePageChange(i)} className={currentPage === i ? 'active' : ''}>
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        buttons.push(<span key="ellipsis-end" className="ellipsis">...</span>);
      }
      buttons.push(<button key={totalPages} onClick={() => handlePageChange(totalPages)}>{totalPages}</button>);
    }


    // Кнопка "Вперед"
    buttons.push(
      <button key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Вперед
      </button>
    );

    return buttons;
  };


  return (
    <div className="ideas-container">
      <div className="ideas-grid">
        {currentIdeas.map(idea => (
          <div key={idea.id} className="idea-tile">
            <h3 className="idea-title">{idea.title}</h3>
            <span className="idea-date">{idea.date}</span>
          </div>
        ))}
      </div>
       {/* Пагинация */}
      <div className="pagination-container">
        <div className="pagination">
          {renderPaginationButtons()}
        </div>
      </div>
    </div>
  );
}

export default IdeasGrid;
