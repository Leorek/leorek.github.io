# El estudio de Leo — documento de diseño

> Rediseño de leorek.github.io. Versión 0.1 (prototipo), octubre 2026.
> Rama: `claude/personal-web-3d-design-5sbm21`.

---

## 1. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Concepto | **El estudio de Leo**: una habitación 3D donde cada objeto es una faceta tuya |
| Objetivo | Mezcla equilibrada: que impresione a la comunidad creativa y que un recruiter entienda en 10 s quién eres |
| Estilo | **Toon / cel-shaded** (contornos de tinta y sombreado por bandas, como tu avatar) |
| Hora | **Ciclo real de Málaga** (mañana, día, atardecer, noche) + interruptor de lámpara |
| Objetos | Escritorio, ventana al mar, recreativa arcade, tocadiscos con altavoces, maqueta de montaña rusa y mapa de corcho |
| Personaje | **Mini-Leo toon** que reacciona a lo que miras |
| Navegación | **Híbrida**: el scroll hace un recorrido guiado, un click en un objeto salta a él, y hay menú HTML siempre visible |
| Idiomas | Bilingüe: inglés por defecto y español (se detecta el idioma del navegador y se puede cambiar) |
| Modelos | Primero primitivas en código y assets CC0; después tú puedes sustituir las piezas clave |
| Stack | React 19, R3F 9, drei 10, three r186, Vite 8, Tailwind 4, GSAP, Lenis |

---

## 2. Diagnóstico de la web actual

**Lo que funciona**
- El shader de océano demuestra nivel técnico (olas de Gerstner, refracción, caústicas y absorción), pero su estética no encaja con el nuevo concepto: se sustituye por un mar toon nuevo (§6).
- El contenido está centralizado en `src/data/site.ts`, se respeta `prefers-reduced-motion` y hay un fallback si WebGL falla.

**Lo que frena**
1. **El 3D solo vive en el hero.** Después, un degradado tapa la escena y el resto es una página oscura genérica.
2. **El hero no dice quién eres.** Un mar de noche es bonito pero impersonal. Tus aficiones (montañas rusas, música, juegos, viajes) solo aparecen como texto en una cinta.
3. **Composición del hero:**
   - la arena borrosa en primer plano ocupa casi la mitad de la pantalla;
   - el texto cae justo sobre la línea brillante de la orilla y se lee peor;
   - la luna es un disco plano;
   - hay una banda negra en el horizonte.
4. **Falta contenido.** Las secciones Work y About están ocultas, hay varios `TODO` y no hay CV.
5. **Rendimiento:**
   - todo va en un único chunk de 1,1 MB, así que three.js se descarga antes de pintar nada;
   - no hay estado de carga.
6. **Solo en inglés y sin SEO**: no hay prerender y el contenido no tiene URLs propias.

---

## 3. Qué dice la investigación

Referentes revisados (2024–2026):
- **Bruno Simon (folio-2025)**: una isla que recorres en coche; es WebGPU con fallback a WebGL.
- **Messenger (abeto)**: Developer Site of the Year 2025.
- **Igloo Inc**: Site of the Year 2024, con cámara guiada por scroll.
- **Lando Norris**: Site of the Year 2025. Toda la web es la identidad de la persona.
- **Kazuma Takeda, "My Music Room"**: una habitación con piano y tocadiscos sincronizados.
- **Henry Heffernan**: el clásico portfolio de habitación con un ordenador que funciona.
- **ITOM**: pasillo de puertas, cada una a una habitación.
- **Jordan Breton**: islas flotantes, ritmo contemplativo.

Lecciones aplicadas al diseño:
- **Una metáfora clara y nada más.** La personalidad sale del tema y de la dirección de arte, no de acumular efectos.
- **El contenido no puede quedar encerrado tras el 3D.** Lo más criticado de los portfolios jugables es que hay que "jugar" para leer el CV. Aquí todo el texto es HTML real, accesible desde un menú, y el 3D lo acompaña.
- **Calidad adaptativa.** Lo mejor en escritorio, una versión ligera automática en móvil.
- **Sonido apagado por defecto**, siempre opcional y recordado.
- **Respeto a `prefers-reduced-motion`**: los movimientos de cámara se convierten en cortes con fundido.

Notas técnicas (octubre 2026):
- WebGPU ya funciona en Chrome, Edge y Safari 26, pero no en Linux, en muchos Android ni en iOS anteriores a 26. Por eso el prototipo sigue en WebGL2, que además mantiene compatible tu shader GLSL. Migrar a WebGPU/TSL tiene sentido cuando R3F 10 sea estable.
- GSAP es gratis con todos sus plugins desde 2025.
- Evitamos Theatre.js (sin mantenimiento) y Spline (propietario y pesado).

