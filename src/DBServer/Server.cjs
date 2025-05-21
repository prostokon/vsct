const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Импортируем библиотеку bcrypt

const saltRounds = 10;

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'main_db',
  password: 'denis',
  port: 5432
});

pool.connect(err => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.stack);
  } else {
    console.log('Подключение к базе данных PostgreSQL установлено.');
  }
});

app.get('/api/ideas', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, state, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, title, created_at 
      FROM ideas
    `;
    let countQuery = `
      SELECT COUNT(*) 
      FROM ideas
    `;

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (state) {
      conditions.push(`state = $${params.length + 1}`);
      params.push(state);
    }

    if (search) {
      conditions.push(`title ILIKE $${params.length + 1}`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += `
      ORDER BY created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const [ideasRes, countRes] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);

    res.json({
      ideas: ideasRes.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limit),
        totalIdeas: parseInt(countRes.rows[0].count)
      }
    });

  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/register', async (req, res) => {
  const { email, group, password, surname, name, patronymic } = req.body;

  // *** СЕРВЕРНАЯ ВАЛИДАЦИЯ ***
  if (!email || !group || !password || !surname || !name) {
      return res.status(400).json({ error: 'Не все обязательные поля заполнены.' });
  }
  if (password.length < 8) {
       return res.status(400).json({ error: 'Пароль должен быть не менее 8 символов.' });
  }
   if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ error: 'Введите корректный формат почты.' });
    }

  // Объявляем result здесь, чтобы он был доступен в catch блоке
  let result = undefined;

try {
  // Проверка, не существует ли уже пользователь с таким email
  const checkUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с такой почтой уже зарегистрирован.' });
  }

  // --- ХЕШИРОВАНИЕ ПАРОЛЯ ---
  const passwordHash = await bcrypt.hash(password, saltRounds);
  // Теперь мы будем сохранять passwordHash вместо исходного пароля
  const userTypeId = 1;

  result = await pool.query(
    `INSERT INTO users (email, group_name, password_hash, surname, name, patronymic, user_type_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id;`, // Запрос на вставку с возвратом ID
    [email, group, passwordHash, surname, name, patronymic, userTypeId]
  );

  if (result && result.rows && result.rows.length > 0) {
        console.log('Новый пользователь зарегистрирован с ID:', result.rows[0].id);
        // Отправляем успешный ответ
        res.status(201).json({ message: 'Пользователь успешно зарегистрирован!', userId: result.rows[0].id });
    } else {
        // Этот случай маловероятен при успешной вставке с RETURNING, но добавляет устойчивость
        console.error("INSERT query completed, but result or rows were unexpected:", result);
        res.status(500).json({ error: 'Ошибка сервера после вставки данных.' });
    }

} catch (err) {
  // Этот catch блок выполняется, если pool.query выбросил ошибку
  console.error('Ошибка при регистрации пользователя:', err);

  // Обработка специфических ошибок базы данных
  if (err.code === '23505') { // Код ошибки уникального ограничения в PostgreSQL
       res.status(400).json({ error: 'Пользователь с такой почтой уже зарегистрирован.' });
  } else {
      // Если это не ошибка уникальности или другая известная ошибка БД, отправляем общую ошибку сервера
      res.status(500).json({ error: 'Произошла внутренняя ошибка сервера при регистрации.' });
  }
}
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  // Получаем учетные данные из тела запроса
  const { email, password } = req.body; // Ожидаем только 'email'

  // *** СЕРВЕРНАЯ ВАЛИДАЦИЯ ***
  if (!email || !password) {
    // Обновлено сообщение об ошибке
    return res.status(400).json({ error: 'Почта и пароль обязательны.' });
  }
  // Опционально: добавить серверную проверку формата email здесь тоже

  try {
    // Ищем пользователя в базе данных по email
    const result = await pool.query('SELECT id, email, password_hash, user_type_id, name, surname FROM users WHERE email = $1', [email]); // Ищем по email

    // Проверяем, найден ли пользователь
    if (result.rows.length === 0) {
      // Пользователь не найден
      // Обновлено сообщение об ошибке
      return res.status(401).json({ error: 'Неверная почта или пароль.' }); // 401 Unauthorized
    }

    const user = result.rows[0]; // Получаем данные пользователя

    // --- СРАВНЕНИЕ ПАРОЛЯ ---
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    // Проверяем результат сравнения паролей
    if (!passwordMatch) {
      // Пароли не совпадают
      // Обновлено сообщение об ошибке
      return res.status(401).json({ error: 'Неверная почта или пароль.' }); // 401 Unauthorized
    }

    // --- УСПЕШНЫЙ ВХОД ---
    console.log('Пользователь успешно вошел:', user.email);

    res.status(200).json({
      message: 'Вход выполнен успешно!',
      user: {
        id: user.id,
        email: user.email,
        user_type_id: user.user_type_id,
        name: user.name,
        surname: user.surname,
      }
    });

  } catch (err) {
    console.error('Ошибка при входе пользователя:', err);
    res.status(500).json({ error: 'Произошла внутренняя ошибка сервера при входе.' });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});