// Might visualize delay frequency on a specific route by hour
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import supabase from '../../lib/supabase';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';
ChartJS.register(BarElement, CategoryScale, LinearScale);

function buildChartData(dataMap, label) {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return {
        labels: hours.map(h => `${h}:00`),
        datasets: [{
            label,
            data: hours.map(h => dataMap[h] || 0),
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
        }]
    };
}

export default function ChartByTagAndHour({ tag, title, days }) {
    const [dataMap, setDataMap] = useState({});

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('reports')
                .select('created_at, tags')

            if (error) return console.error(error.message);

            const filtered = days
                ? data.filter(d => days.includes(new Date(d.created_at).getDay()))
                : data;

            const counts = {};
            for (const r of filtered) {
                const isTagged = Array.isArray(r.tags) && r.tags.some(t => t.toLowerCase() === tag.toLowerCase());
                if (!isTagged) continue;

                const hour = new Date(r.created_at).getHours();
                counts[hour] = (counts[hour] || 0) + 1;
            }

            setDataMap(counts);
        })();
    }, [tag, days]);

    return (
        <div className="my-10">
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            <Bar data={buildChartData(dataMap, title)} />
        </div>
    );
}
