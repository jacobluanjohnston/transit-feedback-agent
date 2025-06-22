import { useState } from 'react';
import Layout from '../components/Layout';

export default function Submit() {
    const [text, setText] = useState('');
    const [location, setLocation] = useState('');
    const [agency, setAgency] = useState('');
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, location, agency })
        });

        const data = await response.json();
        setResult(data);
        setText('');
        setLocation('');
        setAgency('');
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-4">Submit Transit Feedback</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    className="w-full p-2 border rounded"
                    rows="4"
                    placeholder="Describe your issue..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <input
                    className="w-full p-2 border rounded"
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
                <select
                    className="w-full p-2 border rounded"
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                >
                    <option value="">-- Select an agency --</option>
                    <option value="BART">BART</option>
                    <option value="Muni Metro (SFMTA)">Muni Metro (SFMTA)</option>
                    <option value="Caltrain">Caltrain</option>
                    <option value="VTA">VTA Light Rail & Buses</option>
                    <option value="Amtrak">Amtrak</option>
                </select>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
            </form>

            {result && (
                <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded">
                    <p><strong>{result.message}</strong></p>
                    {result.tags?.length && (
                        <p><strong>Tags:</strong> {result.tags.join(', ')}</p>
                    )}
                    {result.similar_reports?.length && (
                        <div>
                            <strong>Similar Complaints:</strong>
                            <ul className="list-disc ml-6">
                                {result.similar_reports.slice(0, 3).map((r, i) => (
                                    <li key={i}>
                                        <em>{r.text}</em> <small>({r.tags?.join(', ')})</small>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </Layout>
    );
}
