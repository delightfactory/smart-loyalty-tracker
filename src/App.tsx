import { Routes, Route } from 'react-router-dom';
import RequireAuth from './components/auth/RequireAuth';
import Login from './pages/Login'; // هذا مجرد مثال، ستحتاج لإنشاء صفحة تسجيل الدخول
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
// استيراد بقية الصفحات...

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/users" element={<RequireAuth><Users /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      {/* إضافة بقية المسارات مع حماية RequireAuth */}
    </Routes>
  );
}

export default App;
