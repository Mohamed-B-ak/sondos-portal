import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { AlertCircle, Zap, Sun, Moon, User, Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { t, lang, toggleLanguage, isAr } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError(t('login.emailRequired'));
      return;
    }
    if (!password.trim()) {
      setError(t('login.passwordRequired'));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authLogin(email, password);

      if (response.success) {
        const user = response.data.user;
        navigate(user.role === "admin" ? "/admin" : "/");
      }
    } catch (err) {
      setError(err.message || t('login.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'
      }`} 
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-teal-500/10' : 'bg-teal-500/5'
        }`} />
        <div 
          className={`absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? 'bg-cyan-500/10' : 'bg-cyan-500/5'
          }`} 
          style={{ animationDelay: '1s' }} 
        />
        {isDark && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,11,0.9)_100%)]" />
        )}
      </div>

      {/* Top Controls */}
      <div className={`absolute top-6 ${isAr ? 'left-6' : 'right-6'} flex items-center gap-2`}>
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className={`px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
            isDark 
              ? 'bg-[#111113] border border-[#1f1f23] text-teal-400 hover:bg-[#1a1a1d]' 
              : 'bg-white border border-gray-200 text-teal-600 hover:bg-gray-50 shadow-sm'
          }`}
        >
          {lang === 'ar' ? 'EN' : 'ع'}
        </button>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl transition-all ${
            isDark 
              ? 'bg-[#111113] border border-[#1f1f23] text-yellow-400 hover:bg-[#1a1a1d]' 
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'
          }`}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Sondos AI
            </span>
          </div>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            {t('login.portalName')}
          </p>
        </div>

        {/* Login Card */}
        <div className={`rounded-3xl p-8 border transition-colors duration-300 ${
          isDark 
            ? 'bg-[#111113] border-[#1f1f23]' 
            : 'bg-white border-gray-200 shadow-xl'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-500/10 text-teal-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('login.title')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('login.subtitle')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="email"
                  placeholder="example@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  disabled={loading}
                  dir="ltr"
                  className={`w-full ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 text-left focus:ring-teal-500/50 focus:border-teal-500 ${
                    isDark 
                      ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  disabled={loading}
                  className={`w-full ${isAr ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 ${
                    isDark 
                      ? 'bg-[#0a0a0b] border-[#1f1f23] text-white placeholder-gray-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isAr ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                isDark 
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 bg-gradient-to-l from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-teal-500/25 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('login.loggingIn')}
                </>
              ) : (
                t('login.loginBtn')
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <a href="#" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
                {t('login.forgotPassword')}
              </a>
            </div>
          </form>

          {/* Register Link */}
          
            <div className={`text-center mt-6 pt-6 border-t border-dashed ${isDark ? 'border-[#1f1f23]' : 'border-gray-200'}`}>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                {t('login.noAccount')}{" "}
                <button 
                  onClick={() => navigate("/register")}
                  className="text-teal-500 hover:text-teal-400 font-medium"
                >
                  {t('login.createAccount')}
                </button>
              </p>
            </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 px-2">
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t('login.copyright')}
          </p>
          
            <button 
              onClick={() => navigate("/admin/login")}
              className={`text-xs transition-colors ${isDark ? 'text-gray-600 hover:text-gray-400' : 'text-gray-300 hover:text-gray-500'}`}
            >
              {t('login.adminLink')}
            </button>
        </div>
      </div>
    </div>
  );
}