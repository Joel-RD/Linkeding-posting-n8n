# 🛠️ Parte 2 — Guía de configuración

> **Parte 2 de 4** · [← Anterior: Parte 1 — Cómo funciona](01-COMO-FUNCIONA.md) · [Siguiente: Parte 3 — Seguridad →](03-SEGURIDAD.md)

> Importa el archivo `⚡ LinkedIn Publisher.json` en tu instancia de n8n
> (Workflows → Import from File) y sigue estos pasos **en orden**.

## Paso 0 — Red, dominio y HTTPS

Telegram necesita un webhook **HTTPS público**; no acepta `http://` ni `localhost`.
Además, Telegram solo admite webhooks en los puertos **443, 80, 88 o 8443**; usa 443.
Por eso el workflow está pensado para n8n self-hosted con dominio propio.

1. Apunta un subdominio (ej. `n8n.tudominio.com`) al servidor.
2. Pon n8n detrás de **Caddy, Nginx o Traefik**. El `docker-compose.yml` deja n8n
   escuchando solo en `127.0.0.1:5678` para que no quede expuesto directamente.
   - **Caddy:** copia [`deploy/Caddyfile.example`](../deploy/Caddyfile.example),
     cambia el dominio y recarga Caddy. Caddy gestiona el certificado TLS solo.
   - **Nginx/Traefik:** haz proxy a `http://127.0.0.1:5678` y termina TLS ahí.
   - Si tu proxy corre en Docker, comparte una red con n8n y usa el nombre del
     servicio (`n8n:5678`) en lugar de `127.0.0.1`.
3. En `.env`, configura:
   ```dotenv
   N8N_HOST=n8n.tudominio.com
   N8N_PROTOCOL=https
   WEBHOOK_URL=https://n8n.tudominio.com/
   N8N_PROXY_HOPS=1
   ```
   `WEBHOOK_URL` debe incluir la **barra final** y coincidir con la URL pública.
4. Genera una clave de cifrado estable:
   ```bash
   openssl rand -hex 32
   ```
   Pégala en `N8N_ENCRYPTION_KEY`.
5. Reinicia n8n:
   ```bash
   docker compose up -d
   ```
6. Abre `https://n8n.tudominio.com` y comprueba que el certificado sea válido.

> ⚠️ **No cambies `N8N_ENCRYPTION_KEY` si ya tienes credenciales guardadas.**
> Esa clave cifra las credenciales de n8n; si la pierdes o la regeneras, tendrás
> que volver a conectar Telegram, LinkedIn y el modelo. Si vienes de una instalación
> existente, conserva la clave actual (está en `/home/node/.n8n/config` dentro del
> volumen) y no la reemplaces por una nueva.

## Paso 1 — Variables de entorno y secretos

El workflow **no hardcodea secretos**: los lee del entorno con `{{ $env.* }}`.

1. Copia la plantilla:
   ```bash
   cp .env.example .env
   ```
2. Llena los valores:
   - `TELEGRAM_CHAT_ID` y `TELEGRAM_USER_ID` — tu chat y tu usuario (ver Paso 2).
   - `FIRECRAWL_API_KEY` — tu key de Firecrawl (`fc-...`).
   - `FIRECRAWL_BASE_URL` — endpoint completo, **incluye `/v1/scrape`**.
   - `LINKEDIN_PERSON_ID` — el ID de tu perfil, **sin** `urn:li:person:`.
   - `EDITORIAL_PERSONA` — tu perfil editorial (nombre/handle, rol, tema y audiencia).
   - Las variables `N8N_*` del Paso 0.
3. Reinicia n8n para que cargue las variables:
   - **Docker:** `docker compose up -d` (el compose usa `env_file: .env`).
   - **Instalación directa:** reinicia el proceso con las variables exportadas.

> `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` es necesario para que funcionen las
> expresiones `{{ $env.* }}`. Si tu instancia es compartida, valora mover los
> secretos a credenciales nativas y poner esa variable en `true`.

> `.env` está en `.gitignore`: nunca se sube al repo. Los **tokens** de Telegram,
> LinkedIn y NVIDIA no van aquí: se guardan como credenciales nativas de n8n.

## Paso 2 — Bot de Telegram privado