---

## 4. El concepto

> **"Products by day, worlds by night."**

Tu texto actual ya lo decía: *"make something that feels good to move through"*. La web pasa a ser **un sitio que se recorre**: tu estudio en la costa de Málaga.

El ciclo día/noche es el corazón de la idea. Tu web cambia según la hora real de Málaga:
- **De día** el estudio es luminoso, el mar turquesa y los monitores muestran código. Es el Leo *product engineer*.
- **Al atardecer** todo se tiñe de naranja.
- **De noche** se enciende la lámpara, brilla la recreativa y la luna se refleja en el mar. Es el Leo que construye *mundos*.

Si alguien pulsa el interruptor de la lámpara, el tiempo avanza rápido y pasa por el atardecer. Esa transición es el momento "wow".

### Plano de la habitación (vista cenital)

```
                    PARED DEL FONDO
  ┌───────────────────────────────────────────────────────┐
  │ ◣ARCADE   [ ESCRITORIO · 2 monitores ]   ║  VENTANA  ║ │
  │              (Leo en su silla)         [mueble·vinilo]│
  │                                         🔊          🔊 │
P │ ▦ MAPA                                                │
A │   DE CORCHO          ( alfombra )           ┌───────┐ │
R │                                             │COASTER│ │
E │ ▤ estantería                                │maqueta│ │
D │                                             └───────┘ │
  └───────────────────────────────────────────────────────┘
                 📷 cámara: vista 3/4 desde delante-derecha
```

Es una **habitación seccionada tipo diorama**, con dos paredes y suelo, el formato más reconocible y legible en toon. Por encima de la pared del fondo se ven el mar y el horizonte, así que el estudio parece asomado a la costa.

---

## 5. Recorrido: estaciones

Cada estación es una sección HTML con un panel de texto y una posición de cámara. El scroll interpola la cámara entre estaciones por una curva suave. Hacer click en un objeto lleva a su estación.

| # | Estación | Objeto | Qué pasa en 3D | Panel |
|---|---|---|---|---|
| 0 | `hello` | Vista general | Leo gira la silla y saluda | Nombre, rol, frase y botones *Tour* y *Contacto* |
| 1 | `work` | Escritorio | Leo teclea; el monitor escribe código TypeScript/NestJS en vivo y el otro muestra un esquema de base de datos | "By day: product". Stack de producto y proyectos |
| 2 | `worlds` | Recreativa | Pantalla en modo *attract* (mini-juego pixel, "PRESS START") y marquesina parpadeando; Leo se gira a mirarla | "By night: worlds". UE5, Godot, shaders y prototipos |
| 3 | `music` | Tocadiscos y altavoces | El vinilo gira, los conos laten a 128 BPM, salen notas flotando y Leo mueve la cabeza | Celta y electrónica |
| 4 | `parks` | Maqueta de montaña rusa | El tren recorre la vía con "gravedad" (lento en la subida, rápido en la bajada); el botón **¡Lanzar!** le da un *boost* | Montañas rusas y parques |
| 5 | `travel` | Mapa de corcho | Mapa punteado del mundo con chinchetas e hilos rojos desde Málaga | Viajes |
| 6 | `contact` | Ventana | La cámara se asoma al mar de Málaga: olas, luna o sol, La Farola y una noria a lo lejos | Contacto y redes |

### Detalles con encanto (*easter eggs*)
- La taza del escritorio humea.
- El código del monitor es real (un controlador NestJS).
- La noria de la costa es un guiño a los parques.
- El faro gira de noche.
- **v1:** el código Konami convierte la recreativa en jugable; hay logros por descubrir cosas y un *POV ride* en la montaña rusa.

---

## 6. Dirección de arte

### Toon
- **Sombreado**: `MeshToonMaterial` con un *gradient map* de 3 bandas y filtrado *nearest*, para que los saltos de luz sean duros.
- **Mar**: shader toon propio, casi plano:
  - degradado de turquesa en la orilla a azul profundo, con un "escalón" donde cae la plataforma;
  - trazos de espuma sueltos que serpentean;
  - espuma lamiendo la arena y una ola que entra cada pocos segundos;
  - el reflejo del sol o la luna como una columna de destellos horizontales, intensa al atardecer y con luna;
  - línea de horizonte nítida.
