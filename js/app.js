/* ==========================================================================
   Plataforma de Cursos Online y Membresías (LMS / EdTech)
   Main SPA Router & Application Controller
   ========================================================================== */

let activeHlsPlayer = null;
let courseBuilder = null;
let currentActiveCourse = null;
let currentActiveLesson = null;
let currentQuizState = null;

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  initTheme();
  renderHeader();
  
  // Route to last saved view if authenticated, or route based on role
  if (db.currentUser) {
    try {
      const saved = JSON.parse(sessionStorage.getItem('EDTECH_LAST_VIEW') || 'null');
      if (saved && saved.viewName && saved.viewName !== 'login') {
        navigate(saved.viewName, saved.params || {});
      } else if (db.currentUser.role === 'instructor') {
        navigate('instructor-dashboard');
      } else {
        navigate('catalog');
      }
    } catch (e) {
      navigate(db.currentUser.role === 'instructor' ? 'instructor-dashboard' : 'catalog');
    }
  } else {
    navigate('login');
  }
});

// Theme Toggle Engine
function initTheme() {
  const savedTheme = localStorage.getItem('EDTECH_THEME') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('EDTECH_THEME', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    if (window.lucide) lucide.createIcons();
  }
}

// Render Top Header Controls based on User Role
function renderHeader() {
  const user = db.currentUser;
  const navLinks = document.querySelector('.nav-links');
  const navStudioBtn = document.getElementById('nav-studio-btn');
  const userMenu = document.getElementById('header-user-menu');
  const roleBadge = document.getElementById('header-role-badge');
  const userNameDisplay = document.getElementById('header-user-name');
  const userAvatar = document.getElementById('header-user-avatar');

  if (!user || !db.data.activeUserId) {
    // Unauthenticated state: Hide navigation bar links and profile menu
    if (navLinks) navLinks.style.display = 'none';
    if (navStudioBtn) navStudioBtn.style.display = 'none';
    if (userMenu) userMenu.style.display = 'none';
    const mobileLogout = document.getElementById('nav-mobile-logout-btn');
    if (mobileLogout) mobileLogout.style.display = 'none';
    return;
  }

  // Authenticated state: Show navigation bar links and user menu
  if (navLinks) navLinks.style.display = 'flex';
  if (userMenu) userMenu.style.display = 'flex';
  const mobileLogout = document.getElementById('nav-mobile-logout-btn');
  if (mobileLogout) mobileLogout.style.display = 'inline-flex';

  // Role permissions UI
  const isInstructor = user.role === 'instructor';
  if (navStudioBtn) {
    navStudioBtn.style.display = isInstructor ? 'inline-flex' : 'none';
  }

  if (roleBadge) {
    roleBadge.innerText = isInstructor ? 'Profesor' : 'Estudiante';
    roleBadge.className = `user-role-badge ${isInstructor ? 'badge-green' : 'badge-indigo'}`;
  }

  if (userNameDisplay) userNameDisplay.innerText = user.name.split(' ')[0];
  if (userAvatar) userAvatar.innerText = user.avatar;

  if (window.lucide) lucide.createIcons();
}

function handleLogout() {
  try {
    sessionStorage.removeItem('EDTECH_LAST_VIEW');
  } catch (e) {}
  db.logout();
  renderHeader();
  navigate('login');
}

// Single Page Application Navigation Router
function navigate(viewName, params = {}) {
  const main = document.getElementById('main-container');
  if (!main) return;

  // Protect private views from unauthenticated users
  if (!db.currentUser && viewName !== 'login') {
    viewName = 'login';
  }

  // Persist current view state across reloads
  try {
    sessionStorage.setItem('EDTECH_LAST_VIEW', JSON.stringify({ viewName, params }));
  } catch (e) {}

  // Destroy previous video player if active
  if (activeHlsPlayer && activeHlsPlayer.hls) {
    activeHlsPlayer.hls.destroy();
    activeHlsPlayer = null;
  }

  // Active state for top navbar
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.view === viewName) btn.classList.add('active');
  });

  switch (viewName) {
    case 'login':
      renderLoginView(main);
      break;
    case 'catalog':
      renderCatalogView(main);
      break;
    case 'course-detail':
      renderCourseDetailView(main, params.courseId);
      break;
    case 'learning-player':
      renderLearningPlayerView(main, params.courseId, params.lessonId);
      break;
    case 'student-dashboard':
      renderStudentDashboardView(main);
      break;
    case 'instructor-dashboard':
      // Security check: Only instructors can view Studio
      if (db.currentUser.role !== 'instructor') {
        alert('Acceso restringido: Esta sección requiere rol de Instructor / Administrador.');
        renderCatalogView(main);
        return;
      }
      renderInstructorDashboardView(main);
      break;
    default:
      renderCatalogView(main);
  }

  if (window.lucide) lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================================
   VIEW 0: Authentication (Login & Registration)
   ========================================================================== */
function renderLoginView(container) {
  container.innerHTML = `
    <div style="max-width: 440px; margin: 2rem auto; background: var(--bg-card); border: 1px solid var(--border-highlight); border-radius: var(--radius-xl); padding: 2rem; box-shadow: var(--shadow-lg);">
      
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div class="logo-badge" style="width: 54px; height: 54px; margin: 0 auto 1rem auto; font-size: 1.5rem;">
          <i data-lucide="graduation-cap"></i>
        </div>
        <h2 style="font-size: 1.6rem; font-weight: 800;">EdTech LMS Studio</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.3rem;">Accede a tu cuenta o regístrate para comenzar</p>
      </div>

      <!-- Auth Tabs -->
      <div class="tab-nav" style="justify-content: center; margin-bottom: 1.5rem;">
        <button class="tab-btn active" id="auth-tab-login" onclick="switchAuthTab('login')">Iniciar Sesión</button>
        <button class="tab-btn" id="auth-tab-register" onclick="switchAuthTab('register')">Crear Cuenta</button>
      </div>

      <!-- FORM: Login -->
      <form id="auth-form-login" onsubmit="event.preventDefault(); submitLogin();" style="space-y: 1rem;">
        <div style="margin-bottom: 1rem;">
          <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">Correo Electrónico:</label>
          <input type="email" id="login-email" value="julian@gmail.com" required style="width: 100%;">
        </div>

        <div style="margin-bottom: 1.25rem;">
          <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">Contraseña:</label>
          <input type="password" id="login-password" value="12345" required style="width: 100%;">
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; justify-content: center;">
          <i data-lucide="log-in"></i> Entrar a la Plataforma
        </button>
      </form>

      <!-- FORM: Register -->
      <form id="auth-form-register" onsubmit="event.preventDefault(); submitRegister();" style="display: none; space-y: 1rem;">
        <div style="margin-bottom: 1rem;">
          <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">Nombre Completo:</label>
          <input type="text" id="reg-name" placeholder="Ej. Maria Lopez" required style="width: 100%;">
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">Correo Electrónico:</label>
          <input type="email" id="reg-email" placeholder="maria@ejemplo.com" required style="width: 100%;">
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">Contraseña:</label>
          <input type="password" id="reg-password" placeholder="••••••••" required style="width: 100%;">
        </div>

        <div style="margin-bottom: 1.25rem;">
          <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.3rem;">Rol / Tipo de Usuario:</label>
          <select id="reg-role" style="width: 100%;">
            <option value="student">Estudiante</option>
            <option value="instructor">Profesor / Instructor</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; justify-content: center;">
          <i data-lucide="user-plus"></i> Registrarme e Iniciar
        </button>
      </form>

      <!-- Demo Quick Login Buttons -->
      <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color); text-align: center;">
        <p style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 0.75rem;">Acceso Rápido con 1 Clic:</p>
        <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="quickLogin('julian@gmail.com', '12345')">
            <i data-lucide="shield"></i> Prof. Julian (julian@gmail.com)
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="quickLogin('julianalumno@gmail.com', '12345')">
            <i data-lucide="user"></i> Alumno Julian
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="quickLogin('estudiante@dev.com', '123')">
            <i data-lucide="user"></i> Alumno Demo
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="quickLogin('admin@dev.com', '123')">
            <i data-lucide="shield"></i> Prof. Demo
          </button>
        </div>
      </div>

    </div>
  `;
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('auth-form-login');
  const regForm = document.getElementById('auth-form-register');
  const tabLogin = document.getElementById('auth-tab-login');
  const tabReg = document.getElementById('auth-tab-register');

  if (tab === 'login') {
    loginForm.style.display = 'block';
    regForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    regForm.style.display = 'block';
    tabReg.classList.add('active');
    tabLogin.classList.remove('active');
  }
}

async function submitLogin() {
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-password').value;

  const res = await db.login(email, pass);
  if (res.success) {
    renderHeader();
    if (res.user.role === 'instructor') {
      navigate('instructor-dashboard');
    } else {
      navigate('catalog');
    }
  } else {
    alert(res.message);
  }
}

async function submitRegister() {
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const pass = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;

  const res = await db.register(name, email, pass, role);
  if (res.success) {
    renderHeader();
    if (role === 'instructor') {
      navigate('instructor-dashboard');
    } else {
      navigate('catalog');
    }
  } else {
    alert(res.message);
  }
}

async function quickLogin(email, pass) {
  const res = await db.login(email, pass);
  if (res.success) {
    renderHeader();
    if (res.user.role === 'instructor') {
      navigate('instructor-dashboard');
    } else {
      navigate('catalog');
    }
  }
}

/* ==========================================================================
   VIEW 1: Student Course Catalog View
   ========================================================================== */
function renderCatalogView(container) {
  const courses = db.courses;

  container.innerHTML = `
    <!-- Hero Banner -->
    <div class="hero">
      <div class="badge badge-cyan" style="margin-bottom:0.75rem;">
        <i data-lucide="sparkles"></i> Plataforma Educativa LMS / EdTech 2026
      </div>
      <h1 class="hero-title">Aprende habilidades de alto impacto sin límites</h1>
      <p class="hero-subtitle">Cursos interactivos pregrabados, evaluaciones en tiempo real y certificación oficial respaldada por la industria.</p>
      
      <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="navigate('catalog')">
          <i data-lucide="compass"></i> Explorar Catálogo
        </button>
        <button class="btn btn-secondary" onclick="openSubscriptionModal()">
          <i data-lucide="zap"></i> Ver Planes de Membresía
        </button>
      </div>

      <div class="hero-stats">
        <div class="stat-item">
          <span class="stat-value">+12,500</span>
          <span class="stat-label">Estudiantes Activos</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">99.4%</span>
          <span class="stat-label">Satisfacción de Clases</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">HLS 4K</span>
          <span class="stat-label">Streaming Adaptativo</span>
        </div>
      </div>
    </div>

    <!-- Filter & Search Section -->
    <div class="filter-bar">
      <div class="search-box">
        <i data-lucide="search"></i>
        <input type="text" id="catalog-search" class="search-input" placeholder="Buscar por título o palabra clave..." oninput="filterCatalog()">
      </div>
      <div class="filter-group">
        <select id="catalog-category" onchange="filterCatalog()">
          <option value="all">Todas las Categorías</option>
          <option value="Programación">Programación</option>
          <option value="Diseño">Diseño</option>
          <option value="IA & Ciencia de Datos">IA & Ciencia de Datos</option>
          <option value="Negocios">Negocios</option>
        </select>
        <select id="catalog-level" onchange="filterCatalog()">
          <option value="all">Todos los Niveles</option>
          <option value="Principiante">Principiante</option>
          <option value="Intermedio">Intermedio</option>
          <option value="Avanzado">Avanzado</option>
        </select>
        <select id="catalog-evaluation" onchange="filterCatalog()">
          <option value="all">Todas las Evaluaciones</option>
          <option value="with_quiz">Con Evaluaciones / Quizzes</option>
          <option value="high_score">Evaluaciones Exigentes (≥80%)</option>
          <option value="passed_by_me">Evaluaciones Aprobadas por mí</option>
        </select>
      </div>
    </div>

    <!-- Course Cards Grid -->
    <div id="course-grid-container" class="course-grid">
      ${renderCourseCards(courses)}
    </div>
  `;
}

