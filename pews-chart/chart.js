/* ============================================================
   RCPCH NPEWS Chart Engine - chart.js
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

// ---- Module-level data references --------------------------
//
// These are set by init() and used by all rendering functions.
// When loaded via <script src> in index.html, init() falls back to the
// window globals (PATIENT, OBSERVATIONS, AGE_BANDS) defined by the data
// scripts that load before chart.js. Stories and other callers pass data
// directly: NPEWSChart.init(patient, observations, ageBands).

let _patient, _observations, _ageBands;

// ---- Colour helpers ----------------------------------------

// Returns the resolved value of a CSS custom property.
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Returns the chart font stack from --font, for use in ctx.font assignments.
// Canvas ctx.font doesn't read CSS variables directly, so we resolve it here.
function chartFont(size, weight) {
  const stack = cssVar('--font') || 'Lato, sans-serif';
  return weight ? `${weight} ${size} ${stack}` : `${size} ${stack}`;
}

function getBandColour(bandName) {
  const s = getComputedStyle(document.documentElement);
  return {
    white:  s.getPropertyValue('--band-white').trim()  || '#ffffff',
    yellow: s.getPropertyValue('--band-yellow').trim() || '#ffdd00',
    orange: s.getPropertyValue('--band-orange').trim() || '#f47738',
    pink:   s.getPropertyValue('--band-pink').trim()   || '#e5007d',
  }[bandName] || '#ffffff';
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
  ctx.font = chartFont('11px');
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

// ---- Temperature zone overlays -----------------------------
//
// Draws coloured border rectangles over the hot/cold zones on a temperature
// chart, matching the red/blue boxes on the NHS NPEWS paper form.
//
// overlays: array of { min, max, color, edgeLabel }
//   min/max are data values (°C). color is the stroke colour for the box.
//   edgeLabel (optional): text to show at the chart extremity instead of the
//   axis value (e.g. ">39" at the top of the red box, "<34.5" at the bottom
//   of the blue box).
//
// Call AFTER drawYAxis so the coloured labels paint on top of the grey ones.

function drawTemperatureOverlays(ctx, overlays, yMin, yMax, chartHeight, padTop, padBot, padLeft, padRight) {
  if (!overlays || overlays.length === 0) return;

  const W = ctx.canvas.width / (window.devicePixelRatio || 1);
  const drawW = W - padLeft - padRight;

  overlays.forEach(ov => {
    const zoneMin = Math.max(ov.min, yMin);
    const zoneMax = Math.min(ov.max, yMax);
    if (zoneMin >= zoneMax) return;

    const yTop = valueToY(zoneMax, yMin, yMax, chartHeight, padTop, padBot);
    const yBot = valueToY(zoneMin, yMin, yMax, chartHeight, padTop, padBot);

    // Coloured border rectangle - stroke only, no fill
    ctx.save();
    ctx.strokeStyle = ov.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(padLeft, yTop, drawW, yBot - yTop);
    ctx.restore();

    // Recolour the boundary tick labels and the edge label in the zone colour.
    ctx.save();
    ctx.font = chartFont('11px');
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    function paintLabel(text, yValue) {
      const y = valueToY(yValue, yMin, yMax, chartHeight, padTop, padBot);
      // White knockout over the grey label already drawn, then coloured text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, padLeft - 4, y);
      ctx.fillStyle = ov.color;
      ctx.fillText(text, padLeft - 8, y);
    }

    // Colour the bottom boundary tick (ov.min, clamped to yMin)
    if (ov.min > yMin) {
      paintLabel(String(ov.min % 1 === 0 ? Math.round(ov.min) : ov.min), ov.min);
    }

    // Colour the top boundary tick (ov.max, clamped to yMax)
    if (ov.max < yMax) {
      paintLabel(String(ov.max % 1 === 0 ? Math.round(ov.max) : ov.max), ov.max);
    }

    // Edge label at chart top (when zone extends to/beyond yMax)
    if (ov.max >= yMax && ov.edgeLabel) {
      paintLabel(ov.edgeLabel, yMax);
    }

    // Edge label at chart bottom (when zone extends to/below yMin)
    if (ov.min <= yMin && ov.edgeLabel) {
      paintLabel(ov.edgeLabel, yMin);
    }

    ctx.restore();
  });
}

// ---- Hour grid helpers -------------------------------------

// Returns an array of ms timestamps for each whole hour within [viewStart, viewEnd].
// Used to drive fixed grid lines and the time axis, independent of observations.
function hourTicks(viewStart, viewEnd) {
  const ticks = [];
  // Start at the first whole hour at or after viewStart
  const d = new Date(viewStart);
  d.setMinutes(0, 0, 0);
  if (d.getTime() < viewStart) d.setHours(d.getHours() + 1);
  while (d.getTime() <= viewEnd) {
    ticks.push(d.getTime());
    d.setHours(d.getHours() + 1);
  }
  return ticks;
}

// ---- X-axis (time) labels ----------------------------------

// Draws vertical grid lines at fixed hourly positions across the full canvas height.
// xPositions: array of pixel x values for each hourly tick.
function drawXAxis(ctx, xPositions, chartHeight) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1;

  xPositions.forEach(x => {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, chartHeight);
    ctx.stroke();
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
  ctx.font = chartFont('10px', 'bold');
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

// ---- Categorical row rendering -----------------------------
// Renders a thin row of coloured cells with text labels at each observation time.
// Used for: Respiratory Distress, AVPU, CRT

/**
 * renderCategoricalRow(canvas, config)
 * config: {
 *   observations: array
 *   getCell: fn(obs) => { label, color, textColor } | null
 *   viewStart, viewEnd
 * }
 */
