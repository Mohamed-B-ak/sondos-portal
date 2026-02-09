import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] text-white p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold mb-2">حدث خطأ غير متوقع</h2>
            <p className="text-gray-400 mb-6">نعتذر عن هذا الخطأ. يرجى إعادة تحميل الصفحة.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 rounded-xl text-white font-medium transition-colors"
            >
              إعادة التحميل
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
