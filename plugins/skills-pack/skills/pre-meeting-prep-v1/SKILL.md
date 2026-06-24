---
name: pre-meeting-prep
description: >
  Arma una agenda tentativa con los temas relevantes, pendientes etc... de cara a una reunión
---

# meeting-prep

El objetivo de esta skill es que Rodri entre a cualquier reunión ya con el contexto
fresco: qué se acordó la última vez, qué cambió, qué necesita decisión, dónde pushear.
Un buen prep elimina los primeros 10 minutos de reconstruir contexto y va directo a los asks.

Rodri es Content Operations Senior Manager de Winclap Studio. Sus reportes directos son
Marcos Aguilera (CS Pool), Camila Penas (Creators), Bautista Roberts (Ops & Product),
y el AI Hub (Pauli Endrizzi, Norber Morales, Fede España). Su manager es Leo Santos (VP Studio).

---

## Paso 1 — Identificar la reunión

Dos caminos:

**Named.** Rodri nombra una persona, proyecto o reunión recurrente.
- Persona → resolver a nombre completo y área. Ver tabla de personas conocidas abajo.
- Proyecto → matchear contra `projects/` en CLAUDE.md por slug/keyword.
- Reunión recurrente → matchear contra archivos en `projects/*/meetings/` (e.g. "el bi-weekly de Pix Fit").

**Calendar-driven.** Rodri dice "siguiente reunión" o "qué tengo próximo".
Usar Google Calendar MCP para listar eventos próximos (default: próximas 24h o ventana que indique).
Si hay múltiples eventos plausibles, listarlos y preguntar. No adivinar.

Si ninguno de los dos caminos resuelve la reunión sin ambigüedad, hacer **una sola** pregunta de
clarificación.

---

## Paso 2 — Clasificar el tipo de reunión

| Tipo | Cuándo | Qué buscar |
|---|---|---|
| **1:1 con reporte directo** | Reunión con Marcos, Camila, Bauti, Pauli, Norber, Fede | Proyectos donde son owners + DMs Slack recientes + Gemini notes anteriores |
| **1:1 con manager** | Reunión con Leo Santos | Proyectos estratégicos relevantes + decisiones que necesitan alineación |
| **Review de proyecto** | Reunión sobre un proyecto específico (bi-weekly, kickoff, working session) | Carpeta completa del proyecto + Slack del proyecto |
| **Exec / cross-área** | Reunión con múltiples líderes o stakeholders de varias áreas | Top proyectos por área involucrada + temas cross-cutting |

Si hay ambigüedad (e.g., un 1:1 que es en realidad un review de proyecto), preferir el tipo
"review de proyecto" — es más acotado — y mencionar el framing 1:1 como lente secundario.

---

## Personas conocidas y sus documentos de notas compartidos

| Persona | Rol | Google Doc de 1:1 | Slack handle aprox. |
|---|---|---|---|
| Leo Santos | VP Studio (manager de Rodri) | https://docs.google.com/document/d/1IGmpa_-88MaQD5MMB__jAtaDsGjA9CHPiyhQV0dwNa0/ | @leo.santos |
| Pauli Endrizzi | AI Strategist + PO Pix Fit | https://docs.google.com/document/d/1oQ5UvWfSzeRdrNcRZ_OxGSkmdWrgfOZ3VHFdw8Q_IFo/ | @pauli |
| Paula (Pau) Lapresa | CP Side Lead | https://docs.google.com/document/d/1oEbViFn0EFWvqr0cZ2MokZtpKwkRl4twcYXsXcNAEsI/ | @pau.lapresa |
| Bautista Roberts | Ops & Product Lead | https://docs.google.com/document/d/1id2VRkcVaw9MHUbp3RcOE5s6hgYLVYdEio2YBEKiVlg/ | @bauti |
| Marcos Aguilera | CS Pool Lead | buscar en Drive: title contains 'Marcos' and title contains 'Rodri' | @marcos |
| Camila Penas | Creators Lead | buscar en Drive: title contains 'Camila' and title contains 'Rodri' | @camila |
| Norber Morales | AI Strategist técnico | buscar en Drive | @norber |
| Fede España | Content Technologist | buscar en Drive | @fede.espana |

Si la persona no está en la tabla, buscar con: `title contains '[Nombre]' and title contains 'Rodri'` en Drive.

---

## Paso 3 — Recolectar contexto

Leer siempre el CLAUDE.md del proyecto (`/Users/rodrigoalvarezfarre/Documents/Claude/Projects/Winclap/CLAUDE.md`)
para el índice de proyectos y flags de health/priority. Luego, según el tipo:

### Para 1:1 con reporte directo o manager

Ejecutar en paralelo:

**A. Notas Gemini recientes (últimas 2 reuniones)**
- Buscar en Drive: `title contains '[Nombre]' and title contains 'Notas de Gemini'`
- Leer los 2 archivos más recientes
- Extraer: decisiones tomadas, temas abiertos, pendientes mencionados

**B. Documento de notas compartido de la 1:1**
- Usar la URL de la tabla de arriba (o buscarla si no está mapeada)
- Leer el documento con `read_file_content` o `download_file_content`
- Identificar: acuerdos, follow-ups, temas recurrentes sin cerrar

**C. Proyectos relevantes**
- Revisar los archivos `projects/` del CLAUDE.md que sean relevantes para esa persona y su scope
- Para cada proyecto relevante, leer `status.md` y `next-steps.md`
- Si el proyecto está `at-risk` o `blocked`, leer también `risks.md`
- Extraer: riesgos activos, decisiones pendientes, cambios de status recientes

