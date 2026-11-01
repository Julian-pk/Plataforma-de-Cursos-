# Plataforma de Cursos Online y Membresías (EdTech LMS Studio)

Sistema integral de gestión de aprendizaje (LMS) y plataforma de membresías educativas para alojar, vender y cursar educación digital con arquitectura híbrida (Web SPA, servidor central en Python y aplicación móvil nativa Android).

---

## 🚀 Características Principales

### 👨‍🎓 Portal del Estudiante
- **Catálogo Inteligente:** Filtros dinámicos en tiempo real por búsqueda, categorías (Programación, Diseño, IA, Negocios), niveles y valoración.
- **Reproductor Multimedia Adaptativo:** Compatible con streaming HLS adaptativo (`.m3u8`), videos WebM/MP4 locales y videos embebidos de YouTube.
- **Seguimiento Automático:** Marcado de progreso automático al 90% del video, cálculo porcentual y avance por módulos.
- **Evaluaciones (Quizzes):** Cuestionarios interactivos por módulo con retroalimentación pedagógica instantánea.
- **Certificados Oficiales PDF:** Generación dinámica de diplomas con código QR de verificación, firma de instructor y descarga directa en PDF vía jsPDF y Canvas.
- **Foro Q&A:** Sistema de preguntas y respuestas en tiempo real vinculado a cada lección.
- **Reseñas & Calificaciones:** Sistema ponderado de 1 a 5 estrellas con comentarios de estudiantes.
- **Monetización Dual:** Compra individual de cursos (Pay-per-course) o suscripción recurrente a planes de membresía con soporte para cupones de descuento.

### 👨‍🏫 Studio / Panel del Instructor
- **Constructor Curricular Drag & Drop:** Creador visual interactivo para estructurar módulos y lecciones arrastrando elementos.
- **Editor de Quizzes:** Formulario para redactar preguntas, respuestas y explicaciones pedagógicas.
- **Gestión de Cursos y Contenidos:** Carga de portadas, recursos adjuntos descargables y configuración de precios/suscripción.
- **Analítica LMS:** Métricas de inscripciones, ingresos totales, progreso promedio y gráficos con Chart.js.
- **Control de Estudiantes:** Gestión de estado de alumnos (activo/suspendido) e inscripciones manuales.

### 📱 Multiplataforma (Web & Android)
- **Cliente Web SPA:** Funciona de forma totalmente desacoplada y responsiva.
- **App Nativa Android:** Proyecto listo en Android Studio con wrapper WebView acelerado por hardware e interfaz puente JavaScript nativa (`JavascriptInterface`).
- **Sincronización Wi-Fi:** Servidor central Python con CORS universal para sincronizar datos en tiempo real entre la PC y dispositivos móviles en la misma red.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3 (Variables, Dark Theme), Vanilla JavaScript (ES6+).
- **Librerías Web:**
  - [HLS.js](https://github.com/video-dev/hls.js/) (Streaming adaptativo)
  - [Chart.js](https://www.chartjs.org/) (Gráficos analíticos)
  - [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/) (Generación de certificados PDF)
  - [Lucide Icons](https://lucide.dev/) (Iconografía SVG)
- **Backend & Servidor:** Python 3 (`http.server`, `socket`, `json`).
- **Persistencia:** Base de datos relacional/documental en `database.json` + `LocalStorage`.
- **Móvil:** Android SDK 34, AndroidX, Java, Gradle.
- **PWA:** Web App Manifest para instalación en navegadores modernos.

---

## 💻 Instrucciones de Ejecución

### Opción 1: Servidor de Sincronización Central (Recomendado)
```bash
python server.py
```
El servidor detectará tu IP local y levantará el sistema en el puerto `3000` (ejemplo: `http://localhost:3000/` o `http://192.168.0.X:3000/`).

### Opción 2: Servidor Web Estático
```bash
python -m http.server 8080
```
Abre en el navegador: `http://localhost:8080/index.html`

### Opción 3: Proyecto Android en Android Studio
1. Abre **Android Studio**.
2. Selecciona **Open** y elige la raíz de este proyecto.
3. Espera la sincronización de Gradle y ejecuta en tu emulador o dispositivo físico.

---

## 📂 Estructura del Proyecto

```text
├── index.html                      # Vista principal y punto de entrada SPA
├── manifest.json                   # Manifiesto PWA
├── package.json                    # Metadata del proyecto y scripts
├── database.json                   # Base de datos JSON de cursos, usuarios y progreso
├── server.py                       # Servidor de sincronización y API REST Python
│
├── css/
│   └── styles.css                  # Hoja de estilos principal (Dark Theme)
│
├── js/
│   ├── app.js                      # Controlador de vistas, navegación y eventos
│   ├── data.js                     # Gestión del estado de la base de datos y sync
│   ├── drag-drop-builder.js        # Constructor de cursos interactivo drag-and-drop
│   ├── certificate.js              # Motor de generación de certificados en PDF
│   ├── hls-player.js               # Manejador del reproductor de video HLS / YouTube
│   └── analytics-charts.js         # Inicializador de gráficos Chart.js
│
├── app/                            # Proyecto nativo Android (código Java y recursos)
│   ├── build.gradle                # Configuración de compilación Android
│   └── src/main/                   # Manifiesto, código Java (MainActivity.java) y assets
│
├── assets/                         # Portadas de cursos y material multimedia
│   ├── images/
│   └── videos/
│
├── ANDROID_STUDIO_GUIDE.md         # Guía detallada de ejecución en Android Studio
└── Guia_Completa_Implementacion_LMS_EdTech.pdf # Documentación técnica oficial
```

---

## 📄 Licencia
Este proyecto está bajo la Licencia MIT.
