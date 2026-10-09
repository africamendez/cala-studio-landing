-- cala.studio · Vídeos de EJEMPLO de las clases de pago
-- Pone en `clase_videos` los vídeos de relleno actuales (los mismos que siembra
-- 0016_clase_videos.sql) en una base donde esa migración ya se ejecutó con los
-- de relleno antiguos. Córrelo en Supabase → SQL Editor.
--
-- Solo cambia las clases que siguen con uno de los vídeos de relleno antiguos:
-- si ya has puesto el tuyo en alguna, no lo toca. Se puede repetir sin miedo.

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
on conflict (clase) do update
  set video_id = excluded.video_id, provider = 'youtube'
  where public.clase_videos.video_id in
    ('ZXsQAXx_ao0', 'v7AYKMP6rOE', 'inpok4MKVLM', '2OEL4P1Rz04', 'gC_L9qAHVJ8', '1ZYbU82GVz4');
