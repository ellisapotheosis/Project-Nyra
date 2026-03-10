import os
from flask import Flask, request, jsonify

app = Flask(__name__)


def calculate_monthly_payment(amount: float, annual_rate: float, term_years: int = 30) -> float:
    """Compute the approximate monthly payment for a fixed‑rate mortgage.

    This uses the simple amortisation formula.  For production use you
    may want a more sophisticated calculation.
    """
    monthly_rate = annual_rate / 12.0
    n_payments = term_years * 12
    if monthly_rate == 0:
        return amount / n_payments
    numerator = monthly_rate * (1 + monthly_rate) ** n_payments
    denominator = (1 + monthly_rate) ** n_payments - 1
    return amount * numerator / denominator


@app.route("/quote", methods=["POST"])
def quote():
    """Generate three mortgage quote options and optionally persist them.

    Expected JSON payload:
        {
            "loan_amount": 350000,
            "credit_score": 740,
            "term_years": 30
        }

    The service returns a list of three options with varying rates and
    monthly payments.  It can optionally POST the chosen quote back
    to TwentyCRM if the environment variable TWENTYCRM_API_URL is set.
    """
    payload = request.get_json(force=True) or {}
    loan_amount = float(payload.get("loan_amount", 350000))
    credit_score = int(payload.get("credit_score", 720))
    term_years = int(payload.get("term_years", 30))

    # Base rate determined by credit score (dummy logic)
    if credit_score >= 760:
        base_rate = 0.049
    elif credit_score >= 700:
        base_rate = 0.054
    elif credit_score >= 650:
        base_rate = 0.061
    else:
        base_rate = 0.072

    # Generate three quote options
    rates = [base_rate - 0.005, base_rate, base_rate + 0.005]
    quotes = []
    for i, rate in enumerate(rates, start=1):
        monthly_payment = calculate_monthly_payment(loan_amount, rate, term_years)
        quotes.append({
            "id": i,
            "type": ["Conventional", "FHA", "Jumbo"][i - 1] if i <= 3 else f"Option {i}",
            "rate": round(rate * 100, 3),
            "monthly_payment": round(monthly_payment, 2)
        })

    # Optionally send the quotes to TwentyCRM
    crm_url = os.environ.get("TWENTYCRM_API_URL")
    crm_token = os.environ.get("TWENTYCRM_API_TOKEN")
    if crm_url and crm_token:
        import requests
        try:
            requests.post(
                f"{crm_url}/quotes",
                json={"quotes": quotes, "loan_amount": loan_amount, "credit_score": credit_score},
                headers={"Authorization": f"Bearer {crm_token}"},
                timeout=5,
            )
        except Exception as e:
            # Fail quietly – CRM persistence is optional
            print(f"Warning: failed to persist quote to TwentyCRM: {e}")

    return jsonify({"quotes": quotes})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)