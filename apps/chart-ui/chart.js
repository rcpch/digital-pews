/* ============================================================
   NPEWS Chart Engine - chart.js
   Plain JS, no build step, no dependencies.

   Responsibilities:
   - Render band-box backgrounds on canvas
   - Plot observation dots at exact y positions within bands (U3.14)
   - Draw trend lines between consecutive non-skipped observations (U3.13)
   - Break lines at skipped observations (U3.10) and O2 modality changes (U9.7)
   - Y-axis: highest value at top, lowest at bottom (U3.7)
   - Show exact values on hover (U3.5 / U3.6)
   - Zoom in/out (U3.1) and quick-range buttons (U3.3)
   - Jump to present (U3.12)
   - Colour-blind mode (U1.1)
   ============================================================ */

// ---- Colour helpers ----------------------------------------

function getBandColour(bandName) {
  const s = getComputedStyle(document.documentElement);
  return {
    white:  s.getPropertyValue('--band-white').trim()  || '#ffffff',
    yellow: s.getPropertyValue('--band-yellow').trim() || '#ffdd00',
    orange: s.getPropertyValue('--band-orange').trim() || '#f47738',
    pink:   s.getPropertyValue('--band-pink').trim()   || '#e5007d',
  }[bandName] || '#ffffff';
}

// Returns CSS var resolved value
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// ---- Time helpers ------------------------------------------

function parseTs(ts) { return new Date(ts).getTime(); }

function fmtTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function fmtDateTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ---- Y-axis math -------------------------------------------

// Map a value to a pixel y position.
// yMin = bottom of chart, yMax = top of chart (highest value at top per U3.7)
function valueToY(value, yMin, yMax, chartHeight, paddingTop, paddingBottom) {
  const drawH = chartHeight - paddingTop - paddingBottom;
  const frac = (value - yMin) / (yMax - yMin);        // 0 = bottom, 1 = top
  return paddingTop + drawH * (1 - frac);              // canvas y is inverted
}

// ---- Band box drawing --------------------------------------

function drawBands(ctx, bands, yMin, yMax, x0, x1, chartHeight, padTop, padBot) {
  bands.forEach(band => {
    const bandMin = Math.max(band.min, yMin);
    const bandMax = Math.min(band.max, yMax);
    if (bandMin >= bandMax) return;

    const yTop = valueToY(bandMax, yMin, yMax, chartHeight, padTop, padBot);
    const yBot = valueToY(bandMin, yMin, yMax, chartHeight, padTop, padBot);

    ctx.fillStyle = getBandColour(band.color);
    ctx.fillRect(x0, yTop, x1 - x0, yBot - yTop);

    // Faint band border
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x0, yTop, x1 - x0, yBot - yTop);
  });
}

// ---- Grid lines & y-axis labels ----------------------------

function drawYAxis(ctx, yMin, yMax, step, chartHeight, padTop, padBot, padLeft, padRight, rightLabels) {
  ctx.save();
  ctx.font = '11px -apple-system, sans-serif';
  ctx.fillStyle = '#505a5f';
  ctx.textBaseline = 'middle';

  // Draw finer grid lines at every integer value (lighter)
  for (let v = Math.ceil(yMin); v <= yMax; v++) {
    const y = valueToY(v, yMin, yMax, chartHeight, padTop, padBot);
    ctx.strokeStyle = 'rgba(0,0,0,0.05)'; // very light grey
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(ctx.canvas.width - padRight, y);
    ctx.stroke();
  }

  // Draw labeled ticks at step intervals (darker)
  ctx.textAlign = 'right';
  for (let v = yMin; v <= yMax; v += step) {
    const y = valueToY(v, yMin, yMax, chartHeight, padTop, padBot);
    // Darker grid line for labeled ticks
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(ctx.canvas.width - padRight, y);
    ctx.stroke();
    // Left label - positioned further left to be clearly outside chart area
    ctx.fillText(String(v), padLeft - 8, y);
  }
  
  // Draw right-side labels if provided
  if (rightLabels && rightLabels.length > 0) {
    ctx.textAlign = 'left';
    rightLabels.forEach(labelConfig => {
      const y = valueToY(labelConfig.value, yMin, yMax, chartHeight, padTop, padBot);
      ctx.fillText(labelConfig.label, ctx.canvas.width - padRight + 8, y);
    });
  }
  
  ctx.restore();
}

