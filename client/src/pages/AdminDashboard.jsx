// client/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './AdminDashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/dashboard/stats', {
                    headers: { 'x-auth-token': token }
                });
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
                setError('Failed to load dashboard data. You may not have permission or the server may be down.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/dashboard/export/rides', {
                headers: { 'x-auth-token': token },
                responseType: 'blob', // Important: tells axios to expect a binary blob
            });

            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = `rides-export-${new Date().toISOString().slice(0, 10)}.csv`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove(); // Clean up the DOM

        } catch (err) {
            console.error("Failed to export ride data", err);
            setError('Could not export data. Please try again.');
        }
    };

    // 1. Return early if loading or if there's an error.
    if (loading) return <p>Loading dashboard...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    // 2. Add a more specific guard clause.
    // This checks that the stats object and its nested properties exist before proceeding.
    if(!stats)
        return <p>No data available</p>;

    if(!stats.charts)
        return <p>No chart data available</p>;

    if(!stats.kpis)
        return <p>No KPI data available</p>;


    // 3. Now that we know the data structure is valid, we can safely process it.
    const chartLabels = Object.keys(stats.charts.ridesOverTime);
    const ridesData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Rides Created',
                data: chartLabels.map(label => stats.charts.ridesOverTime[label] || 0),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
            {
                label: 'Passengers Accepted',
                data: chartLabels.map(label => stats.charts.acceptedOverTime[label] || 0),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            }
        ],
    };

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
              <h1>Admin Dashboard</h1>
              <button onClick={handleExport} className="export-button">Export Rides to CSV</button>
            </div>
            
            <div className="kpi-grid">
                <div className="kpi-card">
                    <h2>{stats.kpis.totalUsers}</h2>
                    <p>Total Users</p>
                </div>
                <div className="kpi-card">
                    <h2>{stats.kpis.totalRides}</h2>
                    <p>Total Rides Created</p>
                </div>
                <div className="kpi-card">
                    <h2>{stats.kpis.totalAcceptedRequests}</h2>
                    <p>Passengers Transported</p>
                </div>
                <div className="kpi-card">
                    <h2>{stats.kpis.averageDistance} km</h2>
                    <p>Average Ride Distance</p>
                </div>
            </div>

            <div className="chart-container">
                <h3>Platform Activity (Last 6 Months)</h3>
                <Bar data={ridesData} />
            </div>
        </div>
    );
};

export default AdminDashboard;
