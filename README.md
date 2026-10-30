# Invitación digital

Estructura de la referencia de Minvitly implementada con React y Vite. Imágenes, tipografías, audio y video se sirven localmente.

```sh
npm run dev
npm run build
npm run preview
```

La portada abre la invitación mediante `#invitacion`. La música comienza en **0:34**; pausar conserva la posición y al finalizar repite desde 0:34. Los botones laterales retroceden o adelantan diez segundos. El video se reproduce sin sonido cuando entra en pantalla y se pausa al salir.

## Personalización pendiente

`src/event.js` centraliza fecha, inicio del audio, título, colores, formulario, video y sustituciones de imágenes y textos. `src/invitation.json` contiene las posiciones, proporciones, saltos de línea y recursos de todas las secciones: portada, presentación y música, anfitrión, fecha y cuenta regresiva, primera galería, cronograma y vestimenta, segunda galería, confirmación, video y cierre.

La fecha, textos e imágenes actuales son los de la referencia, a la espera del material del cliente. La fecha original ya pasó, por lo que el contador muestra cero. El botón de confirmación abre un aviso local; establecer `rsvpUrl` cuando se entregue el formulario o WhatsApp definitivo. No envía información ni lleva al formulario del evento original.

Para sustituir imágenes, guardarlas en `public/cliente/` y asignar en `images` el id correspondiente de `invitation.json` con la ruta `/cliente/archivo.jpg`. Los textos se sustituyen en `text` usando los mismos ids. Las imágenes que incluyen texto, como el cronograma, también deben reemplazarse con el material del cliente.

Los archivos anteriores se conservaron en `.reference-backup/`.
