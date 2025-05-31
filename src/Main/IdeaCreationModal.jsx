import React, { useState, useEffect, useRef } from 'react';
import { IoArrowBack, IoSend, IoCheckmarkOutline } from 'react-icons/io5';
import { BiUserCircle } from 'react-icons/bi';
import './modal.css';

// Принимаем currentUser как проп
function IdeaCreationModal({ onClose, currentUser }) {
  // Состояния для полей ввода идеи
  const [ideaTitle, setIdeaTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [result, setResult] = useState('');
  const [resources, setResources] = useState('');
  const [techStack, setTechStack] = useState('');
  // Состояние для хранения элементов стека технологий (теперь с цветом)
  const [techStackItems, setTechStackItems] = useState([]);
  const [comment, setComment] = useState('');
  const [commentsList, setCommentsList] = useState([]); // Состояние для хранения комментариев

  // Реф для отслеживания состояния закрытия и ссылки на элемент контента
  const isClosing = useRef(false);
  const contentRef = useRef(null); // Реф для элемента с классом modal-content

  // Эффект для добавления класса 'open' к оверлею с задержкой при монтировании
  useEffect(() => {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
      // Добавляем небольшую задержку перед добавлением класса 'open'
      const timer = setTimeout(() => {
        overlay.classList.add('open');
      }, 10); // Задержка в 10 миллисекунд

      // Функция очистки при размонтировании
      return () => {
        clearTimeout(timer); // Очищаем таймер открытия
      };
    } else {
      console.warn("Элемент .modal-overlay не найден при монтировании IdeaCreationModal.");
    }
  }, []); // Пустой массив зависимостей означает, что эффект выполнится только один раз при монтировании

  // Эффект для добавления слушателя события transitionend
  useEffect(() => {
    const contentElement = contentRef.current;

    // Функция, которая будет вызвана при завершении CSS перехода
    const handleTransitionEnd = (event) => {
      // Убедимся, что переход завершился именно на свойстве 'transform'
      if (event.propertyName === 'transform' && isClosing.current) {
        // Если панель закрывается и анимация transform завершена
        onClose(); // Вызываем функцию закрытия из родителя
        isClosing.current = false; // Сбрасываем флаг
      }
    };

    if (contentElement) {
      // Добавляем слушатель события transitionend
      contentElement.addEventListener('transitionend', handleTransitionEnd);
    }

    // Функция очистки: удаляем слушатель события при размонтировании компонента
    return () => {
      if (contentElement) {
        contentElement.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
  }, [onClose]); // Добавляем onClose в зависимости, так как оно используется внутри эффекта

  // Функция для обработки закрытия с анимацией (теперь только удаляет класс 'open')
  const handleCloseWithAnimation = () => {
    if (isClosing.current) return;

    isClosing.current = true; // Устанавливаем флаг закрытия

    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
      // Удаляем класс 'open' для запуска анимации закрытия
      overlay.classList.remove('open');
      // onClose() будет вызван в слушателе transitionend
    } else {
      // Если оверлей не найден, просто вызываем onClose
      onClose();
      isClosing.current = false;
    }
  };

  // Функция для генерации случайного приглушенного цвета
  const getRandomMutedColor = () => {
    const mutedColors = [
      '#b19cd9', // light pastel purple
      '#ffb3ba', // light pastel red
      '#ffdfba', // light pastel orange
      '#ffffba', // light pastel yellow
      '#bae1ff', // light pastel blue
      '#baffc9', // light pastel green
    ];
    const randomIndex = Math.floor(Math.random() * mutedColors.length);
    return mutedColors[randomIndex];
  };

  // Обработчик нажатия клавиши в поле "Стек технологий"
  const handleTechStackKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Предотвращаем стандартное поведение (перенос строки или отправка формы)
      if (techStack.trim()) { // Проверяем, что поле не пустое или содержит только пробелы
        // Добавляем объект с названием и цветом в список
        setTechStackItems([...techStackItems, { name: techStack.trim(), color: getRandomMutedColor() }]);
        setTechStack(''); // Очищаем поле ввода
      }
    }
  };

  // Обработчик удаления элемента стека технологий
  const handleRemoveTechStackItem = (indexToRemove) => {
    setTechStackItems(techStackItems.filter((_, index) => index !== indexToRemove));
  };

  // Обработчик добавления комментария
  const handleAddComment = () => {
    if (comment.trim()) {
      // Используем имя и фамилию текущего пользователя из пропсов
      const authorName = currentUser ? `${currentUser.name} ${currentUser.surname}` : 'Неизвестный пользователь';
      const newComment = {
        text: comment,
        author: authorName, // Используем реальные данные пользователя
        timestamp: new Date().toISOString() // Добавляем временную метку
      };
      setCommentsList([...commentsList, newComment]);
      setComment(''); // Очищаем поле ввода комментария
    }
  };

  // Обработчик удаления комментария
  const handleRemoveComment = (indexToRemove) => {
      setCommentsList(commentsList.filter((_, index) => index !== indexToRemove));
  };

  // Обработчик сохранения идеи (здесь пока просто вывод в консоль)
