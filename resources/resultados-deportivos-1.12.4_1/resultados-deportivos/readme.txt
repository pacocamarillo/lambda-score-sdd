=== Resultados de Eventos Deportivos ===

INSTALACIÓN
1. En tu escritorio de WordPress ve a Plugins > Añadir nuevo > Subir plugin.
2. Sube el archivo resultados-deportivos.zip y actívalo.

CÓMO AGREGAR UN RESULTADO
1. En el menú lateral aparecerá "Resultados Deportivos". Da clic en "Agregar resultado".
2. Escribe el título del evento (ej. "Tour Paso Nacional 100K").
3. Elige el "Tipo de resultado": "Resultado individual (carrera)" o "Acumulado". Esto
   decide en qué pestaña aparece (ver "RESULTADOS VS. ACUMULADOS" más abajo). Si no lo
   cambias, queda como individual.
4. Si es individual, llena la "Fecha del evento" y, si quieres, el "Lugar del evento"
   (ambos se muestran dentro de la ventana emergente cuando el resultado tiene un iframe
   configurado). Si eliges "Acumulado", estos dos campos se ocultan porque no aplican.
5. Si quieres, agrega una "Descripción / nota del evento" (opcional, útil sobre todo en
   los acumulados para indicar el periodo que abarcan, por ejemplo "Enero a junio 2026").
