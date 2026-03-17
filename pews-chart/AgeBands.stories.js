/**
 * NPEWS Chart UI - Age Band Stories
 * 
 * Demonstrates the chart UI for all four age bands with age-specific thresholds.
 * Uses iframe to load the actual chart implementation.
 */

export default {
  title: 'NPEWS/Age Bands',
  parameters: {
    layout: 'fullscreen',
  },
};

// Helper to create iframe loading the chart UI
function createChartFrame(dataFile) {
  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '900px';
  iframe.style.border = 'none';
  iframe.src = `/pews-chart/index.html?data=${dataFile}`;
  return iframe;
}

export const AgeBand_5_12_Years = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div style="padding: 1rem; background: #f3f2f1; border-bottom: 2px solid #0b0c0c;">
        <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem;">Age Band: 5-12 Years</h2>
        <p style="margin: 0; color: #505a5f;">
          Fictional patient "Alex Thompson" (7 years old) showing deterioration from normal (PEWS 0) 
          to emergency (PEWS 13) and partial recovery.
        </p>
      </div>
      <iframe 
        src="/pews-chart/index.html" 
        style="width: 100%; height: 800px; border: none; display: block;"
        title="NPEWS Chart - 5-12 Years">
      </iframe>
    `;
    return container;
  },
};

export const AgeBand_0_11_Months = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div style="padding: 1rem; background: #f3f2f1; border-bottom: 2px solid #0b0c0c;">
        <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem;">Age Band: 0-11 Months</h2>
        <p style="margin: 0; color: #505a5f;">
          Coming soon: Infant age band with age-specific thresholds.
          <br><strong>Note:</strong> Y-axis ranges and scoring bands differ significantly from older age groups.
        </p>
      </div>
      <div style="padding: 2rem; text-align: center; color: #505a5f;">
        <p>Data scenario for 0-11 months age band needs to be created.</p>
        <p>The data model and thresholds are already implemented in data.js.</p>
      </div>
    `;
    return container;
  },
};

export const AgeBand_1_4_Years = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div style="padding: 1rem; background: #f3f2f1; border-bottom: 2px solid #0b0c0c;">
        <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem;">Age Band: 1-4 Years</h2>
        <p style="margin: 0; color: #505a5f;">
          Coming soon: Toddler age band with age-specific thresholds.
        </p>
      </div>
      <div style="padding: 2rem; text-align: center; color: #505a5f;">
        <p>Data scenario for 1-4 years age band needs to be created.</p>
        <p>The data model and thresholds are already implemented in data.js.</p>
      </div>
    `;
    return container;
  },
};

export const AgeBand_13_Plus_Years = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div style="padding: 1rem; background: #f3f2f1; border-bottom: 2px solid #0b0c0c;">
        <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem;">Age Band: ≥13 Years</h2>
        <p style="margin: 0; color: #505a5f;">
          Coming soon: Adolescent age band with age-specific thresholds.
        </p>
      </div>
      <div style="padding: 2rem; text-align: center; color: #505a5f;">
        <p>Data scenario for 13+ years age band needs to be created.</p>
        <p>The data model and thresholds are already implemented in data.js.</p>
      </div>
    `;
    return container;
  },
};
