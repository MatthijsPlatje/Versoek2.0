// client/src/pages/Analytics.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

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
                setError(t('admin.errors.loadFailed'));
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [t]);

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/dashboard/export/rides', {
                headers: { 'x-auth-token': token },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = `rides-export-${new Date().toISOString().slice(0, 10)}.csv`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Failed to export ride data", err);
            setError(t('admin.errors.exportFailed'));
        }
    };

    if (loading) return <div className="loading-spinner"><p>{t('common.loading')}</p></div>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!stats) return <p>{t('admin.errors.noData')}</p>;
    if (!stats.charts) return <p>{t('admin.errors.noChartData')}</p>;
    if (!stats.kpis) return <p>{t('admin.errors.noKpiData')}</p>;

    // --- CHART DATA CONFIGURATIONS ---

    // 1. Rides Over Time (Bar Chart)
    const chartLabels = Object.keys(stats.charts.ridesOverTime);
    const ridesData = {
        labels: chartLabels,
        datasets: [
            {
                label: t('admin.chart.ridesCreated'),
                data: chartLabels.map(label => stats.charts.ridesOverTime[label] || 0),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
            {
                label: t('admin.chart.passengersAccepted'),
                data: chartLabels.map(label => stats.charts.acceptedOverTime[label] || 0),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            }
        ],
    };

    // 2. CO2 Savings Trend (Line Chart)
    const co2TrendLabels = Object.keys(stats.charts.ridesOverTime);
    const co2TrendData = {
        labels: co2TrendLabels,
        datasets: [{
            label: t('admin.chart.co2Label'),
            data: co2TrendLabels.map((label) => {
                const acceptedRides = stats.charts.acceptedOverTime[label] || 0;
                const avgDistance = Number(stats.kpis.averageDistance) || 0;
                const co2PerKm = 0.12;
                const result = acceptedRides * avgDistance * co2PerKm;
                return isNaN(result) ? 0 : result;
            }),
            borderColor: 'rgba(34, 197, 94, 1)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            fill: true
        }]
    };

    // 3. Request Status Distribution (Doughnut Chart)
    const requestStatusData = {
        labels: [t('admin.labels.accepted'), t('admin.labels.pending'), t('admin.labels.refused')],
        datasets: [{
            data: [
                stats.charts.requestStatusDistribution.accepted,
                stats.charts.requestStatusDistribution.pending,
                stats.charts.requestStatusDistribution.refused
            ],
            backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(251, 191, 36, 0.8)',
                'rgba(239, 68, 68, 0.8)'
            ],
            borderColor: [
                'rgba(34, 197, 94, 1)',
                'rgba(251, 191, 36, 1)',
                'rgba(239, 68, 68, 1)'
            ],
            borderWidth: 2
        }]
    };

    // 4. Peak Hours (Bar Chart)
    const peakHoursData = {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [{
            label: t('admin.chart.peakHoursLabel'),
            data: stats.charts.peakHours,
            backgroundColor: 'rgba(168, 85, 247, 0.6)',
        }]
    };

    // 5. New Users Over Time (Line Chart)
    const newUsersLabels = Object.keys(stats.charts.newUsersOverTime);
    const newUsersData = {
        labels: newUsersLabels,
        datasets: [{
            label: t('admin.chart.newUsersLabel'),
            data: newUsersLabels.map(label => stats.charts.newUsersOverTime[label] || 0),
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
        }]
    };

    return (
        <div className="analytics-dashboard">
            <div className="dashboard-header">
                <div className="header-left">
                    <Link to="/admin" className="back-link">← Back to Admin</Link>
                    <h1>Analytics Dashboard</h1>
                </div>
                <button onClick={handleExport} className="export-button">
                    {t('admin.exportButton')}
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button 
                    className={activeTab === 'overview' ? 'tab-active' : ''} 
                    onClick={() => setActiveTab('overview')}
                >
                    {t('admin.tabs.overview')}
                </button>
                <button 
                    className={activeTab === 'sustainability' ? 'tab-active' : ''} 
                    onClick={() => setActiveTab('sustainability')}
                >
                    {t('admin.tabs.sustainability')}
                </button>
                <button 
                    className={activeTab === 'engagement' ? 'tab-active' : ''} 
                    onClick={() => setActiveTab('engagement')}
                >
                    {t('admin.tabs.engagement')}
                </button>
                <button 
                    className={activeTab === 'operations' ? 'tab-active' : ''} 
                    onClick={() => setActiveTab('operations')}
                >
                    {t('admin.tabs.operations')}
                </button>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <>
                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <h2>{stats.kpis.totalUsers}</h2>
                            <p>{t('admin.kpis.totalUsers')}</p>
                        </div>
                        <div className="kpi-card">
                            <h2>{stats.kpis.totalRides}</h2>
                            <p>{t('admin.kpis.totalRides')}</p>
                        </div>
                        <div className="kpi-card">
                            <h2>{stats.kpis.totalAcceptedRequests}</h2>
                            <p>{t('admin.kpis.passengersTransported')}</p>
                        </div>
                        <div className="kpi-card">
                            <h2>{stats.kpis.averageDistance} {t('admin.labels.km')}</h2>
                            <p>{t('admin.kpis.averageDistance')}</p>
                        </div>
                    </div>

                    <div className="chart-row">
                        <div className="chart-container">
                            <h3>{t('admin.chart.title')}</h3>
                            <Bar data={ridesData} options={{ responsive: true, maintainAspectRatio: true }} />
                        </div>
                        <div className="chart-container">
                            <h3>{t('admin.chart.requestStatus')}</h3>
                            <Doughnut data={requestStatusData} options={{ responsive: true, maintainAspectRatio: true }} />
                        </div>
                    </div>
                </>
            )}

            {/* SUSTAINABILITY TAB */}
            {activeTab === 'sustainability' && (
                <>
                    <div className="kpi-grid">
                        <div className="kpi-card sustainability">
                            <h2>{stats.kpis.totalCO2Saved} {t('admin.labels.kg')}</h2>
                            <p>{t('admin.kpis.totalCO2Saved')}</p>
                        </div>
                        <div className="kpi-card sustainability">
                            <h2>{stats.kpis.treesEquivalent}</h2>
                            <p>{t('admin.kpis.treesEquivalent')}</p>
                        </div>
                        <div className="kpi-card sustainability">
                            <h2>{stats.kpis.totalDistance} {t('admin.labels.km')}</h2>
                            <p>{t('admin.kpis.totalDistance')}</p>
                        </div>
                        <div className="kpi-card sustainability">
                            <h2>{stats.kpis.occupancyRate}{t('admin.labels.percent')}</h2>
                            <p>{t('admin.kpis.occupancyRate')}</p>
                        </div>
                    </div>

                    <div className="chart-row">
                        <div className="chart-container chart-wide">
                            <h3>{t('admin.chart.co2Trend')}</h3>
                            <Line data={co2TrendData} options={{ responsive: true, maintainAspectRatio: true }} />
                        </div>
                    </div>
                </>
            )}

            {/* USER ENGAGEMENT TAB */}
            {activeTab === 'engagement' && (
                <>
                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <h2>{stats.kpis.activeDrivers}</h2>
                            <p>{t('admin.kpis.activeDrivers')}</p>
                        </div>
                        <div className="kpi-card">
                            <h2>{stats.kpis.driverUtilization}{t('admin.labels.percent')}</h2>
                            <p>{t('admin.kpis.driverUtilization')}</p>
                        </div>
                        <div className="kpi-card">
                            <h2>{stats.kpis.acceptanceRate}{t('admin.labels.percent')}</h2>
                            <p>{t('admin.kpis.acceptanceRate')}</p>
                        </div>
                        <div className="kpi-card">
                            <h2>{stats.kpis.avgResponseTime}{t('admin.labels.hours')}</h2>
                            <p>{t('admin.kpis.avgResponseTime')}</p>
                        </div>
                    </div>

                    <div className="chart-row">
                        <div className="chart-container">
                            <h3>{t('admin.chart.newUsers')}</h3>
                            <Line data={newUsersData} options={{ responsive: true, maintainAspectRatio: true }} />
                        </div>
                        <div className="chart-container">
                            <h3>{t('admin.chart.peakHours')}</h3>
                            <Bar data={peakHoursData} options={{ responsive: true, maintainAspectRatio: true }} />
                        </div>
                    </div>
                </>
            )}

            {/* OPERATIONS TAB */}
            {activeTab === 'operations' && (
                <>
                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <h2>{stats.kpis.completionRate}{t('admin.labels.percent')}</h2>
                            <p>{t('admin.kpis.completionRate')}</p>
                        </div>
                        <div className="kpi-card">
                            <h2>{stats.kpis.occupancyRate}{t('admin.labels.percent')}</h2>
                            <p>{t('admin.kpis.occupancyRate')}</p>
                        </div>
                        <div className="kpi-card">
                            <h2>{stats.charts.requestStatusDistribution.pending}</h2>
                            <p>{t('admin.kpis.pendingRequests')}</p>
                        </div>
                        <div className="kpi-card">
                            <h2>{stats.charts.requestStatusDistribution.refused}</h2>
                            <p>{t('admin.kpis.refusedRequests')}</p>
                        </div>
                    </div>

                    <div className="chart-row">
                        <div className="chart-container">
                            <h3>{t('admin.chart.ridesVsPassengers')}</h3>
                            <Bar data={ridesData} options={{ responsive: true, maintainAspectRatio: true }} />
                        </div>
                        <div className="chart-container">
                            <h3>{t('admin.chart.requestDistribution')}</h3>
                            <Doughnut data={requestStatusData} options={{ responsive: true, maintainAspectRatio: true }} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Analytics;
