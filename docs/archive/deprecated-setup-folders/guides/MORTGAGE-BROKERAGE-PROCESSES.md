# Mortgage Brokerage Business Processes

**Project Nyra Domain Knowledge - Essential Guide**

This document details the complete mortgage brokerage business processes that Project Nyra automates, including lead acquisition, qualification, quote generation, compliance validation, and campaign execution.

---

## 📋 Table of Contents

1. [Lead Acquisition & Sources](#lead-acquisition--sources)
2. [Lead Qualification Process](#lead-qualification-process)
3. [Quote Generation Workflow](#quote-generation-workflow)
4. [Compliance Requirements](#compliance-requirements)
5. [Campaign Automation](#campaign-automation)
6. [Rate Shopping & Comparison](#rate-shopping--comparison)
7. [Technology Integration Points](#technology-integration-points)
8. [Business Metrics & KPIs](#business-metrics--kpis)

---

## 🎯 Lead Acquisition & Sources

### Primary Lead Sources

#### 1. FreeRateUpdate.com API Integration

**Type**: Shared lead marketplace
**Cost**: $15-35 per lead
**Quality**: Medium (1-3 competing brokers receive same lead)

**Data Fields Received**:

```json
{
  "lead_id": "FRU-2024-123456",
  "timestamp": "2024-01-13T14:30:00Z",
  "borrower": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "555-123-4567",
    "address": {
      "street": "123 Main St",
      "city": "Austin",
      "state": "TX",
      "zip": "78701"
    }
  },
  "loan_details": {
    "purpose": "purchase",
    "property_type": "single_family",
    "property_value": 450000,
    "down_payment": 90000,
    "credit_score": 740,
    "employment_status": "employed",
    "annual_income": 120000
  },
  "consent": {
    "tcpa_agreed": true,
    "timestamp": "2024-01-13T14:29:45Z",
    "ip_address": "192.168.1.100"
  }
}
```

**Integration Flow**:

1. Webhook received at `https://nyra.projectnyra.com/api/webhooks/freerateupdate`
2. Nexus Router validates signature and payload
3. Quote Engine processes immediately (< 2 seconds target)
4. TwentyCRM creates lead record
5. Campaign Engine triggers immediate response workflow

**Response Time Requirement**: **< 5 minutes** to first contact (competitive advantage)

#### 2. LendingTree.com API Integration

**Type**: Exclusive lead (optional)
**Cost**: $50-100 per lead
**Quality**: High (exclusive to one broker)

**Data Fields Received**:

```json
{
  "lead_id": "LT-2024-987654",
  "timestamp": "2024-01-13T15:45:00Z",
  "borrower": {
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "555-987-6543",
    "ssn_last_4": "1234"
  },
  "loan_details": {
    "purpose": "refinance",
    "loan_type": "conventional",
    "property_value": 600000,
    "loan_amount": 450000,
    "credit_score": 780,
    "employment_type": "W2",
    "annual_income": 180000,
    "debt_to_income": 28
  },
  "property": {
    "occupancy": "primary",
    "property_type": "single_family",
    "year_built": 2015,
    "units": 1
  }
}
```

**Integration Flow**:

1. Poll API every 5 minutes (rate limit: 12 requests/minute)
2. Process new leads with priority flag
3. Generate personalized quote with **exclusive attention** messaging
4. Trigger VIP campaign sequence in n8n

#### 3. RateHunter.net Direct Submissions

**Type**: Organic/direct
**Cost**: $0 (owned traffic)
**Quality**: Highest (warm leads, brand aware)

**Submission Form Fields**:

- Basic contact info (name, email, phone)
- Loan purpose (purchase, refinance, cash-out, HELOC)
- Property details (type, value, location)
- Financial snapshot (credit score range, income range, down payment)
- Timeline urgency (ASAP, 30 days, 60 days, 90+ days)

**Integration Flow**:

1. Next.js API route receives form submission
2. reCAPTCHA validation (block bots)
3. Lead scoring algorithm assigns priority (A/B/C/D)
4. Instant quote displayed on-screen
5. Email with detailed breakdown sent immediately
6. Campaign sequence starts based on priority

---

## 🔍 Lead Qualification Process

### Credit Score Tiers

| Tier          | FICO Range | Interest Rate Impact            | Approval Likelihood | Actions                        |
| ------------- | ---------- | ------------------------------- | ------------------- | ------------------------------ |
| **Excellent** | 760+       | Best rates (-0.25% to -0.5%)    | 95%+                | Fast-track, premium rates      |
| **Good**      | 700-759    | Standard rates                  | 85-95%              | Standard processing            |
| **Fair**      | 640-699    | Higher rates (+0.5% to +1.0%)   | 60-85%              | Requires stronger DTI/LTV      |
| **Poor**      | 580-639    | Subprime rates (+1.5% to +3.0%) | 30-60%              | FHA/VA programs, manual review |
| **Bad**       | <580       | Limited options (+3.0%+)        | <30%                | Credit repair referral         |

### Debt-to-Income (DTI) Ratio Guidelines

**Formula**: `DTI = (Monthly Debt Payments / Gross Monthly Income) × 100`

**Conventional Loans**:

- **Ideal**: DTI ≤ 36% (front-end), ≤ 43% (back-end)
- **Maximum**: DTI ≤ 50% with compensating factors

**FHA Loans**:

- **Ideal**: DTI ≤ 31% (front-end), ≤ 43% (back-end)
- **Maximum**: DTI ≤ 56.99% with strong credit/reserves

**VA Loans**:

- No front-end DTI limit
- **Maximum back-end**: DTI ≤ 41% (waivable to 50% with residual income)

**Automated Calculation** (Quote Engine):

```python
def calculate_dti(borrower_data):
    """Calculate front-end and back-end DTI ratios."""
    monthly_income = borrower_data["annual_income"] / 12

    # Front-end DTI (housing expenses only)
    piti = (
        borrower_data["principal_interest"] +
        borrower_data["property_tax"] +
        borrower_data["homeowners_insurance"] +
        borrower_data.get("hoa_dues", 0)
    )
    front_end_dti = (piti / monthly_income) * 100

    # Back-end DTI (all monthly debts)
    total_debts = piti + borrower_data.get("other_debts", 0)
    back_end_dti = (total_debts / monthly_income) * 100

    return {
        "front_end_dti": round(front_end_dti, 2),
        "back_end_dti": round(back_end_dti, 2),
        "status": get_dti_status(back_end_dti, borrower_data["loan_type"])
    }
```

### Loan-to-Value (LTV) Ratio Requirements

**Formula**: `LTV = (Loan Amount / Property Value) × 100`

**Purchase Loans**:

- **Conventional**: 3-20% down payment (80-97% LTV)
- **FHA**: 3.5% down payment minimum (96.5% LTV)
- **VA**: 0% down payment (100% LTV, no PMI)
- **USDA**: 0% down payment (100% LTV, rural properties)
- **Jumbo**: 10-20% down payment (80-90% LTV)

**Refinance Loans**:

- **Conventional**: Maximum 80% LTV (no PMI) or 97% LTV (with PMI)
- **FHA Streamline**: Maximum 97.75% LTV
- **Cash-Out Refinance**: Maximum 80% LTV (conventional), 80% LTV (FHA)

### Employment & Income Verification

**Acceptable Income Types**:

1. **W-2 Employment** (most common)
   - 2 years employment history required
   - Current paystubs (last 30 days)
   - W-2 forms (last 2 years)
   - Verification of Employment (VOE) from employer

2. **Self-Employed**
   - 2 years tax returns (personal + business)
   - Profit & Loss statement (YTD)
   - Business license
   - CPA letter

3. **Retirement Income**
   - Social Security award letter
   - Pension statements
   - IRA/401k distribution statements

4. **Other Income**
   - Rental income (Schedule E from tax returns)
   - Alimony/child support (divorce decree + 6 months proof)
   - Investment income (1099 forms)

### Automated Qualification Workflow

**Quote Engine Qualification Logic**:

```python
def qualify_borrower(lead_data):
    """Automated qualification with compliance checks."""

    # Step 1: Credit Score Check
    credit_tier = get_credit_tier(lead_data["credit_score"])
    if credit_tier == "bad" and lead_data["loan_type"] != "FHA":
        return {
            "qualified": False,
            "reason": "Credit score below minimum for loan type",
            "recommendation": "Consider FHA loan or credit repair"
        }

    # Step 2: DTI Calculation
    dti_result = calculate_dti(lead_data)
    if dti_result["back_end_dti"] > get_max_dti(lead_data["loan_type"]):
        return {
            "qualified": False,
            "reason": f"DTI {dti_result['back_end_dti']}% exceeds maximum",
            "recommendation": "Reduce debts or increase income"
        }

    # Step 3: LTV Validation
    ltv = (lead_data["loan_amount"] / lead_data["property_value"]) * 100
    if ltv > get_max_ltv(lead_data["loan_type"], lead_data["purpose"]):
        return {
            "qualified": False,
            "reason": f"LTV {ltv}% exceeds maximum for {lead_data['loan_type']}",
            "recommendation": "Increase down payment"
        }

    # Step 4: Income Verification
    if not verify_income_sufficient(lead_data):
        return {
            "qualified": False,
            "reason": "Income insufficient for requested loan amount",
            "recommendation": "Reduce loan amount or provide additional income sources"
        }

    # Qualified!
    return {
        "qualified": True,
        "confidence": calculate_confidence_score(lead_data),
        "recommended_products": get_product_recommendations(lead_data)
    }
```

---

## 💰 Quote Generation Workflow

### Interest Rate Determination

**Base Rate Sources**:

1. **Optimal Blue API** - Wholesale rate sheets (30+ lenders)
2. **Mortgage News Daily** - Daily rate trends
3. **Freddie Mac PMMS** - Weekly national averages
4. **Internal Rate Table** - Updated daily by rate analyst

**Rate Adjustment Factors**:

| Factor            | Impact           | Example                              |
| ----------------- | ---------------- | ------------------------------------ |
| **Credit Score**  | -0.5% to +3.0%   | 760+ FICO: -0.25%, 620 FICO: +1.5%   |
| **LTV Ratio**     | -0.25% to +1.0%  | 80% LTV: base rate, 95% LTV: +0.5%   |
| **Loan Purpose**  | 0% to +0.5%      | Purchase: base, Cash-out refi: +0.5% |
| **Property Type** | 0% to +1.5%      | Primary: base, Investment: +1.0%     |
| **Loan Amount**   | -0.125% to +0.5% | Conforming: base, Jumbo: +0.25%      |
| **State**         | 0% to +0.375%    | TX: base, NY: +0.25% (higher costs)  |
| **Lock Period**   | 0% to +0.5%      | 30-day: base, 60-day: +0.25%         |

**Automated Rate Calculation** (Quote Engine):

```python
def calculate_interest_rate(lead_data, base_rates):
    """Calculate personalized interest rate with all adjustments."""

    # Start with base rate for loan type and term
    base_rate = base_rates[lead_data["loan_type"]][lead_data["term"]]

    # Apply adjustments
    adjustments = []

    # Credit score adjustment
    credit_adj = get_credit_adjustment(lead_data["credit_score"])
    adjustments.append(("Credit Score", credit_adj))

    # LTV adjustment
    ltv = (lead_data["loan_amount"] / lead_data["property_value"]) * 100
    ltv_adj = get_ltv_adjustment(ltv)
    adjustments.append(("LTV", ltv_adj))

    # Purpose adjustment
    purpose_adj = get_purpose_adjustment(lead_data["purpose"])
    adjustments.append(("Loan Purpose", purpose_adj))

    # Property type adjustment
    property_adj = get_property_adjustment(lead_data["property_type"],
                                            lead_data["occupancy"])
    adjustments.append(("Property Type", property_adj))

    # State adjustment
    state_adj = get_state_adjustment(lead_data["state"])
    adjustments.append(("State", state_adj))

    # Calculate final rate
    total_adjustment = sum(adj[1] for adj in adjustments)
    final_rate = base_rate + total_adjustment

    # Apply rate lock discount if applicable
    if lead_data.get("rate_lock_days", 30) == 15:
        final_rate -= 0.125
        adjustments.append(("15-day lock discount", -0.125))

    return {
        "base_rate": base_rate,
        "adjustments": adjustments,
        "final_rate": round(final_rate, 3),
        "apr": calculate_apr(final_rate, lead_data),
        "monthly_payment": calculate_monthly_payment(final_rate, lead_data)
    }
```

### APR (Annual Percentage Rate) Calculation

**TILA Compliance Requirement**: APR must include ALL loan costs over the life of the loan.

**Components Included in APR**:

- Base interest rate
- Origination fees
- Discount points
- Mortgage insurance premiums (PMI/MIP)
- Lender fees (underwriting, processing, document prep)
- Title insurance (in some states)

**Excluded from APR**:

- Appraisal fee
- Credit report fee
- Property inspection fees
- Attorney fees (buyer's attorney)
- Transfer taxes

**APR Calculation Formula**:

```python
def calculate_apr(interest_rate, loan_amount, term_months, total_fees):
    """Calculate APR including all loan costs (TILA compliant)."""

    # Monthly interest rate
    monthly_rate = interest_rate / 100 / 12

    # Calculate monthly payment
    monthly_payment = loan_amount * (
        monthly_rate * (1 + monthly_rate) ** term_months
    ) / ((1 + monthly_rate) ** term_months - 1)

    # Net loan amount (after fees)
    net_loan_amount = loan_amount - total_fees

    # Solve for APR using Newton-Raphson method
    apr = interest_rate  # Initial guess
    for _ in range(20):  # Iterate to converge
        pv = sum(
            monthly_payment / ((1 + apr / 100 / 12) ** (i + 1))
            for i in range(term_months)
        )
        if abs(pv - net_loan_amount) < 0.01:
            break
        # Adjust APR
        derivative = sum(
            -monthly_payment * (i + 1) / ((1 + apr / 100 / 12) ** (i + 2)) / 12 / 100
            for i in range(term_months)
        )
        apr -= (pv - net_loan_amount) / derivative

    return round(apr, 3)
```

**TILA Accuracy Requirement**: APR must be accurate to within ±0.125% (1/8th of 1%)

### Closing Cost Estimation

**Required TILA/RESPA Disclosures**:

1. **Loan Estimate (LE)** - Must be provided within 3 business days of application
2. **Closing Disclosure (CD)** - Must be provided at least 3 business days before closing

**Standard Closing Costs Breakdown**:

**Section A: Origination Charges** (~1-2% of loan amount)

- Origination fee: 0-1% ($0-$5,000)
- Discount points (optional): 0-3% ($0-$15,000)
- Application fee: $300-$500
- Underwriting fee: $400-$900

**Section B: Services Borrower Did NOT Shop For** (~$1,500-$2,500)

- Appraisal fee: $450-$650
- Credit report: $25-$75
- Flood certification: $15-$25
- Tax service: $75-$125
- Title services: $500-$1,200

**Section C: Services Borrower CAN Shop For** (~$500-$1,500)

- Survey fee: $350-$600
- Pest inspection: $100-$300
- Attorney fees: Variable by state

**Section D: Total Loan Costs** (A + B + C)

**Section E: Taxes and Other Government Fees** (~$500-$2,000)

- Recording fees: $100-$500
- Transfer taxes: 0.1-2% of purchase price (state-specific)

**Section F: Prepaids** (~$3,000-$8,000)

- Homeowner's insurance premium: $800-$2,000/year
- Mortgage insurance premium: 0.5-1.5% of loan amount annually
- Prepaid interest: $10-$50 per day from closing to month-end
- Property taxes: 2-6 months escrow

**Section G: Initial Escrow Payment** (~$2,000-$5,000)

- Homeowner's insurance: 2 months
- Mortgage insurance: 2 months
- Property tax: 2-6 months

**Section H: Other** (if applicable)

- HOA fees: $100-$500/month (varies widely)
- HOA transfer fee: $200-$500

**Total Estimated Closing Costs**: $8,000-$25,000 (typically 2-5% of purchase price)

**Automated Closing Cost Calculation**:

```python
def estimate_closing_costs(lead_data):
    """Generate TILA-compliant closing cost estimate."""

    loan_amount = lead_data["loan_amount"]
    property_value = lead_data["property_value"]
    state = lead_data["state"]

    costs = {
        "section_a_origination": {
            "origination_fee": loan_amount * 0.01,  # 1%
            "discount_points": 0,  # Optional, user can add
            "application_fee": 400,
            "underwriting_fee": 750
        },
        "section_b_lender_required": {
            "appraisal_fee": 550,
            "credit_report": 50,
            "flood_cert": 20,
            "tax_service": 95,
            "title_insurance": loan_amount * 0.005  # 0.5%
        },
        "section_c_borrower_shopped": {
            "survey": 475,
            "pest_inspection": 150
        },
        "section_e_government": {
            "recording_fees": 250,
            "transfer_tax": get_state_transfer_tax(property_value, state)
        },
        "section_f_prepaids": {
            "homeowners_insurance": 1500 / 12,  # 1 month
            "mortgage_insurance": calculate_pmi(lead_data) if requires_pmi(lead_data) else 0,
            "prepaid_interest": calculate_prepaid_interest(lead_data),
            "property_tax": get_property_tax_estimate(property_value, state) / 12 * 6  # 6 months
        },
        "section_g_escrow": {
            "insurance_escrow": 1500 / 12 * 2,  # 2 months
            "tax_escrow": get_property_tax_estimate(property_value, state) / 12 * 2  # 2 months
        }
    }

    # Calculate totals
    total_a = sum(costs["section_a_origination"].values())
    total_b = sum(costs["section_b_lender_required"].values())
    total_c = sum(costs["section_c_borrower_shopped"].values())
    total_d = total_a + total_b + total_c  # Total Loan Costs
    total_e = sum(costs["section_e_government"].values())
    total_f = sum(costs["section_f_prepaids"].values())
    total_g = sum(costs["section_g_escrow"].values())

    total_closing_costs = total_d + total_e + total_f + total_g
    cash_to_close = (
        property_value - loan_amount +  # Down payment
        total_closing_costs +
        lead_data.get("earnest_money", 0)
    )

    return {
        "itemized_costs": costs,
        "totals": {
            "total_loan_costs": round(total_d, 2),
            "total_other_costs": round(total_e + total_f + total_g, 2),
            "total_closing_costs": round(total_closing_costs, 2),
            "cash_to_close": round(cash_to_close, 2)
        },
        "disclosure_type": "Loan Estimate (LE)",
        "good_faith_estimate": True,
        "generated_timestamp": datetime.utcnow().isoformat()
    }
```

---

## ⚖️ Compliance Requirements

### TILA (Truth in Lending Act) - Regulation Z

**Purpose**: Ensure borrowers receive clear disclosure of loan terms and costs.

**Key Requirements**:

1. **3-Business-Day Rule**: Loan Estimate must be provided within 3 business days of receiving loan application
2. **APR Accuracy**: APR must be within ±0.125% (1/8th of 1%) of actual APR
3. **Loan Estimate (LE)**: Standardized 3-page form showing estimated costs
4. **Closing Disclosure (CD)**: Final 5-page form showing actual costs (must be provided 3 days before closing)
5. **Right to Rescind**: 3-day right to cancel on refinances (not purchases)

**TILA Validation Checklist** (Compliance Sentinel Agent):

```python
def validate_tila_compliance(quote_data):
    """Validate TILA compliance for generated quote."""

    violations = []

    # Check APR accuracy
    calculated_apr = calculate_apr(quote_data["interest_rate"],
                                     quote_data["loan_amount"],
                                     quote_data["term_months"],
                                     quote_data["total_fees"])
    apr_diff = abs(calculated_apr - quote_data["apr"])
    if apr_diff > 0.125:
        violations.append({
            "regulation": "TILA 12 CFR § 1026.22",
            "violation": f"APR accuracy error: {apr_diff}% (max allowed: 0.125%)",
            "severity": "CRITICAL"
        })

    # Check required disclosures
    required_fields = [
        "apr", "finance_charge", "amount_financed", "total_of_payments",
        "payment_schedule", "late_payment", "prepayment_penalty"
    ]
    for field in required_fields:
        if field not in quote_data or quote_data[field] is None:
            violations.append({
                "regulation": "TILA 12 CFR § 1026.18",
                "violation": f"Missing required disclosure: {field}",
                "severity": "CRITICAL"
            })

    # Check 3-day disclosure timeline
    if quote_data.get("application_date"):
        days_since_app = (datetime.utcnow() - quote_data["application_date"]).days
        if days_since_app > 3 and not quote_data.get("loan_estimate_sent"):
            violations.append({
                "regulation": "TILA 12 CFR § 1026.19(e)",
                "violation": "Loan Estimate not sent within 3 business days",
                "severity": "CRITICAL"
            })

    return {
        "compliant": len(violations) == 0,
        "violations": violations,
        "validation_timestamp": datetime.utcnow().isoformat()
    }
```

### RESPA (Real Estate Settlement Procedures Act)

**Purpose**: Protect consumers from unnecessarily high settlement charges and abusive practices.

**Key Requirements**:

1. **Good Faith Estimate (GFE)**: Now replaced by Loan Estimate under TILA-RESPA Integrated Disclosure (TRID)
2. **HUD-1 Settlement Statement**: Now replaced by Closing Disclosure under TRID
3. **No Kickbacks**: Prohibits referral fees and kickbacks (Section 8)
4. **Affiliated Business Disclosure**: Must disclose any business relationships with service providers
5. **Servicing Transfer Notice**: 15-day notice required if loan servicing is transferred

**RESPA Validation Checklist**:

```python
def validate_respa_compliance(quote_data, referral_data=None):
    """Validate RESPA compliance for quote and referrals."""

    violations = []

    # Check for affiliated business arrangements
    if referral_data:
        for referral in referral_data:
            if referral.get("ownership_interest") and not referral.get("disclosure_sent"):
                violations.append({
                    "regulation": "RESPA 12 CFR § 1024.15",
                    "violation": f"Affiliated business disclosure not sent for {referral['business_name']}",
                    "severity": "HIGH"
                })

    # Check for prohibited kickbacks
    if quote_data.get("referral_fee") and quote_data["referral_fee"] > 0:
        violations.append({
            "regulation": "RESPA Section 8 (12 CFR § 1024.14)",
            "violation": "Prohibited referral fee detected",
            "severity": "CRITICAL",
            "details": "RESPA prohibits payment of fees for referral of settlement service business"
        })

    # Verify settlement service provider disclosures
    if quote_data.get("settlement_services"):
        for service in quote_data["settlement_services"]:
            if not service.get("provider_disclosed"):
                violations.append({
                    "regulation": "RESPA 12 CFR § 1024.7",
                    "violation": f"Settlement service provider not disclosed: {service['name']}",
                    "severity": "MEDIUM"
                })

    return {
        "compliant": len(violations) == 0,
        "violations": violations
    }
```

### ECOA (Equal Credit Opportunity Act) - Regulation B

**Purpose**: Prohibit discrimination in any aspect of credit transaction.

**Protected Classes**:

- Race, Color, National Origin
- Religion
- Sex (including sexual orientation and gender identity)
- Marital Status
- Age (if applicant is old enough to enter a contract)
- Income from public assistance programs
- Exercise of rights under Consumer Credit Protection Act

**Key Requirements**:

1. **No Discriminatory Questions**: Cannot ask about protected characteristics unless specifically required by law (e.g., government monitoring)
2. **Adverse Action Notice**: Must provide written notice within 30 days if application is denied, with specific reasons
3. **Equal Treatment**: All applicants must be evaluated using same criteria
4. **Spousal Income**: Cannot discount income because of protected class

**ECOA Validation**:

```python
def validate_ecoa_compliance(lead_data, quote_data):
    """Validate ECOA compliance - detect potential discrimination."""

    violations = []
    warnings = []

    # Check for prohibited questions
    prohibited_fields = [
        "race", "religion", "sex", "marital_status",
        "national_origin", "age_exact"
    ]
    for field in prohibited_fields:
        if field in lead_data and lead_data[field] and field not in ["age_exact"]:
            violations.append({
                "regulation": "ECOA 12 CFR § 1002.5",
                "violation": f"Prohibited information collected: {field}",
                "severity": "CRITICAL"
            })

    # Check for discriminatory rate adjustments
    # (This would require statistical analysis across all quotes)
    if quote_data.get("manual_rate_adjustment"):
        warnings.append({
            "regulation": "ECOA 12 CFR § 1002.6",
            "warning": "Manual rate adjustment detected - ensure non-discriminatory basis",
            "severity": "MEDIUM",
            "action_required": "Document business justification for manual adjustment"
        })

    # Verify adverse action notice if denied
    if quote_data.get("status") == "denied" and not quote_data.get("adverse_action_notice_sent"):
        violations.append({
            "regulation": "ECOA 12 CFR § 1002.9",
            "violation": "Adverse action notice not sent within 30 days of denial",
            "severity": "CRITICAL"
        })

    return {
        "compliant": len(violations) == 0,
        "violations": violations,
        "warnings": warnings
    }
```

### TCPA (Telephone Consumer Protection Act)

**Purpose**: Protect consumers from unwanted telemarketing calls, texts, and faxes.

**Key Requirements**:

1. **Prior Express Written Consent**: Required for autodialed/prerecorded marketing calls/texts
2. **Opt-Out Mechanism**: Must provide easy way to opt out of future communications
3. **Call Time Restrictions**: No calls before 8 AM or after 9 PM (recipient's time zone)
4. **Do Not Call (DNC) Registry**: Must scrub against National DNC list every 31 days

**TCPA Compliance Workflow**:

```python
def validate_tcpa_consent(lead_data, campaign_data):
    """Validate TCPA compliance before sending communications."""

    violations = []

    # Check for prior express written consent
    if not lead_data.get("tcpa_consent"):
        violations.append({
            "regulation": "TCPA 47 CFR § 64.1200",
            "violation": "No prior express written consent for marketing communications",
            "severity": "CRITICAL",
            "action_required": "Obtain written consent before contacting"
        })

    # Verify consent timestamp and IP
    if lead_data.get("tcpa_consent"):
        consent = lead_data["tcpa_consent"]
        if not consent.get("timestamp") or not consent.get("ip_address"):
            violations.append({
                "regulation": "TCPA Compliance Best Practice",
                "violation": "Consent timestamp or IP address missing",
                "severity": "HIGH",
                "action_required": "Record consent details for audit trail"
            })

    # Check call time restrictions
    if campaign_data.get("action_type") == "phone_call":
        recipient_timezone = get_timezone(lead_data["state"])
        local_time = datetime.now(recipient_timezone).hour
        if local_time < 8 or local_time >= 21:
            violations.append({
                "regulation": "TCPA 47 CFR § 64.1200",
                "violation": f"Attempted call at {local_time}:00 (outside 8 AM - 9 PM)",
                "severity": "CRITICAL",
                "action_required": "Reschedule call to permitted hours"
            })

    # Check DNC registry (requires integration with DNC scrubbing service)
    if not lead_data.get("dnc_scrubbed_date") or \
       (datetime.utcnow() - lead_data["dnc_scrubbed_date"]).days > 31:
        violations.append({
            "regulation": "TCPA 47 CFR § 64.1200",
            "violation": "DNC registry not checked within 31 days",
            "severity": "HIGH",
            "action_required": "Scrub phone number against National DNC list"
        })

    return {
        "compliant": len(violations) == 0,
        "can_contact": len(violations) == 0,
        "violations": violations
    }
```

**TCPA Consent Language Example** (for RateHunter.net form):

```html
<label>
  <input type="checkbox" name="tcpa_consent" required />
  I agree to receive marketing calls, texts, and emails from RateHunter.net and
  affiliated mortgage brokers using autodialed, prerecorded, or artificial voice
  messages at the phone number and email provided. I understand consent is not
  required to purchase goods or services and I may opt out at any time by
  replying STOP to texts or clicking unsubscribe in emails.
</label>
```

---

## 📧 Campaign Automation

### n8n Workflow Architecture

**Campaign Types**:

1. **Immediate Response** (triggered on lead receipt)
2. **Nurture Drip** (multi-touch over 30-90 days)
3. **Re-engagement** (inactive leads)
4. **Milestone Follow-Up** (application submitted, docs uploaded, approval, closing)

### Immediate Response Campaign (< 5 minutes)

**Trigger**: New lead received from any source
**Goal**: Establish contact before competitors
**Channels**: Email + SMS + (optional) Phone

**n8n Workflow Steps**:

```yaml
workflow_name: "Immediate Response - New Lead"
trigger: "Webhook - New Lead Created in TwentyCRM"
steps:
  - name: "Validate TCPA Consent"
    type: "Function"
    code: |
      if (!$input.item.tcpa_consent) {
        throw new Error("TCPA consent missing - cannot send marketing messages");
      }
      return $input;

  - name: "Generate Personalized Quote"
    type: "HTTP Request"
    url: "http://10.0.0.1:8001/api/quotes/generate"
    method: "POST"
    body: "{{ $json }}"

  - name: "Send Email with Quote"
    type: "SendGrid"
    template: "new_lead_welcome_with_quote"
    to: "{{ $json.borrower.email }}"
    variables:
      first_name: "{{ $json.borrower.first_name }}"
      interest_rate: "{{ $json.quote.interest_rate }}"
      monthly_payment: "{{ $json.quote.monthly_payment }}"
      quote_link: "https://ratehunter.net/quote/{{ $json.quote_id }}"

  - name: "Send SMS with Link"
    type: "Twilio SMS"
    to: "{{ $json.borrower.phone }}"
    message: |
      Hi {{ $json.borrower.first_name }}! Your personalized mortgage quote is ready:
      {{ $json.quote.interest_rate }}% rate, ${{ $json.quote.monthly_payment }}/mo.
      View details: {{ $json.quote_link }}

  - name: "Schedule Follow-Up Call"
    type: "TwentyCRM - Create Task"
    task_type: "phone_call"
    assigned_to: "{{ $json.loan_officer_id }}"
    due_date: "{{ $now.plus(2, 'hours') }}"
    priority: "high"

  - name: "Log Campaign Action"
    type: "AgentDB - Store Memory"
    namespace: "campaigns"
    key: "immediate_response_{{ $json.lead_id }}"
    data: "{{ $json }}"
```

**Performance Target**: < 5 minutes from lead receipt to first contact

### 30-Day Nurture Drip Campaign

**Trigger**: Lead qualified but not ready to proceed
**Goal**: Build trust and stay top-of-mind
**Touchpoints**: 8 interactions over 30 days

**Campaign Schedule**:

| Day | Channel       | Content                                      | Goal                 |
| --- | ------------- | -------------------------------------------- | -------------------- |
| 0   | Email + SMS   | Welcome + Quote                              | Immediate engagement |
| 2   | Email         | Educational - "5 Tips for First-Time Buyers" | Provide value        |
| 5   | SMS           | Check-in - "Any questions about your quote?" | Re-engage            |
| 7   | Email         | Case Study - "How [Name] Saved $50k"         | Social proof         |
| 10  | Phone Call    | Personal touch from loan officer             | Build relationship   |
| 14  | Email         | Market Update - "Rates Trending Lower"       | Create urgency       |
| 21  | SMS           | Limited Time - "Lock Your Rate Today"        | Action prompt        |
| 30  | Email + Phone | Final Follow-Up - "Still Searching?"         | Last attempt         |

**n8n Workflow Configuration**:

```yaml
workflow_name: "30-Day Nurture Drip"
trigger: "Lead Status = 'nurture'"
schedule: "Event-based (days since lead creation)"
steps:
  - name: "Day 0 - Welcome Email"
    wait: 0
    action: "send_email"
    template: "nurture_day_0_welcome"

  - name: "Day 2 - Educational Content"
    wait: "2 days"
    action: "send_email"
    template: "nurture_day_2_education"

  - name: "Day 5 - SMS Check-In"
    wait: "3 days"
    condition: "tcpa_consent = true"
    action: "send_sms"
    message: "Hi {{ first_name }}, checking in on your home search. Any questions about rates or the process? - {{ loan_officer_name }}"

  - name: "Day 7 - Case Study"
    wait: "2 days"
    action: "send_email"
    template: "nurture_day_7_case_study"

  - name: "Day 10 - Schedule Call"
    wait: "3 days"
    action: "create_task"
    task_type: "phone_call"
    priority: "medium"

  - name: "Day 14 - Market Update"
    wait: "4 days"
    action: "send_email"
    template: "nurture_day_14_market_update"

  - name: "Day 21 - Urgency SMS"
    wait: "7 days"
    condition: "tcpa_consent = true AND engagement_score > 3"
    action: "send_sms"
    message: "{{ first_name }}, rates are at historic lows! Lock in your {{ rate }}% quote before it expires: {{ link }}"

  - name: "Day 30 - Final Follow-Up"
    wait: "9 days"
    action: "send_email_and_create_call_task"
    template: "nurture_day_30_final"
```

### Re-Engagement Campaign (Cold Leads)

**Trigger**: No activity in 60+ days
**Goal**: Revive dead leads with new offers
**Channels**: Email + SMS + Direct Mail (optional)

**Campaign Flow**:

1. **Day 60**: "We Miss You" email with updated quote
2. **Day 67**: SMS with special incentive ("$500 closing cost credit")
3. **Day 75**: Email with market update and rate comparison
4. **Day 90**: Final email + move to "lost" status

### Milestone Follow-Up Campaigns

**Application Submitted**:

- Immediate: Confirmation email with next steps
- Day 1: Document checklist email
- Day 3: SMS check-in on document upload progress
- Day 7: Phone call if documents incomplete

**Under Review**:

- Day 0: "Your Application is Under Review" email
- Day 3: Progress update
- Day 7: "We May Need Additional Documents" (if applicable)
- Day 14: Phone call with loan officer

**Approved**:

- Immediate: "Congratulations!" email + SMS
- Day 0: Next steps email (rate lock, appraisal scheduling)
- Day 3: Closing timeline overview
- Weekly: Progress updates until closing

**Closed**:

- Day 0: "Thank You!" email with referral request
- Day 30: "How's Your New Home?" check-in
- Day 90: Request for online review
- Annual: Refinance opportunity check-in

---

## 🔄 Rate Shopping & Comparison

### Daily Rate Update Process

**Rate Sources**:

1. **Optimal Blue API** (primary) - Real-time wholesale rates
2. **Mortgage News Daily** - Industry benchmarks
3. **Freddie Mac PMMS** - Weekly published rates
4. **Manual Override** - Rate analyst adjustments

**Update Schedule**:

- **Wholesale Rates**: Poll Optimal Blue API every 30 minutes during market hours (9 AM - 5 PM ET)
- **Published Rates**: Update RateHunter.net homepage daily at 9 AM ET
- **Email Campaigns**: Trigger "Rate Drop Alert" if rates decrease ≥ 0.125%

**Rate Table Structure** (AgentDB storage):

```json
{
  "timestamp": "2024-01-13T14:30:00Z",
  "source": "optimal_blue",
  "loan_type": "conventional_conforming",
  "base_rates": {
    "15_year_fixed": 5.875,
    "20_year_fixed": 6.125,
    "30_year_fixed": 6.5,
    "5_1_arm": 6.0,
    "7_1_arm": 6.125,
    "10_1_arm": 6.25
  },
  "discount_points": {
    "no_points": 6.5,
    "0.5_points": 6.375,
    "1.0_points": 6.25,
    "1.5_points": 6.125,
    "2.0_points": 6.0
  },
  "adjustment_matrix": {
    "credit_score": {
      "760_plus": -0.25,
      "740_759": -0.125,
      "720_739": 0.0,
      "700_719": 0.125,
      "680_699": 0.375,
      "660_679": 0.75,
      "640_659": 1.25,
      "620_639": 1.875,
      "below_620": 2.5
    },
    "ltv_ratio": {
      "75_or_less": -0.125,
      "80": 0.0,
      "85": 0.25,
      "90": 0.5,
      "95": 0.875,
      "97": 1.125
    }
  }
}
```

### Multi-Lender Comparison

**Lender Network** (30+ wholesale lenders in Optimal Blue):

- Major Banks: Wells Fargo, Chase, Bank of America
- Non-Bank Lenders: Rocket Mortgage, LoanDepot, Better.com
- Credit Unions: Navy Federal, Pentagon Federal, Alliant
- Wholesale Aggregators: United Wholesale Mortgage (UWM), CMG Mortgage

**Rate Shopping Algorithm**:

```python
def find_best_rates(lead_data, num_results=5):
    """Find top 5 best rates across all lenders."""

    # Get all lender rate sheets
    rate_sheets = optimal_blue_api.get_rate_sheets(
        loan_type=lead_data["loan_type"],
        loan_amount=lead_data["loan_amount"],
        property_value=lead_data["property_value"],
        credit_score=lead_data["credit_score"]
    )

    results = []
    for lender in rate_sheets:
        # Calculate rate with adjustments
        base_rate = lender["rates"][lead_data["term"]]
        adjusted_rate = apply_adjustments(base_rate, lead_data, lender["adjustments"])

        # Calculate APR and monthly payment
        apr = calculate_apr(adjusted_rate, lead_data["loan_amount"],
                             lead_data["term_months"], lender["total_fees"])
        monthly_payment = calculate_monthly_payment(adjusted_rate,
                                                      lead_data["loan_amount"],
                                                      lead_data["term_months"])

        results.append({
            "lender_name": lender["name"],
            "interest_rate": adjusted_rate,
            "apr": apr,
            "monthly_payment": monthly_payment,
            "total_fees": lender["total_fees"],
            "closing_costs": lender["estimated_closing_costs"],
            "lender_rating": lender["rating"],
            "customer_reviews": lender["review_count"]
        })

    # Sort by APR (best deal overall)
    results.sort(key=lambda x: x["apr"])

    return results[:num_results]
```

### Rate Lock Strategy

**Lock Periods**:

- **15-day lock**: Best rate (discount of -0.125%)
- **30-day lock**: Standard rate (base rate)
- **45-day lock**: Premium of +0.125%
- **60-day lock**: Premium of +0.250%

**Float vs Lock Decision Matrix**:

| Market Condition | Credit Score | LTV  | Recommendation                     |
| ---------------- | ------------ | ---- | ---------------------------------- |
| Rates Rising     | Any          | Any  | **Lock immediately**               |
| Rates Stable     | 760+         | ≤80% | Float 7-14 days, monitor           |
| Rates Stable     | <760         | >80% | Lock within 48 hours               |
| Rates Falling    | 760+         | ≤80% | Float until 15 days before closing |
| Rates Falling    | <760         | >80% | Float 7 days, then lock            |

**Rate Lock Automation** (Campaign Engine):

```python
def recommend_rate_lock(lead_data, market_trends):
    """AI-powered rate lock recommendation."""

    # Get market trend (rising, falling, stable)
    trend = analyze_market_trends(market_trends)

    # Calculate risk factors
    risk_score = calculate_risk_score(lead_data)

    if trend == "rising":
        return {
            "recommendation": "Lock Now",
            "urgency": "HIGH",
            "reason": "Rates are rising. Lock today to secure your current rate.",
            "action": "schedule_immediate_call"
        }
    elif trend == "falling" and risk_score < 50:
        return {
            "recommendation": "Float 7-14 Days",
            "urgency": "MEDIUM",
            "reason": "Rates may drop further. Monitor daily and we'll alert you.",
            "action": "enable_rate_watch_alerts"
        }
    else:  # stable or high risk
        return {
            "recommendation": "Lock Within 48 Hours",
            "urgency": "MEDIUM",
            "reason": "Market is stable. Lock soon to avoid unexpected rate increases.",
            "action": "schedule_lock_consultation"
        }
```

---

## 🔌 Technology Integration Points

### Service Integration Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         PC1 - Orchestrator                      │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Nexus Router  │→ │ Quote Engine │→ │ Campaign Engine    │  │
│  │ (Port 6000)   │  │ (Port 8001)  │  │ (Port 8002)        │  │
│  └───────────────┘  └──────────────┘  └────────────────────┘  │
│         ↓                   ↓                     ↓             │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Claude Flow   │  │ Letta Memory │  │ Mem0 Universal     │  │
│  │ (Port 3010)   │  │ (Port 8283)  │  │ (Port 4321)        │  │
│  └───────────────┘  └──────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                        PC2 - Worker 2 (RTX 3060)                │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ TwentyCRM     │  │ n8n Workflow │  │ Dify Chat UI       │  │
│  │ (Port 3000)   │  │ (Port 5678)  │  │ (Port 3001)        │  │
│  └───────────────┘  └──────────────┘  └────────────────────┘  │
│         ↓                   ↓                     ↓             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │          PostgreSQL (TwentyCRM + n8n + Dify)              │ │
│  │                     (Port 5432)                            │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### API Integration Examples

#### 1. FreeRateUpdate.com Webhook Handler

**Endpoint**: `POST https://nyra.projectnyra.com/api/webhooks/freerateupdate`

**Integration Code** (Nyra Orchestrator):

```python
from fastapi import APIRouter, HTTPException, Request
import hmac
import hashlib

router = APIRouter()

@router.post("/webhooks/freerateupdate")
async def handle_freerateupdate_webhook(request: Request):
    """Handle incoming lead from FreeRateUpdate.com."""

    # Step 1: Verify webhook signature
    signature = request.headers.get("X-FRU-Signature")
    body = await request.body()
    expected_sig = hmac.new(
        settings.FRU_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected_sig):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Step 2: Parse lead data
    lead_data = await request.json()

    # Step 3: Validate TCPA consent
    if not lead_data.get("consent", {}).get("tcpa_agreed"):
        logger.warning(f"Lead {lead_data['lead_id']} missing TCPA consent")
        return {"status": "rejected", "reason": "No TCPA consent"}

    # Step 4: Create lead in TwentyCRM
    crm_lead = await twentycrm_api.create_lead({
        "source": "freerateupdate",
        "external_id": lead_data["lead_id"],
        "contact": lead_data["borrower"],
        "loan_details": lead_data["loan_details"],
        "status": "new",
        "priority": "high",  # Shared leads = high priority
        "assigned_to": get_next_available_loan_officer()
    })

    # Step 5: Generate quote immediately
    quote = await quote_engine_api.generate_quote(lead_data["loan_details"])

    # Step 6: Trigger immediate response campaign
    await campaign_engine_api.trigger_campaign(
        campaign_id="immediate_response",
        lead_id=crm_lead["id"],
        variables={
            "quote": quote,
            "response_time_minutes": 2  # We're fast!
        }
    )

    # Step 7: Store in memory for context
    await mem0_api.store_memory({
        "namespace": "leads",
        "key": f"lead_{crm_lead['id']}",
        "data": {
            "source": "freerateupdate",
            "received_at": datetime.utcnow().isoformat(),
            "initial_quote": quote,
            "campaign_triggered": "immediate_response"
        }
    })

    return {
        "status": "accepted",
        "lead_id": crm_lead["id"],
        "quote_generated": True,
        "campaign_triggered": True
    }
```

#### 2. Optimal Blue Rate Sheet API

**Integration Code** (Quote Engine):

```python
import httpx
from typing import Dict, List

class OptimalBlueClient:
    """Client for Optimal Blue wholesale rate sheets."""

    def __init__(self, api_key: str, lender_id: str):
        self.api_key = api_key
        self.lender_id = lender_id
        self.base_url = "https://api.optimalblue.com/v1"

    async def get_rate_sheets(self, loan_params: Dict) -> List[Dict]:
        """Fetch rate sheets for given loan parameters."""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/rate-sheets",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "lender_id": self.lender_id,
                    "loan_purpose": loan_params["purpose"],
                    "loan_type": loan_params["loan_type"],
                    "loan_amount": loan_params["loan_amount"],
                    "property_value": loan_params["property_value"],
                    "credit_score": loan_params["credit_score"],
                    "property_state": loan_params["state"],
                    "occupancy": loan_params.get("occupancy", "primary"),
                    "doc_type": "full_doc"
                }
            )
            response.raise_for_status()
            return response.json()["rate_sheets"]

    async def lock_rate(self, rate_quote_id: str, lock_days: int) -> Dict:
        """Lock rate for specified days."""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/rate-locks",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "rate_quote_id": rate_quote_id,
                    "lock_days": lock_days,
                    "lender_id": self.lender_id
                }
            )
            response.raise_for_status()
            return response.json()
```

#### 3. Twilio SMS/Voice Integration

**Integration Code** (Campaign Engine):

```python
from twilio.rest import Client

class TwilioCampaignService:
    """Handle SMS and voice campaigns via Twilio."""

    def __init__(self, account_sid: str, auth_token: str, from_number: str):
        self.client = Client(account_sid, auth_token)
        self.from_number = from_number

    async def send_sms(self, to: str, message: str, lead_id: str) -> Dict:
        """Send SMS with TCPA compliance logging."""

        # Validate TCPA consent before sending
        tcpa_valid = await validate_tcpa_consent(lead_id)
        if not tcpa_valid:
            raise ValueError(f"Cannot send SMS - No TCPA consent for lead {lead_id}")

        # Send SMS
        message_obj = self.client.messages.create(
            to=to,
            from_=self.from_number,
            body=message
        )

        # Log campaign action
        await log_campaign_action({
            "lead_id": lead_id,
            "action_type": "sms",
            "channel": "twilio",
            "message_sid": message_obj.sid,
            "status": message_obj.status,
            "timestamp": datetime.utcnow().isoformat()
        })

        return {
            "message_sid": message_obj.sid,
            "status": message_obj.status
        }

    async def make_call(self, to: str, script_url: str, lead_id: str) -> Dict:
        """Initiate automated call with TwiML script."""

        # Validate TCPA consent
        tcpa_valid = await validate_tcpa_consent(lead_id)
        if not tcpa_valid:
            raise ValueError(f"Cannot call - No TCPA consent for lead {lead_id}")

        # Check call time restrictions (8 AM - 9 PM local time)
        local_hour = get_local_hour(to)
        if local_hour < 8 or local_hour >= 21:
            raise ValueError(f"Cannot call at {local_hour}:00 - outside permitted hours")

        # Make call
        call = self.client.calls.create(
            to=to,
            from_=self.from_number,
            url=script_url,
            status_callback=f"https://nyra.projectnyra.com/api/twilio/status",
            status_callback_event=["completed"]
        )

        # Log campaign action
        await log_campaign_action({
            "lead_id": lead_id,
            "action_type": "phone_call",
            "channel": "twilio",
            "call_sid": call.sid,
            "status": call.status,
            "timestamp": datetime.utcnow().isoformat()
        })

        return {
            "call_sid": call.sid,
            "status": call.status
        }
```

---

## 📊 Business Metrics & KPIs

### Lead Funnel Metrics

**Conversion Funnel**:

```
100 Leads Received
  → 85 Qualified (85% qualification rate)
    → 60 Quotes Sent (70% quote request rate)
      → 25 Applications Started (42% application rate)
        → 15 Applications Completed (60% completion rate)
          → 12 Approved (80% approval rate)
            → 10 Closed (83% closing rate)
              = 10% overall conversion rate
```

**Key Performance Indicators**:

| Metric                 | Target  | Calculation                             | Importance                     |
| ---------------------- | ------- | --------------------------------------- | ------------------------------ |
| **Lead Response Time** | < 5 min | Time from lead receipt to first contact | Critical for shared leads      |
| **Qualification Rate** | 80%+    | Qualified leads / Total leads           | Indicates lead quality         |
| **Quote-to-App Rate**  | 40%+    | Applications / Quotes sent              | Measures quote attractiveness  |
| **Approval Rate**      | 75%+    | Approvals / Applications                | Indicates underwriting quality |
| **Pull-Through Rate**  | 80%+    | Closings / Approvals                    | Measures execution             |
| **Overall Conversion** | 8-12%   | Closings / Total leads                  | Ultimate success metric        |

### Revenue Metrics

**Average Revenue Per Loan**:

- **Purchase Loans**: $3,500 - $5,000 commission (1% of loan amount)
- **Refinance Loans**: $2,500 - $4,000 commission (0.75-1% of loan amount)
- **Target Monthly Volume**: 10-15 closed loans
- **Target Monthly Revenue**: $35,000 - $75,000

**Cost Per Acquisition (CPA)**:

```
CPA = (Marketing Spend + Operating Costs) / Closed Loans

Example:
- Lead Costs: $2,500 (100 leads × $25 avg)
- Marketing: $1,500 (website, ads, tools)
- Operating: $4,000 (salaries, software, office)
- Total: $8,000

Closed Loans: 10
CPA = $8,000 / 10 = $800 per loan

Commission: $4,000 per loan
Profit Margin: $3,200 per loan (80%)
ROI: 400%
```

### Campaign Performance Metrics

**Email Metrics**:

- **Open Rate Target**: 25-35% (industry avg: 20%)
- **Click-Through Rate**: 3-5% (industry avg: 2%)
- **Unsubscribe Rate**: < 0.5%

**SMS Metrics**:

- **Delivery Rate**: 98%+
- **Response Rate**: 10-15%
- **Opt-Out Rate**: < 2%

**Call Metrics**:

- **Connection Rate**: 60-70%
- **Conversation Rate**: 40-50% (of connections)
- **Callback Request Rate**: 15-20%

### System Performance Metrics

**Response Times** (99th percentile):

- Quote Generation: < 2 seconds
- API Latency: < 500ms
- Page Load Time: < 2 seconds
- Campaign Trigger Delay: < 30 seconds

**Reliability Metrics**:

- Service Uptime: 99.9% (< 9 hours downtime/year)
- Error Rate: < 1% of requests
- Data Loss: 0 (backups + redundancy)

**Cost Efficiency**:

- LLM Token Cost: < $0.50 per quote
- Infrastructure Cost: < $500/month (4-PC cluster)
- Total Cost Per Lead: < $30 (including acquisition + processing)

---

## 🔐 Data Security & Privacy

### PII Protection

**Sensitive Data Fields**:

- Social Security Number (SSN)
- Date of Birth
- Bank account numbers
- Credit card numbers
- Income details
- Asset statements

**Security Measures**:

1. **Encryption at Rest**: AES-256-GCM for all database fields
2. **Encryption in Transit**: TLS 1.3 for all API communications
3. **Access Control**: Role-based access with audit logging
4. **Data Minimization**: Only collect what's necessary
5. **Retention Policy**: Purge PII after 7 years (regulatory requirement)

### Compliance Audit Trail

**Every Action Logged**:

```json
{
  "timestamp": "2024-01-13T14:30:00Z",
  "action_type": "quote_generated",
  "user_id": "loan_officer_123",
  "lead_id": "lead_456",
  "data_hash": "sha256:a1b2c3d4...",
  "compliance_checks": {
    "tila_validated": true,
    "respa_validated": true,
    "ecoa_validated": true,
    "tcpa_validated": true
  },
  "ip_address": "10.0.0.2",
  "user_agent": "Mozilla/5.0..."
}
```

**Audit Retention**: 7 years (CFPB requirement for mortgage records)

---

**Document Version**: 1.0
**Last Updated**: 2026-01-13
**Maintained By**: Project Nyra Team
**Related Docs**:

- [Complete Loan Lifecycle](./LOAN-LIFECYCLE.md)
- [Compliance Requirements](./COMPLIANCE-REQUIREMENTS.md)
- [Technology Stack](./TECHNOLOGY-STACK.md)
