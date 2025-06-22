// Might show harassment reports at specific stops on specific days
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import supabase from '../../lib/supabase';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';
ChartJS.register(BarElement, CategoryScale, LinearScale);

function buildChartData(dataMap, label) {
    return {
        labels: Object.keys(dataMap),
        datasets: [{
            label,
            data: Object.values(dataMap),
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
        }]
    };
}

export default function ChartByTagAndStop({ tag, title, days }) {
    const [dataMap, setDataMap] = useState({});

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('reports')
                .select('stop, created_at, tags')
                .contains('tags', [tag]);

            if (error) return console.error(error.message);

            const filtered = data.filter(d => {
                if (!days) return true; // ✅ show all if no day filter
                const day = new Date(d.created_at).getDay();
                return days.includes(day);
            });

            const counts = {};
            for (const r of filtered) {
                counts[r.stop] = (counts[r.stop] || 0) + 1;
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
