# 🛠️ Parte 2 — Guía de configuración

> **Parte 2 de 4** · [← Anterior: Parte 1 — Cómo funciona](01-COMO-FUNCIONA.md) · [Siguiente: Parte 3 — Seguridad →](03-SEGURIDAD.md)

> Importa el archivo `⚡ LinkedIn Publisher.json` en tu instancia de n8n
> (Workflows → Import from File) y sigue estos pasos **en orden**.

## Paso 1 — Bot de Telegram

1. Crea un bot con [@BotFather](https://t.me/BotFather): `/newbot`, asígnale un nombre.
2. Copia el **token** que te da BotFather.
3. En n8n, crea una credencial de **Telegram API** y pega el token.
4. Obtén tu **chat ID** escribiéndole a [@userinfobot](https://t.me/userinfobot).
5. Pega ese chat ID en el nodo **Telegram: Recibir link** → `chatIds`.
6. **Recomendado:** restringe el bot para que solo tú puedas usarlo.

## Paso 2 — Firecrawl (extracción de artículos)

Tienes dos opciones:

- **Opción A — Self-hosted (gratis):** aloja Firecrawl en tu propio servidor y
  apunta el nodo a tu instancia.
- **Opción B — Cloud (recomendada):** crea cuenta en [firecrawl.dev](https://firecrawl.dev)
  y genera una API key.

En el nodo **Extraer artículo (Firecrawl)** agrega el header:

```
Authorization: Bearer fc-TU_CLAVE_FIRECRAWL
```

> ⚠️ **Seguridad:** usa tu propia key y nunca la publiques ni la subas a un repo
> público. Detalles en la [Parte 3 — Seguridad](03-SEGURIDAD.md).

## Paso 3 — Modelo de IA (OpenAI o NVIDIA)

El workflow viene conectado al modelo **NVIDIA Nemotron** (`nvidia/nemotron-nano-12b-v2-vl`).

- **NVIDIA (default):** crea una API key en el [NVIDIA NIM](https://build.nvidia.com)
  y créala como credencial en el nodo del modelo.
- **OpenAI:** crea tu API key en [platform.openai.com](https://platform.openai.com)
  y cambia el nodo del modelo. Puedes usar `gpt-5.4-mini` para bajar el costo a ~$0.01/post.

## Paso 4 — LinkedIn (publicar)

1. Ve a [developer.linkedin.com](https://developer.linkedin.com) y crea una app.
2. Agrega los productos **"Share on LinkedIn"** y **"Sign In with LinkedIn using
   OpenID Connect"** (aprobación instantánea).
3. En el nodo **Publicar en LinkedIn**, crea la credencial OAuth2 y registra la
   **redirect URL** que te muestra n8n en la app de LinkedIn.
4. Conecta tu cuenta y **selecciona tu perfil** en el campo `person`.

## Paso 5 — Personaliza el prompt (haz que suene a TI)

Abre el nodo **Generar post (IA)** y edita el **system message**:

- Sustituye el perfil editorial por el tuyo: tu nombre, tu tema y tu audiencia.
- El prompt actual está pensado para un tono cercano y directo, sin hype vacío,
  dirigido a audiencias LATAM.
- Esto es lo que más impacto tiene en que el post suene como tuyo.

## Paso 6 — Activa el workflow

1. Guarda los cambios.
2. Activa el toggle (arriba a la derecha) para activar el workflow.
3. Mándale un link al bot de Telegram y prueba el flujo.

---

> Sigue con la **[Parte 3 — Seguridad](03-SEGURIDAD.md)** antes de publicar tu proyecto.
