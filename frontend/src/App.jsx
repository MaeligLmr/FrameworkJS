import {Header} from './components/layout/Header'
import {Footer} from './components/layout/Footer'
import { Routes, Route } from 'react-router-dom'
import {Home} from './pages/Home'
import {ArticleDetail} from './pages/ArticleDetail'
import {CreateArticle} from './pages/CreateArticle'
import {MyArticles} from './pages/MyArticles'
import {Login} from './pages/Login'
import {Register} from './pages/Register'
import {Profile} from './pages/Profile'
import RequireAuth from './components/auth/RequireAuth';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
        <Route path="/create" element={<RequireAuth><CreateArticle /></RequireAuth>} />
        <Route path="/my-articles" element={<RequireAuth><MyArticles /></RequireAuth>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
