/* ==========================================================================
   Plataforma de Cursos Online y Membresías (LMS / EdTech)
   Automatic PDF Certificate Generator & Verification Module
   ========================================================================== */

class CertificateEngine {
  constructor() {}

  // Check student course completion including live video playback & module completion
  static calculateCourseCompletion(course, userProgress, currentLiveLessonId = null, currentLivePercent = 0) {
    if (!course) {
      return { total: 0, completed: 0, percentage: 0, isEligible: false, completedLessonsCount: 0, totalLessons: 0, modulesCompleted: 0, totalModules: 0 };
    }

    let totalLessons = 0;
    const allLessonIds = [];
    const totalModules = course.modules ? course.modules.length : 0;
    let completedModulesCount = 0;

    if (course.modules) {
      course.modules.forEach(mod => {
        let modAllCompleted = true;
        if (mod.lessons && mod.lessons.length > 0) {
          mod.lessons.forEach(l => {
            totalLessons++;
            allLessonIds.push(l.id);
            if (!userProgress || !userProgress.completedLessons || !userProgress.completedLessons.includes(l.id)) {
              modAllCompleted = false;
            }
          });
        }
        if (modAllCompleted && mod.lessons && mod.lessons.length > 0) {
          completedModulesCount++;
        }
      });
    }

    if (totalLessons === 0) {
      return { total: 0, completed: 0, percentage: 0, isEligible: false, completedLessonsCount: 0, totalLessons: 0, modulesCompleted: 0, totalModules: 0 };
    }

    const completedLessons = (userProgress && userProgress.completedLessons) ? userProgress.completedLessons : [];
    const watchPercentages = (userProgress && userProgress.lessonWatchPercentage) ? userProgress.lessonWatchPercentage : {};

    let totalProgressUnits = 0;
    allLessonIds.forEach(id => {
      if (completedLessons.includes(id)) {
        totalProgressUnits += 100;
      } else if (currentLiveLessonId && id === currentLiveLessonId) {
        const liveVal = Math.min(100, Math.max(watchPercentages[id] || 0, Math.round(currentLivePercent) || 0));
        totalProgressUnits += liveVal;
      } else if (watchPercentages[id]) {
        totalProgressUnits += Math.min(100, Math.round(watchPercentages[id]));
      }
    });

    const percentage = Math.min(100, Math.round(totalProgressUnits / totalLessons));
    const isEligible = percentage >= 100 || (completedLessons.length >= totalLessons && totalLessons > 0);

    return {
      total: totalLessons,
      completed: completedLessons.length,
      percentage: percentage,
      isEligible: isEligible,
      completedLessonsCount: completedLessons.length,
      totalLessons: totalLessons,
      modulesCompleted: completedModulesCount,
      totalModules: totalModules
    };
  }

  // Generate unique certificate serial code
  static generateSerialId(courseId, studentId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `CERT-${courseId.toUpperCase()}-${timestamp}-${rand}`;
  }

  // Render certificate preview modal HTML
  static renderCertificateModal(course, student) {
    const issueDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const serialId = CertificateEngine.generateSerialId(course.id, student.id);

    return `
      <div id="certificate-print-area" class="certificate-preview">
        <div style="border: 2px solid rgba(251, 191, 36, 0.4); padding: 1.5rem; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div style="display:flex; align-items:center; gap:0.5rem; font-weight:700; color:#fbbf24; font-size:0.85rem;">
              <i data-lucide="award" style="width:22px; height:22px;"></i>
              <span>ACADEMIA EDTECH CERTIFIED</span>
            </div>
            <div style="font-size:0.7rem; color:#94a3b8; font-family:monospace;">ID: ${serialId}</div>
          </div>

          <div class="certificate-title">CERTIFICADO DE EXCELENCIA</div>
          <p style="color:#cbd5e1; font-size:0.95rem; margin-bottom:1rem;">Otorgado con orgullo y reconocimiento oficial a:</p>

          <h2 style="font-size: 1.8rem; font-weight:800; color:#ffffff; text-decoration: underline decoration-color #6366f1; margin-bottom: 1rem;">
            ${student.name}
          </h2>

          <p style="color:#cbd5e1; font-size:0.85rem; max-width:550px; margin: 0 auto 1rem auto; line-height:1.5;">
            Por haber completado satisfactoriamente el 100% de las lecciones, evaluaciones prácticas y proyecto final del curso:
          </p>

          <h3 style="font-size: 1.2rem; font-weight:700; color:#38bdf8; margin-bottom: 1.25rem;">
            "${course.title}"
          </h3>

          <div class="certificate-seal">
            <i data-lucide="shield-check" style="width:32px; height:32px;"></i>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.15);">
            <div style="text-align:left;">
              <p style="font-size:0.75rem; color:#94a3b8;">Emisión:</p>
              <p style="font-size:0.85rem; font-weight:600; color:#f8fafc;">${issueDate}</p>
            </div>
            <div style="text-align:center;">
              <div style="font-family: 'Brush Script MT', cursive, sans-serif; font-size: 1.4rem; color: #a855f7;">${course.instructor}</div>
              <p style="font-size:0.75rem; color:#94a3b8; border-top: 1px solid #64748b;">Firma del Instructor</p>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.75rem; color:#10b981; font-weight:600;">✓ Verificado</div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex; gap:0.75rem; justify-content:flex-end; margin-top:1.25rem; flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="closeModal()">
          Cerrar
        </button>
        <button class="btn btn-primary" onclick="CertificateEngine.downloadPDF('${course.title}', '${student.name}')">
          <i data-lucide="download"></i> Descargar Certificado (PDF)
        </button>
      </div>
    `;
  }

