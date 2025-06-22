/* components/charts/ChartByTagAndTemp.js
   ---------------------------------------------------------
   Equipment failures vs temperature (5 °F buckets) + Claude insight
   • Trend line clipped to bar range
   • Only bar values show numeric labels
*/

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import supabase from '../../lib/supabase';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';

import useSummary from '../../hooks/useSummary';
import Markdown   from 'react-markdown';

/* helpers */
const bucket5 = t => Math.round(t / 5) * 5;
function regression(xs, ys) {
    const n = xs.length,
        sx = xs.reduce((a,b)=>a+b,0),
        sy = ys.reduce((a,b)=>a+b,0),
        sxy= xs.reduce((s,x,i)=>s + x*ys[i], 0),
        sx2= xs.reduce((s,x)=>s + x*x, 0);
    const m = (n*sxy - sx*sy)/(n*sx2 - sx*sx);
    const b = (sy - m*sx)/n;
    return { m, b };
}

export default function ChartByTagAndTemp({ tag='equipment_issue', title }) {
    const [chartData, setChartData] = useState(null);
    const [chartOpts, setChartOpts] = useState(null);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('reports')
                .select('temperature, tags')
                .contains('tags', [tag]);

            if (error) return console.error(error);

            /* bucket counts */
            const counts = {};
            data.forEach(r => {
                if (r.temperature == null) return;
                const b = bucket5(r.temperature);
                counts[b] = (counts[b] || 0) + 1;
            });

            const temps = Object.keys(counts).map(Number).sort((a,b)=>a-b);
            const vals  = temps.map(t => counts[t]);

            /* regression, clip to min/max */
            const { m, b } = regression(temps, vals);
            const minY = Math.min(...vals), maxY = Math.max(...vals);
            const line = temps.map(t => Math.min(Math.max(m*t + b, minY), maxY));

            setChartData({
                labels: temps.map(String),
                datasets: [
                    { label: title, type:'bar', data: vals,
                        backgroundColor: 'rgba(255,159,64,0.7)',
                        datalabels: { formatter: v => Math.round(v) } },
                    { label: 'Trend', type:'line', data: line,
                        borderDash:[4,2], borderWidth:2, borderColor:'#000',
                        pointRadius:0, tension:0, datalabels:{ display:false } },
                ],
            });

            setChartOpts({
                responsive:true,
                scales:{
                    y:{ beginAtZero:true, title:{ display:true, text:'Failure count' } },
                    x:{ title:{ display:true, text:'Temperature (°F, 5° buckets)' } },
                },
            });
        })();
    }, [tag]);

    /* Claude summary */
    const { summary } = useSummary('temp-failure', chartData);

    if (!chartData) return null;

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
