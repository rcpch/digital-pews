import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { scoreObservations, computeEscalation } from '@digital-pews/clinical-engine';
import { ScoreBadge } from './ScoreBadge';
import { EscalationBanner } from './EscalationBanner';
const RESPIRATORY_DISTRESS_OPTIONS = ['none', 'mild', 'moderate', 'severe'];
const OXYGEN_DEVICE_OPTIONS = ['HF', 'BiP', 'CP', 'NP', 'FM', 'HB', 'NRB'];
const OXYGEN_SUPPORT_MODE_OPTIONS = ['air', 'percent', 'litres'];
const SKIP_BP_REASONS = [
    { value: 'not-attempted-no-concern', label: 'Not Attempted (No Concern)' },
    { value: 'unsuccessful-no-concern', label: 'Unsuccessful (No Concern)' },
    { value: 'unsuccessful-concern', label: 'Unsuccessful (Concern)' },
    { value: 'other', label: 'Other' },
];
const CARER_OPTIONS = ['W', 'S', 'B', 'A', 'U'];
const ESCALATION_LEVELS = ['none', 'low', 'medium', 'high', 'emergency'];
export const ObservationForm = () => {
    const [obs, setObs] = useState({
        oxygenSupportMode: 'air',
        respiratoryDistress: 'none',
        oxygenDevice: 'NP',
    });
    const [carerAnswer, setCarerAnswer] = useState('W');
    const [clinicalIntuition, setClinicalIntuition] = useState(false);
    const [clinicalIntuitionLevel, setClinicalIntuitionLevel] = useState('low');
    const [specificConcern] = useState('none');
    const [skipBP, setSkipBP] = useState(false);
    const [skipBPReason, setSkipBPReason] = useState('not-attempted-no-concern');
    const [skipBPOtherText, setSkipBPOtherText] = useState('');
    const [skipBPOtherScore, setSkipBPOtherScore] = useState(0);
    const [escalationResult, setEscalationResult] = useState(null);
    const scoreBreakdown = useMemo(() => {
        const input = {
            ageMonths: obs.ageMonths ?? 0,
            respiratoryRate: obs.respiratoryRate ?? 0,
            respiratoryDistress: obs.respiratoryDistress ?? 'none',
            oxygenSaturation: obs.oxygenSaturation ?? 100,
            oxygenDevice: obs.oxygenDevice ?? 'NP',
            oxygenSupportMode: obs.oxygenSupportMode ?? 'air',
            heartRate: obs.heartRate ?? 0,
            capillaryRefillSeconds: obs.capillaryRefillSeconds ?? 0,
        };
        if (obs.oxygenSupportValue !== undefined) {
            input.oxygenSupportValue = obs.oxygenSupportValue;
        }
        if (skipBP) {
            const skip = {
                reason: skipBPReason,
            };
            if (skipBPReason === 'other') {
                skip.otherText = skipBPOtherText;
                skip.otherScore = skipBPOtherScore;
            }
            input.bloodPressureSkip = skip;
        }
        else if (obs.systolicBloodPressure !== undefined) {
            input.systolicBloodPressure = obs.systolicBloodPressure;
        }
        try {
            return scoreObservations(input);
        }
        catch (e) {
            return null;
        }
    }, [obs, skipBP, skipBPReason, skipBPOtherText, skipBPOtherScore]);
    const handleCalculateEscalation = () => {
        if (!scoreBreakdown)
            return;
        const input = {
            pewsTotal: scoreBreakdown.total,
            specificConcern,
            carerQuestionAnswer: carerAnswer,
            ...(clinicalIntuition ? { clinicalIntuitionEscalation: clinicalIntuitionLevel } : {}),
        };
        const decision = computeEscalation(input);
        setEscalationResult(decision);
    };
    const updateObs = (field, value) => {
        setObs(prev => ({ ...prev, [field]: value }));
    };
    const renderField = (label, component, score) => (_jsxs("div", { className: "form-field", children: [_jsx("label", { className: "field-label", children: label }), _jsxs("div", { className: "field-input-wrapper", children: [component, score && _jsx("div", { className: "field-score", children: _jsx(ScoreBadge, { score: score.score, band: score.band }) })] })] }));
    return (_jsxs("div", { className: "observation-form", children: [_jsx("h1", { className: "form-title", children: "Clinical Observations" }), _jsxs("div", { className: "card", children: [renderField("Age (months)", (_jsx("input", { type: "number", value: obs.ageMonths ?? '', onChange: e => updateObs('ageMonths', Number(e.target.value)), placeholder: "e.g. 12" })), scoreBreakdown ? { score: 0, band: 'white' } : undefined), renderField("Respiratory Rate", (_jsx("input", { type: "number", value: obs.respiratoryRate ?? '', onChange: e => updateObs('respiratoryRate', Number(e.target.value)) })), scoreBreakdown?.respiratoryRate), renderField("Respiratory Distress", (_jsx("select", { value: obs.respiratoryDistress, onChange: e => updateObs('respiratoryDistress', e.target.value), children: RESPIRATORY_DISTRESS_OPTIONS.map(o => _jsx("option", { value: o, children: o }, o)) })), scoreBreakdown?.respiratoryDistress), renderField("Oxygen Saturation (%)", (_jsx("input", { type: "number", value: obs.oxygenSaturation ?? '', onChange: e => updateObs('oxygenSaturation', Number(e.target.value)) })), scoreBreakdown?.oxygenSaturation), renderField("Oxygen Support Mode", (_jsx("select", { value: obs.oxygenSupportMode, onChange: e => updateObs('oxygenSupportMode', e.target.value), children: OXYGEN_SUPPORT_MODE_OPTIONS.map(o => _jsx("option", { value: o, children: o }, o)) })), scoreBreakdown?.oxygenSupport), obs.oxygenSupportMode !== 'air' && renderField("Oxygen Support Value", (_jsx("input", { type: "number", value: obs.oxygenSupportValue ?? '', onChange: e => updateObs('oxygenSupportValue', Number(e.target.value)), placeholder: obs.oxygenSupportMode === 'percent' ? '%' : 'L/min' }))), renderField("Oxygen Device", (_jsxs("select", { value: obs.oxygenDevice, onChange: e => updateObs('oxygenDevice', e.target.value), children: [_jsx("option", { value: "", children: "Select Device" }), OXYGEN_DEVICE_OPTIONS.map(o => _jsx("option", { value: o, children: o }, o))] }))), renderField("Heart Rate", (_jsx("input", { type: "number", value: obs.heartRate ?? '', onChange: e => updateObs('heartRate', Number(e.target.value)) })), scoreBreakdown?.heartRate), _jsx("div", { className: "form-field checkbox-field", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: skipBP, onChange: e => setSkipBP(e.target.checked) }), "Skip Blood Pressure?"] }) }), !skipBP ? renderField("Systolic BP", (_jsx("input", { type: "number", value: obs.systolicBloodPressure ?? '', onChange: e => updateObs('systolicBloodPressure', Number(e.target.value)) })), scoreBreakdown?.bloodPressure) : (_jsxs("div", { className: "bp-skip-section", children: [renderField("Reason for Skipping", (_jsx("select", { value: skipBPReason, onChange: e => setSkipBPReason(e.target.value), children: SKIP_BP_REASONS.map(r => _jsx("option", { value: r.value, children: r.label }, r.value)) })), scoreBreakdown?.bloodPressure), skipBPReason === 'other' && (_jsxs(_Fragment, { children: [renderField("Other Reason", (_jsx("input", { type: "text", value: skipBPOtherText, onChange: e => setSkipBPOtherText(e.target.value) }))), renderField("Score for Reason", (_jsxs("select", { value: skipBPOtherScore, onChange: e => setSkipBPOtherScore(Number(e.target.value)), children: [_jsx("option", { value: 0, children: "0" }), _jsx("option", { value: 4, children: "4" })] })))] }))] })), renderField("Capillary Refill (sec)", (_jsx("input", { type: "number", value: obs.capillaryRefillSeconds ?? '', onChange: e => updateObs('capillaryRefillSeconds', Number(e.target.value)) })), scoreBreakdown?.capillaryRefill)] }), _jsxs("div", { className: "card", children: [_jsx("h2", { className: "section-title", children: "Escalation Factors" }), renderField("Carer Concern", (_jsx("select", { value: carerAnswer, onChange: e => setCarerAnswer(e.target.value), children: CARER_OPTIONS.map(o => _jsx("option", { value: o, children: o }, o)) }))), _jsx("div", { className: "form-field checkbox-field", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: clinicalIntuition, onChange: e => setClinicalIntuition(e.target.checked) }), "Clinical Intuition Override?"] }) }), clinicalIntuition && renderField("Intuition Level", (_jsx("select", { value: clinicalIntuitionLevel, onChange: e => setClinicalIntuitionLevel(e.target.value), children: ESCALATION_LEVELS.filter(l => l !== 'none').map(l => _jsx("option", { value: l, children: l }, l)) })))] }), _jsxs("div", { className: "sticky-footer", children: [_jsxs("div", { className: "total-score", children: [_jsx("span", { children: "Total PEWS Score:" }), _jsx("span", { className: "score-value", children: scoreBreakdown?.total ?? '-' })] }), _jsx("button", { className: "calculate-btn", onClick: handleCalculateEscalation, children: "Calculate Escalation" })] }), escalationResult && _jsx(EscalationBanner, { decision: escalationResult })] }));
};
//# sourceMappingURL=ObservationForm.js.map