function renderCategoricalRow(canvas, config) {
  const { observations, getCell, viewStart, viewEnd } = config;

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 800;
  const H = canvas.offsetHeight || 30;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const PAD_LEFT  = 55;
  const PAD_RIGHT = 50;
  const drawW = W - PAD_LEFT - PAD_RIGHT;
  const range = viewEnd - viewStart;

  function tsToX(ts) {
    return PAD_LEFT + ((parseTs(ts) - viewStart) / range) * drawW;
  }

  const inView = observations.filter(o => {
    const t = parseTs(o.timestamp);
    return t >= viewStart && t <= viewEnd;
  });

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(PAD_LEFT, 0, drawW, H);

  // Draw cells between consecutive observation columns
  inView.forEach((o, i) => {
    const cell = getCell(o);
    const x = tsToX(o.timestamp);
    const nextObs = inView[i + 1];
    const xEnd = nextObs ? tsToX(nextObs.timestamp) : W - PAD_RIGHT;
    const cellW = xEnd - x;

    // Background fill
    ctx.fillStyle = (cell && cell.color) ? cell.color : '#ffffff';
    ctx.fillRect(x, 1, cellW - 1, H - 2);

    // Label centred in cell
    if (cell && cell.label) {
      ctx.save();
      ctx.font = chartFont('10px', 'bold');
      ctx.fillStyle = cell.textColor || '#0b0c0c';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cell.label, x + cellW / 2, H / 2);
      ctx.restore();
    }
  });

  // Vertical grid lines at fixed hourly positions
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  hourTicks(viewStart, viewEnd).forEach(t => {
    const x = PAD_LEFT + ((t - viewStart) / range) * drawW;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  });

  // Border around draw area
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.75;
  ctx.strokeRect(PAD_LEFT, 0.5, drawW, H - 1);
}

// ---- Main chart render function ----------------------------

