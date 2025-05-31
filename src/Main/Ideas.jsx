import React, { useState, useEffect } from 'react';

function IdeasGrid({ activeFilters, searchQuery }) {
  const [ideas, setIdeas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  // Загрузка идей с сервера
  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', itemsPerPage);
        if (searchQuery) params.append('search', searchQuery);
        if (activeFilters.status) params.append('status', activeFilters.status);
        if (activeFilters.state) params.append('state', activeFilters.state);
        const response = await fetch(`http://localhost:5000/api/ideas?${params.toString()}`);
        if (!response.ok) throw new Error('Ошибка загрузки идей');
        const data = await response.json();
        setIdeas(data.ideas || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки идей');
        setIdeas([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchIdeas();
  }, [activeFilters, searchQuery, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters, searchQuery]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    const start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    buttons.push(
      <button key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
        Назад
      </button>
    );
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
        {loading ? (
          <div className="loading">Загрузка идей...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : ideas.length === 0 ? (
          <div className="no-results">Идеи не найдены.</div>
        ) : (
          ideas.map(idea => (
            <div key={idea.id} className="idea-tile">
              <h3 className="idea-title">{idea.title}</h3>
              <span className="idea-date">{idea.created_at ? new Date(idea.created_at).toLocaleDateString('ru-RU') : idea.date || ''}</span>
            </div>
          ))
        )}
      </div>
      <div className="pagination-container">
        <div className="pagination">
          {renderPaginationButtons()}
        </div>
      </div>
    </div>
  );
}

export default IdeasGrid;