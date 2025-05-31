import React from 'react';
import { BiCheckCircle, BiXCircle, BiDotsHorizontalRounded, BiUser } from 'react-icons/bi';

// Массив мягких цветов
const statusColors = [
  '#FFDDC1', '#CCE5FF', '#D4EDDA', '#F8D7DA', '#FFF3CD', '#E2E3E5', '#D1ECF1', '#F0E5FF', '#FDE2FF', '#E0F7FA', '#FFF0F5'
];

// Функция для выбора цвета по id (чтобы цвет был постоянным для одной команды)
function getSoftColor(id) {
  if (!id) return statusColors[Math.floor(Math.random() * statusColors.length)];
  const idx = Math.abs(String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % statusColors.length;
  return statusColors[idx];
}

const TeamTitle = ({ team, onTeamClick }) => {
  const OccupiedIcon = team.is_occupied ? BiXCircle : BiCheckCircle;
  const occupiedIconColor = team.is_occupied ? '#ff6b6b' : '#4CAF50';

  const teamStatusText = team.status;
  const teamStatusClass = team.status === 'В работе' ? 'status-in-progress' : 'status-in-search';
  const teamStatusBg = getSoftColor(team.id);

  const createdAtDate = team.created_at ? new Date(team.created_at).toLocaleDateString('ru-RU') : 'Неизвестно';

  return (
    <div className="team-tile" onClick={() => onTeamClick(team)} style={{ cursor: 'pointer' }}>
      <div className="team-content-row">
        <div className="team-status-icon">
          <OccupiedIcon size={24} style={{ color: occupiedIconColor }} />
        </div>
        <h3 className="team-name">{team.team_name}</h3>
        <span
          className={`team-status-badge ${teamStatusClass}`}
          style={{ backgroundColor: teamStatusBg, color: '#333', borderRadius: '12px', padding: '2px 12px', fontWeight: 500 }}
        >
          {teamStatusText}
        </span>
        <span className="team-detail-item team-date">
          {createdAtDate}
        </span>
        <span className="team-detail-item team-members">
          <BiUser size={16} style={{ marginRight: '4px' }} />
          {team.num_participants}
        </span>
        <div className="team-menu-dots" onClick={(e) => e.stopPropagation()}>
          <BiDotsHorizontalRounded size={24} />
        </div>
      </div>
    </div>
  );
};

export default TeamTitle;