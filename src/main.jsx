import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import FP from './FP/ForgotPassword.jsx'
import Login from './Login/Login.jsx'
import MainPage from './Main/Main.jsx'
import Registration from './Registration/Registration.jsx'
import TeamPage from './Team/team.jsx'
import './Main/desktop.css'
import './Main/mobile.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Оборачиваем всю структуру маршрутизации в BrowserRouter */}
    <BrowserRouter>
      {/* Определяем набор маршрутов */}
      <Routes>
        {/* Маршрут для страницы логина */}
        {/* path="/" означает, что этот компонент будет рендериться на корневом URL (например, http://localhost:5173/) */}
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/fp" element={<FP />}/>
        <Route path="/teams" element={<TeamPage/>}/>
        {/* Маршрут для страницы регистрации */}
        {/* path="/registration" означает, что этот компонент будет рендериться на URL /registration (например, http://localhost:5173/registration) */}
        <Route path="/registration" element={<Registration />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
