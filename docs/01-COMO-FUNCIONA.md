# 📚 Parte 1 — Cómo funciona

> **Parte 1 de 4** · [← Volver al índice](../README.md) · [Siguiente: Parte 2 — Guía de configuración →](02-CONFIGURACION.md)

## Diagrama del flujo

```
Telegram (recibes link)
        │
        ▼
Extraer URL y notas ──► ¿Trae link? ──no──► Telegram (pedir link)
        │                      │sí
        ▼                      ▼
Firecrawl (extrae el artículo)
        ▼
Generar post (IA) ◄── Modelo (OpenAI / NVIDIA)
        ▼
Preparar publicación (resumen + hashtags + url + imagen)
        ▼
Telegram: Aprobar (botones ✅/❌, timeout 12 h)
        ▼
¿Aprobado? ──no──► Telegram (avisar cancelado)
        │sí
        ▼
Descargar imagen
        ▼
Publicar en LinkedIn
        ▼
Telegram (confirmar publicado)
```

## Nodo por nodo

| Nodo | Función |
|---|---|
| **Telegram: Recibir link** | Trigger que escucha el mensaje del bot. Extrae el chat ID para responder al usuario correcto. |
| **Extraer URL y notas** | Separa la URL del texto libre (notas/ángulo editorial). |
| **¿Trae link?** | IF: si no hay URL, pide el link; si hay, continúa. |
| **Extraer artículo (Firecrawl)** | HTTP Request a la API de Firecrawl que convierte el artículo en Markdown. |
| **Generar post (IA)** | Agente con system message con tu voz editorial; genera JSON estructurado. |
| **Formato JSON** | Output parser que garantiza el formato `{resumen_linkedin, hashtags}`. |
| **Preparar publicación** | Ensambla texto final, hashtags, URL e imagen (ogImage del artículo). |
| **Aprobar por Telegram** | Human in the loop: envía propuesta con botones ✅/❌ y espera hasta 12 h. |
| **Descargar imagen** | Descarga la imagen destacada del artículo (o un fallback de Unsplash). |
| **Publicar en LinkedIn** | Publica el post como publicación con imagen en tu perfil. |
| **Confirmar / Avisar cancelado** | Notificaciones de resultado por Telegram. |

> Sigue con la **[Parte 2 — Guía de configuración](02-CONFIGURACION.md)** para ponerlo en marcha.