- **Contornos**: técnica de *inverted hull* (`<Outlines>` de drei) en color tinta `#1d1a2b`. Al pasar el ratón por encima, el contorno pasa a ember.
- **Sombras**: un mapa de sombras para la luz que entra por la ventana, que dibuja el marco en el suelo. Sin sombras en calidad baja.
- **Formas**: redondeadas, gruesas y con proporciones "chibi". Pocas piezas, bien legibles.
- **Coherencia**: tu avatar actual ya es un retrato cel-shaded con fondo rojo y logos de Godot y Unreal, así que el estilo continúa tu identidad.

### Paleta base (objetos)
| Rol | Color |
|---|---|
| Tinta (contornos y texto) | `#1d1a2b` |
| Ember (acento de marca) | `#ff7849` |
| Madera | `#b9784f` / `#8a5536` |
| Pared | `#efe2cc` |
| Mar / alfombra | `#2a9d8f` |
| Recreativa | `#5b3f9e` |
| Corcho | `#c8955a` |

### Paleta por hora (cielo, mar y luz)
| Momento | Cielo (cénit → horizonte) | Luz principal | Lámpara |
|---|---|---|---|
| Amanecer (7 h) | lila → melocotón | sol bajo, rosado | apagada |
| Día (9–17 h) | azul → celeste | sol blanco cálido | apagada |
| Atardecer (19:30 h) | violeta → naranja | sol naranja rasante | encendiéndose |
| Noche (22–5 h) | azul tinta → azul noche | luna fría y tenue | encendida, ámbar |

El tiempo se interpola de forma continua: el estado del mundo es una "hora" con decimales y todo deriva de ella.

### Interfaz (HTML)
- **Paneles tipo viñeta de cómic**: fondo papel `#fff6e9`, borde de 2 px en tinta y sombra dura desplazada (`6px 6px 0`). De noche pasan a azul tinta con texto crema y sombra ember.
- **Tipografía**:
  - display: **Bricolage Grotesque** (con carácter, encaja con el toon sin ser infantil);
  - etiquetas: **JetBrains Mono**.
- **Pegatinas** en mono mayúsculas para las etiquetas (`BY DAY`, `BY NIGHT`, `128 BPM`).
- Botón de cambio de idioma `EN / ES` e interruptor de sol y luna en la barra superior.

---

## 7. Mini-Leo

Basado en tu avatar: pelo corto oscuro con *undercut*, barba completa y henley beige claro.

- **Proporciones chibi**: la cabeza mide alrededor de un tercio de la altura y los ojos son óvalos negros con brillo.
- **Estados**:
  - *idle*: respira, parpadea y la silla gira un poco;
  - *typing*: brazos sobre el teclado (estación `work`);
  - *wave*: gira la silla hacia la cámara y saluda (`hello` y `contact`);
  - *look-at*: la cabeza sigue al objeto de la estación activa (recreativa, tocadiscos, coaster o mapa);
  - *nod*: mueve la cabeza al ritmo en `music`;
  - *cheer*: levanta los brazos cuando lanzas la montaña rusa.
- **Ahora**: primitivas animadas en código.
- **v1**: un modelo GLB hecho en Blender (o encargado) con las mismas animaciones.

---

## 8. Navegación, accesibilidad y SEO

- **Todo el contenido es HTML real.** El canvas es decoración (`aria-hidden`). Sin WebGL la web se lee como una página normal sobre un fondo ilustrado.
- **Scroll**: Lenis da el scroll suave y el progreso entre secciones decide la cámara.
- **Click y hover**: el canvas recibe los eventos del documento (`eventSource`) aunque esté detrás del HTML.
  - Pasar el ratón por un objeto cambia el cursor y resalta su contorno.
  - Un click hace scroll a la estación. Los clicks sobre los paneles no atraviesan a la escena.
- **Menú** con anclas `#work`, `#worlds`… enlazables, navegables con teclado y con foco visible.
- **`prefers-reduced-motion`**: la cámara no vuela entre estaciones (corta con fundido), no hay animaciones idle y el coaster se para.
- **SEO (v1)**: prerender estático con `vite-react-ssg`, ruta `/es/` para español, `hreflang` e imagen OG ilustrada.

---

## 9. Rendimiento

- **Primero el texto.** El 3D se carga en un chunk aparte (`React.lazy`) y aparece con un fundido cuando está listo.
- **Presupuesto**:
  - menos de 300 KB antes de pintar;
  - three.js en un chunk diferido;
  - assets 3D de v1 por debajo de unos 5 MB, con meshopt y KTX2.
