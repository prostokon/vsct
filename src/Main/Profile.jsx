import React from 'react';
// Возможно, вам потребуется установить react-icons, если еще не сделали: npm install react-icons
import { BiUserCircle } from 'react-icons/bi';

// Компонент теперь принимает проп 'user'
function Profile({ user }) {
  // Извлекаем имя и фамилию из объекта user, предоставляя значения по умолчанию, если user или свойства не определены
  const userName = user && user.name ? user.name : 'Загрузка...'; // Или 'Пользователь'
  const userSurname = user && user.surname ? user.surname : ''; // Пустая строка, если фамилии нет

  // Вы можете определить статус пользователя на основе user_type_id или других данных из user
  // Например:
  const userStatus = user ? (user.user_type_id === 1 ? 'Студент' : 'Преподаватель') : 'Статус'; // Пример определения статуса

  return (
    <div className="profile-container">
      <div className="profile-icon">
        {/* Иконка пользователя */}
        <BiUserCircle size={30} color="#8a2be2" />
      </div>
      <div className="profile-info">
        {/* Отображаем имя и фамилию из пропсов */}
        <div className="profile-name">
          {`${userName} ${userSurname}`}
        </div>
        {/* Отображаем статус из пропсов или определенный на основе user */}
        <div className="profile-status">{userStatus}</div>
      </div>
    </div>
  );
}

export default Profile;