1. Crea un bot con [@BotFather](https://t.me/BotFather): `/newbot`, asígnale un nombre.
2. Copia el **token** que te da BotFather.
3. En n8n, crea una credencial de **Telegram API** y pega el token. Asígnala a
   **todos** los nodos de Telegram (trigger, aprobación y avisos).
4. Obtén tu **chat ID** y tu **user ID** escribiéndole a
   [@userinfobot](https://t.me/userinfobot). En un chat privado suelen ser el mismo
   número.
5. Pega ambos en `.env`:
   ```dotenv
   TELEGRAM_CHAT_ID=123456789
   TELEGRAM_USER_ID=123456789
   ```
6. El workflow aplica tres capas de protección:
   - El trigger filtra por `chatIds` y `userIds`.
   - El nodo **¿Chat autorizado?** compara el `chatId` y falla cerrado si falta
     cualquiera de las dos variables.
   - La aprobación usa `approverIds`: solo tu usuario puede pulsar ✅.

> No uses el bot en grupos ni compartas el token. Si cambias de cuenta o de chat,
> actualiza `.env` y reinicia n8n; si falta una variable, el bot **no responde**
> (es intencional).

## Paso 3 — Firecrawl (extracción de artículos)

Tienes dos opciones:

- **Opción A — Self-hosted:** aloja Firecrawl en tu servidor y apunta
  `FIRECRAWL_BASE_URL` al endpoint de tu instancia, por ejemplo
  `http://host.docker.internal:3002/v1/scrape` si Firecrawl corre en el host y n8n
  en Docker. El compose ya declara `host.docker.internal` para Linux.
  Si Firecrawl está en otro contenedor, usa el nombre del servicio.
- **Opción B — Cloud:** crea cuenta en [firecrawl.dev](https://firecrawl.dev) y
  genera una API key. La URL por defecto es
  `https://api.firecrawl.dev/v1/scrape`.

La key y la URL se leen de `.env` (`FIRECRAWL_API_KEY` / `FIRECRAWL_BASE_URL`);
no hace falta tocar el nodo. El nodo reintenta 3 veces y, si falla, avisa por
Telegram en lugar de dejar el flujo a medias.

> ⚠️ **Seguridad:** usa tu propia key y nunca la publiques ni la subas a un repo
> público. Detalles en la [Parte 3 — Seguridad](03-SEGURIDAD.md).

## Paso 4 — Modelo de IA (NVIDIA u OpenAI)

El workflow viene conectado al modelo **NVIDIA Nemotron**
(`nvidia/nemotron-nano-12b-v2-vl`).

- **NVIDIA (default):** crea una API key en el [NVIDIA NIM](https://build.nvidia.com)
  y créala como credencial en el nodo del modelo.
- **OpenAI:** crea tu API key en [platform.openai.com](https://platform.openai.com)
  y cambia el nodo del modelo. Puedes usar `gpt-5.4-mini` para bajar el costo a
  ~$0.01/post.
- El nodo tiene `maxTokens: 900` y `temperature: 0.7`. Ajusta esos valores si
  quieres posts más largos o más creativos, pero revisa el costo.
- Si cambias de modelo, conserva el **output parser** (`Formato JSON`) y el prompt
  con el esquema `{resumen_linkedin, hashtags}`. El nodo **Validar salida IA**
  rechaza respuestas demasiado cortas o sin hashtags.

## Paso 5 — LinkedIn (publicar)

1. Ve a [developer.linkedin.com](https://developer.linkedin.com) y crea una app.
2. Agrega los productos **"Share on LinkedIn"** y **"Sign In with LinkedIn using
   OpenID Connect"** (aprobación instantánea).
3. En el nodo **Publicar en LinkedIn**, crea la credencial OAuth2 y registra la
   **redirect URL** que te muestra n8n en la app de LinkedIn.
4. Conecta tu cuenta. El campo `person` ya usa `LINKEDIN_PERSON_ID`; si prefieres
   el selector, elige tu perfil (reemplaza la expresión).
5. En `.env`, `LINKEDIN_PERSON_ID` debe ser **solo el ID**, sin el prefijo
   `urn:li:person:`. El workflow también lo limpia si te equivocas, pero es mejor
   dejarlo bien desde el principio.

> Este workflow publica en tu **perfil personal**. Para publicar en una página de
> empresa, cambia `postAs` a `organization`, usa el campo `organization` con el
> URN de la página y solicita los permisos de LinkedIn correspondientes.

## Paso 6 — Personaliza el prompt (haz que suene a TI)

Edita `EDITORIAL_PERSONA` en tu `.env` con tu nombre/handle, tu tema y tu audiencia:

- Ejemplo: `EDITORIAL_PERSONA=Tu-nombre: Back-end Developer, contenido en español para LATAM`.
- El prompt base ya está pensado para un tono cercano y directo, sin hype vacío.
- Esto es lo que más impacto tiene en que el post suene como tuyo.
- El prompt incluye una instrucción explícita para **ignorar instrucciones
  maliciosas** dentro del artículo (prompt injection). No la elimines.

## Paso 7 — Aprobación de un toque

El nodo **Aprobar por Telegram** tiene `chatApproval: true`. Eso permite aprobar
con un botón ✅ dentro del chat, sin abrir el formulario web de n8n.

Requisitos:

- **Telegram Trigger 1.5+** (el workflow ya usa 1.5). El compose fija n8n 2.45.7;
  si tu instancia es anterior, actualiza n8n o pon `chatApproval: false` para usar
  el formulario web.
- **HTTPS público** y el workflow **activo**: al activarlo, el trigger registra
  `callback_query` en Telegram. Después de importar o cambiar el trigger,
  desactiva y vuelve a activar el workflow.
- `approverIds` usa `TELEGRAM_USER_ID`; solo tu usuario puede aprobar.

El timeout es de **12 horas**. Si no respondes, el IF de aprobación recibe el
evento de timeout sin `data.approved` y lo trata como cancelación (validación
`loose` intencional).

> Si configuras `EXECUTIONS_TIMEOUT` en n8n, déjalo en `-1` o en un valor mayor
> que 12 horas; de lo contrario la espera de aprobación se corta antes.

## Paso 8 — Activa y prueba

1. Guarda los cambios.
2. Activa el toggle (arriba a la derecha) para activar el workflow.
3. Mándale un link al bot de Telegram.
4. Prueba estos casos antes de confiar en el flujo:
   - Link con notas y link sin notas.
   - Mensaje sin link (debe pedir un link).
   - Link inválido o artículo bloqueado (debe avisar de error de extracción).
   - Artículo con `_ * [ ]` en el título o en la URL (la propuesta no debe romper
     el Markdown de Telegram).
   - Artículo sin `og:image` (debe publicar solo texto).
   - Cancelar y dejar vencer el timeout (prueba con 1 minuto si quieres).
   - Chat no autorizado (no debe responder).
   - Credencial de LinkedIn inválida (debe avisar de error de publicación).
   - Firecrawl caído (debe avisar de error de extracción).
5. Revisa la pestaña **Executions** de n8n si algo no sale como esperas.

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| El bot no responde | `TELEGRAM_CHAT_ID`/`TELEGRAM_USER_ID` mal o ausentes; workflow inactivo; webhook inaccesible | Revisa `.env`, activa el workflow, comprueba `WEBHOOK_URL`/HTTPS y los logs de n8n. |
| Telegram `400 can't parse entities` | Markdown sin escapar en un mensaje | El workflow escapa la propuesta; si editas el mensaje, escapa `_`, `*`, `[`, `]` y las comillas invertidas. |
| No llega la propuesta de aprobación | Credencial de Telegram sin asignar; `chatApproval` sin soporte; trigger desactualizado | Asigna la credencial a todos los nodos de Telegram; actualiza n8n o pon `chatApproval: false`; reactiva el workflow. |
| Firecrawl devuelve error | Key/URL incorrecta o artículo bloqueado | Verifica que `FIRECRAWL_BASE_URL` incluya `/v1/scrape`; prueba el link en el navegador; revisa el error en Executions. |
| LinkedIn `401/403` | OAuth vencido, productos faltantes o `person` incorrecto | Reconecta la credencial; revisa los productos de la app; deja `LINKEDIN_PERSON_ID` sin `urn:li:person:`. |
| LinkedIn publica sin imagen | La descarga de `og:image` falló | Es el fallback esperado; revisa el log del nodo **Descargar imagen** si quieres corregir la URL. |
| `Error Trigger` no notifica | Solo se dispara en ejecuciones de producción, no en pruebas manuales | Prueba con el workflow activo; revisa la credencial del nodo **Avisar error general**. |
| "Credential not set" / "Credential not found" | El workflow se importó sin credenciales (a propósito) | Selecciona tu credencial en cada nodo de Telegram, LinkedIn y modelo. |

---

> Sigue con la **[Parte 3 — Seguridad](03-SEGURIDAD.md)** antes de publicar tu proyecto.
