# Fiesta Patronal de San Martín de Porres

Invitación digital para el Centro Social San Martin de Porres de Ahuas, basada en el contenido y las ocho fotografías de `src/upload/GRAN FIESTA PATRONAL EN LIMA.pdf`. Conserva el acceso por portada, apertura de invitación, música, cuenta regresiva, programa, imágenes y cierre de la referencia inicial.

```sh
npm run dev
npm run build
npm run preview
```

La portada abre la invitación mediante `#invitacion`. La música comienza en **0:34**; pausar conserva la posición y al finalizar repite desde 0:34. Los botones laterales retroceden o adelantan diez segundos. Después de activar la música aparece un control flotante para pausarla desde cualquier sección.

## Contenido y personalización

`src/fiesta.js` contiene los textos del PDF actualizado, cinco mayordomos, la representante del Centro Social Huancapon, quince donantes con sus aportes, y los nueve actos del programa. Incluye «Rosa ARCE UZURIAGA y esposo» como mayordomía de misa y la degustación del domingo de 08:00 a 10:00. Se conservaron los nombres, importes y las grafías del documento. `src/Patronal.jsx` construye la portada y todas las secciones. `src/patronal.css` define la estructura y `src/folklore.css` aplica la paleta viva solicitada por el cliente: fucsia, rojo, verde, azul y amarillo, inspirada en los trajes y tejidos de las fotografías. Las secciones incorporan una cenefa geométrica vectorial en `public/fiesta/cenefa-folklorica.svg`.

El PDF no indica el año: se usa **2026** porque el 21 de noviembre cae sábado y el 22 domingo, tal como especifica la programación. La cuenta regresiva apunta al primer acto: sábado 21 a las 20:00, hora de Lima.

Las fotografías se extrajeron directamente del PDF y se guardaron en `public/fiesta/`. El botón «Ver ubicación» abre el enlace de Google Maps proporcionado por el cliente: `https://maps.app.goo.gl/eSQvLUycC7xZw6MKA?g_st=aw`. El PDF no contiene teléfono, formulario de confirmación ni video. Si se proporciona una URL de confirmación, asignarla a `fiesta.rsvpUrl` para mostrar el botón correspondiente.

La implementación anterior se conserva en los archivos de referencia de `src/` y las copias de trabajo en `.reference-backup/`. Sus fotografías de aviación se archivaron fuera de `public/` para que no se incluyan en la nueva publicación.
