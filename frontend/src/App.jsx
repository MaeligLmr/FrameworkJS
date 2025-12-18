import {Header} from './components/layout/Header'
import {Footer} from './components/layout/Footer'
import { Routes, Route } from 'react-router-dom'
import {Home} from './pages/Home'
import {ArticleDetail} from './pages/ArticleDetail'
import {CreateArticle} from './pages/CreateArticle'
import {Login} from './pages/Login'
import {Register} from './pages/Register'
import {Profile} from './pages/Profile'
import RequireAuth from './components/auth/RequireAuth';
import { useAuth } from './context/AuthContext';
import Loader from './components/common/Loader';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900 ">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
        <Route path="/create" element={<RequireAuth><CreateArticle /></RequireAuth>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/profile/:id" element={<RequireAuth><Profile /></RequireAuth>} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App