# cala.studio · Backend de reservas (Supabase)

Sistema de reservas real: plazas que se restan de verdad para todos, lista de
espera, login opcional y email al dueño en cada reserva. **Aforo = 8** por clase.

El frontend sigue siendo estático; Supabase pone la base de datos, el login y el
envío de email. Sigue estos pasos **una vez**.

---

## 1. Crear el proyecto Supabase
1. Entra en <https://supabase.com> → **New project** (plan gratuito).
2. Cuando esté listo: **Project Settings → API** y copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
3. Crea el archivo `.env` en la raíz del proyecto (copia de `.env.example`) y pega esos dos valores.
   > Son claves públicas: no pasa nada porque acaben en el frontend. La seguridad la dan las políticas RLS.

## 2. Crear las tablas y la lógica
En el panel de Supabase → **SQL Editor** → pega y ejecuta, en orden:
1. `migrations/0001_schema.sql`  (tablas + tipos de clase)
2. `migrations/0002_rpc_rls.sql`  (vista de disponibilidad + reservar/cancelar + seguridad)
3. `migrations/0003_seed_sessions.sql`  (genera las clases Mar/Jue hasta el 31 ago 2026)
4. `migrations/0004_reconcile.sql` · `0005_admin.sql` · `0006_admin_guests.sql`  (panel de aforo + PIN)
5. `migrations/0007_admin_payments.sql`  (registro de pagos: quién debe / quién ha pagado y el qué)
6. `migrations/0008_waitlist.sql`  (lista de espera: la gente se apunta sola cuando la clase está completa + alta manual en gestión)
7. `migrations/0009_agosto_flow.sql`  (modalidad Flow + grupos nuevos de lunes y miércoles en agosto)
8. `migrations/0010_eventos_agotado.sql`  (los eventos entran en el calendario y en gestión · botón de "completo" · email en la lista de espera)
9. `migrations/0011_bonos_recuperaciones.sql`  (bonos: quién gasta qué clase y cuántas le quedan · recuperaciones pendientes · mueve Pilates & Wine al 15 de agosto)
10. `migrations/0012_lunes_miercoles_invertidos.sql`  (lunes y miércoles pasan a Sculpt 9:00 · Flow 10:00, salvo el lunes 10 de agosto)
11. `migrations/0013_cambiar_pin.sql`  (botón de "Cambiar PIN" dentro del panel)
12. `migrations/0014_compras_paquetes.sql`  (compras de paquetes de clases online — ver *Pagos online* más abajo)
13. `migrations/0015_eventos_pago.sql`  (reservar plaza en un evento pagando online — ver *Pagos online* más abajo)
14. `migrations/0016_clase_videos.sql`  (los vídeos de las clases de pago salen del código de la web: los guarda la base de datos y solo se los da a quien ha comprado)

*Comprobación:* `select count(*) from class_sessions;` debe devolver un número > 0.

> El **PIN** del panel se fija una vez (ver comentario en `0005_admin.sql`):
> `insert into public.admin_settings (id, pin) values (1, 'TU-PIN') on conflict (id) do update set pin = excluded.pin;`
> A partir de la 0013 se cambia desde el propio panel con el botón **Cambiar PIN**;
> ese SQL queda solo para el caso de quedarte fuera. Vale con letras o solo con
> números — el campo abre el teclado completo del móvil. Si lo pones numérico,
> ponle 6 cifras o más: el PIN viaja a una API pública y uno de 4 se acierta probando.

## 3. Activar el login por email (magic link)
**Authentication → Providers → Email**: deja activado **Email**.
**Authentication → URL Configuration → Site URL**: pon tu dominio de producción
(y añade `http://localhost:5173` en *Redirect URLs* para desarrollo).

## 4. Email al dueño en cada reserva (Resend)
1. Crea cuenta en <https://resend.com> y una **API Key**.
   - Para empezar puedes usar el remitente de pruebas `onboarding@resend.dev`.
   - Para producción, verifica tu dominio y define `FROM_EMAIL` (ej. `reservas@tudominio.com`).
