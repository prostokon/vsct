const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer'); // Импортируем multer
const path = require('path'); // Импортируем path для работы с путями файлов
const fs = require('fs'); // Импортируем fs для работы с файловой системой

const saltRounds = 10;

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Создаем папку для загрузки аватаров, если ее нет
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Настройка Multer для хранения файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Папка, куда будут сохраняться файлы
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла, чтобы избежать конфликтов
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Обслуживание статических файлов из папки 'uploads'
app.use('/uploads', express.static(uploadsDir));


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

// GET /api/users/:id - Получение информации о пользователе по ID
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, email, group_name, name, surname, patronymic, user_type_id, created_at AS registration_date, phone, avatar_url
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при получении данных пользователя:', err);
    res.status(500).json({ error: 'Произошла внутренняя ошибка сервера.' });
  }
});

// PUT /api/users/:id - Обновление информации о пользователе по ID
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  // Добавляем avatar_url в список полей, которые могут быть обновлены
  const { email, group_name, name, surname, patronymic, phone, avatar_url } = req.body;

  try {
    const updateFields = [];
    const updateParams = [];
    let paramIndex = 1;

    if (email !== undefined) { updateFields.push(`email = $${paramIndex++}`); updateParams.push(email); }
    if (group_name !== undefined) { updateFields.push(`group_name = $${paramIndex++}`); updateParams.push(group_name); }
    if (name !== undefined) { updateFields.push(`name = $${paramIndex++}`); updateParams.push(name); }
    if (surname !== undefined) { updateFields.push(`surname = $${paramIndex++}`); updateParams.push(surname); }
    if (patronymic !== undefined) { updateFields.push(`patronymic = $${paramIndex++}`); updateParams.push(patronymic); }
    if (phone !== undefined) { updateFields.push(`phone = $${paramIndex++}`); updateParams.push(phone); }
    // Добавляем avatar_url для обновления
    if (avatar_url !== undefined) { updateFields.push(`avatar_url = $${paramIndex++}`); updateParams.push(avatar_url); }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Нет полей для обновления.' });
    }

    updateParams.push(id); // Последний параметр - ID пользователя

    const result = await pool.query(
      `UPDATE users
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, email, group_name, name, surname, patronymic, phone, user_type_id, created_at, avatar_url;`, // Возвращаем avatar_url
      updateParams
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден.' });
    }

    res.status(200).json({ message: 'Данные пользователя успешно обновлены!', user: result.rows[0] });
  } catch (err) {
    console.error('Ошибка при обновлении данных пользователя:', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Пользователь с такой почтой уже существует.' });
    }
    res.status(500).json({ error: 'Произошла внутренняя ошибка сервера при обновлении данных.' });
  }
});


app.post('/api/register', async (req, res) => {
  const { email, group, password, surname, name, patronymic } = req.body;

  if (!email || !group || !password || !surname || !name) {
      return res.status(400).json({ error: 'Не все обязательные поля заполнены.' });
  }
  if (password.length < 8) {
        return res.status(400).json({ error: 'Пароль должен быть не менее 8 символов.' });
  }
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ error: 'Введите корректный формат почты.' });
    }

  let result = undefined;

try {
  const checkUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с такой почтой уже зарегистрирован.' });
  }

  const passwordHash = await bcrypt.hash(password, saltRounds);
  const userTypeId = 1;

  result = await pool.query(
    `INSERT INTO users (email, group_name, password_hash, surname, name, patronymic, user_type_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;`,
    [email, group, passwordHash, surname, name, patronymic, userTypeId]
  );

  if (result && result.rows && result.rows.length > 0) {
        console.log('Новый пользователь зарегистрирован с ID:', result.rows[0].id);
        res.status(201).json({ message: 'Пользователь успешно зарегистрирован!', userId: result.rows[0].id });
    } else {
        console.error("INSERT query completed, but result or rows were unexpected:", result);
        res.status(500).json({ error: 'Ошибка сервера после вставки данных.' });
    }

} catch (err) {
  console.error('Ошибка при регистрации пользователя:', err);
  if (err.code === '23505') {
        res.status(400).json({ error: 'Пользователь с такой почтой уже зарегистрирован.' });
  } else {
      res.status(500).json({ error: 'Произошла внутренняя ошибка сервера при регистрации.' });
  }
}
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Почта и пароль обязательны.' });
  }

  try {
    const result = await pool.query('SELECT id, email, password_hash, user_type_id, name, surname, group_name, patronymic, phone, created_at, avatar_url FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверная почта или пароль.' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Неверная почта или пароль.' });
    }

    console.log('Пользователь успешно вошел:', user.email);

    res.status(200).json({
      message: 'Вход выполнен успешно!',
      user: {
        id: user.id,
        email: user.email,
        user_type_id: user.user_type_id,
        name: user.name,
        surname: user.surname,
        group_name: user.group_name,
        patronymic: user.patronymic,
        phone: user.phone,
        created_at: user.created_at,
        avatar_url: user.avatar_url // Включаем avatar_url в ответ логина
      }
    });

  } catch (err) {
    console.error('Ошибка при входе пользователя:', err);
    res.status(500).json({ error: 'Произошла внутренняя ошибка сервера при входе.' });
  }
});