/**
 * renderChart(canvas, config)
 *
 * config: {
 *   observations: OBSERVATIONS array (from demo-data.js)
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

  const PAD_LEFT   = 55;
  const PAD_RIGHT  = 50;  // Fixed width on both sides so vertical grid lines align across all rows
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
    ctx.font = chartFont('12px');
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

  // Temperature zone overlays (red hot box, blue cold box) - drawn after y-axis so labels sit on top
  if (config.tempOverlays) {
    drawTemperatureOverlays(ctx, config.tempOverlays, yMin, yMax, H, PAD_TOP, PAD_BOTTOM, PAD_LEFT, PAD_RIGHT);
  }

  // X axis grid lines at fixed hourly positions
  const ticks = hourTicks(viewStart, viewEnd);
  const hourXPositions = ticks.map(t => PAD_LEFT + ((t - viewStart) / range) * drawW);
  drawXAxis(ctx, hourXPositions, H);

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
      ctx.font = chartFont('10px', 'bold');
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

const LAYOUT_CATEGORICAL_HEIGHTS = {
  landscape: 28,
  portrait:  24,
  mobile:    20,
};

function getCategoricalHeight() {
  return LAYOUT_CATEGORICAL_HEIGHTS[getLayout()] ?? 28;
}

function computeDefaultView(observations) {
  // Default: show last 24 hours of data (minimum visible window)
  const times = observations.map(o => parseTs(o.timestamp));
  const last  = Math.max(...times);
  const twentyFourH = 24 * 60 * 60 * 1000;
  return {
    start: last - twentyFourH + 30 * 60 * 1000, // place latest obs near right edge
    end:   last + 30 * 60 * 1000,                // 30 min padding on right
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
  const minHalf = 12 * 60 * 60 * 1000; // min window = 24h (half = 12h)
  const newHalf = Math.max(half * 0.6, minHalf);
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

// ---- Categorical row cell definitions ----------------------

function getRespiratoryDistressCell(obs) {
  const v = obs.respiratoryDistress;
  if (v == null) return { label: '—', color: '#f0f0f0', textColor: '#888' };
  const map = {
    none:     { label: 'None',     color: getBandColour('white'),  textColor: '#0b0c0c' },
    mild:     { label: 'Mild',     color: getBandColour('yellow'), textColor: '#0b0c0c' },
    moderate: { label: 'Moderate', color: getBandColour('orange'), textColor: '#0b0c0c' },
    severe:   { label: 'Severe',   color: getBandColour('pink'),   textColor: '#0b0c0c' },
  };
  return map[v] || { label: v, color: '#ffffff', textColor: '#0b0c0c' };
}

function getCRTCell(obs) {
  const v = obs.capillaryRefill;
  if (v == null) return { label: '—', color: '#f0f0f0', textColor: '#888' };
  // CRT <= 2s = 0 (white), 3s = 2 (orange), >= 4s = 4 (pink)
  let color;
  if (v <= 2)      color = getBandColour('white');
  else if (v <= 3) color = getBandColour('orange');
  else             color = getBandColour('pink');
  return { label: `${v}s`, color, textColor: '#0b0c0c' };
}

function getAVPUCell(obs) {
  const v = obs.avpu;
  if (v == null) return { label: '—', color: '#f0f0f0', textColor: '#888' };
  // A = 0 (white), V = 2 (orange), P/U = 4 (pink)
  const map = {
    A: { label: 'A', color: getBandColour('white'),  textColor: '#0b0c0c' },
    V: { label: 'V', color: getBandColour('orange'), textColor: '#0b0c0c' },
    P: { label: 'P', color: getBandColour('pink'),   textColor: '#0b0c0c' },
    U: { label: 'U', color: getBandColour('pink'),   textColor: '#0b0c0c' },
  };
  return map[v] || { label: v, color: '#ffffff', textColor: '#0b0c0c' };
}

// ---- Chart panel definitions --------------------------------

function getChartDefs() {
  // Get age-specific configuration based on patient's age band
  const ageBand = _patient.ageBand || '5-12y';
  const SCORING_BANDS = _ageBands[ageBand]?.scoringBands || _ageBands['5-12y'].scoringBands;
  const cfg = _ageBands[ageBand]?.chartConfig || _ageBands['5-12y'].chartConfig;
  
  return [
    // --- Airway and Breathing ---
    {
      id:    'respiratoryRate',
      title: 'Respiratory Rate',
      unit:  cfg.respiratoryRate.unit,
      field: 'respiratoryRate',
      bands: SCORING_BANDS.respiratoryRate,
      yMin: cfg.respiratoryRate.yMin,
      yMax: cfg.respiratoryRate.yMax,
      step: cfg.respiratoryRate.step,
      section: 'airway',
    },
    {
      id:         'respiratoryDistress',
      title:      'Respiratory Distress',
      unit:       '',
      categorical: true,
      getCell:    getRespiratoryDistressCell,
      section: 'airway',
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
      section: 'airway',
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
      rightLabels: [
        { value: 100, label: '20 L' },
        { value: 75,  label: '15 L' },
        { value: 50,  label: '10 L' },
        { value: 40,  label: '8 L'  },
        { value: 25,  label: '5 L'  },
        { value: 10,  label: '2 L'  },
        { value: 5,   label: '1 L'  },
      ],
      section: 'airway',
    },
    // --- Circulation ---
    {
      id:    'heartRate',
      title: 'Heart Rate',
      unit:  cfg.heartRate.unit,
      field: 'heartRate',
      bands: SCORING_BANDS.heartRate,
      yMin: cfg.heartRate.yMin,
      yMax: cfg.heartRate.yMax,
      step: cfg.heartRate.step,
      section: 'circulation',
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
      section: 'circulation',
    },
    {
      id:         'capillaryRefill',
      title:      'Capillary Refill Time',
      unit:       'seconds',
      categorical: true,
      getCell:    getCRTCell,
      section: 'circulation',
    },
    // --- Disability and Exposure ---
    {
      id:         'avpu',
      title:      'AVPU / Neurological',
      unit:       '',
      categorical: true,
      getCell:    getAVPUCell,
      section: 'disability',
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
      section: 'disability',
      // Red box around hot zone (>=38), blue box around cold zone (<36).
      // min/max are the data-value boundaries of the coloured rectangle.
      // edgeLabel: text shown at the chart-edge extremity (e.g. ">39" at chart top).
      tempOverlays: [
        { min: 38, max: cfg.temperature.yMax, color: '#d4351c', edgeLabel: '>39' }, // red - hot
        { min: cfg.temperature.yMin, max: 36,  color: '#1d70b8' },                  // blue - cold
      ],
    },
  ];
}

// ---- DOM building & wiring ---------------------------------

// ---- Unified chart grid builder ----------------------------
// Emits one grid row per parameter: [sidebar-cell | canvas-cell].
// Both cells share the same CSS grid row so their heights are always equal -
// no JS height-syncing needed.

const SIDEBAR_META = {
  respiratoryRate:  { unit: 'breaths/min', description: 'Count chest movements for 60 seconds', extra: null },
  oxygenSaturation: { unit: 'SpO\u2082 %', description: 'Peripheral O\u2082 saturation. Record probe site.', extra: '\u2265 95% normal | 92\u201394% low concern | \u2264 91% high concern' },
  oxygenDelivery:   { unit: 'FiO\u2082 % / L/min', description: 'HF = High Flow \u2022 BiPAP/CPAP \u2022 NP = Nasal Prongs \u2022 FM = Face Mask \u2022 HB = Head Box \u2022 NMR = Non-rebreather', extra: 'Left = FiO\u2082 % | Right = L/min' },
  heartRate:        { unit: 'bpm', description: 'Record pulse rate in beats per minute', extra: null },
  bloodPressure:    { unit: 'mmHg', description: 'Position: LA \u2022 RA \u2022 LL \u2022 RL. Derogation code if not attempted (NC).', extra: '\u25be systolic \u25b4 diastolic' },
  temperature:      { unit: '\u00b0C', description: 'Route: Tympanic \u2022 Axillary \u2022 Rectal', extra: null },
};

const SECTION_META = {
  airway:      { label: 'Airway and Breathing',    color: '#003087' },
  circulation: { label: 'Circulation',              color: '#003087' },
  disability:  { label: 'Disability and Exposure',  color: '#003087' },
};

function buildChartGrid(gridEl) {
  const defs = getChartDefs();

  // Count how many rows each section spans
  const sectionSpans = {};
  defs.forEach(d => {
    sectionSpans[d.section] = (sectionSpans[d.section] || 0) + 1;
  });

  // Three-column grid: section-label | param-label | canvas
  // We emit cells in DOM order: for rows belonging to the first section, the
  // section-span cell is emitted first (col 1, span N), then each row's col-2
  // and col-3 cells.  CSS grid auto-placement handles the rest.
  let currentSection = null;
  let rowIndex = 1; // 1-based CSS grid row

  // Map section -> start row (so we can explicitly place the section span)
  const sectionStartRow = {};
  let r = 1;
  defs.forEach(d => {
    if (!(d.section in sectionStartRow)) sectionStartRow[d.section] = r;
    r++;
  });
  // time axis row at the end
  const timeRow = r;

  defs.forEach((def, i) => {
    const isFirst = i === 0;
    const row = i + 1;

    // Emit section cell on section change (placed explicitly into col 1)
    if (def.section !== currentSection) {
      currentSection = def.section;
      const span = sectionSpans[def.section];
      const startRow = sectionStartRow[def.section];
      const meta = SECTION_META[def.section] || {};

      const sectionCell = document.createElement('div');
      sectionCell.className = 'chart-grid__section';
      sectionCell.style.gridColumn = '1';
      sectionCell.style.gridRow = `${startRow} / span ${span}`;
      sectionCell.innerHTML = `<span class="chart-grid__section-text">${meta.label || ''}</span>`;
      gridEl.appendChild(sectionCell);
    }

    // --- Param label cell (column 2) ---
    const label = document.createElement('div');
    label.style.gridColumn = '2';
    label.style.gridRow = String(row);
    if (def.categorical) {
      label.className = 'chart-grid__label chart-grid__label--categorical';
      label.innerHTML = `<span class="chart-grid__label-title chart-grid__label-title--cat">${def.title}</span>`;
    } else {
      label.className = 'chart-grid__label';
      if (isFirst) label.classList.add('chart-grid__label--first');
      const meta = SIDEBAR_META[def.id] || {};
      let html = `<span class="chart-grid__label-title">${def.title}</span>`;
      if (meta.unit)        html += `<span class="chart-grid__label-unit">${meta.unit}</span>`;
      if (meta.description) html += `<span class="chart-grid__label-desc">${meta.description}</span>`;
      if (meta.extra)       html += `<span class="chart-grid__label-codes">${meta.extra}</span>`;
      label.innerHTML = html;
    }

    // --- Canvas cell (column 3) ---
    const cell = document.createElement('div');
    cell.style.gridColumn = '3';
    cell.style.gridRow = String(row);
    cell.className = def.categorical ? 'chart-grid__cell chart-grid__cell--categorical' : 'chart-grid__cell';
    if (isFirst) cell.classList.add('chart-grid__cell--first');

    const h = def.categorical ? getCategoricalHeight() : getChartHeight();
    cell.innerHTML = `
      <canvas class="chart-canvas" id="canvas-${def.id}" style="width:100%;height:${h}px;"></canvas>
      <div class="obs-tooltip" id="tip-${def.id}"></div>
    `;

    gridEl.appendChild(label);
    gridEl.appendChild(cell);
  });

  // --- PEWS row (inside grid so canvas x-coordinates align with charts) ---
  const pewsRow = timeRow;       // PEWS is the next row after parameter rows
  const axisRow = timeRow + 1;   // time axis follows PEWS

  const pewsSectionCell = document.createElement('div');
  pewsSectionCell.className = 'chart-grid__section chart-grid__section--pews';
  pewsSectionCell.style.gridColumn = '1';
  pewsSectionCell.style.gridRow = String(pewsRow);
  gridEl.appendChild(pewsSectionCell);

  const pewsLabel = document.createElement('div');
  pewsLabel.className = 'chart-grid__label chart-grid__label--pews';
  pewsLabel.style.gridColumn = '2';
  pewsLabel.style.gridRow = String(pewsRow);
  pewsLabel.innerHTML = '<span class="chart-grid__label-title">PEWS Total</span>';

  const pewsCell = document.createElement('div');
  pewsCell.className = 'chart-grid__cell chart-grid__cell--pews';
  pewsCell.style.gridColumn = '3';
  pewsCell.style.gridRow = String(pewsRow);
  pewsCell.innerHTML = `<canvas class="chart-canvas" id="canvas-pews" style="width:100%;height:44px;"></canvas>`;

  gridEl.appendChild(pewsLabel);
  gridEl.appendChild(pewsCell);

  // --- Time axis row ---
  const timeSectionCell = document.createElement('div');
  timeSectionCell.className = 'chart-grid__section chart-grid__section--time';
  timeSectionCell.style.gridColumn = '1';
  timeSectionCell.style.gridRow = String(axisRow);
  gridEl.appendChild(timeSectionCell);

  const timeLabel = document.createElement('div');
  timeLabel.className = 'chart-grid__label chart-grid__label--time';
  timeLabel.style.gridColumn = '2';
  timeLabel.style.gridRow = String(axisRow);

  const timeCell = document.createElement('div');
  timeCell.className = 'chart-grid__cell chart-grid__cell--time chart-grid__cell--last';
  timeCell.style.gridColumn = '3';
  timeCell.style.gridRow = String(axisRow);
  timeCell.innerHTML = `<canvas class="chart-canvas" id="canvas-time-axis" style="width:100%;height:28px;"></canvas>`;

  gridEl.appendChild(timeLabel);
  gridEl.appendChild(timeCell);
}

// ---- PEWS canvas row (inside chart grid, aligned with parameter rows) ------

function renderPewsCanvas() {
  const canvas = document.getElementById('canvas-pews');
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 800;
  const H = canvas.offsetHeight || 44;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const PAD_LEFT  = 55;
  const PAD_RIGHT = 50;
  const drawW = W - PAD_LEFT - PAD_RIGHT;
  const range = viewState.end - viewState.start;

  const inView = _observations.filter(o => {
    const t = parseTs(o.timestamp);
    return t >= viewState.start && t <= viewState.end;
  });

  // White background for the draw area
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(PAD_LEFT, 0, drawW, H);

  // Escalation level -> background colour
  function escColor(level) {
    if (!level) return '#ffffff';
    return cssVar(`--esc-${level}`) || '#ffffff';
  }

  // Text colour: medium uses dark text, all others white
  function escTextColor(level) {
    if (level === 'medium') return cssVar('--esc-medium-text') || '#0b0c0c';
    if (level) return '#ffffff';
    return '#0b0c0c';
  }

  // Draw coloured column for each observation, extending to next observation
  inView.forEach((o, i) => {
    const x = PAD_LEFT + ((parseTs(o.timestamp) - viewState.start) / range) * drawW;
    const nextObs = inView[i + 1];
    const xEnd = nextObs
      ? PAD_LEFT + ((parseTs(nextObs.timestamp) - viewState.start) / range) * drawW
      : W - PAD_RIGHT;
    const colW = xEnd - x;

    const level = o.escalationLevel || null;
    const score = o.pewsTotal;

    // Background fill
    ctx.fillStyle = escColor(level);
    ctx.fillRect(x, 0, colW, H);

    // Score number centred in the column
    ctx.save();
    ctx.font = chartFont('16px', 'bold');
    ctx.fillStyle = escTextColor(level);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (score != null) {
      ctx.fillText(String(score), x + colW / 2, H / 2);
    }
    ctx.restore();
  });

  // Vertical grid lines at fixed hourly positions
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  hourTicks(viewState.start, viewState.end).forEach(t => {
    const x = PAD_LEFT + ((t - viewState.start) / range) * drawW;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  });

  // Border around draw area
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.75;
  ctx.strokeRect(PAD_LEFT, 0.5, drawW, H - 1);
}

// ---- Time axis (dedicated row below all chart panels) ------

function renderTimeAxis() {
  const canvas = document.getElementById('canvas-time-axis');
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 800;
  const H = canvas.offsetHeight || 28;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const PAD_LEFT  = 55;
  const PAD_RIGHT = 50;  // Use widest right-pad (O2 delivery) to keep x positions consistent
  const drawW = W - PAD_LEFT - PAD_RIGHT;
  const range = viewState.end - viewState.start;

  // Background
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(0, 0, W, H);

  // Tick marks and HH:00 labels at fixed hourly positions
  ctx.font = chartFont('11px');
  ctx.fillStyle = '#505a5f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1;

  hourTicks(viewState.start, viewState.end).forEach(t => {
    const x = PAD_LEFT + ((t - viewState.start) / range) * drawW;
    // Short tick from top of this canvas (= continuation of the column line)
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 6);
    ctx.stroke();
    // Format as HH:00
    const d = new Date(t);
    const label = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    ctx.fillText(label, x, 8);
  });
}

function renderAll() {
  const defs = getChartDefs();
  const h = getChartHeight();
  const hCat = getCategoricalHeight();
  defs.forEach(def => {
    const canvas = document.getElementById(`canvas-${def.id}`);
    if (!canvas) return;

    if (def.categorical) {
      canvas.style.height = `${hCat}px`;
      renderCategoricalRow(canvas, {
        observations: _observations,
        getCell:      def.getCell,
        viewStart:    viewState.start,
        viewEnd:      viewState.end,
      });
    } else {
      canvas.style.height = `${h}px`;
      renderChart(canvas, {
        observations: _observations,
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
        tempOverlays: def.tempOverlays || null,
      });
    }
  });
  renderTimeAxis();
  renderPewsCanvas();
}

// ---- Escalation banner -------------------------------------

function renderEscalationBanner() {
  const banner = document.getElementById('escalation-banner');
  if (!banner) return;

  // Always use the globally latest observation - zoom must not affect PEWS score display
  if (_observations.length === 0) { banner.style.display = 'none'; return; }

  const latest = _observations[_observations.length - 1];
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

  const latest = _observations[_observations.length - 1];
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
    const inView = _observations.filter(o => {
      const t = parseTs(o.timestamp);
      return t >= viewState.start && t <= viewState.end;
    });
    if (!inView.length) return;

    const range = viewState.end - viewState.start;
    const PAD_LEFT = 55;
    const PAD_RIGHT = 50;
    const drawW    = canvas.offsetWidth - PAD_LEFT - PAD_RIGHT;

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

// ---- Categorical row tooltip --------------------------------

function attachCategoricalTooltip(canvasId, getCell) {
  const canvas = document.getElementById(canvasId);
  const tip    = document.getElementById(`tip-${canvasId.replace('canvas-', '')}`);
  if (!canvas || !tip) return;

  const PAD_LEFT  = 55;
  const PAD_RIGHT = 50;

  canvas.addEventListener('mousemove', e => {
    const rect   = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    const inView = _observations.filter(o => {
      const t = parseTs(o.timestamp);
      return t >= viewState.start && t <= viewState.end;
    });
    if (!inView.length) { tip.style.display = 'none'; return; }

    const range = viewState.end - viewState.start;
    const drawW = canvas.offsetWidth - PAD_LEFT - PAD_RIGHT;

    // Find which cell the mouse is over
    let found = null;
    for (let i = 0; i < inView.length; i++) {
      const o    = inView[i];
      const x    = PAD_LEFT + ((parseTs(o.timestamp) - viewState.start) / range) * drawW;
      const next = inView[i + 1];
      const xEnd = next
        ? PAD_LEFT + ((parseTs(next.timestamp) - viewState.start) / range) * drawW
        : canvas.offsetWidth - PAD_RIGHT;
      if (mouseX >= x && mouseX < xEnd) { found = o; break; }
    }

    if (!found) { tip.style.display = 'none'; return; }

    const cell = getCell(found);
    const label = cell ? cell.label : '—';
    tip.textContent = `${fmtTime(found.timestamp)}: ${label}`;
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
    zoomIn(_observations); renderAll(); renderEscalationBanner();
  });
  document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
    zoomOut(_observations); renderAll(); renderEscalationBanner();
  });

  // Quick range buttons
  ['today', 'week', 'month'].forEach(range => {
    document.getElementById(`btn-${range}`)?.addEventListener('click', () => {
      applyQuickRange(range, _observations);
      renderAll(); renderEscalationBanner();
      updateActiveBtn(range);
    });
  });

  // Jump to present
  document.getElementById('btn-present')?.addEventListener('click', () => {
    applyQuickRange('present', _observations);
    renderAll(); renderEscalationBanner();
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
  
  const ageBand = _patient.ageBand || '5-12y';
  const config = _ageBands[ageBand];
  if (config && config.headerColor) {
    banner.style.background = config.headerColor;
    banner.setAttribute('aria-label', `Age band: ${config.label}`);
  }
}

// ---- Init --------------------------------------------------

/**
 * Initialise the chart.
 *
 * When called without arguments (e.g. from index.html's DOMContentLoaded),
 * falls back to the window globals PATIENT, OBSERVATIONS, AGE_BANDS defined
 * by the data scripts loaded before chart.js.
 *
 * Storybook stories and integration tests pass data directly:
 *   NPEWSChart.init(patient, observations, ageBands)
 */
