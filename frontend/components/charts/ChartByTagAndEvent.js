/*  components/charts/ChartByTagAndEvent.js
    ----------------------------------------------------
    Cleanliness vs Event chart  +  Claude insight block
*/
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';
import supabase from '../../lib/supabase';

import useSummary from '../../hooks/useSummary';
import Markdown   from 'react-markdown';

export default function ChartByTagAndEvent({
                                               tag   = 'cleanliness',
                                               title = 'Cleanliness Reports: Events vs. Spill-over vs. Baseline',
                                           }) {
    const [chartData, setChartData] = useState(null);
    const [chartOpts, setChartOpts] = useState(null);

    /* ------------------------------------------------------------------ */
    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('reports')
                .select('created_at, tags, eventNearby');

            if (error) { console.error(error); return; }

            /* ---------- crunch numbers (same as before) ---------- */
            const byDate   = {};
            const events   = {};
            const baseline = {};

            data.forEach(r => {
                const date = new Date(r.created_at).toISOString().slice(0,10);
                if (r.tags?.includes(tag)) byDate[date] = (byDate[date]||0)+1;
            });

            data.forEach(r => {
                if (!r.eventNearby) return;
                const date    = new Date(r.created_at).toISOString().slice(0,10);
                const nextDay = new Date(+new Date(r.created_at)+86_400_000)
                    .toISOString().slice(0,10);
                events[date] = {
                    eventName : r.eventNearby,
                    dayOf     : byDate[date]    || 0,
                    nextDay   : byDate[nextDay] || 0,
                };
            });

            Object.keys(byDate).forEach(d => {
                if (!data.some(r => r.eventNearby &&
                    new Date(r.created_at).toISOString().slice(0,10) === d))
                    baseline[d] = byDate[d];
            });
            const baseAvg = Object.values(baseline)
                .reduce((a,b)=>a+b,0) / Object.values(baseline).length;

            /* ---------- build chartData ---------- */
            const labels = Object.keys(events);
            const chart  = {
                labels   : labels.map(k => `${events[k].eventName} (${k})`),
                datasets : [
                    { label:'Same-Day (event)',
                        data : labels.map(k => events[k].dayOf),
                        backgroundColor:'rgba(54,162,235,0.7)' },
                    { label:'Next-Day (spill-over)',
                        data : labels.map(k => events[k].nextDay),
                        backgroundColor:'rgba(255,159,64,0.7)' },
                    { label:'Baseline avg',
                        data : labels.map(()=>baseAvg.toFixed(2)),
                        backgroundColor:'rgba(201,203,207,0.7)' },
                    { label:'% Above Baseline',
                        data : labels.map(k =>
                            (((events[k].dayOf||0)/baseAvg)-1)*100),
                        type:'line', borderColor:'#ff6384',
                        borderWidth:2, yAxisID:'y2', pointRadius:3 },
                ],
            };

            const opts = {
                responsive:true,
                scales:{
                    y : { beginAtZero:true,
                        title:{display:true,text:'Complaint count'} },
                    y2: { position:'right', grid:{drawOnChartArea:false},
                        ticks:{ callback:v=>v+'%' },
                        title:{display:true,text:'% above baseline'} },
                },
                plugins:{
                    datalabels:{ formatter:(v,c)=>
                            c.dataset.type==='line'?v.toFixed(0)+'%':null,
                        color:'#ff6384', font:{weight:'bold'} },
                },
            };

            setChartData(chart);
            setChartOpts(opts);
        })();
    }, [tag]);
    /* ------------------------------------------------------------------ */

    /* ---------- Claude insight (one-liner) ---------- */
    const { summary } = useSummary('event-cleanliness', chartData);

    return (
        <div className="my-10">
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            {chartData && chartOpts ? (
                <>
                    <Bar data={chartData} options={chartOpts} />
                    {summary && (
                        <div className="prose prose-sm bg-neutral-50 p-4 rounded-lg mt-4">
                            <Markdown>{summary}</Markdown>
                        </div>
                    )}
                </>
            ) : (
                <p>Loading chart…</p>
            )}
        </div>
    );
}