6. Si es individual y quieres que se muestre como tabla con el estilo de tu sitio (en vez
   de iframe), llena "Race ID de Webscorer (API)" — ver "INTEGRACIÓN CON LA API DE
   WEBSCORER" más abajo (o usa "IMPORTAR DE WEBSCORER" para no capturar esto a mano). Si
   eliges "Acumulado", en su lugar aparece "Series ID de Webscorer (API)", que funciona
   igual pero para el acumulado/serie completo (ver "INTEGRACIÓN CON LA API DE WEBSCORER
   PARA ACUMULADOS" más abajo). Si no usas la API, llena el "Enlace externo de resultados"
   y/o el "Código iframe (embed)" como antes.
7. En el panel derecho, en "Años", crea o selecciona el año correspondiente (ej. 2026).
8. Publica el resultado. Repite para cada evento.

IMPORTAR CARRERAS DESDE WEBSCORER (evita capturar cada una a mano)
- Requiere tener llenado el API ID y el Token en Resultados Deportivos > Ajustes (ver
  "INTEGRACIÓN CON LA API DE WEBSCORER" abajo).
- Ve a Resultados Deportivos > Importar de Webscorer. Ahí aparece el catálogo completo de
  carreras de tu cuenta (públicas y privadas), con nombre, fecha, deporte y si ya la
  habías importado antes.
- Marca las que quieras traer al sitio y da clic en "Revisar y publicar seleccionadas".
  Se abre una pantalla con esas carreras nada más (nombre y fecha ya llenos, y un campo de
  texto para Lugar y otro para Descripción por cada una, en caso de que quieras agregarlos).
- En esa misma pantalla da clic en "Publicar N resultado(s)" y listo: cada una se crea
  directamente como un "Resultado" PUBLICADO en WordPress, con el título, la fecha, el año
  (se crea el término si no existía), el "Race ID de Webscorer" y el Lugar/Descripción que
  hayas escrito, sin tener que abrir cada una por separado para completarla y publicarla.
- Si todavía no quieres que se vean en el sitio, marca la casilla "Guardar como borrador en
  vez de publicar" antes de darle a ese botón; en ese caso sí quedan como borrador, igual
  que antes, para revisarlas después en Resultados Deportivos > Todos los resultados.
- El botón "Cancelar y volver a la lista" regresa al catálogo sin crear nada.
- Las que ya importaste antes aparecen marcadas "✅ Ya importado" y no se pueden volver a
  seleccionar, así que puedes reentrar a esta pantalla cuando quieras sin duplicar nada.
- El catálogo se guarda en caché unos minutos; si acabas de postear una carrera nueva en
  Webscorer y no aparece todavía, usa el enlace "🔄 Actualizar lista".
- Cada carrera importada también trae ya armado el "Código iframe (embed)" (usando el
  enlace de Webscorer de esa carrera), así que no hace falta escribirlo ni pegarlo a mano.
  Ese iframe queda como respaldo: mientras la API de Webscorer responda bien, se sigue
  mostrando la tabla con el Race ID; si algún día la API falla, el iframe ya está listo
  para usarse en su lugar.
- Nota: Webscorer no ofrece un endpoint para listar los "acumulados"/series de tu cuenta
  (a diferencia de las carreras individuales), así que esta pantalla no puede traerlos
  automáticamente. Los acumulados se siguen armando a mano (iframe, enlace, o como ya los
  tengas calculados).

INTEGRACIÓN CON LA API DE WEBSCORER (para resultados individuales)
- Requiere una cuenta de organizador en Webscorer con suscripción PRO Results activa.
- En Webscorer, genera tu token de API (8 caracteres) en la configuración de tu cuenta de
  organizador, y anota tu API ID (los dígitos al final de la URL de tu página de
  organizador, ej. webscorer.com/organizer/44167 → 44167).
- En tu sitio, ve a Resultados Deportivos > Ajustes y llena "API ID" y "Token API" con
  esos datos. Son privados: solo se usan desde el servidor para consultar a Webscorer,
  nunca se muestran en el sitio público.
- En cada resultado individual, llena "Race ID de Webscorer (API)" con el número de esa
  carrera (el que aparece en la URL de resultados de Webscorer, ej.
  webscorer.com/race?raceid=445535 → 445535).
- Con eso, al hacer clic en ese resultado se muestra una tabla (lugar, dorsal, nombre,
  equipo si aplica, tiempo, diferencia con el líder) armada con el estilo del sitio,
  agrupada por categoría, jalada en vivo de Webscorer — sin necesidad de iframe.
- Si la carrera tiene datos de vuelta por vuelta en Webscorer, cada corredor trae además
  un enlace "Ver vueltas" con el desglose (tiempo de cada vuelta, lugar en esa vuelta,
  tiempo y lugar acumulados). Si la carrera no maneja vueltas, esa columna simplemente no
  aparece.
- Si por alguna razón Webscorer no responde (credenciales incorrectas, sin conexión, la
  carrera no existe), el plugin usa automáticamente el iframe o el enlace externo de ese
  resultado como respaldo, si los tienes configurados. Por eso puedes dejarlos puestos
  aunque uses el Race ID.
- Los datos se guardan en caché unos minutos para no golpear la API en cada visita a la
  página; si la carrera está en vivo, la tabla se actualiza sola cada pocos minutos.
- En Resultados Deportivos > Todos los resultados, la columna "Webscorer" muestra un ✅ y
  el Race ID en los resultados que ya usan esta integración.

INTEGRACIÓN CON LA API DE WEBSCORER (para acumulados / series)
- Requiere el mismo API ID y Token API de Resultados Deportivos > Ajustes que se usan para
  las carreras individuales (ver arriba).
- En un resultado con "Tipo de resultado" = "Acumulado", llena "Series ID de Webscorer
  (API)" con el número de esa serie (el que aparece en la URL del acumulado en Webscorer,
  ej. webscorer.com/seriesresult?seriesid=427927 → 427927).
- Con eso, al hacer clic en ese acumulado se muestra una tabla con el estilo del sitio
  (lugar, nombre, equipo si aplica, carreras contadas y puntos totales), agrupada por
  categoría, jalada en vivo de Webscorer — sin necesidad de iframe.
- Cada corredor tiene un enlace "Ver carreras" que despliega el detalle carrera por
  carrera (etapa, lugar, puntos y tiempo de cada una), con la etapa enlazada a su página
  de resultados en Webscorer.
- Igual que con las carreras individuales, si Webscorer no responde (credenciales
  incorrectas, sin conexión, la serie no existe), el plugin usa automáticamente el iframe
  o el enlace externo de ese acumulado como respaldo, si los tienes configurados.
- Nota: a diferencia de las carreras, Webscorer no ofrece un endpoint para listar todas
  tus series, así que el Series ID se captura a mano en cada acumulado (no aparece en
  "Importar de Webscorer").

RESULTADOS VS. ACUMULADOS
- En la página donde uses el shortcode o el widget, ahora aparecen dos pestañas arriba:
  "Resultados" y "Acumulados". Cada una tiene su propio selector de años y su propia
  lista, igual que antes.
