export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {/* Animated Logo Spinner */}
        <div className="mb-4 inline-block">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Loading...
        </h2>
        <p className="text-gray-500 text-sm">
          Please wait while we prepare your experience
        </p>
      </div>
    </div>
  );
}
