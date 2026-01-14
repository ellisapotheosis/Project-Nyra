# Complete Loan Lifecycle Documentation

**Project Nyra - End-to-End Mortgage Process**

This document provides a comprehensive view of the complete mortgage loan lifecycle from initial lead intake through post-closing, including all touchpoints, decision gates, and system integrations.

---

## 📋 Table of Contents

1. [Lifecycle Overview](#lifecycle-overview)
2. [Phase 1: Lead Intake & Qualification](#phase-1-lead-intake--qualification)
3. [Phase 2: Pre-Qualification](#phase-2-pre-qualification)
4. [Phase 3: Loan Application](#phase-3-loan-application)
5. [Phase 4: Processing](#phase-4-processing)
6. [Phase 5: Underwriting](#phase-5-underwriting)
7. [Phase 6: Clear to Close](#phase-6-clear-to-close)
8. [Phase 7: Closing](#phase-7-closing)
9. [Phase 8: Post-Closing](#phase-8-post-closing)
10. [Typical Timelines](#typical-timelines)
11. [Common Roadblocks](#common-roadblocks)

---

## 🔄 Lifecycle Overview

### High-Level Process Flow

```
Lead Intake → Pre-Qualification → Application → Processing → Underwriting →
Clear to Close → Closing → Post-Closing → Servicing Transfer
```

### Phase Duration Breakdown

| Phase | Duration | Bottlenecks | Automation Opportunity |
|-------|----------|-------------|------------------------|
| **Lead Intake** | 0-1 day | Manual qualification | ✅ Fully automated with Quote Engine |
| **Pre-Qualification** | 1-3 days | Credit report delay | ✅ Automated credit pull + scoring |
| **Application** | 3-7 days | Document collection | ⚠️ Partially automated (chase docs) |
| **Processing** | 7-14 days | Verification delays | ⚠️ Automated verification requests |
| **Underwriting** | 14-21 days | Manual review | ❌ Manual (requires human judgment) |
| **Clear to Close** | 21-25 days | Final conditions | ⚠️ Automated condition tracking |
| **Closing** | 25-30 days | Scheduling conflicts | ✅ Automated scheduling + reminders |
| **Post-Closing** | 30+ days | File delivery | ✅ Fully automated delivery |

**Total Timeline**: 30-45 days from application to closing (industry average)

---

## Phase 1: Lead Intake & Qualification

### Step 1.1: Lead Capture

**Sources**:
- FreeRateUpdate.com webhook (shared leads)
- LendingTree.com API (exclusive leads)
- RateHunter.net direct submissions (owned traffic)
- Referral partner integrations
- Organic search / paid ads

**Data Captured**:
```json
{
  "contact": {
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
  "loan_intent": {
    "purpose": "purchase",
    "property_type": "single_family",
    "property_value": 450000,
    "down_payment": 90000,
    "timeline": "60_days"
  },
  "financial_snapshot": {
    "credit_score_range": "740-760",
    "annual_income": 120000,
    "employment_status": "employed",
    "debt_obligations": 2500
  },
  "consent": {
    "tcpa_agreed": true,
    "timestamp": "2024-01-13T14:29:45Z",
    "ip_address": "192.168.1.100"
  }
}
```

### Step 1.2: Instant Qualification Check

**Automated Validation** (Quote Engine - Completed in < 2 seconds):

1. **Credit Score Tier**:
   - Excellent (760+): Fast-track approval likely
   - Good (700-759): Standard processing
   - Fair (640-699): Additional scrutiny required
   - Poor (<640): FHA/VA programs only, may require manual review

2. **Debt-to-Income (DTI) Estimate**:
   ```python
   monthly_income = annual_income / 12
   estimated_housing_payment = (loan_amount * 0.006) + (property_value * 0.01 / 12)  # PITI estimate
   estimated_dti = (estimated_housing_payment + monthly_debts) / monthly_income * 100

   if estimated_dti > 50:
       qualification_status = "HIGH_RISK"
   elif estimated_dti > 43:
       qualification_status = "REVIEW_REQUIRED"
   else:
       qualification_status = "QUALIFIED"
   ```

3. **Loan-to-Value (LTV) Check**:
   ```python
   ltv = (property_value - down_payment) / property_value * 100

   if ltv > 97:
       pmi_required = True
       loan_types_available = ["FHA", "VA", "USDA"]
   elif ltv > 80:
       pmi_required = True
       loan_types_available = ["Conventional", "FHA", "VA"]
   else:
       pmi_required = False
       loan_types_available = ["Conventional", "Jumbo", "FHA", "VA"]
   ```

**Decision Gate 1: Proceed or Reject**

✅ **Proceed** if:
- Credit score ≥ 620 for conventional, ≥ 580 for FHA
- DTI ≤ 50%
- LTV within program limits

❌ **Reject** if:
- Credit score < 580
- DTI > 56.99%
- Insufficient income documentation
- Property type ineligible (e.g., co-op for FHA)

**Actions on Qualification**:
- ✅ **Qualified**: Send instant quote via email + SMS
- ⚠️ **Review Required**: Assign to loan officer for manual review
- ❌ **Rejected**: Send educational resources + credit repair referral

### Step 1.3: Initial Contact & Quote Delivery

**Immediate Response Campaign** (< 5 minutes):

**Email Template**:
```
Subject: Your Personalized Mortgage Quote is Ready, John!

Hi John,

Great news! Based on your information, here's your personalized mortgage quote:

🏠 Purchase Price: $450,000
💰 Down Payment: $90,000 (20%)
📊 Loan Amount: $360,000

Your Estimated Rate: 6.500% APR
Monthly Payment: $2,275/month (Principal + Interest)

Estimated Closing Costs: $12,500
Cash to Close: $102,500

[View Full Quote & Breakdown] → Link to detailed quote page

Ready to take the next step? Reply to this email or call me directly:
📞 (512) 555-LOAN

Best regards,
Sarah Johnson
Senior Loan Officer
RateHunter Mortgage

---
This is an estimate. Actual rates and terms may vary. Not a commitment to lend.
```

**SMS Message**:
```
Hi John! Your mortgage quote is ready: 6.5% rate, $2,275/mo.
View details: https://ratehunter.net/quote/abc123

Reply YES to schedule a call or STOP to opt out.
```

**Follow-Up Sequence**:
- **Day 0**: Email + SMS with quote
- **Day 1**: Loan officer call attempt #1
- **Day 2**: Follow-up email with educational content
- **Day 3**: Loan officer call attempt #2
- **Day 5**: SMS check-in
- **Day 7**: Final follow-up before moving to nurture campaign

---

## Phase 2: Pre-Qualification

### Step 2.1: Detailed Financial Review

**Documents Requested**:
- Recent pay stubs (last 2 months)
- W-2 forms (last 2 years)
- Bank statements (last 2 months, all accounts)
- Credit report authorization

**TwentyCRM Workflow**:
```python
# Create document request task
task = twentycrm_api.create_task({
    "type": "document_collection",
    "lead_id": lead_id,
    "assigned_to": loan_officer_id,
    "due_date": datetime.now() + timedelta(days=3),
    "documents_required": [
        "paystubs_recent_2",
        "w2_last_2_years",
        "bank_statements_2_months",
        "credit_authorization"
    ],
    "priority": "high"
})

# Send document request email with secure upload link
email = campaign_engine_api.send_email({
    "template": "document_request_prequal",
    "to": lead.email,
    "variables": {
        "first_name": lead.first_name,
        "upload_link": f"https://ratehunter.net/upload/{secure_token}",
        "documents_list": format_doc_list(documents_required)
    }
})
```

### Step 2.2: Credit Report Pull

**Credit Bureau Integration** (via Optimal Blue or direct):

```python
async def pull_credit_report(borrower_ssn: str, borrower_dob: str, address: Dict):
    """Pull tri-merge credit report from all 3 bureaus."""

    # Request credit report
    credit_response = await credit_bureau_api.request_report({
        "ssn": encrypt_ssn(borrower_ssn),
        "date_of_birth": borrower_dob,
        "address": address,
        "purpose": "mortgage_pre_qualification"
    })

    # Parse credit scores (FICO)
    credit_scores = {
        "experian": credit_response["experian"]["fico_score"],
        "equifax": credit_response["equifax"]["fico_score"],
        "transunion": credit_response["transunion"]["fico_score"]
    }

    # Use middle score for mortgage qualification
    middle_score = sorted(credit_scores.values())[1]

    # Extract tradelines
    tradelines = parse_tradelines(credit_response)

    # Calculate total monthly debts
    monthly_debts = sum([
        tradeline["monthly_payment"]
        for tradeline in tradelines
        if tradeline["status"] == "current"
    ])

    return {
        "middle_credit_score": middle_score,
        "all_scores": credit_scores,
        "monthly_debts": monthly_debts,
        "tradelines": tradelines,
        "derogatory_items": extract_derogatories(credit_response),
        "inquiries_6_months": count_recent_inquiries(credit_response),
        "report_date": datetime.utcnow().isoformat()
    }
```

### Step 2.3: Income Verification

**W-2 Employment Verification**:
```python
def verify_w2_income(paystubs: List[Dict], w2_forms: List[Dict]):
    """Verify W-2 employment income using 2-year average."""

    # Calculate YTD income from paystubs
    ytd_gross = sum([stub["gross_pay"] for stub in paystubs])
    ytd_months = max([stub["pay_period_end"].month for stub in paystubs])
    projected_annual = (ytd_gross / ytd_months) * 12

    # Calculate 2-year average from W-2s
    w2_year_1 = w2_forms[0]["wages"]  # Most recent
    w2_year_2 = w2_forms[1]["wages"]  # Previous year
    two_year_average = (w2_year_1 + w2_year_2) / 2

    # Use lower of projected vs 2-year average (conservative)
    qualifying_income = min(projected_annual, two_year_average)

    # Check for declining income (red flag)
    income_trend = (w2_year_1 - w2_year_2) / w2_year_2 * 100
    if income_trend < -10:
        warnings.append("Income declined >10% year-over-year")

    return {
        "qualifying_annual_income": qualifying_income,
        "qualifying_monthly_income": qualifying_income / 12,
        "income_trend": income_trend,
        "warnings": warnings,
        "verification_method": "w2_paystubs"
    }
```

**Self-Employed Income Verification**:
```python
def verify_self_employed_income(tax_returns: List[Dict], ytd_pnl: Dict):
    """Verify self-employed income (more complex)."""

    # Calculate 2-year average from tax returns
    year_1_income = calculate_qualifying_income(tax_returns[0])  # Most recent
    year_2_income = calculate_qualifying_income(tax_returns[1])  # Previous
    two_year_average = (year_1_income + year_2_income) / 2

    # Adjust for YTD performance
    ytd_months = datetime.now().month
    ytd_income = ytd_pnl["net_profit"]
    projected_income = (ytd_income / ytd_months) * 12

    # Self-employed income often fluctuates, use conservative estimate
    qualifying_income = min(two_year_average, projected_income)

    return {
        "qualifying_annual_income": qualifying_income,
        "qualifying_monthly_income": qualifying_income / 12,
        "business_structure": tax_returns[0]["business_type"],
        "verification_method": "tax_returns_pnl",
        "warnings": ["Self-employed income requires 2-year history"]
    }

def calculate_qualifying_income(tax_return: Dict) -> float:
    """Calculate qualifying income from tax return (add back non-cash expenses)."""

    # Start with AGI (Adjusted Gross Income)
    agi = tax_return["adjusted_gross_income"]

    # Add back non-cash deductions
    add_backs = {
        "depreciation": tax_return.get("depreciation", 0),
        "amortization": tax_return.get("amortization", 0),
        "depletion": tax_return.get("depletion", 0),
        "business_use_of_home": tax_return.get("home_office_deduction", 0) * 0.5  # 50% add-back
    }

    qualifying_income = agi + sum(add_backs.values())

    return max(0, qualifying_income)  # Cannot be negative
```

### Step 2.4: Pre-Qualification Letter Issuance

**Decision Gate 2: Issue Pre-Qual Letter**

✅ **Issue Pre-Qual** if:
- Credit score meets minimum for loan type
- DTI ≤ 43% (conventional) or ≤ 56.99% (FHA with compensating factors)
- Income verification complete and sufficient
- No major derogatory credit items

**Pre-Qualification Letter Template**:
```
[Lender Letterhead]

Date: January 13, 2024

To Whom It May Concern:

RE: Pre-Qualification Letter for John Doe

This letter is to confirm that John Doe has been pre-qualified for a mortgage loan
under the following terms:

Purchase Price:        Up to $450,000
Down Payment:          $90,000 (20%)
Loan Amount:           Up to $360,000
Loan Type:             Conventional Conforming
Estimated Rate:        6.500% (subject to change)
Estimated Monthly Payment: $2,275 (Principal + Interest)

This pre-qualification is based on a review of Mr. Doe's credit report, income
documentation, and asset statements. This is NOT a commitment to lend and is
subject to final underwriting approval, property appraisal, and title review.

Pre-qualification valid through: February 13, 2024 (30 days)

If you have any questions, please contact me directly.

Sincerely,

Sarah Johnson
Senior Loan Officer, NMLS #123456
RateHunter Mortgage
(512) 555-LOAN
sarah.johnson@ratehunter.net

---
Equal Housing Lender. Licensed by the Texas Department of Savings and Mortgage Lending.
```

**TwentyCRM Status Update**:
```python
# Update lead status to "pre-qualified"
twentycrm_api.update_lead(lead_id, {
    "status": "pre_qualified",
    "stage": "active",
    "pre_qual_letter_issued": True,
    "pre_qual_amount": 360000,
    "pre_qual_expiration": (datetime.now() + timedelta(days=30)).isoformat()
})

# Send pre-qual letter via email
campaign_engine_api.send_email({
    "template": "pre_qual_letter",
    "to": lead.email,
    "attachments": [
        {
            "filename": "Pre-Qualification_Letter_John_Doe.pdf",
            "content": generate_pre_qual_pdf(lead_data)
        }
    ]
})
```

---

## Phase 3: Loan Application

### Step 3.1: Formal Application (1003 Form)

**Uniform Residential Loan Application (URLA)**:

**Section 1: Borrower Information**
- Full legal name
- SSN
- Date of birth
- Marital status
- Dependents
- Contact information
- Current address (2-year history)

**Section 2: Financial Information**
- Employment history (2 years)
- Income details (gross monthly)
- Other income sources
- Assets (checking, savings, investments, retirement)
- Liabilities (credit cards, auto loans, student loans)

**Section 3: Loan & Property Information**
- Loan amount requested
- Loan purpose (purchase, refinance, cash-out)
- Property address
- Property type and occupancy
- Number of units

**Section 4: Declarations**
- Outstanding judgments?
- Bankruptcy in last 7 years?
- Foreclosure in last 7 years?
- Party to a lawsuit?
- Obligated on any other loan?
- Co-signer on any debt?
- U.S. citizen or permanent resident?

**Section 5: Acknowledgments & Agreements**
- Authorization for credit report
- Agreement to provide documentation
- Understanding of loan estimate
- Acknowledgment of fair lending laws

**Digital Application Integration**:
```python
async def submit_loan_application(borrower_id: str, application_data: Dict):
    """Process formal loan application submission."""

    # Validate application completeness
    validation = validate_1003_application(application_data)
    if not validation["complete"]:
        return {
            "status": "incomplete",
            "missing_fields": validation["missing_fields"]
        }

    # Create loan file in TwentyCRM
    loan_file = await twentycrm_api.create_loan({
        "borrower_id": borrower_id,
        "application_data": application_data,
        "loan_number": generate_loan_number(),
        "application_date": datetime.utcnow().isoformat(),
        "status": "application_submitted",
        "assigned_processor": assign_processor(),
        "assigned_underwriter": None,  # Assigned during processing
        "target_closing_date": calculate_target_closing()
    })

    # Generate Loan Estimate (LE) - TILA requirement
    loan_estimate = await quote_engine_api.generate_loan_estimate({
        "loan_amount": application_data["loan_amount"],
        "interest_rate": get_current_rate(application_data),
        "loan_term": application_data["loan_term"],
        "property_value": application_data["property_value"],
        "closing_costs": estimate_closing_costs(application_data)
    })

    # Send Loan Estimate within 3 business days (TILA requirement)
    await campaign_engine_api.send_loan_estimate({
        "loan_id": loan_file["loan_id"],
        "borrower_email": borrower.email,
        "loan_estimate_pdf": loan_estimate["pdf"],
        "due_date": datetime.utcnow() + timedelta(days=3)
    })

    # Trigger application received campaign
    await campaign_engine_api.trigger_campaign({
        "campaign_id": "application_received",
        "loan_id": loan_file["loan_id"],
        "variables": {
            "loan_number": loan_file["loan_number"],
            "loan_officer": loan_file["loan_officer_name"],
            "processor": loan_file["processor_name"],
            "target_closing": loan_file["target_closing_date"]
        }
    })

    return {
        "status": "application_accepted",
        "loan_id": loan_file["loan_id"],
        "loan_number": loan_file["loan_number"],
        "loan_estimate_sent": True
    }
```

### Step 3.2: Document Collection

**Complete Document Checklist**:

**Identity & Residence**:
- [ ] Driver's license or government-issued ID
- [ ] Social Security card
- [ ] 2-year address history

**Income Documentation (W-2 Employees)**:
- [ ] Paystubs (last 2 months)
- [ ] W-2 forms (last 2 years)
- [ ] Tax returns (last 2 years) if self-employed income
- [ ] Employment verification (VOE)

**Income Documentation (Self-Employed)**:
- [ ] Personal tax returns (last 2 years) with all schedules
- [ ] Business tax returns (last 2 years)
- [ ] Year-to-date Profit & Loss statement
- [ ] Business license
- [ ] CPA letter (optional but helpful)

**Asset Documentation**:
- [ ] Bank statements (last 2 months, all accounts)
- [ ] Investment account statements
- [ ] Retirement account statements (401k, IRA)
- [ ] Gift letter (if receiving gift funds for down payment)
- [ ] Proof of gift deposit (bank statement showing deposit)

**Property Documentation**:
- [ ] Purchase agreement (fully executed)
- [ ] Property listing/MLS sheet
- [ ] Homeowners insurance quote
- [ ] HOA documents (if applicable)

**Other**:
- [ ] Explanation letters (for credit inquiries, late payments, gaps in employment)
- [ ] Divorce decree (if applicable to income/debts)
- [ ] Child support/alimony documentation

**Automated Document Tracking**:
```python
class DocumentTracker:
    """Track document collection progress."""

    def __init__(self, loan_id: str):
        self.loan_id = loan_id
        self.documents_required = self.get_required_documents()
        self.documents_received = []

    def check_document_completeness(self) -> Dict:
        """Check which documents are missing."""

        missing = [
            doc for doc in self.documents_required
            if doc not in self.documents_received
        ]

        percent_complete = (
            len(self.documents_received) / len(self.documents_required)
        ) * 100

        return {
            "percent_complete": percent_complete,
            "documents_missing": missing,
            "documents_received": self.documents_received,
            "status": "complete" if len(missing) == 0 else "incomplete"
        }

    async def send_document_reminder(self):
        """Send automated reminder for missing documents."""

        completeness = self.check_document_completeness()

        if completeness["status"] == "incomplete":
            await campaign_engine_api.send_email({
                "template": "document_reminder",
                "loan_id": self.loan_id,
                "variables": {
                    "missing_documents": completeness["documents_missing"],
                    "upload_link": f"https://ratehunter.net/upload/{self.loan_id}",
                    "percent_complete": completeness["percent_complete"]
                }
            })
```

### Step 3.3: Initial Disclosure Review

**3-Day Review Period** (TILA-RESPA requirement):
- Borrower receives Loan Estimate (LE)
- Borrower has 3 business days to review
- Borrower can accept or reject
- If accepted, application proceeds to processing

---

## Phase 4: Processing

### Step 4.1: Loan Processor Assignment

**Processor Responsibilities**:
- Review application for completeness
- Order appraisal
- Order title report
- Verify employment
- Verify assets
- Request additional documentation
- Prepare file for underwriting

**Processor Assignment Logic**:
```python
def assign_processor(loan_data: Dict) -> str:
    """Assign processor based on workload and specialization."""

    # Get all active processors
    processors = twentycrm_api.get_users(role="processor", status="active")

    # Calculate current workload
    for processor in processors:
        processor["workload"] = twentycrm_api.count_loans(
            assigned_processor=processor["id"],
            status__in=["processing", "underwriting"]
        )

    # Filter by loan type specialization
    if loan_data["loan_type"] in ["FHA", "VA"]:
        processors = [p for p in processors if "government_loans" in p["specializations"]]
    elif loan_data["loan_amount"] > 766550:  # Jumbo loan
        processors = [p for p in processors if "jumbo_loans" in p["specializations"]]

    # Assign to processor with lowest workload
    processors.sort(key=lambda p: p["workload"])
    return processors[0]["id"]
```

### Step 4.2: Appraisal Ordering

**Appraisal Process**:
1. Select licensed appraiser from approved panel
2. Order appraisal via Appraisal Management Company (AMC)
3. Schedule property inspection with borrower
4. Appraiser inspects property (1-2 hours)
5. Appraiser completes report (3-7 days)
6. Review appraisal for accuracy and value

**Appraisal Integration**:
```python
async def order_appraisal(loan_id: str, property_data: Dict):
    """Order property appraisal via AMC."""

    loan = await twentycrm_api.get_loan(loan_id)

    # Request appraisal
    appraisal_order = await amc_api.order_appraisal({
        "loan_number": loan["loan_number"],
        "property_address": property_data["address"],
        "loan_amount": loan["loan_amount"],
        "property_type": property_data["type"],
        "occupancy": property_data["occupancy"],
        "rush_order": loan.get("rush_closing", False),
        "contact": {
            "name": loan["borrower_name"],
            "phone": loan["borrower_phone"],
            "email": loan["borrower_email"]
        }
    })

    # Store appraisal order details
    await twentycrm_api.update_loan(loan_id, {
        "appraisal_ordered": True,
        "appraisal_order_number": appraisal_order["order_number"],
        "appraisal_status": "ordered",
        "appraisal_expected_date": appraisal_order["expected_completion"]
    })

    # Notify borrower
    await campaign_engine_api.send_email({
        "template": "appraisal_ordered",
        "loan_id": loan_id,
        "variables": {
            "order_number": appraisal_order["order_number"],
            "expected_date": appraisal_order["expected_completion"],
            "appraiser_contact": appraisal_order["appraiser_phone"]
        }
    })

    return appraisal_order
```

**Appraisal Review**:
```python
async def review_appraisal(loan_id: str, appraisal_report: Dict):
    """Review completed appraisal report."""

    loan = await twentycrm_api.get_loan(loan_id)

    # Extract appraised value
    appraised_value = appraisal_report["appraised_value"]
    purchase_price = loan["purchase_price"]

    # Calculate LTV with appraised value
    loan_amount = min(
        loan["requested_loan_amount"],
        appraised_value - loan["down_payment"]
    )
    ltv = (loan_amount / appraised_value) * 100

    # Check if value meets requirements
    if appraised_value < purchase_price:
        # Appraisal came in low
        shortfall = purchase_price - appraised_value

        await twentycrm_api.create_condition({
            "loan_id": loan_id,
            "condition_type": "appraisal_shortfall",
            "description": f"Appraisal ${shortfall} below purchase price",
            "severity": "high",
            "required_action": "Increase down payment OR renegotiate purchase price",
            "status": "pending"
        })

        # Notify loan officer and borrower
        await campaign_engine_api.send_email({
            "template": "appraisal_shortfall",
            "loan_id": loan_id,
            "variables": {
                "appraised_value": appraised_value,
                "purchase_price": purchase_price,
                "shortfall": shortfall
            }
        })

    # Update loan with appraisal data
    await twentycrm_api.update_loan(loan_id, {
        "appraisal_received": True,
        "appraised_value": appraised_value,
        "ltv": ltv,
        "appraisal_status": "complete",
        "appraisal_file_url": appraisal_report["pdf_url"]
    })

    return {
        "appraised_value": appraised_value,
        "ltv": ltv,
        "status": "approved" if appraised_value >= purchase_price else "shortfall"
    }
```

### Step 4.3: Title Ordering

**Title Search Process**:
1. Order title search from title company
2. Title company searches public records (liens, judgments, ownership history)
3. Title company issues preliminary title report (3-5 days)
4. Review for any title issues (liens, easements, encumbrances)
5. Resolve any title defects
6. Order title insurance policy

**Common Title Issues**:
- **Liens**: Unpaid taxes, mechanic's liens, judgment liens
- **Encumbrances**: Easements, restrictions, encroachments
- **Ownership**: Chain of title issues, missing heirs, disputed boundaries

### Step 4.4: Verification of Employment (VOE)

**VOE Process**:
```python
async def verify_employment(loan_id: str, employment_data: Dict):
    """Verify borrower employment status."""

    # Send VOE request to employer
    voe_response = await voe_service.verify({
        "employer_name": employment_data["employer_name"],
        "employer_contact": employment_data["hr_contact"],
        "employee_name": employment_data["employee_name"],
        "employee_ssn": employment_data["ssn_last_4"],
        "position": employment_data["position"],
        "hire_date": employment_data["hire_date"],
        "verification_questions": [
            "Current employment status",
            "Position and title",
            "Hire date",
            "Current salary/hourly rate",
            "Probability of continued employment"
        ]
    })

    # Check for red flags
    issues = []
    if voe_response["employment_status"] != "active":
        issues.append("Employment status not active")

    if voe_response["probability_continued"] == "uncertain":
        issues.append("Employment continuation uncertain")

    # Update loan with verification
    await twentycrm_api.update_loan(loan_id, {
        "employment_verified": True,
        "voe_date": datetime.utcnow().isoformat(),
        "voe_issues": issues,
        "voe_status": "verified" if len(issues) == 0 else "issues_found"
    })

    return {
        "verified": len(issues) == 0,
        "issues": issues,
        "voe_response": voe_response
    }
```

### Step 4.5: Verification of Deposit (VOD)

**VOD Process**:
```python
async def verify_deposits(loan_id: str, bank_statements: List[Dict]):
    """Verify asset deposits in bank statements."""

    # Parse bank statements
    deposits = []
    large_deposits = []  # Deposits > 50% of monthly income

    for statement in bank_statements:
        for transaction in statement["transactions"]:
            if transaction["type"] == "deposit":
                deposits.append(transaction)

                # Flag large deposits for sourcing
                if transaction["amount"] > (monthly_income * 0.5):
                    large_deposits.append(transaction)

    # Create conditions for large deposits
    for deposit in large_deposits:
        await twentycrm_api.create_condition({
            "loan_id": loan_id,
            "condition_type": "source_of_funds",
            "description": f"Source ${deposit['amount']} deposit on {deposit['date']}",
            "severity": "medium",
            "required_action": "Provide letter of explanation and documentation",
            "status": "pending"
        })

    # Calculate verified assets
    verified_assets = sum([stmt["ending_balance"] for stmt in bank_statements])

    return {
        "verified_assets": verified_assets,
        "large_deposits_count": len(large_deposits),
        "sourcing_required": len(large_deposits) > 0
    }
```

---

## Phase 5: Underwriting

### Step 5.1: File Submission to Underwriting

**Underwriter Assignment**:
```python
def assign_underwriter(loan_data: Dict) -> str:
    """Assign underwriter based on loan complexity and workload."""

    # Calculate loan complexity score
    complexity_score = 0

    if loan_data["loan_type"] in ["FHA", "VA"]:
        complexity_score += 2  # Government loans more complex
    if loan_data["borrower_self_employed"]:
        complexity_score += 3  # Self-employed = complex income calc
    if loan_data["credit_score"] < 680:
        complexity_score += 2  # Lower credit = more scrutiny
    if loan_data["ltv"] > 90:
        complexity_score += 1  # High LTV = more risk
    if loan_data["dti"] > 43:
        complexity_score += 2  # High DTI = manual underwriting

    # Get underwriters with specialization
    underwriters = twentycrm_api.get_users(role="underwriter", status="active")

    # Filter by complexity level
    if complexity_score >= 8:
        # Assign to senior underwriter
        underwriters = [u for u in underwriters if u["experience_years"] >= 5]

    # Assign based on workload
    for underwriter in underwriters:
        underwriter["workload"] = twentycrm_api.count_loans(
            assigned_underwriter=underwriter["id"],
            status="underwriting"
        )

    underwriters.sort(key=lambda u: u["workload"])
    return underwriters[0]["id"]
```

### Step 5.2: Automated Underwriting System (AUS)

**Fannie Mae Desktop Underwriter (DU) or Freddie Mac Loan Product Advisor (LPA)**:

```python
async def run_aus(loan_data: Dict) -> Dict:
    """Run automated underwriting through DU or LPA."""

    # Prepare AUS submission
    aus_submission = {
        "loan_amount": loan_data["loan_amount"],
        "purchase_price": loan_data["purchase_price"],
        "credit_score": loan_data["middle_credit_score"],
        "ltv": loan_data["ltv"],
        "dti": loan_data["dti"],
        "assets": loan_data["verified_assets"],
        "income": loan_data["monthly_income"],
        "employment_type": loan_data["employment_type"],
        "property_type": loan_data["property_type"],
        "occupancy": loan_data["occupancy"]
    }

    # Submit to DU (Fannie Mae)
    aus_response = await du_api.submit(aus_submission)

    # Parse response
    recommendation = aus_response["recommendation"]
    """
    Possible recommendations:
    - "Approve/Eligible" = Good to go, standard conditions
    - "Approve/Ineligible" = Approved but not for sale to Fannie Mae (portfolio loan)
    - "Refer/Eligible" = Needs manual underwriting but can be sold
    - "Refer/Ineligible" = Needs manual underwriting, cannot be sold
    - "Out of Scope" = Does not meet program guidelines
    """

    conditions = aus_response["conditions"]
    """
    Common conditions:
    - "Verification of Employment (VOE) required"
    - "Verification of Deposits (VOD) required"
    - "Appraisal review required"
    - "Credit explanation letter required"
    - "Proof of down payment source required"
    """

    return {
        "recommendation": recommendation,
        "eligible_for_sale": aus_response["eligible"],
        "conditions": conditions,
        "risk_assessment": aus_response["risk_class"],  # "Low Risk", "Moderate Risk", "Acceptable"
        "approval_likelihood": estimate_approval_likelihood(recommendation)
    }

def estimate_approval_likelihood(recommendation: str) -> float:
    """Estimate approval likelihood based on AUS recommendation."""

    likelihood_map = {
        "Approve/Eligible": 0.95,
        "Approve/Ineligible": 0.90,
        "Refer/Eligible": 0.70,
        "Refer/Ineligible": 0.40,
        "Out of Scope": 0.10
    }

    return likelihood_map.get(recommendation, 0.50)
```

### Step 5.3: Manual Underwriting Review

**Underwriter Checklist**:

✅ **Credit Review**:
- [ ] Credit report reviewed, all inquiries explained
- [ ] Payment history acceptable (no 30-day lates in 12 months)
- [ ] No collections/judgments OR paid off
- [ ] Credit score meets minimum for loan type

✅ **Income Review**:
- [ ] Income calculated correctly (2-year average for W-2, tax returns for self-employed)
- [ ] Income is stable or increasing
- [ ] All income sources documented
- [ ] Employment verified within 10 days of closing

✅ **Asset Review**:
- [ ] All accounts sourced and seasoned (2 months)
- [ ] Large deposits explained
- [ ] Sufficient reserves (2-6 months PITI depending on loan type)
- [ ] Gift funds properly documented (gift letter + proof of deposit)

✅ **DTI Calculation**:
- [ ] Front-end DTI ≤ 28% (housing only)
- [ ] Back-end DTI ≤ 43% (total debts)
- [ ] All monthly debts included
- [ ] Compensating factors documented if DTI high

✅ **Property Review**:
- [ ] Appraisal meets value requirements
- [ ] Property type eligible for loan program
- [ ] Occupancy matches intent (primary, second home, investment)
- [ ] No adverse title issues

✅ **Loan Structure**:
- [ ] LTV within program guidelines
- [ ] Loan term appropriate
- [ ] PMI correctly calculated (if required)
- [ ] Rate lock still valid

**Decision Gate 3: Underwriting Decision**

✅ **Clear to Close (CTC)**: No conditions remaining, ready to close
⚠️ **Suspended**: Waiting on conditions to be cleared
🔄 **Conditional Approval**: Approved with conditions (most common)
❌ **Denied**: Does not meet guidelines

### Step 5.4: Conditional Approval & Clearing Conditions

**Common Underwriting Conditions**:

1. **Final Verification of Employment (VOE)**: Verify employment within 10 days of closing
2. **Updated Bank Statements**: Provide statements through current month
3. **Homeowners Insurance**: Provide proof of insurance with lender named as mortgagee
4. **Explanation Letter**: Explain credit inquiry, gap in employment, large deposit, etc.
5. **Paid Off Debt**: Provide proof certain debts have been paid off
6. **Reserves**: Demonstrate sufficient reserves (2-6 months PITI)
7. **Gift Documentation**: Provide complete gift letter and deposit evidence

**Condition Clearing Workflow**:
```python
async def clear_underwriting_condition(condition_id: str, documentation: Dict):
    """Clear a specific underwriting condition."""

    condition = await twentycrm_api.get_condition(condition_id)
    loan = await twentycrm_api.get_loan(condition["loan_id"])

    # Upload documentation
    doc_url = await document_service.upload({
        "loan_id": loan["loan_id"],
        "document_type": condition["document_type"],
        "file": documentation["file"],
        "uploaded_by": documentation["uploaded_by"]
    })

    # Mark condition as cleared
    await twentycrm_api.update_condition(condition_id, {
        "status": "cleared",
        "cleared_date": datetime.utcnow().isoformat(),
        "documentation_url": doc_url,
        "cleared_by": loan["underwriter_id"]
    })

    # Check if all conditions cleared
    remaining_conditions = await twentycrm_api.count_conditions(
        loan_id=loan["loan_id"],
        status="pending"
    )

    if remaining_conditions == 0:
        # All conditions cleared! Update to Clear to Close
        await twentycrm_api.update_loan(loan["loan_id"], {
            "status": "clear_to_close",
            "ctc_date": datetime.utcnow().isoformat()
        })

        # Trigger Clear to Close campaign
        await campaign_engine_api.trigger_campaign({
            "campaign_id": "clear_to_close",
            "loan_id": loan["loan_id"]
        })

    return {
        "condition_cleared": True,
        "remaining_conditions": remaining_conditions,
        "loan_status": "clear_to_close" if remaining_conditions == 0 else "conditional_approval"
    }
```

---

## Phase 6: Clear to Close

### Step 6.1: Final Closing Disclosure (CD) Preparation

**TILA-RESPA Requirement**: Closing Disclosure must be provided at least **3 business days** before closing.

**Closing Disclosure Generation**:
```python
async def generate_closing_disclosure(loan_id: str) -> Dict:
    """Generate final Closing Disclosure (CD)."""

    loan = await twentycrm_api.get_loan(loan_id)

    # Get final loan terms
    final_rate = loan["locked_rate"]
    final_loan_amount = loan["final_loan_amount"]
    final_closing_costs = calculate_final_closing_costs(loan)

    # Calculate cash to close
    cash_to_close = (
        loan["purchase_price"] -
        final_loan_amount +
        final_closing_costs["total"] +
        loan.get("earnest_money", 0)
    )

    # Generate 5-page CD
    closing_disclosure = {
        "loan_terms": {
            "loan_amount": final_loan_amount,
            "interest_rate": final_rate,
            "monthly_principal_interest": calculate_monthly_payment(final_rate, final_loan_amount, loan["term_months"]),
            "prepayment_penalty": False,
            "balloon_payment": False
        },
        "projected_payments": {
            "principal_interest": calculate_monthly_payment(final_rate, final_loan_amount, loan["term_months"]),
            "mortgage_insurance": calculate_pmi(loan) if loan["pmi_required"] else 0,
            "estimated_escrow": loan["estimated_escrow"],
            "estimated_total": None  # Calculated below
        },
        "costs_at_closing": {
            "closing_costs": final_closing_costs,
            "cash_to_close": cash_to_close
        },
        "loan_calculations": {
            "total_of_payments": calculate_total_of_payments(loan),
            "finance_charge": calculate_finance_charge(loan),
            "amount_financed": final_loan_amount - final_closing_costs["financed"],
            "apr": loan["apr"]
        }
    }

    # Generate PDF
    cd_pdf = generate_cd_pdf(closing_disclosure)

    # Store CD
    cd_url = await document_service.upload({
        "loan_id": loan_id,
        "document_type": "closing_disclosure",
        "file": cd_pdf,
        "version": get_cd_version(loan_id)  # Track revisions
    })

    return {
        "cd_url": cd_url,
        "cd_data": closing_disclosure,
        "must_send_by": loan["closing_date"] - timedelta(days=3),
        "ready_to_send": True
    }
```

### Step 6.2: Final Walkthrough & Inspections

**Final Property Inspection** (for purchase transactions):
- Conducted 24-48 hours before closing
- Verify property condition hasn't changed
- Ensure all agreed-upon repairs completed
- Confirm appliances/fixtures included in sale

### Step 6.3: Closing Coordination

**Parties Involved**:
- Borrower(s)
- Seller(s) (if purchase)
- Loan Officer
- Title Company / Closing Attorney
- Real Estate Agents (buyer's and seller's)
- Notary Public

**Closing Checklist**:
- [ ] Closing Disclosure sent 3+ business days prior
- [ ] Final walkthrough completed (purchase) or appraisal received (refinance)
- [ ] Homeowners insurance bound with lender named as mortgagee
- [ ] Final VOE completed (within 10 days of closing)
- [ ] Title company has clear title
- [ ] Wire instructions provided to borrower
- [ ] Closing appointment scheduled
- [ ] All parties confirmed attendance

---

## Phase 7: Closing

### Step 7.1: Document Signing

**Documents to Sign** (typical purchase transaction):

**Borrower Documents**:
1. **Promissory Note** - Legal promise to repay loan
2. **Deed of Trust / Mortgage** - Secures the promissory note with the property
3. **Closing Disclosure** - Final loan terms and costs
4. **Initial Escrow Disclosure** - Escrow account details
5. **Itemization of Amount Financed** - Breakdown of loan proceeds
6. **Right to Cancel (Refinance Only)** - 3-day right to rescind
7. **Occupancy Affidavit** - Confirms intended occupancy
8. **Authorization to Transfer Funds** - Wire transfer authorization

**Seller Documents (Purchase Only)**:
1. **Deed** - Transfers ownership
2. **Bill of Sale** - Transfers personal property
3. **Affidavit of Title** - Confirms clear title
4. **Seller's Closing Disclosure** - Seller's costs

### Step 7.2: Funding

**Funding Process**:
1. **All docs signed**: Notary verifies signatures
2. **Title company packages**: Prepares final documents
3. **Lender reviews**: Final quality control check
4. **Funding approval**: Lender wires funds to title company
5. **Title company confirms**: Funds received
6. **Recording**: Deed and mortgage recorded at county

**Funding Approval**:
```python
async def approve_funding(loan_id: str) -> Dict:
    """Final funding approval and wire transfer."""

    loan = await twentycrm_api.get_loan(loan_id)

    # Final quality control checklist
    qc_checks = {
        "all_documents_signed": check_docs_signed(loan_id),
        "no_outstanding_conditions": check_conditions_cleared(loan_id),
        "final_voe_completed": check_final_voe(loan_id),
        "insurance_bound": check_insurance(loan_id),
        "title_clear": check_title_status(loan_id),
        "notary_verified": check_notary_verification(loan_id)
    }

    if not all(qc_checks.values()):
        return {
            "approved": False,
            "reason": "QC checks failed",
            "failed_checks": [k for k, v in qc_checks.items() if not v]
        }

    # Approve funding
    await twentycrm_api.update_loan(loan_id, {
        "status": "funded",
        "funding_date": datetime.utcnow().isoformat(),
        "funded_amount": loan["final_loan_amount"]
    })

    # Wire funds to title company
    wire_confirmation = await wire_service.transfer({
        "amount": loan["final_loan_amount"],
        "recipient_bank": loan["title_company_bank"],
        "recipient_account": loan["title_company_account"],
        "reference": f"Loan {loan['loan_number']} - {loan['borrower_name']}"
    })

    # Notify all parties
    await campaign_engine_api.send_emails([
        {"template": "funding_approved_borrower", "to": loan["borrower_email"]},
        {"template": "funding_approved_title", "to": loan["title_company_email"]},
        {"template": "funding_approved_agent", "to": loan["agent_email"]}
    ])

    return {
        "approved": True,
        "funded_amount": loan["final_loan_amount"],
        "wire_confirmation": wire_confirmation["confirmation_number"],
        "funded_at": datetime.utcnow().isoformat()
    }
```

### Step 7.3: Recording & Loan Completion

**Recording Process**:
- Title company records deed and mortgage at county recorder's office
- Typically takes 1-3 days for recording
- Once recorded, sale/refinance is complete
- Title company sends recorded documents to lender

**Loan Completion**:
```python
async def complete_loan(loan_id: str, recording_info: Dict):
    """Mark loan as completed after recording."""

    await twentycrm_api.update_loan(loan_id, {
        "status": "completed",
        "completion_date": datetime.utcnow().isoformat(),
        "recorded_date": recording_info["recorded_date"],
        "recorded_book_page": recording_info["book_page"],
        "county_recorder": recording_info["county"]
    })

    # Trigger post-closing campaign
    await campaign_engine_api.trigger_campaign({
        "campaign_id": "post_closing",
        "loan_id": loan_id
    })

    # Calculate loan officer commission
    commission = calculate_commission(loan_id)
    await accounting_api.record_commission({
        "loan_id": loan_id,
        "loan_officer_id": loan["loan_officer_id"],
        "commission_amount": commission,
        "payment_date": get_next_commission_payment_date()
    })

    return {
        "loan_completed": True,
        "recorded": True,
        "commission_calculated": True
    }
```

---

## Phase 8: Post-Closing

### Step 8.1: Thank You & Referral Request

**Post-Closing Campaign** (Day 0 after closing):
```
Subject: Congratulations on Your New Home, John! 🏡

Hi John,

Congratulations on closing your loan! It was a pleasure working with you throughout
this process. Your new home is waiting for you at 123 Main St!

A few things to keep in mind:
✅ Your first payment is due on [DATE]
✅ Set up automatic payments at [SERVICER WEBSITE]
✅ Keep your homeowner's insurance current
✅ Save your closing documents in a safe place

We'd Love Your Feedback:
If you had a great experience, would you mind leaving us a review? It helps other
homebuyers find us!

[Leave a Google Review] [Leave a Yelp Review]

Know Someone Buying or Refinancing?
The best compliment you can give us is a referral. If you know anyone looking for
a mortgage, send them my way!

[Refer a Friend]

Thank you again, and enjoy your new home!

Best regards,
Sarah Johnson
Senior Loan Officer
RateHunter Mortgage
```

### Step 8.2: Ongoing Relationship Management

**30-Day Check-In**:
```
Subject: How's Life in Your New Home?

Hi John,

It's been a month since you closed! How's everything going in your new home?

If you have any questions about your mortgage or homeownership in general,
I'm always here to help.

Fun Fact: Did you know you can make extra principal payments to pay off your
mortgage faster? Even $100 extra per month can save you thousands in interest!

[Learn More About Extra Payments]

Best,
Sarah
```

**Annual Refinance Check**:
```
Subject: Time to Review Your Mortgage Rate

Hi John,

Happy anniversary! It's been 1 year since you closed your mortgage at 6.5%.

Good news: Current rates for your loan type are around 6.0%. You might be able
to save money by refinancing!

Would you like me to run a quick analysis to see if refinancing makes sense?
It's free and takes just 5 minutes.

[Check My Refinance Options]

Best,
Sarah
```

### Step 8.3: Servicing Transfer Notification

**Servicing Transfer** (if loan sold to investor):
- Required to notify borrower 15 days before transfer
- New servicer contact information
- Payment instructions
- Escrow account transfer details

---

## ⏱️ Typical Timelines

### Conventional Purchase Loan (30-day close)

| Day | Milestone | Owner |
|-----|-----------|-------|
| 0 | Lead received, quote sent | Loan Officer |
| 1-2 | Application submitted | Borrower + LO |
| 3 | Loan Estimate sent (TILA 3-day requirement) | Processor |
| 5-7 | Document collection complete | Borrower |
| 7 | Appraisal ordered | Processor |
| 7-14 | Appraisal completed | Appraiser |
| 10 | Title ordered | Processor |
| 10-14 | Title report received | Title Company |
| 14 | File submitted to underwriting | Processor |
| 14-21 | Underwriting review & conditional approval | Underwriter |
| 21-25 | Clearing conditions | Borrower + Processor |
| 25 | Clear to Close (CTC) | Underwriter |
| 27 | Closing Disclosure sent (3 business days before close) | Processor |
| 30 | Closing & funding | All parties |
| 31-33 | Recording | Title Company |

### FHA Purchase Loan (45-day close)

| Day | Milestone | Owner |
|-----|-----------|-------|
| 0 | Lead received, quote sent | Loan Officer |
| 1-3 | Application submitted | Borrower + LO |
| 4 | Loan Estimate sent | Processor |
| 7-10 | Document collection (more docs for FHA) | Borrower |
| 10 | Appraisal ordered (FHA appraisal more detailed) | Processor |
| 10-21 | FHA appraisal completed (longer than conventional) | Appraiser |
| 14 | Title ordered | Processor |
| 14-21 | Title report received | Title Company |
| 21 | File submitted to underwriting | Processor |
| 21-35 | Underwriting review (FHA requires more scrutiny) | Underwriter |
| 35-40 | Clearing conditions | Borrower + Processor |
| 40 | Clear to Close | Underwriter |
| 42 | Closing Disclosure sent | Processor |
| 45 | Closing & funding | All parties |
| 46-48 | Recording | Title Company |

### Refinance (30-day close)

| Day | Milestone | Owner |
|-----|-----------|-------|
| 0 | Lead received, quote sent | Loan Officer |
| 1-2 | Application submitted | Borrower + LO |
| 3 | Loan Estimate sent | Processor |
| 5-7 | Document collection | Borrower |
| 7 | Appraisal ordered (if cash-out or no appraisal waiver) | Processor |
| 7-14 | Appraisal completed | Appraiser |
| 10 | Title ordered | Processor |
| 10-14 | Title report received | Title Company |
| 14 | File submitted to underwriting | Processor |
| 14-21 | Underwriting review | Underwriter |
| 21-25 | Clearing conditions | Borrower + Processor |
| 25 | Clear to Close | Underwriter |
| 27 | Closing Disclosure sent (3 business days) | Processor |
| 30 | Closing (signing only, no sellers) | Borrower + Notary |
| 33 | Rescission period ends (3-day right to cancel) | N/A |
| 33 | Funding | Lender |
| 34-36 | Recording | Title Company |

---

## 🚧 Common Roadblocks

### Appraisal Issues

**Issue**: Appraisal comes in below purchase price
**Impact**: Loan amount reduced OR borrower must increase down payment
**Solution**:
1. Borrower increases down payment to cover shortfall
2. Renegotiate purchase price with seller
3. Order second appraisal (risky, may come in same)
4. Cancel contract (last resort)

### Title Issues

**Issue**: Lien found on property (tax lien, judgment lien, mechanic's lien)
**Impact**: Cannot close until lien cleared
**Solution**:
1. Seller pays off lien before closing
2. Negotiate with lien holder for settlement
3. Obtain title insurance exception (if lien not material)

### Employment Verification Issues

**Issue**: Borrower changes jobs during process OR employment status uncertain
**Impact**: May no longer qualify if income changes
**Solution**:
1. If same field, same pay: Document new employment, proceed
2. If different field or lower pay: Recalculate income, may need to adjust loan amount
3. If unemployed: Loan denied

### Document Collection Delays

**Issue**: Borrower slow to provide documents
**Impact**: Delays processing and closing date
**Solution**:
1. Automated reminders via n8n (every 2 days)
2. Loan officer phone call
3. Extend closing date if necessary

### Rate Lock Expiration

**Issue**: Process takes longer than rate lock period (30-60 days)
**Impact**: Must re-lock at current rate (may be higher)
**Solution**:
1. Request rate lock extension (usually costs 0.125% per 15 days)
2. Accept new rate if lower
3. Expedite remaining steps to close before expiration

### Credit Score Drop

**Issue**: Borrower's credit score drops between application and closing
**Impact**: May no longer qualify at approved rate
**Solution**:
1. Investigate cause (new inquiry, increased balances, late payment)
2. If minor drop, may still proceed with rate adjustment
3. If major drop, loan may be denied or require re-underwriting

---

**Document Version**: 1.0
**Last Updated**: 2026-01-13
**Maintained By**: Project Nyra Team
**Related Docs**:
- [Mortgage Brokerage Business Processes](./MORTGAGE-BROKERAGE-PROCESSES.md)
- [Compliance Requirements](./COMPLIANCE-REQUIREMENTS.md)
- [Technology Stack](./TECHNOLOGY-STACK.md)
