# ⚡ LinkedIn Publisher

## 🙏 Agradecimiento al creador original

Este proyecto es una adaptación/continuación del workflow original diseñado por:

**Erik Taveras — Taveras Solutions**

- 🌐 **Web:** [eriktaveras.com](https://eriktaveras.com)
- 📸 **Instagram:** [@eriktaveras](https://instagram.com/eriktaveras)
- 👥 **Comunidad:** [comunidad.eriktaveras.com](https://comunidad.eriktaveras.com)

Con todas las gracias a Erik Taveras por crear, diseñar y compartir el workflow
original, su guía de configuración y la idea de este flujo. Sin su trabajo, este
proyecto no existiría. Este repositorio le rinde el crédito completo por su
creación original.

---

## ¿Qué es?

**⚡ LinkedIn Publisher** es un workflow de **n8n** que automatiza la publicación
de artículos en LinkedIn a partir de un simple link.

El flujo funciona así:

1. Le mandas un link (y opcionalmente una nota con el ángulo) a tu bot de Telegram.
2. Un scraper extrae el artículo y una IA redacta el post con tu estilo y tus hashtags.
3. El bot te envía la propuesta con botones **✅ Publicar / ❌ Cancelar**; si apruebas,
   publica la imagen y el post en LinkedIn automáticamente.

**La IA nunca publica sin tu aprobación.**

> **Alcance:** este workflow está pensado para **n8n self-hosted con dominio propio
> y HTTPS**. Usa `{{ $env.* }}` para configuración y la clave de Firecrawl, así que
> **no funciona en n8n Cloud tal cual**. Si migras a Cloud, sustituye esas
> expresiones por credenciales o valores del workflow y revisa la
> [Parte 3 — Seguridad](docs/03-SEGURIDAD.md).

---

## ¿A quién va dirigido?

Este proyecto está pensado para:

- **Creadores de contenido y curators** de habla hispana (especialmente LATAM)
  que comparten artículos con cadencia en LinkedIn.
- **Desarrolladores** que quieren automatizar su presencia en redes con IA.
- **Marketers y community managers** que gestionan perfiles personales o de marca.
- **Cualquiera con nociones básicas de n8n** que quiera publicar mejor y más rápido,
  sin pagar herramientas caras de gestión social.

### Requisitos previos

| Requisito | Para qué |
|---|---|
| **n8n self-hosted** (recomendado 2.45.x) con dominio y HTTPS | Donde se importa y ejecuta el workflow |
| **Reverse proxy** (Caddy, Nginx o Traefik) | TLS y webhook público de Telegram |
| Cuenta de Telegram | Para recibir el link y aprobar las publicaciones |
| Cuenta en [Firecrawl](https://firecrawl.dev) (o self-hosted) | Para extraer el contenido de los artículos |
| API key de un modelo de IA (NVIDIA por defecto; OpenAI opcional) | Para redactar el post |
| Cuenta de LinkedIn + app de developer | Para publicar |

### Requisitos de red

- Un dominio o subdominio (ej. `n8n.tudominio.com`) apuntando al servidor.
- Puertos **80/443** abiertos para el reverse proxy (n8n escucha solo en `localhost:5678`).
- `WEBHOOK_URL` pública, con **HTTPS** y barra final.
- Telegram exige un webhook HTTPS válido: no uses una IP pelada ni HTTP.

---

## 📚 Documentación por partes

La documentación está dividida en partes independientes para que sea más fácil de seguir:

| # | Parte | Contenido |
|---|---|---|
| 1 | [Cómo funciona](docs/01-COMO-FUNCIONA.md) | Arquitectura del flujo, diagrama y descripción nodo por nodo |
| 2 | [Guía de configuración](docs/02-CONFIGURACION.md) | Paso a paso: red, Telegram, Firecrawl, IA, LinkedIn y activación |
| 3 | [Seguridad](docs/03-SEGURIDAD.md) | Bot privado, secretos, cifrado, red y contenido no confiable |
| 4 | [Costos y curación](docs/04-COSTOS-Y-CURADURIA.md) | Costo por post, checklist de pruebas y consejos de uso |

### Inicio rápido

1. Importa `⚡ LinkedIn Publisher.json` en tu n8n (Workflows → Import from File).
2. Copia la plantilla de entorno: `cp .env.example .env` y completa los valores.
3. Configura tu dominio y el reverse proxy con HTTPS (ver
   [Parte 2 — Paso 0](docs/02-CONFIGURACION.md#paso-0--red-dominio-y-https)).
4. Sigue la [Parte 2 — Guía de configuración](docs/02-CONFIGURACION.md) **en orden**.
5. Adjunta tus credenciales de Telegram, modelo y LinkedIn en los nodos (Firecrawl se configura en `.env`).
6. Activa el workflow y mándale un link a tu bot de Telegram.

> El workflow se importa **sin credenciales** a propósito: cada instalación conecta
> las suyas. Si n8n te pide configurar una credencial, selecciónala en ese nodo.

---

## Seguridad

- El bot está pensado para **uso privado**: filtra por `TELEGRAM_CHAT_ID` y
  `TELEGRAM_USER_ID`, y solo tu usuario puede aprobar (`approverIds`).
- **Nunca** subas `.env`, tokens, chat IDs ni person IDs reales al repositorio.
- Conserva `N8N_ENCRYPTION_KEY`: si la cambias, pierdes el acceso a las credenciales
  guardadas en n8n.
- No expongas el puerto 5678 a Internet: usa el reverse proxy con TLS.
- Revisa la [Parte 3 — Seguridad](docs/03-SEGURIDAD.md) antes de publicar tu fork.

---

## Licencia

Este proyecto se distribuye bajo la licencia **MIT** (ver [LICENSE](LICENSE)).
Al usar, modificar o redistribuir este proyecto, conserva el crédito al autor
original (ver [Agradecimiento](#-agradecimiento-al-creador-original) y
[NOTICE](NOTICE)).

---

## Contribuciones

¿Encontraste un bug o tienes una idea? Siéntete libre de:

- Abrir un *issue* o un *pull request*.
- Compartir mejoras al prompt, al flujo o a la documentación.
- Ejecutar `node scripts/validate-workflow.mjs` antes de enviar cambios.
