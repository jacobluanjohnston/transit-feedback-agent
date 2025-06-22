/* components/charts/ChartByTagAndStop.js
   ---------------------------------------------------------
   Group order  ➜  BART …  VTA …  MUNI …
                 (agency first, stop alphabetical inside)
*/

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import supabase from '../../lib/supabase';
import useSummary from '../../hooks/useSummary';
import Markdown from 'react-markdown';

function isWeekend(ts) { const d = new Date(ts).getDay(); return d === 0 || d === 6; }

export default function ChartByTagAndStop() {
    const [dataObj, setDataObj] = useState(null);
    const [opts, setOpts]       = useState(null);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('reports')
                .select('agency, stop, created_at, tags');

            if (error) { console.error(error); return; }

            /* 1️⃣  count harassment by (agency, stop) */
            const grouped = {};
            data.filter(r =>
                Array.isArray(r.tags) ? r.tags.includes('harassment') : r.tags === 'harassment'
            ).forEach(r => {
                const agency = r.agency || 'Unknown';
                const stop   = r.stop   || 'Unknown';
                const key    = `${agency}|||${stop}`;
                if (!grouped[key]) grouped[key] = { agency, stop, weekday:0, weekend:0 };
                isWeekend(r.created_at) ? grouped[key].weekend++ : grouped[key].weekday++;
            });

            /* 2️⃣  sort ➜ agency → stop */
            const entries = Object.values(grouped).sort((a,b)=>
                a.agency.localeCompare(b.agency) || a.stop.localeCompare(b.stop)
            );

            /* 3️⃣  arrays for Chart.js */
            const labels        = entries.map(e => `${e.stop} (${e.agency})`);
            const weekdayCounts = entries.map(e => e.weekday);
            const weekendCounts = entries.map(e => e.weekend);

            setDataObj({
                labels,
                datasets:[
                    { label:'Weekday', data:weekdayCounts, backgroundColor:'rgba(54,162,235,0.7)' },
                    { label:'Weekend', data:weekendCounts, backgroundColor:'rgba(201,203,207,0.7)' },
                ],
            });

            setOpts({
                responsive:true,
                plugins:{
                    legend:{ position:'top' },
                    tooltip:{
                        callbacks:{
                            title:i=>labels[i[0].dataIndex],
                            afterBody:i=>{
                                const idx=i[0].dataIndex;
                                const wk=weekdayCounts[idx], we=weekendCounts[idx];
                                return wk+we ? `Weekend share: ${(we/(wk+we)*100).toFixed(1)}%` : '';
                            }
                        }
                    }
                },
                scales:{
                    x:{ ticks:{
                            maxRotation:90,minRotation:45,autoSkip:false,
                            callback:(_,i)=>labels[i]
                        }},
                    y:{ beginAtZero:true, title:{display:true,text:'Harassment reports'} },
                }
            });
        })();
    }, []);

    const { summary } = useSummary('harassment-by-stop', dataObj);

    if (!dataObj) return <p>Loading…</p>;

    return (
        <div className="my-10">
            <h2 className="text-xl font-bold mb-4">Harassment Reports by Stop &amp; Agency</h2>
            <Bar data={dataObj} options={opts} />
            {summary && (
                <div className="prose prose-sm bg-neutral-50 p-4 rounded-lg mt-4">
                    <Markdown>{summary}</Markdown>
                </div>
            )}
        </div>
    );
}