- **Calidad adaptativa**: `PerformanceMonitor` ajusta el DPR entre 1 y 1,75 y en dispositivos modestos quita las sombras.
- **Texturas dinámicas** (monitores, recreativa, mapa) en `CanvasTexture` pequeñas, actualizadas a unos 20 fps.
- **Una sola escena persistente.** No se recrea nada al cambiar de estación.

---

## 10. Arquitectura

```
src/
  app.tsx                 layout: canvas fijo + nav + estaciones HTML
  content/i18n.ts         textos EN/ES + hook useLang
  data/site.ts            datos (perfil, stacks, proyectos, viajes…)
  lib/
    stations.ts           definición de estaciones (id, cámara desktop/móvil, objeto)
    time-of-day.ts        reloj de Málaga, keyframes de paleta, interpolación
    view-state.ts         estado mutable compartido (scroll, puntero, hover)
    use-lenis.ts          scroll suave
  scene/
    scene.tsx             <Canvas>, luces, calidad adaptativa
    camera-rig.tsx        cámara por scroll entre estaciones
    toon.ts               gradient map, materiales y contornos
    outside.tsx           cielo por hora, paseo marítimo, La Farola, noria
    sea.tsx               mar toon (espuma, orilla, reflejo del sol/luna)
    room.tsx              suelo, paredes con hueco de ventana, muebles
    props/                desk · arcade · turntable · coaster · cork-map · lamp
    avatar.tsx            mini-Leo
  sections/station.tsx    panel HTML de cada estación
  components/nav.tsx      menú, idioma, día/noche
```

---

## 11. Hoja de ruta

**Prototipo (esta rama)**
- Toda la habitación en blockout toon con primitivas.
- Las 7 estaciones navegables.
- Ciclo día/noche real con interruptor.
- Mini-Leo con estados básicos.
- Mar toon.
- Textos bilingües con el contenido actual.

**v1 (con tu contenido)**
- Proyectos reales en `work` y `worlds`.
- Lista real de viajes.
- CV.
- Sustituir los objetos clave por modelos GLB (Kenney Furniture Kit CC0 o propios).
- Sonido opcional: un loop celta y otro electrónico, y los altavoces reaccionan al audio.
- *POV ride* en la montaña rusa.
- Prerender para SEO e imagen OG.

**v2**
- Migrar a WebGPU/TSL.
- Recreativa jugable (Godot web export o mini-juego en canvas).
- Logros.
- "Recuerdo de viaje" con *gaussian splat*.

---

## 12. Estado del prototipo

Implementado en esta rama y probado con capturas automáticas (escritorio 1440×900 y móvil 390×844, a mediodía, atardecer y noche):

**Escena**
- La habitación toon completa: escritorio, recreativa, tocadiscos, maqueta de coaster y mapa de corcho.
- El exterior: mar toon nuevo, palmeras, La Farola y la noria.
- Mini-Leo con sus estados.

**Recorrido e interacción**
- Recorrido de 7 estaciones con cámara por scroll.
- Click en objetos para saltar de estación.
- La lámpara cambia entre día y noche.
- Botón de lanzar la montaña rusa.

**Interfaz**
- Paneles bilingües con tema de día y de noche.
- Reloj de Málaga.
- Menú móvil.

**Robustez**
- Sin WebGL la web se lee entera sobre el cielo degradado.
- Con `prefers-reduced-motion` la cámara salta de estación y la escena queda estática.
- Funcionan los enlaces profundos (`#parks`).

**Peso**
- Chunk inicial de unos 82 KB gzip.
- La escena 3D va aparte, unos 266 KB gzip, cargada en diferido.

**Pendiente para v1:** contenido real, prerender/SEO, sonido, *POV ride* y modelos GLB.

---

## 13. Lo que necesito de ti

1. **Proyectos de trabajo** (2–4). Para cada uno:
   - título;
   - año;
   - tu rol;
   - qué hace y qué problema difícil resolviste (1–2 frases);
   - stack;
   - enlace si es público.

   Si hay NDA, basta con describirlo.
2. **Viajes**: lista de ciudades o países visitados, para las chinchetas.
3. **Montañas rusas**: tu favorita, tu parque favorito y tu *coaster count* si lo llevas.
4. **Música**: 3–5 artistas o temas celtas y electrónicos para las "portadas" del vinilo.
5. **Disponibilidad**: ¿sigue siendo verdad "Available for product engineering work"?
6. **Nombre visible**: ¿"Leo" a secas o "Leo (Juan Palavecino)"?