- Un resultado aparece en "Resultados" o en "Acumulados" según lo que hayas elegido en el
  campo "Tipo de resultado" de ese resultado.
- En Resultados Deportivos > Todos los resultados puedes filtrar el listado por tipo con
  el desplegable "Todos los tipos" que aparece arriba de la tabla, y hay una columna
  "Tipo" para verlo de un vistazo.
- Si tienes muchos resultados ya publicados de antes de esta versión, todos se siguen
  mostrando en la pestaña "Resultados" (no se pierden ni cambian de lugar); solo edítalos
  y cambia el "Tipo de resultado" a "Acumulado" si en realidad son un acumulado.
- Los acumulados no requieren fecha ni lugar; dentro de cada año se ordenan por título.
  Los resultados individuales sí requieren fecha y se ordenan del más reciente al más
  antiguo.

CÓMO PERSONALIZAR LA VENTANA EMERGENTE (LOGOTIPO)
- Ve a Resultados Deportivos > Ajustes.
- Da clic en "Seleccionar imagen" y elige o sube tu logotipo desde la biblioteca de medios
  de WordPress. Se recomienda una imagen horizontal (por ejemplo PNG con fondo transparente)
  de no más de 300px de ancho.
- Guarda los cambios. El logotipo aparecerá en la cabecera de la ventana emergente de todos
  los resultados que usen iframe, junto con el título, la fecha, el lugar y la descripción
  que hayas capturado en cada resultado, y también en los certificados de participación en
  PDF (ver "CERTIFICADOS DE PARTICIPACIÓN" más abajo) si no hay un "Logotipo para fondo
  oscuro" configurado.
- "Logotipo para fondo oscuro" (opcional, debajo del campo anterior): el certificado de
  participación tiene una banda azul marino arriba. Si tu logotipo normal tiene texto
  oscuro (como suele ser), se ve mal ahí (o se le pone un recuadro blanco detrás, que no
  siempre se ve bien). Sube aquí una versión de tu logotipo en blanco o en colores claros,
  con fondo transparente (PNG), pensada para verse sobre ese azul marino, y el certificado
  la usará directamente ahí, sin ningún recuadro. Si tu logotipo original es un archivo
  vectorial editable (.ai, .eps, .svg), pídele a quien te lo diseñó una versión "para fondo
  oscuro" en blanco; si no tienes forma de generarla, dinos y podemos ayudarte a partir del
  archivo original.

CÓMO MOSTRARLO EN UNA PÁGINA
- Con Elementor: edita la página con Elementor, busca el widget "Resultados Deportivos"
  en el panel de widgets y arrástralo a la página. Puedes editar el título desde el panel
  de contenido del widget.
- Con Sitejet, el editor de bloques de WordPress, o cualquier constructor que soporte
  shortcodes: agrega un bloque/elemento de tipo "shortcode" o HTML y pega:

  [resultados_deportivos]

  Para cambiar el título que aparece arriba, o el texto de las pestañas:

  [resultados_deportivos titulo="Resultados" etiqueta_resultados="Resultados" etiqueta_acumulados="Acumulados"]

CÓMO SE VE
- Arriba aparecen dos pestañas: "Resultados" y "Acumulados". Se abre "Resultados" por
  defecto.
- Dentro de cada pestaña, a la izquierda aparece un botón por cada año que tenga
  resultados cargados de ese tipo, ordenados del más reciente al más antiguo.
- A la derecha aparece la lista de resultados de ese año (fecha - nombre del evento).
- Al dar clic sobre cualquier resultado, se abre en una pestaña nueva la URL externa que
  hayas guardado en ese resultado (por ejemplo la página de Chrono Laguna Sports con la
  tabla de tiempos), o la ventana emergente si el resultado tiene un iframe configurado.
- Al dar clic en otro año, la lista de la derecha cambia para mostrar los resultados de
  ese año.

CERTIFICADOS DE PARTICIPACIÓN (PDF)
- Disponible en cualquier "Resultado" (individual o acumulado) que use la integración
  con la API de Webscorer (Race ID o Series ID). Se genera al vuelo, en PDF, con los
  mismos datos que ya trae esa conexión: nombre, categoría, dorsal, tiempo y lugar
  obtenido en carreras individuales; nombre, categoría, lugar en el acumulado, carreras
  contadas y puntos en acumulados. No requiere ninguna librería ni configuración
  adicional, y usa el mismo logotipo configurado en Resultados Deportivos > Ajustes.
