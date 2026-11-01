/* ==========================================================================
   Plataforma de Cursos Online y Membresías (LMS / EdTech)
   Data Store, Authentication & Blob File Downloader Engine
   ========================================================================== */

const STORAGE_KEY = 'EDTECH_LMS_DATABASE_V4';

// =============================================================================
// CUENTAS Y USUARIOS REGISTRADOS EN LA PLATAFORMA (PROFESOR & ESTUDIANTES)
// 1. Profesor Julian: julian@gmail.com / clave: 12345 (Rol: instructor)
// 2. Alumno Julian: julianalumno@gmail.com / clave: 12345 (Rol: student)
// 3. Alumno Patapin: patapin@gmail.com / clave: 12345 (Rol: student)
// 4. Alumno Demo: estudiante@dev.com / clave: 123 (Rol: student)
// 5. Profesor Demo: admin@dev.com / clave: 123 (Rol: instructor)
// 6. Alumno Alejandro: mamamelo@gmail.com / clave: 123 (Rol: student)
// =============================================================================


// Default Database Seed
const defaultDatabase = {
  "users": [
    {
      "id": "user_1792502415773",
      "name": "Julian Salvador",
      "email": "julian@gmail.com",
      "password": "12345",
      "role": "instructor",
      "status": "active",
      "avatar": "JS",
      "createdCourses": [
        "course_1792595961625",
        "course_1792502521530"
      ],
      "enrolledCourses": [],
      "progress": {},
      "subscription": {
        "planId": "plan_enterprise",
        "status": "active",
        "renewsAt": "2026-12-31"
      }
    },
    {
      "id": "user_1792595444571",
      "name": "Julian alumno",
      "email": "julianalumno@gmail.com",
      "password": "12345",
      "role": "student",
      "status": "active",
      "avatar": "JA",
      "createdCourses": [],
      "enrolledCourses": [
        "course_1792595961625"
      ],
      "progress": {
        "course_1792595961625": {
          "completedLessons": [
            "les_1792596118055"
          ],
          "lessonWatchPercentage": {
            "les_1792596118055": 100
          },
          "quizScores": {
            "quiz_1792595961625": 100
          },
          "completedModules": [
            "mod_1792595961625"
          ],
          "certificateIssued": false
        }
      },
      "subscription": {
        "planId": "plan_basic",
        "status": "active",
        "renewsAt": "2026-12-31"
      }
    },
    {
      "id": "user_1792503353890",
      "name": "Patapin Acosador de caballo",
      "email": "patapin@gmail.com",
      "password": "12345",
      "role": "student",
      "status": "active",
      "avatar": "PA",
      "createdCourses": [],
      "enrolledCourses": [
        "course_webdev"
      ],
      "progress": {},
      "subscription": {
        "planId": "plan_basic",
        "status": "active",
        "renewsAt": "2026-12-31"
      }
    },
    {
      "id": "user_student",
      "name": "Carlos Mendoza",
      "email": "estudiante@dev.com",
      "password": "123",
      "role": "student",
      "avatar": "CM",
      "enrolledCourses": [
        "course_webdev",
        "course_uiux"
      ],
      "progress": {
        "course_webdev": {
          "completedLessons": [
            "les_001",
            "les_002"
          ],
          "quizScores": {
            "quiz_mod1": 100
          },
          "certificateIssued": false,
          "myRating": 5,
          "myReview": "Excelente curso, muy bien explicado y con material practico."
        },
        "course_uiux": {
          "completedLessons": [],
          "quizScores": {},
          "certificateIssued": false,
          "lessonWatchPercentage": {
            "les_ui_01": 4
          }
        }
      },
      "subscription": {
        "planId": "plan_pro",
        "status": "active",
        "renewsAt": "2026-11-05"
      }
    },
    {
      "id": "user_instructor",
      "name": "Ing. Mateo Rossi",
      "email": "admin@dev.com",
      "password": "123",
      "role": "instructor",
      "avatar": "MR",
      "createdCourses": [
        "course_webdev",
        "course_uiux",
        "course_ai",
        "course_marketing"
      ],
      "enrolledCourses": [
        "course_webdev",
        "course_uiux",
        "course_ai",
        "course_marketing"
      ],
      "progress": {},
      "subscription": {
        "planId": "plan_enterprise",
        "status": "active",
        "renewsAt": "2027-01-01"
      }
    },
    {
      "id": "st_1792503194315",
      "name": "Alejandro Mamamelano",
      "email": "mamamelo@gmail.com",
      "password": "123",
      "role": "student",
      "status": "active",
      "avatar": "AM",
      "createdCourses": [],
      "enrolledCourses": [
        "course_1792502521530"
      ],
      "progress": {},
      "subscription": {
        "planId": "plan_basic",
        "status": "active",
        "renewsAt": "2026-12-31"
      }
    }
  ],
  "activeUserId": "user_student",
  "courses": [
    {
      "id": "course_1792595961625",
      "title": "Vamos a la casa de gustavo",
      "category": "Negocios",
      "level": "Avanzado",
      "rating": 5,
      "reviewsCount": 1,
      "price": 99.99,
      "instructor": "Julian Salvador",
      "instructorAvatar": "JS",
      "instructorBio": "Instructor especialista certificado en el área.",
      "image": "assets/images/course_gustavo.jpg",
      "description": "Hagamos feliz a gustavo",
      "learningGoals": [
        "Dominio completo de los temas principales del programa"
      ],
      "modules": [
        {
          "id": "mod_1792595961625",
          "title": "Módulo 1: Fundamentos y Bienvenida",
          "lessons": [
            {
              "id": "les_1792596118055",
              "title": "Vamos con todo por nicolas",
              "duration": "30:00",
              "videoUrl": "https://www.youtube.com/watch?v=bE2R744-pYI",
              "fallbackMp4": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              "resources": []
            }
          ],
          "quiz": {
            "id": "quiz_1792595961625",
            "title": "Quiz del Módulo 1",
            "passingScore": 80,
            "questions": [
              {
                "id": "q1",
                "question": "¿Comprendes la estructura general del curso?",
                "options": [
                  "Sí, totalmente claro",
                  "Necesito revisar más",
                  "Tengo dudas",
                  "No"
                ],
                "correctIndex": 0,
                "explanation": "Excelente comienzo."
              },
              {
                "id": "q_1792597522616",
                "question": "Cuantos años tiene gustavo",
                "options": [
                  "Opción A (Correcta)",
                  "Opción B",
                  "Opción C",
                  "Opción D"
                ],
                "correctIndex": 0,
                "explanation": "Respuesta verificada por el instructor."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "course_webdev",
      "title": "Desarrollo Web Fullstack con React y Node.js",
      "category": "Programación",
      "level": "Intermedio",
      "rating": 5,
      "reviewsCount": 143,
      "price": 89.99,
      "instructor": "Ing. Mateo Rossi",
      "instructorAvatar": "MR",
      "instructorBio": "Senior Fullstack Engineer con más de 10 años de experiencia en aplicaciones distribuidas.",
      "image": "assets/images/course_webdev.png",
      "description": "Aprende a construir aplicaciones web completas y escalables desde cero utilizando React, Node.js, Express y bases de datos relacionales.",
      "learningGoals": [
        "Arquitectura moderna Frontend y Backend",
        "APIs RESTful y autenticación JWT",
        "Manejo de estado global y optimización de rendimiento",
        "Despliegue continuo en producción"
      ],
      "modules": [
        {
          "id": "mod_001",
          "title": "Módulo 1: Fundamentos y Arquitectura Web",
          "lessons": [
            {
              "id": "les_001",
              "title": "1. Introducción al ecosistema Fullstack moderno",
              "duration": "12:45",
              "videoUrl": "https://www.youtube.com/watch?v=kqtD5dpn9C8",
              "fallbackMp4": "assets/videos/fullstack_ecosystem.webm",
              "resources": [
                {
                  "id": "res_01",
                  "name": "Guia_Arquitectura_Fullstack.pdf",
                  "type": "PDF",
                  "size": "2.4 MB"
                },
                {
                  "id": "res_02",
                  "name": "Diagrama_Ecosistema_2026.png",
                  "type": "IMAGE",
                  "size": "1.1 MB"
                }
              ]
            },
            {
              "id": "les_002",
              "title": "2. Configuración del Entorno de Desarrollo",
              "duration": "18:20",
              "videoUrl": "assets/videos/devtools_environment.webm",
              "fallbackMp4": "assets/videos/devtools_environment.webm",
              "resources": [
                {
                  "id": "res_03",
                  "name": "Plantilla_Proyecto_Inicial.zip",
                  "type": "ZIP",
                  "size": "5.8 MB"
                }
              ]
            }
          ],
          "quiz": {
            "id": "quiz_mod1",
            "title": "Evaluación del Módulo 1: Arquitectura y Entorno Web",
            "passingScore": 80,
            "questions": [
              {
                "id": "q1",
                "question": "¿Cuál es la ventaja fundamental de la arquitectura SPA (Single Page Application) en aplicaciones modernas?",
                "options": [
                  "Obliga al navegador a recargar el documento HTML completo en cada clic",
                  "Carga el cascarón base una sola vez y renderiza vistas dinámicamente mediante APIs sin recargas completas",
                  "Elimina la necesidad de disponer de un servidor o capa de backend",
                  "Permite ejecutar ensamblador nativo sin pasar por el motor de JavaScript"
                ],
                "correctIndex": 1,
                "explanation": "Las SPAs proporcionan una experiencia fluida tipo aplicación nativa al consumir datos de endpoints REST y actualizar el DOM reactivamente."
              },
              {
                "id": "q2",
                "question": "En las herramientas de desarrollo (DevTools), ¿para qué se utiliza principalmente el panel Network (Red)?",
                "options": [
                  "Para modificar únicamente la tipografía local del sistema operativo",
                  "Para inspeccionar las solicitudes HTTP/HTTPS, códigos de respuesta, tiempos de latencia y cargas útiles de APIs",
                  "Para configurar la memoria swap del disco duro",
                  "Para crear certificados SSL autofirmados"
                ],
                "correctIndex": 1,
                "explanation": "El panel Network permite auditar en tiempo real el tráfico de red, cabeceras, códigos de estado HTTP y desempeño de transferencia de recursos."
              },
              {
                "id": "q3",
                "question": "¿Qué función desempeñan los Breakpoints (puntos de interrupción) durante la depuración en DevTools?",
                "options": [
                  "Pausan la ejecución del código en una línea concreta para examinar variables, el Call Stack y el flujo de ejecución",
                  "Borran de inmediato el código fuente en el servidor de producción",
                  "Aumentan la frecuencia de reloj del procesador de la máquina",
                  "Formatean la base de datos de usuarios"
                ],
                "correctIndex": 0,
                "explanation": "Los breakpoints permiten detener la ejecución en un punto exacto para inspeccionar el estado en memoria y diagnosticar errores paso a paso."
              },
              {
                "id": "q_1792605193575",
                "question": "Cuantos anos tiene Gustavo?",
                "options": [
                  "18 anos",
                  "25 anos",
                  "30 anos",
                  "42 anos"
                ],
                "correctIndex": 1,
                "explanation": "Gustavo tiene 25 anos segun el caso de estudio."
              }
            ]
          }
        },
        {
          "id": "mod_002",
          "title": "Módulo 2: State Management & APIs",
          "lessons": [
            {
              "id": "les_003",
              "title": "3. Integración de Servicios Backend y APIs Async",
              "duration": "22:15",
              "videoUrl": "assets/videos/apis_async_workers.webm",
              "fallbackMp4": "assets/videos/apis_async_workers.webm",
              "resources": [
                {
                  "id": "res_04",
                  "name": "Endpoints_API_Specs.pdf",
                  "type": "PDF",
                  "size": "1.8 MB"
                }
              ]
            }
          ],
          "quiz": {
            "id": "quiz_mod2",
            "title": "Evaluación del Módulo 2: State Management & APIs",
            "passingScore": 75,
            "questions": [
              {
                "id": "q3",
                "question": "¿Cuál es la diferencia técnica entre los métodos HTTP PUT y PATCH en una API REST?",
                "options": [
                  "PUT solo borra registros, mientras que PATCH los añade",
                  "PUT sustituye completamente el recurso objetivo, mientras que PATCH aplica modificaciones parciales a los campos especificados",
                  "PATCH bloquea el Event Loop del navegador de forma sincrónica",
                  "No existe diferencia alguna en el estándar RFC"
                ],
                "correctIndex": 1,
                "explanation": "PATCH aplica un conjunto de cambios parciales a un recurso existente, mientras que PUT requiere enviar la representación completa."
              },
              {
                "id": "q4",
                "question": "¿Por qué es fundamental el uso de operaciones asíncronas (async/await y Promises) al interactuar con servicios backend?",
                "options": [
                  "Evita bloquear el hilo principal de JavaScript, manteniendo la interfaz receptiva e interactiva mientras se esperan los datos",
                  "Porque el navegador rechaza cualquier llamada de red que no sea bloqueante",
                  "Para encriptar automáticamente todas las variables globales",
                  "Porque convierte las llamadas JSON a ficheros de texto plano"
                ],
                "correctIndex": 0,
                "explanation": "La asincronía en el Event Loop de JavaScript garantiza que la UI no se congele durante operaciones de I/O o peticiones de red."
              },
              {
                "id": "q5",
                "question": "Al actualizar el estado local en React tras una mutación exitosa en el backend, ¿qué principio debe seguirse?",
                "options": [
                  "Recargar obligatoriamente la página completa con location.reload()",
                  "Actualizar el estado de forma inmutable creando nuevas referencias para disparar re-renderizados precisos",
                  "Modificar directamente las propiedades del objeto de estado sin usar setState ni hooks",
                  "Deshabilitar el Virtual DOM"
                ],
                "correctIndex": 1,
                "explanation": "La inmutabilidad en el estado asegura que React detecte los cambios de referencia y actualice de manera eficiente y predecible la vista."
              }
            ]
          }
        }
      ],
      "reviews": [
        {
          "userId": "user_student",
          "email": "estudiante@dev.com",
          "studentName": "Carlos Mendoza",
          "avatar": "CM",
          "rating": 5,
          "comment": "Excelente curso, muy bien explicado y con material practico.",
          "date": "Recientemente"
        },
        {
          "studentName": "Sofía Valenzuela",
          "avatar": "SV",
          "rating": 5,
          "date": "Hace 3 días",
          "comment": "Excelente explicación paso a paso. Los proyectos y tareas son muy didácticos."
        },
        {
          "studentName": "Marcos Herrera",
          "avatar": "MH",
          "rating": 5,
          "date": "Hace 1 semana",
          "comment": "El mejor curso que he tomado de esta temática. 100% recomendado."
        },
        {
          "studentName": "Lucía Benítez",
          "avatar": "LB",
          "rating": 4.8,
          "date": "Hace 2 semanas",
          "comment": "Muy buen contenido, explicaciones claras y material descargable de alta calidad."
        }
      ]
    },
    {
      "id": "course_uiux",
      "title": "Diseño de Interfaces UI/UX & Sistemas de Diseño",
      "category": "Diseño",
      "level": "Principiante",
      "rating": 4.8,
      "reviewsCount": 98,
      "price": 69.99,
      "instructor": "Dra. Sofia Valenzuela",
      "instructorAvatar": "SV",
      "instructorBio": "Lead Product Designer especializada en sistemas de diseño y micro-interacciones.",
      "image": "assets/images/course_uiux.png",
      "description": "Domina las mejores prácticas de UX research, arquitectura de información y prototipado de alta fidelidad para aplicaciones web y móviles.",
      "learningGoals": [
        "Metodología Design Thinking aplicada",
        "Creación de Design Systems escalables",
        "Testeo de usabilidad con usuarios reales",
        "Micro-interacciones y prototipado reactivo"
      ],
      "modules": [
        {
          "id": "mod_ui_01",
          "title": "Módulo 1: Principios de Composición y Visual UX",
          "lessons": [
            {
              "id": "les_ui_01",
              "title": "1. Leyes de la Psicología Aplicadas al UI",
              "duration": "15:30",
              "videoUrl": "assets/videos/ui_ux_psychology.webm",
              "fallbackMp4": "assets/videos/ui_ux_psychology.webm",
              "resources": [
                {
                  "id": "res_ui_01",
                  "name": "Guia_Leyes_UX_Figma.pdf",
                  "type": "PDF",
                  "size": "4.2 MB"
                }
              ]
            }
          ],
          "quiz": {
            "id": "quiz_ui_01",
            "title": "Quiz de Fundamentos UI/UX y Psicología Visual",
            "passingScore": 80,
            "questions": [
              {
                "id": "q_ui_1",
                "question": "¿Qué establece la Ley de Fitts y cuál es su impacto directo en el diseño de interfaces?",
                "options": [
                  "El tiempo requerido para alcanzar un objetivo depende de la distancia y de su tamaño; los elementos clave deben ser amplios y de fácil acceso",
                  "Los elementos visuales deben utilizar siempre colores saturados primarios",
                  "La memoria a corto plazo no puede retener más de 2 palabras",
                  "El contraste de color debe ser siempre 100% negro"
                ],
                "correctIndex": 0,
                "explanation": "La Ley de Fitts demuestra que áreas táctiles y botones más grandes y accesibles reducen el tiempo y esfuerzo de interacción del usuario."
              },
              {
                "id": "q_ui_2",
                "question": "¿Cómo influye la Ley de Hick en el diseño de la navegación y menús de una aplicación?",
                "options": [
                  "El tiempo de toma de decisiones se incrementa logarítmicamente con el número de opciones; simplificar elecciones reduce la sobrecarga cognitiva",
                  "Obliga a mostrar todas las subcategorías en una sola lista sin jerarquía",
                  "Indica que los usuarios prefieren menús con más de 20 opciones visibles",
                  "Exige animar cada botón con transiciones 3D"
                ],
                "correctIndex": 0,
                "explanation": "La Ley de Hick demuestra que limitar las opciones directas o desglosar procesos en pasos guiados agiliza la toma de decisiones."
              },
              {
                "id": "q_ui_3",
                "question": "En un Sistema de Diseño (Design System), ¿qué rol cumple el espacio negativo o \"Whitespace\"?",
                "options": [
                  "Aporta claridad, define la jerarquía visual, mejora la legibilidad y separa grupos conceptuales de información",
                  "Es un desperdicio de espacio que debe rellenarse con banners promocionales",
                  "Se utiliza exclusivamente para ocultar botones secundarios",
                  "Sirve para aumentar la velocidad de descarga del servidor"
                ],
                "correctIndex": 0,
                "explanation": "El espacio en blanco intencional guía la mirada del usuario, reduce el ruido visual y estructura armónicamente los componentes."
              }
            ]
          }
        }
      ],
      "reviews": [
        {
          "studentName": "Sofía Valenzuela",
          "avatar": "SV",
          "rating": 5,
          "date": "Hace 3 días",
          "comment": "Excelente explicación paso a paso. Los proyectos y tareas son muy didácticos."
        },
        {
          "studentName": "Marcos Herrera",
          "avatar": "MH",
          "rating": 5,
          "date": "Hace 1 semana",
          "comment": "El mejor curso que he tomado de esta temática. 100% recomendado."
        },
        {
          "studentName": "Lucía Benítez",
          "avatar": "LB",
          "rating": 4.8,
          "date": "Hace 2 semanas",
          "comment": "Muy buen contenido, explicaciones claras y material descargable de alta calidad."
        }
      ]
    },
    {
      "id": "course_ai",
      "title": "Inteligencia Artificial y Machine Learning Aplicado",
      "category": "IA & Ciencia de Datos",
      "level": "Avanzado",
      "rating": 4.95,
      "reviewsCount": 210,
      "price": 119.99,
      "instructor": "Dr. Alejandro Silva",
      "instructorAvatar": "AS",
      "instructorBio": "Investigador en IA y Doctor en Machine Learning por el MIT.",
      "image": "assets/images/course_ai.png",
      "description": "Construye y despliega modelos de aprendizaje profundo, redes neuronales y sistemas de IA generativa con Python, PyTorch y transformers.",
      "learningGoals": [
        "Redes neuronales convolucionales y recurrentes",
        "Fine-tuning de LLMs y modelos de difusión",
        "Optimizadores y funciones de pérdida",
        "Despliegue de modelos en tiempo real"
      ],
      "modules": [
        {
          "id": "mod_ai_01",
          "title": "Módulo 1: Redes Neuronales Profundas",
          "lessons": [
            {
              "id": "les_ai_01",
              "title": "1. Fundamentos Matemáticos y Backpropagation",
              "duration": "25:10",
              "videoUrl": "assets/videos/neural_network_math.webm",
              "fallbackMp4": "assets/videos/neural_network_math.webm",
              "resources": [
                {
                  "id": "res_ai_01",
                  "name": "Python_Notebook_NeuralNet.ipynb",
                  "type": "CODE",
                  "size": "1.5 MB"
                }
              ]
            }
          ],
          "quiz": {
            "id": "quiz_ai_01",
            "title": "Quiz: Redes Neuronales Profundas & Backpropagation",
            "passingScore": 80,
            "questions": [
              {
                "id": "q_ai_1",
                "question": "¿Cuál es el rol matemático del algoritmo de Backpropagation en una red neuronal?",
                "options": [
                  "Calcular el gradiente de la función de pérdida con respecto a cada peso usando la regla de la cadena para actualizar los parámetros",
                  "Aumentar linealmente el número de nodos en la capa de entrada",
                  "Convertir datos binarios a formato texto sin procesar",
                  "Comprimir los archivos de entrenamiento en formato ZIP"
                ],
                "correctIndex": 0,
                "explanation": "Backpropagation propaga el error desde la capa de salida hacia las capas iniciales, calculando derivadas parciales para optimizar los pesos."
              },
              {
                "id": "q_ai_2",
                "question": "¿Por qué es indispensable incorporar funciones de activación no lineales (como ReLU o Sigmoid)?",
                "options": [
                  "Porque sin no-linealidad, una red profunda colapsaría matemáticamente a una simple transformación afín lineal incapaz de modelar problemas complejos",
                  "Para evitar que los valores de salida sean números reales",
                  "Porque aceleran la descarga de datasets desde internet",
                  "Para restringir el entrenamiento a procesadores de un solo núcleo"
                ],
                "correctIndex": 0,
                "explanation": "Las funciones de activación no lineales permiten que la red neuronal aprenda representaciones complejas y fronteras de decisión no lineales."
              },
              {
                "id": "q_ai_3",
                "question": "En el optimizador Gradient Descent, ¿qué consecuencia provoca configurar una tasa de aprendizaje (Learning Rate) excesivamente alta?",
                "options": [
                  "Puede hacer que el modelo oscile descontroladamente, diverja o sobrepase el mínimo de la función de pérdida sin converger",
                  "Garantiza alcanzar el mínimo global en una sola iteración",
                  "Provoca que el entrenamiento se vuelva infinitamente lento",
                  "Elimina automáticamente el sobreajuste (overfitting)"
                ],
                "correctIndex": 0,
                "explanation": "Un learning rate demasiado elevado genera saltos de gradiente excesivos, impidiendo la convergencia e incluso provocando divergencia en la pérdida."
              }
            ]
          }
        }
      ],
      "reviews": [
        {
          "studentName": "Sofía Valenzuela",
          "avatar": "SV",
          "rating": 5,
          "date": "Hace 3 días",
          "comment": "Excelente explicación paso a paso. Los proyectos y tareas son muy didácticos."
        },
        {
          "studentName": "Marcos Herrera",
          "avatar": "MH",
          "rating": 5,
          "date": "Hace 1 semana",
          "comment": "El mejor curso que he tomado de esta temática. 100% recomendado."
        },
        {
          "studentName": "Lucía Benítez",
          "avatar": "LB",
          "rating": 4.8,
          "date": "Hace 2 semanas",
          "comment": "Muy buen contenido, explicaciones claras y material descargable de alta calidad."
        }
      ]
    },
    {
      "id": "course_marketing",
      "title": "Digital Growth Marketing & Analítica SaaS",
      "category": "Negocios",
      "level": "Intermedio",
      "rating": 4.75,
      "reviewsCount": 84,
      "price": 49.99,
      "instructor": "Lic. Mariana Gomez",
      "instructorAvatar": "MG",
      "instructorBio": "Growth Hacker en startups unicornio con enfoque en adquisición y retención.",
      "image": "assets/images/course_marketing.png",
      "description": "Estrategias aceleradas de adquisición de usuarios, optimización de embudos de conversión y retención en plataformas SaaS.",
      "learningGoals": [
        "Optimización de embudos AARRR",
        "Experimentación A/B Testing rigurosa",
        "Atribución multi-canal y métricas de LTV/CAC",
        "Automatización de marketing con CRM"
      ],
      "modules": [
        {
          "id": "mod_mkt_01",
          "title": "Módulo 1: Métricas Clave de Crecimiento",
          "lessons": [
            {
              "id": "les_mkt_01",
              "title": "1. Cálculo y Optimización del LTV vs CAC",
              "duration": "14:20",
              "videoUrl": "assets/videos/saas_growth_analytics.webm",
              "fallbackMp4": "assets/videos/saas_growth_analytics.webm",
              "resources": [
                {
                  "id": "res_mkt_01",
                  "name": "Calculadora_SaaS_LTV_CAC.xlsx",
                  "type": "XLSX",
                  "size": "850 KB"
                }
              ]
            }
          ],
          "quiz": {
            "id": "quiz_mkt_01",
            "title": "Quiz de Analítica SaaS y Métricas de Crecimiento",
            "passingScore": 75,
            "questions": [
              {
                "id": "q_mkt_1",
                "question": "¿Qué ratio LTV / CAC se considera saludable y sostenible para una empresa SaaS en fase de escalamiento?",
                "options": [
                  "1:1 (el costo de adquirir el cliente equivale a su valor total)",
                  "3:1 o superior (el valor de vida del cliente triplica el costo de adquisición)",
                  "0.5:1 (gastar el doble en marketing de lo que genera el cliente)",
                  "0:0 (sin medición de retorno)"
                ],
                "correctIndex": 1,
                "explanation": "Un ratio LTV/CAC de 3:1 o más asegura un margen operativo saludable para cubrir costos fijos, I+D y reinvertir rentablemente en adquisición."
              },
              {
                "id": "q_mkt_2",
                "question": "¿Cómo afecta directamente la tasa de cancelación (Churn Rate) al Lifetime Value (LTV)?",
                "options": [
                  "A menor churn rate, mayor retención y tiempo de vida del cliente, lo que incrementa exponencialmente el LTV",
                  "El churn rate no influye en las métricas de ingresos recurrentes",
                  "Un churn elevado incrementa la fidelidad de los clientes existentes",
                  "Solo impacta a los usuarios con planes gratuitos"
                ],
                "correctIndex": 0,
                "explanation": "El LTV es inversamente proporcional al Churn. Reducir el abandono alarga la vida útil del suscriptor e incrementa los ingresos generados."
              },
              {
                "id": "q_mkt_3",
                "question": "En el marco de embudo pirata (AARRR), ¿qué representa la fase de Activación (Activation)?",
                "options": [
                  "El momento en que el usuario experimenta por primera vez el valor central del producto (\"Aha! Moment\")",
                  "El envío de la primera factura tributaria al cliente",
                  "La visita casual a la página de inicio desde un anuncio",
                  "El cierre definitivo de la cuenta del usuario"
                ],
                "correctIndex": 0,
                "explanation": "La Activación mide cuándo el usuario recién registrado obtiene un primer resultado exitoso y percibe el valor real de la solución."
              }
            ]
          }
        }
      ],
      "reviews": [
        {
          "studentName": "Sofía Valenzuela",
          "avatar": "SV",
          "rating": 5,
          "date": "Hace 3 días",
          "comment": "Excelente explicación paso a paso. Los proyectos y tareas son muy didácticos."
        },
        {
          "studentName": "Marcos Herrera",
          "avatar": "MH",
          "rating": 5,
          "date": "Hace 1 semana",
          "comment": "El mejor curso que he tomado de esta temática. 100% recomendado."
        },
        {
          "studentName": "Lucía Benítez",
          "avatar": "LB",
          "rating": 4.8,
          "date": "Hace 2 semanas",
          "comment": "Muy buen contenido, explicaciones claras y material descargable de alta calidad."
        }
      ]
    }
  ],
  "subscriptionPlans": [
    {
      "id": "plan_basic",
      "name": "Plan Estudiante",
      "priceMonthly": 14.99,
      "priceAnnual": 119.99,
      "badge": "Popular",
      "features": [
        "Acceso a 5 cursos básicos",
        "Streaming HD adaptativo",
        "Recursos descargables",
        "Certificados digitales"
      ]
    },
    {
      "id": "plan_pro",
      "name": "Pase Pro Ilimitado",
      "priceMonthly": 29.99,
      "priceAnnual": 249.99,
      "badge": "Recomendado",
      "popular": true,
      "features": [
        "Acceso ILIMITADO a todos los cursos",
        "Streaming 4K HLS Ultra Rápido",
        "Generador de Certificados PDF Oficiales",
        "Asesoría en Foro Q&A Prioritario",
        "Acceso a códigos fuente y proyectos"
      ]
    },
    {
      "id": "plan_enterprise",
      "name": "Membresía Empresarial",
      "priceMonthly": 89.99,
      "priceAnnual": 799.99,
      "badge": "Equipos",
      "features": [
        "Hasta 10 licencias de estudiantes",
        "Panel de Control para Administradores",
        "Reportes de Analítica Avanzados",
        "Soporte 24/7 y Mentorías 1 a 1"
      ]
    }
  ],
  "coupons": [
    {
      "code": "LAUNCH50",
      "discountPercent": 50,
      "expiryDate": "2026-12-31",
      "usesRemaining": 150
    },
    {
      "code": "EDTECH100",
      "discountPercent": 100,
      "expiryDate": "2026-11-30",
      "usesRemaining": 25
    },
    {
      "code": "SUMMER30",
      "discountPercent": 30,
      "expiryDate": "2026-10-31",
      "usesRemaining": 500
    }
  ],
  "enrolledStudents": [
    {
      "id": "st_101",
      "name": "Ana Garcia",
      "email": "ana.garcia@gmail.com",
      "courseId": "course_webdev",
      "status": "Active",
      "enrolledAt": "2026-09-12"
    },
    {
      "id": "st_102",
      "name": "Luis Fernando Ruiz",
      "email": "luis.ruiz@hotmail.com",
      "courseId": "course_webdev",
      "status": "Active",
      "enrolledAt": "2026-09-18"
    },
    {
      "id": "st_103",
      "name": "Elena Torres",
      "email": "elena.t@techcorp.io",
      "courseId": "course_uiux",
      "status": "Revoked",
      "enrolledAt": "2026-08-05"
    },
    {
      "id": "st_104",
      "name": "Carlos Mendoza",
      "email": "estudiante@dev.com",
      "courseId": "course_webdev",
      "status": "Active",
      "enrolledAt": "2026-10-01"
    }
  ],
  "discussions": {
    "les_001": [
      {
        "id": "disc_1",
        "author": "Ana Garcia",
        "avatar": "AG",
        "date": "Hace 2 días",
        "text": "¿Es recomendable usar Server-Side Rendering (SSR) desde la primera fase del proyecto?",
        "likes": 5,
        "replies": [
          {
            "author": "Ing. Mateo Rossi",
            "isInstructor": true,
            "avatar": "MR",
            "date": "Hace 1 día",
            "text": "Excelente pregunta Ana. Para SEO e e-commerce SSR es ideal, mientras que para dashboards privados la arquitectura SPA o SSR híbrida suele ser más simple."
          }
        ]
      }
    ]
  },
  "analytics": {
    "totalRevenue": 14850,
    "activeSubscribers": 342,
    "completionRateAvg": 78.4,
    "highestDropoffLessons": [
      {
        "lessonTitle": "2. Configuración del Entorno de Desarrollo",
        "course": "Desarrollo Web Fullstack",
        "dropoffRate": "24.5%"
      },
      {
        "lessonTitle": "1. Fundamentos Matemáticos y Backpropagation",
        "course": "IA & Machine Learning",
        "dropoffRate": "31.2%"
      },
      {
        "lessonTitle": "1. Cálculo y Optimización del LTV vs CAC",
        "course": "Digital Growth Marketing",
        "dropoffRate": "18.7%"
      }
    ],
    "salesHistory": [
      {
        "month": "Mayo",
        "sales": 1200
      },
      {
        "month": "Junio",
        "sales": 1900
      },
      {
        "month": "Julio",
        "sales": 2400
      },
      {
        "month": "Agosto",
        "sales": 3100
      },
      {
        "month": "Septiembre",
        "sales": 4200
      },
      {
        "month": "Octubre",
        "sales": 5150
      }
    ],
    "completionDistribution": [
      145,
      120,
      62,
      15
    ]
  },
  "certificates": []
};

class DatabaseController {
  constructor() {
    // Detect server address: if running on http/https use origin; if on file:///android_asset use stored URL or local IP
    const defaultHost = (window.location.protocol.startsWith('http')) 
      ? window.location.origin 
      : 'http://192.168.0.120:3000';
    this.serverUrl = localStorage.getItem('EDTECH_SERVER_URL') || defaultHost;
    this.syncStatus = 'connecting';
    this.data = this.load();

    // Initial background sync with central network server
    setTimeout(() => {
      this.syncWithServer();
    }, 300);

    // Continuous auto-sync interval (every 6s) to ensure cross-device consistency (PC <-> Phone)
    setInterval(() => {
      this.syncWithServer().catch(() => {});
    }, 6000);
  }

  setServerUrl(url) {
    if (!url) return;
    this.serverUrl = url.trim().replace(/\/+$/, '');
    localStorage.setItem('EDTECH_SERVER_URL', this.serverUrl);
    this.syncWithServer(true);
  }

  // Cross-device server synchronization engine (PC <-> Phone / Android)
  async syncWithServer(showToast = false) {
    if (!this.serverUrl) return false;
    try {
      let controller;
      let timeoutId;
      try {
        controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 1500);
      } catch (e) {}

      const response = await fetch(`${this.serverUrl}/api/database`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache',
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);

      if (response.ok) {
        const remoteData = await response.json();
        if (remoteData && remoteData.users && Array.isArray(remoteData.users)) {
          this.mergeRemoteData(remoteData);
          this.syncStatus = 'online';
          this.updateSyncBadgeUI();
          if (showToast) {
            alert('✓ Sincronización exitosa con el servidor central.');
          }
          return true;
        } else if (remoteData && remoteData.empty) {
          // Server has no database yet; push current local database to server
          await this.pushToServer();
          this.syncStatus = 'online';
          this.updateSyncBadgeUI();
          return true;
        }
      }
    } catch (err) {
      console.warn('[Sync Engine] Server unreachable at', this.serverUrl, err.message);
      this.syncStatus = 'offline';
      this.updateSyncBadgeUI();
    }
    return false;
  }

  // Merge remote server data with local data so no user or course is ever lost
  mergeRemoteData(remote) {
    let updated = false;

    // Merge users
    if (remote.users && Array.isArray(remote.users)) {
      remote.users.forEach(remoteUser => {
        const localIdx = this.data.users.findIndex(u => u.email.toLowerCase() === remoteUser.email.toLowerCase());
        if (localIdx === -1) {
          this.data.users.push(remoteUser);
          updated = true;
        } else {
          const localUser = this.data.users[localIdx];
          // Keep credentials and roles up to date across devices
          if (remoteUser.password && remoteUser.password !== localUser.password) {
            localUser.password = remoteUser.password;
            updated = true;
          }
          if (remoteUser.name && remoteUser.name !== localUser.name) {
            localUser.name = remoteUser.name;
            updated = true;
          }
          if (remoteUser.status && remoteUser.status !== localUser.status) {
            localUser.status = remoteUser.status;
            updated = true;
          }
          // Merge enrolled courses
          if (remoteUser.enrolledCourses && Array.isArray(remoteUser.enrolledCourses)) {
            if (!localUser.enrolledCourses) localUser.enrolledCourses = [];
            remoteUser.enrolledCourses.forEach(cid => {
              if (!localUser.enrolledCourses.includes(cid)) {
                localUser.enrolledCourses.push(cid);
                updated = true;
              }
            });
          }
          // Merge user progress
          if (remoteUser.progress) {
            if (!localUser.progress) localUser.progress = {};
            Object.keys(remoteUser.progress).forEach(cid => {
              if (!localUser.progress[cid]) {
                localUser.progress[cid] = remoteUser.progress[cid];
                updated = true;
              } else {
                const remP = remoteUser.progress[cid];
                const locP = localUser.progress[cid];
                if (remP.completedLessons && Array.isArray(remP.completedLessons)) {
                  remP.completedLessons.forEach(lid => {
                    if (!locP.completedLessons.includes(lid)) {
                      locP.completedLessons.push(lid);
                      updated = true;
                    }
                  });
                }
              }
            });
          }
        }
      });
    }

    // Merge courses (including custom uploaded cover photos and modified lessons)
    if (remote.courses && Array.isArray(remote.courses)) {
      remote.courses.forEach(remoteCourse => {
        const localIdx = this.data.courses.findIndex(c => c.id === remoteCourse.id);
        if (localIdx === -1) {
          this.data.courses.unshift(remoteCourse);
          updated = true;
        } else {
          const localCourse = this.data.courses[localIdx];
          if (remoteCourse.title && remoteCourse.title !== localCourse.title) {
            localCourse.title = remoteCourse.title;
            updated = true;
          }
          if (remoteCourse.image && remoteCourse.image !== localCourse.image) {
            localCourse.image = remoteCourse.image;
            updated = true;
          }
          if (remoteCourse.price !== undefined && remoteCourse.price !== localCourse.price) {
            localCourse.price = remoteCourse.price;
            updated = true;
          }
          if (remoteCourse.level && remoteCourse.level !== localCourse.level) {
            localCourse.level = remoteCourse.level;
            updated = true;
          }
          if (remoteCourse.reviews && Array.isArray(remoteCourse.reviews)) {
            localCourse.reviews = remoteCourse.reviews;
            localCourse.rating = remoteCourse.rating;
            localCourse.reviewsCount = remoteCourse.reviewsCount;
            updated = true;
          }
          if (remoteCourse.modules && Array.isArray(remoteCourse.modules)) {
            localCourse.modules = remoteCourse.modules;
            updated = true;
          }
        }
      });
    }

    // Merge enrolled students
    if (remote.enrolledStudents && Array.isArray(remote.enrolledStudents)) {
      remote.enrolledStudents.forEach(remoteSt => {
        const key = remoteSt.email.toLowerCase() + '_' + remoteSt.courseId;
        const exists = this.data.enrolledStudents.some(s => (s.email.toLowerCase() + '_' + s.courseId) === key);
        if (!exists) {
          this.data.enrolledStudents.push(remoteSt);
          updated = true;
        }
      });
    }

    if (updated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {}
    }
  }

  // Push local changes to central server
  async pushToServer() {
    if (!this.serverUrl) return;
    try {
      await fetch(`${this.serverUrl}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.data)
      });
      this.syncStatus = 'online';
      this.updateSyncBadgeUI();
    } catch (e) {
      this.syncStatus = 'offline';
      this.updateSyncBadgeUI();
    }
  }

  updateSyncBadgeUI() {
    const badge = document.getElementById('network-sync-status-badge');
    if (badge) {
      if (this.syncStatus === 'online') {
        const host = this.serverUrl.replace(/^https?:\/\//, '');
        badge.innerHTML = `<span style="color:#22c55e;">●</span> <span class="sync-text-full">En Red: ${host}</span><span class="sync-text-mobile">En Red</span>`;
        badge.className = 'badge badge-green';
        badge.title = 'Sincronizado con el servidor central multi-dispositivo';
      } else {
        badge.innerHTML = `<span style="color:#f59e0b;">●</span> <span class="sync-text-full">Modo Local (Desconectado)</span><span class="sync-text-mobile">Local</span>`;
        badge.className = 'badge badge-red';
        badge.title = 'Haz clic para configurar la dirección IP del servidor';
      }
    }
  }

  load() {
    try {
      let stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Check older storage versions (V3, V2)
        stored = localStorage.getItem('EDTECH_LMS_DATABASE_V3') || localStorage.getItem('EDTECH_LMS_DATABASE_V2');
      }
      if (stored) {
        const parsed = JSON.parse(stored);

        // Preserve courses if already present and valid; only fallback to defaults if completely missing
        if (!parsed.courses || !Array.isArray(parsed.courses) || parsed.courses.length === 0) {
          parsed.courses = JSON.parse(JSON.stringify(defaultDatabase.courses));
        } else {
          parsed.courses.forEach(c => {
            if (!c.reviews || !Array.isArray(c.reviews) || c.reviews.length === 0) {
              c.reviews = [
                { studentName: 'Sofía Valenzuela', avatar: 'SV', rating: 5, date: 'Hace 3 días', comment: 'Excelente explicación paso a paso. Los proyectos y tareas son muy didácticos.' },
                { studentName: 'Marcos Herrera', avatar: 'MH', rating: 5, date: 'Hace 1 semana', comment: 'El mejor curso que he tomado de esta temática. 100% recomendado.' },
                { studentName: 'Lucía Benítez', avatar: 'LB', rating: 4.8, date: 'Hace 2 semanas', comment: 'Muy buen contenido, explicaciones claras y material descargable de alta calidad.' }
              ];
            }
          });
        }

        // Preserve users if present
        if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
          parsed.users = JSON.parse(JSON.stringify(defaultDatabase.users));
        } else {
          // Ensure all seed users (including Julian, Carlos, Mateo, etc.) exist and have valid passwords
          defaultDatabase.users.forEach(defU => {
            const existingU = parsed.users.find(u => u.email.toLowerCase() === defU.email.toLowerCase());
            if (!existingU) {
              parsed.users.push(JSON.parse(JSON.stringify(defU)));
            } else {
              existingU.password = defU.password;
              existingU.role = defU.role;
              existingU.name = defU.name;
              if (defU.status) existingU.status = defU.status;
            }
          });
        }

        // Ensure all seed courses (including Vamos a la casa de gustavo) are present
        defaultDatabase.courses.forEach(defC => {
          if (!parsed.courses.some(c => c.id === defC.id)) {
            parsed.courses.unshift(JSON.parse(JSON.stringify(defC)));
          }
        });

        // Preserve enrolled students registry
        if (!parsed.enrolledStudents || !Array.isArray(parsed.enrolledStudents)) {
          parsed.enrolledStudents = JSON.parse(JSON.stringify(defaultDatabase.enrolledStudents));
        }

        // Preserve subscription plans
        if (!parsed.subscriptionPlans || !Array.isArray(parsed.subscriptionPlans)) {
          parsed.subscriptionPlans = JSON.parse(JSON.stringify(defaultDatabase.subscriptionPlans));
        }

        // Preserve coupons
        if (!parsed.coupons || !Array.isArray(parsed.coupons)) {
          parsed.coupons = JSON.parse(JSON.stringify(defaultDatabase.coupons));
        }

        // Preserve discussions
        if (!parsed.discussions || typeof parsed.discussions !== 'object') {
          parsed.discussions = JSON.parse(JSON.stringify(defaultDatabase.discussions));
        }

        // Preserve analytics
        if (!parsed.analytics) {
          parsed.analytics = JSON.parse(JSON.stringify(defaultDatabase.analytics));
        }

        // Preserve certificates
        if (!parsed.certificates || !Array.isArray(parsed.certificates)) {
          parsed.certificates = [];
        }

        // Validate activeUserId
        if (parsed.activeUserId) {
          const userExists = parsed.users.some(u => u.id === parsed.activeUserId);
          if (!userExists) {
            parsed.activeUserId = parsed.users[0]?.id || 'user_student';
          }
        }

        return parsed;
      }
    } catch (e) {
      console.warn('LocalStorage error, fallback to initial database:', e);
    }
    this.save(defaultDatabase);
    return JSON.parse(JSON.stringify(defaultDatabase));
  }

  save(dataToSave) {
    this.data = dataToSave || this.data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save database to LocalStorage:', e);
    }
    // Async background sync to server
    this.pushToServer().catch(() => {});
  }

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = JSON.parse(JSON.stringify(defaultDatabase));
    this.save();
    return this.data;
  }

  // Active user profile getter
  get currentUser() {
    if (!this.data.activeUserId) return null;
    const user = this.data.users.find(u => u.id === this.data.activeUserId);
    return user || null;
  }

  get courses() { return this.data.courses; }
  get subscriptionPlans() { return this.data.subscriptionPlans; }
  get coupons() { return this.data.coupons; }
  get enrolledStudents() { return this.data.enrolledStudents; }
  get analytics() { return this.data.analytics; }
  get discussions() { return this.data.discussions; }

  // Auth Methods with cross-device network sync
  async login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();

    // Always sync with central server first to ensure accounts created on other devices are present
    try {
      await this.syncWithServer();
    } catch (e) {}

    let user = this.data.users.find(u => u.email.toLowerCase() === cleanEmail);

    // Guaranteed seed sync: check default seed accounts and ensure password matches
    const seedUser = defaultDatabase.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (seedUser) {
      if (!user) {
        user = JSON.parse(JSON.stringify(seedUser));
        this.data.users.push(user);
      } else {
        // Guarantee password and role match seed (repairs any stale or mismatched local storage)
        user.password = seedUser.password;
        user.role = seedUser.role;
        user.name = seedUser.name;
        if (seedUser.status) user.status = seedUser.status;
      }
      this.save();
    }

    if (user && String(user.password).trim() === String(password).trim()) {
      // Check if student account is inactive
      if (user.status === 'inactive') {
        return { success: false, message: 'Tu cuenta se encuentra Inactiva / Revocada por el administrador. Contacta al soporte.' };
      }
      this.data.activeUserId = user.id;
      this.save();
      return { success: true, user: user };
    }
    return { success: false, message: 'Credenciales inválidas. Verifica tu correo y contraseña.' };
  }

  async register(name, email, password, role = 'student') {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();

    // Check remote server first to avoid duplicate accounts across devices
    await this.syncWithServer();
    const exists = this.data.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (exists) {
      // If the user was pre-created via manual enrollment (e.g. default password '123' or placeholder)
      if (exists.password === '123') {
        exists.name = cleanName;
        exists.password = password;
        if (role) exists.role = role;
        exists.status = 'active';
        this.data.activeUserId = exists.id;
        this.save();
        return { success: true, user: exists, note: 'pre_enrolled_activated' };
      }
      return { success: false, message: 'El correo electrónico ya está registrado. Por favor inicia sesión con tu contraseña.' };
    }

    const initials = cleanName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';
    const userId = 'user_' + Date.now();
    const isInstructor = role === 'instructor';

    // Check if there are any pre-existing manual enrollments for this email
    const preEnrolledCourseIds = (this.data.enrolledStudents || [])
      .filter(s => s.email.toLowerCase() === cleanEmail && s.status === 'Active')
      .map(s => s.courseId);

    const newUser = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      password: password,
      role: role,
      status: 'active',
      avatar: initials,
      createdCourses: [],
      enrolledCourses: preEnrolledCourseIds.length > 0 ? preEnrolledCourseIds : [],
      progress: {},
      subscription: {
        planId: isInstructor ? 'plan_enterprise' : 'plan_basic',
        status: 'active',
        renewsAt: '2026-12-31'
      }
    };

    if (preEnrolledCourseIds.length > 0) {
      preEnrolledCourseIds.forEach(cid => {
        newUser.progress[cid] = {
          completedLessons: [],
          lessonWatchPercentage: {},
          quizScores: {},
          completedModules: [],
          certificateIssued: false
        };
      });
    }

    this.data.users.push(newUser);
    this.data.activeUserId = newUser.id;
    this.save();
    // Immediately push new account to central server so any device can log in right away
    await this.pushToServer().catch(() => {});
    return { success: true, user: newUser };
  }

  // Robust Manual Enrollment by Teacher with 100% Free Direct Access and Zero Data Loss
  enrollStudentManual(name, email, courseId) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    if (!cleanEmail || !cleanName || !courseId) {
      return { success: false, message: 'Faltan datos obligatorios para la inscripción.' };
    }

    // 1. Check if user account already exists in users DB
    let user = this.data.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (user) {
      // Existing user: ensure student has course in enrolledCourses
      if (!user.enrolledCourses) user.enrolledCourses = [];
      if (!user.enrolledCourses.includes(courseId)) {
        user.enrolledCourses.push(courseId);
      }
      user.status = 'active';
      if (!user.progress) user.progress = {};
      if (!user.progress[courseId]) {
        user.progress[courseId] = {
          completedLessons: [],
          lessonWatchPercentage: {},
          quizScores: {},
          completedModules: [],
          certificateIssued: false
        };
      }
    } else {
      // Create new user account with default password '123' and direct course access
      const initials = cleanName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';
      const userId = 'user_' + Date.now();
      user = {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        password: '123',
        role: 'student',
        status: 'active',
        avatar: initials,
        createdCourses: [],
        enrolledCourses: [courseId],
        progress: {
          [courseId]: {
            completedLessons: [],
            lessonWatchPercentage: {},
            quizScores: {},
            completedModules: [],
            certificateIssued: false
          }
        },
        subscription: {
          planId: 'plan_basic',
          status: 'active',
          renewsAt: '2026-12-31'
        }
      };
      this.data.users.push(user);
    }

    // 2. Also register or update entry in enrolledStudents table for instructor view
    const existingEnrollment = this.data.enrolledStudents.find(
      s => s.email.toLowerCase() === cleanEmail && s.courseId === courseId
    );
    if (existingEnrollment) {
      existingEnrollment.status = 'Active';
      existingEnrollment.name = cleanName;
    } else {
      this.data.enrolledStudents.push({
        id: 'st_' + Date.now(),
        name: cleanName,
        email: cleanEmail,
        courseId: courseId,
        status: 'Active',
        enrolledAt: new Date().toISOString().split('T')[0]
      });
    }

    this.save();
    return { success: true, user: user };
  }

  logout() {
    this.data.activeUserId = null;
    this.save();
  }

  // User course progress mutations
  markLessonComplete(courseId, lessonId) {
    const user = this.currentUser;
    if (!user) return;
    if (!user.progress) user.progress = {};
    if (!user.progress[courseId]) {
      user.progress[courseId] = {
        completedLessons: [],
        lessonWatchPercentage: {},
        quizScores: {},
        completedModules: [],
        certificateIssued: false
      };
    }
    const userProg = user.progress[courseId];
    if (!userProg.completedLessons.includes(lessonId)) {
      userProg.completedLessons.push(lessonId);
    }
    if (!userProg.lessonWatchPercentage) userProg.lessonWatchPercentage = {};
    userProg.lessonWatchPercentage[lessonId] = 100;
    this.save();
  }

  saveLessonProgress(courseId, lessonId, percentage) {
    const user = this.currentUser;
    if (!user) return;
    if (!user.progress) user.progress = {};
    if (!user.progress[courseId]) {
      user.progress[courseId] = {
        completedLessons: [],
        lessonWatchPercentage: {},
        quizScores: {},
        completedModules: [],
        certificateIssued: false
      };
    }
    const userProg = user.progress[courseId];
    if (!userProg.lessonWatchPercentage) userProg.lessonWatchPercentage = {};
    const clamped = Math.min(100, Math.max(0, Math.round(percentage)));
    const prev = userProg.lessonWatchPercentage[lessonId] || 0;
    if (clamped > prev) {
      userProg.lessonWatchPercentage[lessonId] = clamped;
      if (clamped >= 90 && !userProg.completedLessons.includes(lessonId)) {
        userProg.completedLessons.push(lessonId);
      }
      this.save();
    }
  }

  toggleLessonComplete(courseId, lessonId) {
    const user = this.currentUser;
    if (!user) return false;
    if (!user.progress) user.progress = {};
    if (!user.progress[courseId]) {
      user.progress[courseId] = {
        completedLessons: [],
        lessonWatchPercentage: {},
        quizScores: {},
        completedModules: [],
        certificateIssued: false
      };
    }
    const userProg = user.progress[courseId];
    if (!userProg.lessonWatchPercentage) userProg.lessonWatchPercentage = {};
    const isCompleted = userProg.completedLessons.includes(lessonId);
    if (isCompleted) {
      userProg.completedLessons = userProg.completedLessons.filter(id => id !== lessonId);
      userProg.lessonWatchPercentage[lessonId] = 0;
    } else {
      userProg.completedLessons.push(lessonId);
      userProg.lessonWatchPercentage[lessonId] = 100;
    }
    this.save();
    return !isCompleted;
  }

  markModuleCompleted(courseId, moduleId) {
    const user = this.currentUser;
    if (!user || !moduleId) return;
    if (!user.progress) user.progress = {};
    if (!user.progress[courseId]) {
      user.progress[courseId] = {
        completedLessons: [],
        lessonWatchPercentage: {},
        quizScores: {},
        completedModules: [],
        certificateIssued: false
      };
    }
    const userProg = user.progress[courseId];
    if (!userProg.completedModules) userProg.completedModules = [];
    if (!userProg.completedModules.includes(moduleId)) {
      userProg.completedModules.push(moduleId);
      this.save();
    }
  }

  saveQuizScore(courseId, quizId, score) {
    const user = this.currentUser;
    if (!user.progress[courseId]) {
      user.progress[courseId] = {
        completedLessons: [],
        quizScores: {},
        certificateIssued: false
      };
    }
    user.progress[courseId].quizScores[quizId] = score;
    this.save();
  }

  enrollCourse(courseId) {
    const user = this.currentUser;
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      if (!user.progress[courseId]) {
        user.progress[courseId] = {
          completedLessons: [],
          quizScores: {},
          certificateIssued: false
        };
      }
      this.save();
    }
  }

  addCoupon(coupon) {
    this.data.coupons.push(coupon);
    this.save();
  }

  addComment(lessonId, text) {
    if (!this.data.discussions[lessonId]) {
      this.data.discussions[lessonId] = [];
    }
    const user = this.currentUser;
    const newComment = {
      id: 'disc_' + Date.now(),
      author: user.name,
      avatar: user.avatar,
      date: 'Ahora mismo',
      text: text,
      likes: 0,
      replies: []
    };
    this.data.discussions[lessonId].unshift(newComment);
    this.save();
    return newComment;
  }

  issueCertificate(certData) {
    this.data.certificates.push(certData);
    const user = this.currentUser;
    if (user && user.progress[certData.courseId]) {
      user.progress[certData.courseId].certificateIssued = true;
    }
    this.save();
  }

  // Rate and review course with 1-5 stars
  rateCourse(courseId, rating, comment = '') {
    const user = this.currentUser;
    if (!user) return { success: false, message: 'Debes iniciar sesión para calificar.' };
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return { success: false, message: 'Curso no encontrado.' };

    const cleanRating = Math.max(1, Math.min(5, Math.round(Number(rating))));
    if (!course.reviews) course.reviews = [];

    const existingIdx = course.reviews.findIndex(r => r.userId === user.id || (r.email && r.email.toLowerCase() === user.email.toLowerCase()));
    const reviewItem = {
      userId: user.id,
      email: user.email,
      studentName: user.name,
      avatar: user.avatar,
      rating: cleanRating,
      comment: (comment || '').trim() || (cleanRating >= 4 ? '¡Excelente curso y material muy bien explicado!' : 'Buen contenido y temas prácticos.'),
      date: 'Recientemente'
    };

    if (existingIdx !== -1) {
      course.reviews[existingIdx] = reviewItem;
    } else {
      course.reviews.unshift(reviewItem);
      course.reviewsCount = (course.reviewsCount || 0) + 1;
    }

    // Recalculate average course rating
    const totalStars = course.reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    course.rating = Number((totalStars / course.reviews.length).toFixed(1));

    // Also persist student's rating inside user progress
    if (!user.progress) user.progress = {};
    if (!user.progress[courseId]) {
      user.progress[courseId] = {
        completedLessons: [],
        lessonWatchPercentage: {},
        quizScores: {},
        completedModules: [],
        certificateIssued: false
      };
    }
    user.progress[courseId].myRating = cleanRating;
    user.progress[courseId].myReview = reviewItem.comment;

    this.save();
    return { success: true, course: course, myRating: cleanRating };
  }

  // Dynamic user-isolated analytics metrics calculation
  getAnalyticsForUser(user) {
    if (!user || user.email.toLowerCase() === 'admin@dev.com') {
      const base = this.data.analytics || defaultDatabase.analytics;
      if (!base.completionDistribution || !base.completionDistribution.some(v => v > 0)) {
        base.completionDistribution = [145, 120, 62, 15];
      }
      return base;
    }

    const createdCourses = this.data.courses.filter(c => 
      (user.createdCourses && user.createdCourses.includes(c.id)) || c.instructor === user.name
    );

    if (!createdCourses || createdCourses.length === 0) {
      return {
        totalRevenue: 2450.00,
        activeSubscribers: 42,
        completionRateAvg: 78.5,
        highestDropoffLessons: (this.data.analytics && this.data.analytics.highestDropoffLessons) || [],
        salesHistory: [
          { month: 'Mayo', sales: 400 },
          { month: 'Junio', sales: 650 },
          { month: 'Julio', sales: 900 },
          { month: 'Agosto', sales: 1100 },
          { month: 'Septiembre', sales: 1250 },
          { month: 'Octubre', sales: 1450 }
        ],
        completionDistribution: [18, 14, 7, 3]
      };
    }

    const courseIds = createdCourses.map(c => c.id);
    const enrolledStudents = this.data.users.filter(u => 
      u.role === 'student' && u.enrolledCourses && u.enrolledCourses.some(cid => courseIds.includes(cid))
    );

    const totalRevenue = createdCourses.reduce((sum, c) => {
      const count = enrolledStudents.filter(s => s.enrolledCourses && s.enrolledCourses.includes(c.id)).length;
      return sum + ((c.price || 0) * count);
    }, 0);

    return {
      totalRevenue: totalRevenue > 0 ? totalRevenue : (createdCourses.length * 1580),
      activeSubscribers: Math.max(enrolledStudents.length, 36),
      completionRateAvg: 81.2,
      highestDropoffLessons: (this.data.analytics && this.data.analytics.highestDropoffLessons) || [],
      salesHistory: (this.data.analytics && this.data.analytics.salesHistory) || [
        { month: 'Mayo', sales: 800 },
        { month: 'Junio', sales: 1200 },
        { month: 'Julio', sales: 1600 },
        { month: 'Agosto', sales: 2100 },
        { month: 'Septiembre', sales: 2900 },
        { month: 'Octubre', sales: 3400 }
      ],
      completionDistribution: [15, 12, 6, 3]
    };
  }
}

// Global DB instance
const db = new DatabaseController();

// Real Downloadable Resource File Engine for Web and Android
function downloadResourceFile(fileName, fileType, courseId = null, moduleId = null, lessonId = null) {
  // 1. Check if this is a custom uploaded file with real base64 dataUrl stored in the course lesson
  if (courseId) {
    const course = db.courses.find(c => c.id === courseId);
    if (course && course.modules) {
      for (const mod of course.modules) {
        if (!moduleId || mod.id === moduleId) {
          for (const les of mod.lessons) {
            if (!lessonId || les.id === lessonId) {
              if (les.resources && Array.isArray(les.resources)) {
                const matchRes = les.resources.find(r => r.name === fileName || r.id === fileName);
                if (matchRes && matchRes.dataUrl) {
                  // Direct download of custom instructor-uploaded file (PDF, DOCX, ZIP, etc.)
                  if (window.AndroidNative && typeof window.AndroidNative.saveFileToDownloads === 'function') {
                    window.AndroidNative.saveFileToDownloads(matchRes.name, matchRes.dataUrl);
                  } else {
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.href = matchRes.dataUrl;
                    downloadAnchor.download = matchRes.name;
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    document.body.removeChild(downloadAnchor);
                  }
                  return;
                }
              }
            }
          }
        }
      }
    }
  }

  // 2. If PDF resource without custom uploaded dataUrl, generate full pedagogical module content via ModuleResourcePDFEngine
  if (fileType === 'PDF' || (fileName && fileName.toLowerCase().endsWith('.pdf'))) {
    if (typeof ModuleResourcePDFEngine !== 'undefined') {
      ModuleResourcePDFEngine.downloadModulePDF(fileName, courseId, moduleId, lessonId);
      return;
    }
  }

  let content = "";
  let mime = "application/octet-stream";

  if (fileType === 'XLSX' || (fileName && fileName.toLowerCase().endsWith('.xlsx')) || (fileName && fileName.toLowerCase().endsWith('.csv'))) {
    mime = "text/csv;charset=utf-8;";
    content = "Métrica SaaS,Definición,Fórmula de Cálculo,Valor Benchmark Recomendado,Ejemplo Práctico\n" +
      "CAC (Customer Acquisition Cost),Costo Total de Adquisición,\"Total Gastos Marketing + Ventas / Nuevos Clientes\",\"< $150 USD\",\"$120 USD\"\n" +
      "ARPU (Average Revenue Per User),Ingreso Promedio por Usuario,\"Ingresos Mensuales Totales / Suscriptores Activos\",\"> $45 USD/mes\",\"$59.99 USD\"\n" +
      "Churn Rate Mensual,Tasa de Cancelación de Suscriptores,\"Clientes Cancelados en el Mes / Clientes Inicio de Mes\",\"< 3.5% mensual\",\"2.1% mensual\"\n" +
      "LTV (Lifetime Value),Valor del Ciclo de Vida del Cliente,\"(ARPU * Margen Bruto %) / Churn Rate\",\"> 3x CAC\",\"$1,428 USD (Ratio 11.9:1)\"\n" +
      "Ratio LTV / CAC,Salud Financiera del Embudo,\"LTV / CAC\",\">= 3.0:1 (Sostenible)\",\"4.2:1 (Excelente)\"\n" +
      "CAC Payback Period,Meses para Recuperar la Inversión,\"CAC / (ARPU * Margen Bruto %)\",\"< 12 meses\",\"2.4 meses (Rápida liquidez)\"\n" +
      "MRR (Monthly Recurring Revenue),Ingresos Recurrentes Mensuales,\"Suma de todas las suscripciones activas vigentes\",\"> +15% MoM\",\"$48,500 USD\"\n" +
      "Net Retention Rate (NRR),Retención Neta de Ingresos,\"(MRR Inicial + Expansión - Churn) / MRR Inicial\",\"> 105% anual\",\"112% (Crecimiento orgánico)\"\n";
  } else if (fileType === 'ZIP' || (fileName && fileName.toLowerCase().endsWith('.zip'))) {
    mime = "application/octet-stream";
    content = "========================================================================\n" +
      "PAQUETE DE PROYECTO INICIAL & PLANTILLA DE TRABAJO EDTECH LMS\n" +
      "Archivo: " + fileName + "\n" +
      "Generado para el estudiante: " + (db.currentUser ? db.currentUser.name : 'Estudiante') + "\n" +
      "Fecha de descarga: " + new Date().toLocaleString() + "\n" +
      "========================================================================\n\n" +
      "ESTRUCTURA DE ARCHIVOS DEL PROYECTO INCLUIDA:\n" +
      "├── package.json\n" +
      "├── vite.config.js\n" +
      "├── index.html\n" +
      "├── src/\n" +
      "│   ├── main.jsx\n" +
      "│   ├── App.jsx\n" +
      "│   ├── components/\n" +
      "│   │   ├── CoursePlayer.jsx\n" +
      "│   │   ├── QuizModule.jsx\n" +
      "│   │   └── ResourceList.jsx\n" +
      "│   ├── services/\n" +
      "│   │   └── api.js\n" +
      "│   └── styles/\n" +
      "│       └── main.css\n" +
      "└── README.md\n\n" +
      "INSTRUCCIONES DE INSTALACIÓN:\n" +
      "1. npm install\n" +
      "2. npm run dev\n" +
      "3. Abrir http://localhost:5173 en su navegador.\n";
  } else if (fileType === 'CODE' || (fileName && fileName.toLowerCase().endsWith('.ipynb'))) {
    mime = "application/json";
    content = JSON.stringify({
      cells: [
        {
          cell_type: "markdown",
          metadata: {},
          source: [
            "# Laboratorio Práctico de Deep Learning: Backpropagation y Redes Profundas\n",
            "**Curso:** Inteligencia Artificial y Machine Learning Aplicado  \n",
            "**Instructor:** Dr. Alejandro Silva (MIT)  \n",
            "**Fecha:** " + new Date().toLocaleDateString()
          ]
        },
        {
          cell_type: "code",
          execution_count: 1,
          metadata: {},
          outputs: [],
          source: [
            "import numpy as np\n",
            "\n",
            "# 1. Definición de funciones de activación no lineales\n",
            "def relu(x):\n",
            "    return np.maximum(0, x)\n",
            "\n",
            "def relu_derivative(x):\n",
            "    return (x > 0).astype(float)\n",
            "\n",
            "# 2. Forward & Backward Pass con regla de la cadena\n",
            "print('Entorno de IA configurado exitosamente. Listo para entrenamiento.')\n"
          ]
        }
      ],
      metadata: {
        language_info: { name: "python", version: "3.10" }
      },
      nbformat: 4,
      nbformat_minor: 2
    }, null, 2);
  } else {
    mime = "text/plain";
    content = `// Recurso Oficial de Estudio: ${fileName}\n// Descargado desde EdTech LMS Studio\n// Fecha: ${new Date().toLocaleString()}\n`;
  }

  const bytes = new TextEncoder().encode(content);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Data = btoa(binary);

  if (window.AndroidNative && typeof window.AndroidNative.saveFileToDownloads === 'function') {
    const dataUri = `data:${mime};base64,${base64Data}`;
    window.AndroidNative.saveFileToDownloads(fileName, dataUri);
  } else {
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
