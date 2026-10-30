# 📚 Parte 1 — Cómo funciona

> **Parte 1 de 4** · [← Volver al índice](../README.md) · [Siguiente: Parte 2 — Guía de configuración →](02-CONFIGURACION.md)

## Diagrama del flujo

```text
Telegram (recibes link)
        │
        ▼
Extraer URL y notas
        │
        ▼
¿Chat autorizado? ──no──► fin (sin respuesta)
        │ sí
        ▼
¿Trae link? ──no──► Telegram (pedir link)
        │ sí
        ├──────────────► Telegram (avisar "procesando")
        ▼
Firecrawl ──error──► Telegram (avisar error de extracción)
        ▼
¿Artículo extraído? ──no──► Telegram (avisar error de extracción)
        │ sí
        ▼
Generar post (IA) ◄── Modelo (NVIDIA / OpenAI)
        ▼
Validar salida IA (longitud, hashtags, sin URLs)
        ▼
Preparar publicación (resumen + hashtags + URL + imagen)
        ▼
Preparar mensaje aprobación (escapa Markdown)
        ▼
Aprobar por Telegram (botones ✅/❌, timeout 12 h)
        ▼
¿Aprobado? ──no──► Telegram (avisar cancelado)
        │ sí
        ▼
Descargar imagen (si falla, publica sin imagen)
        ▼
Publicar en LinkedIn ──error──► Telegram (avisar error de publicación)
        ▼
Telegram (confirmar publicado)

Error Trigger ──► Telegram (avisar error general)
```

> `Avisar procesando` y el error de Firecrawl son ramas laterales: no reemplazan
> los datos del flujo principal.

## Nodo por nodo

| Nodo | Función |
|---|---|
| **Telegram: Recibir link** | Trigger que escucha el mensaje del bot. Filtra por `chatIds` y `userIds`; el guard posterior falla cerrado si faltan. |
| **Extraer URL y notas** | Separa la URL del texto libre (notas/ángulo editorial) y limpia puntuación pegada al link. |
| **¿Chat autorizado?** | Guard adicional *fail-closed*: compara el `chatId` recibido con `TELEGRAM_CHAT_ID`. Si falta una variable o no coincide, la rama termina sin responder. |
| **¿Trae link?** | IF: si no hay URL, pide el link; si hay, continúa. |
| **Avisar procesando** | Rama lateral que envía "⏳ Procesando…" antes de Firecrawl, para que el usuario reciba el aviso cuanto antes. Si falla el aviso, no bloquea el flujo. |
| **Extraer artículo (Firecrawl)** | HTTP Request a la API de Firecrawl que convierte el artículo en Markdown. Reintenta 3 veces y tiene salida de error. |
| **¿Artículo extraído?** | Comprueba que Firecrawl devolvió Markdown útil (más de 300 caracteres). Si no, avisa por Telegram. |
| **Generar post (IA)** | Agente con system message con tu voz editorial; genera JSON estructurado. Incluye instrucciones para ignorar prompt injection dentro del artículo. |
| **Formato JSON** | Output parser que garantiza el formato `{resumen_linkedin, hashtags}`. |
| **Validar salida IA** | Limpia URLs/markdown, exige una longitud mínima, ajusta el resumen para que el post final quepa en 3.000 caracteres y normaliza hasta 3 hashtags. Si la salida es inválida, el workflow falla y avisa. |
| **Preparar publicación** | Ensambla texto final, hashtags, URL e imagen (`ogImage` del artículo). |
| **Preparar mensaje aprobación** | Escapa `_`, `*`, `[`, `]` y las comillas invertidas del texto, y codifica los caracteres conflictivos de las URLs para que Telegram Markdown no falle. |
| **Aprobar por Telegram** | Human in the loop: envía propuesta con botones ✅/❌ y espera hasta 12 h. Con `chatApproval: true` la aprobación es de un toque; solo `approverIds` puede aprobar. |
| **Descargar imagen** | Descarga la imagen destacada del artículo (o un fallback de Unsplash). Si falla, el post se publica solo con texto. |
| **Publicar en LinkedIn** | Publica el post con imagen (`IMAGE`) o solo texto (`NONE`) en tu perfil. El campo `person` usa el ID sin `urn:li:person:`. |
| **Confirmar / Avisar cancelado** | Notificaciones de resultado por Telegram. |
| **Avisar error extracción / publicación** | Avisos específicos cuando Firecrawl o LinkedIn fallan. |
| **Error Trigger + Avisar error general** | Red de seguridad para fallos no controlados en ejecuciones de producción (no en pruebas manuales). |

> El timeout de aprobación usa validación `loose` a propósito: si el usuario no
> responde, el ítem de timeout no tiene `data.approved` y el IF lo trata como
> cancelación en lugar de fallar.

> Sigue con la **[Parte 2 — Guía de configuración](02-CONFIGURACION.md)** para ponerlo en marcha.
