
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import RequireAuth from './components/auth/RequireAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
// استيراد بقية الصفحات...

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* تغليف المسارات المحمية بمكون Layout */}
      <Route path="/" element={<RequireAuth><Layout><Dashboard /></Layout></RequireAuth>} />
      <Route path="/dashboard" element={<RequireAuth><Layout><Dashboard /></Layout></RequireAuth>} />
      <Route path="/users" element={<RequireAuth><Layout><Users /></Layout></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><Layout><Settings /></Layout></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Layout><Profile /></Layout></RequireAuth>} />
      {/* إضافة بقية المسارات مع حماية RequireAuth */}
    </Routes>
  );
}

export default App;
