from app.main import list_campaign_paths

def test_campaigns_exist():
    assert len(list_campaign_paths()) >= 1
