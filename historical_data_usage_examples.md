# Using Historical Data for Validator Analysis

## Overview
With the historical data now available for both self-stake and vote credits across multiple epochs, we can perform various types of analysis to gain deeper insights into validator performance and behavior.

## 1. API Endpoints Available

### a. Individual Validator Metrics
`GET /api/validator-metrics?votePubkey={votePubkey}&validatorIdentityPubkey={nodePubkey}`

Returns:
- Current metrics for a single validator
- Historical self-stake data (`selfStakeHistory`)
- Self-stake trend analysis (`selfStakeTrend`)

### b. Historical Metrics with Trend Analysis
`GET /api/historical-metrics?votePubkey={votePubkey}&validatorIdentityPubkey={nodePubkey}`

Returns:
- Validator information
- Self-stake history and trend analysis
- Vote credits history and trend analysis

## 2. Practical Usage Examples

### A. Frontend Dashboard Component
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ValidatorDashboard = ({ votePubkey, nodePubkey }) => {
  const [historicalMetrics, setHistoricalMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistoricalMetrics = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/historical-metrics', {
          params: {
            votePubkey,
            validatorIdentityPubkey: nodePubkey
          }
        });
        setHistoricalMetrics(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (votePubkey && nodePubkey) {
      fetchHistoricalMetrics();
    }
  }, [votePubkey, nodePubkey]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!historicalMetrics) return <div>No data available</div>;

  const { validator, selfStake, voteCredits } = historicalMetrics;

  return (
    <div className="validator-dashboard">
      <h2>Validator: {validator.name}</h2>
      <p>Current Epoch: {validator.currentEpoch}</p>
      
      <div className="metrics-section">
        <h3>Self-Stake Analysis</h3>
        <div className="trend-info">
          <span className={`trend ${selfStake.trend.trend}`}>
            Trend: {selfStake.trend.trend} ({selfStake.trend.changePercent}%)
          </span>
          <p>Average: {selfStake.trend.average} SOL</p>
        </div>
        
        <h4>Historical Data (Last 6 Epochs)</h4>
        <ul>
          {Object.entries(selfStake.history).map(([epoch, stake]) => (
            <li key={epoch}>Epoch {epoch}: {stake} SOL</li>
          ))}
        </ul>
      </div>
      
      <div className="metrics-section">
        <h3>Vote Credits Analysis</h3>
        <div className="trend-info">
          <span className={`trend ${voteCredits.trend.trend}`}>
            Trend: {voteCredits.trend.trend} ({voteCredits.trend.changePercent}%)
          </span>
          <p>Average: {voteCredits.trend.average}</p>
        </div>
        
        <h4>Historical Data (Last 6 Epochs)</h4>
        <ul>
          {Object.entries(voteCredits.history).map(([epoch, credits]) => (
            <li key={epoch}>Epoch {epoch}: {credits} credits</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
```

### B. Comparative Analysis Service
```javascript
// Service to compare multiple validators
class ValidatorComparisonService {
  static async getValidatorsComparison(validatorList) {
    const comparisonData = [];
    
    for (const validator of validatorList) {
      try {
        const response = await axios.get('/api/historical-metrics', {
          params: {
            votePubkey: validator.votePubkey,
            validatorIdentityPubkey: validator.nodePubkey
          }
        });
        
        comparisonData.push({
          name: response.data.validator.name,
          selfStakeTrend: response.data.selfStake.trend,
          voteCreditsTrend: response.data.voteCredits.trend,
          currentSelfStake: response.data.selfStake.history[response.data.validator.currentEpoch],
          currentVoteCredits: response.data.voteCredits.history[response.data.validator.currentEpoch]
        });
      } catch (error) {
        console.error(`Error fetching data for ${validator.name}:`, error);
      }
    }
    
    return comparisonData;
  }
  
  static rankValidatorsBySelfStakeGrowth(validatorsData) {
    return validatorsData
      .sort((a, b) => b.selfStakeTrend.changePercent - a.selfStakeTrend.changePercent)
      .map((validator, index) => ({
        ...validator,
        rank: index + 1
      }));
  }
  
  static identifyStableValidators(validatorsData, stabilityThreshold = 5) {
    return validatorsData.filter(validator => 
      Math.abs(validator.selfStakeTrend.changePercent) <= stabilityThreshold
    );
  }
}

// Usage example
const compareValidators = async () => {
  const validators = [
    { name: 'Validator A', votePubkey: 'key1', nodePubkey: 'node1' },
    { name: 'Validator B', votePubkey: 'key2', nodePubkey: 'node2' },
    // ... more validators
  ];
  
  const comparisonData = await ValidatorComparisonService.getValidatorsComparison(validators);
  const rankedByGrowth = ValidatorComparisonService.rankValidatorsBySelfStakeGrowth(comparisonData);
  const stableValidators = ValidatorComparisonService.identifyStableValidators(comparisonData);
  
  console.log('Ranked by self-stake growth:', rankedByGrowth);
  console.log('Stable validators:', stableValidators);
};
```

### C. Alert System Based on Historical Trends
```javascript
// Service to generate alerts based on historical data trends
class ValidatorAlertService {
  static checkForSignificantChanges(historicalMetrics) {
    const alerts = [];
    
    // Check for significant self-stake changes (>10%)
    if (Math.abs(historicalMetrics.selfStake.trend.changePercent) > 10) {
      alerts.push({
        type: 'SELF_STAKE_CHANGE',
        severity: historicalMetrics.selfStake.trend.changePercent > 0 ? 'INFO' : 'WARNING',
        message: `Self-stake ${historicalMetrics.selfStake.trend.changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(historicalMetrics.selfStake.trend.changePercent)}%`,
        data: historicalMetrics.selfStake
      });
    }
    
    // Check for declining vote credits (>5% decrease)
    if (historicalMetrics.voteCredits.trend.changePercent < -5) {
      alerts.push({
        type: 'VOTE_CREDITS_DECLINE',
        severity: 'WARNING',
        message: `Vote credits decreased by ${Math.abs(historicalMetrics.voteCredits.trend.changePercent)}%`,
        data: historicalMetrics.voteCredits
      });
    }
    
    // Check for very low self-stake
    if (historicalMetrics.selfStake.trend.average < 1000) { // Less than 1000 SOL
      alerts.push({
        type: 'LOW_SELF_STAKE',
        severity: 'WARNING',
        message: `Average self-stake is very low: ${historicalMetrics.selfStake.trend.average} SOL`,
        data: historicalMetrics.selfStake
      });
    }
    
    return alerts;
  }
  
  static generateValidatorHealthScore(historicalMetrics) {
    let score = 100;
    
    // Deduct points for negative trends
    if (historicalMetrics.selfStake.trend.changePercent < -10) score -= 20;
    else if (historicalMetrics.selfStake.trend.changePercent < 0) score -= 10;
    
    if (historicalMetrics.voteCredits.trend.changePercent < -10) score -= 25;
    else if (historicalMetrics.voteCredits.trend.changePercent < 0) score -= 15;
    
    // Deduct points for very low self-stake
    if (historicalMetrics.selfStake.trend.average < 1000) score -= 20;
    
    // Bonus points for positive trends
    if (historicalMetrics.selfStake.trend.changePercent > 20) score += 15;
    if (historicalMetrics.voteCredits.trend.changePercent > 10) score += 10;
    
    // Bonus for stable self-stake (low variance)
    const variance = this.calculateVariance(Object.values(historicalMetrics.selfStake.history));
    if (variance < 0.01) score += 10; // Very stable
    
    return Math.max(0, Math.min(100, score)); // Clamp between 0 and 100
  }
  
  static calculateVariance(values) {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, value) => sum + value, 0) / values.length;
    return avgSquaredDiff;
  }
}
```

## 3. Database Query Examples

### A. Get Top Validators by Self-Stake Growth
```sql
SELECT 
    v.name,
    v.vote_pubkey,
    sa_current.epoch as current_epoch,
    SUM(sa_current.lamports) / 1000000000.0 as current_self_stake,
    SUM(sa_oldest.lamports) / 1000000000.0 as oldest_self_stake,
    ((SUM(sa_current.lamports) - SUM(sa_oldest.lamports)) / SUM(sa_oldest.lamports)) * 100 as growth_percentage
FROM data.validators v
JOIN data.stake_accounts sa_current 
    ON v.node_pubkey = sa_current.node_pubkey 
    AND sa_current.is_self_stake = true
    AND sa_current.epoch = 849  -- Current epoch
JOIN data.stake_accounts sa_oldest 
    ON v.node_pubkey = sa_oldest.node_pubkey 
    AND sa_oldest.is_self_stake = true
    AND sa_oldest.epoch = 844   -- Oldest epoch in our dataset
GROUP BY v.name, v.vote_pubkey, sa_current.epoch
HAVING SUM(sa_oldest.lamports) > 0
ORDER BY growth_percentage DESC
LIMIT 10;
```

### B. Get Validators with Declining Vote Credits
```sql
-- This would require a more complex query using the epoch_credits JSON field
-- Here's a simplified version that would need to be adapted based on your specific needs
SELECT 
    v.name,
    v.vote_pubkey,
    -- Extract and compare vote credits from different epochs in the JSON
    -- This is pseudocode as the actual implementation depends on your JSON structure
    latest_credits - oldest_credits as credit_change,
    ((latest_credits - oldest_credits) / oldest_credits) * 100 as credit_change_percentage
FROM data.validators v
WHERE v.epoch_credits IS NOT NULL
-- Add conditions to compare credits from different epochs
ORDER BY credit_change_percentage ASC  -- Negative values first (declining)
LIMIT 10;
```

## 4. Business Intelligence Applications

### A. Risk Assessment Model
Using historical data to assess validator risk:
1. **Self-Stake Volatility**: Validators with highly variable self-stake may be less committed
2. **Vote Credit Trends**: Consistently declining vote credits may indicate technical issues
3. **Stability Score**: Combination of both metrics to provide an overall risk score

### B. Performance Benchmarking
1. **Percentile Rankings**: Compare validators against the network average
2. **Trend Analysis**: Identify validators improving or declining over time
3. **Peer Group Comparisons**: Compare validators with similar stake sizes

### C. Predictive Analytics
1. **Churn Prediction**: Identify validators likely to stop validating
2. **Growth Forecasting**: Predict future self-stake levels
3. **Performance Projections**: Estimate future vote credit earnings

## 5. Implementation Considerations

### A. Data Freshness
- Ensure historical data is regularly updated
- Implement alerts for stale data
- Consider data retention policies

### B. Performance Optimization
- Use database indexing on epoch columns
- Implement caching for frequently accessed data
- Consider data archiving for older epochs

### C. Data Quality
- Validate data consistency across epochs
- Handle missing data gracefully
- Implement data validation checks

This historical data provides a powerful foundation for deeper validator analysis and more informed decision-making for stakers and network participants.