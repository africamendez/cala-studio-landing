-- cala.studio · Vídeos de las clases de pago
--
-- El vídeo de cada clase de pago se guarda AQUÍ y no en el código de la web.
-- Todo lo que va en el código se descarga con la página, la abra quien la abra:
-- con los IDs allí, cualquiera los sacaba (herramientas del navegador) sin
-- comprar nada. Ahora la web pide esta tabla y la base de datos le devuelve
-- solo las filas de los paquetes que esa cuenta tiene pagados (RLS). Sin
-- compra no llega ni una fila.
--
-- Las clases de muestra (`gratis: true` en src/data.js) siguen con su vídeo en
-- el código: son públicas, no hay nada que esconder.
--
-- Correr DESPUÉS de 0001-0015. Idempotente.

create table if not exists public.clase_videos (
  clase     text primary key,                         -- slug de la clase (CLASES en src/data.js)
  paquete   text not null,                            -- slug del paquete que la abre (functions/_shared/catalogo.js)
  provider  text not null default 'youtube'
            check (provider in ('youtube','vimeo')),
  video_id  text not null                             -- el ID del vídeo en YouTube o en Vimeo
);
create index if not exists clase_videos_paquete_idx on public.clase_videos (paquete);

-- RLS: una fila solo se lee con una compra `pagado` de su paquete en la cuenta.
-- Sin políticas de escritura → desde el navegador no se puede tocar la tabla.
alter table public.clase_videos enable row level security;
drop policy if exists clase_videos_comprado on public.clase_videos;
create policy clase_videos_comprado on public.clase_videos
  for select to authenticated using (
    exists (
      select 1 from public.compras c
       where c.user_id = (select auth.uid())
         and c.paquete = clase_videos.paquete
         and c.estado  = 'pagado'
    )
  );

revoke all on public.clase_videos from anon, authenticated;
grant select on public.clase_videos to authenticated;
grant all on public.clase_videos to service_role;

-- ⚠️ Vídeos de EJEMPLO (públicos, de relleno) para probar la compra de punta a
-- punta: todos del mismo canal, para que la imagen sea uniforme. Los de verdad
-- NO se escriben en este archivo —el repositorio lo lee cualquiera que tenga
-- acceso a él—: se ponen desde el panel de Supabase (Table Editor →
-- clase_videos) o en el SQL Editor:
--   update public.clase_videos set video_id = 'ID-REAL' where clase = 'mat-suelo-y-respiracion';
insert into public.clase_videos (clase, paquete, video_id) values
  ('mat-suelo-y-respiracion',              'mat-i',         'NyP_waVgL1w'),
  ('mat-abdomen-profundo',                 'mat-i',         'dYcNLMwwlMA'),
  ('flow-movilidad-de-manana',             'flow-i',        'u5QbMDvSK3w'),
  ('flow-cadena-completa',                 'flow-i',        '7SU59GxGqbo'),
  ('sculpt-piernas-y-gluteo',              'sculpt-i',      'bn8f3EAS0UQ'),
  ('sculpt-tren-superior',                 'sculpt-i',      'ta_k5QZLkfk'),
  ('premama-respiracion-y-suelo-pelvico',  'premama',       'D2d7zi6ya58'),
  ('premama-cadera-y-espalda',             'premama',       'HIuJA4xS4WM'),
  ('premama-fuerza-amable',                'premama',       'Xs6gah4DseA'),
  ('postparto-reconectar-el-centro',       'postparto',     'y2RcYo36boM'),
  ('postparto-postura-y-espalda',          'postparto',     'imWc_27U9w8'),
  ('postparto-vuelta-a-la-fuerza',         'postparto',     'wtVyZmHnlxM'),
  ('animal-flow-posiciones-base',          'animal-flow-i', '8cltCOUpYTQ'),
  ('animal-flow-primer-flow',              'animal-flow-i', '6Iuh2_kk1d8')
on conflict (clase) do nothing;
