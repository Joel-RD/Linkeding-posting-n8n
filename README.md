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
| Cuenta de [n8n](https://n8n.io) (self-hosted o cloud) | Donde se importa el workflow |
| Cuenta de Telegram | Para recibir el link y aprobar las publicaciones |
| Cuenta en [Firecrawl](https://firecrawl.dev) (o self-hosted) | Para extraer el contenido de los artículos |
| API key de un modelo de IA (OpenAI o NVIDIA) | Para redactar el post |
| Cuenta de LinkedIn | Para publicar |

---

## 📚 Documentación por partes

La documentación está dividida en partes independientes para que sea más fácil de seguir:

| # | Parte | Contenido |
|---|---|---|
| 1 | [Cómo funciona](docs/01-COMO-FUNCIONA.md) | Arquitectura del flujo, diagrama y descripción nodo por nodo |
| 2 | [Guía de configuración](docs/02-CONFIGURACION.md) | Paso a paso: Telegram, Firecrawl, IA, LinkedIn y activación |
| 3 | [Seguridad](docs/03-SEGURIDAD.md) | Qué revisar antes de hacer público el proyecto |
| 4 | [Costos y curación](docs/04-COSTOS-Y-CURADURIA.md) | Costo por post y consejos de uso (human in the loop) |

### Inicio rápido

1. Importa `⚡ LinkedIn Publisher.json` en tu n8n (Workflows → Import from File).
2. Sigue la [Parte 2 — Guía de configuración](docs/02-CONFIGURACION.md) **en orden**.
3. Activa el workflow y mándale un link a tu bot de Telegram.

---

## Licencia

Este proyecto se distribuye con fines educativos. Al usar, modificar o redistribuir
este proyecto, conserva el crédito al autor original (ver
[Agradecimiento](#-agradecimiento-al-creador-original)).

---

## Contribuciones

¿Encontraste un bug o tienes una idea? Siéntete libre de:

- Abrir un *issue* o un *pull request*.
- Compartir mejoras al prompt, al flujo o a la documentación.
