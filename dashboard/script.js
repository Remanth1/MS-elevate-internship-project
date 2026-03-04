// script.js

// Global Chart Configuration for Dark Theme
Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = 'Inter';
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
Chart.defaults.plugins.tooltip.titleColor = '#f8fafc';
Chart.defaults.plugins.tooltip.bodyColor = '#e2e8f0';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
Chart.defaults.plugins.tooltip.borderWidth = 1;

// Utility functions for formatting
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
const formatPercent = (val) => `${val.toFixed(1)}%`;

// --- AI Analytical Engines ---

// 1. Z-Score Anomaly Detection
function detectAnomalies(dataArray) {
    if (dataArray.length === 0) return [];

    // Calculate Mean
    const mean = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;

    // Calculate Standard Deviation
    const variance = dataArray.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / dataArray.length;
    const stdDev = Math.sqrt(variance);

    // Threshold usually 2 or 3 for 95%-99% confidence
    const threshold = 2.0;

    const anomalies = [];
    dataArray.forEach((val, i) => {
        const zScore = (val - mean) / (stdDev || 1);
        if (zScore > threshold) {
            anomalies.push({ index: i, value: val, zScore: zScore });
        }
    });
    return anomalies;
}

// 2. Simple Linear Regression for Forecasting (y = mx + b)
function linearRegression(y) {
    let n = y.length;
    let sum_x = 0;
    let sum_y = 0;
    let sum_xy = 0;
    let sum_xx = 0;

    for (let i = 0; i < n; i++) {
        sum_x += i;
        sum_y += y[i];
        sum_xy += (i * y[i]);
        sum_xx += (i * i);
    }

    const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    const intercept = (sum_y - slope * sum_x) / n;

    return { slope, intercept };
}


async function fetchDashboardData() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        processAndRender(data);
    } catch (error) {
        console.error("Failed to fetch data:", error);
        document.getElementById('alerts-feed').innerHTML = '<p style="color: #ef4444;">Failed to load data. Ensure the Python backend is running.</p>';
    }
}

