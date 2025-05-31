// Profile.jsx
import React from 'react';
// BiUserCircle больше не нужен, так как будет использоваться изображение
// import { BiUserCircle } from 'react-icons/bi';

// Компонент теперь принимает проп 'onProfileClick'
function Profile({ user, onProfileClick }) {
  const userName = user && user.name ? user.name : 'Загрузка...';
  const userSurname = user && user.surname ? user.surname : '';
  const userStatus = user ? (user.user_type_id === 1 ? 'Студент' : 'Преподаватель') : 'Статус';

  // Определяем URL аватара
  // Если user.avatar_url существует и не начинается с 'http' (т.е. это относительный путь с сервера),
  // то добавляем префикс 'http://localhost:5000'.
  // В противном случае используем его как есть или заглушку.
  const avatarSrc = user?.avatar_url
    ? (user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:5000${user.avatar_url}`)
    : 'https://placehold.co/50x50/A0A0A0/FFFFFF?text=AVATAR'; // Заглушка для аватара

  return (
    // Добавляем onClick обработчик, если он передан
    <div className="profile-container" onClick={onProfileClick} style={{ cursor: onProfileClick ? 'pointer' : 'default' }}>
      <div className="profile-avatar-display"> {/* Новый контейнер для аватара */}
        <img src={avatarSrc} alt="Аватар пользователя" className="profile-avatar" />
      </div>
      <div className="profile-info">
        <div className="profile-name">
          {`${userName} ${userSurname}`}
        </div>
        <div className="profile-status">{userStatus}</div>
      </div>
    </div>
  );
}

export default Profile;
