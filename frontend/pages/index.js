import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';

export default function Home() {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('reports')
                .select('id, complaint, tags, created_at')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) console.error(error.message);
            else setReports(data);
        })();
    }, []);

    return (
        <Layout>
            <div className="max-w-3xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">🚍 Recent Complaints</h1>
                <ul className="space-y-4">
                    {reports.map((r) => (
                        <li key={r.id} className="p-4 bg-white shadow rounded">
                            <div className="text-sm text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
                            <div className="text-lg mt-1">{r.text}</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {r.tags?.map((tag, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </Layout>
    );
}
