import Link from 'next/link';

export const metadata = {
  title: 'How to Find Your ESPN Cookies | You Suck at Fantasy Football',
  description: 'Step-by-step instructions for finding your ESPN cookies to analyze private fantasy football leagues.',
};

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          ← Back to analyzer
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 text-white px-6 py-5">
            <h1 className="text-xl font-bold">How to Find Your ESPN Cookies</h1>
            <p className="text-gray-400 text-sm mt-1">
              Required for private leagues only
            </p>
          </div>

          {/* Video Section */}
          <div className="px-6 py-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Video Tutorial
            </h2>
            <div className="relative rounded-lg overflow-hidden" style={{ paddingBottom: '54.48%' }}>
              <iframe
                src="https://www.loom.com/embed/64b9d53b4a164f47b6935e74795c9799"
                frameBorder="0"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
          </div>

          {/* Why needed */}
          <div className="px-6 py-6 border-b border-gray-100 bg-amber-50">
            <h2 className="text-sm font-semibold text-amber-800 mb-2">
              Why do I need to do this?
            </h2>
            <p className="text-sm text-amber-700">
              ESPN doesn&apos;t provide a public API or login system for third-party apps.
              For private leagues, we need your session cookies to access your league data.
              These cookies are like a temporary password that lets us fetch your league
              info without ever seeing your actual ESPN login credentials.
            </p>
          </div>

          {/* Steps */}
          <div className="px-6 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step-by-Step Instructions
            </h2>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Open ESPN Fantasy Football in your browser
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Go to{' '}
                    <a
                      href="https://fantasy.espn.com/football"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      fantasy.espn.com/football
                    </a>
                    {' '}and make sure you&apos;re logged in to your ESPN account.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Open Developer Tools
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Right-click anywhere on the page and select <strong>&quot;Inspect&quot;</strong>,
                    or use these keyboard shortcuts:
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• <strong>Chrome/Edge (Windows):</strong> Press <code className="bg-gray-100 px-1.5 py-0.5 rounded">F12</code> or <code className="bg-gray-100 px-1.5 py-0.5 rounded">Ctrl + Shift + I</code></li>
                    <li>• <strong>Chrome (Mac):</strong> Press <code className="bg-gray-100 px-1.5 py-0.5 rounded">Cmd + Option + I</code></li>
                    <li>• <strong>Safari:</strong> Enable Developer menu in Preferences → Advanced, then press <code className="bg-gray-100 px-1.5 py-0.5 rounded">Cmd + Option + I</code></li>
                    <li>• <strong>Firefox:</strong> Press <code className="bg-gray-100 px-1.5 py-0.5 rounded">F12</code> or <code className="bg-gray-100 px-1.5 py-0.5 rounded">Ctrl/Cmd + Shift + I</code></li>
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Go to the Application tab
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    In the Developer Tools panel, click on the <strong>&quot;Application&quot;</strong> tab
                    at the top. In Firefox, this is called <strong>&quot;Storage&quot;</strong>.
                  </p>
                  <p className="text-sm text-gray-500 mt-2 italic">
                    If you don&apos;t see it, click the <strong>&gt;&gt;</strong> arrows to reveal more tabs.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Find the ESPN cookies
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    In the left sidebar, expand <strong>&quot;Cookies&quot;</strong> and click on
                    <strong> https://fantasy.espn.com</strong> (or any espn.com domain).
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Copy the two cookie values
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Look for these two cookies in the list and copy their values:
                  </p>
                  <div className="mt-3 space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-mono text-sm font-semibold text-gray-900">espn_s2</p>
                      <p className="text-xs text-gray-500 mt-1">
                        A long string of letters and numbers (usually 200+ characters)
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-mono text-sm font-semibold text-gray-900">SWID</p>
                      <p className="text-xs text-gray-500 mt-1">
                        A shorter string that looks like: {'{'}XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX{'}'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Include the curly braces!</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  6
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Paste them into the form
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Go back to our analyzer, expand the &quot;Private League?&quot; section,
                    and paste each cookie value into its respective field.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="px-6 py-6 border-t border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Troubleshooting
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-700">Can&apos;t find the cookies?</p>
                <p>Make sure you&apos;re logged into ESPN. The cookies only appear when you have an active session.</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Still getting an error?</p>
                <p>Try logging out of ESPN and logging back in, then grab fresh cookie values.</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">On mobile?</p>
                <p>Unfortunately, you&apos;ll need to use a desktop browser to access Developer Tools and find your cookies.</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="px-6 py-6 border-t border-gray-100">
            <Link
              href="/"
              className="block w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-center"
            >
              Back to Analyzer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
