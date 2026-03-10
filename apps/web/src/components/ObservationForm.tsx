import React, { useState, useMemo } from 'react';
import type {
  ObservationInput,
  ObservationScoreBreakdown,
  RespiratoryDistressLevel,
  OxygenDeviceCode,
  OxygenSupportMode,
  BloodPressureSkipReason,
  CarerQuestionAnswer,
  SpecificConcern,
  EscalationLevel,
  EscalationDecision,
  EscalationInput,
  BloodPressureSkip,
  ObservationScore,
} from '@digital-pews/types';
import { scoreObservations, computeEscalation } from '@digital-pews/clinical-engine';
import { ScoreBadge } from './ScoreBadge';
import { EscalationBanner } from './EscalationBanner';

const RESPIRATORY_DISTRESS_OPTIONS: RespiratoryDistressLevel[] = ['none', 'mild', 'moderate', 'severe'];
const OXYGEN_DEVICE_OPTIONS: OxygenDeviceCode[] = ['HF', 'BiP', 'CP', 'NP', 'FM', 'HB', 'NRB'];
const OXYGEN_SUPPORT_MODE_OPTIONS: OxygenSupportMode[] = ['air', 'percent', 'litres'];
const SKIP_BP_REASONS: { value: BloodPressureSkipReason; label: string }[] = [
  { value: 'not-attempted-no-concern', label: 'Not Attempted (No Concern)' },
  { value: 'unsuccessful-no-concern', label: 'Unsuccessful (No Concern)' },
  { value: 'unsuccessful-concern', label: 'Unsuccessful (Concern)' },
  { value: 'other', label: 'Other' },
];
const CARER_OPTIONS: CarerQuestionAnswer[] = ['W', 'S', 'B', 'A', 'U'];
const ESCALATION_LEVELS: EscalationLevel[] = ['none', 'low', 'medium', 'high', 'emergency'];

