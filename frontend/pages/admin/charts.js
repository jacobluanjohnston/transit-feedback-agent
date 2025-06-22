import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import supabase from '../../lib/supabase';
import ChartByTagAndStop from '../../components/charts/ChartByTagAndStop';
import ChartByTagAndTemp from '../../components/charts/ChartByTagAndTemp';
import ChartByTagAndHour from '../../components/charts/ChartByTagAndHour';
import ChartByTagAndEvent from '../../components/charts/ChartByTagAndEvent';

function countBy(array, key) {
    const counts = {};
    array.forEach(item => {
        if (Array.isArray(item[key])) {
            item[key].forEach(tag => {
                counts[tag] = (counts[tag] || 0) + 1;
            });
        } else {
            const val = item[key];
            if (val) counts[val] = (counts[val] || 0) + 1;
        }
    });
    return counts;
}

function groupByDate(data) {
    const counts = {};
    data.forEach(r => {
        const date = new Date(r.created_at).toISOString().slice(0, 10);
        counts[date] = (counts[date] || 0) + 1;
    });
    return counts;
}

function buildChartData(dataMap, label) {
    return {
        labels: Object.keys(dataMap),
        datasets: [{
            label,
            data: Object.values(dataMap),
            backgroundColor: 'rgba(30, 144, 255, 0.7)'
        }]
    };
}

export default function ChartsPage() {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(2000);

            if (error) {
                console.error('Error fetching reports:', error.message);
            } else {
                console.log('✅ Fetched reports:', data);
                setReports(data);
            }
        })();
    }, []);

    const tagCounts = countBy(reports, 'tags');
    const agencyCounts = countBy(reports, 'agency');
    const timeCounts = groupByDate(reports);

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-6">📊 Transit Analytics</h1>

            <div className="space-y-10">
                <ChartByTagAndStop
                    tag="harassment"
                    title="Harassment Reports by Stop"
                />

                <ChartByTagAndHour
                    tag="harassment"
                    title="Harassment Reports by Hour"
                />

                <ChartByTagAndTemp
                    tag="equipment_issue"
                    title="Equipment Failures by Temperature"
                />

                <ChartByTagAndHour
                    tag="delay"
                    title="Delays on Routes by Hour"
                />

                <ChartByTagAndEvent
                    tag="cleanliness"
                    title="Cleanliness Reports: Events vs. Next Day vs. Baseline"
                />

                <div>
                    <h2 className="text-xl font-semibold mb-2">Tag Frequency</h2>
                    <Bar data={buildChartData(tagCounts, 'Tag Frequency')} />
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">Agency Frequency</h2>
                    <Bar data={buildChartData(agencyCounts, 'Agency Reports')} />
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">Reports Over Time</h2>
                    <Bar data={buildChartData(timeCounts, 'Reports by Date')} />
                </div>
            </div>
        </Layout>
    );
}
