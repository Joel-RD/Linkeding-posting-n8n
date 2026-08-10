# 🔒 Parte 3 — Seguridad

> **Parte 3 de 4** · [← Anterior: Parte 2 — Guía de configuración](02-CONFIGURACION.md) · [Siguiente: Parte 4 — Costos y curación →](04-COSTOS-Y-CURADURIA.md)

## Antes de hacer público este repo

Este proyecto fue **anonimizado** antes de publicarse, pero tú debes revisar lo tuyo:

### 1. Rota tu API key de Firecrawl

Si tu key de Firecrawl estuvo expuesta (ej. en un commit público o en un archivo
compartido), **rótala** en el dashboard de [firecrawl.dev](https://firecrawl.dev).
Reemplazarla en el archivo **no** la invalida: hay que revocarla/regenerarla.

### 2. No subas secretos ni IDs personales

| Evita publicar | Ejemplo |
|---|---|
| API keys (Firecrawl, OpenAI, etc.) | `fc-...`, `sk-...` |
| Tokens de bots | `123456:ABC...` |
| Credential IDs de n8n | IDs internos de credenciales exportadas |
| Chat IDs personales de Telegram | tu ID de usuario |
| LinkedIn person IDs | el ID de tu perfil |
| `instanceId` de tu instalación n8n | identificador de tu instancia |

### 3. Usa buenas prácticas

- Guarda los secretos en **credenciales de n8n** o variables de entorno, no hardcodeados.
- Importa el workflow y **reconecta las credenciales** en tu instancia (las referencias
  del archivo original apuntan a otra instalación).
- Usa `.gitignore` para excluir `.env`, credenciales exportadas y datos locales de n8n.

## Check-list rápida

- [ ] Key de Firecrawl rotada (si alguna vez se expuso)
- [ ] Sin secretos en el repo: revisa `Bearer, fc-, sk-, token, secret, api_key`
- [ ] Sin chat IDs, person IDs ni credential IDs reales
- [ ] `instanceId` y webhooks anonimizados si el repo es público
- [ ] `.gitignore` incluido y activo

> Sigue con la **[Parte 4 — Costos y curación](04-COSTOS-Y-CURADURIA.md)**.
