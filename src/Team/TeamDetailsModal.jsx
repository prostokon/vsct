// A:\vsct\src\Team\TeamDetailsModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BiArrowBack, BiSearch, BiUser, BiCalendarEvent, BiBrain, BiCrown, BiPaperPlane } from 'react-icons/bi';

function TeamDetailsModal({ team, onClose, currentUser }) {
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [allMembers, setAllMembers] = useState([]); // Хранит полный список участников
  const [filteredMembers, setFilteredMembers] = useState([]); // Хранит отфильтрованный список участников
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState(null);
  const [isApplying, setIsApplying] = useState(false); // Новое состояние для отслеживания процесса подачи заявки

  const isClosing = useRef(false);
  const contentRef = useRef(null);

  // Эффект для анимации открытия/закрытия
  useEffect(() => {
    const overlay = contentRef.current?.closest('.modal-overlay');
    if (overlay) {
      const timer = setTimeout(() => {
        overlay.classList.add('open');
      }, 10); // Небольшая задержка для срабатывания transition

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const contentElement = contentRef.current;
    const handleTransitionEnd = (event) => {
      if (event.propertyName === 'transform' && isClosing.current) {
        onClose(); // Вызываем onClose только после завершения анимации закрытия
        isClosing.current = false;
      }
    };

    if (contentElement) {
      contentElement.addEventListener('transitionend', handleTransitionEnd);
    }
    return () => {
      if (contentElement) {
        contentElement.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
  }, [onClose]);

  const handleCloseWithAnimation = () => {
    if (isClosing.current) return;
    isClosing.current = true;
    const overlay = contentRef.current?.closest('.modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
    } else {
      // Если оверлей не найден, закрываем сразу
      onClose();
      isClosing.current = false;
    }
  };

  // Функция для получения участников команды
  const fetchTeamMembers = useCallback(async () => {
    if (!team || !team.id) {
      setLoadingMembers(false);
      return;
    }
    setLoadingMembers(true);
    setMembersError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/teams/${team.id}/members`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllMembers(data); // Сохраняем полный список
      setFilteredMembers(data); // Изначально отфильтрованный список равен полному
    } catch (error) {
      console.error('Ошибка при загрузке участников команды:', error);
      setMembersError('Не удалось загрузить участников команды.');
    } finally {
      setLoadingMembers(false);
    }
  }, [team?.id]);

  // Эффект для получения участников команды (вызывается при монтировании и изменении team.id)
  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]); // Зависимость от useCallback fetchTeamMembers

  // Функция для применения фильтрации
  const applyMemberFilter = useCallback(() => {
    const lowercasedFilter = memberSearchTerm.toLowerCase();
    const filtered = allMembers.filter(member => {
      return (
        member.email?.toLowerCase().includes(lowercasedFilter) ||
        member.name?.toLowerCase().includes(lowercasedFilter) ||
        member.surname?.toLowerCase().includes(lowercasedFilter) ||
        member.role_in_team?.toLowerCase().includes(lowercasedFilter)
      );
    });
    setFilteredMembers(filtered);
  }, [allMembers, memberSearchTerm]);

  // Эффект для фильтрации участников команды при изменении поискового запроса
  // Теперь фильтрация происходит по мере ввода текста
  useEffect(() => {
    applyMemberFilter();
  }, [memberSearchTerm, allMembers, applyMemberFilter]); // Добавлена зависимость от allMembers и applyMemberFilter

  // Обработчик нажатия Enter (больше не нужен, так как фильтрация по мере ввода)
  // const handleKeyPress = (event) => {
  //   if (event.key === 'Enter') {
  //     applyMemberFilter();
  //   }
  // };

  if (!team) {
    return null; // Не рендерим ничего, если данные команды отсутствуют
  }

  const handleApplyToTeam = async () => {
    if (!currentUser || !currentUser.id || isApplying) {
      // Можно добавить сообщение, если пользователь не авторизован
      return;
    }

    setIsApplying(true); // Устанавливаем состояние "в процессе"

    try {
      const response = await fetch(`http://localhost:5000/api/teams/${team.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser.id, role_in_team: 'Участник' }), // Передаем userId и роль
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Если успешно, обновляем список участников
      alert(`Заявка в команду "${team.team_name}" успешно отправлена!`);
      await fetchTeamMembers(); // Перезагружаем список участников после успешной заявки
    } catch (error) {
      console.error('Ошибка при подаче заявки в команду:', error);
      alert(`Ошибка при подаче заявки: ${error.message}`);
    } finally {
      setIsApplying(false); // Сбрасываем состояние "в процессе"
    }
  };

  // Проверяем, является ли текущий пользователь создателем команды или ее участником
  const isUserInTeam = currentUser && (
    team.creator_id === currentUser.id ||
    allMembers.some(member => member.user_id === currentUser.id) // Проверяем по allMembers
  );

  const teamCompetencies = team.tech_stack && team.tech_stack.length > 0
    ? team.tech_stack.join(', ')
    : 'Не указаны';

  return (
    <div className="modal-overlay team-details-modal-overlay" onClick={handleCloseWithAnimation}>
      <div className="modal-content team-details-modal-content" ref={contentRef} onClick={(e) => e.stopPropagation()}>
        <button className="modal-back-button" onClick={handleCloseWithAnimation}>
          <BiArrowBack size={20} />
          Назад
        </button>

        <div className="team-details-header">
          <h2>{team.team_name || 'Название команды'}</h2>
        </div>

        {/* Измененная структура team-details-body */}
        <div className="team-details-body full-width-layout">
          <div className="team-details-section team-description-section full-width-section">
            <h3>Описание команды</h3>
            <p>{team.description || 'Описание отсутствует.'}</p>
          </div>

          <div className="team-details-section team-members-section full-width-section">
            <h3>Участники ({filteredMembers.length})</h3>
            <div className="member-search-container">
              <BiSearch className="member-search-icon" /> {/* Возвращена иконка в начало */}
              <input
                type="text"
                placeholder="Поиск участников..."
                className="member-search-input"
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
                // onKeyPress={handleKeyPress} // Удален обработчик Enter
              />
              {/* Удалена кнопка поиска */}
              {/*
              <button
                className="member-search-button"
                onClick={applyMemberFilter}
              >
                <BiSearch size={20} />
              </button>
              */}
            </div>
            {loadingMembers ? (
              <div className="loading-message">Загрузка участников...</div>
            ) : membersError ? (
              <div className="error-message">{membersError}</div>
            ) : filteredMembers.length > 0 ? (
              <ul className="members-list">
                {filteredMembers.map((member, index) => (
                  <li key={member.user_id || index} className="member-item">
                    <div className="member-info">
                      <span className="member-name">{member.name || 'Имя'} {member.surname || 'Фамилия'}</span>
                      <span className="member-email">{member.email || 'Почта не указана'}</span>
                    </div>
                    <span className="member-role">{member.role_in_team || 'Роль не указана'}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <li className="member-item-empty">Участники не найдены.</li>
            )}
          </div>

          {/* Блок подачи заявки будет виден только если пользователь не состоит в команде */}
          {!isUserInTeam && (
            <div className="team-details-section team-apply-section full-width-section">
              <button
                className="apply-button-custom" // Используем новый класс из modal.css
                onClick={handleApplyToTeam}
                disabled={isApplying} // Отключаем кнопку во время подачи заявки
              >
                {isApplying ? 'Отправка...' : 'Подать заявку'}
              </button>
            </div>
          )}

          <div className="team-details-section team-info-section-horizontal full-width-section">
            <h3>Информация о команде</h3>
            <div className="info-grid-horizontal">
              <div className="info-block">
                <BiCalendarEvent className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Дата создания</span>
                  <span className="info-value">{team.created_at ? new Date(team.created_at).toLocaleDateString('ru-RU') : 'Неизвестно'}</span>
                </div>
              </div>
              <div className="info-block">
                <BiUser className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Количество участников</span>
                  <span className="info-value">{team.num_participants || 0}</span>
                </div>
              </div>
              <div className="info-block"> {/* Компетенции теперь в обычном info-block для горизонтального расположения */}
                <BiBrain className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Ключевые компетенции</span>
                  <span className="info-value competencies-value">{teamCompetencies}</span>
                </div>
              </div>
              <div className="info-block"> {/* Владелец теперь в обычном info-block */}
                <BiCrown className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Владелец команды</span>
                  <span className="info-value">{team.owner_name || 'Имя'} {team.owner_surname || 'Фамилия'}</span>
                </div>
              </div>
            </div>
          </div>
{currentUser && team.creator_id === currentUser.id && (
  <div className="team-details-section admin-section full-width-section">
    <h3>Администрирование</h3>
    <div className="info-grid-horizontal">
      <AdminPanel
        team={team}
      />
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  );
}
function AdminPanel({ team }) {
  const [editStatus, setEditStatus] = React.useState(team.status || '');
  const [editPollPassed, setEditPollPassed] = React.useState(!!team.poll_passed);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(null);

  React.useEffect(() => {
    setEditStatus(team.status || '');
    setEditPollPassed(!!team.poll_passed);
  }, [team]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/teams/${team.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus, poll_passed: editPollPassed })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка сохранения');
      setEditStatus(data.team.status || '');
      setEditPollPassed(!!data.team.poll_passed);
      alert('Изменения успешно сохранены!');
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div
        className="info-block idea-section-inner"
        style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}
      >
        <span className="info-label" style={{ marginRight: '10px', minWidth: '110px' }}>
          Статус команды
        </span>
        <input
          type="text"
          className="team-status-input"
          value={editStatus}
          onChange={e => setEditStatus(e.target.value)}
          style={{ flex: 1, margin: 0 }}
          disabled={isSaving}
        />
      </div>
      <div className="info-block idea-section-inner poll-row">
        <label className="info-label poll-label">
          <input
            type="checkbox"
            className="team-poll-toggle styled-checkbox"
            checked={editPollPassed}
            onChange={e => setEditPollPassed(e.target.checked)}
            disabled={isSaving}
            style={{ marginRight: '8px' }}
          />
          Опрос пройден
        </label>
      </div>
      <button
        className="modal-save-button"
        style={{ marginLeft: '16px', alignSelf: 'center' }}
        onClick={handleSave}
        disabled={isSaving}
        title="Сохранить изменения"
      >
        {isSaving ? '...' : <span style={{ fontSize: 20 }}>&#10003;</span>}
      </button>
      {saveError && <div className="error-message" style={{ marginTop: 8 }}>{saveError}</div>}
    </>
  );
}
export default TeamDetailsModal;
