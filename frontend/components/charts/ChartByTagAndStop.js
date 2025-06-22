/* components/charts/ChartByTagAndStop.js
   ---------------------------------------------------------
   Harassment by stop × agency (agency-first sort) + Claude insight
*/

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';
import supabase from '../../lib/supabase';

import useSummary from '../../hooks/useSummary';
import Markdown   from 'react-markdown';

const isWeekend = ts => [0, 6].includes(new Date(ts).getDay());

export default function ChartByTagAndStop() {
    const [chartData, setChartData] = useState(null);
    const [chartOpts, setChartOpts] = useState(null);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('reports')
                .select('agency, stop, created_at, tags');

            if (error) return console.error(error);

            /* aggregate */
            const grouped = {};
            data.filter(r =>
                Array.isArray(r.tags) ? r.tags.includes('harassment') : r.tags === 'harassment'
            ).forEach(r => {
                const agency = r.agency || 'Unknown';
                const stop   = r.stop   || 'Unknown';
                const key    = `${agency}|||${stop}`;
                if (!grouped[key]) grouped[key] = { agency, stop, weekday: 0, weekend: 0 };
                isWeekend(r.created_at) ? grouped[key].weekend++ : grouped[key].weekday++;
            });

            /* agency-then-stop sort */
            const entries = Object.values(grouped)
                .sort((a, b) => a.agency.localeCompare(b.agency) || a.stop.localeCompare(b.stop));

            const labels = entries.map(e => `${e.stop} (${e.agency})`);
            const weekday = entries.map(e => e.weekday);
            const weekend = entries.map(e => e.weekend);

            setChartData({
                labels,
                datasets: [
                    { label: 'Weekday', data: weekday, backgroundColor: 'rgba(54,162,235,0.7)' },
                    { label: 'Weekend', data: weekend, backgroundColor: 'rgba(201,203,207,0.7)' },
                ],
            });

            setChartOpts({
                responsive: true,
                scales: {
                    x: { ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 } },
                    y: { beginAtZero: true, title: { display: true, text: 'Harassment reports' } },
                },
            });
        })();
    }, []);

    /* Claude summary */
    const { summary } = useSummary('harassment-by-stop', chartData);

    if (!chartData) return <p>Loading…</p>;

    return (
        <div className="my-10">
            <h2 className="text-xl font-bold mb-4">Harassment Reports by Stop & Agency</h2>
            <Bar data={chartData} options={chartOpts} />
            {summary && (
                <div className="prose prose-sm bg-neutral-50 p-4 rounded-lg mt-4">
                    <Markdown>{summary}</Markdown>
                </div>
            )}
        </div>
    );
}