const handleSaveIdea = async () => {
  try {
const newIdea = {
  user_id: currentUser?.id, 
  title: ideaTitle,
  problem_description: problem,
  proposed_solution: solution,
  resources_needed: resources,
  tech_stack: techStackItems.map(item => item.name),
  comments: commentsList.map(c => `${c.author}: ${c.text}`)
};
    const response = await fetch('http://localhost:5000/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIdea)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Ошибка создания идеи');
    handleCloseWithAnimation();
  } catch (err) {
    alert(err.message || 'Ошибка при создании идеи');
  }
};

  return (
    <div className="modal-overlay" onClick={handleCloseWithAnimation}>
      {/* Контент панели: клик по нему не закрывает панель */}
      <div className="modal-content" ref={contentRef} onClick={(e) => e.stopPropagation()}> {/* Добавляем реф */}
        {/* Кнопка "Назад" */}
        <button className="modal-back-button" onClick={handleCloseWithAnimation}>
          <IoArrowBack size={24} /> Назад
        </button>

        {/* Кнопка "Сохранить" */}
        <button className="modal-save-button" onClick={handleSaveIdea}> {/* Добавляем кнопку сохранения */}
            <IoCheckmarkOutline size={20} /> {/* Иконка галочки */}
        </button>


        {/* Поле ввода названия идеи - Заголовок удален */}
        <input
          type="text"
          className="idea-title-input"
          placeholder="Введите название идеи"
          value={ideaTitle}
          onChange={(e) => setIdeaTitle(e.target.value)}
        />

        {/* Единый блок для полей ввода информации об идее - Светло-фиолетовый фон */}
        <div className="idea-details-block">
            {/* Отдельный белый блок для Секции Проблемы */}
            <div className="idea-section-inner">
                <h3>Проблема</h3>
                <textarea
                    placeholder="Описание проблемы"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                ></textarea>
            </div>

            {/* Отдельный белый блок для Секции Предлагаемого решения */}
            <div className="idea-section-inner">
                <h3>Предлагаемое решение</h3>
                <textarea
                    placeholder="Описание предлагаемого решения"
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                ></textarea>
            </div>

            {/* Отдельный белый блок для Секции Ожидаемого результата */}
            <div className="idea-section-inner">
                <h3>Ожидаемый результат</h3>
                <textarea
                    placeholder="Описание ожидаемого результата"
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                ></textarea>
            </div>

            {/* Отдельный белый блок для Секции Описания необходимых ресурсов */}
            <div className="idea-section-inner">
                <h3>Описание необходимых ресурсов для реализации</h3>
                <textarea
                    placeholder="Описание ресурсов"
                    value={resources}
                    onChange={(e) => setResources(e.target.value)}
                ></textarea>
            </div>

            {/* Отдельный белый блок для Стека технологий */}
            <div className="idea-section-inner">
                <h3>Стек технологий</h3>
                <input
                    type="text"
                    placeholder="Например: React, Node.js, MongoDB"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    onKeyDown={handleTechStackKeyPress}
                />
                {/* Контейнер для отображения добавленных элементов стека технологий */}
                <div className="tech-stack-items-container">
                    {techStackItems.map((item, index) => {
                        return (
                            <span
                                key={index}
                                className="tech-stack-item"
                                style={{ backgroundColor: item.color }}
                            >
                                {item.name} {/* Используем сохраненное имя из объекта item */}
                                {/* Кнопка удаления */}
                                <span
                                    className="tech-stack-item-delete"
                                    onClick={() => handleRemoveTechStackItem(index)} // Вызываем функцию удаления
                                >
                                    &times; {/* Символ крестика */}
                                </span>
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>


        {/* Контейнер для комментариев */}
        <div className="comments-container">
            {/* Блок со списком комментариев */}
            <div className="comments-list-block">
                <h3>Комментарии</h3>
                {/* Список комментариев */}
                <div className="comments-list">
                    {commentsList.map((comment, index) => (
                    <div key={index} className="comment-item"> {/* Используем обновленный стиль comment-item */}
                        <div className="comment-author">
                        <BiUserCircle size={20} />
                        <span>{comment.author}</span> {/* Отображаем имя автора */}
                        </div>
                        <div className="comment-text">{comment.text}</div>
                         {/* Кнопка удаления комментария */}
                        <span
                            className="comment-item-delete"
                            onClick={() => handleRemoveComment(index)} // Вызываем функцию удаления комментария
                        >
                            &times; {/* Символ крестика */}
                        </span>
                    </div>
                    ))}
                </div>
            </div>

            {/* Блок с формой добавления комментария */}
            <div className="add-comment-form-block">
                <div className="add-comment-form">
                    <input
                    type="text"
                    placeholder="Добавить комментарий"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                    />
                    <button onClick={handleAddComment}><IoSend size={20} /></button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default IdeaCreationModal;
