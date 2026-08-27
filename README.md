# Extractor TUSNE: PDF escaneado a Excel

Este repositorio conserva la aplicación Angular existente y añade un extractor Python independiente. Su único alcance es procesar TUSNE.pdf, ejecutar OCR local y crear un Excel auditable; no incluye base de datos, API, RAG ni chatbot.

## Requisitos

- Windows 10 u 11 de 64 bits.
- Python 3.11 de 64 bits (recomendado).
- Al menos 4 GB libres para el entorno, los modelos OCR y las imágenes temporales.
- Conexión a Internet sólo en la primera instalación y descarga de modelos. El procesamiento posterior es local.

Las versiones verificadas son PaddlePaddle 3.3.1 y PaddleOCR 3.7.0. La implementación usa PaddleOCR.predict() y los campos rec_texts, rec_scores y rec_polys de la API 3.x.

## Instalación en Windows

Abra PowerShell en la raíz:

~~~powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install paddlepaddle==3.3.1 -i https://www.paddlepaddle.org.cn/packages/stable/cpu/
python -m pip install -r requirements.txt
~~~

El primer OCR descarga los modelos de español/alfabeto latino. Si Hugging Face no está accesible, pruebe:

~~~powershell
$env:PADDLE_PDX_MODEL_SOURCE = "BOS"
~~~

No se necesita GPU. Para una GPU compatible, instale la variante de PaddlePaddle correspondiente y use python main.py --device gpu:0.

## Ejecución

Coloque TUSNE.pdf en la raíz y ejecute:

~~~powershell
python main.py
~~~

Calibración rápida con páginas 2, 12, 16 y 24:

~~~powershell
python main.py --sample
~~~

Selecciones explícitas:

~~~powershell
python main.py --pages 1-5,12,24
~~~

## Archivos generados

- output/TUSNE_extraido.xlsx: libro final.
- output/raw_ocr.json: texto raw, confianza, coordenadas, página, fila y columna.
- output/extraction.log: progreso, errores por página y totales.
- output/pages/page_001.png: páginas renderizadas a 300 DPI.
- output/processed/page_001.png: páginas orientadas con contraste moderado.
- output/debug/page_001_table.png: región y líneas de tabla detectadas.

Una página defectuosa no cancela el resto. El error queda en el log, el JSON y la hoja revision.

## Hojas del Excel

- servicios: una fila por servicio, con código raw y normalizado.
- requisitos: lista numerada o literal relacionada por servicio_id.
- tarifas: una fila por detalle/tarifa; varias tarifas pueden apuntar al mismo servicio.
- revision: incidencias de confianza, números no convertibles y problemas estructurales.
- vista_plana: vista que repite denominación y requisitos para cada tarifa.

Los campos precio_raw y porcentaje_uit_raw nunca se sustituyen. Si aparece 28.G0, el valor numérico queda vacío y el registro se marca para revisión.

## Configuración

Las opciones centrales están en tusne_extractor/config.py:

~~~python
DPI = 300
DEFAULT_ROTATION = 90  # antihoraria
OCR_LANGUAGE = "es"
OCR_MIN_CONFIDENCE = 0.80
SAVE_DEBUG_IMAGES = True
~~~

La rotación y el umbral también pueden cambiarse sin editar:

~~~powershell
python main.py --rotation 90
python main.py --ocr-min-confidence 0.85
~~~

## Revisión humana

1. Abra output/TUSNE_extraido.xlsx.
2. Revise primero la hoja revision, filtrando por página y campo.
3. Compare valor_detectado con output/pages/page_NNN.png o con el PDF.
4. Corrija servicios, requisitos o tarifas; vista_plana es sólo una vista.
5. Revise especialmente códigos, porcentajes y precios con raw pero sin valor numérico.

## Pruebas

~~~powershell
python -m pytest
~~~

Las pruebas cubren normalización conservadora, numeración y la relación de varias tarifas con un solo servicio.

## Aplicación Angular existente

La documentación original se conserva en README_ANGULAR.md. El frontend permanece en src/:

~~~powershell
npm start
npm test
npm run build
~~~
