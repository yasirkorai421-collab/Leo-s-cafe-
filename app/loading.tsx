export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
      <div className="text-center">
        {/* Animated Logo Spinner */}
        <div className="mb-6 inline-block relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
          Loading...
        </h2>
        <p className="text-gray-500 text-sm sm:text-base max-w-xs mx-auto">
          Preparing your delicious experience at Leo's Cafe
        </p>
        
        {/* Loading dots animation */}
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