**D. DMs de Slack recientes (última semana)**
- Buscar el usuario con `slack_search_users` usando el nombre de la persona
- Leer el canal DM con `slack_read_channel` usando el user_id como channel_id
- Ampliar a 2 semanas si la última reunión fue hace más de 7 días
- Extraer: temas abiertos, pedidos sin respuesta, contexto de conversaciones clave

### Para review de proyecto

1. Leer el `context.md`, `status.md`, `next-steps.md`, `decisions.md` del proyecto.
2. Leer el archivo más reciente en `projects/NN-<slug>/meetings/` — es la fuente más importante: contiene qué se acordó la última vez y qué estaba pendiente.
3. Slack search (últimos 7-14 días): canales del proyecto (desde el frontmatter del proyecto) + keyword search por nombre/slug del proyecto.

### Para exec / cross-área

1. Desde el evento de calendario y asistentes, identificar los temas y áreas representadas.
2. Para cada área, revisar los top 2-3 proyectos por prioridad (p0/p1) del CLAUDE.md.
3. Buscar temas cross-cutting (Studio Reinvention, AI Hub, Agentic Studio, Pix Fit).
4. Slack search: threads o canvases que referencien el tema de la reunión en los últimos 14 días.

---

## Paso 4 — Generar el brief en el chat

Usar esta estructura. Omitir cualquier sección que no tenga nada real que decir — una sección
vacía es peor que no tener la sección.

```markdown
# Prep · [Título de la reunión] · [Fecha]

**Tipo:** 1:1 con [nombre] / Review · [proyecto] / Exec sync
**Último contacto:** [fecha del último meeting registrado, o "sin registro previo"]

## Contexto

[2-4 oraciones. Qué es esta reunión y cómo están las cosas en términos generales.
No reafirmar lo obvio — Rodri ya lo sabe.]

## Agenda sugerida

**[Theme 1]**
* [Topic]
  * [Detalle / contexto / decisión requerida]
* [Topic 2]
  * [Detalle]

**[Theme 2]**
* [Topic]
  * [Detalle]

**Blockers y pendientes**
* [Proyecto o tema] — [qué decisión o acción necesita Rodri tomar o pushear. Incluir qué debería traer a la mesa y, si aplica, la restricción que lo hace urgente. Concreto, no genérico.]

**Wins para reconocer**
* [Logros recientes que vale la pena nombrar. Las personas trabajan mejor cuando sus wins son vistos.]
```

---

## Calibración por tipo de relación

- **Leo (manager):** foco estratégico. Máximo 4-5 temas. Sin detalle operacional. Priorizar
  decisiones que necesitan su alineación o contexto que él debería tener.
- **Reportes directos (Pauli, Bauti, Marcos, Cami, Norber, Fede):** foco operacional + accountability.
  Máximo 5-6 temas. Incluir blockers, acuerdos a revisar, definiciones pendientes.
- **Pares / otros:** adaptar según contexto.

---

## Reglas de resolución

**Nombres.** Shortcuts comunes: Leo = Leo Santos (VP Studio), Pauli = Paula Endrizzi (AI Hub),
Pau o Lapresa = Paula Lapresa (CP Side), Bauti = Bautista Roberts (Ops & Product),
Marcos = Marcos Aguilera (CS Pool), Cami = Camila Penas (Creators).
Otros nombres → revisar `areas/winclap-overview.md` o `resources/winclap-structure.md`.

**Slugs de proyecto.** Fuzzy match contra la tabla de proyectos en CLAUDE.md.
Ejemplos: "reinvención" → `studio-reinvention`, "pix fit" → `product-pixfit`,
"agentic" → `product-agentic-brkaway`, "test MX" → `reinvention-test-mx`.

**Ventana temporal de Slack.** Default 7 días. Si el último meeting registrado es más antiguo,
ampliar a "desde el último meeting + 1 día".

**Cuando project files y Slack no coinciden.** Slack es más fresco. Surfacear la discrepancia:
*"status.md dice X, pero Slack del [fecha] sugiere Y — vale la pena confirmar en la reunión."*
No elegir silenciosamente uno de los dos.

**Archivos que no existen.** Muchos proyectos no tienen todos los archivos. Saltear y seguir.

**Fechas.** Siempre imprimir fechas como `YYYY-MM-DD` en el brief, nunca relativas
("el martes pasado"). Rodri puede releer el brief días después y perder la referencia.

---

## Brevity discipline

El brief es una herramienta, no un entregable. Cada bullet debe pasar el test:
*¿Haría Rodri algo distinto en la reunión si no tuviera este punto?* Si no, cortarlo.

- No pegar mensajes crudos de Slack — sintetizar qué significan para la reunión.
- No reafirmar descripciones de proyectos que Rodri escribió él mismo.
- No recomendar movimientos de tono o interpersonales ("preguntale cómo se siente con la carga").
  Quedarse en la sustancia.
- No padear. Si un proyecto no se movió desde la última reunión, el bullet es solo:
  *"Sin movimiento desde [fecha]. Vale preguntar por qué."*

---

## Output channel

Imprimir el brief en el chat. No guardarlo en archivo a menos que Rodri lo pida
("guardame esto", "save this"). Si lo pide, guardar en
`outputs/meeting-prep-YYYY-MM-DD-<short-slug>.md`.