import { createBrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { initializeStorage } from './lib/storage'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Blog from './pages/Blog'
import Post from './pages/Post'
import About from './pages/About'

// 初始化 localStorage 种子数据
initializeStorage()

function AppWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

// ---- 路由配置 ----
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppWrapper><Layout /></AppWrapper>,
    children: [
      { index: true,              element: <Home /> },
      { path: 'articles',         element: <Blog /> },
      { path: 'articles/:slug',   element: <Post /> },
      { path: 'about',            element: <About /> },
    ],
  },
])
