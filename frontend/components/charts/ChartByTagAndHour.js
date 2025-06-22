/*  components/charts/ChartByTagAndHour.js
    ————————————————————————————————————————————
    Delay counts by hour (Weekday vs Weekend) + Claude summary
*/
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import supabase from '../../lib/supabase';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';

import useSummary from '../../hooks/useSummary';
import Markdown   from 'react-markdown';

/* shade rush-hour bands */
const rushBand = (xMin, xMax) => ({
    type        : 'box',
    xMin, xMax,
    yMin        : 0,          // bottom of chart
    yMax        : 'max',      // plugin treats "max" as top
    backgroundColor : 'rgba(0,0,0,0.05)',
    borderWidth : 0,
    label       : { enabled: false }   // ← prevents the crash

});

export default function ChartByTagAndHour({ tag='delay', title, days }) {
    const [dataMap, setDataMap] = useState({ weekday:{}, weekend:{} });

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('reports')
                .select('created_at, tags');

            if (error) return console.error(error);

            const week   = {}, weekEnd = {};
            const filt   = days ? data.filter(d => days.includes(new Date(d.created_at).getDay())) : data;

            filt.forEach(r => {
                const tagged  = Array.isArray(r.tags) && r.tags.some(t=>t.toLowerCase()===tag);
                if (!tagged) return;

                const hr      = new Date(r.created_at).getHours();
                const isWE    = [0,6].includes(new Date(r.created_at).getDay());
                const bucket  = isWE ? weekEnd : week;
                bucket[hr]    = (bucket[hr] || 0) + 1;
            });

            setDataMap({ weekday:week, weekend:weekEnd });
        })();
    }, [tag, days]);

    const hours = [...Array(24).keys()];
    const chartData = {
        labels  : hours.map(h=>`${h}:00`),
        datasets: [
            { label:'Weekday', data:hours.map(h=>dataMap.weekday[h]||0),
                backgroundColor:'rgba(54,162,235,0.7)' },
            { label:'Weekend', data:hours.map(h=>dataMap.weekend[h]||0),
                backgroundColor:'rgba(201,203,207,0.7)' },
        ],
    };
    const chartOpts = {
        responsive:true,
        // plugins:{ annotation:{ annotations:{
        //             morning:rushBand(7,9.5), evening:rushBand(16,18.5) } } },
        scales  :{ y:{ beginAtZero:true, title:{display:true,text:'Delay reports'} } },
    };

    /* Claude insight */
    const { summary } = useSummary('rush-hour-delay', chartData);

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
