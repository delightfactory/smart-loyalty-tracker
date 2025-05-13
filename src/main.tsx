import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx'
import './index.css'
import 'nprogress/nprogress.css'
import { registerSW } from 'virtual:pwa-register';

// تسجيل Service Worker للعملية وجلب التحديثات
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <Router>
    <App />
  </Router>
);
