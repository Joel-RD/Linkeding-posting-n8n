# 💸 Parte 4 — Costos y curación

> **Parte 4 de 4** · [← Anterior: Parte 3 — Seguridad](03-SEGURIDAD.md) · [Volver al índice](../README.md)

## Costos estimados

| Concepto | Costo |
|---|---|
| Llamada de IA por post | ~$0.01–0.10 según modelo y longitud |
| Firecrawl cloud | Según plan/credits; self-hosted no cobra API, pero consume infra |
| n8n, Telegram y LinkedIn | Gratis (n8n self-hosted; LinkedIn API sin coste) |
| VPS / infraestructura | ~$5–20/mes según proveedor y tamaño |

Total estimado: **$0.01–0.10 por post** (solo IA) **+ infraestructura**.
Firecrawl cloud puede añadir un coste variable; revisa su plan y tus credits.

### Cómo bajar el costo

- Usa `gpt-5.4-mini` u otro modelo económico (~$0.01/post).
- Usa Firecrawl self-hosted si ya tienes servidor; evitas el cobro por API, pero
  asumes el consumo de CPU/RAM.
- Mantén `maxTokens` en 900 y el artículo truncado a 12.000 caracteres.
- Automatiza la extracción: el scraping no depende de la IA, así que solo pagas
  por la generación del texto.
- Reutiliza el mismo link solo si cambió el ángulo; no generes variantes de más.

## Human in the loop

La IA **nunca publica sin tu aprobación**:

- El bot te envía la propuesta con **botones ✅/❌ de un toque** (si `chatApproval`
  está activo y el workflow está activo con el trigger 1.5+).
- Espera hasta **12 horas**; si no respondes, la publicación se cancela sola.
- Solo tu `TELEGRAM_USER_ID` puede aprobar (`approverIds`).
- Si tu n8n no soporta `chatApproval`, el botón abre el formulario web de n8n.

Consejo: usa esto para curaduría con cadencia. Tu opinión personal escríbela tú:
eso es lo que construye tu marca.

## Checklist de pruebas

Antes de dejar la cadencia automática, prueba:

- [ ] Link con notas y link sin notas.
- [ ] Mensaje sin link → debe pedir un link.
- [ ] Link inválido o artículo bloqueado → aviso de error de extracción.
- [ ] Artículo con `_ * [ ]` en el título o la URL → la propuesta no rompe Markdown.
- [ ] Artículo sin `og:image` → publica solo texto.
- [ ] Cancelar → aviso de cancelación; no publica.
- [ ] Timeout (puedes bajarlo a 1 minuto para probar) → cancela solo.
- [ ] Chat no autorizado → no responde.
- [ ] Credencial de LinkedIn inválida → aviso de error de publicación.
- [ ] Firecrawl caído → aviso de error de extracción.
- [ ] Error Trigger → aviso de error general (en ejecución de producción).
- [ ] Revisa que el post final tenga hook, 3-5 párrafos, hashtags y el link.

## Consejos de uso

- **Cadencia:** define una frecuencia (ej. 2-3 posts/semana) y mándale links en lote
  al bot para tener propuestas listas.
- **Curar, no re-publicar:** comparte artículos que aporten valor a tu audiencia y
  usa las notas para darle tu ángulo.
- **Revisa el prompt** de la Parte 2 (paso 6) para que el tono suene a ti.
- **Prueba primero:** activa el flujo y prueba con 2-3 artículos antes de dejar la
  cadencia automática.
- **No confíes en la primera propuesta:** la IA puede equivocarse con cifras o
  contexto; tú eres el filtro final.

---

Has terminado la documentación. [Volver al índice](../README.md) · 🙏 Recuerda
conservar el crédito al autor original: **Erik Taveras (Taveras Solutions)**.
