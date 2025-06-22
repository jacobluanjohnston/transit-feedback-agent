import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import supabase from '../../lib/supabase';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function ChartByTagAndEvent({
                                               tag = 'cleanliness',
                                               title = 'Cleanliness Reports: Event Days vs. Spillover vs. Normal'
                                           }) {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('reports')
                .select('created_at, tags, eventNearby');

            if (error) {
                console.error(error.message);
                return;
            }

            const cleanlinessByDate = {};
            const eventDayCounts = {};
            const nonEventDates = {};

            // Count total complaints by date
            data.forEach(r => {
                const date = new Date(r.created_at).toISOString().slice(0, 10);
                if (r.tags?.includes(tag)) {
                    cleanlinessByDate[date] = (cleanlinessByDate[date] || 0) + 1;
                }
            });

            // Track event day + next day spillover
            data.forEach(r => {
                const event = r.eventNearby;
                if (!event) return;

                const date = new Date(r.created_at).toISOString().slice(0, 10);
                const nextDay = new Date(new Date(r.created_at).getTime() + 86400000)
                    .toISOString()
                    .slice(0, 10);

                eventDayCounts[date] = {
                    eventName: event,
                    dayOf: cleanlinessByDate[date] || 0,
                    nextDay: cleanlinessByDate[nextDay] || 0,
                };
            });

            // Build list of dates with no events
            Object.keys(cleanlinessByDate).forEach(date => {
                const hadEvent = data.some(
                    r =>
                        r.eventNearby &&
                        new Date(r.created_at).toISOString().slice(0, 10) === date
                );
                if (!hadEvent) nonEventDates[date] = cleanlinessByDate[date];
            });

            const nonEventAvg =
                Object.values(nonEventDates).reduce((a, b) => a + b, 0) /
                Object.values(nonEventDates).length;

            // Create chart object
            const labels = Object.keys(eventDayCounts);
            const chart = {
                labels: labels.map(d => `${eventDayCounts[d].eventName} (${d})`),
                datasets: [
                    {
                        label: 'Cleanliness Reports — Same Day (Event)',
                        data: labels.map(d => eventDayCounts[d].dayOf),
                        backgroundColor: 'rgba(54, 162, 235, 0.7)', // blue
                    },
                    {
                        label: 'Cleanliness Reports — Next Day (Spillover)',
                        data: labels.map(d => eventDayCounts[d].nextDay),
                        backgroundColor: 'rgba(255, 159, 64, 0.7)', // orange
                    },
                    {
                        label: 'Avg Non-Event Day',
                        data: labels.map(() => nonEventAvg.toFixed(2)),
                        backgroundColor: 'rgba(201, 203, 207, 0.7)', // gray
                    },
                ],
            };

            setChartData(chart);
        })();
    }, [tag]);

    return (
        <div className="my-10">
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            <p className="text-sm text-gray-600 mb-2">
                🟦 Same Day · 🟧 Next Day Spillover · 🟪 Avg. Non-Event Days
            </p>
            {chartData ? <Bar data={chartData} /> : <p>Loading chart...</p>}
        </div>
    );
}
