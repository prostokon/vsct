import React, { useState, useEffect, useRef } from 'react';
import { IoArrowBack, IoCheckmarkOutline } from 'react-icons/io5';
import '../Main/modal.css';

const getRandomColor = () => {
  const colors = ['#FFDDC1', '#CCE5FF', '#D4EDDA', '#F8D7DA', '#FFF3CD', '#E2E3E5', '#D1ECF1'];
  return colors[Math.floor(Math.random() * colors.length)];
};

function TeamCreationModal({ onClose, currentUser }) {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [techStackItems, setTechStackItems] = useState([]);
  const [numParticipants, setNumParticipants] = useState('');

  const isClosing = useRef(false);
  const contentRef = useRef(null);

  // Открытие с анимацией
  useEffect(() => {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
      const timer = setTimeout(() => {
        overlay.classList.add('open');
      }, 10);
      return () => clearTimeout(timer);
    }
  }, []);

  // Закрытие с анимацией
  const handleClose = () => {
    if (isClosing.current) return;
    isClosing.current = true;
    const overlay = contentRef.current?.closest('.modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      const handleTransitionEnd = (event) => {
        if (event.propertyName === 'transform' || event.propertyName === 'opacity') {
          overlay.removeEventListener('transitionend', handleTransitionEnd);
          onClose();
        }
      };
      overlay.addEventListener('transitionend', handleTransitionEnd);
    } else {
      onClose();
    }
  };

  // Закрытие по клику вне окна
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      handleClose();
    }
  };

  // Добавление элемента стека (только по Enter)
  const handleAddTechStackItem = () => {
    const trimmedInput = techStackInput.trim();
    if (trimmedInput && !techStackItems.some(item => item.text.toLowerCase() === trimmedInput.toLowerCase())) {
      setTechStackItems([...techStackItems, { text: trimmedInput, color: getRandomColor() }]);
      setTechStackInput('');
    }
  };

  // Удаление элемента стека
  const handleRemoveTechStackItem = (indexToRemove) => {
    setTechStackItems(techStackItems.filter((_, index) => index !== indexToRemove));
  };

  // Enter для стека
  const handleTechStackKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTechStackItem();
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:5000/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_name: teamName,
        description,
        tech_stack: techStackItems.map(item => item.text),
        num_participants: numParticipants,
        creator_id: currentUser?.id
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Ошибка создания команды');
    alert('Команда успешно создана!');
    handleClose();
  } catch (err) {
    alert(err.message);
  }
};

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" ref={contentRef} onClick={e => e.stopPropagation()}>
        <button className="modal-back-button" onClick={handleClose}>
          <IoArrowBack size={24} /> Назад
        </button>
        <button className="modal-save-button" type="submit" form="team-create-form">
          <IoCheckmarkOutline size={20} />
        </button>
        <input
          type="text"
          className="idea-title-input"
          placeholder="Введите название команды"
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
        />
        <div className="idea-details-block">
          <div className="idea-section-inner">
            <h3>Описание команды</h3>
            <textarea
              placeholder="Опишите вашу команду, её цели и направление"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows="4"
            ></textarea>
          </div>
          <div className="idea-section-inner">
            <h3>Ключевые компетенции / Стек технологий</h3>
            <input
              type="text"
              placeholder="Например: React, Node.js, UX/UI"
              value={techStackInput}
              onChange={e => setTechStackInput(e.target.value)}
              onKeyPress={handleTechStackKeyPress}
            />
            <div className="tech-stack-items-container">
              {techStackItems.map((item, index) => (
                <span
                  key={index}
                  className="tech-stack-item"
                  style={{ backgroundColor: item.color }}
                >
                  {item.text}
                  <span
                    className="tech-stack-item-delete"
                    onClick={() => handleRemoveTechStackItem(index)}
                  >
                    &times;
                  </span>
                </span>
              ))}
            </div>
          </div>
          <div className="idea-section-inner">
            <h3>Необходимое количество участников</h3>
        <input
            type="number"
            placeholder="Например: 5"
            value={numParticipants}
            onChange={e => setNumParticipants(e.target.value)}
            min="1"
            onKeyDown={e => {
            if (
            !(
            (e.key >= '0' && e.key <= '9') ||
            ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"].includes(e.key)
            )
            ) {
            e.preventDefault();
            }
        }}
        onPaste={e => {
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        if (!/^\\d+$/.test(paste)) {
        e.preventDefault();
        }
        }}
        />
          </div>
        </div>
        <form id="team-create-form" onSubmit={handleSubmit} style={{ display: 'none' }}></form>
      </div>
    </div>
  );
}

export default TeamCreationModal;