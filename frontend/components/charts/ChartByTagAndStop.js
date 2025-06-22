/*  components/charts/ChartByTagAndStop.js
    ————————————————————————————————————————————
    Harassment by Stop × Agency + Claude summary
*/
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend
} from 'chart.js';
import supabase from '../../lib/supabase';

import useSummary from '../../hooks/useSummary';
import Markdown   from 'react-markdown';

function isWeekend(d){ const x=new Date(d).getDay(); return x===0||x===6; }

export default function ChartByTagAndStop() {
    const [chartData, setChartData] = useState(null);
    const [chartOpts, setChartOpts] = useState(null);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('reports')
                .select('agency, stop, created_at, tags');
            if (error){ console.error(error); return; }

            const grouped={};
            data.filter(r=>Array.isArray(r.tags)?r.tags.includes('harassment'):r.tags==='harassment')
                .forEach(r=>{
                    const agency=r.agency||'Unknown', stop=r.stop||'Unknown';
                    const k=`${agency}|||${stop}`, we=isWeekend(r.created_at);
                    if(!grouped[k]) grouped[k]={agency,stop,weekday:0,weekend:0};
                    we? grouped[k].weekend++ : grouped[k].weekday++;
                });

            const entries=Object.values(grouped)
                .sort((a,b)=> (b.weekday+b.weekend)-(a.weekday+a.weekend));
            const top5=entries.slice(0,5).map(e=>e.stop);

            const labels=entries.map(e=>e.stop);
            const weekdayCounts=entries.map(e=>e.weekday);
            const weekendCounts=entries.map(e=>e.weekend);
            const agencies=entries.map(e=>e.agency);

            setChartData({
                labels,
                datasets:[
                    { label:'Weekday',
                        data:weekdayCounts,
                        backgroundColor:ctx=>
                            top5.includes(labels[ctx.dataIndex])
                                ?'rgba(255,99,132,0.9)'
                                :'rgba(54,162,235,0.7)' },
                    { label:'Weekend',
                        data:weekendCounts,
                        backgroundColor:'rgba(201,203,207,0.7)' },
                ],
                agencies,
            });

            setChartOpts({
                responsive:true,
                plugins:{ legend:{position:'top'},
                    tooltip:{ callbacks:{
                            title:i=>`${labels[i[0].dataIndex]} (${agencies[i[0].dataIndex]})`,
                            afterBody:i=>{
                                const idx=i[0].dataIndex;
                                const w=weekdayCounts[idx], we=weekendCounts[idx];
                                return w+we?`Weekend share: ${(we/(w+we)*100).toFixed(1)}%`:'';
                            }}} },
                scales:{ x:{ ticks:{
                            callback(v){ const stop=labels[v], ag=agencies[v];
                                return ag!==agencies[v-1]?`${ag}\n${stop}`:stop; },
                            maxRotation:90,minRotation:45,autoSkip:false },
                    }, y:{ beginAtZero:true, title:{display:true,text:'Harassment reports'} } },
            });
        })();
    }, []);

    const { summary } = useSummary('hotstops-harassment', chartData);

    if(!chartData) return <p>Loading…</p>;

    return (
        <div className="my-10">
            <h2 className="text-xl font-bold mb-4">Harassment Reports by Stop &amp; Agency</h2>
            <Bar data={chartData} options={chartOpts} />
            {summary && (
                <div className="prose prose-sm bg-neutral-50 p-4 rounded-lg mt-4">
                    <Markdown>{summary}</Markdown>
                </div>
            )}
        </div>
    );
}
