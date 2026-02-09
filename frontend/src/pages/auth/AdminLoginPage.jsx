import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AlertCircle, Zap, Sun, Moon, Shield, Loader2, Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login: authLogin, logout } = useAuth();
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
      setError(t('adminLogin.emailRequired'));
      return;
    }
    if (!password.trim()) {
      setError(t('adminLogin.passwordRequired'));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authLogin(email, password);

      if (response.success) {
        const user = response.data.user;
        
        // Only allow admin role
        if (user.role !== "admin") {
          setError(t('adminLogin.notAdmin'));
          logout();
          setLoading(false);
          return;
        }

        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || t('adminLogin.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        isDark ? 'bg-[#0a0a0b]' : 'bg-gray-50'
      }`} 
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Background Effects — Purple theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? 'bg-purple-500/10' : 'bg-purple-500/5'
        }`} />
        <div 
          className={`absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? 'bg-pink-500/10' : 'bg-pink-500/5'
          }`} 
          style={{ animationDelay: '1s' }} 
        />
        {isDark && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,11,0.9)_100%)]" />
        )}
      </div>

      {/* Top Controls */}
      <div className={`absolute top-6 ${isAr ? 'left-6' : 'right-6'} flex items-center gap-2`}>
        <button
          onClick={toggleLanguage}
          className={`px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
            isDark 
              ? 'bg-[#111113] border border-[#1f1f23] text-purple-400 hover:bg-[#1a1a1d]' 
              : 'bg-white border border-gray-200 text-purple-600 hover:bg-gray-50 shadow-sm'
          }`}
        >
          {lang === 'ar' ? 'EN' : 'ع'}
        </button>
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

      {/* Back to Client */}
      <button
        onClick={() => navigate("/login")}
        className={`absolute top-6 ${isAr ? 'right-6' : 'left-6'} flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isDark 
            ? 'bg-[#111113] border border-[#1f1f23] text-gray-400 hover:text-white hover:bg-[#1a1a1d]' 
            : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 shadow-sm'
        }`}
      >
        <BackArrow className="w-4 h-4" />
        {t('adminLogin.backToClient')}
      </button>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Sondos AI
            </span>
          </div>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            {t('adminLogin.portalName')}
          </p>
        </div>

        {/* Login Card */}
        <div className={`rounded-3xl p-8 border transition-colors duration-300 ${
          isDark 
            ? 'bg-[#111113] border-[#1f1f23]' 
            : 'bg-white border-gray-200 shadow-xl'
        }`}>
          {/* Admin badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-5 ${
            isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'
          }`}>
            <Shield className="w-3.5 h-3.5" />
            ADMIN
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-500">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('adminLogin.title')}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('adminLogin.subtitle')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('adminLogin.email')}
              </label>
              <div className="relative">
                <Mail className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="email"
                  placeholder="admin@sondos-ai.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  disabled={loading}
                  dir="ltr"
                  className={`w-full ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 text-left focus:ring-purple-500/50 focus:border-purple-500 ${
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
                {t('adminLogin.password')}
              </label>
              <div className="relative">
                <Lock className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  disabled={loading}
                  className={`w-full ${isAr ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 ${
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
              className={`w-full py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-purple-500/25 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('adminLogin.loggingIn')}
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  {t('adminLogin.loginBtn')}
                </>
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <a href="#" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                {t('adminLogin.forgotPassword')}
              </a>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className={`text-center text-sm mt-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {t('adminLogin.copyright')}
        </p>
      </div>
    </div>
  );
}
