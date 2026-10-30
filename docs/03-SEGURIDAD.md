# 🔒 Parte 3 — Seguridad

> **Parte 3 de 4** · [← Anterior: Parte 2 — Guía de configuración](02-CONFIGURACION.md) · [Siguiente: Parte 4 — Costos y curación →](04-COSTOS-Y-CURADURIA.md)

## Modelo de amenaza: bot privado

Este workflow está pensado para **uso personal**, no para un equipo ni para una
instancia multiusuario. Los riesgos principales son:

1. Que otra persona use el bot y publique en tu LinkedIn.
2. Que se filtren secretos (`.env`, tokens, credenciales).
3. **Prompt injection** desde el contenido del artículo.
4. **SSRF**: que una URL manipulada haga que Firecrawl o la descarga de imagen
   accedan a recursos internos de tu red.
5. Compromiso de la instancia n8n (panel expuesto, contraseña débil, n8n viejo).

## 1. Bot privado (fail-closed)

El workflow aplica tres capas:

- **Trigger:** filtra por `chatIds` (`TELEGRAM_CHAT_ID`) y `userIds`
  (`TELEGRAM_USER_ID`).
- **Guard `¿Chat autorizado?`:** compara el `chatId` recibido con
  `TELEGRAM_CHAT_ID`; si falta cualquiera de las dos variables, la rama termina
  **sin responder**.
- **Aprobación:** `approverIds` limita los botones ✅/❌ a tu usuario.

Buenas prácticas:

- No uses el bot en grupos ni compartas el token.
- Si cambias de cuenta o de chat, actualiza `.env` y reinicia n8n.
- Si sospechas que el token se filtró, revócalo en BotFather (`/revoke`) y crea
  una credencial nueva en n8n.
- Si el bot deja de responder después de un cambio, revisa primero
  `TELEGRAM_CHAT_ID` y `TELEGRAM_USER_ID`: el fallo cerrado es intencional.

## 2. Secretos y cifrado

- `.env` está en `.gitignore`; **nunca** lo subas al repo.
- Los tokens de Telegram, LinkedIn y NVIDIA se guardan como **credenciales nativas
  de n8n**, no en el workflow ni en `.env`.
- `N8N_ENCRYPTION_KEY` cifra las credenciales. **Consérvala y respáldala**; si la
  cambias o la pierdes, tendrás que reconectar todas las credenciales.
- `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` permite que los nodos lean `$env`. Es
  necesario para este workflow; en una instancia compartida, migra **todas** las
  expresiones `$env` a credenciales/valores del workflow y ponlo en `true`.
- Si una API key estuvo expuesta, **rótala** en el proveedor. Reemplazarla en el
  archivo no la invalida.
- No publiques chat IDs, person IDs, credential IDs ni el `instanceId` de tu n8n.

> Este repositorio no contiene secretos en el árbol actual, pero el **historial de
> Git** puede conservar identificadores de versiones anteriores. Revísalo antes de
> publicar un fork o cambiar la visibilidad del repo.

## 3. Exposición de n8n

- Publica n8n **solo por HTTPS**, detrás de Caddy/Nginx/Traefik.
- El compose lo deja en `127.0.0.1:5678`; **no** lo cambies a `0.0.0.0:5678` sin
  TLS y firewall.
- Usa una contraseña fuerte para el usuario de n8n y, si está disponible, 2FA.
- `N8N_PROXY_HOPS=1` asume **un** proxy de confianza. No confíes en cabeceras
  `X-Forwarded-*` si n8n es accesible sin pasar por el proxy.
- Mantén n8n actualizado. El compose fija `2.45.7`; actualiza de forma consciente,
  haz backup del volumen y prueba el workflow después.
- Si usas una instancia multiusuario, aísla este workflow en un proyecto y revisa
  quién puede ver ejecuciones y credenciales.

## 4. Contenido no confiable y SSRF

- El artículo es **contenido no confiable**. El prompt le dice al modelo que ignore
  instrucciones dentro del texto y que no incluya URLs; el nodo **Validar salida IA**
  elimina URLs y limita la longitud.
- No ejecutes código ni comandos a partir del contenido del artículo.
- Firecrawl descarga la URL que recibe el bot. Si tu instancia es sensible, limita
  la salida de red del contenedor o usa un proxy con allowlist.
- La imagen se descarga desde los metadatos del artículo (`og:image`). Una URL
  manipulada podría apuntar a un recurso interno; si te preocupa el SSRF, valida
  el dominio de la imagen o descárgala con una allowlist.
- El fallback de imagen solo se usa si no hay `og:image`; no convierte una URL
  interna en una petición arbitraria por sí solo.

## 5. Errores, logs y datos de ejecución

- El **Error Trigger** avisa por Telegram de fallos no controlados en ejecuciones
  de producción. No se dispara en pruebas manuales.
- Firecrawl y LinkedIn tienen salidas de error específicas; no incluyen secretos
  en los mensajes.
- Las ejecuciones de n8n pueden guardar el artículo y el post. Configura
  `EXECUTIONS_DATA_PRUNE=true` y `EXECUTIONS_DATA_MAX_AGE=168` (7 días) o el
  equivalente en tu instalación.
- No pongas tokens en mensajes de Telegram ni en notas del workflow.

## Check-list rápida

- [ ] `TELEGRAM_CHAT_ID` y `TELEGRAM_USER_ID` configurados; el bot no responde a otros chats
- [ ] `approverIds` limitado a tu usuario
- [ ] `.env` fuera de Git; `.gitignore` activo
- [ ] `N8N_ENCRYPTION_KEY` estable y respaldada
- [ ] n8n solo por HTTPS, puerto 5678 en `127.0.0.1`
- [ ] Contraseña fuerte y 2FA en n8n (si está disponible)
- [ ] `N8N_PROXY_HOPS` correcto para tu proxy
- [ ] Firecrawl/LinkedIn/Telegram tokens en credenciales nativas
- [ ] Claves rotadas si alguna estuvo expuesta
- [ ] Historial de Git revisado antes de publicar
- [ ] `EXECUTIONS_DATA_PRUNE` activo
- [ ] Error Trigger probado con una ejecución de producción

> Sigue con la **[Parte 4 — Costos y curación](04-COSTOS-Y-CURADURIA.md)**.