// ---- X-axis (time) labels ----------------------------------

function drawXAxis(ctx, timestamps, xPositions, chartHeight, padTop, padBot, padLeft) {
  ctx.save();
  ctx.font = '11px -apple-system, sans-serif';
  ctx.fillStyle = '#505a5f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  // Draw prominent vertical grid lines at each observation time
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';  // More visible than horizontal grid lines
  ctx.lineWidth = 1;

  timestamps.forEach((ts, i) => {
    const x = xPositions[i];
    // Vertical grid line extending through entire chart
    ctx.beginPath();
    ctx.moveTo(x, padTop);
    ctx.lineTo(x, chartHeight - padBot);
    ctx.stroke();
    // Label
    ctx.fillText(fmtTime(ts), x, chartHeight - padBot + 4);
  });
  ctx.restore();
}

// ---- Skip marker (dashed vertical line) --------------------

function drawSkipMarker(ctx, x, padTop, chartHeight, padBot) {
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#b1b4b6';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, padTop);
  ctx.lineTo(x, chartHeight - padBot);
  ctx.stroke();
  ctx.restore();
}

// ---- Trend line & dots -------------------------------------

// segments: array of arrays of {x, y} points. Each sub-array is a continuous segment.
function drawTrendLine(ctx, segments) {
  ctx.save();
  ctx.strokeStyle = cssVar('--chart-line') || '#0b0c0c';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.setLineDash([]);

  segments.forEach(seg => {
    if (seg.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(seg[0].x, seg[0].y);
    for (let i = 1; i < seg.length; i++) {
      ctx.lineTo(seg[i].x, seg[i].y);
    }
    ctx.stroke();
  });
  ctx.restore();
}

function drawDots(ctx, points) {
  // points: [{x, y, skipped}]
  points.forEach(p => {
    if (p.skipped) return;
    ctx.save();
    ctx.fillStyle = cssVar('--chart-dot') || '#0b0c0c';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
}

// ---- Blood pressure special rendering (U11.5) --------------
// Draws inward-pointing triangles (systolic above, diastolic below) with vertical join line

function drawBPPoints(ctx, bpPoints) {
  // bpPoints: [{x, ySys, yDia}]
  bpPoints.forEach(p => {
    ctx.save();
    const arrowSize = 6;
    ctx.strokeStyle = cssVar('--chart-line') || '#0b0c0c';
    ctx.fillStyle   = cssVar('--chart-line') || '#0b0c0c';
    ctx.lineWidth = 2;

    // Vertical join line
    ctx.beginPath();
    ctx.moveTo(p.x, p.ySys);
    ctx.lineTo(p.x, p.yDia);
    ctx.stroke();

    // Systolic: inward-pointing triangle (pointing down = towards centre)
    ctx.beginPath();
    ctx.moveTo(p.x, p.ySys + arrowSize);
    ctx.lineTo(p.x - arrowSize, p.ySys - arrowSize / 2);
    ctx.lineTo(p.x + arrowSize, p.ySys - arrowSize / 2);
    ctx.closePath();
    ctx.fill();

    // Diastolic: inward-pointing triangle (pointing up = towards centre)
    ctx.beginPath();
    ctx.moveTo(p.x, p.yDia - arrowSize);
    ctx.lineTo(p.x - arrowSize, p.yDia + arrowSize / 2);
    ctx.lineTo(p.x + arrowSize, p.yDia + arrowSize / 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  });
}

// ---- Value labels (always visible per U3.5) ----------------

function drawValueLabels(ctx, points, unit) {
  ctx.save();
  ctx.font = 'bold 10px -apple-system, sans-serif';
  ctx.fillStyle = '#0b0c0c';
  ctx.textAlign = 'center';

  points.forEach(p => {
    if (p.skipped || p.value == null) return;
    const label = unit === '°C' ? p.value.toFixed(1) : String(p.value);
    // Draw small white box behind label
    const metrics = ctx.measureText(label);
    const lw = metrics.width + 4;
    const lh = 13;
    const lx = p.x - lw / 2;
    const ly = p.y - 18;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(lx, ly, lw, lh);
    ctx.fillStyle = '#0b0c0c';
    ctx.fillText(label, p.x, ly + 10);
  });
  ctx.restore();
}

// ---- Main chart render function ----------------------------

/**
 * renderChart(canvas, config)
 *
 * config: {
 *   observations: OBSERVATIONS array (from data.js)
 *   field: string - which field to chart (e.g. 'respiratoryRate')
 *   bands: array of band objects from SCORING_BANDS
 *   yMin, yMax, step: axis range
 *   unit: string for label
 *   viewStart: timestamp ms - left edge
 *   viewEnd:   timestamp ms - right edge
 *   showValues: bool
 *   bpMode: bool - if true, use BP special rendering
 *   isO2Delivery: bool - handle % / L/min modality breaks
 *   rightLabels: array - optional right Y-axis labels [{value, label}, ...]
 * }
 */
function renderChart(canvas, config) {
  const {
    observations, field, bands, yMin, yMax, step, unit,
    viewStart, viewEnd, showValues, bpMode, isO2Delivery,
  } = config;

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 800;
  const H = canvas.offsetHeight || 140;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const PAD_LEFT   = 55;  // Increased from 38 to position Y-axis labels clearly outside
  const PAD_RIGHT  = config.rightLabels ? 50 : 12;  // More space if right labels present
  const PAD_TOP    = 10;
  const PAD_BOTTOM = 28;

  const drawW = W - PAD_LEFT - PAD_RIGHT;

  // Filter and sort observations within view window
  const inView = observations.filter(o => {
    const t = parseTs(o.timestamp);
    return t >= viewStart && t <= viewEnd;
  });

  if (inView.length === 0) {
    ctx.fillStyle = '#505a5f';
    ctx.font = '12px sans-serif';
    ctx.fillText('No observations in range', PAD_LEFT + 8, H / 2);
    return;
  }

  // X positions
  const range = viewEnd - viewStart;
  function tsToX(ts) {
    return PAD_LEFT + ((parseTs(ts) - viewStart) / range) * drawW;
  }

  // Draw band backgrounds
  drawBands(ctx, bands, yMin, yMax, PAD_LEFT, W - PAD_RIGHT, H, PAD_TOP, PAD_BOTTOM);

  // Grid + y-axis
  drawYAxis(ctx, yMin, yMax, step, H, PAD_TOP, PAD_BOTTOM, PAD_LEFT, PAD_RIGHT, config.rightLabels);

  // X axis ticks
  const xPositions = inView.map(o => tsToX(o.timestamp));
  drawXAxis(ctx, inView.map(o => o.timestamp), xPositions, H, PAD_TOP, PAD_BOTTOM, PAD_LEFT);

  if (bpMode) {
    // Blood pressure: no horizontal trend lines (U11.7), draw inward arrows
    const bpPoints = [];
    inView.forEach(o => {
      const sys = o[field];        // bloodPressureSystolic
      const dia = o.bloodPressureDiastolic;
      if (sys == null || dia == null) {
        drawSkipMarker(ctx, tsToX(o.timestamp), PAD_TOP, H, PAD_BOTTOM);
        return;
      }
      bpPoints.push({
        x:    tsToX(o.timestamp),
        ySys: valueToY(sys, yMin, yMax, H, PAD_TOP, PAD_BOTTOM),
        yDia: valueToY(dia, yMin, yMax, H, PAD_TOP, PAD_BOTTOM),
      });
    });
    drawBPPoints(ctx, bpPoints);
    return;
  }

  if (isO2Delivery) {
    // Group into segments, breaking on modality change (U9.7) or skip
    const segments = [];
    let current = [];

    inView.forEach(o => {
      const delivery = o.oxygenDelivery;
      const x = tsToX(o.timestamp);

      if (delivery == null) {
        if (current.length) segments.push(current);
        current = [];
        drawSkipMarker(ctx, x, PAD_TOP, H, PAD_BOTTOM);
        return;
      }

      // Normalise value to a common scale for charting.
      // We plot both % and L/min on the same axis (0-100 range).
      // L/min values are scaled up by *5 so 20 L/min ~ 100% visually - this is a
      // purely display approximation since the two units aren't directly comparable.
      // A break in the line signals the modality change.
      const prevO2 = current.length > 0 ? inView[inView.indexOf(o) - 1]?.oxygenDelivery : null;
      if (prevO2 && prevO2.unit !== delivery.unit) {
        // Modality change - break the line
        if (current.length) segments.push(current);
        current = [];
      }

      const displayVal = delivery.unit === 'L/min' ? delivery.value * 5 : delivery.value;
      current.push({ x, y: valueToY(displayVal, yMin, yMax, H, PAD_TOP, PAD_BOTTOM), value: delivery.value, unit: delivery.unit });
    });
    if (current.length) segments.push(current);

    drawTrendLine(ctx, segments);
    segments.flat().forEach(p => {
      ctx.save();
      ctx.fillStyle = cssVar('--chart-dot') || '#0b0c0c';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    if (showValues) {
      ctx.save();
      ctx.font = 'bold 10px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      segments.flat().forEach(p => {
        const label = `${p.value}${p.unit === 'L/min' ? 'L' : '%'}`;
        const metrics = ctx.measureText(label);
        const lw = metrics.width + 4;
        const lh = 13;
        const lx = p.x - lw / 2;
        const ly = p.y - 18;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillRect(lx, ly, lw, lh);
        ctx.fillStyle = '#0b0c0c';
        ctx.fillText(label, p.x, ly + 10);
      });
      ctx.restore();
    }
    return;
  }

  // Standard numeric chart
  const segments = [];
  let current = [];
  const allPoints = [];

  inView.forEach(o => {
    const value = o[field];
    const x = tsToX(o.timestamp);

    if (value == null) {
      if (current.length) { segments.push(current); current = []; }
      allPoints.push({ x, y: 0, skipped: true, value: null });
      drawSkipMarker(ctx, x, PAD_TOP, H, PAD_BOTTOM);
      return;
    }

    const y = valueToY(value, yMin, yMax, H, PAD_TOP, PAD_BOTTOM);
    current.push({ x, y });
    allPoints.push({ x, y, skipped: false, value });
  });
  if (current.length) segments.push(current);

  drawTrendLine(ctx, segments);
  drawDots(ctx, allPoints);
  if (showValues) drawValueLabels(ctx, allPoints, unit);
}

// ---- State & view controls ---------------------------------

let viewState = {
  // ms timestamps for visible window
  start: null,
  end:   null,
  showValues: true,
};

// ---- Layout helpers ----------------------------------------

const LAYOUT_CHART_HEIGHTS = {
  landscape: 140,
  portrait:   90,
  mobile:     70,
};

function getLayout() {
  return document.body.dataset.layout || 'landscape';
}

function getChartHeight() {
  return LAYOUT_CHART_HEIGHTS[getLayout()] ?? 140;
}

function computeDefaultView(observations) {
  // Default: show last 6 hours of data or all if less (U3.2)
  const times = observations.map(o => parseTs(o.timestamp));
  const first = Math.min(...times);
  const last  = Math.max(...times);
  const sixH = 6 * 60 * 60 * 1000;
  return {
    start: Math.max(first, last - sixH),
    end:   last + 30 * 60 * 1000, // 30 min padding on right
  };
}

function applyQuickRange(range, observations) {
  const now = Math.max(...observations.map(o => parseTs(o.timestamp)));
  const day  = 24 * 60 * 60 * 1000;
  switch (range) {
    case 'today':
      const todayStart = new Date(now);
      todayStart.setHours(0,0,0,0);
      viewState.start = todayStart.getTime();
      viewState.end   = now + 30 * 60 * 1000;
      break;
    case 'week':
      viewState.start = now - 7 * day;
      viewState.end   = now + 30 * 60 * 1000;
      break;
    case 'month':
      viewState.start = now - 30 * day;
      viewState.end   = now + 30 * 60 * 1000;
      break;
    case 'present':
    default:
      const def = computeDefaultView(observations);
      viewState.start = def.start;
      viewState.end   = def.end;
  }
}

function zoomIn(observations) {
  const mid = (viewState.start + viewState.end) / 2;
  const half = (viewState.end - viewState.start) / 2;
  const newHalf = Math.max(half * 0.6, 30 * 60 * 1000); // min 30 mins
  viewState.start = mid - newHalf;
  viewState.end   = mid + newHalf;
}

function zoomOut(observations) {
  const mid = (viewState.start + viewState.end) / 2;
  const half = (viewState.end - viewState.start) / 2;
  const newHalf = Math.min(half * 1.5, 90 * 24 * 60 * 60 * 1000); // max 90 days
  viewState.start = mid - newHalf;
  viewState.end   = mid + newHalf;
}

// ---- Chart panel definitions --------------------------------

function getChartDefs() {
  const cfg = CHART_CONFIG;
  return [
    {
      id:    'respiratoryRate',
      title: 'Respiratory Rate',
      unit:  cfg.respiratoryRate.unit,
      field: 'respiratoryRate',
      bands: SCORING_BANDS.respiratoryRate,
      yMin: cfg.respiratoryRate.yMin,
      yMax: cfg.respiratoryRate.yMax,
      step: cfg.respiratoryRate.step,
    },
    {
      id:    'heartRate',
      title: 'Heart Rate',
      unit:  cfg.heartRate.unit,
      field: 'heartRate',
      bands: SCORING_BANDS.heartRate,
      yMin: cfg.heartRate.yMin,
      yMax: cfg.heartRate.yMax,
      step: cfg.heartRate.step,
    },
    {
      id:    'oxygenSaturation',
      title: 'O\u2082 Saturation',
      unit:  cfg.oxygenSaturation.unit,
      field: 'oxygenSaturation',
      bands: SCORING_BANDS.oxygenSaturation,
      yMin: cfg.oxygenSaturation.yMin,
      yMax: cfg.oxygenSaturation.yMax,
      step: cfg.oxygenSaturation.step,
    },
    {
      id:    'oxygenDelivery',
      title: 'O\u2082 Delivery / Respiratory Support',
      unit:  cfg.oxygenDelivery.unit,
      field: 'oxygenDelivery',
      bands: SCORING_BANDS.oxygenDeliveryPercent,
      yMin: cfg.oxygenDelivery.yMin,
      yMax: cfg.oxygenDelivery.yMax,
      step: cfg.oxygenDelivery.step,
      isO2Delivery: true,
      // Left axis = FiO2 %. Right axis = L/min equivalent positions with device labels.
      // L/min values are mapped to the display axis via *5 multiplier (same as plotting).
      rightLabels: [
        { value: 100, label: '20 L' },
        { value: 75,  label: '15 L' },
        { value: 50,  label: '10 L' },
        { value: 40,  label: '8 L'  },
        { value: 25,  label: '5 L'  },
        { value: 10,  label: '2 L'  },
        { value: 5,   label: '1 L'  },
      ],
    },
    {
      id:    'bloodPressure',
      title: 'Blood Pressure',
      unit:  'mmHg (sys / dia)',
      field: 'bloodPressureSystolic',
      bands: SCORING_BANDS.bloodPressureSystolic,
      yMin: cfg.bloodPressureSystolic.yMin,
      yMax: cfg.bloodPressureSystolic.yMax,
      step: cfg.bloodPressureSystolic.step,
      bpMode: true,
    },
    {
      id:    'temperature',
      title: 'Temperature',
      unit:  cfg.temperature.unit,
      field: 'temperature',
      bands: SCORING_BANDS.temperature,
      yMin: cfg.temperature.yMin,
      yMax: cfg.temperature.yMax,
      step: cfg.temperature.step,
    },
  ];
}

// ---- DOM building & wiring ---------------------------------

function buildParameterSidebar(container) {
  // Sidebar content derived from the NHS NPEWS PDF reference charts.
  // Each entry aligns with one chart panel row (same order as getChartDefs).
  const sidebarDefs = [
    {
      title: 'Respiratory Rate',
      unit: 'breaths/min',
      description: 'Count chest movements for 60 seconds',
      extra: null,
    },
    {
      title: 'Heart Rate',
      unit: 'bpm',
      description: 'Record pulse rate beats per minute',
      extra: null,
    },
    {
      title: 'O\u2082 Saturation',
      unit: 'SpO\u2082 %',
      description: 'Peripheral oxygen saturation. Record probe site.',
      extra: '\u2265 95% = Normal | 92\u201394% = Low concern | \u2264 91% = High concern',
    },
    {
      title: 'O\u2082 Delivery',
      unit: 'FiO\u2082 % / L/min',
      description: 'Device codes: HF = High Flow \u2022 BiPAP/CPAP \u2022 NP = Nasal Prongs \u2022 FM = Face Mask \u2022 HB = Head Box \u2022 NMR = Non-rebreather',
      extra: 'Left axis = FiO\u2082 %. Right axis = L/min flow rate.',
    },
    {
      title: 'Blood Pressure',
      unit: 'mmHg',
      description: 'Record position: LA = Left Arm \u2022 RA = Right Arm \u2022 LL = Left Leg \u2022 RL = Right Leg',
      extra: 'Derogation code if not attempted (NC = No Concern). \u25be = Systolic \u25b4 = Diastolic',
    },
    {
      title: 'Temperature',
      unit: '\u00b0C',
      description: 'Record route: Tympanic \u2022 Axillary \u2022 Rectal',
      extra: null,
    },
  ];

  sidebarDefs.forEach(def => {
    const item = document.createElement('div');
    item.className = 'parameter-sidebar__item';

    let html = `<div class="parameter-sidebar__title">${def.title}</div>`;
    html += `<div class="parameter-sidebar__unit">${def.unit}</div>`;
    html += `<div class="parameter-sidebar__description">${def.description}</div>`;
    if (def.extra) {
      html += `<div class="parameter-sidebar__codes">${def.extra}</div>`;
    }

    item.innerHTML = html;
    container.appendChild(item);
  });
}

function buildChartPanels(container) {
  const defs = getChartDefs();
  const panels = {};
  defs.forEach(def => {
    const panel = document.createElement('div');
    panel.className = 'chart-panel';
    panel.innerHTML = `
      <div class="chart-panel__body">
        <canvas class="chart-canvas" id="canvas-${def.id}" style="width:100%;height:${getChartHeight()}px;"></canvas>
        <div class="obs-tooltip" id="tip-${def.id}"></div>
      </div>
    `;
    container.appendChild(panel);
    panels[def.id] = panel;
  });
  return panels;
}

function renderAll() {
  const defs = getChartDefs();
  const h = getChartHeight();
  defs.forEach(def => {
    const canvas = document.getElementById(`canvas-${def.id}`);
    if (!canvas) return;
    // Sync canvas CSS height to current layout before drawing
    canvas.style.height = `${h}px`;
    renderChart(canvas, {
      observations: OBSERVATIONS,
      field:        def.field,
      bands:        def.bands,
      yMin:         def.yMin,
      yMax:         def.yMax,
      step:         def.step,
      unit:         def.unit,
      viewStart:    viewState.start,
      viewEnd:      viewState.end,
      showValues:   viewState.showValues,
      bpMode:       def.bpMode || false,
      isO2Delivery: def.isO2Delivery || false,
      rightLabels:  def.rightLabels || null,
    });
  });
}

// ---- PEWS score row ----------------------------------------

function buildPewsRow(container) {
  const panel = document.createElement('div');
  panel.className = 'pews-row';
  panel.id = 'pews-row';

  const header = document.createElement('div');
  header.className = 'pews-row__header';
  header.textContent = 'PEWS Total Score';
  panel.appendChild(header);

  const scores = document.createElement('div');
  scores.className = 'pews-row__scores';
  scores.id = 'pews-scores';
  panel.appendChild(scores);
  container.appendChild(panel);
}

function renderPewsRow() {
  const container = document.getElementById('pews-scores');
  if (!container) return;
  container.innerHTML = '';
  OBSERVATIONS.forEach(o => {
    const t = parseTs(o.timestamp);
    if (t < viewState.start || t > viewState.end) return;
    const cell = document.createElement('div');
    const level = o.escalationLevel || (o.pewsTotal === 0 ? null : 'low');
    cell.className = `pews-score-cell${level ? ` pews-score-cell--${level}` : ''}`;
    cell.innerHTML = `
      <div class="pews-score-cell__time">${fmtTime(o.timestamp)}</div>
      <div class="pews-score-cell__value">${o.pewsTotal}</div>
    `;
    container.appendChild(cell);
  });
}

// ---- Escalation banner -------------------------------------

function renderEscalationBanner() {
  const banner = document.getElementById('escalation-banner');
  if (!banner) return;

  // Always use the globally latest observation - zoom must not affect PEWS score display
  if (OBSERVATIONS.length === 0) { banner.style.display = 'none'; return; }

  const latest = OBSERVATIONS[OBSERVATIONS.length - 1];
  if (!latest.escalationLevel) { banner.style.display = 'none'; return; }

  const meta = ESCALATION_META[latest.escalationLevel];
  banner.style.display = 'flex';
  banner.className = `escalation-banner escalation-banner--${latest.escalationLevel}`;
  banner.innerHTML = `
    <span class="escalation-banner__level">${meta.label}</span>
    <span class="escalation-banner__score">PEWS ${latest.pewsTotal}</span>
    <span class="escalation-banner__action">${meta.action}</span>
  `;
}

// ---- Sticky footer -----------------------------------------

function renderFooter() {
  const footer = document.getElementById('sticky-footer');
  if (!footer) return;

  const latest = OBSERVATIONS[OBSERVATIONS.length - 1];
  const level  = latest.escalationLevel;
  const meta   = level ? ESCALATION_META[level] : null;

  footer.innerHTML = `
    <div class="sticky-footer__inner">
      <span class="sticky-footer__score-label">Latest PEWS</span>
      <span class="sticky-footer__score">${latest.pewsTotal}</span>
      ${meta ? `<span class="sticky-footer__escalation sticky-footer__escalation--${level}">${meta.label}</span>` : ''}
      <span class="sticky-footer__time">${fmtDateTime(latest.timestamp)}</span>
      ${level === 'emergency' || level === 'high'
        ? `<button class="sticky-footer__action-btn" onclick="alert('Escalation action triggered')">Escalate Now</button>`
        : ''}
    </div>
  `;
}

// ---- Hover tooltip -----------------------------------------

function attachTooltip(canvasId, field, unit, bpMode, isO2Delivery) {
  const canvas = document.getElementById(canvasId);
  const tip    = document.getElementById(`tip-${canvasId.replace('canvas-', '')}`);
  if (!canvas || !tip) return;

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Find nearest observation in view
    const inView = OBSERVATIONS.filter(o => {
      const t = parseTs(o.timestamp);
      return t >= viewState.start && t <= viewState.end;
    });
    if (!inView.length) return;

    const range = viewState.end - viewState.start;
    const PAD_LEFT = 55;  // Match renderChart padding
    const drawW    = canvas.offsetWidth - PAD_LEFT - 12;

    let nearest = null;
    let nearestDist = Infinity;
    inView.forEach(o => {
      const x = PAD_LEFT + ((parseTs(o.timestamp) - viewState.start) / range) * drawW;
      const d = Math.abs(x - mouseX);
      if (d < nearestDist) { nearestDist = d; nearest = o; }
    });

    if (!nearest || nearestDist > 30) { tip.style.display = 'none'; return; }

    let label = '';
    if (bpMode) {
      const sys = nearest[field];
      const dia = nearest.bloodPressureDiastolic;
      label = (sys != null && dia != null) ? `${sys}/${dia} mmHg` : 'Skipped';
    } else if (isO2Delivery) {
      const d = nearest.oxygenDelivery;
      label = d ? `${d.value} ${d.unit}` : 'Skipped';
    } else {
      const v = nearest[field];
      label = v != null ? `${v} ${unit}` : `Skipped`;
      const skipKey = `${field}_skipReason`;
      if (nearest[skipKey]) label += ` (${nearest[skipKey]})`;
    }

    tip.textContent = `${fmtTime(nearest.timestamp)}: ${label}`;
    tip.style.display = 'block';
    tip.style.left = `${e.clientX - rect.left + 8}px`;
    tip.style.top  = `${e.clientY - rect.top - 24}px`;
  });

  canvas.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
}

// ---- Layout switching --------------------------------------

const LAYOUT_STORAGE_KEY = 'npews-layout';

function autoDetectLayout() {
  const w = window.innerWidth;
  if (w < 480)  return 'mobile';
  if (w < 720)  return 'portrait';
  return 'landscape';
}

function applyLayout(layout, persist) {
  document.body.dataset.layout = layout;
  if (persist) {
    try { localStorage.setItem(LAYOUT_STORAGE_KEY, layout); } catch (_) {}
  }
  updateLayoutBtns(layout);
  renderAll();
}

function updateLayoutBtns(active) {
  ['landscape', 'portrait', 'mobile'].forEach(id => {
    const btn = document.getElementById(`btn-layout-${id}`);
    if (!btn) return;
    btn.classList.toggle('btn--active', id === active);
    btn.setAttribute('aria-pressed', String(id === active));
  });
}

function initLayout() {
  // If implementer has locked the layout, respect that and do nothing else
  if ('lockLayout' in document.body.dataset) {
    // data-layout must already be set in HTML by the implementer
    updateLayoutBtns(getLayout());
    return;
  }

  // Restore user preference, or fall back to auto-detect
  let layout;
  try { layout = localStorage.getItem(LAYOUT_STORAGE_KEY); } catch (_) {}
  if (!layout) layout = autoDetectLayout();

  applyLayout(layout, false);
}

// ---- Toolbar wiring ----------------------------------------

function wireToolbar() {
  // Zoom buttons
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
    zoomIn(OBSERVATIONS); renderAll(); renderPewsRow(); renderEscalationBanner();
  });
  document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
    zoomOut(OBSERVATIONS); renderAll(); renderPewsRow(); renderEscalationBanner();
  });

  // Quick range buttons
  ['today', 'week', 'month'].forEach(range => {
    document.getElementById(`btn-${range}`)?.addEventListener('click', () => {
      applyQuickRange(range, OBSERVATIONS);
      renderAll(); renderPewsRow(); renderEscalationBanner();
      updateActiveBtn(range);
    });
  });

  // Jump to present
  document.getElementById('btn-present')?.addEventListener('click', () => {
    applyQuickRange('present', OBSERVATIONS);
    renderAll(); renderPewsRow(); renderEscalationBanner();
    updateActiveBtn('present');
  });

  // Show values toggle
  const showValuesToggle = document.getElementById('toggle-values');
  showValuesToggle?.addEventListener('change', e => {
    viewState.showValues = e.target.checked;
    renderAll();
  });

  // Colour-blind toggle
  document.getElementById('toggle-cb')?.addEventListener('change', e => {
    document.body.classList.toggle('cb-mode', e.target.checked);
    renderAll();
  });

  // Layout toggle buttons (no-op if data-lock-layout is set - buttons are hidden by CSS anyway)
  ['landscape', 'portrait', 'mobile'].forEach(layout => {
    document.getElementById(`btn-layout-${layout}`)?.addEventListener('click', () => {
      applyLayout(layout, true);
    });
  });
}

