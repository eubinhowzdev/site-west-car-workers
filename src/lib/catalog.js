import { VEHICLES_DATA } from '../data/vehicles';
import { supabase } from './supabase';

export const mapVehicleFromDatabase = (vehicle) => ({
  id: vehicle.id,
  brand: vehicle.brand,
  model: vehicle.model,
  version: vehicle.version,
  year: vehicle.year,
  category: vehicle.category,
  price: Number(vehicle.price),
  mileage: vehicle.mileage,
  fuel: vehicle.fuel,
  transmission: vehicle.transmission,
  color: vehicle.color,
  engine: vehicle.engine,
  description: vehicle.description,
  features: vehicle.features ?? [],
  heroImage: vehicle.hero_image,
  images: vehicle.images ?? [],
  featured: vehicle.featured,
  available: vehicle.available,
  sortOrder: vehicle.sort_order
});

export async function loadVehicles() {
  if (!supabase) {
    return VEHICLES_DATA;
  }

  try {
    const { data: rows, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('available', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (rows || []).map(mapVehicleFromDatabase);
  } catch (error) {
    console.warn('Catálogo remoto indisponível.', error);
    return [];
  }
}
