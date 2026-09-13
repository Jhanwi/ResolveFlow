# ResolveFlow Analytics

ResolveFlow uses Python and Pandas to analyze support ticket data stored in PostgreSQL.

## Reports

The analytics script generates:

- Ticket summary
- Priority distribution
- Category distribution
- Daily ticket volume
- Agent workload
- SLA report
- Customer review summary

## Run Analytics

```bash
cd analytics
python3 -m pip install -r requirements.txt
python3 analytics.py