function processAndRender(data) {
    if (!data || data.length === 0) return;

    // --- Data Processing ---
    const totalCost = data.reduce((sum, item) => sum + item.Cost, 0);

    const monthlyDataObj = {};
    const rawDailyCosts = []; // for daily anomaly detection

    // Sort data chronologically to process correctly
    const sortedRawData = [...data].sort((a, b) => new Date(a.Date) - new Date(b.Date));

    sortedRawData.forEach(item => {
        const month = item.Date.substring(0, 7);
        monthlyDataObj[month] = (monthlyDataObj[month] || 0) + item.Cost;
        rawDailyCosts.push(item);
    });

    const sortedMonths = Object.keys(monthlyDataObj).sort();
    const monthlyCosts = sortedMonths.map(m => monthlyDataObj[m]);

    // 1. Calculate MoM
    let momText = "N/A";
    let isPositive = false;
    if (sortedMonths.length >= 2) {
        const lastMonth = monthlyCosts[monthlyCosts.length - 1];
        const prevMonth = monthlyCosts[monthlyCosts.length - 2];
        const momGrowth = ((lastMonth - prevMonth) / prevMonth) * 100;
        isPositive = momGrowth >= 0;
        momText = `${isPositive ? '+' : ''}${momGrowth.toFixed(1)}% MoM`;
    }

    // 2. Linear Regression Forecasting
    const { slope, intercept } = linearRegression(monthlyCosts);
    const forecastedMonths = [];
    const forecastedCosts = [];
    let cumulativeForecast = 0;

    // Predict next 3 months
    for (let i = 1; i <= 3; i++) {
        const futureIndex = monthlyCosts.length - 1 + i;
        const predictedCost = (slope * futureIndex) + intercept;

        // Generate Next Month label
        const lastDate = new Date(sortedMonths[sortedMonths.length - 1] + "-01");
        lastDate.setMonth(lastDate.getMonth() + i);
        const nextMonthLabel = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}`;

        forecastedMonths.push(nextMonthLabel);
        // ensure predictions don't randomly drop below 0 unrealistically
        const finalCost = Math.max(predictedCost, monthlyCosts[monthlyCosts.length - 1] * 0.5);
        forecastedCosts.push(finalCost);
        cumulativeForecast += finalCost;
    }

    // 3. Anomaly Detection
    const dailyCostValues = sortedRawData.map(item => item.Cost);
    const anomalies = detectAnomalies(dailyCostValues);

    // Filter anomalies to just the significant, recent ones
    const recentAnomalies = anomalies.slice(-5).reverse();

    // 4. Summaries
    const serviceData = {};
    const envData = {};
    data.forEach(item => {
        serviceData[item.Service] = (serviceData[item.Service] || 0) + item.Cost;
        envData[item.Environment] = (envData[item.Environment] || 0) + item.Cost;
    });
    const sortedServices = Object.entries(serviceData).sort((a, b) => b[1] - a[1]);
    const sortedEnvs = Object.entries(envData).sort((a, b) => b[1] - a[1]);

    const topService = sortedServices[0];
    const topServicePct = (topService[1] / totalCost) * 100;
    const topEnv = sortedEnvs[0];
    const topEnvPct = (topEnv[1] / totalCost) * 100;

    // --- Update KPI DOM Elements ---
    document.getElementById('kpi-total-cost').textContent = formatCurrency(totalCost);
    const momEl = document.getElementById('kpi-mom-trend');
    momEl.textContent = momText;
    momEl.className = `trend ${isPositive ? 'negative' : 'positive'}`;

    document.getElementById('kpi-top-service').textContent = topService[0];
    document.getElementById('kpi-top-service-pct').textContent = `${formatPercent(topServicePct)} of total`;

    document.getElementById('kpi-top-env').textContent = topEnv[0];
    document.getElementById('kpi-top-env-pct').textContent = `${formatPercent(topEnvPct)} of total`;

    // New Forecast KPI
    document.getElementById('kpi-forecast').textContent = formatCurrency(cumulativeForecast);
    let forecastChangePct = ((cumulativeForecast / (monthlyCosts.slice(-3).reduce((a, b) => a + b, 0))) - 1) * 100;
    document.getElementById('kpi-forecast-pct').textContent = `${forecastChangePct >= 0 ? '+' : ''}${forecastChangePct.toFixed(1)}% vs prev 90 days`;
    document.getElementById('kpi-forecast-pct').style.color = forecastChangePct >= 0 ? 'var(--negative-trend)' : 'var(--positive-trend)';


    // --- Generate AI Alerts Feed ---
    const alertsContainer = document.getElementById('alerts-feed');
    alertsContainer.innerHTML = ''; // clear

    // Add forecast alert
    alertsContainer.innerHTML += `
        <div class="alert-item insight">
            📈 <span><strong>Forecast Insight:</strong> Based on historical usage, AI predicts spending will ${forecastChangePct > 0 ? 'increase' : 'decrease'} by ${Math.abs(forecastChangePct).toFixed(1)}% over the next quarter.</span>
        </div>
    `;

    // Add anomaly alerts
    if (recentAnomalies.length > 0) {
        recentAnomalies.forEach(anomaly => {
            const rawItem = sortedRawData[anomaly.index];
            alertsContainer.innerHTML += `
                <div class="alert-item anomaly">
                    ⚠️ <span><strong>Cost Spike Detected:</strong> Unusually high charge of ${formatCurrency(rawItem.Cost)} for <strong>${rawItem.Service}</strong> (${rawItem.Instance_Type}) in the ${rawItem.Environment} environment on ${rawItem.Date}.</span>
                </div>
            `;
        });
    } else {
        alertsContainer.innerHTML += `
            <div class="alert-item insight">
                ✅ <span><strong>System Healthy:</strong> No recent cost anomalies detected in your cloud infrastructure.</span>
            </div>
        `;
    }

    // General insights
    alertsContainer.innerHTML += `
        <div class="alert-item insight">
            💡 <span><strong>Optimization Opportunity:</strong> ${topService[0]} in the ${topEnv[0]} environment dominates spending at ${formatPercent((topService[1] / totalCost) * 100)}%. Consider reviewing these instances.</span>
        </div>
    `;


    // --- Render Charts ---
    renderMonthlyTrendChart(sortedMonths, monthlyCosts, forecastedMonths, forecastedCosts);
    renderServiceChart(sortedServices.map(s => s[0]), sortedServices.map(s => s[1]));
    renderEnvironmentChart(sortedEnvs.map(e => e[0]), sortedEnvs.map(e => e[1]));
}

// Chart Renderers

function renderMonthlyTrendChart(labels, actualData, forecastLabels, forecastData) {
    const ctx = document.getElementById('monthlyTrendChart').getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    // Combine labels and align actual & forecast data
    const allLabels = [...labels, ...forecastLabels];

    // Bridge the gap so the lines connect visually
    const paddedForecastData = Array(labels.length - 1).fill(null);
    paddedForecastData.push(actualData[actualData.length - 1]); // connection point
    paddedForecastData.push(...forecastData);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: allLabels,
            datasets: [
                {
                    label: 'Actual Cost',
                    data: actualData,
                    borderColor: '#3b82f6',
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#0f172a',
                    pointBorderColor: '#3b82f6',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                },
                {
                    label: 'AI Forecast',
                    data: paddedForecastData,
                    borderColor: '#a78bfa', // Purple for AI
                    borderWidth: 3,
                    borderDash: [5, 5], // Dashed line
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#0f172a',
                    pointBorderColor: '#a78bfa',
                    pointBorderWidth: 2,
                    pointRadius: 3,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: { usePointStyle: true, boxWidth: 6 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { callback: function (value) { return '$' + value; } }
                }, x: { grid: { display: false } }
            }
        }
    });
}

function renderServiceChart(labels, data) {
    const ctx = document.getElementById('serviceChart').getContext('2d');
    const backgroundColors = [
        'rgba(167, 139, 250, 0.8)', 'rgba(96, 165, 250, 0.8)', 'rgba(52, 211, 153, 0.8)', 'rgba(244, 114, 182, 0.8)', 'rgba(251, 191, 36, 0.8)'
    ];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cost Output',
                data: data,
                backgroundColor: backgroundColors,
                borderRadius: 6,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                x: { grid: { display: false }, ticks: { maxRotation: 45, minRotation: 45 } }
            }
        }
    });
}

function renderEnvironmentChart(labels, data) {
    const ctx = document.getElementById('environmentChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#818cf8', '#38bdf8', '#fb923c', '#f43f5e', '#a3e635'],
                borderWidth: 2, borderColor: '#1e293b', hoverOffset: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '75%',
            plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' } } }
        }
    });
}

document.addEventListener('DOMContentLoaded', fetchDashboardData);
