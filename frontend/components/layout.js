// frontend/components/Layout.js
import Link from 'next/link';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <div className="text-xl font-semibold">🚍 Transit Feedback</div>
                <nav className="space-x-4 text-sm">
                    <Link href="/" className="hover:underline">Home</Link>
                    <Link href="/admin/analytics" className="hover:underline">Analytics</Link>
                    <Link href="/admin/charts" className="hover:underline">Charts</Link>
                </nav>
            </header>
            <main className="p-4">{children}</main>
            <footer className="text-center text-sm text-gray-500 mt-8 mb-4">
                © 2025 TransitAI • UC Berkeley AI Hackathon
            </footer>
        </div>
    );
}
