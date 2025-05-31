import React from 'react';
// import { BiChevronLeft, BiChevronRight } from 'react-icons/bi'; // Удаляем импорт иконок

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Генерация кнопок пагинации
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5; // Максимальное количество видимых кнопок пагинации
    let startPage, endPage;

    if (totalPages <= maxButtons) {
      // Если страниц мало, показываем все
      startPage = 1;
      endPage = totalPages;
    } else {
      // Если страниц много, вычисляем диапазон
      if (currentPage <= Math.ceil(maxButtons / 2)) {
        startPage = 1;
        endPage = maxButtons;
      } else if (currentPage + Math.floor(maxButtons / 2) >= totalPages) {
        startPage = totalPages - maxButtons + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - Math.floor(maxButtons / 2);
        endPage = currentPage + Math.floor(maxButtons / 2);
      }
    }

    // Кнопка "Предыдущая"
    buttons.push(
      <button key="prev" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Назад
      </button>
    );

    // Кнопки страниц
    if (startPage > 1) {
      buttons.push(<button key={1} onClick={() => onPageChange(1)}>1</button>);
      if (startPage > 2) {
        buttons.push(<span key="ellipsis-start" className="ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button key={i} onClick={() => onPageChange(i)} className={currentPage === i ? 'active' : ''}>
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis-end" className="ellipsis">...</span>);
      }
      buttons.push(<button key={totalPages} onClick={() => onPageChange(totalPages)}>{totalPages}</button>);
    }

    // Кнопка "Следующая"
    buttons.push(
      <button key="next" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Вперед
      </button>
    );

    return buttons;
  };

  return (
    <div className="pagination-container">
      <div className="pagination">
        {renderPaginationButtons()}
      </div>
    </div>
  );
};

export default Pagination;