// НОВЫЕ ЭНДПОИНТЫ ДЛЯ КОМПЕТЕНЦИЙ

// GET /api/competencies - Получить все компетенции, сгруппированные по типам
app.get('/api/competencies', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
          ct.name AS type_name,
          c.id AS competency_id,
          c.name AS competency_name
      FROM
          competency_types ct
      JOIN
          competencies c ON ct.id = c.type_id
      ORDER BY
          ct.name, c.name;
    `);

    // Группируем компетенции по их типам для удобства на фронтенде
    const groupedCompetencies = result.rows.reduce((acc, row) => {
      if (!acc[row.type_name]) {
        acc[row.type_name] = [];
      }
      acc[row.type_name].push({
        id: row.competency_id,
        name: row.competency_name
      });
      return acc;
    }, {});

    res.status(200).json(groupedCompetencies);
  } catch (err) {
    console.error('Ошибка при получении списка компетенций:', err);
    res.status(500).json({ error: 'Произошла внутренняя ошибка сервера при получении компетенций.' });
  }
});

// GET /api/users/:id/competencies - Получить компетенции конкретного пользователя
app.get('/api/users/:id/competencies', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT
          uc.competency_id,
          c.name AS competency_name,
          ct.name AS type_name
       FROM
          user_competencies uc
       JOIN
          competencies c ON uc.competency_id = c.id
       JOIN
          competency_types ct ON c.type_id = ct.id
       WHERE
          uc.user_id = $1;
      `,
      [id]
    );
    // Возвращаем список ID компетенций пользователя
    const userCompetencyIds = result.rows.map(row => row.competency_id);
    res.status(200).json(userCompetencyIds);
  } catch (err) {
    console.error('Ошибка при получении компетенций пользователя:', err);
    res.status(500).json({ error: 'Произошла внутренняя ошибка сервера при получении компетенций пользователя.' });
  }
});

