# SolSpy - Solana Validator Monitoring

SolSpy is a comprehensive monitoring and analytics platform for Solana validators.

## Features

- Real-time validator performance monitoring
- Trustworthy Validator Composite (TVC) scoring system
- Jito-specific validator scoring
- Detailed validator metrics and statistics
- Performance ranking and comparison tools



## Solspy supervisor


```bash
sudo supervisorctl status 
sudo supervisorctl stop all
sudo supervisorctl reread
sudo supervisorctl update

sudo supervisorctl start run-cron-jobs
sudo supervisorctl start run-cron-settings
sudo supervisorctl start run-cron-tvc
sudo supervisorctl start run-cron-scores-jobs
sudo supervisorctl start run-cron-dayly-jobs
```
