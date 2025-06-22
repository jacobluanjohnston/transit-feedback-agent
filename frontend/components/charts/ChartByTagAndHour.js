/* components/charts/ChartByTagAndHour.js
   ---------------------------------------------------------
   Hourly report counts (weekday vs weekend)  +  Claude insight
   • Hours calculated in **UTC** so SQL buckets line up
*/

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';
import supabase from '../../lib/supabase';

import useSummary from '../../hooks/useSummary';
import Markdown   from 'react-markdown';

export default function ChartByTagAndHour({
                                              tag   = 'delay',
                                              title = 'Delay Reports by Hour',
                                              days  // optional array of weekdays [0-6]
                                          }) {
    const [dataMap, setDataMap] = useState({ weekday: {}, weekend: {} });

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('reports')
                .select('created_at, tags');

            if (error) return console.error(error);

            const weekday = {}, weekend = {};
            (days ? data.filter(r => days.includes(new Date(r.created_at).getUTCDay())) : data)
                .forEach(r => {
                    const tagged = Array.isArray(r.tags) &&
                        r.tags.some(t => t.toLowerCase() === tag.toLowerCase());
                    if (!tagged) return;

                    const hr   = new Date(r.created_at).getUTCHours();
                    const isWE = [0, 6].includes(new Date(r.created_at).getUTCDay());
                    const buk  = isWE ? weekend : weekday;
                    buk[hr] = (buk[hr] || 0) + 1;
                });

            setDataMap({ weekday, weekend });
        })();
    }, [tag, days]);

    const hours = [...Array(24).keys()];
    const chartData = {
        labels: hours.map(h => `${h}:00`),
        datasets: [
            { label: 'Weekday', data: hours.map(h => dataMap.weekday[h] || 0),
                backgroundColor: 'rgba(54,162,235,0.7)' },
            { label: 'Weekend', data: hours.map(h => dataMap.weekend[h] || 0),
                backgroundColor: 'rgba(201,203,207,0.7)' },
        ],
    };

    const chartOpts = {
        responsive: true,
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Report count' } } },
    };

    /* Claude summary */
    const { summary } = useSummary(`hourly-${tag}`, chartData);

    return (
        <div className="my-10">
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            <Bar data={chartData} options={chartOpts} />
            {summary && (
                <div className="prose prose-sm bg-neutral-50 p-4 rounded-lg mt-4">
                    <Markdown>{summary}</Markdown>
                </div>
            )}
        </div>
    );
}