export const ObservationForm: React.FC = () => {
  const [obs, setObs] = useState<Partial<ObservationInput>>({
    oxygenSupportMode: 'air',
    respiratoryDistress: 'none',
    oxygenDevice: 'NP',
  });

  const [carerAnswer, setCarerAnswer] = useState<CarerQuestionAnswer>('W');
  const [clinicalIntuition, setClinicalIntuition] = useState<boolean>(false);
  const [clinicalIntuitionLevel, setClinicalIntuitionLevel] = useState<EscalationLevel>('low');
  const [specificConcern] = useState<SpecificConcern>('none');

  const [skipBP, setSkipBP] = useState(false);
  const [skipBPReason, setSkipBPReason] = useState<BloodPressureSkipReason>('not-attempted-no-concern');
  const [skipBPOtherText, setSkipBPOtherText] = useState('');
  const [skipBPOtherScore, setSkipBPOtherScore] = useState<0 | 4>(0);

  const [escalationResult, setEscalationResult] = useState<EscalationDecision | null>(null);

  const scoreBreakdown: ObservationScoreBreakdown | null = useMemo(() => {
    const input: ObservationInput = {
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
      const skip: BloodPressureSkip = {
        reason: skipBPReason,
      };
      if (skipBPReason === 'other') {
        skip.otherText = skipBPOtherText;
        skip.otherScore = skipBPOtherScore;
      }
      input.bloodPressureSkip = skip;
    } else if (obs.systolicBloodPressure !== undefined) {
      input.systolicBloodPressure = obs.systolicBloodPressure;
    }

    try {
      return scoreObservations(input);
    } catch (e) {
      return null;
    }
  }, [obs, skipBP, skipBPReason, skipBPOtherText, skipBPOtherScore]);

  const handleCalculateEscalation = () => {
    if (!scoreBreakdown) return;

    const input: EscalationInput = {
      pewsTotal: scoreBreakdown.total,
      specificConcern,
      carerQuestionAnswer: carerAnswer,
      ...(clinicalIntuition ? { clinicalIntuitionEscalation: clinicalIntuitionLevel } : {}),
    };

    const decision = computeEscalation(input);
    setEscalationResult(decision);
  };

  const updateObs = <K extends keyof ObservationInput>(field: K, value: ObservationInput[K]) => {
    setObs(prev => ({ ...prev, [field]: value }));
  };

  const renderField = (label: string, component: React.ReactNode, score?: ObservationScore) => (
    <div className="form-field">
      <label className="field-label">{label}</label>
      <div className="field-input-wrapper">
        {component}
        {score && <div className="field-score"><ScoreBadge score={score.score} band={score.band} /></div>}
      </div>
    </div>
  );

  return (
    <div className="observation-form">
      <h1 className="form-title">Clinical Observations</h1>
      
      <div className="card">
        {renderField("Age (months)", (
          <input 
            type="number" 
            value={obs.ageMonths ?? ''} 
            onChange={e => updateObs('ageMonths', Number(e.target.value))} 
            placeholder="e.g. 12"
          />
        ), scoreBreakdown ? { score: 0, band: 'white' } : undefined)} 

        {renderField("Respiratory Rate", (
          <input 
            type="number" 
            value={obs.respiratoryRate ?? ''} 
            onChange={e => updateObs('respiratoryRate', Number(e.target.value))} 
          />
        ), scoreBreakdown?.respiratoryRate)}

        {renderField("Respiratory Distress", (
          <select 
            value={obs.respiratoryDistress} 
            onChange={e => updateObs('respiratoryDistress', e.target.value as RespiratoryDistressLevel)}
          >
            {RESPIRATORY_DISTRESS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ), scoreBreakdown?.respiratoryDistress)}

        {renderField("Oxygen Saturation (%)", (
          <input 
            type="number" 
            value={obs.oxygenSaturation ?? ''} 
            onChange={e => updateObs('oxygenSaturation', Number(e.target.value))} 
          />
        ), scoreBreakdown?.oxygenSaturation)}

        {renderField("Oxygen Support Mode", (
          <select 
            value={obs.oxygenSupportMode} 
            onChange={e => updateObs('oxygenSupportMode', e.target.value as OxygenSupportMode)}
          >
            {OXYGEN_SUPPORT_MODE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ), scoreBreakdown?.oxygenSupport)}

        {obs.oxygenSupportMode !== 'air' && renderField("Oxygen Support Value", (
          <input 
            type="number" 
            value={obs.oxygenSupportValue ?? ''} 
            onChange={e => updateObs('oxygenSupportValue', Number(e.target.value))}
            placeholder={obs.oxygenSupportMode === 'percent' ? '%' : 'L/min'}
          />
        ))}

        {renderField("Oxygen Device", (
          <select 
            value={obs.oxygenDevice} 
            onChange={e => updateObs('oxygenDevice', e.target.value as OxygenDeviceCode)}
          >
             <option value="">Select Device</option>
            {OXYGEN_DEVICE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}

        {renderField("Heart Rate", (
          <input 
            type="number" 
            value={obs.heartRate ?? ''} 
            onChange={e => updateObs('heartRate', Number(e.target.value))} 
          />
        ), scoreBreakdown?.heartRate)}

        <div className="form-field checkbox-field">
            <label>
                <input 
                    type="checkbox" 
                    checked={skipBP} 
                    onChange={e => setSkipBP(e.target.checked)} 
                />
                Skip Blood Pressure?
            </label>
        </div>

        {!skipBP ? renderField("Systolic BP", (
          <input 
            type="number" 
            value={obs.systolicBloodPressure ?? ''} 
            onChange={e => updateObs('systolicBloodPressure', Number(e.target.value))} 
          />
        ), scoreBreakdown?.bloodPressure) : (
            <div className="bp-skip-section">
                {renderField("Reason for Skipping", (
                    <select value={skipBPReason} onChange={e => setSkipBPReason(e.target.value as BloodPressureSkipReason)}>
                        {SKIP_BP_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                ), scoreBreakdown?.bloodPressure)}
                
                {skipBPReason === 'other' && (
                    <>
                        {renderField("Other Reason", (
                            <input 
                                type="text" 
                                value={skipBPOtherText} 
                                onChange={e => setSkipBPOtherText(e.target.value)} 
                            />
                        ))}
                        {renderField("Score for Reason", (
                            <select value={skipBPOtherScore} onChange={e => setSkipBPOtherScore(Number(e.target.value) as 0|4)}>
                                <option value={0}>0</option>
                                <option value={4}>4</option>
                            </select>
                        ))}
                    </>
                )}
            </div>
        )}

        {renderField("Capillary Refill (sec)", (
          <input 
            type="number" 
            value={obs.capillaryRefillSeconds ?? ''} 
            onChange={e => updateObs('capillaryRefillSeconds', Number(e.target.value))} 
          />
        ), scoreBreakdown?.capillaryRefill)}

      </div>

      <div className="card">
        <h2 className="section-title">Escalation Factors</h2>
        
        {renderField("Carer Concern", (
          <select value={carerAnswer} onChange={e => setCarerAnswer(e.target.value as CarerQuestionAnswer)}>
            {CARER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}

        <div className="form-field checkbox-field">
            <label>
                <input 
                    type="checkbox" 
                    checked={clinicalIntuition} 
                    onChange={e => setClinicalIntuition(e.target.checked)} 
                />
                Clinical Intuition Override?
            </label>
        </div>

        {clinicalIntuition && renderField("Intuition Level", (
           <select value={clinicalIntuitionLevel} onChange={e => setClinicalIntuitionLevel(e.target.value as EscalationLevel)}>
             {ESCALATION_LEVELS.filter(l => l !== 'none').map(l => <option key={l} value={l}>{l}</option>)}
           </select>
        ))}
      </div>

      <div className="sticky-footer">
        <div className="total-score">
            <span>Total PEWS Score:</span>
            <span className="score-value">{scoreBreakdown?.total ?? '-'}</span>
        </div>
        <button className="calculate-btn" onClick={handleCalculateEscalation}>
            Calculate Escalation
        </button>
      </div>

      {escalationResult && <EscalationBanner decision={escalationResult} />}
    </div>
  );
};