function init(patient, observations, ageBands) {
  _patient      = patient      || window.PATIENT;
  _observations = observations || window.OBSERVATIONS;
  _ageBands     = ageBands     || window.AGE_BANDS;

  const def = computeDefaultView(_observations);
  viewState.start = def.start;
  viewState.end   = def.end;

  // Resolve layout before building panels so initial canvas heights are correct
  initLayout();
  
  // Set age band banner color
  renderAgeBandBanner();

  // Build chart grid (sidebar labels + canvases as a single CSS grid)
  const gridEl = document.getElementById('chart-grid');
  if (gridEl) buildChartGrid(gridEl);

  wireToolbar();

  // Tooltips
  getChartDefs().forEach(def => {
    if (def.categorical) {
      attachCategoricalTooltip(`canvas-${def.id}`, def.getCell);
    } else {
      attachTooltip(`canvas-${def.id}`, def.field, def.unit, def.bpMode || false, def.isO2Delivery || false);
    }
  });

  renderAll();
  renderEscalationBanner();
  renderFooter();
}

// When loaded as a plain <script> in index.html, auto-init on DOMContentLoaded
// using window globals. Storybook stories call NPEWSChart.init() directly.
document.addEventListener('DOMContentLoaded', () => init());

// Public API - allows callers outside index.html to mount the chart
window.NPEWSChart = { init };
