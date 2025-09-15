# Self-Stake Analysis Using Historical Data

## Overview
With the historical self-stake data now available for the current epoch and the previous 5 epochs, we can perform various analyses and visualizations to provide deeper insights into validator behavior.

## Available Data
The API now returns:
1. `selfStakeHistory` - Object with epoch numbers as keys and self-stake amounts as values
2. `selfStakeTrend` - Trend analysis including:
   - `trend` - "increasing", "decreasing", or "stable"
   - `changePercent` - Percentage change over the period
   - `average` - Average self-stake over the period
   - `min` - Minimum self-stake value
   - `max` - Maximum self-stake value

## Example Usage in Frontend

### 1. Historical Chart Visualization
```javascript
// Example React component to display self-stake history chart
import React from 'react';
import { Line } from 'react-chartjs-2';

const SelfStakeHistoryChart = ({ metrics }) => {
  const { selfStakeHistory } = metrics;
  
  // Prepare data for Chart.js
  const epochs = Object.keys(selfStakeHistory).sort();
  const stakeValues = epochs.map(epoch => selfStakeHistory[epoch]);
  
  const chartData = {
    labels: epochs,
    datasets: [
      {
        label: 'Self-Stake (SOL)',
        data: stakeValues,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };
  
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Self-Stake History (Last 6 Epochs)'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Self-Stake (SOL)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Epoch'
        }
      }
    }
  };
  
  return <Line data={chartData} options={options} />;
};
```

### 2. Trend Analysis Display
```javascript
// Example React component to display trend analysis
import React from 'react';

const SelfStakeTrend = ({ metrics }) => {
  const { selfStakeTrend } = metrics;
  
  const getTrendColor = (trend) => {
    switch(trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'increasing': return '↑';
      case 'decreasing': return '↓';
      default: return '→';
    }
  };
  
  return (
    <div className="self-stake-trend">
      <h3>Self-Stake Trend Analysis</h3>
      <div className={`trend-indicator ${getTrendColor(selfStakeTrend.trend)}`}>
        {getTrendIcon(selfStakeTrend.trend)} {selfStakeTrend.trend.charAt(0).toUpperCase() + selfStakeTrend.trend.slice(1)}
      </div>
      <div className="trend-details">
        <p>Change: <span className={selfStakeTrend.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
          {selfStakeTrend.changePercent >= 0 ? '+' : ''}{selfStakeTrend.changePercent}%
        </span></p>
        <p>Average: {selfStakeTrend.average} SOL</p>
        <p>Min: {selfStakeTrend.min} SOL</p>
        <p>Max: {selfStakeTrend.max} SOL</p>
      </div>
    </div>
  );
};
```

### 3. Comparative Analysis
```javascript
// Example function to compare self-stake trends between validators
const compareSelfStakeTrends = (validatorMetricsList) => {
  return validatorMetricsList.map(validator => ({
    name: validator.name,
    trend: validator.selfStakeTrend.trend,
    change: validator.selfStakeTrend.changePercent,
    average: validator.selfStakeTrend.average
  })).sort((a, b) => b.change - a.change);
};
```

## Advanced Analytics Possible with This Data

### 1. Stability Score
Calculate a stability score based on how consistent a validator's self-stake has been over time:
```javascript
const calculateStabilityScore = (selfStakeHistory) => {
  const values = Object.values(selfStakeHistory);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower standard deviation means higher stability
  const stabilityScore = 100 - Math.min(100, (stdDev / average) * 100);
  return Math.max(0, stabilityScore);
};
```

### 2. Growth Rate Analysis
Calculate the compound annual growth rate (CAGR) for self-stake:
```javascript
const calculateSelfStakeCAGR = (selfStakeHistory) => {
  const epochs = Object.keys(selfStakeHistory).sort((a, b) => a - b);
  const startValue = selfStakeHistory[epochs[0]];
  const endValue = selfStakeHistory[epochs[epochs.length - 1]];
  const numberOfPeriods = epochs.length - 1;
  
  if (numberOfPeriods <= 0 || startValue <= 0) return 0;
  
  const cagr = (Math.pow(endValue / startValue, 1 / numberOfPeriods) - 1) * 100;
  return Math.round(cagr * 100) / 100; // Round to 2 decimal places
};
```

## Benefits of Historical Data Analysis

1. **Trend Identification**: Spot validators who are consistently increasing their self-stake as a sign of confidence
2. **Risk Assessment**: Identify validators with volatile self-stake as potentially higher risk
3. **Performance Comparison**: Compare self-stake trends across different validators
4. **Historical Context**: Provide context for current self-stake values
5. **Predictive Insights**: Use historical patterns to make informed predictions about future behavior

This historical data provides a much richer understanding of validator behavior than a single point-in-time measurement.