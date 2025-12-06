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

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
        <Route path="/create" element={<CreateArticle />} />
        <Route path="/my-articles" element={<MyArticles />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
