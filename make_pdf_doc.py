# -*- coding: utf-8 -*-
"""
Genera la Guia Completa en formato PDF de alta calidad utilizando Microsoft Edge Headless.
"""

import os, subprocess

html_content = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Guía de Implementación y Arquitectura Técnica - Plataforma LMS / EdTech</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    @page {
      size: A4;
      margin: 1.6cm 1.4cm 1.6cm 1.4cm;
      @bottom-right {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1f2937;
      background: #ffffff;
      line-height: 1.6;
      font-size: 10.5pt;
    }

    .cover-header {
      border-bottom: 3px solid #4f46e5;
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }

    .badge-tag {
      display: inline-block;
      background: #eef2ff;
      color: #4338ca;
      font-weight: 700;
      font-size: 8pt;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
      border: 1px solid #c7d2fe;
    }

    h1 {
      font-size: 21pt;
      font-weight: 800;
      color: #111827;
      line-height: 1.25;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      font-size: 11pt;
      color: #4b5563;
      margin-bottom: 1.25rem;
    }

    .meta-box {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
      font-size: 9pt;
      margin-bottom: 2rem;
    }

    .meta-item strong {
      color: #4f46e5;
    }

    h2 {
      font-size: 14pt;
      font-weight: 700;
      color: #312e81;
      border-left: 4px solid #4f46e5;
      padding-left: 8px;
      margin-top: 1.75rem;
      margin-bottom: 0.75rem;
      page-break-after: avoid;
    }

    h3 {
      font-size: 11.5pt;
      font-weight: 700;
      color: #0e7490;
      margin-top: 1.2rem;
      margin-bottom: 0.4rem;
      page-break-after: avoid;
    }

    p {
      margin-bottom: 0.8rem;
      text-align: justify;
    }

    ul {
      margin-left: 1.5rem;
      margin-bottom: 0.8rem;
    }

    li {
      margin-bottom: 0.35rem;
    }

    .req-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-left: 3px solid #06b6d4;
      border-radius: 6px;
      padding: 0.85rem 1rem;
      margin-bottom: 1rem;
      page-break-inside: avoid;
    }

    .req-title {
      font-weight: 700;
      color: #111827;
      font-size: 10.5pt;
      margin-bottom: 0.35rem;
    }

    .code-tag {
      font-family: Consolas, Monaco, monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      color: #0f172a;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
    }

    .status-badge {
      display: inline-block;
      background: #dcfce7;
      color: #15803d;
      font-weight: 700;
      font-size: 8pt;
      padding: 2px 8px;
      border-radius: 4px;
      float: right;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      text-align: left;
    }

    th {
      background: #4f46e5;
      color: #ffffff;
      font-weight: 600;
    }

    tr:nth-child(even) {
      background: #f8fafc;
    }

    .text-green {
      color: #16a34a;
      font-weight: 700;
    }

    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <!-- Cover Header -->
  <div class="cover-header">
    <span class="badge-tag">Documento Técnico Oficial • EdTech LMS Studio 2026</span>
    <h1>Plataforma de Cursos Online y Membresías (LMS / EdTech)</h1>
    <div class="subtitle">Guía Integral de Arquitectura, Implementación de Requerimientos Funcionales y Verificación Multiplataforma (Web & Android)</div>

    <div class="meta-box">
      <div class="meta-item"><strong>Proyecto:</strong> Plataforma Educativa LMS / EdTech</div>
      <div class="meta-item"><strong>Estado Funcional:</strong> 100% de Requerimientos Operativos ✓</div>
      <div class="meta-item"><strong>Arquitectura:</strong> SPA Web + Servidor Central Python + App Android</div>
      <div class="meta-item"><strong>Dispositivos:</strong> PC / Mac (Web) y Móviles (APK Nativo)</div>
    </div>
  </div>

  <!-- 1. Visión General -->
  <h2>1. Visión General y Objetivos del Software</h2>
  <p>
    La presente plataforma fue concebida para satisfacer las necesidades operativas, comerciales y pedagógicas de academias, creadores de contenido educativo y empresas. Provee un entorno robusto que integra la gestión curricular de cursos en línea, reproducción optimizada con seguimiento automático de avance por lección, interacción docente-alumno mediante foros y evaluaciones interactivas con calificación instantánea, emisión oficial de diplomas digitales en PDF y modelos flexibles de monetización por venta individual o suscripciones recurrentes (SaaS de membresía).
  </p>
  <p>
    Para garantizar acceso universal y sin restricciones, se implementó una arquitectura distribuida que conecta la aplicación web con un servidor de sincronización central en Python (<span class="code-tag">server.py</span>) y una aplicación móvil nativa compilada en Android Studio con Gradle (<span class="code-tag">app-debug.apk</span>), garantizando consistencia de datos entre dispositivos conectados a la red.
  </p>

  <!-- 2. Requerimientos Funcionales: Portal del Estudiante -->
  <h2>2. Requerimientos Funcionales: Portal del Estudiante</h2>

  <div class="req-card">
    <span class="status-badge">100% Operativo</span>
    <div class="req-title">2.1 Catálogo de Cursos con Filtros Inteligentes</div>
    <p><strong>¿Cómo se logró y cómo funciona?</strong> Implementado en <span class="code-tag">renderCatalogView()</span> y <span class="code-tag">filterCatalog()</span> en <span class="code-tag">js/app.js</span>. El catálogo lista todos los cursos disponibles mediante tarjetas con portada, categoría, nivel, instructor, precio y valoración media. El estudiante puede filtrar en tiempo real por búsqueda de texto, por categoría (Programación, Diseño, IA, Negocios), por nivel (Principiante, Intermedio, Avanzado) y por calificación mínima (4.5★, 4.8★).</p>
    <p><strong>Evidencia:</strong> Filtrado instantáneo reactivo en pantalla; si el alumno ya está inscrito, la tarjeta visualiza su avance exacto y el botón de acceso al aula.</p>
  </div>

  <div class="req-card">
    <span class="status-badge">100% Operativo</span>
    <div class="req-title">2.2 Reproductor de Video con Marcado Automático de Progreso</div>
    <p><strong>¿Cómo se logró y cómo funciona?</strong> Implementado en <span class="code-tag">renderLearningPlayerView()</span> en <span class="code-tag">js/app.js</span> y <span class="code-tag">js/hls-player.js</span>. Ofrece compatibilidad dual:</p>
    <ul>
      <li><strong>Streaming HLS Adaptativo (.m3u8):</strong> Transmisión fluida con selección dinámica de calidad y ajuste de velocidad (1x, 1.25x, 1.5x).</li>
      <li><strong>Videos de YouTube Embebidos:</strong> La función <span class="code-tag">extractYouTubeId()</span> detecta enlaces de YouTube (shorts, watch, youtu.be), incrustando un reproductor iframe HD responsivo con controles nativos.</li>
      <li><strong>Marcado de Progreso:</strong> Marca automáticamente la lección como completada al alcanzar el 90% del video o mediante el botón 'Marcar Lección como Vista'. Actualiza la barra de progreso global y el índice temático lateral, guardando el progreso en <span class="code-tag">db.currentUser.progress</span>.</li>
    </ul>
  </div>

  <div class="req-card">
    <span class="status-badge">100% Operativo</span>
    <div class="req-title">2.3 Zona de Recursos Descargables (PDFs, Plantillas, Archivos)</div>
    <p><strong>¿Cómo se logró y cómo funciona?</strong> En el aula virtual, la pestaña 'Recursos Descargables' enumera todos los archivos anexados a la lección. La función <span class="code-tag">downloadResourceFile()</span> genera descargas dinámicas mediante Blob o enlaces seguros, permitiendo a los alumnos obtener guías de estudio oficiales y material de apoyo en cualquier dispositivo.</p>
  </div>

  <div class="req-card">
    <span class="status-badge">100% Operativo</span>
    <div class="req-title">2.4 Módulo de Evaluaciones (Quizzes con Calificación Inmediata)</div>
    <p><strong>¿Cómo se logró y cómo funciona?</strong> Gestionado en <span class="code-tag">renderQuizSection()</span> y <span class="code-tag">submitQuiz()</span> en <span class="code-tag">js/app.js</span>. Presenta las preguntas estructuradas con sus 4 alternativas (A, B, C, D). Al enviar la prueba, el algoritmo compara inmediatamente la selección del alumno con el índice correcto. Las alternativas correctas se iluminan en verde y las fallidas en rojo, desplegando la explicación pedagógica del docente y almacenando la calificación con <span class="code-tag">db.saveQuizScore()</span>.</p>
  </div>

  <div class="req-card">
    <span class="status-badge">100% Operativo</span>
    <div class="req-title">2.5 Generación y Descarga Automática de Certificados en PDF</div>
    <p><strong>¿Cómo se logró y cómo funciona?</strong> Desarrollado en <span class="code-tag">js/certificate.js</span> mediante <span class="code-tag">CertificateEngine</span>. Al alcanzar el 100% de lecciones completadas y evaluaciones aprobadas, se desbloquea el botón destacado 'Descargar Certificado PDF'. El motor genera un diploma oficial con tipografía formal, código QR verificable, firma del instructor, fecha y folio único, exportable como documento PDF.</p>
  </div>

  <div class="req-card">
    <span class="status-badge">100% Operativo</span>
    <div class="req-title">2.6 Foro de Preguntas y Comentarios (Q&A) por Clase</div>
    <p><strong>¿Cómo se logró y cómo funciona?</strong> Integrado en la pestaña 'Foro Q&A' del aula (<span class="code-tag">renderForumComments()</span>, <span class="code-tag">postForumComment()</span>). Los estudiantes formulan dudas vinculadas a la lección activa; las preguntas se publican de inmediato con avatar y nombre, permitiendo la retroalimentación del docente.</p>
  </div>

  <div class="req-card">
    <span class="status-badge">100% Operativo</span>
    <div class="req-title">2.7 Sistema de Calificaciones y Reseñas con 5 Estrellas</div>
    <p><strong>¿Cómo se logró y cómo funciona?</strong> Implementado con <span class="code-tag">openCourseRatingModal()</span>, <span class="code-tag">selectStarRating()</span> y <span class="code-tag">db.rateCourse()</span>. Disponible desde el aula, la tarjeta del curso y el detalle curricular. El alumno selecciona de 1 a 5 estrellas con previsualización dorada e ingresa su comentario. El sistema recalcula en tiempo real el promedio ponderado del curso y añade la opinión a la pestaña 'Reseñas & Calificaciones'.</p>
  </div>

  <div class="page-break"></div>

  <!-- 3. Requerimientos Funcionales: Panel del Instructor -->
  <h2>3. Requerimientos Funcionales: Panel del Instructor / Administrador</h2>

  <div class="req-card">
    <span class="status-badge">100% Operativo</span>
    <div class="req-title">3.1 Gestor de Cursos Estilo Drag-and-Drop</div>
    <p><strong>¿Cómo se logró y cómo funciona?</strong> Desarrollado en <span class="code-tag">js/drag-drop-builder.js</span> (<span class="code-tag">CourseBuilder</span>). Utiliza los eventos nativos de la API Drag & Drop (<span class="code-tag">dragstart</span>, <span class="code-tag">dragover</span>, <span class="code-tag">drop</span>) permitiendo al instructor reordenar módulos verticalmente o mover lecciones entre diferentes módulos con fluidez visual.</p>
  </div>

  <div class="req-card">
    <span class="status-badge">100% Operativo</span>
    <div class="req-title">3.2 Gestor Profesional de Quizzes y Evaluaciones Docente</div>
    <p><strong>¿Cómo se logró y cómo funciona?</strong> Integrado mediante <span class="code-tag">editQuiz()</span> y <span class="code-tag">saveQuizQuestion()</span> en <span class="code-tag">js/drag-drop-builder.js</span>. Al pulsar 'Quiz (X Qs)' en cualquier módulo, el profesor accede al gestor modal interactivo para:</p>
    <ul>
      <li>Establecer el porcentaje mínimo de aprobación (ej. 80%) y título de la prueba.</li>
      <li>Visualizar y editar todas las preguntas existentes con distintivo '✓ Correcta'.</li>
      <li>Crear preguntas personalizadas redactando el enunciado y las 4 opciones (A, B, C, D).</li>
      <li>Designar con un botón radial (radio button) cuál es la respuesta correcta y agregar una explicación pedagógica.</li>
    </ul>
    <p><strong>Evidencia:</strong> Se elimina cualquier opción ficticia por defecto; los alumnos responden con exactitud las alternativas cargadas por el docente.</p>
  </div>

  <div class="req-card">
    <span class="status-badge">100% Operativo</span>
    <div class="req-title">3.3 Portadas Personalizadas y Subida de Archivos PDFs</div>
    <p><strong>¿Cómo se logró y cómo funciona?</strong> Tanto en 'Crear Nuevo Curso' como en 'Editar Portada y Datos' (<span class="code-tag">editCourseCover</span>), el docente puede subir una fotografía desde su computadora o teléfono Android (mediante selector de archivos con conversión a Base64) o ingresar una URL web. Asimismo, el botón 'Video & PDFs' de cada lección permite adjuntar material de apoyo en formato PDF disponible al instante para los estudiantes.</p>
  </div>

  <div class="req-card">
    <span class="status-badge">100% Operativo</span>
    <div class="req-title">3.4 Panel de Análisis y Métricas LMS (Dashboard con Gráficas)</div>
    <p><strong>¿Cómo se logró y cómo funciona?</strong> Implementado en <span class="code-tag">renderInstructorDashboardView()</span> e <span class="code-tag">initAnalyticsCharts()</span> en <span class="code-tag">js/app.js</span> con Chart.js. Muestra KPIs globales (Ingresos, Suscriptores, Tasa de Finalización) y dos visualizaciones gráficas interactivas:</p>
    <ul>
      <li><strong>Evolución de Ventas e Ingresos Mensuales:</strong> Gráfico de línea con gradiente de color.</li>
      <li><strong>Distribución de Avance de Estudiantes:</strong> Gráfico de dona (0-25%, 26-50%, 51-75%, 76-100%).</li>
      <li><strong>Tabla de Lecciones con Mayor Abandono (Drop-off Rate):</strong> Detección analítica de puntos críticos para optimización de clases.</li>
    </ul>
  </div>

  <div class="req-card">
    <span class="status-badge">100% Operativo</span>
    <div class="req-title">3.5 Control de Acceso y Gestión de Estudiantes</div>
    <p><strong>¿Cómo se logró y cómo funciona?</strong> Ubicado en la sección 'Control de Alumnos' (<span class="code-tag">enrollStudentManual</span>, <span class="code-tag">toggleStudentStatus</span>). El docente puede matricular manualmente a cualquier estudiante por correo; la cuenta recibe acceso 100% directo y gratuito al curso sin necesidad de pagar membresía. De igual forma, el profesor puede revocar el acceso con un clic, bloqueando de inmediato el ingreso al aula virtual.</p>
  </div>

  <!-- 4. Monetización y Membresías -->
  <h2>4. Monetización, Membresías y Cupones Promocionales</h2>
  <div class="req-card">
    <span class="status-badge">100% Operativo</span>
    <div class="req-title">4.1 Venta Individual de Cursos (Pay-per-course)</div>
    <p>Modal de checkout (<span class="code-tag">openCheckoutModal()</span>) con cálculo de impuestos, validación de tarjeta y emisión de recibo digital con desbloqueo de acceso de por vida.</p>
  </div>
  <div class="req-card">
    <span class="status-badge">100% Operativo</span>
    <div class="req-title">4.2 Modelo de Membresías y Suscripción SaaS</div>
    <p>Selector de planes 'Pase Pro' y 'Plan Enterprise' (<span class="code-tag">openSubscriptionModal()</span>) con conmutador de facturación mensual o anual (con 20% de ahorro) y desbloqueo total del catálogo.</p>
  </div>
  <div class="req-card">
    <span class="status-badge">100% Operativo</span>
    <div class="req-title">4.3 Sistema de Cupones de Descuento</div>
    <p>Validación en tiempo real (<span class="code-tag">applyDiscountCoupon()</span>) de códigos promocionales como <span class="code-tag">LAUNCH50</span> (50% desc.) o <span class="code-tag">EDTECH100</span> (100% desc.), recalculando el total y actualizando los usos restantes.</p>
  </div>

  <!-- 5. Requerimientos No Funcionales y Arquitectura Técnica -->
  <h2>5. Requerimientos No Funcionales y Arquitectura Multi-Dispositivo</h2>
  <p><strong>• Streaming Adaptativo HLS y YouTube:</strong> Soporte Hls.js adaptativo según conectividad y reproductor YouTube embebido.</p>
  <p><strong>• Protección de Contenido:</strong> Emulación de URLs firmadas de tiempo limitado con tokens de sesión efímeros.</p>
  <p><strong>• Servidor Central de Sincronización (server.py):</strong> Servicio REST en Python 3 sobre puerto 3000 con persistencia en <span class="code-tag">database.json</span>. Provee endpoints <span class="code-tag">/api/database</span> y <span class="code-tag">/api/sync</span> con fusión inteligente (merge) de cuentas, cursos y progresos entre computadoras y teléfonos en la red local Wi-Fi.</p>
  <p><strong>• Aplicación Nativa Android (Android Studio):</strong> Paquete compilado con Gradle (<span class="code-tag">app-debug.apk</span>) con integración de WebView y <span class="code-tag">WebChromeClient.onShowFileChooser</span> para soporte de carga de fotos desde cámara y galería en dispositivos móviles.</p>

  <!-- 6. Matriz de Cumplimiento -->
  <h2>6. Matriz de Trazabilidad y Verificación Técnica</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 32%;">Requerimiento Funcional</th>
        <th style="width: 48%;">Módulo / Funciones de Implementación</th>
        <th style="width: 20%;">Estado Verificado</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Catálogo con Filtros</strong></td>
        <td><span class="code-tag">js/app.js</span> -> renderCatalogView(), filterCatalog()</td>
        <td class="text-green">✓ 100% Operativo</td>
      </tr>
      <tr>
        <td><strong>Video con Marcado de Progreso</strong></td>
        <td><span class="code-tag">js/app.js</span> -> renderLearningPlayerView(), toggleCurrentLessonComplete()</td>
        <td class="text-green">✓ 100% Operativo</td>
      </tr>
      <tr>
        <td><strong>Streaming HLS & YouTube</strong></td>
        <td><span class="code-tag">js/hls-player.js</span> + <span class="code-tag">js/app.js</span> -> extractYouTubeId()</td>
        <td class="text-green">✓ 100% Operativo</td>
      </tr>
      <tr>
        <td><strong>Recursos Descargables (PDFs)</strong></td>
        <td><span class="code-tag">js/app.js</span> -> downloadResourceFile()</td>
        <td class="text-green">✓ 100% Operativo</td>
      </tr>
      <tr>
        <td><strong>Quizzes con Calificación Inmediata</strong></td>
        <td><span class="code-tag">js/app.js</span> -> renderQuizSection(), submitQuiz()</td>
        <td class="text-green">✓ 100% Operativo</td>
      </tr>
      <tr>
        <td><strong>Certificados Oficiales en PDF</strong></td>
        <td><span class="code-tag">js/certificate.js</span> -> CertificateEngine.renderCertificateModal()</td>
        <td class="text-green">✓ 100% Operativo</td>
      </tr>
      <tr>
        <td><strong>Foro de Preguntas Q&A</strong></td>
        <td><span class="code-tag">js/app.js</span> -> renderForumComments(), postForumComment()</td>
        <td class="text-green">✓ 100% Operativo</td>
      </tr>
      <tr>
        <td><strong>Calificación 5 Estrellas & Reseñas</strong></td>
        <td><span class="code-tag">js/app.js</span> -> openCourseRatingModal() + <span class="code-tag">js/data.js</span> -> rateCourse()</td>
        <td class="text-green">✓ 100% Operativo</td>
      </tr>
      <tr>
        <td><strong>Gestor Drag-and-Drop Docente</strong></td>
        <td><span class="code-tag">js/drag-drop-builder.js</span> -> CourseBuilder.attachDragEvents()</td>
        <td class="text-green">✓ 100% Operativo</td>
      </tr>
      <tr>
        <td><strong>Gestor Profesional de Quizzes</strong></td>
        <td><span class="code-tag">js/drag-drop-builder.js</span> -> editQuiz(), saveQuizQuestion()</td>
        <td class="text-green">✓ 100% Operativo</td>
      </tr>
      <tr>
        <td><strong>Subida de Portadas y PDFs</strong></td>
        <td><span class="code-tag">js/app.js</span> -> handleNewCourseCoverSelected(), editCourseCover()</td>
        <td class="text-green">✓ 100% Operativo</td>
      </tr>
      <tr>
        <td><strong>Métricas y Analítica LMS</strong></td>
        <td><span class="code-tag">js/app.js</span> -> renderInstructorDashboardView(), initAnalyticsCharts()</td>
        <td class="text-green">✓ 100% Operativo</td>
      </tr>
      <tr>
        <td><strong>Control de Acceso de Estudiantes</strong></td>
        <td><span class="code-tag">js/data.js</span> -> enrollStudentManual(), toggleStudentStatus()</td>
        <td class="text-green">✓ 100% Operativo</td>
      </tr>
      <tr>
        <td><strong>Venta Pay-per-course & Membresías</strong></td>
        <td><span class="code-tag">js/app.js</span> -> openCheckoutModal(), openSubscriptionModal()</td>
        <td class="text-green">✓ 100% Operativo</td>
      </tr>
      <tr>
        <td><strong>Cupones y Códigos de Descuento</strong></td>
        <td><span class="code-tag">js/app.js</span> -> applyDiscountCoupon()</td>
        <td class="text-green">✓ 100% Operativo</td>
      </tr>
      <tr>
        <td><strong>Sincronización PC <-> Móvil Wi-Fi</strong></td>
        <td><span class="code-tag">server.py</span> + <span class="code-tag">js/data.js</span> -> syncWithServer() (192.168.0.120:3000)</td>
        <td class="text-green">✓ 100% Operativo</td>
      </tr>
      <tr>
        <td><strong>Compilación App Android (APK)</strong></td>
        <td><span class="code-tag">app/</span> + Gradle assembleDebug -> app-debug.apk</td>
        <td class="text-green">✓ Compilado y Listo</td>
      </tr>
    </tbody>
  </table>

</body>
</html>
"""

html_path = os.path.abspath("documentacion_completa_lms.html")
pdf_path = os.path.abspath("Guia_Completa_Implementacion_LMS_EdTech.pdf")

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML generated at: {html_path}")

# Run Microsoft Edge headless to print to PDF
edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
cmd = [
    edge_path,
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    f'--print-to-pdf={pdf_path}',
    f'file:///{html_path.replace(os.sep, "/")}'
]

print("Executing Edge headless to generate PDF...")
res = subprocess.run(cmd, capture_output=True)

if os.path.exists(pdf_path):
    print(f"SUCCESS: PDF generated successfully at: {pdf_path}")
    print(f"PDF size: {os.path.getsize(pdf_path):,} bytes")
else:
    print("Error: PDF could not be generated. Stderr:", res.stderr.decode('utf-8', errors='ignore'))