// PUT /api/users/:id/competencies - Обновить компетенции пользователя
app.put('/api/users/:id/competencies', async (req, res) => {
  const { id } = req.params;
  const { selectedCompetencyIds } = req.body; // Ожидается массив ID компетенций

  if (!Array.isArray(selectedCompetencyIds)) {
    return res.status(400).json({ error: 'Неверный формат данных: selectedCompetencyIds должен быть массивом.' });
  }

  const client = await pool.connect(); // Используем клиент для транзакции
  try {
    await client.query('BEGIN'); // Начинаем транзакцию

    // 1. Удаляем все текущие компетенции пользователя
    await client.query('DELETE FROM user_competencies WHERE user_id = $1;', [id]);

    // 2. Вставляем новые компетенции, используя параметризованный запрос
    if (selectedCompetencyIds.length > 0) {
      const placeholders = selectedCompetencyIds.map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`).join(',');
      const values = selectedCompetencyIds.flatMap(comp_id => [id, comp_id]);

      await client.query(
        `INSERT INTO user_competencies (user_id, competency_id) VALUES ${placeholders};`,
        values
      );
    }

    await client.query('COMMIT'); // Завершаем транзакцию
    res.status(200).json({ message: 'Компетенции пользователя успешно обновлены!' });

  } catch (err) {
    await client.query('ROLLBACK'); // Откатываем транзакцию в случае ошибки
    console.error('Ошибка при обновлении компетенций пользователя:', err);
    res.status(500).json({ error: 'Произошла внутренняя ошибка сервера при обновлении компетенций пользователя.' });
  } finally {
    client.release(); // Обязательно освобождаем клиент пула
  }
});

// НОВЫЙ ЭНДПОИНТ: Загрузка аватара
app.post('/api/upload-avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не был загружен.' });
  }
  // Возвращаем URL загруженного файла
  // URL будет: http://localhost:5000/uploads/имя_файла.jpg
  const avatarUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ message: 'Аватар успешно загружен!', avatarUrl: avatarUrl });
});

// MODIFIED: GET /api/teams/:id/members - Получение участников команды по ID команды
app.get('/api/teams/:id/members', async (req, res) => {
  const { id } = req.params; // id здесь - это team_id
  console.log(`Получен запрос на участников команды для team_id: ${id}`);
  try {
    const result = await pool.query(
      `SELECT
          tm.user_id,
          u.name,
          u.surname,
          u.email,
          tm.role_in_team -- Возвращаем role_in_team
       FROM
          team_members tm
       JOIN
          users u ON tm.user_id = u.id
       WHERE
          tm.team_id = $1;
      `,
      [id]
    );
    console.log(`Найдено участников: ${result.rows.length} для team_id: ${id}`);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении участников команды:', err);
    res.status(500).json({ error: 'Произошла внутренняя ошибка сервера при получении участников команды.' });
  }
});
app.patch('/api/teams/:id', async (req, res) => {
  const { id } = req.params;
  const { status, poll_passed } = req.body;
  if (status === undefined && poll_passed === undefined) {
    return res.status(400).json({ error: 'Нет полей для обновления.' });
  }
  try {
    const updateFields = [];
    const updateParams = [];
    let paramIndex = 1;
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      updateParams.push(status);
    }
    if (poll_passed !== undefined) {
      updateFields.push(`poll_passed = $${paramIndex++}`);
      updateParams.push(!!poll_passed);
    }
    updateParams.push(id);
    const result = await pool.query(
      `UPDATE teams SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *;`,
      updateParams
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Команда не найдена.' });
    }
    res.status(200).json({ message: 'Данные команды успешно обновлены!', team: result.rows[0] });
  } catch (err) {
    console.error('Ошибка при обновлении данных команды:', err);
    res.status(500).json({ error: 'Произошла внутренняя ошибка сервера при обновлении команды.' });
  }
});

// MODIFIED: GET /api/teams - Получение списка команд с фильтрацией и поиском
app.get('/api/teams', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, is_occupied, poll_passed, search_scope, tech_stack_search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT
        t.id,
        t.team_name,
        t.is_occupied,
        t.num_participants,
        t.status,
        t.poll_passed,
        t.created_at,
        t.description,
        t.tech_stack,
        t.creator_id, -- Добавляем creator_id
        u.name AS owner_name,
        u.surname AS owner_surname
      FROM
        teams t
      JOIN
        users u ON t.creator_id = u.id -- Присоединяем таблицу users для получения данных владельца
    `;
    let countQuery = `
      SELECT COUNT(*)
      FROM teams t
    `;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Фильтрация по поисковому запросу (team_name)
    if (search) {
      conditions.push(`t.team_name ILIKE $${paramIndex++}`);
      params.push(`%${search}%`);
    }

    // Фильтрация по занятости команды (is_occupied)
    if (is_occupied !== undefined && (is_occupied === 'true' || is_occupied === 'false')) {
      conditions.push(`t.is_occupied = $${paramIndex++}`);
      params.push(is_occupied === 'true'); // Преобразуем строку в булево значение
    }

    // Фильтрация по статусу опроса (poll_passed)
    if (poll_passed !== undefined && (poll_passed === 'true' || poll_passed === 'false')) {
      conditions.push(`t.poll_passed = $${paramIndex++}`);
      params.push(poll_passed === 'true'); // Преобразуем строку в булево значение
    }

    // Поиск по стеку технологий (tech_stack)
    if (tech_stack_search && search_scope === 'tech_stack') {
      conditions.push(`EXISTS (SELECT 1 FROM unnest(t.tech_stack) AS ts WHERE ts ILIKE $${paramIndex++})`);
      params.push(`%${tech_stack_search}%`);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += `
      ORDER BY t.created_at DESC
      LIMIT $${paramIndex++}
      OFFSET $${paramIndex++}
    `;
    params.push(limit, offset);

    const [teamsRes, countRes] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2)) // Для countQuery не нужны limit и offset
    ]);

    res.json({
      teams: teamsRes.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limit),
        totalTeams: parseInt(countRes.rows[0].count)
      }
    });
    app.post('/api/teams', async (req, res) => {
  const { team_name, description, tech_stack, num_participants, creator_id } = req.body;
  if (!team_name || !creator_id || !num_participants) {
    return res.status(400).json({ error: 'Не все обязательные поля заполнены.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO teams (team_name, description, tech_stack, num_participants, creator_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [
        team_name,
        description || null,
        tech_stack && Array.isArray(tech_stack) ? tech_stack : [],
        parseInt(num_participants, 10),
        creator_id
      ]
    );
    res.status(201).json({ message: 'Команда успешно создана!', team: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Команда с таким названием уже существует.' });
    }
    console.error('Ошибка при создании команды:', err);
    res.status(500).json({ error: 'Ошибка сервера при создании команды.' });
  }
});
    
  } catch (err) {
    console.error('Database error (GET /api/teams):', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/ideas', async (req, res) => {
  try {
    const {
      title,
      problem_description,
      proposed_solution,
      resources_needed,
      tech_stack,
      comments
    } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Название идеи обязательно.' });
    }
    // comments должен быть массивом строк (например, ["Имя: текст", ...])
    const commentsArray = Array.isArray(comments) ? comments : [];
    const result = await pool.query(
      `INSERT INTO ideas (
        title,
        status,
        state,
        problem_description,
        proposed_solution,
        resources_needed,
        tech_stack,
        comments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::text[])
      RETURNING *;`,
      [
        title,
        'На согласовании', // статус по умолчанию
        'Новая',           // состояние по умолчанию
        problem_description || null,
        proposed_solution || null,
        resources_needed || null,
        Array.isArray(tech_stack) ? tech_stack : [],
        commentsArray
      ]
    );
    res.status(201).json({ message: 'Идея успешно создана!', idea: result.rows[0] });
  } catch (err) {
    console.error('Ошибка при создании идеи:', err);
    res.status(500).json({ error: 'Ошибка сервера при создании идеи.' });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