  // Robust Vector PDF Certificate Downloader for Web and Android
  static async downloadPDF(courseTitle, studentName) {
    try {
      const serialId = CertificateEngine.generateSerialId('CERT', 'STUDENT');
      const issueDate = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

      const { jsPDF } = window.jspdf || {};
      if (jsPDF) {
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        // Background Dark Navy
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, 297, 210, 'F');

        // Outer Gold Border
        pdf.setDrawColor(251, 191, 36);
        pdf.setLineWidth(2.5);
        pdf.rect(10, 10, 277, 190);

        // Inner Accent Border
        pdf.setDrawColor(245, 158, 11);
        pdf.setLineWidth(0.8);
        pdf.rect(13, 13, 271, 184);

        // Header Text
        pdf.setTextColor(251, 191, 36);
        pdf.setFontSize(22);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CERTIFICADO DE EXCELENCIA ACADÉMICA', 148.5, 42, { align: 'center' });

        // Subtitle
        pdf.setTextColor(203, 213, 225);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Otorgado con orgullo y reconocimiento oficial a:', 148.5, 60, { align: 'center' });

        // Student Name
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(26);
        pdf.setFont('helvetica', 'bold');
        pdf.text(studentName.toUpperCase(), 148.5, 82, { align: 'center' });

        // Decorative Line
        pdf.setDrawColor(99, 102, 241);
        pdf.setLineWidth(1);
        pdf.line(70, 88, 227, 88);

        // Achievement Description
        pdf.setTextColor(203, 213, 225);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Por haber completado satisfactoriamente el 100% del programa lectivo, evaluaciones y proyectos:', 148.5, 104, { align: 'center' });

        // Course Title
        pdf.setTextColor(56, 189, 248);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`"${courseTitle}"`, 148.5, 122, { align: 'center' });

        // Footer Meta
        pdf.setTextColor(148, 163, 184);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Fecha de Emisión: ${issueDate}`, 20, 175);
        pdf.text(`ID de Verificación: ${serialId}`, 20, 182);

        pdf.text(`Emisor: EdTech LMS Studio`, 277, 175, { align: 'right' });
        pdf.text(`Estado: CERTIFICADO OFICIAL Y VERIFICADO`, 277, 182, { align: 'right' });

        const fileName = `Certificado_${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${studentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

        // Support for Android Native WebView file saving bridge
        if (window.AndroidNative && typeof window.AndroidNative.saveFileToDownloads === 'function') {
          const pdfBase64 = pdf.output('datauristring');
          window.AndroidNative.saveFileToDownloads(fileName, pdfBase64);
        } else {
          pdf.save(fileName);
        }
      } else {
        CertificateEngine.downloadCanvasFallback(courseTitle, studentName);
      }
    } catch (err) {
      console.warn('PDF Generator Exception, falling back to canvas:', err);
      CertificateEngine.downloadCanvasFallback(courseTitle, studentName);
    }
  }

  static downloadCanvasFallback(courseTitle, studentName) {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Canvas background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1200, 800);

