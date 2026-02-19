// mortgage-ui/lib/core-components.tsx
export const MortgageComplianceButton = () => (
  <button 
    className="dyad-compliance-pill"
    onClick={() => window.DyadSDK.triggerComplianceCheck()}
  >
    <ShieldCheck className="w-4 h-4" />
    <span>Run TRID Validation</span>
  </button>
)