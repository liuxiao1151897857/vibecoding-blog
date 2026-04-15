import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminLogin() {
  const { login, hasPassword, setPassword, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [password, setPasswordInput] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 已登录则跳转
  if (isAuthenticated) {
    navigate('/admin', { replace: true })
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!hasPassword) {
        // 首次设置密码
        if (password.length < 6) {
          setError('密码至少 6 位')
          return
        }
        if (password !== confirmPwd) {
          setError('两次密码不一致')
          return
        }
        await setPassword(password)
        navigate('/admin', { replace: true })
      } else {
        // 登录验证
        const ok = await login(password)
        if (ok) {
          navigate('/admin', { replace: true })
        } else {
          setError('密码错误，请重试')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center">
              <Lock className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-1">
            {hasPassword ? '管理员登录' : '设置管理密码'}
          </h1>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
            {hasPassword ? '请输入密码进入管理后台' : '首次使用，请设置一个管理密码'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {hasPassword ? '密码' : '设置密码'}
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder={hasPassword ? '请输入密码' : '至少 6 位'}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!hasPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  确认密码
                </label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  placeholder="再次输入密码"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? '处理中...' : hasPassword ? '登录' : '设置密码并进入'}
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-gray-400">
            密码以 SHA-256 哈希存储于 localStorage
          </p>
        </div>
      </div>
    </div>
  )
}
