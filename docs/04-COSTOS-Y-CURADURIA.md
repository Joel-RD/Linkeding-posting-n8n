# 💸 Parte 4 — Costos y curación

> **Parte 4 de 4** · [← Anterior: Parte 3 — Seguridad](03-SEGURIDAD.md) · [Volver al índice](../README.md)

## Costos estimados

| Concepto | Costo |
|---|---|
| Llamada de IA por post | ~$0.01–0.10 según modelo |
| Firecrawl (cloud) | Según plan; gratuito self-hosted |
| n8n, Telegram, LinkedIn | Gratis |

Total estimado: **$0.05–0.10 por post** (solo la llamada de IA).

### Cómo bajar el costo

- Usa `gpt-5.4-mini` u otro modelo económico (~$0.01/post).
- Usa Firecrawl self-hosted para no pagar el plan cloud.
- Automatiza la extracción: el scraping no depende de la IA, así que solo pagas
  por la generación del texto.

## Human in the loop

La IA **nunca publica sin tu aprobación**:

- El bot te envía la propuesta con botones **✅ Publicar / ❌ Cancelar**.
- Espera hasta **12 horas**; si no respondes, la publicación se cancela sola.
- Consejo: usa esto para curaduría con cadencia. Tu opinión personal escríbela tú:
  eso es lo que construye tu marca.

## Consejos de uso

- **Cadencia:** define una frecuencia (ej. 2-3 posts/semana) y mándale links en lote
  al bot para tener propuestas listas.
- **Curar, no re-publicar:** comparte artículos que aporten valor a tu audiencia y
  usa las notas para darle tu ángulo.
- **Revisa el prompt** de la Parte 2 (paso 5) para que el tono suene a ti.
- **Prueba primero:** activa el flujo y prueba con 2-3 artículos antes de dejar la
  cadencia automática.

---

Has terminado la documentación. [Volver al índice](../README.md) · 🙏 Recuerda
conservar el crédito al autor original: **Erik Taveras (Taveras Solutions)**.
