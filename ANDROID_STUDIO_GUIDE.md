# Guía de Ejecución e Integración en Android Studio

Esta **Plataforma de Cursos Online y Membresías (EdTech LMS Studio)** está lista para ejecutarse directamente en **Android Studio** mediante dos modalidades sencillas:

---

## Opción A: Proyecto Web / HTML5 directo en Android Studio (Recomendado)

1. **Abrir el proyecto en Android Studio:**
   - Abre **Android Studio**.
   - Selecciona **File > Open** y elige la carpeta del proyecto:
     `Plataforma de Cursos Online y Membresías`
   - Android Studio detectará la estructura web y la configuración `.idea`.

2. **Ejecución Local / Servidor de Desarrollo:**
   - En la terminal de Android Studio, ejecuta:
     ```bash
     python -m http.server 8080
     ```
   - Abre en tu navegador de preferencia o en el explorador integrado de Android Studio:
     `http://localhost:8080/index.html`

---

## Opción B: Convertir en App Nativa Android (WebView Wrapper)

Si deseas empaquetar el LMS como una **Aplicación Nativa para Android (.apk)**:

1. **Crear un nuevo proyecto Android (Empty Activity):**
   - Nombre del paquete: `com.edtech.lms`
   - Lenguaje: **Kotlin** o **Java**

2. **Permisos en `AndroidManifest.xml`:**
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   ```

3. **Configuración de WebView en `MainActivity.kt`:**
   ```kotlin
   package com.edtech.lms

   import android.os.Bundle
   import android.webkit.WebSettings
   import android.webkit.WebView
   import android.webkit.WebViewClient
   import androidx.appcompat.app.AppCompatActivity

   class MainActivity : AppCompatActivity() {
       override fun onCreate(savedInstanceState: Bundle?) {
           super.onCreate(savedInstanceState)
           val webView = WebView(this)
           setContentView(webView)

           val webSettings: WebSettings = webView.settings
           webSettings.javaScriptEnabled = true
           webSettings.domStorageEnabled = true
           webSettings.allowFileAccess = true
           webSettings.mediaPlaybackRequiresUserGesture = false

           webView.webViewClient = WebViewClient()
           // Cargar servidor local o servidor de producción
           webView.loadUrl("http://10.0.2.2:8080/index.html")
       }
   }
   ```
   *(Nota: `10.0.2.2` es la IP especial del emulador de Android para acceder a `localhost` en la máquina anfitriona).*

---

## Resumen de Funcionalidades Incluidas

- **Portal del Estudiante:** Catálogo con filtros por categoría y nivel, aulas virtuales con reproductor adaptativo HLS, marcado automático de progreso por lección, zona de descarga de recursos (PDFs/archivos) y foro de preguntas Q&A por clase.
- **Evaluaciones & Certificados PDF:** Quizzes interactivos de opción múltiple con calificación inmediata y generador de certificados PDF oficiales en alta resolución con firmas y sellos QR.
- **Panel del Instructor / Admin:** Gestor de cursos Drag-and-Drop para módulos y lecciones, dashboard de analíticas (ingresos, tasa de finalización y lecciones con mayor abandono) y control de acceso de estudiantes.
- **Monetización & Membresías:** Venta de cursos individuales, suscripciones mensuales/anuales (SaaS) y sistema de cupones de descuento (ej. `LAUNCH50`).
- **Seguridad de Contenido:** Simulación de URLs firmadas temporales con tokens HMAC y caducidad para prevenir descargas no autorizadas.