2. Despliega la función y sus secretos (necesitas la [CLI de Supabase](https://supabase.com/docs/guides/cli)):
   ```bash
   supabase login
   supabase link --project-ref TU-REF-DE-PROYECTO
   supabase functions deploy notify-booking
   supabase secrets set RESEND_API_KEY=re_xxx OWNER_EMAIL=tu@email.com
   # opcional, si verificas dominio:  FROM_EMAIL="cala.studio <reservas@tudominio.com>"
   ```
3. **Database → Webhooks → Create a new hook**:
   - Tabla: `bookings` · Evento: **INSERT**
   - Tipo: **Supabase Edge Functions** → `notify-booking`
   - Guardar. A partir de ahí, cada reserva te manda un email.

## 5. Producción (Vercel)
En el proyecto de Vercel → **Settings → Environment Variables** añade
`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (los mismos del `.env`). Redeploy.

---

## Qué me tienes que pasar a mí (para conectar el frontend)
- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (paso 1).
- Con eso conecto el calendario en vivo, el flujo de reserva y el login.
- El `RESEND_API_KEY` y el `OWNER_EMAIL` van solo en los secretos de la función (paso 4): **nunca en el frontend**, así que esos configúralos tú en Supabase.

## Eventos (Pilates & Wine y los que vengan)
- Cada evento vive en `class_sessions` con `category = 'evento'` y un **`evento_slug`**
  igual al de su página (`#/evento/<slug>`). Ese slug es lo que ata la página al calendario:
  la página lee de ahí si quedan plazas y a qué lista de espera apunta a la gente.
- **Plazas:** se cambian desde el panel (`#/gestion` → abre el evento → *Plazas*). El evento
  de agosto arranca con 12 hasta que decidas el número.
- **Marcar como completo:** en ese mismo panel, *Marcar como completo*. En la web desaparece el
  botón de reservar, sale **Agotado** y quien entre deja nombre y apellidos, teléfono y email.
  Esos contactos salen en el panel bajo *Lista de espera* (con `→ A la clase` si liberas plaza).
  Se reabre cuando quieras con *Reabrir reservas*.
- **Añadir un evento nuevo:** copia el bloque final de `0010_eventos_agotado.sql` cambiando
  título, fecha y `evento_slug`, y añade su ficha a `EVENTOS` en `src/data.js` con el mismo slug.
  Si es de pago, pon además su precio en `functions/_shared/catalogo.js` (ver *Pagos online*).

## Bonos y recuperaciones (pestañas del panel)
- **Bonos:** das de alta el bono de cada persona (el nº de clases se rellena solo al
  elegirlo del catálogo) y, cada vez que viene, le restas una con *Gastar clase hoy*.
  Cada clase gastada queda apuntada con su fecha en *Ver clases*, donde también puedes
  añadir una de otro día o deshacer un apunte. El bono baja solo a *Terminados* al llegar a cero.
- **Recuperar:** apuntas a quien se queda sin su clase (por defecto *cambio de horario*)
  con el día que pierde, y lo marcas como recuperado el día que la hace.
- Las dos cosas van por RPC con el PIN del panel; las tablas no se leen desde el navegador.

## Pagos online: paquetes y eventos (Stripe)
En la web se cobran dos cosas, las dos con tarjeta en **Stripe Checkout**:
- **Paquetes de clases en vídeo** (`#/paquete/<slug>`). Hace falta cuenta (email + contraseña,
  se crea en la propia ficha del paquete); la compra queda ligada a ella y le abre las clases
  en cualquier dispositivo.
- **Plazas de eventos** (`#/evento/<slug>`). Sin cuenta: paga y queda apuntada sola en la lista
  del evento, la misma que ves en `#/gestion`.

### Ponerlo en marcha (una vez)
1. **Tablas** — SQL Editor → pega y ejecuta, en este orden, `migrations/0014_compras_paquetes.sql`,
   `migrations/0015_eventos_pago.sql` y `migrations/0016_clase_videos.sql`.
2. **Cuentas sin correo de confirmación** — **Authentication → Providers → Email** → apaga
   **Confirm email**. Así, al crear la cuenta la sesión queda abierta al momento y no hay que
   enviar ningún email (el correo de Supabase no sirve para clientas reales sin dominio propio).
   Con ese ajuste encendido, quien se registra se queda esperando un correo que no llega.
3. **Stripe** — crea la cuenta en <https://stripe.com> y empieza en **modo de prueba**:
   *Developers → API keys* → copia la **Secret key** (`sk_test_…`).
4. **Función de pago** (con la [CLI de Supabase](https://supabase.com/docs/guides/cli); si no la
   tienes instalada, pon `npx` delante de cada comando):
   ```bash
   supabase login
   supabase link --project-ref TU-REF-DE-PROYECTO
   supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx SITE_URL=https://tu-web.com
   supabase functions deploy pagos --no-verify-jwt
   ```
   - `SITE_URL` es la dirección de la web: a donde Stripe devuelve a la gente al terminar.
     Si hay más de una (con y sin `www`), van separadas por comas. En `localhost` funciona sin añadir nada.
   - `--no-verify-jwt` hace falta: a la función la llama también Stripe, que no trae token de Supabase.
5. **Webhook** — el aviso que Stripe manda a la web cada vez que alguien paga:
   1. En Stripe: *Developers → Webhooks → Add destination* (en algunas cuentas, *Add endpoint*).
   2. Eventos a escuchar: `checkout.session.completed` y `checkout.session.async_payment_succeeded`.
   3. Destino *Webhook endpoint*, con esta URL:
      `https://TU-REF-DE-PROYECTO.supabase.co/functions/v1/pagos`
   4. Al crearlo, Stripe enseña su **Signing secret** (`whsec_…`). Guárdalo y redespliega:
      ```bash
      supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
      supabase functions deploy pagos --no-verify-jwt
      ```
6. **Correo de confirmación a quien paga** — lo envía Stripe, no hace falta dominio ni servicio de
   correo: *Settings → Business → Customer emails* → activa **Successful payments**. A cada persona le
   llega el recibo con lo que ha comprado (en los eventos, el nombre del evento con su día y hora).
   Para que Stripe te avise a ti de cada venta: tu perfil → *Communication preferences* →
   **Successful payments**.
7. **Prueba** — en la web, compra un paquete y reserva un evento con la tarjeta de prueba
   `4242 4242 4242 4242` (cualquier fecha futura y CVC). Tiene que pasar esto:
   - el paquete se abre al volver, y su fila en `compras` pasa a `pagado`;
   - la persona aparece en la lista del evento en `#/gestion`, y en `evento_reservas` como `pagado`;
   - en Stripe, dentro del webhook, cada aviso sale entregado con un **200**.
   En modo de prueba Stripe no envía los recibos solo: se mandan a mano desde la ficha del pago
   (*Send receipt*) para ver cómo quedan.
8. **Cobrar de verdad** — activa la cuenta de Stripe (datos fiscales y cuenta bancaria). El modo
   real tiene su propia clave **y su propio webhook**: repite el paso 5 con Stripe ya fuera del
   modo de prueba y guarda los dos secretos nuevos:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx STRIPE_WEBHOOK_SECRET=whsec_yyy
   supabase functions deploy pagos --no-verify-jwt
   ```

### Contraseña olvidada: el único correo que envía la web
Quien no recuerda su contraseña pulsa *¿Contraseña olvidada?* en la ficha de un paquete, recibe un
enlace por email y, al abrirlo, elige una nueva en la propia web. Hacen falta dos ajustes en Supabase:
1. **A dónde vuelve el enlace** — **Authentication → URL Configuration**: en *Site URL*, la dirección
   de la web publicada; en *Redirect URLs*, `http://localhost:5173/**` para probar en local (y cualquier
   otra dirección desde la que se use la web, acabada igual en `/**`). Una dirección que no esté ahí no
   vale: el enlace del correo acaba en la *Site URL* aunque se haya pedido desde otro sitio.
2. **Quién envía el correo** — el que trae Supabase de serie solo escribe a las personas de tu equipo
   en Supabase, y un par de mensajes por hora: sirve para probarlo contigo, no para clientas. Para
   ellas, **Authentication → Emails → SMTP Settings** → *Enable custom SMTP*. No hace falta dominio
   propio, vale una cuenta de Gmail:
   - *Host* `smtp.gmail.com` · *Port* `465`
   - *Username* y *Sender email*: la dirección de Gmail
   - *Password*: una **contraseña de aplicación** de Google, no la normal de la cuenta. Se crea en
     <https://myaccount.google.com/apppasswords> (pide tener activada la verificación en dos pasos)

   Gmail deja enviar unos 500 correos al día, de sobra para esto.

El correo sale con el texto de Supabase, en inglés. Se cambia en **Authentication → Emails → Reset
Password**; lo único que hay que conservar es el enlace `{{ .ConfirmationURL }}`.

Mientras el paso 2 no esté hecho, a quien pida el enlace la web le dice que escriba por el formulario,
y la contraseña se le cambia a mano (ver *Día a día*).

### Cómo funciona
- Los botones *Comprar paquete* y *Reservar plaza* llaman a la función `pagos`, que apunta la
  operación como `pendiente` y devuelve la página de pago de Stripe. El importe sale siempre del
  servidor (`functions/_shared/catalogo.js`), nunca del navegador.
- Un pago se da por bueno por **dos caminos** que hacen lo mismo y no se pisan: el **webhook**
  (Stripe avisa a la función, que comprueba la firma del aviso) y **la vuelta del pago** (la web
  le pide a la función que lo compruebe en Stripe). Con uno basta; si alguien paga y cierra la
  pestaña, el webhook lo apunta igual.
- **Eventos:** al abrir el pago la plaza queda **apartada**, para que dos personas no paguen la
  última a la vez. La página de pago caduca a los 31 minutos; si no se paga, la plaza vuelve a
  estar libre (a los 35). Al cobrarse, la persona entra en la lista del evento con el nombre y
  el teléfono que dio al pagar, y el aforo se actualiza solo. Cada pago reserva una plaza.
- Solo se puede pagar un evento que tenga precio en el catálogo **y** su sesión en el calendario
  con fecha futura. Los ya celebrados, los gratuitos y los que aún no tienen sesión enseñan un
  botón que lleva al formulario de contacto.
- Las tablas `compras` y `evento_reservas` solo las escribe la función. Cada cuenta lee
  únicamente sus compras (RLS); las reservas de evento no se leen desde el navegador.
- **Los vídeos de las clases de pago no están en el código de la web**, que se descarga entero lo
  haya comprado o no quien la abre. Los guarda la tabla `clase_videos`, y la base de datos solo se
  los entrega a las cuentas que tienen ese paquete pagado (RLS). El candado de la web es solo el
  dibujo; lo que de verdad cierra una clase es que su vídeo no llega al navegador.

### Día a día
- **Cambiar un precio o un nombre:** edita `functions/_shared/catalogo.js` (único sitio: lo leen la
  web y la función) y redespliega con `supabase functions deploy pagos --no-verify-jwt`.
  Sin el redespliegue la web anunciaría un precio y Stripe cobraría el anterior.
- **Paquete nuevo:** su nombre y precio en `PAQUETES_VENTA` (`functions/_shared/catalogo.js`), su
  ficha en `PAQUETES_FICHA` y sus clases en `CLASES` (`src/data.js`), con el mismo slug. Y redespliega.
- **Clase nueva o cambiar un vídeo:** la ficha de la clase va en `CLASES` (`src/data.js`) y su vídeo
  en la tabla `clase_videos`, con el mismo slug. Desde *Table Editor → clase_videos* o en el SQL Editor:
  ```sql
  -- clase nueva
  insert into public.clase_videos (clase, paquete, video_id) values ('slug-de-la-clase', 'slug-del-paquete', 'ID-DEL-VIDEO');
  -- cambiar el vídeo de una que ya está
  update public.clase_videos set video_id = 'ID-REAL' where clase = 'mat-suelo-y-respiracion';
  ```
  Los IDs de verdad no se escriben en ningún archivo del repositorio: lo lee cualquiera que tenga
  acceso a él. Mientras a una clase le falte su fila, quien la ha comprado ve «Vídeo en camino».
- **Portadas:** una clase bloqueada no puede enseñar la miniatura de YouTube (su dirección lleva el ID
  del vídeo), así que sale con el fondo liso y el candado. Para darle imagen propia, guarda una en
  `public/assets/` y ponla en el campo `poster` de su ficha (`src/data.js`).
- **Evento de pago nuevo:** su sesión en el calendario y su ficha como siempre (ver *Eventos*), más
  su precio en `EVENTOS_PRECIO` (`functions/_shared/catalogo.js`), con el mismo slug. Y redespliega.
- **Ventas:** el dinero se ve en Stripe (*Payments*); `compras` dice quién tiene abierto qué, y
  `#/gestion` quién viene a cada evento.
- **Devolver un paquete:** devuelve el dinero desde Stripe y cierra el acceso:
  `update public.compras set estado = 'reembolsado' where stripe_payment_intent = 'pi_…';`
- **Devolver una plaza:** devuelve el dinero desde Stripe y quita a la persona de la lista en
  `#/gestion` (eso libera la plaza). Para dejar constancia:
  `update public.evento_reservas set estado = 'reembolsado' where stripe_payment_intent = 'pi_…';`
- **Contraseña olvidada:** la cambia ella sola desde *¿Contraseña olvidada?* (ver más arriba). Si el
  correo no le llega o ya no usa esa dirección, se cambia a mano y se le dice la nueva:
  ```sql
  update auth.users
     set encrypted_password = extensions.crypt('ContraseñaNueva', extensions.gen_salt('bf'))
   where email = 'clienta@email.com';
  ```
- **Abrir un paquete a mano** (un regalo, o alguien que te paga por otra vía). La persona tiene que
  haberse creado antes la cuenta en la web:
  ```sql
  insert into public.compras (user_id, email, paquete, importe, estado, stripe_session_id, pagado_at)
  select id, email, 'premama', 0, 'pagado', 'manual-' || gen_random_uuid(), now()
    from auth.users where email = 'clienta@email.com';
  ```

## Notas
- **Aforo atómico:** reservar pasa siempre por la función `book_session`, que bloquea la
  fila de la sesión — es imposible que dos personas cojan la última plaza a la vez.
- **Lista de espera:** al llegar a 8, las siguientes reservas quedan en `waitlist`. La
  promoción (pasar a alguien de la lista a confirmado si se libera plaza) es **manual** por ahora.
- **Cancelar:** por ahora solo cancela quien está logueado y es dueño de su reserva; los
  invitados cancelan escribiéndote.
- **Fin de temporada:** no hay sesiones después del 31 ago 2026, así que el calendario se vacía solo.
