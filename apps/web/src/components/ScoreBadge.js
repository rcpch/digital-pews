import { jsx as _jsx } from "react/jsx-runtime";
const bandColors = {
    white: '#FFFFFF',
    yellow: '#FFD700',
    orange: '#FF8C00',
    pink: '#FF1493',
};
const bandTextColors = {
    white: '#000000',
    yellow: '#000000',
    orange: '#000000',
    pink: '#FFFFFF',
};
export const ScoreBadge = ({ score, band }) => {
    return (_jsx("div", { style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '2rem',
            height: '2rem',
            borderRadius: '9999px',
            backgroundColor: bandColors[band],
            color: bandTextColors[band],
            fontWeight: 'bold',
            fontSize: '0.875rem',
            padding: '0 0.5rem',
            border: band === 'white' ? '1px solid #e2e8f0' : 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }, children: score }));
};
//# sourceMappingURL=ScoreBadge.js.map