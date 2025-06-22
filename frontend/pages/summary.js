import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';

export default function Summary() {
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('analytics_summary')
                .select('summary, created_at')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) console.error(error.message);
            else setSummary(data);
        })();
    }, []);

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">📊 Analytics Summary</h1>
            {summary ? (
                <div className="bg-white p-4 shadow rounded whitespace-pre-line">
                    <div className="text-sm text-gray-500 mb-2">
                        Generated: {new Date(summary.created_at).toLocaleString()}
                    </div>
                    <div>{summary.summary}</div>
                </div>
            ) : (
                <p>Loading summary...</p>
            )}
        </div>
    );
}