- Nota importante: Webscorer no incluye correo electrónico ni ningún otro dato de
  contacto en su API, así que esto es para que cada quien descargue/imprima su propio
  certificado bajo demanda; no envía nada por correo automáticamente.
- Forma 1 — desde la tabla de resultados: cuando un resultado usa la API de Webscorer
  (la tabla con el estilo del sitio, no el iframe), ahora aparece una columna
  "Certificado" con un enlace "Imprimir certificado" en cada fila. Se abre en una pestaña
  nueva, listo para imprimir o guardar como PDF desde el navegador.
- Forma 2 — buscador público: agrega el shortcode

  [certificado_deportivo]

  en cualquier página. Muestra un formulario donde el competidor elige el evento (de
  entre los que ya tienen Race ID o Series ID de Webscorer) y escribe su dorsal o su
  nombre; el plugin busca la coincidencia y ofrece el botón "Imprimir certificado". Si
  hay varias coincidencias por nombre (nombres repetidos), se listan todas para que
  elija la correcta.
- El diseño del certificado (carta horizontal, con marco, una banda azul marino arriba
  con el nombre y el logotipo, franja dorada, y debajo una lista de datos tipo ficha:
  nombre de la carrera, fecha, lugar, equipo, dorsal, distancia, categoría, tiempo y
  lugar obtenido, con renglones alternados y el lugar 1-2-3 resaltado en
  dorado/plata/bronce) es fijo por ahora. Cualquier dato que venga vacío en Webscorer
  (o "NOTEAM" en Equipo) se omite en vez de mostrarse en blanco.
- El logotipo que se ve en la banda azul marino del certificado es el que subiste en
  "Logotipo para fondo oscuro" (Resultados Deportivos > Ajustes), si lo configuraste; si
  no, usa el "Logotipo" normal sobre una tarjeta blanca. Ver "CÓMO PERSONALIZAR..." abajo.

NOTAS
- Puedes editar o borrar cualquier resultado desde Resultados Deportivos > Todos los
  resultados, igual que con cualquier entrada de WordPress.
- Los años se administran como una taxonomía, así que puedes reordenarlos o renombrarlos
  desde Resultados Deportivos > Años.
- Orden de prioridad para un resultado individual: primero "Race ID de Webscorer (API)"
  (si Webscorer responde bien), luego "Código iframe (embed)", y por último "Enlace
  externo de resultados". El plugin usa el primero que funcione. Para un acumulado, el
  mismo orden aplica cambiando "Race ID" por "Series ID de Webscorer (API)".

CHANGELOG
1.12.4
- El pie del certificado ahora muestra una sola línea centrada que dice "Comité
  Organizador" (antes eran dos líneas: "Organización" y la fecha). Nuevo campo "Firma
  (comité organizador)" en Resultados Deportivos > Ajustes: si subes ahí una imagen de
  una firma, se dibuja arriba de esa línea; si no subes nada, el certificado solo muestra
  la línea y el texto, sin firma.
- Corrección interna: el generador de PDF ahora soporta varias imágenes distintas en el
  mismo certificado (logotipo + firma a la vez) sin que una se sobreponga a la otra.
1.12.3
- Nuevo campo "Logotipo para fondo oscuro" en Resultados Deportivos > Ajustes: sube ahí
  una versión de tu logotipo en blanco/colores claros con fondo transparente, y el
  certificado la usa directamente sobre la banda azul marino, sin ningún recuadro
  blanco detrás. Si no subes nada ahí, el certificado sigue usando el logotipo normal
  sobre una tarjeta blanca, como antes.
1.12.2
- El certificado de participación ahora tiene más color: la parte de arriba (nombre y
  logotipo) va sobre una banda azul marino con una franja dorada debajo, la lista de
  datos tiene renglones alternados (zebra) para que se lea mejor, y el "Lugar obtenido"
  se resalta en dorado/plata/bronce cuando es 1°, 2° o 3° lugar.
