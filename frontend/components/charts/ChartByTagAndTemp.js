/*  components/charts/ChartByTagAndTemp.js
    ————————————————————————————————————————————
    Failures vs Temperature + trend & Claude insight
*/
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import supabase from '../../lib/supabase';
import {
    Chart as ChartJS, BarElement, CategoryScale, LinearScale
} from 'chart.js';
// import annotationPlugin from 'chartjs-plugin-annotation';

import useSummary from '../../hooks/useSummary';
import Markdown   from 'react-markdown';

/* ---------- helpers ---------- */
const bucket5 = t => Math.round(t/5)*5;
function linearRegression(xs,ys){
    const n=xs.length, sx=xs.reduce((a,b)=>a+b,0), sy=ys.reduce((a,b)=>a+b,0);
    const sxy=xs.reduce((s,x,i)=>s+x*ys[i],0), sx2=xs.reduce((s,x)=>s+x*x,0);
    const m=(n*sxy-sx*sy)/(n*sx2-sx*sx), b=(sy-m*sx)/n;
    const meanX=sx/n, meanY=sy/n;
    const r=xs.reduce((s,x,i)=>s+(x-meanX)*(ys[i]-meanY),0) /
        Math.sqrt(xs.reduce((s,x)=>s+(x-meanX)**2,0)*
            ys.reduce((s,y)=>s+(y-meanY)**2,0));
    return {m,b,r};
}

export default function ChartByTagAndTemp({ tag='equipment_issue', title }) {
    const [dataObj,setDataObj]=useState(null);
    const [opts,setOpts]=useState(null);

    useEffect(()=>{ (async()=>{
        const { data,error }=await supabase
            .from('reports').select('temperature,tags').contains('tags',[tag]);
        if(error){console.error(error);return;}

        const counts={};
        data.forEach(r=>{
            if(r.temperature==null) return;
            const b=bucket5(r.temperature);
            counts[b]=(counts[b]||0)+1;
        });

        const temps=Object.keys(counts).map(Number).sort((a,b)=>a-b);
        const vals =temps.map(t=>counts[t]);
        const {m,b,r}=linearRegression(temps,vals);

        setDataObj({
            labels:temps.map(String),
            datasets:[
                { label:title,type:'bar',data:vals,
                    backgroundColor:'rgba(255,159,64,0.7)' },
                { label:'Trend',type:'line',data:temps.map(t=>m*t+b),
                    borderDash:[4,2],borderWidth:2,borderColor:'#000',pointRadius:0,tension:0 },
            ],
        });

        setOpts({
            responsive:true,
            // plugins:{ annotation:{ annotations:{
            //             corr:{type:'label',xValue:temps[Math.floor(temps.length/2)],
            //                 yValue:Math.max(...vals),content:[`r = ${r.toFixed(2)}`],
            //                 backgroundColor:'rgba(0,0,0,0.7)',color:'#fff',font:{weight:'bold'} }
            //         }}},
            scales:{ y:{beginAtZero:true,title:{display:true,text:'Failure count'}},
                x:{title:{display:true,text:'Temperature (°F, 5° buckets)'}} },
        });
    })();},[tag]);

    const { summary } = useSummary('temp-failure', dataObj);

    if(!dataObj) return null;

    return (
        <div className="my-10">
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            <Bar data={dataObj} options={opts} />
            {summary && (
                <div className="prose prose-sm bg-neutral-50 p-4 rounded-lg mt-4">
                    <Markdown>{summary}</Markdown>
                </div>
            )}
        </div>
    );
}