function renderCourseCards(courseList) {
  if (!courseList || courseList.length === 0) {
    return `<div style="grid-column: 1/-1; text-align:center; padding:3rem; color:var(--text-muted);">No se encontraron cursos que coincidan con la búsqueda.</div>`;
  }

  return courseList.map(course => {
    const isEnrolled = db.currentUser && db.currentUser.enrolledCourses ? db.currentUser.enrolledCourses.includes(course.id) : false;
    const userProgress = db.currentUser && db.currentUser.progress ? db.currentUser.progress[course.id] : null;
    const completionStats = CertificateEngine.calculateCourseCompletion(course, userProgress);

    return `
      <div class="course-card">
        <div class="course-thumb">
          <span class="badge badge-indigo course-category-tag">${course.category}</span>
          <img src="${course.image}" alt="${course.title}" />
        </div>
        <div class="course-body">
          <h3 class="course-title">${course.title}</h3>
          <div class="course-instructor">
            <span class="avatar" style="width:24px; height:24px; font-size:0.75rem;">${course.instructorAvatar}</span>
            <span>${course.instructor}</span>
          </div>

          <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem; display:flex; gap:0.5rem; align-items:center;">
            <span class="badge badge-cyan">${course.level}</span>
            <span>• ${course.modules.length} Módulos</span>
          </div>

          ${isEnrolled ? `
            <div style="margin-top:auto;">
              <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:600; color:var(--accent-secondary); margin-bottom:0.3rem;">
                <span>Progreso</span>
                <span>${completionStats.percentage}%</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${completionStats.percentage}%;"></div>
              </div>
              <button class="btn btn-primary" style="width:100%; margin-top:0.85rem;" onclick="navigate('learning-player', { courseId: '${course.id}' })">
                <i data-lucide="play-circle"></i> Continuar Aprendiendo
              </button>
              <button class="btn btn-secondary btn-sm" style="width:100%; margin-top:0.4rem; font-size:0.8rem; padding:0.3rem 0.6rem;" onclick="openCourseRatingModal('${course.id}')">
                <i data-lucide="star" style="width:13px; height:13px; fill:#eab308; color:#eab308;"></i> ${userProgress && userProgress.myRating ? 'Mi Calificación: ' + userProgress.myRating.rating + '★' : 'Calificar Curso'}
              </button>
            </div>
          ` : `
            <div class="course-meta">
              <div class="rating">
                <i data-lucide="star" style="width:16px; height:16px; fill:#f59e0b;"></i>
                <span>${course.rating} (${course.reviewsCount})</span>
              </div>
              <div class="course-price">$${course.price}</div>
            </div>
            <button class="btn btn-secondary" style="width:100%; margin-top:0.85rem;" onclick="navigate('course-detail', { courseId: '${course.id}' })">
              Ver Detalles e Inscribirme
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function filterCatalog() {
  const query = document.getElementById('catalog-search')?.value.toLowerCase() || '';
  const category = document.getElementById('catalog-category')?.value || 'all';
  const level = document.getElementById('catalog-level')?.value || 'all';
  const evaluation = document.getElementById('catalog-evaluation')?.value || 'all';

  const user = db.currentUser;

  const filtered = db.courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(query) || course.description.toLowerCase().includes(query);
    const matchesCat = category === 'all' || course.category === category;
    const matchesLevel = level === 'all' || course.level === level;

    let matchesEval = true;
    const courseQuizzes = course.modules.flatMap(m => m.quiz ? [m.quiz] : []);
    if (evaluation === 'with_quiz') {
      matchesEval = courseQuizzes.length > 0;
    } else if (evaluation === 'high_score') {
      matchesEval = courseQuizzes.some(q => q.passingScore >= 80);
    } else if (evaluation === 'passed_by_me') {
      if (!user || !user.progress || !user.progress[course.id] || !user.progress[course.id].quizScores) {
        matchesEval = false;
      } else {
        const scores = user.progress[course.id].quizScores;
        matchesEval = Object.keys(scores).length > 0 && Object.values(scores).some(s => s >= 70);
      }
    }

    return matchesSearch && matchesCat && matchesLevel && matchesEval;
  });

  const grid = document.getElementById('course-grid-container');
  if (grid) {
    grid.innerHTML = renderCourseCards(filtered);
    if (window.lucide) lucide.createIcons();
  }
}

/* ==========================================================================
   VIEW 2: Course Detail Landing Page
   ========================================================================== */
function renderCourseDetailView(container, courseId) {
  const course = db.courses.find(c => c.id === courseId) || db.courses[0];
  const isEnrolled = db.currentUser && db.currentUser.enrolledCourses ? db.currentUser.enrolledCourses.includes(course.id) : false;

  container.innerHTML = `
    <div style="margin-bottom:1.5rem;">
      <button class="btn btn-secondary btn-sm" onclick="navigate('catalog')">
        <i data-lucide="arrow-left"></i> Volver al Catálogo
      </button>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:2rem;">
      <div>
        <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap; margin-bottom:0.75rem;">
          <span class="badge badge-indigo">${course.category} • ${course.level}</span>
          <span class="badge badge-yellow" style="background:rgba(234,179,8,0.15); color:#eab308; border:1px solid rgba(234,179,8,0.3); display:inline-flex; align-items:center; gap:0.25rem;">
            <i data-lucide="star" style="width:13px; height:13px; fill:#eab308;"></i> ${course.rating || 5.0} (${course.reviews ? course.reviews.length : (course.reviewsCount || 0)} valoraciones)
          </span>
          <button class="btn btn-secondary btn-sm" style="font-size:0.75rem; padding:0.2rem 0.55rem;" onclick="openCourseRatingModal('${course.id}')">
            <i data-lucide="star" style="width:12px; height:12px; color:#eab308;"></i> Calificar Curso
          </button>
        </div>
        <h1 style="font-size:1.8rem; font-weight:800; margin-bottom:1rem;">${course.title}</h1>
        <p style="font-size:1rem; color:var(--text-muted); margin-bottom:1.5rem; line-height:1.6;">${course.description}</p>

        <div style="display:flex; gap:1rem; align-items:center; margin-bottom:2rem; padding:1rem; background:var(--bg-card); border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div class="avatar" style="width:44px; height:44px; font-size:1rem;">${course.instructorAvatar}</div>
          <div>
            <div style="font-weight:700;">Instructor: ${course.instructor}</div>
            <div style="font-size:0.85rem; color:var(--text-muted);">${course.instructorBio}</div>
          </div>
        </div>

        <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:1rem;">Lo que aprenderás en este curso</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:0.75rem; margin-bottom:2rem;">
          ${course.learningGoals.map(goal => `
            <div style="display:flex; align-items:center; gap:0.5rem; background:var(--bg-secondary); padding:0.75rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
              <i data-lucide="check-circle-2" style="color:var(--success); width:18px; height:18px; flex-shrink:0;"></i>
              <span style="font-size:0.85rem;">${goal}</span>
            </div>
          `).join('')}
        </div>

        <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:1rem;">Plan Temático (Temario del Curso)</h3>
        <div style="margin-bottom:2rem;">
          ${course.modules.map(mod => `
            <div class="module-accordion" style="margin-bottom:0.75rem;">
              <div class="module-header">
                <span>${mod.title}</span>
                <span class="badge badge-cyan">${mod.lessons.length} Lecciones</span>
              </div>
              <div class="lesson-list">
                ${mod.lessons.map(les => `
                  <div class="lesson-item" style="cursor:default;">
                    <i data-lucide="video" style="width:16px; height:16px; color:var(--text-dim);"></i>
                    <span style="flex:1;">${les.title}</span>
                    <span style="font-size:0.8rem; color:var(--text-dim);">${les.duration}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Student Reviews & Ratings Section -->
        <div style="margin-bottom:2rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h3 style="font-size:1.2rem; font-weight:700; margin:0;">Reseñas y Calificaciones</h3>
              <span style="font-size:0.85rem; color:var(--text-muted);">Puntuación promedio de ${course.rating || 5.0} de 5 estrellas</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="openCourseRatingModal('${course.id}')">
              <i data-lucide="star"></i> Dejar mi Calificación
            </button>
          </div>

          <div class="reviews-list">
            ${(!course.reviews || course.reviews.length === 0) ? `
              <p style="color:var(--text-muted); font-size:0.9rem;">Sé el primer estudiante en calificar este curso.</p>
            ` : course.reviews.map(r => `
              <div class="review-item-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <div class="avatar" style="width:28px; height:28px; font-size:0.75rem;">${r.avatar || '🎓'}</div>
                    <span style="font-weight:600; font-size:0.85rem;">${r.studentName}</span>
                  </div>
                  <div style="display:flex; gap:0.15rem; color:#eab308;">
                    ${[1, 2, 3, 4, 5].map(st => `
                      <span style="font-size:0.9rem;">${st <= (r.rating || 5) ? '★' : '☆'}</span>
                    `).join('')}
                  </div>
                </div>
                <p style="font-size:0.85rem; color:var(--text-muted); margin:0;">${r.comment}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Purchase Sidebar -->
      <div>
        <div style="background:var(--bg-card); border:1px solid var(--border-highlight); border-radius:var(--radius-xl); padding:1.5rem; box-shadow:var(--shadow-lg);">
          <img src="${course.image}" style="width:100%; height:180px; object-fit:cover; border-radius:var(--radius-md); margin-bottom:1.25rem;" />

          <div style="display:flex; align-items:baseline; gap:0.75rem; margin-bottom:1.25rem;">
            <span style="font-size:1.8rem; font-weight:800; color:var(--accent-secondary);">$${course.price} USD</span>
            <span style="font-size:0.85rem; color:var(--text-dim); text-decoration:line-through;">$${(course.price * 1.5).toFixed(2)}</span>
          </div>

          ${isEnrolled ? `
            <button class="btn btn-primary" style="width:100%; margin-bottom:1rem;" onclick="navigate('learning-player', { courseId: '${course.id}' })">
              <i data-lucide="play-circle"></i> Ir al Aula Virtual
            </button>
          ` : `
            <button class="btn btn-primary" style="width:100%; margin-bottom:1rem;" onclick="openCheckoutModal('${course.id}')">
              <i data-lucide="shopping-bag"></i> Comprar Curso Ahora
            </button>
            <button class="btn btn-secondary" style="width:100%; margin-bottom:1.25rem;" onclick="openSubscriptionModal()">
              <i data-lucide="zap"></i> Obtener con Pase Pro ($29.99/mes)
            </button>
          `}

          <div style="font-size:0.85rem; color:var(--text-muted);">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem;">
              <i data-lucide="shield-check" style="color:var(--success); width:18px;"></i>
              <span>Acceso de por vida ilimitado</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem;">
              <i data-lucide="award" style="color:var(--warning); width:18px;"></i>
              <span>Certificado digital oficial al 100%</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <i data-lucide="download" style="color:var(--accent-secondary); width:18px;"></i>
              <span>Archivos de trabajo y PDFs descargables</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   VIEW 3: Classroom Interactive Learning Player
   ========================================================================== */

function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const match = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function renderLearningPlayerView(container, courseId, lessonId = null) {
  const course = db.courses.find(c => c.id === courseId) || db.courses[0];
  currentActiveCourse = course;

  let targetLesson = null;
  let targetModule = null;

  course.modules.forEach(mod => {
    mod.lessons.forEach(les => {
      if (les.id === lessonId || (!targetLesson && !lessonId)) {
        targetLesson = les;
        targetModule = mod;
      }
    });
  });

  if (!targetLesson) {
    targetModule = course.modules[0];
    targetLesson = targetModule.lessons[0];
  }

  currentActiveLesson = targetLesson;
  const userProgress = db.currentUser ? (db.currentUser.progress[course.id] || { completedLessons: [], quizScores: {} }) : { completedLessons: [], quizScores: {} };
  const completionStats = CertificateEngine.calculateCourseCompletion(course, userProgress);

  // Compute lesson index list for Next/Previous lesson navigation
  const allLessonsList = [];
  course.modules.forEach(m => {
    m.lessons.forEach(l => {
      allLessonsList.push({ lesson: l, module: m });
    });
  });
  const currentIdx = allLessonsList.findIndex(item => item.lesson.id === targetLesson.id);
  const prevLessonItem = currentIdx > 0 ? allLessonsList[currentIdx - 1] : null;
  const nextLessonItem = currentIdx >= 0 && currentIdx < allLessonsList.length - 1 ? allLessonsList[currentIdx + 1] : null;
  const isTargetCompleted = userProgress.completedLessons.includes(targetLesson.id);

  container.innerHTML = `
    <!-- Top Classroom Header Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.75rem;">
      <div style="display:flex; align-items:center; gap:0.75rem;">
        <button class="btn btn-secondary btn-sm" onclick="navigate('catalog')">
          <i data-lucide="arrow-left"></i> Catálogo
        </button>
        <div>
          <h2 style="font-size:1.1rem; font-weight:700;">${course.title}</h2>
          <span style="font-size:0.8rem; color:var(--text-muted);">${targetModule.title} • ${targetLesson.title}</span>
        </div>
      </div>
      <div id="classroom-header-progress-slot" style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="openCourseRatingModal('${course.id}')" title="Calificar este curso con estrellas">
          <i data-lucide="star" style="width:14px; height:14px; fill:#eab308; color:#eab308;"></i>
          ${userProgress && userProgress.myRating ? `Mi Calificación: ${userProgress.myRating.rating}★` : 'Calificar Curso'}
        </button>
        ${completionStats.isEligible ? `
          <button id="btn-download-cert-header" class="btn btn-primary btn-sm animate-pulse" onclick="showCertificateModal('${course.id}')">
            <i data-lucide="award"></i> Descargar Certificado PDF
          </button>
        ` : `
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span id="classroom-progress-text" style="font-size:0.8rem; font-weight:600; color:var(--accent-secondary);">Progreso: ${completionStats.percentage}%</span>
            <div class="progress-bar-container" style="width:120px;">
              <div id="classroom-progress-fill" class="progress-bar-fill" style="width:${completionStats.percentage}%;"></div>
            </div>
          </div>
        `}
      </div>
    </div>

    <!-- Classroom Main Grid -->
    <div class="classroom-layout">
      <!-- Video & Tabs Column -->
      <div>
        ${(() => {
          const ytId = extractYouTubeId(targetLesson.videoUrl);
          if (ytId) {
            return `
              <div class="video-container" style="position:relative; width:100%; aspect-ratio:16/9; border-radius:var(--radius-lg); overflow:hidden; background:#000;">
                <div class="signed-url-badge" style="z-index:3; top:12px; left:12px; background:rgba(0,0,0,0.8); border:1px solid rgba(239,68,68,0.5); color:#ef4444; display:flex; align-items:center; gap:0.4rem;">
                  <i data-lucide="youtube" style="width:14px; height:14px; fill:#ef4444; stroke:#ef4444;"></i>
                  <span id="signed-token-display">YouTube Video Oficial</span>
                </div>
                <iframe id="youtube-player-iframe"
                  src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&enablejsapi=1"
                  title="${targetLesson.title}"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                  style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;">
                </iframe>
              </div>
            `;
          } else {
            return `
              <div class="video-container">
                <div class="signed-url-badge">
                  <i data-lucide="lock" style="width:14px; height:14px;"></i>
                  <span id="signed-token-display">HLS Firmado Protegido</span>
                </div>
                <video id="hls-video-element" class="video-player" controls poster="${course.image}"></video>
              </div>
            `;
          }
        })()}

        <!-- Video Navigation Bar & Lesson Progress Tracker -->
        <div class="video-nav-bar" style="display:flex; justify-content:space-between; align-items:center; margin-top:0.6rem; padding:0.6rem 0.8rem; background:var(--bg-card); border-radius:var(--radius-md); border:1px solid var(--border-color); flex-wrap:wrap; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
            <button id="btn-toggle-complete" class="btn ${isTargetCompleted ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleCurrentLessonComplete('${course.id}', '${targetLesson.id}')">
              <i data-lucide="${isTargetCompleted ? 'check-circle-2' : 'check'}"></i> ${isTargetCompleted ? 'Lección Completada ✓' : 'Marcar Lección como Vista'}
            </button>
            <span id="video-progress-indicator-badge" class="badge ${isTargetCompleted ? 'badge-green' : 'badge-indigo'}" style="font-size:0.75rem;">
              ${isTargetCompleted ? 'Completada 100%' : 'Reproducción: 0%'}
            </span>
          </div>
          <div style="display:flex; gap:0.4rem;">
            ${prevLessonItem ? `
              <button class="btn btn-secondary btn-sm" onclick="navigate('learning-player', { courseId: '${course.id}', lessonId: '${prevLessonItem.lesson.id}' })">
                <i data-lucide="skip-back"></i> Anterior
              </button>
            ` : ''}
            ${nextLessonItem ? `
              <button class="btn btn-primary btn-sm" onclick="navigate('learning-player', { courseId: '${course.id}', lessonId: '${nextLessonItem.lesson.id}' })">
                Siguiente Lección <i data-lucide="skip-forward"></i>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Player Control Adjustments Bar -->
        <div class="video-controls-bar" style="margin-top:0.6rem;">
          ${extractYouTubeId(targetLesson.videoUrl) ? `
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
              <span class="badge badge-red" style="display:inline-flex; align-items:center; gap:0.35rem; font-size:0.8rem; padding:0.3rem 0.65rem;">
                <i data-lucide="youtube" style="width:14px; height:14px; fill:#ef4444; stroke:#ef4444;"></i> Reproductor YouTube HD
              </span>
              <span style="font-size:0.8rem; color:var(--text-muted);">Controles nativos, velocidad y subtítulos dentro del video</span>
            </div>
          ` : `
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
              <label style="font-size:0.8rem; color:var(--text-muted);">Calidad HLS:</label>
              <select id="video-quality-select" style="padding:0.25rem 0.5rem; font-size:0.8rem; max-width:180px;">
                <option value="-1">Auto (Adaptativo HLS)</option>
              </select>
            </div>
            <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap;">
              <label style="font-size:0.8rem; color:var(--text-muted);">Velocidad:</label>
              <button class="btn btn-secondary btn-sm" onclick="activeHlsPlayer.setSpeed(1.0)">1x</button>
              <button class="btn btn-secondary btn-sm" onclick="activeHlsPlayer.setSpeed(1.25)">1.25x</button>
              <button class="btn btn-secondary btn-sm" onclick="activeHlsPlayer.setSpeed(1.5)">1.5x</button>
            </div>
          `}
        </div>

        <!-- Lesson Tabs (Resources, Quiz, Forum) -->
        <div class="classroom-tabs">
          <div class="tab-nav">
            <button class="tab-btn active" id="tab-btn-resources" onclick="switchLessonTab('resources')">
              <i data-lucide="download" style="width:16px;"></i> Recursos Descargables (${targetLesson.resources ? targetLesson.resources.length : 0})
            </button>
            <button class="tab-btn" id="tab-btn-quiz" onclick="switchLessonTab('quiz')">
              <i data-lucide="help-circle" style="width:16px;"></i> Quiz del Módulo
            </button>
            <button class="tab-btn" id="tab-btn-forum" onclick="switchLessonTab('forum')">
              <i data-lucide="message-square" style="width:16px;"></i> Foro Q&A
            </button>
            <button class="tab-btn" id="tab-btn-reviews" onclick="switchLessonTab('reviews')">
              <i data-lucide="star" style="width:16px; color:#eab308;"></i> Reseñas & Calificaciones (${course.reviews ? course.reviews.length : 0})
            </button>
          </div>

          <!-- TAB CONTENT: Resources -->
          <div id="tab-content-resources">
            <h4 style="font-weight:700; margin-bottom:0.75rem;">Zona de Archivos y Material de Apoyo Oficial</h4>
            ${(!targetLesson.resources || targetLesson.resources.length === 0) ? `
              <p style="color:var(--text-muted);">Esta lección no incluye archivos adjuntos adicionales.</p>
            ` : targetLesson.resources.map(res => `
              <div class="resource-card">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <div style="width:36px; height:36px; background:rgba(99,102,241,0.15); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; color:var(--accent-primary); flex-shrink:0;">
                    <i data-lucide="file-text"></i>
                  </div>
                  <div>
                    <div style="font-weight:600; font-size:0.9rem;">${res.name}</div>
                    <div style="font-size:0.75rem; color:var(--text-dim);">${res.type} • ${res.size} • Material Oficial del Módulo</div>
                  </div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="downloadResourceFile('${res.name}', '${res.type}', '${course.id}', '${targetModule.id}', '${targetLesson.id}')">
                  <i data-lucide="download"></i> Descargar
                </button>
              </div>
            `).join('')}
          </div>

          <!-- TAB CONTENT: Quiz -->
          <div id="tab-content-quiz" style="display:none;">
            ${renderQuizSection(targetModule.quiz, course.id)}
          </div>

          <!-- TAB CONTENT: Q&A Forum -->
          <div id="tab-content-forum" style="display:none;">
            <div style="display:flex; gap:0.5rem; margin-bottom:1.25rem;">
              <input type="text" id="forum-input" placeholder="Haz una pregunta al instructor..." style="flex:1;">
              <button class="btn btn-primary btn-sm" onclick="postForumComment('${targetLesson.id}')">
                <i data-lucide="send"></i> Publicar
              </button>
            </div>
            <div id="forum-comments-container">
              ${renderForumComments(targetLesson.id)}
            </div>
          </div>

          <!-- TAB CONTENT: Reviews & Star Ratings -->
          <div id="tab-content-reviews" style="display:none;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; padding-bottom:0.75rem; border-bottom:1px solid var(--border-color); flex-wrap:wrap; gap:0.75rem;">
              <div>
                <h4 style="font-weight:700; margin:0 0 0.2rem 0;">Calificaciones y Experiencias</h4>
                <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; color:var(--text-muted);">
                  <span style="font-size:1.1rem; font-weight:800; color:#eab308;">${course.rating || 5.0} ★</span>
                  <span>• Basado en ${course.reviews ? course.reviews.length : (course.reviewsCount || 0)} opiniones de estudiantes</span>
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="openCourseRatingModal('${course.id}')">
                <i data-lucide="star"></i> ${userProgress && userProgress.myRating ? 'Modificar Mi Calificación' : 'Calificar este Curso'}
              </button>
            </div>

            ${userProgress && userProgress.myRating ? `
              <div style="background:rgba(234,179,8,0.08); border:1px solid rgba(234,179,8,0.3); border-radius:var(--radius-md); padding:1rem; margin-bottom:1.25rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                  <span style="font-weight:700; font-size:0.9rem; color:#eab308;">Tu Calificación Registrada:</span>
                  <div style="color:#eab308; font-size:1.1rem;">
                    ${'★'.repeat(userProgress.myRating.rating)}${'☆'.repeat(5 - userProgress.myRating.rating)}
                  </div>
                </div>
                <p style="font-size:0.85rem; color:var(--text-primary); margin:0;">"${userProgress.myRating.comment || 'Sin comentario adicional.'}"</p>
              </div>
            ` : ''}

            <div class="reviews-list">
              ${(!course.reviews || course.reviews.length === 0) ? `
                <p style="color:var(--text-muted); font-size:0.85rem;">Sé el primer estudiante en calificar este curso.</p>
              ` : course.reviews.map(r => `
                <div class="review-item-card">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                      <div class="avatar" style="width:26px; height:26px; font-size:0.75rem;">${r.avatar || '🎓'}</div>
                      <span style="font-weight:600; font-size:0.85rem;">${r.studentName}</span>
                    </div>
                    <div style="display:flex; gap:0.1rem; color:#eab308; font-size:0.9rem;">
                      ${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}
                    </div>
                  </div>
                  <p style="font-size:0.85rem; color:var(--text-muted); margin:0;">${r.comment}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Syllabus Accordion Sidebar Column -->
      <div class="syllabus-sidebar">
        <div class="syllabus-header">
          <h3 style="font-size:1rem; font-weight:700;">Contenido del Curso</h3>
          <div id="syllabus-completed-count" style="font-size:0.8rem; color:var(--text-muted); margin-top:0.2rem;">
            ${userProgress.completedLessons.length} de ${allLessonsList.length} lecciones completadas (${completionStats.percentage}%)
          </div>
          <div class="progress-bar-container" style="height:5px; margin-top:0.4rem;">
            <div id="syllabus-progress-bar-fill" class="progress-bar-fill" style="width:${completionStats.percentage}%;"></div>
          </div>
        </div>

        <div class="syllabus-body">
          ${course.modules.map((mod, modIdx) => {
            const isModComplete = mod.lessons.every(l => userProgress.completedLessons.includes(l.id));
            return `
              <div class="module-accordion">
                <div class="module-header" onclick="toggleAccordion('mod-body-${modIdx}')" style="display:flex; align-items:center; justify-content:space-between;">
                  <span style="flex:1; line-height:1.2; font-weight:600;">${mod.title}</span>
                  ${isModComplete ? '<span class="badge badge-green" style="font-size:0.65rem; margin-right:0.4rem;">✓ Completado</span>' : ''}
                  <i data-lucide="chevron-down" style="width:16px;"></i>
                </div>
                <div id="mod-body-${modIdx}" class="lesson-list">
                  ${mod.lessons.map(les => {
                    const isCompleted = userProgress.completedLessons.includes(les.id);
                    const isCurrent = les.id === targetLesson.id;

                    return `
                      <div class="lesson-item ${isCurrent ? 'active' : ''}" onclick="navigate('learning-player', { courseId: '${course.id}', lessonId: '${les.id}' })">
                        <div id="lesson-status-${les.id}" class="lesson-status-icon ${isCompleted ? 'status-completed' : isCurrent ? 'status-current' : 'status-locked'}">
                          ${isCompleted ? '<i data-lucide="check" style="width:12px;"></i>' : isCurrent ? '▶' : les.duration}
                        </div>
                        <span style="flex:1; line-height:1.3;">${les.title}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  // Destroy any existing HLS player instance first
  if (activeHlsPlayer) {
    try { activeHlsPlayer.destroy(); } catch (e) {}
    activeHlsPlayer = null;
  }

  // Initialize HLS video player engine only for non-YouTube streams
  const ytVideoCheck = extractYouTubeId(targetLesson.videoUrl);
  if (!ytVideoCheck) {
    activeHlsPlayer = new HlsStreamPlayer('hls-video-element', {
      onProgressCallback: (videoPercent, currentTime, duration) => {
        handleClassroomProgressTick(course, targetLesson, targetModule, videoPercent);
      },
      onEndedCallback: () => {
        handleClassroomLessonComplete(course, targetLesson, targetModule);
      }
    });

    activeHlsPlayer.loadStream(targetLesson.videoUrl, targetLesson.fallbackMp4);
  }
}

// Live Classroom Progress Tick Handler: smoothly advances progress as student watches video
function handleClassroomProgressTick(course, lesson, module, videoPercent) {
  const clamped = Math.min(100, Math.round(videoPercent));
  
  // Update video progress badge
  const badge = document.getElementById('video-progress-indicator-badge');
  if (badge) {
    if (clamped >= 90) {
      badge.className = 'badge badge-green';
      badge.innerText = 'Lección Completada (90%+)';
    } else {
      badge.className = 'badge badge-indigo';
      badge.innerText = `Reproducción: ${clamped}%`;
    }
  }

  // Persist live watched percentage in DB
  db.saveLessonProgress(course.id, lesson.id, clamped);

  // Recalculate dynamic course completion stats
  const liveStats = CertificateEngine.calculateCourseCompletion(course, db.currentUser ? db.currentUser.progress[course.id] : null, lesson.id, clamped);

  // Update top progress text & fill
  const progressText = document.getElementById('classroom-progress-text');
  if (progressText) {
    progressText.innerText = `Progreso: ${liveStats.percentage}%`;
  }
  const progressFill = document.getElementById('classroom-progress-fill');
  if (progressFill) {
    progressFill.style.width = `${liveStats.percentage}%`;
  }

  // Update syllabus completed count & progress bar
  const syllabusCount = document.getElementById('syllabus-completed-count');
  if (syllabusCount) {
    syllabusCount.innerText = `${liveStats.completed} de ${liveStats.total} lecciones completadas (${liveStats.percentage}%)`;
  }
  const syllabusFill = document.getElementById('syllabus-progress-bar-fill');
  if (syllabusFill) {
    syllabusFill.style.width = `${liveStats.percentage}%`;
  }

  // Check 100% eligibility to unlock certificate button in header
  if (liveStats.isEligible) {
    const certSlot = document.getElementById('classroom-header-progress-slot');
    if (certSlot && !document.getElementById('btn-download-cert-header')) {
      certSlot.innerHTML = `
        <button id="btn-download-cert-header" class="btn btn-primary btn-sm animate-pulse" onclick="showCertificateModal('${course.id}')">
          <i data-lucide="award"></i> Descargar Certificado PDF
        </button>
      `;
      if (window.lucide) lucide.createIcons();
    }
  }
}

// Lesson Finished / 90%+ Watched: Auto-completes lesson and module
function handleClassroomLessonComplete(course, lesson, module) {
  db.markLessonComplete(course.id, lesson.id);

  // Update badge & toggle button
  const badge = document.getElementById('video-progress-indicator-badge');
  if (badge) {
    badge.className = 'badge badge-green';
    badge.innerText = 'Lección Completada ✓';
  }
  const toggleBtn = document.getElementById('btn-toggle-complete');
  if (toggleBtn) {
    toggleBtn.className = 'btn btn-secondary btn-sm';
    toggleBtn.innerHTML = '<i data-lucide="check-circle-2"></i> Lección Completada ✓';
  }

  // Update lesson status icon in syllabus sidebar
  const statusIcon = document.getElementById(`lesson-status-${lesson.id}`);
  if (statusIcon) {
    statusIcon.className = 'lesson-status-icon status-completed';
    statusIcon.innerHTML = '<i data-lucide="check" style="width:12px;"></i>';
  }

  // Check if entire module is complete
  if (module && module.lessons.every(l => db.currentUser && db.currentUser.progress[course.id] && db.currentUser.progress[course.id].completedLessons.includes(l.id))) {
    db.markModuleCompleted(course.id, module.id);
  }

  const finalStats = CertificateEngine.calculateCourseCompletion(course, db.currentUser ? db.currentUser.progress[course.id] : null);

  const progressText = document.getElementById('classroom-progress-text');
  if (progressText) progressText.innerText = `Progreso: ${finalStats.percentage}%`;
  const progressFill = document.getElementById('classroom-progress-fill');
  if (progressFill) progressFill.style.width = `${finalStats.percentage}%`;
  const syllabusCount = document.getElementById('syllabus-completed-count');
  if (syllabusCount) syllabusCount.innerText = `${finalStats.completed} de ${finalStats.total} lecciones completadas (${finalStats.percentage}%)`;
  const syllabusFill = document.getElementById('syllabus-progress-bar-fill');
  if (syllabusFill) syllabusFill.style.width = `${finalStats.percentage}%`;

  if (window.lucide) lucide.createIcons();

  if (finalStats.isEligible) {
    const certSlot = document.getElementById('classroom-header-progress-slot');
    if (certSlot) {
      certSlot.innerHTML = `
        <button id="btn-download-cert-header" class="btn btn-primary btn-sm animate-pulse" onclick="showCertificateModal('${course.id}')">
          <i data-lucide="award"></i> Descargar Certificado PDF
        </button>
      `;
      if (window.lucide) lucide.createIcons();
    }
    showCertificateModal(course.id);
  }
}

// Student manual toggle for lesson completion
function toggleCurrentLessonComplete(courseId, lessonId) {
  const isNowComplete = db.toggleLessonComplete(courseId, lessonId);
  const course = db.courses.find(c => c.id === courseId);
  if (!course) return;

  const currentMod = course.modules.find(m => m.lessons.some(l => l.id === lessonId));

  // Update toggle button
  const toggleBtn = document.getElementById('btn-toggle-complete');
  if (toggleBtn) {
    toggleBtn.className = `btn ${isNowComplete ? 'btn-secondary' : 'btn-primary'} btn-sm`;
    toggleBtn.innerHTML = isNowComplete ? '<i data-lucide="check-circle-2"></i> Lección Completada ✓' : '<i data-lucide="check"></i> Marcar Lección como Vista';
  }

  // Update badge
  const badge = document.getElementById('video-progress-indicator-badge');
  if (badge) {
    badge.className = `badge ${isNowComplete ? 'badge-green' : 'badge-indigo'}`;
    badge.innerText = isNowComplete ? 'Completada 100%' : 'Reproducción: 0%';
  }

  // Update lesson status in syllabus
  const statusIcon = document.getElementById(`lesson-status-${lessonId}`);
  if (statusIcon) {
    statusIcon.className = `lesson-status-icon ${isNowComplete ? 'status-completed' : 'status-current'}`;
    statusIcon.innerHTML = isNowComplete ? '<i data-lucide="check" style="width:12px;"></i>' : '▶';
  }

  if (currentMod && isNowComplete && currentMod.lessons.every(l => db.currentUser && db.currentUser.progress[courseId] && db.currentUser.progress[courseId].completedLessons.includes(l.id))) {
    db.markModuleCompleted(courseId, currentMod.id);
  }

  const updatedStats = CertificateEngine.calculateCourseCompletion(course, db.currentUser ? db.currentUser.progress[courseId] : null);

  const progressText = document.getElementById('classroom-progress-text');
  if (progressText) progressText.innerText = `Progreso: ${updatedStats.percentage}%`;
  const progressFill = document.getElementById('classroom-progress-fill');
  if (progressFill) progressFill.style.width = `${updatedStats.percentage}%`;
  const syllabusCount = document.getElementById('syllabus-completed-count');
  if (syllabusCount) syllabusCount.innerText = `${updatedStats.completed} de ${updatedStats.total} lecciones completadas (${updatedStats.percentage}%)`;
  const syllabusFill = document.getElementById('syllabus-progress-bar-fill');
  if (syllabusFill) syllabusFill.style.width = `${updatedStats.percentage}%`;

  const certSlot = document.getElementById('classroom-header-progress-slot');
  if (certSlot) {
    if (updatedStats.isEligible) {
      certSlot.innerHTML = `
        <button id="btn-download-cert-header" class="btn btn-primary btn-sm animate-pulse" onclick="showCertificateModal('${course.id}')">
          <i data-lucide="award"></i> Descargar Certificado PDF
        </button>
      `;
    } else {
      certSlot.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span id="classroom-progress-text" style="font-size:0.8rem; font-weight:600; color:var(--accent-secondary);">Progreso: ${updatedStats.percentage}%</span>
          <div class="progress-bar-container" style="width:120px;">
            <div id="classroom-progress-fill" class="progress-bar-fill" style="width:${updatedStats.percentage}%;"></div>
          </div>
        </div>
      `;
    }
  }

  if (window.lucide) lucide.createIcons();

  if (updatedStats.isEligible && isNowComplete) {
    showCertificateModal(courseId);
  }
}

function switchLessonTab(tabName) {
  ['resources', 'quiz', 'forum', 'reviews'].forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const content = document.getElementById(`tab-content-${t}`);
    if (btn) btn.classList.toggle('active', t === tabName);
    if (content) content.style.display = t === tabName ? 'block' : 'none';
  });
}

function renderQuizSection(quiz, courseId) {
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return `<p style="color:var(--text-muted);">No hay evaluaciones registradas para este módulo.</p>`;
  }

  currentQuizState = {
    quizId: quiz.id,
    courseId: courseId,
    answers: {},
    submitted: false
  };

  return `
    <div class="quiz-container">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; padding-bottom:0.75rem; border-bottom:1px solid var(--border-color);">
        <div>
          <h3 style="font-weight:700;">${quiz.title}</h3>
          <p style="font-size:0.8rem; color:var(--text-muted);">Aprobación mínima: ${quiz.passingScore}%</p>
        </div>
        <span class="badge badge-indigo">${quiz.questions.length} Preguntas</span>
      </div>

      <div id="quiz-questions-body">
        ${quiz.questions.map((q, qIndex) => `
          <div style="margin-bottom:1.5rem;">
            <p style="font-weight:600; font-size:0.95rem; margin-bottom:0.6rem;">
              ${qIndex + 1}. ${q.question}
            </p>

            <div>
              ${q.options.map((opt, optIndex) => `
                <div class="quiz-option" id="q_${q.id}_opt_${optIndex}" onclick="selectQuizOption('${q.id}', ${optIndex})">
                  <span style="font-weight:700; color:var(--text-dim); width:18px;">${String.fromCharCode(65 + optIndex)}.</span>
                  <span>${opt}</span>
                </div>
              `).join('')}
            </div>

            <div id="explanation_${q.id}" style="display:none; margin-top:0.6rem; padding:0.6rem; background:rgba(6,182,212,0.1); border-left:3px solid var(--accent-secondary); font-size:0.8rem; color:var(--text-muted);">
              <strong>Explicación:</strong> ${q.explanation}
            </div>
          </div>
        `).join('')}
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
        <button id="quiz-submit-btn" class="btn btn-primary btn-sm" onclick="submitQuiz('${quiz.id}', ${quiz.passingScore}, ${quiz.questions.length})">
          Enviar Evaluación
        </button>
      </div>

      <div id="quiz-result-alert" style="display:none; margin-top:1.25rem; padding:1rem; border-radius:var(--radius-md); text-align:center;"></div>
    </div>
  `;
}

function selectQuizOption(questionId, optionIndex) {
  if (currentQuizState.submitted) return;
  currentQuizState.answers[questionId] = optionIndex;

  document.querySelectorAll(`[id^="q_${questionId}_opt_"]`).forEach(el => {
    el.classList.remove('selected');
  });
  const selectedEl = document.getElementById(`q_${questionId}_opt_${optionIndex}`);
  if (selectedEl) selectedEl.classList.add('selected');
}

function submitQuiz(quizId, passingScore, totalQuestions) {
  if (currentQuizState.submitted) return;

  const questions = currentActiveCourse.modules.flatMap(m => m.quiz ? m.quiz.questions : []);
  let correctCount = 0;

  questions.forEach(q => {
    const userChoice = currentQuizState.answers[q.id];
    const expEl = document.getElementById(`explanation_${q.id}`);
    if (expEl) expEl.style.display = 'block';

    if (userChoice === q.correctIndex) {
      correctCount++;
      const optEl = document.getElementById(`q_${q.id}_opt_${userChoice}`);
      if (optEl) optEl.classList.add('correct');
    } else if (userChoice !== undefined) {
      const optEl = document.getElementById(`q_${q.id}_opt_${userChoice}`);
      if (optEl) optEl.classList.add('incorrect');
      const correctEl = document.getElementById(`q_${q.id}_opt_${q.correctIndex}`);
      if (correctEl) correctEl.classList.add('correct');
    }
  });

  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePercentage >= passingScore;
  currentQuizState.submitted = true;

  db.saveQuizScore(currentActiveCourse.id, quizId, scorePercentage);

  const activeMod = currentActiveCourse.modules.find(m => m.quiz && m.quiz.id === quizId);
  if (passed && activeMod) {
    db.markModuleCompleted(currentActiveCourse.id, activeMod.id);
  }

  // Recalculate stats and update header and syllabus
  const updatedStats = CertificateEngine.calculateCourseCompletion(currentActiveCourse, db.currentUser ? db.currentUser.progress[currentActiveCourse.id] : null);
  const progressText = document.getElementById('classroom-progress-text');
  if (progressText) progressText.innerText = `Progreso: ${updatedStats.percentage}%`;
  const progressFill = document.getElementById('classroom-progress-fill');
  if (progressFill) progressFill.style.width = `${updatedStats.percentage}%`;
  const syllabusCount = document.getElementById('syllabus-completed-count');
  if (syllabusCount) syllabusCount.innerText = `${updatedStats.completed} de ${updatedStats.total} lecciones completadas (${updatedStats.percentage}%)`;
  const syllabusFill = document.getElementById('syllabus-progress-bar-fill');
  if (syllabusFill) syllabusFill.style.width = `${updatedStats.percentage}%`;

  const certSlot = document.getElementById('classroom-header-progress-slot');
  if (certSlot && updatedStats.isEligible && !document.getElementById('btn-download-cert-header')) {
    certSlot.innerHTML = `
      <button id="btn-download-cert-header" class="btn btn-primary btn-sm animate-pulse" onclick="showCertificateModal('${currentActiveCourse.id}')">
        <i data-lucide="award"></i> Descargar Certificado PDF
      </button>
    `;
    if (window.lucide) lucide.createIcons();
  }

  const resultAlert = document.getElementById('quiz-result-alert');
  if (resultAlert) {
    resultAlert.style.display = 'block';
    resultAlert.style.background = passed ? 'var(--success-bg)' : 'var(--danger-bg)';
    resultAlert.style.color = passed ? 'var(--success)' : 'var(--danger)';
    resultAlert.innerHTML = `
      <h3 style="font-weight:800; font-size:1.2rem;">${passed ? '🎉 ¡Felicidades! Has Aprobado la Evaluación' : '❌ No alcanzaste el puntaje'}</h3>
      <p style="margin-top:0.2rem; font-size:0.9rem;">Calificación obtenida: <strong>${scorePercentage}%</strong> (Requerido: ${passingScore}%)</p>
      ${passed ? `<div class="badge badge-green" style="margin-top:0.5rem; display:inline-flex;">✓ Módulo Aprobado y Completado Exitosamente</div>` : ''}
    `;
  }
}

function postForumComment(lessonId) {
  const input = document.getElementById('forum-input');
  if (!input || !input.value.trim()) return;

  db.addComment(lessonId, input.value.trim());
  input.value = '';

  const container = document.getElementById('forum-comments-container');
  if (container) {
    container.innerHTML = renderForumComments(lessonId);
  }
}

function renderForumComments(lessonId) {
  const comments = db.discussions[lessonId] || [];
  if (comments.length === 0) {
    return `<p style="color:var(--text-muted); font-size:0.85rem;">Sé el primero en hacer una pregunta sobre esta clase.</p>`;
  }

  return comments.map(c => `
    <div class="forum-comment">
      <div class="forum-comment-header">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span class="avatar" style="width:26px; height:26px; font-size:0.75rem;">${c.avatar}</span>
          <span style="font-weight:600; font-size:0.85rem;">${c.author}</span>
        </div>
        <span style="font-size:0.75rem; color:var(--text-dim);">${c.date}</span>
      </div>
      <p style="font-size:0.9rem; color:var(--text-main); margin-bottom:0.5rem;">${c.text}</p>
      
      ${c.replies ? c.replies.map(r => `
        <div style="margin-left:1.25rem; padding:0.5rem; background:rgba(99,102,241,0.1); border-left:2px solid var(--accent-primary); border-radius:var(--radius-sm); margin-top:0.4rem;">
          <div style="font-size:0.75rem; font-weight:700; color:var(--accent-primary);">${r.author} (Instructor)</div>
          <p style="font-size:0.8rem; color:var(--text-muted);">${r.text}</p>
        </div>
      `).join('') : ''}
    </div>
  `).join('');
}

function toggleAccordion(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }
}

/* ==========================================================================
   VIEW 4: Student Dashboard
   ========================================================================== */
function renderStudentDashboardView(container) {
  const user = db.currentUser;
  const enrolledCourses = db.courses.filter(c => user.enrolledCourses && user.enrolledCourses.includes(c.id));

  container.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
      <div>
        <h1 style="font-weight:800; font-size:1.6rem;">Mi Panel de Estudiante</h1>
        <p style="color:var(--text-muted); font-size:0.9rem;">Bienvenido(a) de nuevo, ${user.name}</p>
      </div>
      <div class="badge badge-indigo" style="padding:0.4rem 0.8rem; font-size:0.85rem;">
        Plan Activo: ${user.subscription ? (user.subscription.planId === 'plan_pro' ? 'Pase Pro Ilimitado' : 'Estudiante') : 'Estudiante'}
      </div>
    </div>

    <h3 style="font-weight:700; margin-bottom:1rem;">Mis Cursos Inscritos</h3>
    ${enrolledCourses.length === 0 ? `
      <div style="text-align:center; padding:3rem 1.5rem; background:var(--bg-card); border-radius:var(--radius-lg); border:1px dashed var(--border-highlight); margin-top:1rem;">
        <div class="logo-badge" style="width:54px; height:54px; margin:0 auto 1rem auto; font-size:1.4rem;">
          <i data-lucide="book-open"></i>
        </div>
        <h3 style="font-weight:700; font-size:1.2rem;">¡Bienvenido(a), ${user.name.split(' ')[0]}!</h3>
        <p style="color:var(--text-muted); max-width:500px; margin:0.5rem auto 1.5rem auto; font-size:0.9rem;">
          Aún no te has inscrito en ningún curso. Explora nuestro catálogo de formación y comienza a aprender hoy mismo.
        </p>
        <button class="btn btn-primary" onclick="navigate('catalog')">
          <i data-lucide="compass"></i> Explorar Catálogo de Cursos
        </button>
      </div>
    ` : `
      <div class="course-grid">
        ${renderCourseCards(enrolledCourses)}
      </div>
    `}
  `;
}

/* ==========================================================================
   VIEW 5: Instructor / Admin Studio Dashboard
   ========================================================================== */
function renderInstructorDashboardView(container) {
  const user = db.currentUser;
  const isDemoAdmin = user.email.toLowerCase() === 'admin@dev.com';

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
      <div>
        <h1 style="font-weight:800; font-size:1.6rem;">Panel del Instructor & Administración LMS</h1>
        <p style="color:var(--text-muted); font-size:0.9rem;">Hola ${user.name.split(' ')[0]}, gestiona tus contenidos, analiza métricas y administra accesos.</p>
      </div>
      <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
        <button class="btn btn-secondary btn-sm" onclick="handleLogout()" style="color:var(--danger); border-color:rgba(239,68,68,0.35);">
          <i data-lucide="log-out"></i> Cerrar Sesión
        </button>
        <button class="btn btn-primary btn-sm" onclick="openCreateCourseModal()">
          <i data-lucide="plus-circle"></i> Crear Nuevo Curso
        </button>
      </div>
    </div>

    <!-- Analytics Top Summary Grid -->
    <div class="analytics-grid">
      <div class="stat-card">
        <div class="stat-card-icon" style="background:rgba(99,102,241,0.2); color:#818cf8;">
          <i data-lucide="dollar-sign"></i>
        </div>
        <div>
          <div class="stat-label">Ingresos Totales</div>
          <div id="stat-total-revenue" class="stat-value">$0.00</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon" style="background:rgba(6,182,212,0.2); color:#22d3ee;">
          <i data-lucide="users"></i>
        </div>
        <div>
          <div class="stat-label">Suscriptores Activos</div>
          <div id="stat-active-subs" class="stat-value">0</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon" style="background:var(--success-bg); color:var(--success);">
          <i data-lucide="trending-up"></i>
        </div>
        <div>
          <div class="stat-label">Tasa de Finalización Promedio</div>
          <div id="stat-completion-rate" class="stat-value">0%</div>
        </div>
      </div>
    </div>

    <!-- Analytics Charts Section -->
    <div class="charts-row">
      <div class="chart-card">
        <h3 style="font-weight:700; margin-bottom:1rem; font-size:1rem;">Histórico de Ventas y Suscripciones ($USD)</h3>
        <canvas id="salesRevenueChart" height="120"></canvas>
      </div>
      <div class="chart-card">
        <h3 style="font-weight:700; margin-bottom:1rem; font-size:1rem;">Distribución de Avance de Estudiantes</h3>
        <div style="position:relative; height:240px; width:100%;">
          <canvas id="completionDoughnutChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Highest Dropoff Lessons Section -->
    <div class="chart-card" style="margin-bottom:2rem;">
      <h3 style="font-weight:700; margin-bottom:0.4rem; font-size:1rem;">Lecciones con Mayor Tasa de Abandono (Drop-off Rate)</h3>
      <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.85rem;">Identifica las clases donde los estudiantes interrumpen la reproducción para optimizar el contenido.</p>
      <div id="highest-dropoff-container"></div>
    </div>

    <!-- Studio Drag & Drop Curriculum Builder Section -->
    <div class="chart-card" style="margin-bottom:2rem;">
      <div id="drag-builder-mount"></div>
    </div>

    <!-- Student Access Control & Coupons Section -->
    <div class="charts-row">
      <!-- Access Control -->
      <div class="chart-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 style="font-weight:700; font-size:1rem;">Control de Acceso de Estudiantes</h3>
          <button class="btn btn-secondary btn-sm" onclick="openManualEnrollmentModal()">
            <i data-lucide="user-plus"></i> Inscripción Manual
          </button>
        </div>
        <div style="overflow-x:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Curso</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody id="access-control-tbody">
              ${renderAccessControlRows()}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Coupons Management -->
      <div class="chart-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 style="font-weight:700; font-size:1rem;">Cupones Promocionales</h3>
          <button class="btn btn-secondary btn-sm" onclick="openNewCouponModal()">
            <i data-lucide="tag"></i> Nuevo Cupón
          </button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descuento</th>
              <th>Usos Disp.</th>
            </tr>
          </thead>
          <tbody>
            ${db.coupons.map(c => `
              <tr>
                <td><strong style="color:var(--accent-secondary);">${c.code}</strong></td>
                <td><span class="badge badge-green">${c.discountPercent}% OFF</span></td>
                <td>${c.usesRemaining}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  setTimeout(() => {
    AnalyticsEngine.initDashboard();

    // Select target course for curriculum builder
    let targetCourseId = 'course_webdev';
    if (!isDemoAdmin && user.createdCourses && user.createdCourses.length > 0) {
      targetCourseId = user.createdCourses[0];
    } else if (!isDemoAdmin && (!user.createdCourses || user.createdCourses.length === 0)) {
      const mount = document.getElementById('drag-builder-mount');
      if (mount) {
        mount.innerHTML = `
          <div style="text-align:center; padding:2.5rem 1rem; background:var(--bg-secondary); border-radius:var(--radius-lg); border:1px dashed var(--border-highlight);">
            <div class="logo-badge" style="width:48px; height:48px; margin:0 auto 1rem auto; font-size:1.4rem;">
              <i data-lucide="sparkles"></i>
            </div>
            <h3 style="font-weight:700; font-size:1.2rem;">¡Bienvenido(a) a tu Studio de Instructor, ${user.name.split(' ')[0]}!</h3>
            <p style="color:var(--text-muted); max-width:500px; margin:0.5rem auto 1.5rem auto; font-size:0.85rem;">
              Aún no has publicado ningún curso como instructor. Haz clic en "Crear Nuevo Curso" para armar tu primer contenido.
            </p>
            <button class="btn btn-primary btn-sm" onclick="openCreateCourseModal()">
              <i data-lucide="plus-circle"></i> Crear Mi Primer Curso
            </button>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
      }
      return;
    }

    courseBuilder = new DragDropCourseBuilder('drag-builder-mount', targetCourseId);
    courseBuilder.init();
  }, 50);
}

function renderAccessControlRows() {
  const user = db.currentUser;
  const isDemoAdmin = user && user.email.toLowerCase() === 'admin@dev.com';

  let list = db.enrolledStudents || [];
  if (!isDemoAdmin && user) {
    const myCourseIds = db.courses
      .filter(c => (user.createdCourses && user.createdCourses.includes(c.id)) || c.instructor === user.name)
      .map(c => c.id);
    list = list.filter(st => myCourseIds.includes(st.courseId));
  }

  if (!list || list.length === 0) {
    return `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:1rem;">No hay estudiantes inscritos en tus cursos aún.</td></tr>`;
  }
  return list.map(st => {
    const course = db.courses.find(c => c.id === st.courseId);
    const isActive = st.status === 'Active';

    return `
      <tr>
        <td>
          <div style="font-weight:600;">${st.name}</div>
          <div style="font-size:0.75rem; color:var(--text-dim);">${st.email}</div>
        </td>
        <td style="font-size:0.8rem;">${course ? course.title : st.courseId}</td>
        <td>
          <span class="badge ${isActive ? 'badge-green' : 'badge-red'}">${isActive ? 'Activo' : 'Inactivo'}</span>
        </td>
        <td>
          <button class="btn ${isActive ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleStudentAccess('${st.id}')">
            <i data-lucide="${isActive ? 'user-x' : 'user-check'}" style="width:14px; height:14px;"></i>
            ${isActive ? 'Desactivar' : 'Activar'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function toggleStudentAccess(studentId) {
  const st = db.enrolledStudents.find(s => s.id === studentId);
  if (st) {
    st.status = st.status === 'Active' ? 'Revoked' : 'Active';
    
    // Also sync with matching user object in DB if present
    const userObj = db.data.users.find(u => u.email.toLowerCase() === st.email.toLowerCase() || u.id === st.id);
    if (userObj) {
      if (st.status === 'Active') {
        if (!userObj.enrolledCourses) userObj.enrolledCourses = [];
        if (!userObj.enrolledCourses.includes(st.courseId)) {
          userObj.enrolledCourses.push(st.courseId);
        }
        userObj.status = 'active';
      } else {
        if (userObj.enrolledCourses) {
          userObj.enrolledCourses = userObj.enrolledCourses.filter(cid => cid !== st.courseId);
        }
      }
      
      // If current active logged-in session belongs to this revoked user, logout & notify
      if (userObj.id === db.data.activeUserId && st.status === 'Revoked') {
        alert(`Has desactivado el acceso del usuario actualmente en sesión (${userObj.name}). Se cerrará la sesión.`);
        db.logout();
        renderHeader();
        navigate('login');
        return;
      }
    }

    db.save();
    const tbody = document.getElementById('access-control-tbody');
    if (tbody) tbody.innerHTML = renderAccessControlRows();
    if (window.lucide) lucide.createIcons();
  }
}

function openCreateCourseModal() {
  const modal = document.getElementById('global-modal-overlay');
  const card = document.getElementById('global-modal-card');
  if (!modal || !card) return;

  card.style.maxWidth = '550px';
  card.innerHTML = `
    <div class="modal-header">
      <h3 style="font-weight:700;">Crear Nuevo Curso</h3>
      <button onclick="closeModal()" style="color:var(--text-dim); font-size:1.2rem;">✕</button>
    </div>

    <form onsubmit="event.preventDefault(); submitCreateCourse();">
      <div style="margin-bottom:1rem;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Título del Curso:</label>
        <input type="text" id="new-course-title" placeholder="Ej. Desarrollo de Apps Android en Kotlin" required style="width:100%;">
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem; margin-bottom:1rem;">
        <div>
          <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Categoría:</label>
          <select id="new-course-category" style="width:100%;">
            <option value="Programación">Programación</option>
            <option value="Diseño">Diseño</option>
            <option value="IA & Ciencia de Datos">IA & Ciencia de Datos</option>
            <option value="Negocios">Negocios</option>
          </select>
        </div>
        <div>
          <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Nivel:</label>
          <select id="new-course-level" style="width:100%;">
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem; margin-bottom:1rem;">
        <div>
          <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Precio ($USD):</label>
          <input type="number" step="0.01" id="new-course-price" value="79.99" required style="width:100%;">
        </div>
        <div>
          <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Instructor:</label>
          <input type="text" id="new-course-instructor" value="${db.currentUser ? db.currentUser.name : 'Ing. Mateo Rossi'}" required style="width:100%;">
        </div>
      </div>

      <!-- Custom Course Cover Photo -->
      <div style="margin-bottom:1rem;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Foto de Portada del Curso:</label>
        <div style="display:flex; gap:0.75rem; align-items:center; background:var(--bg-secondary); padding:0.6rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <img id="new-course-cover-preview" src="assets/images/course_webdev.png" style="width:110px; height:65px; object-fit:cover; border-radius:var(--radius-sm); border:1px solid var(--border-color); flex-shrink:0;">
          <div style="flex:1;">
            <input type="file" id="new-course-cover-file" accept="image/*" style="display:none;" onchange="handleNewCourseCoverSelected(this)">
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('new-course-cover-file').click()" style="margin-bottom:0.35rem; width:100%; justify-content:center;">
              <i data-lucide="image"></i> Subir Foto de Portada
            </button>
            <input type="text" id="new-course-cover-url" placeholder="O escribe URL de imagen..." style="width:100%; font-size:0.75rem; padding:0.25rem 0.5rem;" oninput="handleNewCourseCoverUrl(this.value)">
          </div>
        </div>
      </div>

      <div style="margin-bottom:1.25rem;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Descripción del Curso:</label>
        <textarea id="new-course-desc" rows="3" placeholder="Resumen del contenido y objetivos del curso..." required style="width:100%;"></textarea>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary btn-sm">
          <i data-lucide="plus-circle"></i> Publicar Curso
        </button>
      </div>
    </form>
  `;

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function submitCreateCourse() {
  const title = document.getElementById('new-course-title')?.value.trim();
  const category = document.getElementById('new-course-category')?.value;
  const level = document.getElementById('new-course-level')?.value;
  const price = parseFloat(document.getElementById('new-course-price')?.value || '79.99');
  const instructor = document.getElementById('new-course-instructor')?.value.trim();
  const desc = document.getElementById('new-course-desc')?.value.trim();

  if (!title) return;

  const customCover = window._newCourseCoverDataUrl || document.getElementById('new-course-cover-url')?.value.trim() || 'assets/images/course_webdev.png';
  window._newCourseCoverDataUrl = null;

  const initials = instructor.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'IN';
  const newCourse = {
    id: 'course_' + Date.now(),
    title: title,
    category: category,
    level: level,
    rating: 5.0,
    reviewsCount: 1,
    price: price,
    instructor: instructor,
    instructorAvatar: initials,
    instructorBio: 'Instructor especialista certificado en el área.',
    image: customCover,
    description: desc,
    learningGoals: ['Dominio completo de los temas principales del programa'],
    modules: [
      {
        id: 'mod_' + Date.now(),
        title: 'Módulo 1: Fundamentos y Bienvenida',
        lessons: [
          {
            id: 'les_' + Date.now(),
            title: '1. Introducción general y objetivos del curso',
            duration: '10:00',
            videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            fallbackMp4: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            resources: [{ id: 'res_1', name: 'Guia_Inicial.pdf', type: 'PDF', size: '1.2 MB' }]
          }
        ],
        quiz: {
          id: 'quiz_' + Date.now(),
          title: 'Quiz del Módulo 1',
          passingScore: 80,
          questions: [
            {
              id: 'q1',
              question: '¿Comprendes la estructura general del curso?',
              options: ['Sí, totalmente claro', 'Necesito revisar más', 'Tengo dudas', 'No'],
              correctIndex: 0,
              explanation: 'Excelente comienzo.'
            }
          ]
        }
      }
    ]
  };

  db.courses.unshift(newCourse);
  if (db.currentUser) {
    if (!db.currentUser.createdCourses) db.currentUser.createdCourses = [];
    db.currentUser.createdCourses.unshift(newCourse.id);
  }
  db.save();
  closeModal();
  alert(`¡El curso "${title}" ha sido creado e incorporado exitosamente al catálogo!`);
  navigate('instructor-dashboard');
}

function openOptimizeLessonModal(lessonTitle, courseName) {
  const modal = document.getElementById('global-modal-overlay');
  const card = document.getElementById('global-modal-card');
  if (!modal || !card) return;

  card.style.maxWidth = '500px';
  card.innerHTML = `
    <div class="modal-header">
      <h3 style="font-weight:700;">Optimizar Lección (Drop-off Rate)</h3>
      <button onclick="closeModal()" style="color:var(--text-dim); font-size:1.2rem;">✕</button>
    </div>

    <div>
      <div style="margin-bottom:1rem; padding:0.75rem; background:var(--bg-primary); border-radius:var(--radius-md); border:1px solid var(--border-color);">
        <div style="font-size:0.8rem; color:var(--accent-secondary); font-weight:600;">${courseName}</div>
        <div style="font-weight:700; font-size:0.95rem;">${lessonTitle}</div>
      </div>

      <div style="margin-bottom:1rem;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Estrategia de Optimización:</label>
        <select id="opt-strategy" style="width:100%;">
          <option value="split">Fragmentar lección en 2 cápsulas breves de 5 min</option>
          <option value="reencode">Re-codificar video a menor bitrate (HLS 1080p / 720p)</option>
          <option value="reorganize">Agregar resumen en PDF y simplificar explicación</option>
        </select>
      </div>

      <div style="margin-bottom:1.25rem;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Nueva URL del Stream de Video (Opcional):</label>
        <input type="text" id="opt-videourl" value="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" style="width:100%;">
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
        <button class="btn btn-secondary btn-sm" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary btn-sm" onclick="submitOptimizeLesson('${lessonTitle}')">
          Aplicar Optimización
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function submitOptimizeLesson(lessonTitle) {
  const item = db.analytics.highestDropoffLessons.find(l => l.lessonTitle === lessonTitle);
  if (item) {
    item.dropoffRate = '11.8% (Optimizado)';
    db.save();
  }
  closeModal();
  alert(`Se han aplicado las optimizaciones de contenido a la lección "${lessonTitle}". Tasa de abandono reducida.`);
  navigate('instructor-dashboard');
}

function openManualEnrollmentModal() {
  const modal = document.getElementById('global-modal-overlay');
  const card = document.getElementById('global-modal-card');
  if (!modal || !card) return;

  card.style.maxWidth = '500px';
  card.innerHTML = `
    <div class="modal-header">
      <h3 style="font-weight:700;">Inscripción Manual de Estudiante</h3>
      <button onclick="closeModal()" style="color:var(--text-dim); font-size:1.2rem;">✕</button>
    </div>

    <form onsubmit="event.preventDefault(); submitManualEnrollment();">
      <div style="margin-bottom:1rem;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Nombre del Estudiante:</label>
        <input type="text" id="manual-student-name" placeholder="Ej. Roberto Gomez" required style="width:100%;">
      </div>

      <div style="margin-bottom:1rem;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Correo Electrónico:</label>
        <input type="email" id="manual-student-email" placeholder="roberto@ejemplo.com" required style="width:100%;">
      </div>

      <div style="margin-bottom:1.25rem;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Curso a Asignar:</label>
        <select id="manual-student-course" style="width:100%;">
          ${db.courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
        </select>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary btn-sm">
          <i data-lucide="user-plus"></i> Inscribir Estudiante
        </button>
      </div>
    </form>
  `;

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function submitManualEnrollment() {
  const name = document.getElementById('manual-student-name')?.value.trim();
  const email = document.getElementById('manual-student-email')?.value.trim();
  const courseId = document.getElementById('manual-student-course')?.value;

  if (!name || !email || !courseId) {
    alert('Por favor completa todos los campos del formulario.');
    return;
  }

  const result = db.enrollStudentManual(name, email, courseId);
  closeModal();

  const course = db.courses.find(c => c.id === courseId);
  const courseTitle = course ? course.title : 'el curso seleccionado';

  alert(`✓ Estudiante "${name}" (${email}) inscrito exitosamente en:\n"${courseTitle}".\n\nEl estudiante ahora cuenta con acceso directo y gratuito al curso en su panel de "Mis Cursos" y en el Aula Virtual, sin necesidad de pagar ninguna membresía.`);
  navigate('instructor-dashboard');
}

function openNewCouponModal() {
  const modal = document.getElementById('global-modal-overlay');
  const card = document.getElementById('global-modal-card');
  if (!modal || !card) return;

  card.style.maxWidth = '480px';
  card.innerHTML = `
    <div class="modal-header">
      <h3 style="font-weight:700;">Crear Nuevo Cupón Promocional</h3>
      <button onclick="closeModal()" style="color:var(--text-dim); font-size:1.2rem;">✕</button>
    </div>

    <form onsubmit="event.preventDefault(); submitNewCoupon();">
      <div style="margin-bottom:1rem;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Código Promocional:</label>
        <input type="text" id="coupon-code-field" placeholder="Ej. OFERTA50" style="text-transform:uppercase; width:100%; font-weight:700;" required>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1.25rem;">
        <div>
          <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Descuento (%):</label>
          <input type="number" min="1" max="100" id="coupon-percent-field" value="25" required style="width:100%;">
        </div>
        <div>
          <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Usos Disponibles:</label>
          <input type="number" min="1" id="coupon-uses-field" value="100" required style="width:100%;">
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary btn-sm">
          <i data-lucide="tag"></i> Crear Cupón
        </button>
      </div>
    </form>
  `;

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function submitNewCoupon() {
  const code = document.getElementById('coupon-code-field')?.value.trim().toUpperCase();
  const percent = parseInt(document.getElementById('coupon-percent-field')?.value || '25');
  const uses = parseInt(document.getElementById('coupon-uses-field')?.value || '100');

  if (!code) return;

  db.addCoupon({
    code: code,
    discountPercent: percent,
    expiryDate: '2026-12-31',
    usesRemaining: uses
  });

  closeModal();
  alert(`¡Cupón promocional ${code} (${percent}% OFF) registrado e incorporado!`);
  navigate('instructor-dashboard');
}

/* ==========================================================================
   MODAL WINDOWS: Checkout, Subscriptions & Certificates
   ========================================================================== */
function openCheckoutModal(courseId) {
  const course = db.courses.find(c => c.id === courseId);
  if (!course) return;

  const modal = document.getElementById('global-modal-overlay');
  const card = document.getElementById('global-modal-card');
  if (!modal || !card) return;

  card.innerHTML = `
    <div class="modal-header">
      <h3 style="font-weight:700;">Pasarela de Pago Segura</h3>
      <button onclick="closeModal()" style="color:var(--text-dim); font-size:1.2rem;">✕</button>
    </div>

    <div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid var(--border-color);">
        <div>
          <div style="font-weight:700; font-size:0.95rem;">${course.title}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${course.instructor}</div>
        </div>
        <div id="checkout-price-display" style="font-size:1.3rem; font-weight:800; color:var(--accent-secondary);">$${course.price}</div>
      </div>

      <div style="margin-bottom:1.25rem;">
        <label style="font-size:0.8rem; font-weight:600; color:var(--text-muted);">¿Tienes un código promocional?</label>
        <div style="display:flex; gap:0.5rem; margin-top:0.3rem;">
          <input type="text" id="coupon-code-input" placeholder="Ej. LAUNCH50" style="text-transform:uppercase; flex:1;">
          <button class="btn btn-secondary btn-sm" onclick="applyCouponAtCheckout(${course.price})">Aplicar</button>
        </div>
        <div id="coupon-feedback" style="font-size:0.75rem; margin-top:0.3rem;"></div>
      </div>

      <h4 style="font-weight:600; margin-bottom:0.6rem; font-size:0.9rem;">Método de Pago</h4>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:1rem;">
        <div style="padding:0.6rem; border:2px solid var(--accent-primary); border-radius:var(--radius-md); text-align:center; font-weight:600; font-size:0.85rem;">
          💳 Tarjeta Débito/Crédito
        </div>
        <div style="padding:0.6rem; border:1px solid var(--border-color); border-radius:var(--radius-md); text-align:center; color:var(--text-muted); font-size:0.85rem;">
          🔷 Mercado Pago
        </div>
      </div>

      <div style="space-y:0.6rem; margin-bottom:1.25rem;">
        <input type="text" placeholder="Número de Tarjeta (4242 •••• •••• 4242)" style="width:100%;">
        <div style="display:flex; gap:0.5rem; margin-top:0.4rem;">
          <input type="text" placeholder="MM/YY" style="width:50%;">
          <input type="text" placeholder="CVC" style="width:50%;">
        </div>
      </div>

      <button class="btn btn-primary" style="width:100%; justify-content:center; padding:0.8rem;" onclick="processCoursePurchase('${course.id}')">
        <i data-lucide="lock"></i> Confirmar Pago e Inscribirme
      </button>
    </div>
  `;

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function applyCouponAtCheckout(originalPrice) {
  const code = document.getElementById('coupon-code-input')?.value.trim().toUpperCase();
  const feedback = document.getElementById('coupon-feedback');
  const priceDisplay = document.getElementById('checkout-price-display');

  const found = db.coupons.find(c => c.code === code);
  if (found) {
    const discountAmount = (originalPrice * found.discountPercent) / 100;
    const finalPrice = Math.max(0, originalPrice - discountAmount);
    if (priceDisplay) priceDisplay.innerText = `$${finalPrice.toFixed(2)} USD`;
    if (feedback) {
      feedback.style.color = 'var(--success)';
      feedback.innerText = `✓ Cupón ${code} aplicado (${found.discountPercent}% OFF). Ahorro: $${discountAmount.toFixed(2)}`;
    }
  } else if (feedback) {
    feedback.style.color = 'var(--danger)';
    feedback.innerText = '❌ Código no válido o expirado.';
  }
}

function processCoursePurchase(courseId) {
  db.enrollCourse(courseId);
  closeModal();
  alert('¡Pago completado con éxito! Bienvenido al curso.');
  navigate('learning-player', { courseId: courseId });
}

function openSubscriptionModal() {
  const modal = document.getElementById('global-modal-overlay');
  const card = document.getElementById('global-modal-card');
  if (!modal || !card) return;

  card.innerHTML = `
    <div class="modal-header">
      <h3 style="font-weight:700;">Planes de Membresía SaaS</h3>
      <button onclick="closeModal()" style="color:var(--text-dim);">✕</button>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1rem;">
      ${db.subscriptionPlans.map(plan => `
        <div style="background:var(--bg-primary); border:${plan.popular ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)'}; border-radius:var(--radius-lg); padding:1rem; display:flex; flex-direction:column;">
          ${plan.popular ? '<span class="badge badge-indigo" style="align-self:flex-start; margin-bottom:0.4rem;">Más Popular</span>' : ''}
          <h4 style="font-weight:700;">${plan.name}</h4>
          <div style="font-size:1.4rem; font-weight:800; color:var(--accent-secondary); margin:0.4rem 0;">
            $${plan.priceMonthly} <span style="font-size:0.75rem; color:var(--text-dim);">/ mes</span>
          </div>

          <ul style="list-style:none; font-size:0.8rem; color:var(--text-muted); margin-bottom:1.25rem; flex:1;">
            ${plan.features.map(f => `<li style="margin-bottom:0.3rem;">✓ ${f}</li>`).join('')}
          </ul>

          <button class="btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} btn-sm" style="width:100%;" onclick="subscribePlan('${plan.id}')">
            Suscribirme
          </button>
        </div>
      `).join('')}
    </div>
  `;

  modal.classList.add('active');
}

function subscribePlan(planId) {
  if (db.currentUser) {
    db.currentUser.subscription.planId = planId;
    db.save();
  }
  closeModal();
  alert('¡Felicidades! Te has suscrito exitosamente a la membresía.');
  navigate('student-dashboard');
}

function showCertificateModal(courseId) {
  const course = db.courses.find(c => c.id === courseId);
  const student = db.currentUser;

  const modal = document.getElementById('global-modal-overlay');
  const card = document.getElementById('global-modal-card');
  if (!modal || !card) return;

  card.style.maxWidth = '700px';
  card.innerHTML = CertificateEngine.renderCertificateModal(course, student);
  modal.classList.add('active');

  if (window.lucide) lucide.createIcons();
}

function closeModal() {
  const modal = document.getElementById('global-modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    const card = document.getElementById('global-modal-card');
    if (card) card.style.maxWidth = '600px';
  }
}

// ==========================================================================
// Custom Course Cover Upload Handlers
// ==========================================================================
window._newCourseCoverDataUrl = null;

function handleNewCourseCoverSelected(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    window._newCourseCoverDataUrl = e.target.result;
    const preview = document.getElementById('new-course-cover-preview');
    if (preview) preview.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleNewCourseCoverUrl(url) {
  if (!url || !url.trim()) return;
  window._newCourseCoverDataUrl = url.trim();
  const preview = document.getElementById('new-course-cover-preview');
  if (preview) preview.src = url.trim();
}

// ==========================================================================
// Multi-Device Network Sync Modal Engine (PC <-> Phone / Android)
// ==========================================================================
function openNetworkSyncModal() {
  const modal = document.getElementById('global-modal-overlay');
  const card = document.getElementById('global-modal-card');
  if (!modal || !card) return;

  card.style.maxWidth = '520px';
  card.innerHTML = `
    <div class="modal-header">
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <i data-lucide="network" style="color:var(--accent-primary);"></i>
        <h3 style="font-weight:700;">Sincronización Multi-Dispositivo</h3>
      </div>
      <button onclick="closeModal()" style="color:var(--text-dim); font-size:1.2rem;">✕</button>
    </div>

    <div style="margin-bottom:1rem; font-size:0.85rem; color:var(--text-muted); line-height:1.5;">
      Tus cuentas de estudiante y profesor, cursos creados, avances y materiales se sincronizan automáticamente en tiempo real entre tu computadora y tu teléfono móvil Android.
    </div>

    <div style="background:var(--bg-secondary); padding:0.85rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1.25rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
        <span style="font-size:0.8rem; font-weight:600; color:var(--text-dim);">Estado de Conexión:</span>
        <span class="badge ${db.syncStatus === 'online' ? 'badge-green' : 'badge-red'}" id="sync-modal-status-badge">
          ${db.syncStatus === 'online' ? '● En Línea (Sincronizado)' : '● Desconectado'}
        </span>
      </div>

      <label style="font-size:0.8rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">
        URL del Servidor Central (Wi-Fi / Red Local):
      </label>
      <input type="text" id="sync-server-input" value="${db.serverUrl}" placeholder="http://192.168.0.120:3000" style="width:100%; font-family:monospace; font-size:0.85rem;">
      <span style="font-size:0.75rem; color:var(--text-dim); display:block; margin-top:0.35rem;">
        💡 En tu teléfono Android o computadora, puedes ingresar la dirección IP de tu máquina en la red local (ej. <code>http://192.168.0.120:3000</code>).
      </span>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; flex-wrap:wrap;">
      <button type="button" class="btn btn-secondary btn-sm" onclick="testAndSyncServer()">
        <i data-lucide="refresh-cw"></i> Probar Conexión & Sincronizar
      </button>
      <div style="display:flex; gap:0.5rem;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="closeModal()">Cerrar</button>
        <button type="button" class="btn btn-primary btn-sm" onclick="saveSyncServerUrl()">Guardar</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

async function testAndSyncServer() {
  const input = document.getElementById('sync-server-input');
  if (input && input.value) {
    db.serverUrl = input.value.trim().replace(/\/+$/, '');
    localStorage.setItem('EDTECH_SERVER_URL', db.serverUrl);
  }
  const badge = document.getElementById('sync-modal-status-badge');
  if (badge) {
    badge.className = 'badge badge-indigo';
    badge.innerText = 'Probando conexión...';
  }
  const success = await db.syncWithServer(false);
  if (success) {
    if (badge) {
      badge.className = 'badge badge-green';
      badge.innerText = '● Conectado & Sincronizado ✓';
    }
    alert('✓ Sincronización exitosa con ' + db.serverUrl);
  } else {
    if (badge) {
      badge.className = 'badge badge-red';
      badge.innerText = '● Error de conexión';
    }
    alert('No se pudo conectar a ' + db.serverUrl + '. Verifica que server.py esté en ejecución.');
  }
}

function saveSyncServerUrl() {
  const input = document.getElementById('sync-server-input');
  if (input && input.value) {
    db.setServerUrl(input.value.trim());
    closeModal();
    alert('Servidor guardado: ' + db.serverUrl);
  }
}

// ==========================================================================
// Interactive Star Rating & Course Review System
// ==========================================================================
window.selectedStarRating = 5;

const RATING_LABELS = {
  1: '1 estrella - Necesita mejorar bastante',
  2: '2 estrellas - Regular, esperaba más',
  3: '3 estrellas - Bueno, cumple lo básico',
  4: '4 estrellas - ¡Muy buen curso y explicación!',
  5: '5 estrellas - ¡Excelente, superó mis expectativas!'
};

function openCourseRatingModal(courseId) {
  const user = db.currentUser;
  if (!user) {
    alert('Por favor inicia sesión con tu cuenta de estudiante para calificar el curso.');
    openAuthModal('login');
    return;
  }

  const course = db.courses.find(c => c.id === courseId);
  if (!course) return;

  const modal = document.getElementById('global-modal-overlay');
  const card = document.getElementById('global-modal-card');
  if (!modal || !card) return;

  const existingReview = (course.reviews || []).find(r => r.userId === user.id || (r.email && r.email.toLowerCase() === user.email.toLowerCase()));
  const currentVal = existingReview ? existingReview.rating : (user.progress && user.progress[courseId] && user.progress[courseId].myRating ? user.progress[courseId].myRating.rating : 5);
  window.selectedStarRating = currentVal;

  card.style.maxWidth = '500px';
  card.innerHTML = `
    <div class="modal-header">
      <div>
        <h3 style="font-weight:700; margin-bottom:0.2rem;">Calificar Curso</h3>
        <span style="font-size:0.8rem; color:var(--text-muted);">${course.title}</span>
      </div>
      <button onclick="closeModal()" style="color:var(--text-dim); font-size:1.2rem;">✕</button>
    </div>

    <form onsubmit="event.preventDefault(); submitCourseRating('${course.id}');">
      <div style="text-align:center; padding:1.25rem 0 0.75rem 0;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.6rem;">
          ¿Cuántas estrellas le das a este curso?
        </label>
        
        <div class="star-rating-box" id="star-rating-selector" onmouseleave="resetStarRatingPreview()">
          ${[1, 2, 3, 4, 5].map(starNum => `
            <button type="button" class="star-btn ${starNum <= window.selectedStarRating ? 'active' : ''}" 
              id="star-btn-${starNum}" 
              onmouseenter="previewStarRating(${starNum})" 
              onclick="selectStarRating(${starNum})"
              title="${starNum} de 5 estrellas">
              ★
            </button>
          `).join('')}
        </div>

        <div id="star-rating-label" style="font-size:0.9rem; font-weight:600; color:#eab308; margin-top:0.4rem; min-height:1.4rem;">
          ${RATING_LABELS[window.selectedStarRating]}
        </div>
      </div>

      <div style="margin-bottom:1.25rem;">
        <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.35rem;">
          Escribe tu reseña u opinión sobre el curso (opcional):
        </label>
        <textarea id="rating-review-text" rows="3" placeholder="Cuéntanos qué fue lo que más te gustó, los proyectos o los temas aprendidos..." style="width:100%; font-size:0.85rem; resize:vertical;">${existingReview ? existingReview.comment : ''}</textarea>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary btn-sm">
          <i data-lucide="check"></i> Guardar Calificación
        </button>
      </div>
    </form>
  `;

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function previewStarRating(val) {
  for (let i = 1; i <= 5; i++) {
    const btn = document.getElementById(`star-btn-${i}`);
    if (btn) {
      if (i <= val) {
        btn.classList.add('hover');
      } else {
        btn.classList.remove('hover');
        btn.classList.remove('active');
      }
    }
  }
  const label = document.getElementById('star-rating-label');
  if (label && RATING_LABELS[val]) label.innerText = RATING_LABELS[val];
}

function resetStarRatingPreview() {
  for (let i = 1; i <= 5; i++) {
    const btn = document.getElementById(`star-btn-${i}`);
    if (btn) {
      btn.classList.remove('hover');
      if (i <= window.selectedStarRating) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  }
  const label = document.getElementById('star-rating-label');
  if (label && RATING_LABELS[window.selectedStarRating]) {
    label.innerText = RATING_LABELS[window.selectedStarRating];
  }
}

function selectStarRating(val) {
  window.selectedStarRating = val;
  resetStarRatingPreview();
}

function submitCourseRating(courseId) {
  const comment = document.getElementById('rating-review-text')?.value.trim() || '';
  const result = db.rateCourse(courseId, window.selectedStarRating, comment);

  if (result && !result.success) {
    alert(result.message || 'No se pudo guardar la calificación.');
    return;
  }

  closeModal();
  alert('¡Muchas gracias! Tu calificación y reseña han sido guardadas exitosamente.');

  // Refresh current view
  if (currentActiveCourse && currentActiveCourse.id === courseId) {
    navigate('learning-player', { courseId: courseId, lessonId: currentActiveLesson ? currentActiveLesson.id : undefined });
  } else if (window.location.hash.includes('course-detail')) {
    navigate('course-detail', { courseId: courseId });
  } else if (window.location.hash.includes('dashboard')) {
    navigate('student-dashboard');
  } else {
    navigate('catalog');
  }
}