1.12.1
- El certificado de participación cambió su diseño de "diploma" a una ficha tipo la
  página de resultados de Webscorer: nombre arriba a la izquierda, logotipo arriba a la
  derecha, y debajo la lista de datos (nombre de la carrera, fecha, lugar, equipo,
  dorsal, distancia, categoría, tiempo, lugar obtenido) en español. La fecha ahora se
  muestra en formato largo en español (ej. "30 de agosto de 2026") en vez de "dd/mm/aaaa".
1.12.0
- Nuevo: certificados de participación en PDF, generados al vuelo con los datos de la
  API de Webscorer (nombre, categoría, dorsal/tiempo/lugar en carreras individuales;
  nombre, categoría, lugar/carreras contadas/puntos en acumulados). No agrega ninguna
  dependencia externa al plugin.
- En la tabla de resultados que usa la API de Webscorer, cada fila tiene ahora un enlace
  "Imprimir certificado".
- Nuevo shortcode [certificado_deportivo]: buscador público donde el competidor elige el
  evento y escribe su dorsal o su nombre para obtener su certificado.
1.11.1
- Los años activos (en "Resultados" y "Acumulados") y los encabezados de mes/año dentro
  de "Todos" ahora usan el rojo de la marca (#CC3366) en vez del azul marino. El color
  vive en la variable CSS --rd-accent (arriba del todo en assets/css/style.css) por si
  se quiere ajustar más adelante.
1.11.0
- En la pestaña "Resultados", dentro de cada año ahora se agrupan las carreras por mes
  (ej. "Agosto", "Julio"...), con un encabezado entre cada grupo — mismo concepto que ya
  se usaba para los años dentro de "Todos" en Acumulados. También aplica dentro de
  "Todos" cuando se usa en resultados individuales: primero se agrupa por año y, dentro
  de cada año, por mes.
1.10.1
- Corrección: dentro de la pestaña "Acumulados", el término "Todos" (el que se usa para
  ver todos los años juntos en una sola lista) ahora acomoda los resultados por año, del
  más reciente al más antiguo, con un encabezado de año entre cada grupo. Antes se
  mostraban en una sola lista sin ningún orden por año.
1.10.0
- Se rediseñó el flujo de "Importar de Webscorer" para que sea más rápido: en vez de crear
  las carreras seleccionadas directamente como borrador (con que había que ir a buscar cada
  una, completarla y publicarla a mano), ahora se abre primero una pantalla de revisión con
  solo las carreras marcadas, donde puedes agregar Lugar/Descripción, y un botón para
  publicarlas todas de un jalón. Sigue existiendo la opción de guardarlas como borrador si
  prefieres revisarlas después, marcando la casilla correspondiente antes de publicar.
1.9.0
- Arriba de cada tabla de resultados (individuales y acumulados) se agregaron los
  botones "Ganadores", "Top 3" y "Resultados completos", igual que en las páginas
  normales de resultados de Webscorer. Filtran al instante las filas de todas las
  categorías sin recargar la página.
- En cada categoría, los primeros 3 lugares ahora se muestran en negritas.
1.8.1
- Corrección: el desglose "Ver vueltas" ahora solo aparece cuando la carrera realmente
  tiene más de una vuelta; en carreras/categorías de una sola vuelta (donde el tiempo por
  vuelta es el mismo que el tiempo total) esa columna ya no se muestra.
- Cada categoría de la tabla de resultados (individuales y acumulados) ahora se puede
  plegar o desplegar por separado dando clic en su título. Cuando hay más de una
  categoría, arriba aparecen los enlaces "Expandir todas" / "Contraer todas" para
  hacerlo de un solo clic.
1.8.0
- En los resultados individuales que usan "Race ID de Webscorer (API)", cuando la carrera
  tiene datos de vuelta por vuelta, ahora aparece una columna "Vueltas" con un desplegable
  "Ver vueltas" por corredor: tiempo de cada vuelta, lugar en esa vuelta, tiempo acumulado
  y lugar acumulado. Si la carrera no tiene ese detalle (por ejemplo, carreras de un solo
  tramo), la columna no aparece y todo se ve exactamente igual que antes.
1.7.1
- En Resultados Deportivos > Importar de Webscorer, se agregó también el botón
  "Importar seleccionadas" junto a "Seleccionar todo" / "Quitar selección" arriba de la
  tabla, para no tener que bajar hasta el final cuando el catálogo tiene muchas carreras.
- El widget de Elementor ahora se registra enganchándose directamente a la acción
  "elementor/loaded" en lugar de revisarla dentro de "plugins_loaded", para que aparezca
  siempre sin importar el orden en que WordPress cargue los plugins.
1.7.0
- Se agregó integración con la API JSON de Webscorer para acumulados/series (el mismo
  mecanismo que ya existía para carreras individuales, pero con "Series ID de Webscorer"):
  el acumulado se muestra como una tabla con el estilo del sitio (lugar, nombre, equipo,
  carreras contadas y puntos), agrupada por categoría, con un detalle desplegable "Ver
  carreras" por corredor (etapa, lugar, puntos y tiempo de cada carrera).
- Igual que en individuales, si la API falla el acumulado cae automáticamente al iframe o
  al enlace externo configurados.
- El campo "Series ID de Webscorer (API)" solo aparece cuando el "Tipo de resultado" es
  "Acumulado" (y "Race ID de Webscorer" solo cuando es "Individual").
- La columna "Webscorer" en Resultados Deportivos > Todos los resultados ahora también
  muestra el Series ID en los acumulados que usan esta integración.
1.6.1
- Al importar desde Webscorer, ahora también se arma automáticamente el "Código iframe
  (embed)" de cada carrera (a partir de su enlace de Webscorer), como respaldo por si la
  API llega a fallar. Ya no hace falta escribirlo ni pegarlo a mano.
1.6.0
- Nueva pantalla Resultados Deportivos > Importar de Webscorer: trae el catálogo completo
  de carreras de tu cuenta (endpoint /json/mypostedraces) y permite crear, para las que
  marques, un "Resultado" en WordPress como borrador con título, fecha, año y Race ID ya
  llenos, en vez de capturar cada uno a mano.
- La pantalla evita duplicados (marca las que ya se habían importado) y tiene un enlace
  para refrescar el catálogo cuando publiques una carrera nueva en Webscorer.
1.5.0
- Se agregó integración con la API JSON de Webscorer para resultados individuales: con
  un "Race ID de Webscorer" configurado, el resultado se muestra como una tabla con el
  estilo del sitio en vez de un iframe, jalada en vivo desde Webscorer.
- Nueva sección en Resultados Deportivos > Ajustes para guardar el API ID y el Token de
  Webscorer (privados, uso interno del servidor).
- Si la API falla por cualquier motivo, el resultado cae automáticamente al iframe o al
  enlace externo configurados, si existen.
- Nueva columna "Webscorer" en Resultados Deportivos > Todos los resultados.
1.4.0
- Los acumulados ya no requieren fecha ni lugar del evento: esos dos campos se ocultan
  automáticamente en el formulario al elegir "Acumulado", y ya no es necesario llenar la
  fecha para que un acumulado aparezca en su pestaña (antes se quedaba fuera si no tenía
  fecha).
- Dentro de la pestaña "Acumulados", los resultados de cada año se ordenan por título en
  lugar de por fecha.
1.3.0
- Se agregó el campo "Tipo de resultado" (Individual / Acumulado) a cada resultado.
- La página donde se usa el shortcode o el widget ahora muestra dos pestañas,
  "Resultados" y "Acumulados", cada una con su propio selector de años.
- Se agregó un filtro por tipo y una columna "Tipo" en Resultados Deportivos > Todos
  los resultados.
- Se agregaron los atributos "etiqueta_resultados" y "etiqueta_acumulados" al shortcode,
  y sus equivalentes en el widget de Elementor, para personalizar el texto de las pestañas.
1.2.1
- Corrección: el botón "Seleccionar imagen" de Resultados Deportivos > Ajustes no abría
  la biblioteca de medios en algunos sitios porque el script correspondiente no se estaba
  cargando en esa pantalla. Ya está corregido.
1.2.0
- Se agregó Resultados Deportivos > Ajustes para subir un logotipo que aparece en la
  cabecera de la ventana emergente del iframe.
- Se agregaron los campos opcionales "Lugar del evento" y "Descripción / nota del evento",
  que se muestran dentro de la ventana emergente junto con la fecha.
1.1.0
- Versión inicial con soporte de iframe embebido en ventana emergente.
