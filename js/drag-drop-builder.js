/* ==========================================================================
   Plataforma de Cursos Online y Membresías (LMS / EdTech)
   Drag-and-Drop Course Builder & Curriculum Studio
   ========================================================================== */

class DragDropCourseBuilder {
  constructor(containerId, courseId) {
    this.container = document.getElementById(containerId);
    this.courseId = courseId;
    this.draggedItem = null;
    this.draggedType = null; // 'module' or 'lesson'
    this.sourceModuleIndex = null;
    this.sourceLessonIndex = null;
  }

  // Load target course curriculum into the Drag & Drop editor
  init() {
    if (!this.container) return;
    this.course = db.courses.find(c => c.id === this.courseId) || db.courses[0];
    this.render();
  }

  selectCourse(courseId) {
    this.courseId = courseId;
    this.course = db.courses.find(c => c.id === courseId) || db.courses[0];
    this.render();
  }

  render() {
    if (!this.course) return;

    let html = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
        <div>
          <h2 style="font-weight:700;">Gestor Curricular Drag-and-Drop</h2>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.4rem; flex-wrap:wrap;">
            <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted);">Curso a Editar:</label>
            <select id="builder-course-selector" onchange="courseBuilder.selectCourse(this.value)" style="padding:0.3rem 0.6rem; font-size:0.85rem; font-weight:600; border-color:var(--accent-primary);">
              ${db.courses.map(c => `<option value="${c.id}" ${c.id === this.course.id ? 'selected' : ''}>${c.title}</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button class="btn btn-secondary btn-sm" onclick="courseBuilder.editCourseCover()">
            <i data-lucide="image"></i> Portada y Datos
          </button>
          <button class="btn btn-secondary btn-sm" onclick="courseBuilder.addNewModule()">
            <i data-lucide="plus"></i> Añadir Módulo
          </button>
          <button class="btn btn-primary btn-sm" onclick="courseBuilder.saveCurriculum()">
            <i data-lucide="save"></i> Guardar Cambios
          </button>
        </div>
      </div>

      <div id="modules-drag-container">
    `;

    this.course.modules.forEach((module, modIndex) => {
      html += `
        <div class="builder-module-card" data-module-index="${modIndex}" draggable="true">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span class="draggable-handle" title="Arrastrar para reordenar módulo"><i data-lucide="grip-vertical"></i></span>
              <input type="text" value="${module.title}" 
                style="font-weight:700; font-size:1.05rem; background:transparent; border:1px solid transparent; width:350px;"
                onchange="courseBuilder.updateModuleTitle(${modIndex}, this.value)" />
            </div>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <button class="btn btn-secondary btn-sm" onclick="courseBuilder.addNewLesson(${modIndex})">
                <i data-lucide="plus-circle"></i> Lección
              </button>
              <button class="btn btn-secondary btn-sm" onclick="courseBuilder.editQuiz(${modIndex})">
                <i data-lucide="help-circle"></i> Quiz (${module.quiz ? module.quiz.questions.length : 0} Qs)
              </button>
              <button style="color:var(--danger); padding:0.4rem;" onclick="courseBuilder.deleteModule(${modIndex})" title="Eliminar Módulo">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>

          <div class="lessons-drag-container" data-module-index="${modIndex}">
      `;

      module.lessons.forEach((lesson, lesIndex) => {
        html += `
          <div class="builder-lesson-item" data-module-index="${modIndex}" data-lesson-index="${lesIndex}" draggable="true">
            <div style="display:flex; align-items:center; gap:0.75rem; flex:1;">
              <span class="draggable-handle"><i data-lucide="menu"></i></span>
              <i data-lucide="video" style="color:var(--accent-primary); width:18px; height:18px;"></i>
              <input type="text" value="${lesson.title}" 
                style="background:transparent; border:none; width:100%; font-weight:500;"
                onchange="courseBuilder.updateLessonTitle(${modIndex}, ${lesIndex}, this.value)" />
            </div>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span class="badge badge-indigo">${lesson.duration}</span>
              <button class="btn btn-secondary btn-sm" onclick="courseBuilder.editLessonDetails(${modIndex}, ${lesIndex})" title="Subir PDFs, guías de estudio y cambiar video o YouTube">
                <i data-lucide="file-text"></i> Video & PDFs (${lesson.resources ? lesson.resources.length : 0})
              </button>
              <button style="color:var(--danger);" onclick="courseBuilder.deleteLesson(${modIndex}, ${lesIndex})" title="Eliminar lección">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    html += `</div>`;
    this.container.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    this.attachDragEvents();
  }

  // Attach HTML5 Drag & Drop listeners
  attachDragEvents() {
    const modules = this.container.querySelectorAll('.builder-module-card');
    const lessons = this.container.querySelectorAll('.builder-lesson-item');

    modules.forEach(modEl => {
      modEl.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('builder-module-card')) {
          this.draggedType = 'module';
          this.draggedItem = modEl;
          this.sourceModuleIndex = parseInt(modEl.dataset.moduleIndex);
          e.stopPropagation();
        }
      });

      modEl.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      modEl.addEventListener('drop', (e) => {
        e.preventDefault();
        if (this.draggedType === 'module') {
          const targetModuleIndex = parseInt(modEl.dataset.moduleIndex);
          if (this.sourceModuleIndex !== null && targetModuleIndex !== this.sourceModuleIndex) {
            const movedModule = this.course.modules.splice(this.sourceModuleIndex, 1)[0];
            this.course.modules.splice(targetModuleIndex, 0, movedModule);
            db.save();
            this.render();
          }
        }
      });
    });

    lessons.forEach(lesEl => {
      lesEl.addEventListener('dragstart', (e) => {
        this.draggedType = 'lesson';
        this.draggedItem = lesEl;
        this.sourceModuleIndex = parseInt(lesEl.dataset.moduleIndex);
        this.sourceLessonIndex = parseInt(lesEl.dataset.lessonIndex);
        e.stopPropagation();
      });

      lesEl.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      lesEl.addEventListener('drop', (e) => {
        e.preventDefault();
        if (this.draggedType === 'lesson') {
          const targetModuleIndex = parseInt(lesEl.dataset.moduleIndex);
          const targetLessonIndex = parseInt(lesEl.dataset.lessonIndex);

          if (this.sourceModuleIndex !== null && this.sourceLessonIndex !== null) {
            const movedLesson = this.course.modules[this.sourceModuleIndex].lessons.splice(this.sourceLessonIndex, 1)[0];
            this.course.modules[targetModuleIndex].lessons.splice(targetLessonIndex, 0, movedLesson);
            db.save();
            this.render();
          }
        }
      });
    });
  }

  // Curriculum Data Mutations
  updateModuleTitle(modIndex, title) {
    if (this.course && this.course.modules[modIndex]) {
      this.course.modules[modIndex].title = title;
      db.save();
    }
  }

  updateLessonTitle(modIndex, lesIndex, title) {
    if (this.course && this.course.modules[modIndex] && this.course.modules[modIndex].lessons[lesIndex]) {
      this.course.modules[modIndex].lessons[lesIndex].title = title;
      db.save();
    }
  }

  addNewModule() {
    const modal = document.getElementById('global-modal-overlay');
    const card = document.getElementById('global-modal-card');
    if (!modal || !card) return;

    card.style.maxWidth = '450px';
    card.innerHTML = `
      <div class="modal-header">
        <h3 style="font-weight:700;">Añadir Nuevo Módulo</h3>
        <button onclick="closeModal()" style="color:var(--text-dim); font-size:1.2rem;">✕</button>
      </div>
      <form onsubmit="event.preventDefault(); courseBuilder.confirmAddModule();">
        <div style="margin-bottom:1.25rem;">
          <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Título del Módulo:</label>
          <input type="text" id="builder-mod-title" placeholder="Ej. Módulo ${this.course.modules.length + 1}: Optimización y Despliegue" required style="width:100%;">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm">Crear Módulo</button>
        </div>
      </form>
    `;
    modal.classList.add('active');
  }

  confirmAddModule() {
    const title = document.getElementById('builder-mod-title')?.value.trim();
    if (!title) return;

    const newMod = {
      id: 'mod_' + Date.now(),
      title: title,
      lessons: [
        {
          id: 'les_' + Date.now(),
          title: '1. Lección Introductoria del Módulo',
          duration: '10:00',
          videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          fallbackMp4: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          resources: []
        }
      ],
      quiz: {
        id: 'quiz_' + Date.now(),
        title: `Quiz de ${title}`,
        passingScore: 80,
        questions: []
      }
    };
    this.course.modules.push(newMod);
    db.save();
    closeModal();
    this.render();
  }

  addNewLesson(modIndex) {
    const modal = document.getElementById('global-modal-overlay');
    const card = document.getElementById('global-modal-card');
    if (!modal || !card) return;

    card.style.maxWidth = '500px';
    card.innerHTML = `
      <div class="modal-header">
        <h3 style="font-weight:700;">Añadir Nueva Lección</h3>
        <button onclick="closeModal()" style="color:var(--text-dim); font-size:1.2rem;">✕</button>
      </div>
      <form onsubmit="event.preventDefault(); courseBuilder.confirmAddLesson(${modIndex});">
        <div style="margin-bottom:1rem;">
          <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Título de la Lección:</label>
          <input type="text" id="builder-les-title" placeholder="Ej. ${this.course.modules[modIndex].lessons.length + 1}. Configuración Avanzada" required style="width:100%;">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Duración (MM:SS):</label>
            <input type="text" id="builder-les-duration" value="14:30" required style="width:100%;">
          </div>
          <div>
            <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Formato Stream:</label>
            <select style="width:100%;">
              <option>HLS Adaptativo (.m3u8)</option>
            </select>
          </div>
        </div>
        <div style="margin-bottom:1.25rem;">
          <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">URL del Video:</label>
          <input type="text" id="builder-les-url" value="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" required style="width:100%;">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm">Añadir Lección</button>
        </div>
      </form>
    `;
    modal.classList.add('active');
  }

  confirmAddLesson(modIndex) {
    const title = document.getElementById('builder-les-title')?.value.trim();
    const duration = document.getElementById('builder-les-duration')?.value.trim() || '12:00';
    const videoUrl = document.getElementById('builder-les-url')?.value.trim() || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

    if (!title) return;

    const newLesson = {
      id: 'les_' + Date.now(),
      title: title,
      duration: duration,
      videoUrl: videoUrl,
      fallbackMp4: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      resources: []
    };
    this.course.modules[modIndex].lessons.push(newLesson);
    db.save();
    closeModal();
    this.render();
  }

  editLessonDetails(modIndex, lesIndex) {
    const lesson = this.course.modules[modIndex].lessons[lesIndex];
    if (!lesson.resources) lesson.resources = [];
    const modal = document.getElementById('global-modal-overlay');
    const card = document.getElementById('global-modal-card');
    if (!modal || !card) return;

    card.style.maxWidth = '550px';
    card.innerHTML = `
      <div class="modal-header">
        <h3 style="font-weight:700;">Editar Lección y Material Multimedia</h3>
        <button onclick="closeModal()" style="color:var(--text-dim); font-size:1.2rem;">✕</button>
      </div>
      <form onsubmit="event.preventDefault(); courseBuilder.confirmEditLesson(${modIndex}, ${lesIndex});">
        <div style="margin-bottom:1rem;">
          <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Título de la Lección:</label>
          <input type="text" id="edit-les-title" value="${lesson.title}" required style="width:100%;">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Duración (MM:SS):</label>
            <input type="text" id="edit-les-duration" value="${lesson.duration}" required style="width:100%;">
          </div>
          <div>
            <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Tipo de Video:</label>
            <select id="edit-les-type" style="width:100%;" onchange="courseBuilder.handleVideoTypeHint(this.value)">
              <option value="auto">Auto-detectar (YouTube o Stream)</option>
              <option value="youtube">Video de YouTube (Enlace)</option>
              <option value="hls">HLS Streaming (.m3u8)</option>
              <option value="mp4">Video MP4 Directo</option>
            </select>
          </div>
        </div>
        <div style="margin-bottom:1rem;">
          <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">
            URL del Video o Enlace de YouTube:
          </label>
          <input type="text" id="edit-les-url" value="${lesson.videoUrl}" placeholder="https://www.youtube.com/watch?v=... o https://test-streams.mux.dev/..." required style="width:100%;">
          <span style="font-size:0.75rem; color:var(--text-dim); display:block; margin-top:0.25rem;">
            ✓ Soporta enlaces estándar de YouTube (youtube.com/watch?v=..., youtu.be/..., shorts), HLS (.m3u8) y MP4.
          </span>
        </div>

        <!-- Downloadable Resources & PDFs Upload Section -->
        <div style="margin-bottom:1.25rem; background:var(--bg-secondary); padding:0.85rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
            <label style="font-size:0.85rem; font-weight:700; color:var(--text-primary); margin:0;">
              Archivos y Material Descargable (PDFs, Guías):
            </label>
            <label class="btn btn-secondary btn-sm" style="cursor:pointer; margin:0; padding:0.25rem 0.5rem; font-size:0.75rem;">
              <i data-lucide="upload"></i> Subir Archivo PDF
              <input type="file" accept=".pdf,.doc,.docx,.zip,.txt,.pptx" style="display:none;" onchange="courseBuilder.uploadLessonFile(${modIndex}, ${lesIndex}, this)">
            </label>
          </div>

          <div id="builder-lesson-resources-list">
            ${(!lesson.resources || lesson.resources.length === 0) ? `
              <div style="font-size:0.8rem; color:var(--text-dim); text-align:center; padding:0.5rem;">
                No hay archivos adjuntos en esta clase. Sube guías, diapositivas o PDFs para tus estudiantes.
              </div>
            ` : lesson.resources.map((res, rIdx) => `
              <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:0.4rem 0.6rem; border-radius:var(--radius-sm); margin-bottom:0.35rem; border:1px solid var(--border-color);">
                <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.8rem;">
                  <i data-lucide="file-text" style="color:var(--accent-primary); width:14px; height:14px;"></i>
                  <strong>${res.name}</strong>
                  <span class="badge badge-indigo" style="font-size:0.7rem; padding:0.1rem 0.35rem;">${res.size || 'PDF'}</span>
                </div>
                <button type="button" style="color:var(--danger); padding:0.2rem;" onclick="courseBuilder.removeLessonResource(${modIndex}, ${lesIndex}, ${rIdx})" title="Eliminar archivo">
                  <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm">Guardar Cambios</button>
        </div>
      </form>
    `;
    modal.classList.add('active');
    if (window.lucide) lucide.createIcons();
  }

  uploadLessonFile(modIndex, lesIndex, fileInput) {
    if (!fileInput.files || !fileInput.files[0]) return;
    const file = fileInput.files[0];
    const lesson = this.course.modules[modIndex].lessons[lesIndex];
    if (!lesson.resources) lesson.resources = [];

    const reader = new FileReader();
    reader.onload = (e) => {
      const ext = file.name.split('.').pop().toUpperCase();
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

      lesson.resources.push({
        id: 'res_' + Date.now(),
        name: file.name,
        type: ext,
        size: sizeMb,
        dataUrl: e.target.result,
        uploadedAt: new Date().toISOString()
      });

      db.save();
      this.editLessonDetails(modIndex, lesIndex);
    };
    reader.readAsDataURL(file);
  }

  removeLessonResource(modIndex, lesIndex, resourceIdx) {
    const lesson = this.course.modules[modIndex].lessons[lesIndex];
    if (lesson && lesson.resources) {
      lesson.resources.splice(resourceIdx, 1);
      db.save();
      this.editLessonDetails(modIndex, lesIndex);
    }
  }

  confirmEditLesson(modIndex, lesIndex) {
    const lesson = this.course.modules[modIndex].lessons[lesIndex];
    lesson.title = document.getElementById('edit-les-title')?.value.trim() || lesson.title;
    lesson.duration = document.getElementById('edit-les-duration')?.value.trim() || lesson.duration;
    lesson.videoUrl = document.getElementById('edit-les-url')?.value.trim() || lesson.videoUrl;

    db.save();
    closeModal();
    this.render();
  }

  deleteModule(modIndex) {
    if (confirm(`¿Deseas eliminar el módulo "${this.course.modules[modIndex].title}" y todas sus lecciones?`)) {
      this.course.modules.splice(modIndex, 1);
      db.save();
      this.render();
    }
  }

  deleteLesson(modIndex, lesIndex) {
    this.course.modules[modIndex].lessons.splice(lesIndex, 1);
    db.save();
    this.render();
  }

  editQuiz(modIndex, editingQuestionIndex = null) {
    const mod = this.course.modules[modIndex];
    if (!mod) return;
    if (!mod.quiz) {
      mod.quiz = {
        id: 'quiz_' + Date.now(),
        title: `Quiz de ${mod.title}`,
        passingScore: 80,
        questions: []
      };
    }
    if (!mod.quiz.questions) mod.quiz.questions = [];

    const modal = document.getElementById('global-modal-overlay');
    const card = document.getElementById('global-modal-card');
    if (!modal || !card) return;

    card.style.maxWidth = '680px';
    const isEditing = editingQuestionIndex !== null && mod.quiz.questions[editingQuestionIndex];
    const targetQ = isEditing ? mod.quiz.questions[editingQuestionIndex] : {
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: ''
    };

    const escapeAttr = (str) => {
      if (!str) return '';
      return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };

    let questionsListHtml = '';
    if (mod.quiz.questions.length === 0) {
      questionsListHtml = `
        <div style="background:var(--bg-primary); border:1px dashed var(--border-color); border-radius:var(--radius-md); padding:1rem; text-align:center; color:var(--text-muted); font-size:0.85rem; margin-bottom:1.25rem;">
          <i data-lucide="help-circle" style="width:28px; height:28px; margin-bottom:0.3rem; opacity:0.6;"></i>
          <div>No hay preguntas registradas en este quiz todavía.</div>
          <div style="font-size:0.75rem; color:var(--text-dim);">Usa el formulario de abajo para agregar preguntas y sus opciones de respuesta con la alternativa correcta.</div>
        </div>
      `;
    } else {
      questionsListHtml = `
        <div style="max-height:240px; overflow-y:auto; margin-bottom:1.25rem; padding-right:0.3rem;">
          ${mod.quiz.questions.map((q, qIdx) => `
            <div class="quiz-builder-q-card">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; margin-bottom:0.5rem;">
                <div style="font-weight:700; font-size:0.9rem; color:var(--text-primary);">
                  <span style="color:var(--accent-primary);">#${qIdx + 1}:</span> ${q.question}
                </div>
                <div style="display:flex; gap:0.4rem; flex-shrink:0;">
                  <button type="button" class="btn btn-secondary btn-sm" style="padding:0.2rem 0.5rem; font-size:0.75rem;" onclick="courseBuilder.editQuiz(${modIndex}, ${qIdx})">
                    <i data-lucide="edit-3"></i> Editar
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" style="padding:0.2rem 0.5rem; font-size:0.75rem; color:var(--danger);" onclick="courseBuilder.deleteQuizQuestion(${modIndex}, ${qIdx})">
                    <i data-lucide="trash-2"></i>
                  </button>
                </div>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
                ${q.options.map((opt, optI) => `
                  <div style="font-size:0.8rem; padding:0.3rem 0.5rem; border-radius:var(--radius-sm); background:${optI === q.correctIndex ? 'rgba(34,197,94,0.12)' : 'var(--bg-secondary)'}; border:1px solid ${optI === q.correctIndex ? 'rgba(34,197,94,0.4)' : 'var(--border-color)'}; color:${optI === q.correctIndex ? 'var(--success)' : 'var(--text-muted)'}; display:flex; align-items:center; gap:0.35rem;">
                    <strong style="color:${optI === q.correctIndex ? 'var(--success)' : 'var(--accent-primary)'};">${String.fromCharCode(65 + optI)}:</strong>
                    <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">${opt}</span>
                    ${optI === q.correctIndex ? '<span style="font-size:0.7rem; font-weight:700;">✓ Correcta</span>' : ''}
                  </div>
                `).join('')}
              </div>
              ${q.explanation ? `
                <div style="font-size:0.75rem; color:var(--text-dim); margin-top:0.4rem; padding-left:0.25rem;">
                  <strong>Explicación:</strong> ${q.explanation}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="modal-header">
        <div>
          <h3 style="font-weight:700; margin-bottom:0.2rem;">Gestor de Quiz & Evaluaciones</h3>
          <span style="font-size:0.8rem; color:var(--text-muted);">${mod.title}</span>
        </div>
        <button onclick="closeModal()" style="color:var(--text-dim); font-size:1.2rem;">✕</button>
      </div>

      <!-- Quiz General Config -->
      <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:0.75rem 1rem; margin-bottom:1rem; display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
        <div style="flex:1; min-width:200px;">
          <label style="font-size:0.75rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.2rem;">Título de la Evaluación:</label>
          <input type="text" id="quiz-builder-title" value="${escapeAttr(mod.quiz.title)}" placeholder="Ej. Quiz del Módulo" style="width:100%; font-size:0.85rem;" onchange="courseBuilder.updateQuizTitle(${modIndex}, this.value)">
        </div>
        <div style="width:120px;">
          <label style="font-size:0.75rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.2rem;">% Aprobación:</label>
          <input type="number" id="quiz-builder-passing" min="10" max="100" value="${mod.quiz.passingScore || 80}" style="width:100%; font-size:0.85rem;" onchange="courseBuilder.updateQuizPassingScore(${modIndex}, this.value)">
        </div>
      </div>

      <!-- Registered Questions List -->
      <div style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
        <h4 style="font-size:0.95rem; font-weight:700;">Preguntas Registradas (${mod.quiz.questions.length})</h4>
        ${isEditing ? `
          <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.75rem; padding:0.2rem 0.5rem;" onclick="courseBuilder.editQuiz(${modIndex})">
            <i data-lucide="plus"></i> Nueva Pregunta
          </button>
        ` : ''}
      </div>
      ${questionsListHtml}

      <!-- Add / Edit Question Form Section -->
      <div style="background:var(--bg-card); border:1px solid ${isEditing ? 'var(--accent-primary)' : 'var(--border-highlight)'}; border-radius:var(--radius-md); padding:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <h4 style="font-size:0.9rem; font-weight:700; color:${isEditing ? 'var(--accent-secondary)' : 'var(--text-primary)'};">
            ${isEditing ? `<i data-lucide="edit-3" style="width:16px;"></i> Editando Pregunta #${editingQuestionIndex + 1}` : `<i data-lucide="plus-circle" style="width:16px;"></i> Añadir Nueva Pregunta al Quiz`}
          </h4>
          ${isEditing ? `
            <button type="button" class="btn btn-secondary btn-sm" style="font-size:0.75rem; padding:0.2rem 0.5rem;" onclick="courseBuilder.editQuiz(${modIndex})">Cancelar</button>
          ` : ''}
        </div>

        <div style="margin-bottom:0.75rem;">
          <label style="font-size:0.8rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.25rem;">
            Enunciado de la Pregunta:
          </label>
          <input type="text" id="quiz-form-q-text" value="${escapeAttr(targetQ.question)}" placeholder="Ej. ¿Cuántos años tiene Gustavo?" required style="width:100%;">
        </div>

        <div style="margin-bottom:0.75rem;">
          <label style="font-size:0.8rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.25rem;">
            Opciones de Respuesta (Marca con el círculo la opción que sea la <span style="color:var(--success);">CORRECTA</span>):
          </label>
          <div style="display:flex; flex-direction:column; gap:0.4rem;">
            ${[0, 1, 2, 3].map(i => `
              <div class="quiz-opt-row" style="display:flex; align-items:center; gap:0.5rem;">
                <input type="radio" name="quiz-correct-choice" id="quiz-correct-${i}" value="${i}" ${targetQ.correctIndex === i ? 'checked' : ''} style="cursor:pointer; width:18px; height:18px; accent-color:#22c55e;" title="Marcar opción ${String.fromCharCode(65 + i)} como la respuesta correcta">
                <label for="quiz-correct-${i}" style="font-weight:700; font-size:0.85rem; width:22px; cursor:pointer; color:var(--accent-primary);">${String.fromCharCode(65 + i)}:</label>
                <input type="text" id="quiz-form-opt-${i}" value="${escapeAttr(targetQ.options && targetQ.options[i] !== undefined ? targetQ.options[i] : '')}" placeholder="Texto de la opción ${String.fromCharCode(65 + i)}" style="flex:1; font-size:0.85rem;">
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom:1rem;">
          <label style="font-size:0.8rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.25rem;">
            Explicación o Feedback tras responder (Opcional):
          </label>
          <input type="text" id="quiz-form-q-explanation" value="${escapeAttr(targetQ.explanation || '')}" placeholder="Ej. Esta respuesta es correcta porque..." style="width:100%; font-size:0.85rem;">
        </div>

        <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
          ${isEditing ? `
            <button type="button" class="btn btn-secondary btn-sm" onclick="courseBuilder.editQuiz(${modIndex})">Cancelar Edición</button>
            <button type="button" class="btn btn-primary btn-sm" onclick="courseBuilder.saveQuizQuestion(${modIndex}, ${editingQuestionIndex})">
              <i data-lucide="check"></i> Actualizar Pregunta
            </button>
          ` : `
            <button type="button" class="btn btn-primary btn-sm" onclick="courseBuilder.saveQuizQuestion(${modIndex}, null)">
              <i data-lucide="plus-circle"></i> Guardar Pregunta en Quiz
            </button>
          `}
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; margin-top:1.25rem; border-top:1px solid var(--border-color); padding-top:1rem;">
        <button type="button" class="btn btn-primary btn-sm" onclick="courseBuilder.finishQuizModal()">
          <i data-lucide="save"></i> Listo, Guardar Quiz y Salir
        </button>
      </div>
    `;

    modal.classList.add('active');
    if (window.lucide) lucide.createIcons();
  }

  updateQuizTitle(modIndex, title) {
    const mod = this.course.modules[modIndex];
    if (mod && mod.quiz) {
      mod.quiz.title = title.trim() || `Quiz de ${mod.title}`;
      db.save();
    }
  }

  updateQuizPassingScore(modIndex, score) {
    const mod = this.course.modules[modIndex];
    if (mod && mod.quiz) {
      mod.quiz.passingScore = Math.max(10, Math.min(100, parseInt(score) || 80));
      db.save();
    }
  }

  deleteQuizQuestion(modIndex, qIndex) {
    const mod = this.course.modules[modIndex];
    if (!mod || !mod.quiz || !mod.quiz.questions) return;
    if (confirm('¿Estás seguro de que deseas eliminar esta pregunta del quiz?')) {
      mod.quiz.questions.splice(qIndex, 1);
      db.save();
      this.editQuiz(modIndex);
      this.render();
    }
  }

  saveQuizQuestion(modIndex, qIndex) {
    const mod = this.course.modules[modIndex];
    if (!mod || !mod.quiz) return;

    const qText = document.getElementById('quiz-form-q-text')?.value.trim();
    if (!qText) {
      alert('Por favor ingresa el enunciado de la pregunta.');
      document.getElementById('quiz-form-q-text')?.focus();
      return;
    }

    const opt0 = document.getElementById('quiz-form-opt-0')?.value.trim();
    const opt1 = document.getElementById('quiz-form-opt-1')?.value.trim();
    const opt2 = document.getElementById('quiz-form-opt-2')?.value.trim();
    const opt3 = document.getElementById('quiz-form-opt-3')?.value.trim();

    const rawOptions = [opt0, opt1, opt2, opt3];
    const filledOptions = rawOptions.filter(o => o && o.length > 0);
    if (filledOptions.length < 2) {
      alert('Por favor completa al menos 2 opciones de respuesta (por ejemplo Opción A y Opción B).');
      return;
    }

    const checkedRadio = document.querySelector('input[name="quiz-correct-choice"]:checked');
    const selectedCorrectIdx = checkedRadio ? parseInt(checkedRadio.value) : 0;

    const finalOptions = rawOptions.map((opt, i) => (opt && opt.length > 0) ? opt : `Opción ${String.fromCharCode(65 + i)}`);
    const finalCorrectIndex = Math.max(0, Math.min(selectedCorrectIdx, finalOptions.length - 1));
    const explanation = document.getElementById('quiz-form-q-explanation')?.value.trim() || 'Respuesta verificada por el instructor.';

    const questionData = {
      id: (qIndex !== null && mod.quiz.questions[qIndex]) ? mod.quiz.questions[qIndex].id : ('q_' + Date.now()),
      question: qText,
      options: finalOptions,
      correctIndex: finalCorrectIndex,
      explanation: explanation
    };

    if (qIndex !== null && mod.quiz.questions[qIndex]) {
      mod.quiz.questions[qIndex] = questionData;
    } else {
      mod.quiz.questions.push(questionData);
    }

    db.save();
    this.editQuiz(modIndex);
    this.render();
  }

  finishQuizModal() {
    closeModal();
    this.render();
  }

  saveCurriculum() {
    db.save();
    alert('¡El plan curricular ha sido guardado y actualizado exitosamente!');
  }

  editCourseCover() {
    const modal = document.getElementById('global-modal-overlay');
    const card = document.getElementById('global-modal-card');
    if (!modal || !card) return;

    card.style.maxWidth = '500px';
    card.innerHTML = `
      <div class="modal-header">
        <h3 style="font-weight:700;">Editar Portada y Datos del Curso</h3>
        <button onclick="closeModal()" style="color:var(--text-dim); font-size:1.2rem;">✕</button>
      </div>
      <div>
        <div style="margin-bottom:1rem;">
          <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Título del Curso:</label>
          <input type="text" id="edit-course-title" value="${this.course.title}" style="width:100%;">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1rem;">
          <div>
            <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Precio ($USD):</label>
            <input type="number" step="0.01" id="edit-course-price" value="${this.course.price}" style="width:100%;">
          </div>
          <div>
            <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Nivel:</label>
            <select id="edit-course-level" style="width:100%;">
              <option value="Principiante" ${this.course.level === 'Principiante' ? 'selected' : ''}>Principiante</option>
              <option value="Intermedio" ${this.course.level === 'Intermedio' ? 'selected' : ''}>Intermedio</option>
              <option value="Avanzado" ${this.course.level === 'Avanzado' ? 'selected' : ''}>Avanzado</option>
            </select>
          </div>
        </div>
        <div style="margin-bottom:1rem;">
          <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Foto de Portada Actual:</label>
          <div style="display:flex; gap:0.75rem; align-items:center;">
            <img id="edit-cover-preview" src="${this.course.image}" style="width:100px; height:60px; object-fit:cover; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
            <div style="flex:1;">
              <input type="file" id="edit-course-cover-input" accept="image/*" style="display:none;" onchange="courseBuilder.handleCoverFileSelected(this)">
              <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('edit-course-cover-input').click()">
                <i data-lucide="image"></i> Subir Nueva Foto
              </button>
            </div>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.25rem;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="closeModal()">Cancelar</button>
          <button type="button" class="btn btn-primary btn-sm" onclick="courseBuilder.saveCourseData()">Guardar Datos</button>
        </div>
      </div>
    `;
    modal.classList.add('active');
    if (window.lucide) lucide.createIcons();
  }

  handleCoverFileSelected(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      this.course.image = e.target.result;
      const preview = document.getElementById('edit-cover-preview');
      if (preview) preview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  saveCourseData() {
    this.course.title = document.getElementById('edit-course-title')?.value.trim() || this.course.title;
    this.course.price = parseFloat(document.getElementById('edit-course-price')?.value || this.course.price);
    this.course.level = document.getElementById('edit-course-level')?.value || this.course.level;
    db.save();
    closeModal();
    this.render();
    alert('✓ Portada y datos del curso actualizados correctamente.');
  }
}
