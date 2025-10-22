document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('myChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const parentColor = getComputedStyle(ctx.canvas.parentElement).color;
  const wrapper = canvas.closest('.section');
  const bgColor = wrapper && wrapper.classList.contains('theme-dark') ? '#01EFA733' : '#ffffff';

  const chartAreaBackgroundPlugin = {
    id: 'chartAreaBackgroundColor',
    beforeDraw: (chart) => {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;

      const topPadding = 41;
      const radius = 16;
      const lineW = 2;
      const strokeColor = '#01EFA7';

      const availableTop = Math.max(0, chartArea.top - lineW / 2);
      const topInset = Math.min(topPadding, availableTop);
      const x = chartArea.left + lineW / 2;
      const y = chartArea.top - topInset + lineW / 2;
      const width = chartArea.width - lineW;
      const height = chartArea.height + topInset - lineW;

      const path = new Path2D();
      path.moveTo(x + radius, y);
      path.lineTo(x + width - radius, y);
      path.quadraticCurveTo(x + width, y, x + width, y + radius);
      path.lineTo(x + width, y + height - radius);
      path.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      path.lineTo(x + radius, y + height);
      path.quadraticCurveTo(x, y + height, x, y + height - radius);
      path.lineTo(x, y + radius);
      path.quadraticCurveTo(x, y, x + radius, y);
      path.closePath();

      ctx.save();
      ctx.fillStyle = bgColor;
      ctx.fill(path);
      ctx.restore();

      chart.$customBorder = { path, strokeColor, lineW };
    },
    afterDraw: (chart) => {
      const { ctx } = chart;
      if (!chart.$customBorder) return;

      const { path, strokeColor, lineW } = chart.$customBorder;
      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineW;
      ctx.stroke(path);
      ctx.restore();
    }
  };

  const gradientStops = [
    { start: '#061434', end: '#0B2665' },
    { start: '#01EFA7', end: '#03C389' }
  ];

  // --- Create chart instance ---
  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Rachunek teraz', 'Rachunek z zestawem'],
      datasets: [{
        label: 'Koszt',
        data: [0, 0],
        borderWidth: 0,
        borderRadius: 16,
        backgroundColor: (context) => {
          const { chart, dataIndex } = context;
          const { ctx, chartArea } = chart;
          const colors = gradientStops[dataIndex];
          if (!colors) return '#01EFA7';
          if (!chartArea) return colors.end;

          const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
          gradient.addColorStop(0, colors.start);
          gradient.addColorStop(1, colors.end);
          return gradient;
        }
      }]
    },
    options: {
      indexAxis: 'x',
      plugins: {
        datalabels: {
          anchor: 'end',
          align: 'end',
          color: parentColor,
          font: {
            weight: '600',
            size: 18
          },
          formatter: (value) =>
            value.toLocaleString('pl-PL', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) + ' zł'
        },
        legend: { display: false }
      },
      layout: {
        padding: { top: 30 }
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          border: { display: false },
          ticks: {
            font: {
              size: () => window.innerWidth < 460 ? 11 : 14,
              weight: '600'
            },
            color: parentColor,
            maxRotation: 0,
            minRotation: 0
          }
        },
        y: {
          beginAtZero: true,
          min: 0,
          grid: { display: false },
          ticks: { display: false },
          border: { display: false }
        }
      },
      animation: {
        duration: 600,
        easing: 'easeOutQuart'
      }
    },
    plugins: [ChartDataLabels, chartAreaBackgroundPlugin]
  });

  // --- Helper function: read current values ---
  function parseNumber(value) {
    if (value == null) return NaN;
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return Number(value);
    return parseFloat(value.replace(/\s+/g, '').replace(',', '.'));
  }

  function computeChartData() {
    const billInputEl = document.getElementById('billInput');
    const yearlyBillEl = document.getElementById('yearlyBill');

    const monthlyBill = parseFloat(billInputEl?.value || 0);
    const yearlyFromInput = monthlyBill * 12;

    const rawYearlyBill = yearlyBillEl?.dataset?.rawValue ?? yearlyBillEl?.value ?? yearlyBillEl?.textContent ?? 0;
    const yearlyBillParsed = parseNumber(rawYearlyBill);
    const yearlyBill = Number.isFinite(yearlyBillParsed) ? yearlyBillParsed : 0;

    return { yearlyFromInput, yearlyBill };
  }

  function updateChart() {
    const { yearlyFromInput, yearlyBill } = computeChartData();
    myChart.data.datasets[0].data = [yearlyFromInput, yearlyBill];
    if (chartEnabled) {
      myChart.update();
    }
  }

  const billInput = document.getElementById('billInput');
  const yearlyBillEl = document.getElementById('yearlyBill');

  if (billInput) billInput.addEventListener('input', () => updateChart());

  if (yearlyBillEl) {
    const observer = new MutationObserver(() => updateChart());
    observer.observe(yearlyBillEl, { childList: true, characterData: true, subtree: true });
  }

  let chartEnabled = false;
  let firstActivation = true;

  document.addEventListener('polenergia:calculator:update', (event) => {
    if (event.detail) {
      const yearlyBillEl = document.getElementById('yearlyBill');
      if (yearlyBillEl && event.detail.results?.firstYear?.pvBillWith != null) {
        yearlyBillEl.dataset.rawValue = String(event.detail.results.firstYear.pvBillWith);
      }
    }
    updateChart();
  });

  document.addEventListener('polenergia:calculator:advanced', (event) => {
    chartEnabled = !!event.detail?.active;
    if (chartEnabled) {
      if (firstActivation) {
        firstActivation = false;
        myChart.data.datasets[0].data = [0, 0];
        myChart.update('none');
        setTimeout(() => updateChart(), 1000);
      } else {
        updateChart();
      }
    } else {
      myChart.data.datasets[0].data = [0, 0];
      myChart.update('none');
    }
  });
});
