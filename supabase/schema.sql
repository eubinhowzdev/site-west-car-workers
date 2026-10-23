create table if not exists public.vehicles (
  id text primary key,
  brand text not null,
  model text not null,
  version text not null,
  year integer not null check (year between 1900 and 2100),
  category text not null,
  price integer not null check (price >= 0),
  mileage text,
  fuel text not null,
  transmission text not null,
  color text not null,
  engine text not null,
  description text not null,
  features text[] not null default '{}',
  hero_image text not null,
  images text[] not null default '{}',
  featured boolean not null default false,
  available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vehicles_available_sort_idx
  on public.vehicles (available, sort_order);

create index if not exists vehicles_category_idx
  on public.vehicles (category);

alter table public.vehicles enable row level security;

drop policy if exists "Public catalog can read available vehicles" on public.vehicles;
create policy "Public catalog can read available vehicles"
  on public.vehicles
  for select
  to anon
  using (available = true);

revoke all on table public.vehicles from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on table public.vehicles to anon, authenticated;

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end
$$;

insert into public.vehicles (
  id, brand, model, version, year, category, price, mileage, fuel,
  transmission, color, engine, description, features, hero_image,
  images, featured, available, sort_order
)
values
(
  'chevrolet-cruze-lt-2014', 'Chevrolet', 'Cruze LT', '1.8 Automático',
  2014, 'Sedã', 58900, null, 'Flex', 'Automático', 'Preto', '1.8 Flex',
  'Sedã confortável, espaçoso e muito bem equipado, com acabamento elegante e excelente presença na cor preta.',
  array['Ar-condicionado','Direção hidráulica','Vidros e travas elétricas','Alarme','Controle de som no volante','Computador de bordo','Rodas de liga leve','Faróis de neblina','Banco do motorista com regulagem de altura'],
  '/images/vehicles/hero-cruze.png',
  array['/images/vehicles/cruze-lt-2014/01.jpg','/images/vehicles/cruze-lt-2014/02.jpg','/images/vehicles/cruze-lt-2014/03.jpg','/images/vehicles/cruze-lt-2014/04.jpg','/images/vehicles/cruze-lt-2014/05.jpg','/images/vehicles/cruze-lt-2014/06.jpg','/images/vehicles/cruze-lt-2014/07.jpg','/images/vehicles/cruze-lt-2014/08.jpg','/images/vehicles/cruze-lt-2014/09.jpg','/images/vehicles/cruze-lt-2014/10.jpg','/images/vehicles/cruze-lt-2014/11.jpg','/images/vehicles/cruze-lt-2014/12.jpg','/images/vehicles/cruze-lt-2014/13.jpg','/images/vehicles/cruze-lt-2014/14.jpg'],
  true, true, 1
),
(
  'chevrolet-equinox-premier-2019', 'Chevrolet', 'Equinox Premier', '2.0 Turbo AWD',
  2019, 'SUV', 118900, null, 'Gasolina', 'Automático de 9 marchas', 'Branco', '2.0 Turbo — 262 cv',
  'SUV completo, potente e confortável, com tração integral e um pacote amplo de tecnologia e segurança.',
  array['Tração AWD','Teto solar panorâmico','Bancos em couro com ajuste elétrico','Ar-condicionado digital dual zone','Apple CarPlay e Android Auto','Chave presencial e partida por botão','Carregador por indução','Sensores dianteiros e traseiros','Câmera de ré','Alerta de ponto cego e permanência em faixa','Faróis em LED'],
  '/images/vehicles/hero-equinox.png',
  array['/images/vehicles/equinox-premier-2019/01.jpg','/images/vehicles/equinox-premier-2019/02.jpg','/images/vehicles/equinox-premier-2019/03.jpg','/images/vehicles/equinox-premier-2019/04.jpg','/images/vehicles/equinox-premier-2019/05.jpg','/images/vehicles/equinox-premier-2019/06.jpg','/images/vehicles/equinox-premier-2019/07.jpg','/images/vehicles/equinox-premier-2019/08.jpg','/images/vehicles/equinox-premier-2019/09.jpg','/images/vehicles/equinox-premier-2019/10.jpg','/images/vehicles/equinox-premier-2019/11.jpg','/images/vehicles/equinox-premier-2019/12.jpg','/images/vehicles/equinox-premier-2019/13.jpg','/images/vehicles/equinox-premier-2019/14.jpg','/images/vehicles/equinox-premier-2019/15.jpg','/images/vehicles/equinox-premier-2019/16.jpg'],
  true, true, 2
),
(
  'fiat-argo-drive-2023', 'Fiat', 'Argo Drive', '1.0',
  2023, 'Hatch', 63900, null, 'Sob consulta', 'Sob consulta', 'Prata', '1.0',
  'Hatch moderno, econômico e prático para o dia a dia, com bom espaço interno e ótima apresentação.',
  array['Central multimídia','Ar-condicionado','Direção elétrica','Visual moderno','Excelente espaço interno','Bom para cidade e estrada'],
  '/images/vehicles/hero-argo.png',
  array['/images/vehicles/argo-drive-2023/01.jpg','/images/vehicles/argo-drive-2023/02.jpg','/images/vehicles/argo-drive-2023/03.jpg','/images/vehicles/argo-drive-2023/04.jpg','/images/vehicles/argo-drive-2023/05.jpg','/images/vehicles/argo-drive-2023/06.jpg','/images/vehicles/argo-drive-2023/07.jpg','/images/vehicles/argo-drive-2023/08.jpg','/images/vehicles/argo-drive-2023/09.jpg','/images/vehicles/argo-drive-2023/10.jpg','/images/vehicles/argo-drive-2023/11.jpg'],
  true, true, 3
),
(
  'hyundai-hb20-2017', 'Hyundai', 'HB20', 'Hatch',
  2017, 'Hatch', 50900, null, 'Sob consulta', 'Sob consulta', 'Branco', 'Sob consulta',
  'Hatch confortável, econômico e confiável, com boa dirigibilidade para cidade e estrada.',
  array['Design moderno','Interior confortável e funcional','Excelente custo-benefício','Mecânica reconhecida pela confiabilidade','Boa dirigibilidade','Bem conservado'],
  '/images/vehicles/hero-hb20.png',
  array['/images/vehicles/hb20-2017/01.jpg','/images/vehicles/hb20-2017/02.jpg','/images/vehicles/hb20-2017/03.jpg','/images/vehicles/hb20-2017/04.jpg','/images/vehicles/hb20-2017/05.jpg','/images/vehicles/hb20-2017/06.jpg','/images/vehicles/hb20-2017/07.jpg','/images/vehicles/hb20-2017/08.jpg','/images/vehicles/hb20-2017/09.jpg','/images/vehicles/hb20-2017/10.jpg','/images/vehicles/hb20-2017/11.jpg'],
  false, true, 4
),
(
  'fiat-strada-working-2014', 'Fiat', 'Strada Working', '1.4 Cabine Dupla · 3 Portas',
  2014, 'Picape', 62900, null, 'Sob consulta', 'Manual', 'Branco', '1.4',
  'Picape compacta, robusta e versátil, pronta para o trabalho e também para a rotina da família.',
  array['Cabine dupla','3 portas','Ar-condicionado','Direção hidráulica','Vidros elétricos','Caçamba espaçosa','Excelente estado de conservação'],
  '/images/vehicles/hero-strada.png',
  array['/images/vehicles/strada-working-2014/01.jpg','/images/vehicles/strada-working-2014/02.jpg','/images/vehicles/strada-working-2014/03.jpg','/images/vehicles/strada-working-2014/04.jpg','/images/vehicles/strada-working-2014/05.jpg','/images/vehicles/strada-working-2014/06.jpg','/images/vehicles/strada-working-2014/07.jpg','/images/vehicles/strada-working-2014/08.jpg','/images/vehicles/strada-working-2014/09.jpg','/images/vehicles/strada-working-2014/10.jpg','/images/vehicles/strada-working-2014/11.jpg','/images/vehicles/strada-working-2014/12.jpg','/images/vehicles/strada-working-2014/13.jpg','/images/vehicles/strada-working-2014/14.jpg'],
  false, true, 5
),
(
  'volkswagen-up-take-2015', 'Volkswagen', 'Up! Take', '1.0 MPI',
  2015, 'Hatch', 40900, null, 'Flex', 'Manual', 'Vermelho', '1.0 MPI',
  'Compacto econômico, ágil e de manutenção acessível, ideal para a cidade e para o primeiro carro.',
  array['Motor 1.0 MPI','Câmbio manual','Combustível flex','Excelente dirigibilidade','Ótimo consumo de combustível','Manutenção acessível','Ótimo custo-benefício'],
  '/images/vehicles/hero-up.png',
  array['/images/vehicles/up-take-2015/01.jpg','/images/vehicles/up-take-2015/02.jpg','/images/vehicles/up-take-2015/03.jpg','/images/vehicles/up-take-2015/04.jpg','/images/vehicles/up-take-2015/05.jpg','/images/vehicles/up-take-2015/06.jpg','/images/vehicles/up-take-2015/07.jpg','/images/vehicles/up-take-2015/08.jpg','/images/vehicles/up-take-2015/09.jpg','/images/vehicles/up-take-2015/10.jpg','/images/vehicles/up-take-2015/11.jpg'],
  false, true, 6
)
on conflict (id) do update set
  brand = excluded.brand,
  model = excluded.model,
  version = excluded.version,
  year = excluded.year,
  category = excluded.category,
  price = excluded.price,
  mileage = excluded.mileage,
  fuel = excluded.fuel,
  transmission = excluded.transmission,
  color = excluded.color,
  engine = excluded.engine,
  description = excluded.description,
  features = excluded.features,
  hero_image = excluded.hero_image,
  images = excluded.images,
  featured = excluded.featured,
  available = excluded.available,
  sort_order = excluded.sort_order,
  updated_at = now();
