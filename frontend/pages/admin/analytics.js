import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import supabase from '../../lib/supabase';

export default function AnalyticsPage() {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('analytics_summary')
                .select('summary')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) console.error('❌ Fetch error:', error.message);
            else setSummary(data?.summary || '');

            setLoading(false);
        })();
    }, []);

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-4">📈 Analytics Summary</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <pre className="whitespace-pre-wrap bg-white p-4 shadow rounded">{summary}</pre>
            )}
        </Layout>
    );
}
