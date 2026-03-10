import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
const levelColors = {
    none: '#64748b',
    low: '#3B82F6',
    medium: '#FFD700',
    high: '#FF8C00',
    emergency: '#DC2626',
};
const levelTextColors = {
    none: '#ffffff',
    low: '#ffffff',
    medium: '#000000',
    high: '#ffffff',
    emergency: '#ffffff',
};
const guidanceText = {
    none: 'Continue routine observations as per local policy.',
    low: 'Inform Nurse in Charge. Consider medical review by ST3+. Reassess within 60 minutes.',
    medium: 'Request Medical Review by ST3+ within 30 minutes. Continuous SpO2 monitoring. Reassess within 30 minutes.',
    high: 'Call for Rapid Review within 15 minutes. Stabilisation plan with consultant. Continuous RR/SpO2/ECG monitoring.',
    emergency: 'Immediate 2222 call: Paediatric Medical Emergency. Consultant informed urgently. Continuous monitoring every 15 minutes.',
};
export const EscalationBanner = ({ decision }) => {
    const { level } = decision;
    return (_jsxs("div", { style: {
            backgroundColor: levelColors[level],
            color: levelTextColors[level],
            padding: '1.5rem',
            borderRadius: '0.75rem',
            marginTop: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0,0,0,0.1)',
        }, children: [_jsxs("h2", { style: { margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '1.25rem', fontWeight: '800' }, children: ["Escalation Level: ", level] }), _jsx("p", { style: { margin: 0, fontSize: '1.1rem', lineHeight: '1.5' }, children: guidanceText[level] })] }));
};
//# sourceMappingURL=EscalationBanner.js.map