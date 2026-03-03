
import os, flask, requests
from flask import request, jsonify
import anthropic

app = flask.Flask(__name__)
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
GITEA_URL = os.getenv("GITEA_URL")
TOKEN = os.getenv("GITEA_TOKEN")

@app.route("/review", methods=["POST"])
def review():
    payload = request.json
    diff = payload.get("diff", "")
    pr_id = payload.get("pr_id")

    msg = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=600,
        messages=[{"role":"user","content":f"Review this diff:
{diff}"}]
    )

    review_text = msg.content[0].text

    # Post comment back to Gitea
    requests.post(
        f"{GITEA_URL}/api/v1/repos/{payload['repo']}/pulls/{pr_id}/comments",
        headers={"Authorization": f"token {TOKEN}"},
        json={"body": review_text}
    )

    return jsonify({"status":"ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