function updateActiveBtn(active) {
  ['today', 'week', 'month', 'present'].forEach(id => {
    const btn = document.getElementById(`btn-${id}`);
    if (btn) btn.classList.toggle('btn--active', id === active);
  });
}

// ---- Resize handling ---------------------------------------

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // If no user preference stored and layout is not locked, re-auto-detect
    if (!('lockLayout' in document.body.dataset)) {
      let stored;
      try { stored = localStorage.getItem(LAYOUT_STORAGE_KEY); } catch (_) {}
      if (!stored) applyLayout(autoDetectLayout(), false);
    }
    renderAll();
  }, 80);
});

// ---- Age band banner ---------------------------------------

function renderAgeBandBanner() {
  const banner = document.querySelector('.age-band-banner');
  if (!banner) return;
  
  const ageBand = PATIENT.ageBand || '5-12y';
  const config = AGE_BANDS[ageBand];
  if (config && config.headerColor) {
    banner.style.background = config.headerColor;
    banner.setAttribute('aria-label', `Age band: ${config.label}`);
  }
}

// ---- Init --------------------------------------------------

function init() {
  const def = computeDefaultView(OBSERVATIONS);
  viewState.start = def.start;
  viewState.end   = def.end;

  // Resolve layout before building panels so initial canvas heights are correct
  initLayout();
  
  // Set age band banner color
  renderAgeBandBanner();

  // Build sidebar and charts
  const sidebar = document.getElementById('parameter-sidebar');
  if (sidebar) buildParameterSidebar(sidebar);

  const container = document.getElementById('charts-container');
  if (container) buildChartPanels(container);

  buildPewsRow(container);
  wireToolbar();

  // Tooltips
  getChartDefs().forEach(def => {
    attachTooltip(`canvas-${def.id}`, def.field, def.unit, def.bpMode || false, def.isO2Delivery || false);
  });

  renderAll();
  renderPewsRow();
  renderEscalationBanner();
  renderFooter();
}

document.addEventListener('DOMContentLoaded', init);
