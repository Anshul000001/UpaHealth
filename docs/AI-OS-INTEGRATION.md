# UpaHealth AI Operating System — Integration Guide

## What's Built

A complete AI agent OS with 15 autonomous agents, each with its own:
- System prompt and persona
- Capabilities and schedule
- DB tables for tasks, reports, activities
- API endpoints for triggering and monitoring

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  External Schedulers (n8n / GitHub Actions / Vercel Cron)│
└──────────────────┬──────────────────────────────────────┘
                   │ POST /api/agents/{name}/run
                   ↓
┌─────────────────────────────────────────────────────────┐
│  Next.js API Routes (UpaHealth)                          │
│  - Auth check                                            │
│  - Loads agent definition from registry                  │
│  - Builds live business context from Supabase            │
│  - Calls NVIDIA Llama 3.1                                │
│  - Persists task + activity + report                     │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│  Supabase                                                │
│  - ai_agents       (agent registry + stats)              │
│  - ai_tasks        (every run logged)                    │
│  - ai_reports      (output stored as reports)            │
│  - ai_activities   (audit trail)                         │
│  - ai_recommendations (cross-agent recs)                 │
│  - lead_scores, supplier_scores                          │
│  - social_posts, outreach_campaigns, outreach_messages   │
│  - export_buyers, ceo_dashboard_metrics                  │
└─────────────────────────────────────────────────────────┘
```

## API Endpoints

### List all agents
```
GET /api/agents
→ Returns merged registry + DB stats
```

### Trigger an agent run
```
POST /api/agents/{name}/run
Body (optional): { "prompt": "specific task instruction" }

Examples:
POST /api/agents/CEO/run
POST /api/agents/Tender/run
POST /api/agents/Instagram/run     {"prompt": "Generate a reel about IV cannulas"}
POST /api/agents/Email/run         {"prompt": "Draft outreach to 5 Kenyan hospitals"}
```

### Get recent runs
```
GET /api/agents/runs?agent=CEO&limit=20
```

## The 15 Agents

| # | Agent | Role | Schedule (cron) |
|---|-------|------|-----------------|
| 1 | CEO | Chief Executive AI | `0 8 * * *` daily 8am |
| 2 | Sales | Sales Intelligence | `0 9 * * *` |
| 3 | CRM | CRM Automation | `0 10 * * *` |
| 4 | Procurement | Procurement Intelligence | `0 11 * * 1` Mon |
| 5 | Supplier | Supplier Intelligence | `0 9 * * 1` Mon |
| 6 | Tender | Government Tender Intelligence | `0 */4 * * *` every 4h |
| 7 | Export | Export Buyer Discovery | `0 10 * * *` |
| 8 | Instagram | Instagram Growth | `0 7 * * *` 7am |
| 9 | LinkedIn | LinkedIn Authority | `0 8 * * 1-5` weekdays |
| 10 | SEO | Website SEO | `0 6 * * *` |
| 11 | Email | Email Outreach | `0 10,14 * * 1-5` |
| 12 | Finance | Finance & KPI | `0 18 * * 5` Fri 6pm |
| 13 | Operations | Operations | `0 9 * * *` |
| 14 | Compliance | Compliance & Certifications | `0 9 * * 1` Mon |
| 15 | Reporting | AI Reporting Aggregator | `0 19 * * *` 7pm |

## n8n Workflow Setup

### Option 1: Self-hosted n8n (Railway / Docker)

```yaml
# docker-compose.yml
version: '3'
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=changeme
      - WEBHOOK_URL=https://your-n8n.domain.com
    volumes:
      - n8n_data:/home/node/.n8n
volumes:
  n8n_data:
```

### Option 2: n8n Cloud (easiest)

1. Sign up at [n8n.cloud](https://n8n.cloud)
2. Create a new workflow per agent
3. Add a **Cron** trigger node with the schedule above
4. Add an **HTTP Request** node:
   - Method: `POST`
   - URL: `https://upa-health.vercel.app/api/agents/CEO/run`
   - Authentication: Bearer token (your NextAuth session token)
5. Add a **Postgres** node (Supabase) to read agent output if needed

### Sample n8n workflow JSON (CEO Daily Briefing)

```json
{
  "name": "UpaHealth CEO Daily Briefing",
  "nodes": [
    {
      "parameters": { "rule": { "interval": [{ "field": "cronExpression", "expression": "0 8 * * *" }] } },
      "name": "Daily 8am",
      "type": "n8n-nodes-base.scheduleTrigger"
    },
    {
      "parameters": {
        "url": "https://upa-health.vercel.app/api/agents/CEO/run",
        "method": "POST",
        "authentication": "headerAuth",
        "headerParameters": { "parameters": [{ "name": "Authorization", "value": "Bearer YOUR_TOKEN" }] }
      },
      "name": "Run CEO Agent",
      "type": "n8n-nodes-base.httpRequest"
    }
  ]
}
```

## What Each Agent Outputs

Most agents return structured JSON in their output. Examples:

**CEO Agent:**
```json
{
  "executiveSummary": "Strong pipeline growth, 3 hot tenders need response by Friday.",
  "topMetrics": [
    {"metric": "Pipeline Value", "value": "₹45L", "trend": "up"},
    {"metric": "Open Tenders", "value": "12", "trend": "up"}
  ],
  "recommendations": [
    "Prioritize KEMSA Kenya tender (closes May 20)",
    "Follow up with City Hospital Jaipur",
    "Push Instagram content on IV sets"
  ],
  "alerts": [
    {"level": "warning", "message": "3 leads stalled >7 days"}
  ]
}
```

**Tender Agent:**
```json
{
  "tenders": [
    {
      "title": "Surgical Consumables Supply",
      "score": 92,
      "winProbability": 65,
      "estimatedProfitability": 18.5,
      "summary": "...",
      "requiredDocs": ["IEC", "ISO 13485", "GST", ...]
    }
  ]
}
```

## Future Integrations (require external accounts)

These need user-provided API keys/accounts before they can actually post/send:

- **Instagram Graph API** — for auto-posting (requires Business account + Meta App approval)
- **LinkedIn API** — auto-posting (requires LinkedIn Marketing Developer Platform access)
- **WhatsApp Business API** — via Twilio/Meta (requires verified business)
- **Resend / SendGrid** — for actual email sending
- **Canva API** — for visual generation

Currently the agents **generate the content** for these platforms — n8n then handles delivery via whichever channel you connect.

## Cost Optimization

NVIDIA NIM (already configured) is free up to a quota. For higher volume:
- Use Llama 3.1 8B for routine tasks (cheap)
- Reserve Llama 3.1 70B for CEO/strategic reports
- Use OpenAI GPT-4 only for customer-facing email (highest quality)

## Production Checklist

- [x] Database schema for AI OS tables
- [x] 15 agents seeded with system prompts
- [x] Agent runner with live DB context injection
- [x] API endpoints for trigger and monitoring
- [x] Dashboard at /dashboard/agents
- [x] Sidebar nav link
- [ ] n8n workflows deployed (manual setup required)
- [ ] Instagram/LinkedIn API tokens added (manual)
- [ ] WhatsApp Business API connected (manual)
- [ ] Email provider (Resend) connected (manual)
