# Encuesta de atención ciudadana — MPLP

Frontend Angular 21.2.21. Conserva el diseño del prototipo y utiliza FastAPI
y MySQL mediante la ruta relativa `/api/v1/public`. Ya no envía datos a Apps Script.

## Ejecutar en desarrollo

Primero iniciar el backend en el puerto 8000 siguiendo su README.
Desde `mplp_atencionciudadano`:

~~~powershell
npm ci
npm start
~~~

Abrir `http://localhost:4200`. El proxy `proxy.conf.json` envía `/api/**`
al backend local. No poner credenciales de MySQL en Angular.

## Flujo actual

Bienvenida → selección de área → calificación → confirmación.

Las áreas se consultan en MySQL. Se utiliza `areaId`, no el nombre, para la
selección. Este bloque registra el canal como `qr_general`. Los QR por área y la
identificación de otros enlaces quedan para una etapa posterior.

El primer envío genera un UUID y conserva la solicitud en sessionStorage.
Ante una respuesta incierta, se bloquea la edición y se permite reintentar el
mismo contenido. Una recarga o volver al inicio recupera el envío pendiente.
Solo se muestra la confirmación después de recibir la respuesta correspondiente
de la API. Los rechazos definitivos permiten corregir la solicitud.

Se requiere almacenamiento temporal del navegador para preparar un envío.
Esto no identifica a una persona ni impide enviar encuestas nuevas; no sustituye
los futuros limitadores contra abuso.

## Probar desde un celular en la misma red

~~~powershell
npm start -- --host 0.0.0.0
~~~

Abrir `http://IP_LOCAL_DE_LA_PC:4200` desde el celular. FastAPI puede permanecer
en `127.0.0.1:8000` porque el proxy corre en la PC. Si el firewall bloquea el
acceso, autorizar únicamente el puerto de desarrollo en la red privada.
No exponer este servidor de desarrollo a Internet.

El generador de UUID incluye un fallback con crypto.getRandomValues para HTTP
de red local. El despliegue público deberá utilizar HTTPS.

## Verificaciones

~~~powershell
npm run build
$env:CHROME_BIN = "C:\Program Files\Google\Chrome\Application\chrome.exe"
npm test -- --watch=false --browsers=ChromeHeadless
~~~

Las pruebas de navegador usan Chrome instalado, FastAPI y MySQL locales.
Instalar también `requirements-dev.txt` en el backend. Playwright reutiliza los
servidores de 8000 y 4200 si ya están activos; si no, inicia procesos temporales.

~~~powershell
$env:MPLP_RUN_E2E = "1"
npm run test:e2e
~~~

Se comprueban escritorio y vista móvil: guardado real, pérdida de respuesta
después del guardado, recarga y reintento sin duplicados, recuperación de la carga
de áreas y protección de la pantalla de confirmación. Solo se eliminan las
respuestas con los UUID y comentarios exclusivos de cada prueba.

Las capturas y trazas quedan en `test-results/`, excluido de Git.
En producción, el servidor web deberá reenviar `/api` a FastAPI y servir
`index.html` para las rutas de Angular; el proxy de ng serve no forma parte
del build.

No se modificó el dashboard. Autenticación, permisos y limitadores quedan para
bloques posteriores; no se incorporó CAPTCHA ni Turnstile.

## Coherencia entre estrellas y dudas

Al elegir 5 estrellas se selecciona **Sí** automáticamente en “¿El personal resolvió tus dudas?” y la pregunta queda bloqueada mientras se mantenga esa puntuación. Con 1 estrella se selecciona **No** del mismo modo. Para 2, 3 o 4 estrellas ambas opciones quedan habilitadas. FastAPI y MySQL validan también la regla para impedir combinaciones contradictorias fuera de la interfaz.

