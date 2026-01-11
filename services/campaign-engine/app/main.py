from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from enum import Enum
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Nyra Campaign Engine", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class CampaignType(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    CALL = "call"
    MIXED = "mixed"

class CampaignStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"

class Campaign(BaseModel):
    id: Optional[str] = None
    name: str
    type: CampaignType
    status: CampaignStatus = CampaignStatus.DRAFT
    leads: List[str]
    schedule_days: List[int]
    content: dict
    created_at: Optional[datetime] = None

class CampaignCreate(BaseModel):
    name: str
    type: CampaignType
    leads: List[str]
    schedule_days: List[int]
    content: dict

campaigns_db = {}

@app.post("/campaigns", response_model=Campaign)
async def create_campaign(campaign: CampaignCreate):
    campaign_id = f"CAMP{datetime.now().strftime('%Y%m%d%H%M%S')}"
    new_campaign = Campaign(
        id=campaign_id,
        name=campaign.name,
        type=campaign.type,
        status=CampaignStatus.DRAFT,
        leads=campaign.leads,
        schedule_days=campaign.schedule_days,
        content=campaign.content,
        created_at=datetime.now()
    )
    campaigns_db[campaign_id] = new_campaign
    logger.info(f"Created campaign {campaign_id}")
    return new_campaign

@app.get("/campaigns/{campaign_id}", response_model=Campaign)
async def get_campaign(campaign_id: str):
    if campaign_id not in campaigns_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaigns_db[campaign_id]

@app.get("/campaigns", response_model=List[Campaign])
async def list_campaigns():
    return list(campaigns_db.values())

@app.post("/campaigns/{campaign_id}/start")
async def start_campaign(campaign_id: str):
    if campaign_id not in campaigns_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    campaigns_db[campaign_id].status = CampaignStatus.ACTIVE
    logger.info(f"Started campaign {campaign_id}")
    return {"message": "Campaign started", "campaign_id": campaign_id}

@app.post("/campaigns/{campaign_id}/pause")
async def pause_campaign(campaign_id: str):
    if campaign_id not in campaigns_db:
        raise HTTPException(status_code=404, detail="Campaign not found")
    campaigns_db[campaign_id].status = CampaignStatus.PAUSED
    return {"message": "Campaign paused"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "campaign-engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
