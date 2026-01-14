import re
from datetime import datetime, time
from typing import Optional, Tuple
import pytz
from .schemas import (
    MessageType,
    MessageClassification,
    ConsentType,
    ComplianceCheckRequest,
    ComplianceCheckResponse
)


# TCPA Compliance Rules
# TCPA (Telephone Consumer Protection Act) requires express written consent for autodialed calls/texts
# Quiet hours: 9am-9pm local time for calls
# Opt-out keywords must be honored immediately

OPT_OUT_KEYWORDS = [
    "stop", "unsubscribe", "cancel", "end", "quit",
    "opt out", "opt-out", "remove", "delete"
]

QUIET_HOURS_START = time(9, 0)  # 9 AM
QUIET_HOURS_END = time(21, 0)   # 9 PM


class ConsentLedger:
    """In-memory consent tracking (should be database-backed in production)"""

    def __init__(self):
        self.consents: dict = {}
        self.opt_outs: set = set()

    def add_consent(self, lead_id: str, consent_type: ConsentType, phone: str, email: str):
        """Add consent record for a lead"""
        self.consents[lead_id] = {
            "consent_type": consent_type,
            "phone": phone,
            "email": email,
            "timestamp": datetime.utcnow(),
            "active": True
        }

    def check_consent(self, lead_id: str) -> Tuple[bool, ConsentType]:
        """Check if lead has active consent"""
        if lead_id in self.opt_outs:
            return False, ConsentType.NONE

        if lead_id not in self.consents:
            return False, ConsentType.NONE

        consent = self.consents[lead_id]
        if not consent["active"]:
            return False, ConsentType.NONE

        return True, ConsentType(consent["consent_type"])

    def add_opt_out(self, lead_id: str):
        """Record opt-out (TCPA compliance - must honor immediately)"""
        self.opt_outs.add(lead_id)
        if lead_id in self.consents:
            self.consents[lead_id]["active"] = False

    def check_opt_out(self, lead_id: str) -> bool:
        """Check if lead has opted out"""
        return lead_id in self.opt_outs


def is_quiet_hours(scheduled_time: datetime, timezone_str: str) -> bool:
    """Check if scheduled time violates TCPA quiet hours (9am-9pm local time)"""
    try:
        tz = pytz.timezone(timezone_str)
        local_time = scheduled_time.astimezone(tz).time()

        # Allowed between 9 AM and 9 PM
        if QUIET_HOURS_START <= local_time <= QUIET_HOURS_END:
            return False
        return True
    except Exception:
        # If timezone conversion fails, assume violation for safety
        return True


def detect_opt_out_keywords(message: str) -> bool:
    """Detect opt-out keywords in message content"""
    message_lower = message.lower().strip()
    for keyword in OPT_OUT_KEYWORDS:
        if re.search(r'\b' + re.escape(keyword) + r'\b', message_lower):
            return True
    return False


def classify_message(
    message_type: MessageType,
    consent_type: ConsentType,
    quiet_hours_violation: bool,
    opt_out_detected: bool
) -> MessageClassification:
    """Classify message based on compliance rules"""

    # Blocked conditions
    if opt_out_detected:
        return MessageClassification.BLOCKED

    if message_type in [MessageType.SMS, MessageType.CALL]:
        if quiet_hours_violation:
            return MessageClassification.BLOCKED

        if consent_type == ConsentType.NONE:
            return MessageClassification.BLOCKED

        if consent_type in [ConsentType.IMPLIED, ConsentType.VERBAL]:
            # Requires express written consent for autodialed SMS/calls
            return MessageClassification.APPROVAL_REQUIRED

    # Email is less restricted but still needs some consent
    if message_type == MessageType.EMAIL:
        if consent_type == ConsentType.NONE:
            return MessageClassification.APPROVAL_REQUIRED

    # All checks passed
    return MessageClassification.ALLOWED


def check_compliance(
    request: ComplianceCheckRequest,
    consent_ledger: ConsentLedger
) -> ComplianceCheckResponse:
    """Main compliance check function"""

    # Check opt-out status
    opt_out_detected = consent_ledger.check_opt_out(request.lead_id)

    # Check consent
    has_consent, consent_type = consent_ledger.check_consent(request.lead_id)

    # Check quiet hours for calls/SMS
    quiet_hours_violation = False
    if request.message_type in [MessageType.SMS, MessageType.CALL]:
        if request.scheduled_time:
            # Use scheduled time if provided
            quiet_hours_violation = is_quiet_hours(
                request.scheduled_time,
                "America/New_York"  # Default, should come from lead profile
            )
        else:
            # Use current time
            quiet_hours_violation = is_quiet_hours(
                datetime.utcnow(),
                "America/New_York"
            )

    # Classify message
    classification = classify_message(
        request.message_type,
        consent_type,
        quiet_hours_violation,
        opt_out_detected
    )

    # Determine reason
    reason = None
    if classification == MessageClassification.BLOCKED:
        if opt_out_detected:
            reason = "Lead has opted out"
        elif quiet_hours_violation:
            reason = "Quiet hours violation (must be 9am-9pm local time)"
        elif consent_type == ConsentType.NONE:
            reason = "No consent on record"
    elif classification == MessageClassification.APPROVAL_REQUIRED:
        if consent_type in [ConsentType.IMPLIED, ConsentType.VERBAL]:
            reason = "Requires express written consent for autodialed SMS/calls"
        elif consent_type == ConsentType.NONE:
            reason = "No consent on record - manual approval required"

    return ComplianceCheckResponse(
        classification=classification,
        allowed=(classification == MessageClassification.ALLOWED),
        reason=reason,
        consent_status=consent_type,
        quiet_hours_violation=quiet_hours_violation,
        opt_out_detected=opt_out_detected,
        audit_id=f"audit_{request.lead_id}_{datetime.utcnow().timestamp()}"
    )


# Regulatory frameworks (RESPA, TILA, ECOA, FCRA, HMDA, ATR, SAFE)
# These are documented for compliance reference

REGULATORY_FRAMEWORKS = {
    "TCPA": "Telephone Consumer Protection Act - Requires consent for autodialed calls/texts",
    "RESPA": "Real Estate Settlement Procedures Act - Disclosure requirements",
    "TILA": "Truth in Lending Act - APR and loan term disclosures",
    "ECOA": "Equal Credit Opportunity Act - Anti-discrimination",
    "FCRA": "Fair Credit Reporting Act - Credit report usage rules",
    "HMDA": "Home Mortgage Disclosure Act - Reporting requirements",
    "ATR": "Ability to Repay Rule - Income verification requirements",
    "SAFE": "Secure and Fair Enforcement Act - Loan originator licensing"
}


def validate_regulatory_compliance(quote_data: dict) -> list:
    """Validate quote against regulatory frameworks"""
    violations = []

    # TILA: APR must be disclosed
    if "apr" not in quote_data or quote_data["apr"] is None:
        violations.append("TILA: APR must be disclosed")

    # ATR: Credit score must be verified
    if "credit_score" not in quote_data or quote_data["credit_score"] < 300:
        violations.append("ATR: Valid credit score required")

    # RESPA: Closing costs must be disclosed
    if "closing_costs" not in quote_data:
        violations.append("RESPA: Closing costs must be disclosed")

    return violations
