import { useEffect, useState } from 'react';
import useSWR from 'swr';

const fetcher = url => fetch(url).then(r => r.json());

export default function useSummary(chartId, data) {
    const [posted, setPosted] = useState(false);

    useEffect(() => {
        if (!chartId || !data || posted) return;

        fetch('/api/summarize', {
            method : 'POST',
            headers: { 'Content-Type':'application/json' },
            body   : JSON.stringify({ chartId, data }),
        }).catch(console.error);

        setPosted(true);
    }, [chartId, data, posted]);

    const { data:resp, error, isLoading } = useSWR(
        chartId ? `/api/summary/${chartId}` : null,
        fetcher,
        { refreshInterval: 30_000 }      // every 30 s
    );

    return { summary: resp?.summary_md, error, isLoading };
}
