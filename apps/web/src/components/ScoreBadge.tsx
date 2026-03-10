import React from 'react';
import { ScoreBand } from '@digital-pews/types';

interface ScoreBadgeProps {
  score: number;
  band: ScoreBand;
}

const bandColors: Record<ScoreBand, string> = {
  white: '#FFFFFF',
  yellow: '#FFD700',
  orange: '#FF8C00',
  pink: '#FF1493',
};

const bandTextColors: Record<ScoreBand, string> = {
  white: '#000000',
  yellow: '#000000',
  orange: '#000000',
  pink: '#FFFFFF',
};

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, band }) => {
  return (
    <div
      style={{
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
      }}
    >
      {score}
    </div>
  );
};
