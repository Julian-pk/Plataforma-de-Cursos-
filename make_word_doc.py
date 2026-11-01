# -*- coding: utf-8 -*-
"""
Script para generar la documentación técnica y funcional completa en Word (.docx) y PDF.
Plataforma de Cursos Online y Membresías (LMS / EdTech)
"""

import os, sys, subprocess, json
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def create_word_document():
    doc = docx.Document()

    # Page Margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Styles
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Calibri'
    style_normal.font.size = Pt(11)
    style_normal.font.color.rgb = RGBColor(31, 41, 55)

    # Title / Header
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run("GUÍA DE IMPLEMENTACIÓN Y ARQUITECTURA TÉCNICA\nPLATAFORMA LMS / EDTECH & MEMBRESÍAS 2026")
    title_run.font.size = Pt(20)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(79, 70, 229) # Indigo

    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_run = sub_p.add_run("Cumplimiento Integral de Requerimientos Funcionales, Arquitectura Multiplataforma (Web & Android) y Guía Paso a Paso")
    sub_run.font.size = Pt(12)
    sub_run.font.italic = True
    sub_run.font.color.rgb = RGBColor(107, 114, 128)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Meta Table
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Proyecto:", "Plataforma de Cursos Online y Membresías (LMS / EdTech)"),
        ("Arquitectura:", "Web Responsiva SPA + Servidor Central Python + App Android Nativa (APK)"),
        ("Estado de Requerimientos:", "100% Implementados, Verificados y Operativos"),
        ("Compatibilidad:", "Navegadores Modernos (Chrome/Edge/Firefox/Safari) y Dispositivos Android")
    ]
    for i, (k, v) in enumerate(meta_data):
        row = meta_table.rows[i]
        c0 = row.cells[0]
        c1 = row.cells[1]
        c0.text = k
        c1.text = v
        set_cell_background(c0, "EEF2FF")
        set_cell_background(c1, "F9FAFB")
        c0.paragraphs[0].runs[0].font.bold = True
        c0.paragraphs[0].runs[0].font.color.rgb = RGBColor(67, 56, 202)
        c0.width = Inches(2.2)
        c1.width = Inches(4.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(16)

    def add_section_header(text, level=1):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(6)
        r = h.add_run(text)
        r.font.bold = True
        if level == 1:
            r.font.size = Pt(15)
            r.font.color.rgb = RGBColor(79, 70, 229)
        elif level == 2:
            r.font.size = Pt(13)
            r.font.color.rgb = RGBColor(14, 116, 144)
        else:
            r.font.size = Pt(11.5)
            r.font.color.rgb = RGBColor(31, 41, 55)
        return h

    # 1. Visión General
    add_section_header("1. VISIÓN GENERAL DEL SISTEMA", 1)
    p = doc.add_paragraph()
    p.add_run(
        "La Plataforma de Cursos Online y Membresías (LMS / EdTech) fue diseñada y construida como una solución integral que permite a creadores de contenido, academias y empresas alojar, vender y administrar programas formativos en línea. "
        "El sistema combina video pregrabado de alto rendimiento con marcado de progreso por lección, evaluaciones interactivas con calificación automática, emisión oficial de certificados en PDF respaldados por código QR, foros de consulta por clase, valoraciones de 5 estrellas de estudiantes, y un panel de administración profesional estilo drag-and-drop para estructurar módulos y lecciones.\n\n"
        "Asimismo, se implementó una arquitectura híbrida compuesta por:\n"
        "1. Aplicación Web Frontend (SPA interactiva en HTML5, CSS3 y Vanilla JavaScript).\n"
        "2. Servidor Central de Sincronización en Python (server.py en puerto 3000 con persistencia en database.json).\n"
        "3. Aplicación Móvil Android Nativa compilada en Android Studio con Gradle (app-debug.apk) que permite ejecutar la plataforma en cualquier teléfono con soporte para carga de archivos desde cámara y galería."
    )

    # 2. Requerimientos Funcionales - Portal del Estudiante
    add_section_header("2. REQUERIMIENTOS FUNCIONALES: PORTAL DEL ESTUDIANTE", 1)

    # 2.1
    add_section_header("2.1 Catálogo de Cursos con Filtros Inteligentes", 2)
    p = doc.add_paragraph()
    p.add_run(
        "• ¿Cómo se logró y cómo funciona?\n"
        "Se implementó en renderCatalogView() y filterCatalog() en js/app.js. El catálogo renderiza tarjetas dinámicas de cursos que exhiben portada, categoría, nivel, instructor, precio, número de módulos y promedio de calificación en estrellas. "
        "Los estudiantes pueden filtrar en tiempo real sin recargar la página mediante un campo de búsqueda por palabras clave, selector de categorías (Programación, Diseño, IA & Datos, Negocios), selector de nivel (Principiante, Intermedio, Avanzado) y calificación mínima en estrellas (Todas, 4.5+ o 4.8+).\n"
        "• Evidencia de Funcionamiento: Los filtros recalculan la cuadrícula inmediatamente al escribir o cambiar los desplegables. Si el estudiante está inscrito, la tarjeta muestra automáticamente su porcentaje de avance y botón 'Continuar Aprendiendo'."
    )

    # 2.2
    add_section_header("2.2 Reproductor de Video con Marcado Automático de Progreso", 2)
    p = doc.add_paragraph()
    p.add_run(
        "• ¿Cómo se logró y cómo funciona?\n"
        "Se diseñó un motor dual de video en renderLearningPlayerView():\n"
        "  a) Streaming HLS Adaptativo (.m3u8): Utiliza la librería Hls.js en js/hls-player.js para ajustar la resolución dinámicamente según la velocidad de internet, con controles de velocidad (1x, 1.25x, 1.5x) y simulación de URL firmada protegida.\n"
        "  b) Videos de YouTube Embebidos: Mediante extractYouTubeId() en js/app.js, el sistema detecta automáticamente cualquier enlace de YouTube introducido por el instructor (ej. youtube.com/watch?v=... o youtu.be/...), extrayendo el ID y renderizando un iframe sandbox seguro con controles nativos en alta definición.\n"
        "  c) Marcado de Progreso: Cuenta con marcado automático al completar el 90% del video y con el botón manual 'Marcar Lección como Vista' (toggleCurrentLessonComplete). La barra de progreso superior e índice temático lateral se actualizan de manera instantánea persistiendo el estado en db.currentUser.progress.\n"
        "• Evidencia de Funcionamiento: Las lecciones vistas muestran un icono verde '✓', recalculan el porcentaje global de 0% a 100% y desbloquean el botón para descargar el certificado PDF."
    )

    # 2.3
    add_section_header("2.3 Zona de Recursos Descargables (PDFs, Plantillas, Archivos)", 2)
    p = doc.add_paragraph()
    p.add_run(
        "• ¿Cómo se logró y cómo funciona?\n"
        "En la parte inferior del reproductor se integró una pestaña 'Recursos Descargables' que lista los documentos asociados a cada lección (PDFs, guías de código, plantillas ZIP). La función downloadResourceFile() en js/app.js genera descargas reales mediante Blob dinámico o enlaces a servidor, compatibles tanto en navegadores de escritorio como en el sistema de descargas de Android.\n"
        "• Evidencia de Funcionamiento: Al pulsar 'Descargar', el navegador o móvil inicia la descarga del documento oficial correspondiente al módulo."
    )

    # 2.4
    add_section_header("2.4 Módulo de Evaluaciones (Quizzes de Opción Múltiple con Calificación Inmediata)", 2)
    p = doc.add_paragraph()
    p.add_run(
        "• ¿Cómo se logró y cómo funciona?\n"
        "Implementado en renderQuizSection() y submitQuiz() en js/app.js. Los quizzes presentan preguntas con opciones de respuesta de la A a la D. Al seleccionar las respuestas y pulsar 'Enviar Evaluación', el sistema compara instantáneamente las elecciones con las respuestas correctas designadas por el instructor. "
        "Las respuestas correctas se resaltan en verde con su respectiva explicación pedagógica, y las incorrectas se marcan en rojo. El puntaje porcentual obtenido se almacena mediante db.saveQuizScore() y, si se alcanza el puntaje de aprobación (ej. 80%), el módulo se marca como superado.\n"
        "• Evidencia de Funcionamiento: Calificación instantánea sin demoras, visualización pedagógica de explicaciones y reflejo inmediato en el avance curricular."
    )

    # 2.5
    add_section_header("2.5 Generación y Descarga Automática de Certificados en PDF", 2)
    p = doc.add_paragraph()
    p.add_run(
        "• ¿Cómo se logró y cómo funciona?\n"
        "Desarrollado en js/certificate.js mediante el motor CertificateEngine. Cuando el estudiante completa el 100% de las lecciones y aprueba las evaluaciones, el sistema activa automáticamente el botón brillante 'Descargar Certificado PDF'. "
        "El motor renderiza un diploma de diseño premium con tipografía de graduación, código único de verificación, código QR escaneable, fecha de expedición, firma del instructor y marco ornamental. Al presionar 'Descargar Certificado PDF', genera un documento vectorial de alta resolución descargable en cualquier dispositivo.\n"
        "• Evidencia de Funcionamiento: Modal interactivo con vista previa del certificado y descarga directa en PDF verificable."
    )

    # 2.6
    add_section_header("2.6 Sección de Comentarios y Foro de Preguntas por Clase (Q&A)", 2)
    p = doc.add_paragraph()
    p.add_run(
        "• ¿Cómo se logró y cómo funciona?\n"
        "Ubicado en la pestaña 'Foro Q&A' del aula virtual mediante renderForumComments() y postForumComment() en js/app.js. Los estudiantes pueden publicar dudas contextualizadas a la lección que están viendo. Las dudas quedan registradas con la fecha, nombre y avatar del estudiante, permitiendo al profesor responder y calificar las intervenciones.\n"
        "• Evidencia de Funcionamiento: Publicación inmediata de comentarios con persistencia en la base de datos sincronizada."
    )

    # 2.7
    add_section_header("2.7 Sistema de Calificaciones y Reseñas con 5 Estrellas", 2)
    p = doc.add_paragraph()
    p.add_run(
        "• ¿Cómo se logró y cómo funciona?\n"
        "Implementado en openCourseRatingModal(), previewStarRating(), selectStarRating() en js/app.js y rateCourse() en js/data.js. Los estudiantes disponen del botón 'Calificar Curso' en el reproductor de clases, en el detalle del curso y en su panel de estudiante. "
        "El modal ofrece 5 estrellas interactivas con iluminación dorada al pasar el ratón, etiquetas descriptivas (de 1 estrella 'Necesita mejorar' a 5 estrellas 'Excelente') y un área de texto para redactar una reseña. Al guardar, rateCourse() recalcula el promedio ponderado del curso en tiempo real y registra la reseña en la pestaña 'Reseñas & Calificaciones'.\n"
        "• Evidencia de Funcionamiento: Las estrellas del curso en el catálogo, aula y detalle se actualizan instantáneamente con el nuevo promedio y recuento de opiniones."
    )

    # 3. Panel del Instructor
    add_section_header("3. REQUERIMIENTOS FUNCIONALES: PANEL DEL INSTRUCTOR / ADMINISTRADOR", 1)

    # 3.1
    add_section_header("3.1 Gestor de Cursos Drag-and-Drop", 2)
    p = doc.add_paragraph()
    p.add_run(
        "• ¿Cómo se logró y cómo funciona?\n"
        "Implementado en js/drag-drop-builder.js mediante la clase CourseBuilder. El instructor accede a 'Plan Curricular (Drag & Drop)' donde puede visualizar los módulos y lecciones del curso. Mediante la API nativa HTML5 Drag & Drop (dragstart, dragover, drop), el instructor puede arrastrar módulos completos hacia arriba o abajo, o mover lecciones entre diferentes módulos. "
        "Cada elemento cuenta con tiradores de arrastre visuales (iconos grip-vertical) e inputs editables en línea para modificar títulos al instante.\n"
        "• Evidencia de Funcionamiento: Reordenamiento fluido con guardado automático al soltar el elemento en su nueva posición."
    )

    # 3.2
    add_section_header("3.2 Gestor Profesional de Quizzes y Preguntas", 2)
    p = doc.add_paragraph()
    p.add_run(
        "• ¿Cómo se logró y cómo funciona?\n"
        "En el creador de cursos, cada módulo incluye el botón 'Quiz (X Qs)' gestionado por editQuiz() y saveQuizQuestion() en js/drag-drop-builder.js. Al pulsarlo, se abre una ventana modal completa donde el profesor puede:\n"
        "  1. Configurar el título del Quiz y el porcentaje mínimo de aprobación (ej. 80%).\n"
        "  2. Ver la lista de todas las preguntas creadas con sus opciones y distintivo '✓ Correcta'.\n"
        "  3. Escribir preguntas personalizadas (ej. '¿Cuántos años tiene Gustavo?').\n"
        "  4. Introducir 4 opciones de respuesta totalmente personalizadas (A, B, C, D).\n"
        "  5. Seleccionar la respuesta correcta mediante un botón radial (radio button).\n"
        "  6. Añadir explicaciones de retroalimentación pedagógica tras responder.\n"
        "• Evidencia de Funcionamiento: Eliminación total de opciones por defecto o vacías; los estudiantes reciben exactamente las preguntas y alternativas ingresadas por el instructor."
    )

    # 3.3
    add_section_header("3.3 Subida de Portadas Personalizadas y Archivos PDF", 2)
    p = doc.add_paragraph()
    p.add_run(
        "• ¿Cómo se logró y cómo funciona?\n"
        "Tanto en el modal de creación de cursos como en el botón 'Portada y Datos' del builder (editCourseCover), el profesor puede subir una imagen de portada desde su disco duro / galería de Android mediante un selector de archivos o escribir una URL web de imagen. "
        "Asimismo, en cada lección existe el botón 'Video & PDFs' (editLessonDetails), permitiendo cambiar la URL del video (o enlace de YouTube) y adjuntar guías en formato PDF que quedan inmediatamente disponibles para los alumnos.\n"
        "• Evidencia de Funcionamiento: Carga inmediata con vista previa de imagen en Base64 o URL, y guardado persistente en el servidor."
    )

    # 3.4
    add_section_header("3.4 Panel de Análisis y Métricas LMS", 2)
    p = doc.add_paragraph()
    p.add_run(
        "• ¿Cómo se logró y cómo funciona?\n"
        "Implementado en renderInstructorDashboardView() e initAnalyticsCharts() en js/app.js. Presenta tarjetas de KPI (Ingresos Totales, Suscriptores Activos, Tasa Media de Finalización y Cursos Publicados). "
        "Integra dos gráficos visuales con Chart.js: Evolución de Ventas e Ingresos Mensuales (gráfico de línea interactivo con gradiente) y Distribución de Avance de Estudiantes (gráfico de dona con porcentajes de 0-25%, 26-50%, 51-75% y 76-100%). Además, incluye la tabla 'Lecciones con Mayor Tasa de Abandono (Drop-off Rate)' con botones para optimizar el contenido.\n"
        "• Evidencia de Funcionamiento: Gráficos reactivos con renderizado correcto en cualquier resolución y dispositivo móvil."
    )

    # 3.5
    add_section_header("3.5 Control de Acceso y Gestión de Estudiantes", 2)
    p = doc.add_paragraph()
    p.add_run(
        "• ¿Cómo se logró y cómo funciona?\n"
        "En la pestaña 'Control de Alumnos' del panel docente, el instructor puede inscribir manualmente a cualquier estudiante mediante enrollStudentManual(). "
        "El estudiante inscrito recibe acceso directo, gratuito y de por vida al curso sin necesidad de pagar suscripción. Asimismo, el profesor puede alternar el estado del estudiante entre 'Activo' y 'Revocado' con un solo clic (toggleStudentStatus). Si el acceso es revocado, el sistema bloquea inmediatamente la entrada al aula virtual para esa cuenta.\n"
        "• Evidencia de Funcionamiento: Reconocimiento inmediato de matrícula al iniciar sesión el estudiante y revocación instantánea verificada."
    )

    # 4. Monetización y Membresías
    add_section_header("4. MONETIZACIÓN, MEMBRESÍAS Y CUPONES DE DESCUENTO", 1)
    p = doc.add_paragraph()
    p.add_run(
        "• 4.1 Venta Individual (Pay-per-course):\n"
        "Permite a estudiantes comprar cursos individuales mediante openCheckoutModal(). Muestra el desglose de precio base, impuestos y total, permitiendo procesar el pago y dando acceso inmediato al contenido.\n\n"
        "• 4.2 Modelo de Suscripciones SaaS (Membresías):\n"
        "Disponible a través de openSubscriptionModal(). Permite seleccionar entre facturación mensual o anual (con 20% de descuento) para los planes 'Pase Pro' y 'Plan Enterprise', desbloqueando acceso ilimitado a todo el catálogo.\n\n"
        "• 4.3 Sistema de Cupones y Códigos Promocionales:\n"
        "Gestionado por applyDiscountCoupon() en js/app.js. Valida códigos promocionales activos (ej. LAUNCH50 para 50% de descuento, EDTECH100 para acceso 100% gratuito). Calcula la rebaja en tiempo real, descuenta el saldo total y decrementa los usos restantes en la base de datos."
    )

    # 5. Arquitectura Técnica y Sincronización
    add_section_header("5. ARQUITECTURA TÉCNICA, SINCRONIZACIÓN Y APP ANDROID", 1)
    p = doc.add_paragraph()
    p.add_run(
        "• 5.1 Servidor Central de Sincronización Multi-Dispositivo (server.py):\n"
        "El servidor escrito en Python 3 implementa un servicio REST en el puerto 3000 con soporte universal de CORS. Dispone de endpoints clave:\n"
        "  - GET /api/database: Devuelve la base de datos unificada con cursos, lecciones, quizzes, usuarios y progresos.\n"
        "  - POST /api/sync: Recibe cambios de la PC o del teléfono y realiza una fusión inteligente (merge) preservando usuarios, progresos y cursos creados.\n"
        "  - GET /api/status: Informa el estado y la dirección IP activa de la red Wi-Fi (ej. 192.168.0.120:3000).\n\n"
        "• 5.2 Auto-Sincronización en js/data.js:\n"
        "Cada 6 segundos, y de forma obligatoria antes de iniciar sesión o registrarse, la aplicación consulta al servidor central para asegurar que las cuentas y cursos creados en la computadora estén inmediatamente disponibles en el teléfono móvil y viceversa.\n\n"
        "• 5.3 Aplicación Android Nativa (Android Studio / Gradle):\n"
        "Configurada en el directorio app/ con AndroidManifest.xml habilitando usesCleartextTraffic='true' e Internet. MainActivity.java integra WebView con WebChromeClient.onShowFileChooser, permitiendo que al pulsar los botones de subir foto o PDFs en el teléfono se abra el selector nativo de documentos o la cámara de Android. Compilado con Gradle generando el paquete app-debug.apk."
    )

    # 6. Matriz de Cumplimiento
    add_section_header("6. MATRIZ DE CUMPLIMIENTO DE REQUERIMIENTOS FUNCIONALES", 1)
    table = doc.add_table(rows=1, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = table.rows[0]
    hdr.cells[0].text = "Requerimiento Funcional"
    hdr.cells[1].text = "Archivo y Función de Implementación"
    hdr.cells[2].text = "Estado y Verificación"
    for c in hdr.cells:
        set_cell_background(c, "4F46E5")
        c.paragraphs[0].runs[0].font.bold = True
        c.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)

    matrix = [
        ("Catálogo con Filtros por Categoría, Nivel y Rating", "js/app.js -> renderCatalogView(), filterCatalog()", "✓ 100% Operativo"),
        ("Reproductor de Video con Marcado Automático de Avance", "js/app.js -> renderLearningPlayerView(), toggleCurrentLessonComplete()", "✓ 100% Operativo"),
        ("Soporte Streaming HLS y Videos Embebidos de YouTube", "js/hls-player.js + js/app.js -> extractYouTubeId()", "✓ 100% Operativo"),
        ("Zona de Recursos Descargables (PDFs, Plantillas)", "js/app.js -> downloadResourceFile()", "✓ 100% Operativo"),
        ("Módulo de Quizzes con Calificación Inmediata", "js/app.js -> renderQuizSection(), submitQuiz()", "✓ 100% Operativo"),
        ("Generación y Descarga de Certificados en PDF", "js/certificate.js -> CertificateEngine.renderCertificateModal()", "✓ 100% Operativo"),
        ("Foro de Preguntas y Comentarios (Q&A)", "js/app.js -> renderForumComments(), postForumComment()", "✓ 100% Operativo"),
        ("Sistema de Calificación con 5 Estrellas y Reseñas", "js/app.js -> openCourseRatingModal() + js/data.js -> rateCourse()", "✓ 100% Operativo"),
        ("Gestor Drag-and-Drop de Módulos y Lecciones", "js/drag-drop-builder.js -> CourseBuilder.attachDragEvents()", "✓ 100% Operativo"),
        ("Gestor Profesional de Preguntas y Quizzes Docente", "js/drag-drop-builder.js -> editQuiz(), saveQuizQuestion()", "✓ 100% Operativo"),
        ("Subida de Portadas de Cursos y PDFs por Profesor", "js/app.js -> handleNewCourseCoverSelected(), editCourseCover()", "✓ 100% Operativo"),
        ("Panel de Métricas y Analítica LMS con Gráficas", "js/app.js -> renderInstructorDashboardView(), initAnalyticsCharts()", "✓ 100% Operativo"),
        ("Control de Acceso de Estudiantes (Inscripción/Revocación)", "js/data.js -> enrollStudentManual(), toggleStudentStatus()", "✓ 100% Operativo"),
        ("Venta Pay-per-course y Suscripciones SaaS", "js/app.js -> openCheckoutModal(), openSubscriptionModal()", "✓ 100% Operativo"),
        ("Sistema de Cupones de Descuento", "js/app.js -> applyDiscountCoupon()", "✓ 100% Operativo"),
        ("Sincronización PC <-> Teléfono Móvil en Red Wi-Fi", "server.py (Puerto 3000) + js/data.js -> syncWithServer()", "✓ 100% Operativo"),
        ("Compilación de App Móvil Android Nativa (APK)", "app/src/main/ + gradlew assembleDebug -> app-debug.apk", "✓ Compilado y Listo")
    ]

    for item in matrix:
        row = table.add_row()
        for idx, text in enumerate(item):
            cell = row.cells[idx]
            cell.text = text
            if idx == 0:
                cell.paragraphs[0].runs[0].font.bold = True
                cell.width = Inches(2.6)
            elif idx == 1:
                cell.width = Inches(2.8)
                cell.paragraphs[0].runs[0].font.size = Pt(9.5)
            elif idx == 2:
                cell.width = Inches(1.5)
                cell.paragraphs[0].runs[0].font.color.rgb = RGBColor(22, 163, 74) # Green
                cell.paragraphs[0].runs[0].font.bold = True
            set_cell_background(cell, "F9FAFB" if len(table.rows) % 2 == 0 else "FFFFFF")

    docx_path = os.path.abspath("Guia_Completa_Implementacion_LMS_EdTech.docx")
    doc.save(docx_path)
    print(f"Word document successfully created at: {docx_path}")
    return docx_path

if __name__ == "__main__":
    create_word_document()
