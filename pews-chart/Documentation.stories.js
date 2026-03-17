/**
 * NPEWS Chart UI - Documentation
 * 
 * Specification references and implementation notes.
 */

export default {
  title: 'NPEWS/Documentation',
  parameters: {
    layout: 'padded',
  },
};

export const Specifications = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <style>
        .docs-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
        }
        .docs-container h1 {
          font-size: 2rem;
          margin: 0 0 1rem 0;
          border-bottom: 3px solid #0b0c0c;
          padding-bottom: 0.5rem;
        }
        .docs-container h2 {
          font-size: 1.5rem;
          margin: 2rem 0 1rem 0;
          color: #1d70b8;
        }
        .docs-container h3 {
          font-size: 1.2rem;
          margin: 1.5rem 0 0.5rem 0;
        }
        .docs-container table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .docs-container th,
        .docs-container td {
          padding: 0.75rem;
          text-align: left;
          border: 1px solid #b1b4b6;
        }
        .docs-container th {
          background: #f3f2f1;
          font-weight: bold;
        }
        .docs-container .spec-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: #1d70b8;
          color: white;
          border-radius: 3px;
          font-size: 0.875rem;
          margin-right: 0.5rem;
        }
        .docs-container .age-band {
          padding: 0.5rem;
          margin: 0.5rem 0;
          border-left: 4px solid #ffdd00;
          background: #f8f8f8;
        }
        .docs-container code {
          background: #f3f2f1;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
      </style>
      
      <div class="docs-container">
        <h1>NHS NPEWS Chart UI - Specifications</h1>
        
        <h2>Age Bands</h2>
        <p>
          The NPEWS system uses four age-specific charts, each with different physiological thresholds
          and scoring bands. The age bands are:
        </p>
        
        <div class="age-band" style="border-left-color: #FFB6C1;">
          <strong>0-11 months (Infant)</strong> - Pink header banner
          <br>Reference: <code>pews-observation-and-escalation-chart-0-11-months-updated.pdf</code>
        </div>
        
        <div class="age-band" style="border-left-color: #FFA500;">
          <strong>1-4 years (Toddler)</strong> - Orange header banner
          <br>Reference: <code>pews-observation-and-escalation-chart-1-4-years-updated.pdf</code>
        </div>
        
        <div class="age-band" style="border-left-color: #FFFF00;">
          <strong>5-12 years (Child)</strong> - Yellow header banner
          <br>Reference: <code>pews-observation-and-escalation-chart-5-12-years-updated.pdf</code>
        </div>
        
        <div class="age-band" style="border-left-color: #A9A9A9;">
          <strong>≥13 years (Adolescent)</strong> - Grey header banner
          <br>Reference: <code>pews-observation-and-escalation-chart-13-years-updated.pdf</code>
        </div>
        
        <h2>Escalation Levels</h2>
        <table>
          <thead>
            <tr>
              <th>Level</th>
              <th>PEWS Score</th>
              <th>Action Required</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="spec-badge" style="background: #1d70b8;">LOW</span></td>
              <td>1-4</td>
              <td>Reassess within 60 minutes. Inform Nurse in Charge.</td>
            </tr>
            <tr>
              <td><span class="spec-badge" style="background: #ffdd00; color: #0b0c0c;">MEDIUM</span></td>
              <td>5-8</td>
              <td>Medical review within 30 minutes. Continuous SpO2 monitoring.</td>
            </tr>
            <tr>
              <td><span class="spec-badge" style="background: #f47738;">HIGH</span></td>
              <td>9-12</td>
              <td>Rapid Review within 15 minutes. Call Nurse in Charge immediately.</td>
            </tr>
            <tr>
              <td><span class="spec-badge" style="background: #d4351c;">EMERGENCY</span></td>
              <td>13+</td>
              <td>Call 2222 immediately: "Paediatric Medical Emergency". Inform consultant urgently.</td>
            </tr>
          </tbody>
        </table>
        
        <h2>Layout Modes</h2>
        <p>Three responsive layout modes adapt the chart for different screen sizes and use cases:</p>
        <ul>
          <li><strong>Landscape</strong> (>1200px): Full-width display, taller charts (180px)</li>
          <li><strong>Portrait</strong> (768-1199px): Narrower display, shorter charts (140px)</li>
          <li><strong>Mobile</strong> (<768px): Minimal chrome, shortest charts (100px)</li>
        </ul>
        
        <h2>Key Parameters</h2>
        <p>Six physiological parameters are tracked on the observation chart:</p>
        <ol>
          <li><strong>Respiratory Rate</strong> - breaths per minute (age-specific ranges)</li>
          <li><strong>Heart Rate</strong> - beats per minute (age-specific ranges)</li>
          <li><strong>Blood Pressure (Systolic)</strong> - mmHg (age-specific ranges)</li>
          <li><strong>Oxygen Saturation (SpO2)</strong> - percentage (80-100%)</li>
          <li><strong>Temperature</strong> - degrees Celsius (35-41°C)</li>
          <li><strong>Oxygen Delivery</strong> - percentage or L/min (0-100 or 0-20)</li>
        </ol>
        
        <h2>Scoring Bands</h2>
        <p>Each parameter has age-specific scoring bands shown as colored horizontal zones:</p>
        <ul>
          <li><strong style="color: #e8829a;">Pink</strong> - Score 4 (most concerning)</li>
          <li><strong style="color: #f5ac78;">Orange</strong> - Score 2 (concerning)</li>
          <li><strong style="color: #f5e96e;">Yellow</strong> - Score 1 (mild concern)</li>
          <li><strong>White</strong> - Score 0 (normal range)</li>
        </ul>
        
        <h2>Implementation Files</h2>
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>data.js</code></td>
              <td>Patient data, observations, age band configurations, scoring thresholds</td>
            </tr>
            <tr>
              <td><code>chart.js</code></td>
              <td>Chart rendering engine, scoring calculation, interactivity</td>
            </tr>
            <tr>
              <td><code>styles.css</code></td>
              <td>Design tokens, band colors, responsive layout styles</td>
            </tr>
            <tr>
              <td><code>index.html</code></td>
              <td>Page structure, patient header, toolbar, chart container</td>
            </tr>
          </tbody>
        </table>
        
        <h2>Reference Materials</h2>
        <ul>
          <li><code>spec/spot-npews-ui-spec.md</code> - Full UI requirements specification</li>
          <li><code>spec/npews-scoring.md</code> - Scoring thresholds per age band</li>
          <li><code>spec/escalation.md</code> - Escalation levels and clinical guidance</li>
          <li><code>reference-sources/*.pdf</code> - Official NHS NPEWS charts (all age bands)</li>
          <li><code>apps/chart-ui/README.md</code> - Data model documentation</li>
        </ul>
      </div>
    `;
    return container;
  },
};

export const DataModel = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <style>
        .docs-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
        }
        .docs-container h1 {
          font-size: 2rem;
          margin: 0 0 1rem 0;
          border-bottom: 3px solid #0b0c0c;
          padding-bottom: 0.5rem;
        }
        .docs-container h2 {
          font-size: 1.5rem;
          margin: 2rem 0 1rem 0;
          color: #1d70b8;
        }
        .docs-container pre {
          background: #f3f2f1;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.9rem;
        }
        .docs-container code {
          font-family: 'Courier New', monospace;
        }
        .docs-container .note {
          background: #fffbea;
          border-left: 4px solid #ffdd00;
          padding: 1rem;
          margin: 1rem 0;
        }
      </style>
      
      <div class="docs-container">
        <h1>Data Model</h1>
        
        <h2>Patient Object</h2>
        <pre><code>{
  name: "Patient Name",
  dob: "2017-03-14",
  age: "7 years",
  ageBracket: "5-12",
  ageBand: "5-12y",  // NEW: Required for age-specific thresholds
  nhsNumber: "123 456 7890",
  ward: "Paediatric Ward B",
  bed: "12",
  consultant: "Dr S. Patel",
  admittedAt: "2025-01-10T08:00:00"
}</code></pre>

        <div class="note">
          <strong>⚠️ Key Addition:</strong> The <code>ageBand</code> field controls which age-specific 
          thresholds and Y-axis ranges are used. Valid values: <code>"0-11m"</code>, <code>"1-4y"</code>, 
          <code>"5-12y"</code>, <code>"13+y"</code>
        </div>
        
        <h2>Observation Object</h2>
        <pre><code>{
  id: "obs-1",
  timestamp: "2025-01-10T08:00:00",
  respiratoryRate: 22,
  respiratoryDistress: "none",  // none | mild | moderate | severe
  oxygenSaturation: 98,
  oxygenDevice: "air",          // air | NP | FM | HFO | CPAP | etc
  oxygenDelivery: null,         // null or { value: 24, unit: "%" } or { value: 6, unit: "L/min" }
  heartRate: 95,
  bloodPressureSystolic: 100,
  bloodPressureDiastolic: 65,
  capillaryRefill: 2,
  avpu: "A",                    // A | V | P | U
  temperature: 37.1,
  pewsTotal: 0,                 // calculated or provided
  escalationLevel: null         // null | "low" | "medium" | "high" | "emergency"
}</code></pre>

        <h2>Age Band Configuration</h2>
        <pre><code>AGE_BANDS = {
  "5-12y": {
    label: "5-12 Years",
    headerColor: "#FFFF00",  // yellow banner
    chartConfig: {
      respiratoryRate: { yMin: 0, yMax: 60, step: 10 },
      heartRate: { yMin: 40, yMax: 180, step: 20 },
      // ... other parameters
    },
    scoringBands: {
      respiratoryRate: [
        { min: 0, max: 9.99, score: 4, color: "pink" },
        { min: 10, max: 14.99, score: 2, color: "orange" },
        // ... other bands
      ],
      // ... other parameters
    }
  },
  // ... other age bands
}</code></pre>
        
        <h2>Skipped Observations</h2>
        <p>When a parameter cannot be measured, set its value to <code>null</code> and optionally provide a skip reason:</p>
        <pre><code>{
  id: "obs-3",
  timestamp: "2025-01-10T10:00:00",
  bloodPressureSystolic: null,
  bloodPressureSystolic_skipReason: "unable",
  // ... other parameters
}</code></pre>
        
        <h2>Oxygen Delivery Modality Changes</h2>
        <p>When oxygen delivery changes unit (% to L/min or vice versa), the chart automatically breaks the trend line:</p>
        <pre><code>// Observation 1: nasal prongs at 24%
{
  oxygenDevice: "NP",
  oxygenDelivery: { value: 24, unit: "%" }
}

// Observation 2: face mask at 6 L/min (line break occurs automatically)
{
  oxygenDevice: "FM",
  oxygenDelivery: { value: 6, unit: "L/min" }
}</code></pre>
      </div>
    `;
    return container;
  },
};
