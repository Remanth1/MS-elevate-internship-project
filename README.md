# Cloud Cost Analytics & AI Dashboard

This repository contains robust analytical tools for processing and visualizing cloud infrastructure costs, originally designed for Power BI but now extended into a standalone, AI-powered web dashboard.

## Overview

The project is split into two primary components:

1. **Power BI Python Scripts**: Core python logic intended to be executed natively within Microsoft Power BI visuals to calculate percent breakdowns, Month-over-Month (MoM) growth, and generate automated textual insights.
2. **AI Web Dashboard**: A bespoke, premium HTML/CSS/JS frontend powered by a lightweight Python API server that replicates and enhances the Power BI experience outside of the Microsoft ecosystem.

---

## 1. Power BI Scripts

These scripts (`TrendAnalysis.py`, `DataExploration.py`, `KeyVisuals*.py`) are designed to take a Pandas DataFrame (`df`) containing cloud billing telemetry (`Date`, `Service`, `Instance_Type`, `Environment`, `Cost`) and transform it.

### Features:
- Calculates **MoM Growth %** for tracking cost velocity.
- Sorts and ranks spending across Services and Environments.
- Generates **dynamic textual insights** directly into the visual output, summarizing the top spenders and percentage breakdowns.

---

## 2. The Custom AI Dashboard (`/dashboard`)

To provide an executive-level wow-factor free from licensing restrictions, a custom web dashboard was built from scratch. It utilizes a **Glassmorphism dark-mode aesthetic** and incorporates advanced mathematical modeling directly in the browser to act as an "AI Analyst".

### Advanced AI Features:
- **Z-Score Anomaly Detection**: A statistical engine calculates the mean and standard deviation of daily cloud costs. Any individual charge that spikes above a safe threshold (Z-Score > 2.0) is automatically flagged in the UI as a potential issue.
- **Predictive Forecasting (Linear Regression)**: The dashboard mathematically analyzes historical monthly spend to find the line-of-best-fit. It then draws a dotted projection line 90-days into the future and explicitly calculates if costs are expected to rise or fall.
- **Smart Alerts Feed**: A dynamic sidebar feed that interprets the raw data and models, printing out plain-English alerts (e.g., *"Forecast Insight: AI predicts spending will increase by 12% over the next quarter"*).

### Tech Stack:
- **Backend API**: Python 3 standard library `http.server` (No frameworks required).
- **Frontend**: Vanilla HTML5, CSS3 (Flexbox/Grid), and Vanilla JavaScript (ES6+).
- **Data Visualization**: Chart.js.

### How to Run Successfully Locally:
You do not need to install Node/NPM or any complicated servers.

1. Open your terminal.
2. Navigate into the `dashboard` directory: 
   ```bash
   cd dashboard
   ```
3. Start the local Python server:
   ```bash
   python app.py
   ```
4. Open your web browser and navigate to:
   **[http://localhost:8000](http://localhost:8000)**

---

## Authors & Maintainers
*Remanth* - MS Elevate Internship Project
