// Might show how mechanical/equipment issues increase with temperature
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import supabase from '../../lib/supabase';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';
ChartJS.register(BarElement, CategoryScale, LinearScale);

function buildChartData(dataMap, label) {
    const sortedTemps = Object.keys(dataMap).sort((a, b) => parseInt(a) - parseInt(b));
    return {
        labels: sortedTemps,
        datasets: [{
            label,
            data: sortedTemps.map(k => dataMap[k]),
            backgroundColor: 'rgba(255, 159, 64, 0.7)',
        }]
    };
}

export default function ChartByTagAndTemp({ tag, title }) {
    const [dataMap, setDataMap] = useState({});

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('reports')
                .select('temperature, tags')
                .contains('tags', [tag]);

            if (error) return console.error(error.message);

            const counts = {};
            for (const r of data) {
                const t = r.temperature;
                if (t !== null) counts[t] = (counts[t] || 0) + 1;
            }

            setDataMap(counts);
        })();
    }, [tag]);

    return (
        <div className="my-10">
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            <Bar data={buildChartData(dataMap, title)} />
        </div>
    );
}
