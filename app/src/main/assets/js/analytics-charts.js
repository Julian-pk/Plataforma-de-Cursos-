/* ==========================================================================
   Plataforma de Cursos Online y Membresías (LMS / EdTech)
   Analytics Dashboard & Chart.js Metrics Renderer
   ========================================================================== */

class AnalyticsEngine {
  constructor() {}

  static initDashboard() {
    const user = db.currentUser;
    const analytics = db.getAnalyticsForUser(user);
    if (!analytics) return;

    // Render KPI Cards
    const totalRevEl = document.getElementById('stat-total-revenue');
    if (totalRevEl) totalRevEl.innerText = `$${analytics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    const activeSubEl = document.getElementById('stat-active-subs');
    if (activeSubEl) activeSubEl.innerText = analytics.activeSubscribers;

    const avgCompEl = document.getElementById('stat-completion-rate');
    if (avgCompEl) avgCompEl.innerText = `${analytics.completionRateAvg}%`;

    // Render Revenue Sales Line Chart
    const salesCanvas = document.getElementById('salesRevenueChart');
    if (salesCanvas && window.Chart) {
      if (window.salesChartInstance) window.salesChartInstance.destroy();

      const labels = analytics.salesHistory ? analytics.salesHistory.map(s => s.month) : ['Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre'];
      const data = analytics.salesHistory ? analytics.salesHistory.map(s => s.sales) : [0, 0, 0, 0, 0, 0];

      window.salesChartInstance = new Chart(salesCanvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Ingresos Mensuales ($USD)',
            data: data,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#06b6d4',
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94a3b8' }
            },
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94a3b8' }
            }
          }
        }
      });
    }

    // Render Completion Distribution Doughnut Chart
    const completionCanvas = document.getElementById('completionDoughnutChart');
    if (completionCanvas && window.Chart) {
      if (window.completionChartInstance) window.completionChartInstance.destroy();

      const hasData = analytics.completionDistribution && analytics.completionDistribution.some(v => v > 0);
      const doughnutData = hasData ? analytics.completionDistribution : [145, 120, 62, 15];
      const doughnutLabels = ['100% Completado', '50-99% Progreso', '< 50% Progreso', 'Sin Iniciar'];
      const doughnutColors = ['#10b981', '#6366f1', '#f59e0b', '#ef4444'];

      window.completionChartInstance = new Chart(completionCanvas, {
        type: 'doughnut',
        data: {
          labels: doughnutLabels,
          datasets: [{
            data: doughnutData,
            backgroundColor: doughnutColors,
            borderWidth: 2,
            borderColor: '#1e293b'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#94a3b8',
                font: { family: 'Outfit', size: 12 },
                padding: 14,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const val = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                  return ` ${context.label}: ${val} estudiantes (${pct}%)`;
                }
              }
            }
          }
        }
      });
    }

    // Render Highest Dropoff Lessons Table
    const dropoffContainer = document.getElementById('highest-dropoff-container');
    if (dropoffContainer) {
      if (!analytics.highestDropoffLessons || analytics.highestDropoffLessons.length === 0) {
        dropoffContainer.innerHTML = `
          <div style="text-align:center; padding:1.5rem; color:var(--text-muted); font-size:0.85rem; border:1px dashed var(--border-highlight); border-radius:var(--radius-md);">
            No hay lecciones con abandono registrado en tus cursos actualmente.
          </div>
        `;
      } else {
        let html = `
          <table class="data-table">
            <thead>
              <tr>
                <th>Lección</th>
                <th>Curso</th>
                <th>Tasa de Abandono</th>
                <th>Acción Recomendada</th>
              </tr>
            </thead>
            <tbody>
        `;

        analytics.highestDropoffLessons.forEach(item => {
          html += `
            <tr>
              <td style="font-weight:600; color:var(--text-main);">${item.lessonTitle}</td>
              <td style="color:var(--text-muted);">${item.course}</td>
              <td><span class="badge badge-red">${item.dropoffRate}</span></td>
              <td><button class="btn btn-secondary btn-sm" onclick="openOptimizeLessonModal('${item.lessonTitle}', '${item.course}')"><i data-lucide="wrench" style="width:14px; height:14px;"></i> Optimizar Lección</button></td>
            </tr>
          `;
        });

        html += `</tbody></table>`;
        dropoffContainer.innerHTML = html;
      }
    }
  }
}
