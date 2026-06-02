import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { initializeStorage } from './lib/storage'
import Layout from './components/layout/Layout'
import AdminLayout from './components/layout/AdminLayout'
import AdminGuard from './components/admin/AdminGuard'
import Home from './pages/Home'
import Blog from './pages/Blog'
import Post from './pages/Post'
import About from './pages/About'
import Projects from './pages/Projects'
import AI from './pages/AI'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminArticles from './pages/admin/AdminArticles'
import AdminArticleEdit from './pages/admin/AdminArticleEdit'
import AdminProfile from './pages/admin/AdminProfile'

const ResumeHub = lazy(() => import('./pages/resume/ResumeHub'))
const ResumeWizard = lazy(() => import('./pages/resume/ResumeWizard'))
const DailyNotes = lazy(() => import('./pages/resume/DailyNotes'))
const ResumeTemplates = lazy(() => import('./pages/resume/ResumeTemplates'))
const ResumePreview = lazy(() => import('./pages/resume/ResumePreview'))

// 初始化 localStorage 种子数据
initializeStorage()

function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AuthProvider>
  )
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
      { path: 'projects',         element: <Projects /> },
      { path: 'ai',               element: <AI /> },
      { path: 'resume',           element: <Suspense fallback={<div>Loading...</div>}><ResumeHub /></Suspense> },
      { path: 'resume/create',    element: <Suspense fallback={<div>Loading...</div>}><ResumeWizard /></Suspense> },
      { path: 'resume/notes',     element: <Suspense fallback={<div>Loading...</div>}><DailyNotes /></Suspense> },
      { path: 'resume/templates', element: <Suspense fallback={<div>Loading...</div>}><ResumeTemplates /></Suspense> },
      { path: 'resume/preview/:id', element: <Suspense fallback={<div>Loading...</div>}><ResumePreview /></Suspense> },
    ],
  },
  {
    path: '/admin/login',
    element: <AppWrapper><AdminLogin /></AppWrapper>,
  },
  {
    path: '/admin',
    element: (
      <AppWrapper>
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      </AppWrapper>
    ),
    children: [
      { index: true,                        element: <AdminDashboard /> },
      { path: 'articles',                   element: <AdminArticles /> },
      { path: 'articles/new',               element: <AdminArticleEdit /> },
      { path: 'articles/:id/edit',          element: <AdminArticleEdit /> },
      { path: 'profile',                    element: <AdminProfile /> },
    ],
  },
])
