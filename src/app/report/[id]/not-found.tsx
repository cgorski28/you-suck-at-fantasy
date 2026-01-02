import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FF</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">
              YouSuckAtFantasyFootball<span className="text-red-600">.com</span>
            </h1>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Report Not Found
          </h2>
          <p className="text-gray-500 mb-8">
            This report doesn&apos;t exist or may have expired.
            Generate a new one to see how bad you really are at fantasy football.
          </p>
          <Link
            href="/"
            className="inline-block py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Generate Your Own Report
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            We are not responsible for your hurt feelings.
          </p>
        </div>
      </footer>
    </div>
  );
}