    // Border
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, 1140, 740);

    // Text
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 42px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICADO DE EXCELENCIA', 600, 150);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px Outfit, sans-serif';
    ctx.fillText(studentName, 600, 320);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.fillText(`"${courseTitle}"`, 600, 440);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px Outfit, sans-serif';
    ctx.fillText(`Emitido por EdTech LMS Studio - ${new Date().toLocaleDateString()}`, 600, 680);

    const link = document.createElement('a');
    link.download = `Certificado_${courseTitle.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

/* ==========================================================================
   ModuleResourcePDFEngine: Rich Academic PDF Generator for Course Modules
   Generates detailed, structured educational PDFs tailored to each module
   ========================================================================== */
class ModuleResourcePDFEngine {
  constructor() {}

  // Resolve curriculum data for any course module (curated or dynamic)
  static getModulePedagogicalData(course, targetModule, targetLesson, fileName) {
    const courseId = course ? course.id : '';
    const modId = targetModule ? targetModule.id : '';
    const modTitle = targetModule ? targetModule.title : 'Módulo Académico';
    const courseTitle = course ? course.title : 'Plataforma EdTech LMS';
    const instructorName = course ? course.instructor : 'Comité Académico EdTech';

    // 1. WebDev Module 1: Fundamentos y Arquitectura Web
    if (courseId === 'course_webdev' && (modId === 'mod_001' || modTitle.toLowerCase().includes('arquitectura') || modTitle.toLowerCase().includes('módulo 1'))) {
      return {
        documentTitle: 'Guía de Arquitectura Web Fullstack & Entorno de Desarrollo',
        courseTitle: courseTitle,
        moduleTitle: modTitle,
        lessonTitle: targetLesson ? targetLesson.title : 'Introducción al ecosistema Fullstack moderno',
        instructor: instructorName,
        level: course.level || 'Intermedio',
        duration: '18 Horas Lectivas Certificadas',
        objectives: [
          'Comprender la evolución y arquitectura de las Single Page Applications (SPA) frente a sistemas monolíticos tradicionales.',
          'Dominar el ciclo de vida de peticiones HTTP/HTTPS, encabezados de seguridad, códigos semánticos y políticas CORS.',
          'Configurar entornos de desarrollo profesionales con Vite, Node.js v18+, TypeScript y gestión de paquetes modular.',
          'Auditar rendimiento en tiempo real utilizando Google Chrome DevTools (Paneles Network, Console, Profiler y Breakpoints en memoria).'
        ],
        technicalSections: [
          {
            title: '1. Arquitectura de Aplicaciones SPA y Ciclo de Vida Reactivo',
            content: 'En las aplicaciones de página única (SPA), el navegador descarga el cascarón HTML/CSS y el bundle de JavaScript una sola vez. A partir de ese momento, la navegación entre vistas y la mutación de datos se delegan al motor JavaScript en el cliente, consumiendo microservicios o APIs REST mediante llamadas asíncronas JSON. Esto optimiza el consumo de ancho de banda y erradica los parpadeos por recarga completa de página.',
            callout: 'Principio de Diseño: Separar rigurosamente la capa de presentación (React/DOM) de la capa de datos (APIs RESTful) para garantizar desacoplamiento y escalabilidad horizontal.'
          },
          {
            title: '2. Protocolos HTTP/HTTPS, Semántica de Respuestas y CORS',
            content: 'El protocolo HTTP rige la comunicación cliente-servidor. Las respuestas se estructuran con códigos estándar RFC: 2xx (Éxito: 200 OK, 201 Created), 4xx (Errores del Cliente: 400 Bad Request, 401 Unauthorized, 404 Not Found), y 5xx (Incidencias del Servidor: 500 Internal Error, 502 Bad Gateway). Las políticas CORS (Cross-Origin Resource Sharing) protegen el navegador verificando que el servidor autorice explícitamente el origen del cliente en las peticiones preflight OPTIONS.',
            callout: 'Regla de Oro: En producción, nunca permitir Access-Control-Allow-Origin: * en endpoints autenticados; siempre restringir al dominio de confianza del cliente.'
          },
          {
            title: '3. Auditoría de Red y Diagnóstico con DevTools',
            content: 'El panel Network de DevTools permite desglosar la cascada de carga (Waterfall), el tiempo hasta el primer byte (TTFB) y el peso transferido. Por su parte, los Breakpoints condicionales permiten detener la ejecución del Event Loop en líneas exactas para inspeccionar el Call Stack, el Scope de closures y las variables en memoria sin necesidad de contaminar el código con console.log.',
            callout: 'Técnica de Debugging: Utilizar breakpoints en peticiones Fetch o XHR para inspeccionar los tokens Bearer y payloads antes de que salgan a la red.'
          }
        ],
        quizQuestions: targetModule && targetModule.quiz ? targetModule.quiz.questions : [
          {
            question: '¿Cuál es la ventaja fundamental de la arquitectura SPA?',
            options: ['Recarga el documento HTML completo', 'Carga el cascarón base y renderiza vistas reactivamente vía APIs'],
            correctIndex: 1,
            explanation: 'Las SPAs proporcionan una experiencia fluida al actualizar el DOM reactivamente sin recargas completas.'
          }
        ],
        practicalChecklist: [
          'Verificar la instalación de Node.js (v18+) y gestor de dependencias npm/pnpm.',
          'Crear y configurar el proyecto base con Vite + React y soporte de variables de entorno (.env).',
          'Inspeccionar en Chrome DevTools el Waterfall de red y auditar el tiempo TTFB.',
          'Fijar un breakpoint condicional en la función de render y evaluar variables en la consola.'
        ]
      };
    }

    // 2. WebDev Module 2: State Management & APIs
    if (courseId === 'course_webdev' && (modId === 'mod_002' || modTitle.toLowerCase().includes('state') || modTitle.toLowerCase().includes('api') || modTitle.toLowerCase().includes('módulo 2'))) {
      return {
        documentTitle: 'Especificación Técnica: RESTful APIs, Asincronía y State Management',
        courseTitle: courseTitle,
        moduleTitle: modTitle,
        lessonTitle: targetLesson ? targetLesson.title : 'Integración de Servicios Backend y APIs Async',
        instructor: instructorName,
        level: course.level || 'Intermedio',
        duration: '22 Horas Lectivas Certificadas',
        objectives: [
          'Diseñar contratos de API RESTful robustos, idempotentes y documentados con especificaciones OpenAPI.',
          'Diferenciar con precisión técnica los métodos HTTP PUT y PATCH según el estándar RFC.',
          'Implementar asincronía en el Event Loop de JavaScript utilizando async/await y Promises no bloqueantes.',
          'Aplicar inmutabilidad estricta en el estado local y global de React para prevenir fugas de memoria y renders descontrolados.'
        ],
        technicalSections: [
          {
            title: '1. Semántica HTTP: Diferencia Estricta entre PUT y PATCH',
            content: 'En una API RESTful, el método PUT es idempotente y sustituye por completo el recurso existente con los datos provistos en el cuerpo JSON (requiere enviar la entidad íntegra). Por el contrario, el método PATCH aplica mutaciones parciales exclusivamente a los atributos especificados, manteniendo inalterados los demás campos del registro.',
            callout: 'Buenas Prácticas REST: Utilizar PATCH para actualizaciones puntuales (ej. marcar progreso de una lección) y PUT cuando se sincroniza un modelo completo.'
          },
          {
            title: '2. Asincronía y la Cola de Microtareas en el Event Loop',
            content: 'JavaScript opera sobre un hilo único no bloqueante. Las peticiones de red (Fetch/Axios) son operaciones asíncronas de entrada/salida delegadas al sistema operativo. El uso de async/await y Promises permite estructurar flujos lineales de código sin bloquear el renderizado en la interfaz, encolando las resoluciones en la Microtask Queue.',
            callout: 'Manejo de Errores: Encapsular siempre las llamadas de red en bloques try/catch y manejar estados de interfaz explícitos (cargando, éxito, error con reintento).'
          },
          {
            title: '3. Principio de Inmutabilidad en el Estado de React',
            content: 'React utiliza comparación por referencia superficial (shallow equality) en su Virtual DOM. Si un desarrollador muta un objeto o arreglo de estado directamente, React no detectará el cambio de referencia y omitirá el re-renderizado necesario. Siempre deben generarse nuevas referencias mediante operadores de propagación (...spread) o funciones inmutables.',
            callout: 'Patrón Recomendado: const updated = { ...state, completed: [...state.completed, newId] };'
          }
        ],
        quizQuestions: targetModule && targetModule.quiz ? targetModule.quiz.questions : [
          {
            question: '¿Cuál es la diferencia técnica entre PUT y PATCH en REST?',
            options: ['PUT borra registros', 'PUT sustituye completamente el recurso; PATCH aplica modificaciones parciales'],
            correctIndex: 1,
            explanation: 'PATCH aplica un conjunto de cambios parciales a un recurso existente, mientras que PUT requiere enviar la representación completa.'
          }
        ],
        practicalChecklist: [
          'Construir un cliente HTTP reutilizable con interceptores para inyección automática de tokens JWT.',
          'Crear un endpoint PATCH en el backend para actualización de progreso por lección.',
          'Gestionar estados de error y spinners de carga en componentes de React.',
          'Auditar que el estado global se actualice de forma inmutable sin mutaciones directas.'
        ]
      };
    }

    // 3. UI/UX Module 1: Principios de Composición y Visual UX
    if (courseId === 'course_uiux' || modTitle.toLowerCase().includes('ux') || modTitle.toLowerCase().includes('psicología')) {
      return {
        documentTitle: 'Guía Maestra: Leyes de Psicología Visual y Sistemas de Diseño',
        courseTitle: courseTitle,
        moduleTitle: modTitle,
        lessonTitle: targetLesson ? targetLesson.title : 'Leyes de la Psicología Aplicadas al UI',
        instructor: instructorName,
        level: course ? course.level : 'Principiante',
        duration: '16 Horas Lectivas Certificadas',
        objectives: [
          'Aplicar las leyes cognitivas empíricas (Fitts, Hick, Miller) al diseño de interfaces de usuario.',
          'Optimizar el tiempo de interacción y reducir la fricción en embudos de compra y navegación.',
          'Dominar el espacio negativo (Whitespace) para estructurar jerarquías visuales limpias y accesibles.',
          'Crear componentes modulares y sistemas de diseño con Auto-layout y Design Tokens en Figma.'
        ],
        technicalSections: [
          {
            title: '1. Ley de Fitts: Ergonomía y Zonas Táctiles en Interfaces',
            content: 'La Ley de Fitts formula que el tiempo requerido para alcanzar un objetivo depende de la distancia y del ancho del elemento: T = a + b * log2(2D / W). Los botones de llamada a la acción (CTA) y controles críticos deben contar con dimensiones generosas (mínimo 48x48dp en pantallas táctiles) y situarse en áreas de alcance ergonómico directo del pulgar.',
            callout: 'Regla de Diseño: En interfaces móviles, ubicar los botones principales en la parte inferior de la pantalla para reducir el esfuerzo físico del usuario.'
          },
          {
            title: '2. Ley de Hick y Reducción de la Sobrecarga Cognitiva',
            content: 'La Ley de Hick demuestra que el tiempo de toma de decisiones se incrementa logarítmicamente con el número de opciones: T = b * log2(n + 1). Saturar al usuario con menús de más de 10 opciones simultáneas genera parálisis por análisis. Se debe aplicar divulgación progresiva (progressive disclosure) y formularios en pasos sucesivos.',
            callout: 'Estrategia UX: Simplificar menús principales a un máximo de 5 a 7 categorías clave, agrupando opciones secundarias.'
          },
          {
            title: '3. El Espacio Negativo (Whitespace) como Herramienta Activa',
            content: 'El espacio en blanco no es un vacío improductivo; es un elemento estructural fundamental que comunica jerarquía, mejora la velocidad de lectura hasta en un 20% y agrupa elementos conceptualmente afines según la Ley de Proximidad de Gestalt.',
            callout: 'Buenas Prácticas: Asignar márgenes amplios y constantes (escala de 8px: 8, 16, 24, 32, 48px) para aportar sofisticación visual.'
          }
        ],
        quizQuestions: targetModule && targetModule.quiz ? targetModule.quiz.questions : [
          {
            question: '¿Qué establece la Ley de Fitts en el diseño de interfaces?',
            options: ['El tiempo requerido para alcanzar un objetivo depende de la distancia y su tamaño', 'Los colores deben ser siempre primarios'],
            correctIndex: 0,
            explanation: 'Áreas táctiles más grandes y cercanas reducen el tiempo y esfuerzo de interacción del usuario.'
          }
        ],
        practicalChecklist: [
          'Definir escala modular de espaciados basada en múltiplos de 8px en Figma.',
          'Auditar que todos los botones táctiles midan al menos 44px de alto.',
          'Reestructurar un formulario extenso en un flujo multi-paso con barra de progreso.',
          'Verificar ratios de contraste de color bajo el estándar WCAG AA (mínimo 4.5:1 para texto normal).'
        ]
      };
    }

    // 4. AI Course: Redes Neuronales Profundas
    if (courseId === 'course_ai' || modTitle.toLowerCase().includes('neuronal') || modTitle.toLowerCase().includes('ia')) {
      return {
        documentTitle: 'Manual Teórico y Matemático: Redes Neuronales & Backpropagation',
        courseTitle: courseTitle,
        moduleTitle: modTitle,
        lessonTitle: targetLesson ? targetLesson.title : 'Fundamentos Matemáticos y Backpropagation',
        instructor: instructorName,
        level: course ? course.level : 'Avanzado',
        duration: '25 Horas Lectivas Certificadas',
        objectives: [
          'Comprender la base algebraica y diferencial del Perceptrón Multicapa y redes profundas.',
          'Dominar el algoritmo de Backpropagation y el cálculo de gradientes mediante la regla de la cadena.',
          'Comprender por qué las funciones de activación no lineales (ReLU, GELU, Sigmoid) previenen el colapso lineal.',
          'Calibrar hiperparámetros de entrenamiento: Learning Rate, funciones de pérdida y optimizadores modernos.'
        ],
        technicalSections: [
          {
            title: '1. Fundamentos Matemáticos y el Algoritmo de Backpropagation',
            content: 'Backpropagation calcula el gradiente de la función de pérdida respecto a cada peso de la red propagando el error desde la capa de salida hacia las capas iniciales utilizando la regla de la cadena del cálculo multivariable: ∂L/∂W = (∂L/∂a) * (∂a/∂z) * (∂z/∂W). Esto permite a los optimizadores ajustar los pesos para minimizar la pérdida.',
            callout: 'Matemática Clave: Sin derivadas parciales en cadena, entrenar redes de más de dos capas sería computacionalmente inviable.'
          },
          {
            title: '2. Necesidad de Funciones de Activación No Lineales',
            content: 'Si una red neuronal solo utilizara combinaciones lineales (z = W*x + b), la composición de múltiples capas se reduciría algebraicamente a una simple matriz afín única W_total * x. La no-linealidad introducida por funciones como ReLU (f(x) = max(0, x)) permite al modelo aprender fronteras de decisión y aproximar cualquier función continua.',
            callout: 'Ventaja de ReLU: Mitiga el problema del desvanecimiento del gradiente (Vanishing Gradient) que sufría la función Sigmoid en capas profundas.'
          },
          {
            title: '3. Dinámica del Learning Rate en Gradient Descent',
            content: 'La tasa de aprendizaje (Learning Rate) determina la magnitud de los pasos que da el algoritmo hacia el mínimo de la función de pérdida. Una tasa excesivamente alta provocará oscilaciones descontroladas o divergencia; una tasa excesivamente baja estancará el entrenamiento en mesetas o mínimos locales.',
            callout: 'Recomendación: Utilizar optimizadores adaptativos como Adam o Lion con esquemas de decaimiento (Cosine Annealing Scheduler).'
          }
        ],
        quizQuestions: targetModule && targetModule.quiz ? targetModule.quiz.questions : [
          {
            question: '¿Cuál es el rol del algoritmo Backpropagation?',
            options: ['Calcular el gradiente de la función de pérdida con la regla de la cadena', 'Comprimir archivos en ZIP'],
            correctIndex: 0,
            explanation: 'Backpropagation propaga el error calculando derivadas parciales para optimizar los pesos.'
          }
        ],
        practicalChecklist: [
          'Configurar entorno Python con PyTorch y verificar aceleración CUDA/MPS.',
          'Implementar un forward pass y backward pass manual en arrays de NumPy.',
          'Graficar la curva de pérdida (Loss Curve) para diagnosticar sobreajuste o divergencia.',
          'Aplicar regularización L2 (Weight Decay) y Dropout para mejorar la generalización del modelo.'
        ]
      };
    }

    // 5. Marketing Course: Métricas Clave de Crecimiento
    if (courseId === 'course_marketing' || modTitle.toLowerCase().includes('crecimiento') || modTitle.toLowerCase().includes('mkt')) {
      return {
        documentTitle: 'Manual Estratégico: Unit Economics SaaS, LTV vs CAC y Métricas AARRR',
        courseTitle: courseTitle,
        moduleTitle: modTitle,
        lessonTitle: targetLesson ? targetLesson.title : 'Cálculo y Optimización del LTV vs CAC',
        instructor: instructorName,
        level: course ? course.level : 'Intermedio',
        duration: '15 Horas Lectivas Certificadas',
        objectives: [
          'Calcular y optimizar los Unit Economics centrales (LTV y CAC) en empresas de suscripción digital.',
          'Alcanzar y sostener el ratio óptimo LTV/CAC ≥ 3:1 con período de recuperación inferior a 12 meses.',
          'Analizar el impacto financiero exponencial del Churn Rate en los ingresos recurrentes (MRR / ARR).',
          'Implementar el marco de embudo pirata AARRR maximizando la tasa de Activación ("Aha! Moment").'
        ],
        technicalSections: [
          {
            title: '1. Unit Economics: Fórmulas de CAC y Lifetime Value (LTV)',
            content: 'El CAC mide el costo total de adquisición: (Gastos de Marketing + Ventas) / Nuevos Clientes. El LTV calcula los ingresos netos proyectados: (ARPU * Margen Bruto %) / Churn Mensual. Un modelo de negocio saludable requiere un ratio LTV/CAC de 3:1 o superior para absorber costos de operación, I+D y generar rentabilidad neta.',
            callout: 'Métrica Crítica: El período de Payback (CAC / Margen Mensual) debe ser inferior a 12 meses para evitar estrangular el flujo de caja en fases de escalamiento.'
          },
          {
            title: '2. Impacto Exponencial de la Tasa de Cancelación (Churn Rate)',
            content: 'El Churn Rate actúa como un divisor en el cálculo del tiempo de vida del suscriptor. Reducir el Churn mensual del 5% al 2.5% duplica exactamente el Lifetime Value de cada cliente sin necesidad de incrementar el presupuesto de captación publicitaria.',
            callout: 'Estrategia de Retención: Desarrollar procesos de onboarding guiados y alertas tempranas de inactividad de usuarios.'
          },
          {
            title: '3. Embudo Pirata AARRR y el "Aha! Moment"',
            content: 'El embudo AARRR se compone de: Adquisición, Activación, Retención, Referidos e Ingresos. La fase de Activación es el hito fundamental donde el nuevo usuario experimenta por primera vez el valor diferencial de la plataforma ("Aha! Moment").',
            callout: 'Táctica de Activación: Guiar al usuario hacia su primer curso completado en las primeras 48 horas tras su inscripción.'
          }
        ],
        quizQuestions: targetModule && targetModule.quiz ? targetModule.quiz.questions : [
          {
            question: '¿Qué ratio LTV / CAC se considera saludable y sostenible para SaaS?',
            options: ['1:1', '3:1 o superior'],
            correctIndex: 1,
            explanation: 'Un ratio 3:1 o mayor asegura suficiente margen operativo para reinvertir rentablemente en adquisición.'
          }
        ],
        practicalChecklist: [
          'Calcular el CAC mensual integrando gastos de pauta digital y costos de equipo comercial.',
          'Determinar el Churn Rate mensual neto y bruto de la base de suscriptores.',
          'Construir una tabla de cohorte de retención para medir el decaimiento a 3, 6 y 12 meses.',
          'Diseñar un experimento A/B Testing para optimizar la pantalla de bienvenida y activación.'
        ]
      };
    }

    // 6. Generic/Dynamic Fallback for custom instructor-created modules
    const quizQs = targetModule && targetModule.quiz && targetModule.quiz.questions ? targetModule.quiz.questions : [
      {
        question: `¿Comprendes los conceptos fundamentales desarrollados en ${modTitle}?`,
        options: ['Sí, totalmente claro', 'Requiere repaso'],
        correctIndex: 0,
        explanation: 'Dominio de los conceptos pedagógicos presentados en este módulo lectivo.'
      }
    ];

    const lessonNames = targetModule && targetModule.lessons ? targetModule.lessons.map(l => l.title) : ['Lección 1'];

    return {
      documentTitle: `Guía Oficial de Estudio: ${modTitle}`,
      courseTitle: courseTitle,
      moduleTitle: modTitle,
      lessonTitle: targetLesson ? targetLesson.title : lessonNames[0],
      instructor: instructorName,
      level: course ? course.level : 'Profesional',
      duration: 'Programa Modular Certificado',
      objectives: [
        `Dominar los conceptos teóricos y metodológicos contemplados en el ${modTitle}.`,
        'Aplicar las mejores prácticas profesionales e industriales del temario del curso.',
        'Completar satisfactoriamente las actividades prácticas y evaluaciones modulares.',
        'Consolidar competencias técnicas orientadas a la resolución de problemas reales.'
      ],
      technicalSections: [
        {
          title: `1. Marco Conceptual del ${modTitle}`,
          content: `Este módulo profundiza en el temario de "${courseTitle}", estructurado para brindar herramientas operativas y teóricas fundamentales. El programa comprende las siguientes lecciones formativas: ${lessonNames.join('; ')}.`,
          callout: 'Objetivo Académico: Integrar los conocimientos de cada clase en el proyecto final del curso.'
        },
        {
          title: '2. Estándares y Buenas Prácticas del Temario',
          content: 'Se enfatiza la rigurosidad metodológica, la optimización de procesos y el trabajo iterativo. El estudiante debe revisar los videos de la clase, complementar con lecturas y ejecutar los ejercicios propuestos antes de proceder a la evaluación.',
          callout: 'Recomendación: Repasar las notas y diagramas antes de presentar el examen del módulo.'
        }
      ],
      quizQuestions: quizQs,
      practicalChecklist: [
        'Completar la visualización integral de los videos del módulo.',
        'Descargar y revisar las plantillas y archivos complementarios.',
        'Presentar el quiz de evaluación y alcanzar la nota mínima requerida.',
        'Registrar dudas o aportes en el foro de preguntas y respuestas (Q&A).'
      ]
    };
  }

  // Generate and download Vector PDF with multi-page management
  static async downloadModulePDF(fileName, courseId = null, moduleId = null, lessonId = null) {
    try {
      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) {
        alert('Cargando motor de generación PDF. Por favor, reintenta en un momento.');
        return;
      }

      // Resolve Course and Module objects from DB
      let course = null;
      let targetModule = null;
      let targetLesson = null;

      if (courseId && window.db && db.courses) {
        course = db.courses.find(c => c.id === courseId);
      }

      if (!course && window.db && db.courses) {
        // Search across courses for resource matching fileName
        for (const c of db.courses) {
          if (c.modules) {
            for (const m of c.modules) {
              if (m.lessons) {
                for (const l of m.lessons) {
                  if (l.resources && l.resources.some(r => r.name === fileName)) {
                    course = c;
                    targetModule = m;
                    targetLesson = l;
                    break;
                  }
                }
              }
              if (course) break;
            }
          }
          if (course) break;
        }
      }

      if (!course && window.db && db.courses && db.courses.length > 0) {
        course = db.courses[0];
      }

      if (course && !targetModule && moduleId) {
        targetModule = course.modules.find(m => m.id === moduleId);
      }
      if (course && !targetModule && course.modules && course.modules.length > 0) {
        targetModule = course.modules[0];
      }

      if (targetModule && !targetLesson && lessonId) {
        targetLesson = targetModule.lessons.find(l => l.id === lessonId);
      }
      if (targetModule && !targetLesson && targetModule.lessons && targetModule.lessons.length > 0) {
        targetLesson = targetModule.lessons[0];
      }

      // Fetch pedagogical syllabus content
      const data = ModuleResourcePDFEngine.getModulePedagogicalData(course, targetModule, targetLesson, fileName);

      // Initialize A4 Portrait Document
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const serialId = `EDT-DOC-${(course ? course.id : 'MOD').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      const issueDate = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

      let currentPage = 1;
      let y = 34;

      function renderHeader(pageNum) {
        // Dark Navy Header Banner
        doc.setFillColor(15, 23, 42); // #0f172a
        doc.rect(0, 0, 210, 24, 'F');

        // Color Divider Line (Indigo to Cyan)
        doc.setFillColor(99, 102, 241); // #6366f1
        doc.rect(0, 24, 120, 2, 'F');
        doc.setFillColor(6, 182, 212); // #06b6d4
        doc.rect(120, 24, 90, 2, 'F');

        // Header Titles
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(251, 191, 36); // #fbbf24 Amber Gold
        doc.text('EDTECH LMS STUDIO • ACADEMIA TECNOLÓGICA & MEMBRESÍAS', 16, 10);

        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text('MATERIAL PEDAGÓGICO OFICIAL DEL MÓDULO', 16, 18);

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184); // #94a3b8
        doc.text(`ID OFICIAL: ${serialId}`, 194, 18, { align: 'right' });
      }

      function checkPageBreak(neededHeight) {
        if (y + neededHeight > 270) {
          doc.addPage();
          currentPage++;
          renderHeader(currentPage);
          y = 34;
        }
      }

      // Render Header on Page 1
      renderHeader(1);

      // Metadata Card Container
      doc.setFillColor(248, 250, 252); // #f8fafc
      doc.setDrawColor(203, 213, 225); // #cbd5e1
      doc.setLineWidth(0.4);
      doc.roundedRect(16, y, 178, 27, 2, 2, 'FD');

      // Metadata Text Rows
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const titleLines = doc.splitTextToSize(data.documentTitle, 170);
      doc.text(titleLines[0], 20, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Curso: ${data.courseTitle}`, 20, y + 12);
      doc.text(`Módulo: ${data.moduleTitle} • Nivel: ${data.level}`, 20, y + 17);
      doc.text(`Instructor(a): ${data.instructor} • Emisión: ${issueDate}`, 20, y + 22);

      y += 33;

      // Section 1: Objetivos Pedagógicos y Competencias
      checkPageBreak(35);
      doc.setFillColor(99, 102, 241);
      doc.roundedRect(16, y, 68, 6.5, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('1. OBJETIVOS DEL MÓDULO', 20, y + 4.5);
      y += 10;

      data.objectives.forEach(obj => {
        const objLines = doc.splitTextToSize(`• ${obj}`, 174);
        checkPageBreak(objLines.length * 4.5 + 2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(objLines, 18, y);
        y += objLines.length * 4.5 + 1.5;
      });

      y += 4;

      // Section 2: Síntesis Técnica & Conceptos Fundamentales
      checkPageBreak(30);
      doc.setFillColor(6, 182, 212);
      doc.roundedRect(16, y, 78, 6.5, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('2. SÍNTESIS TÉCNICA DEL TEMA', 20, y + 4.5);
      y += 10;

      data.technicalSections.forEach(sec => {
        // Section Subtitle
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(sec.title, 16, y);
        y += 5.5;

        // Content Paragraph
        const contentLines = doc.splitTextToSize(sec.content, 178);
        checkPageBreak(contentLines.length * 4.4 + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        doc.text(contentLines, 16, y);
        y += contentLines.length * 4.4 + 3;

        // Callout Box
        if (sec.callout) {
          const calloutLines = doc.splitTextToSize(sec.callout, 170);
          const boxHeight = calloutLines.length * 4.2 + 6;
          checkPageBreak(boxHeight + 4);

          doc.setFillColor(241, 245, 249);
          doc.rect(16, y, 178, boxHeight, 'F');
          doc.setFillColor(99, 102, 241);
          doc.rect(16, y, 2.5, boxHeight, 'F'); // Left accent bar

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);
          doc.text(calloutLines, 21, y + 4.5);
          y += boxHeight + 4;
        }
      });

      y += 3;

      // Section 3: Guía de Autoevaluación & Preguntas de Repaso del Quiz
      checkPageBreak(30);
      doc.setFillColor(16, 185, 129); // Emerald Green #10b981
      doc.roundedRect(16, y, 84, 6.5, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('3. AUTOEVALUACIÓN DEL MÓDULO', 20, y + 4.5);
      y += 10;

      data.quizQuestions.forEach((q, idx) => {
        const qLines = doc.splitTextToSize(`${idx + 1}. ${q.question}`, 174);
        const correctOpt = q.options && q.options[q.correctIndex] ? q.options[q.correctIndex] : 'Respuesta técnica oficial';
        const ansLines = doc.splitTextToSize(`✓ Respuesta correcta: ${correctOpt}`, 170);
        const expLines = q.explanation ? doc.splitTextToSize(`Explicación: ${q.explanation}`, 170) : [];

        const totalBlockHeight = (qLines.length + ansLines.length + expLines.length) * 4.2 + 8;
        checkPageBreak(totalBlockHeight);

        // Box border
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(16, y, 178, totalBlockHeight - 2, 1.5, 1.5, 'FD');

        let innerY = y + 4.5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(qLines, 19, innerY);
        innerY += qLines.length * 4.2 + 1;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(16, 185, 129);
        doc.text(ansLines, 19, innerY);
        innerY += ansLines.length * 4.2 + 1;

        if (expLines.length > 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(expLines, 19, innerY);
        }

        y += totalBlockHeight + 2;
      });

      y += 3;

      // Section 4: Checklist de Ejercicios Prácticos
      checkPageBreak(30);
      doc.setFillColor(245, 158, 11); // Amber
      doc.roundedRect(16, y, 76, 6.5, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('4. ACTIVIDADES PRÁCTICAS', 20, y + 4.5);
      y += 10;

      data.practicalChecklist.forEach(item => {
        const itemLines = doc.splitTextToSize(`[  ]  ${item}`, 174);
        checkPageBreak(itemLines.length * 4.5 + 2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(itemLines, 18, y);
        y += itemLines.length * 4.5 + 1.5;
      });

      y += 4;

      // Section 5: Student Notes & Verification Seal
      checkPageBreak(25);
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(16, y, 178, 20, 1.5, 1.5, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('NOTAS PERSONALES DEL ESTUDIANTE:', 20, y + 5);

      doc.setDrawColor(241, 245, 249);
      doc.line(20, y + 10, 188, y + 10);
      doc.line(20, y + 15, 188, y + 15);

      y += 24;

      // Apply running footer to all generated pages
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(16, 285, 194, 285);
        doc.text(`EdTech LMS Studio • Material Oficial del Módulo • Descarga Oficial`, 16, 290);
        doc.text(`Página ${p} de ${totalPages}`, 194, 290, { align: 'right' });
      }

      // Output PDF: Android Native WebView or Browser Download
      const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      if (window.AndroidNative && typeof window.AndroidNative.saveFileToDownloads === 'function') {
        const dataUri = doc.output('datauristring');
        window.AndroidNative.saveFileToDownloads(safeName, dataUri);
      } else {
        doc.save(safeName);
      }
    } catch (err) {
      console.error('ModuleResourcePDFEngine generation error:', err);
      alert('Se produjo un problema al generar el documento PDF. Por favor, reintenta.');
    }
  }
}

