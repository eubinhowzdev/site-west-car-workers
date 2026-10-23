import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Eye,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { WestCarLogo } from './components/WestCarLogo';
import { mapVehicleFromDatabase } from './lib/catalog';
import { hasSupabaseConfig, supabase } from './lib/supabase';
import './admin.css';

const MAX_IMAGES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

const createEmptyVehicle = (sortOrder) => ({
  id: `veiculo-${crypto.randomUUID()}`,
  brand: '',
  model: '',
  version: '',
  year: new Date().getFullYear(),
  category: 'Hatch',
  price: '',
  mileage: '',
  fuel: 'Flex',
  transmission: 'Manual',
  color: '',
  engine: '',
  description: '',
  featuresText: '',
  images: [],
  available: true,
  featured: false,
  sortOrder
});

const toEditorVehicle = (vehicle) => ({
  ...vehicle,
  price: String(vehicle.price),
  mileage: vehicle.mileage || '',
  featuresText: (vehicle.features || []).join('\n')
});

const toDatabaseVehicle = (vehicle) => ({
  id: vehicle.id,
  brand: vehicle.brand.trim(),
  model: vehicle.model.trim(),
  version: vehicle.version.trim(),
  year: Number(vehicle.year),
  category: vehicle.category.trim(),
  price: Number(vehicle.price),
  mileage: vehicle.mileage.trim() || null,
  fuel: vehicle.fuel.trim(),
  transmission: vehicle.transmission.trim(),
  color: vehicle.color.trim(),
  engine: vehicle.engine.trim(),
  description: vehicle.description.trim(),
  features: vehicle.featuresText
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 40),
  hero_image: vehicle.images[0],
  images: vehicle.images,
  featured: Boolean(vehicle.featured),
  available: Boolean(vehicle.available),
  sort_order: Number(vehicle.sortOrder) || 0,
  updated_at: new Date().toISOString()
});

const optimizeImage = async (file) => {
  const bitmap = await createImageBitmap(file);
  const maxDimension = 1920;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { alpha: false });
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Não foi possível otimizar a imagem.'))),
      'image/jpeg',
      0.86
    );
  });

  return new File([blob], `${crypto.randomUUID()}.jpg`, { type: 'image/jpeg' });
};

function AdminLogin({ onAuthenticated, message }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(message || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (signInError || !data.user) {
        throw new Error('Não foi possível entrar. Confira os dados e tente novamente.');
      }

      const { data: access, error: accessError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (accessError || !access) {
        await supabase.auth.signOut();
        throw new Error('Não foi possível entrar. Confira os dados e tente novamente.');
      }

      onAuthenticated(data.user);
    } catch (loginError) {
      setError(loginError.message || 'Não foi possível entrar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <WestCarLogo height={58} />
        <div className="admin-login-icon"><LockKeyhole size={27} /></div>
        <h1 id="admin-login-title">Painel da loja</h1>
        <p className="admin-login-intro">Use o acesso da loja para atualizar os veículos publicados.</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <label>
            <span>E-mail de acesso</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Digite o e-mail"
              required
              autoFocus
            />
          </label>

          <label>
            <span>Senha</span>
            <div className="admin-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite a senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>

          {error && <div className="admin-alert admin-alert-error" role="alert"><CircleAlert /> {error}</div>}

          <button className="admin-primary-button" type="submit" disabled={submitting}>
            {submitting ? <LoaderCircle className="spin" /> : <ShieldCheck />}
            {submitting ? 'Verificando...' : 'Entrar no painel'}
          </button>
        </form>

      </section>
    </main>
  );
}

function PhotoManager({ vehicle, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    setError('');

    if (!files.length) return;
    if (vehicle.images.length + files.length > MAX_IMAGES) {
      setError(`Você pode cadastrar no máximo ${MAX_IMAGES} fotos por veículo.`);
      return;
    }

    const invalid = files.find(
      (file) => !ALLOWED_IMAGE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE
    );
    if (invalid) {
      setError('Use somente imagens JPG, PNG ou WebP com até 10 MB cada.');
      return;
    }

    setUploading(true);
    const uploadedUrls = [];
    const uploadedPaths = [];

    try {
      for (let index = 0; index < files.length; index += 1) {
        setProgress(`Preparando foto ${index + 1} de ${files.length}...`);
        const optimized = await optimizeImage(files[index]);
        const path = `${vehicle.id}/${optimized.name}`;
        setProgress(`Enviando foto ${index + 1} de ${files.length}...`);
        const { error: uploadError } = await supabase.storage
          .from('vehicle-images')
          .upload(path, optimized, {
            cacheControl: '31536000',
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('vehicle-images').getPublicUrl(path);
        uploadedPaths.push(path);
        uploadedUrls.push(data.publicUrl);
      }

      onChange({ ...vehicle, images: [...vehicle.images, ...uploadedUrls] });
      setProgress(`${uploadedUrls.length} foto${uploadedUrls.length > 1 ? 's enviadas' : ' enviada'} com sucesso.`);
    } catch (uploadError) {
      if (uploadedPaths.length) {
        await supabase.storage.from('vehicle-images').remove(uploadedPaths);
      }
      setError('Não foi possível enviar as fotos. Confira a internet e tente novamente.');
      setProgress('');
    } finally {
      setUploading(false);
    }
  };

  const makeCover = (index) => {
    const images = [...vehicle.images];
    const [selected] = images.splice(index, 1);
    images.unshift(selected);
    onChange({ ...vehicle, images });
  };

  const moveImage = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= vehicle.images.length) return;
    const images = [...vehicle.images];
    [images[index], images[target]] = [images[target], images[index]];
    onChange({ ...vehicle, images });
  };

  const removeImage = (index) => {
    onChange({ ...vehicle, images: vehicle.images.filter((_, imageIndex) => imageIndex !== index) });
  };

  return (
    <div className="admin-photo-manager">
      <div className="admin-upload-zone">
        <ImagePlus size={38} />
        <strong>Adicionar fotos do veículo</strong>
        <p>Escolha fotos da galeria ou tire fotos com o celular.</p>
        <label className={`admin-upload-button ${uploading ? 'disabled' : ''}`}>
          {uploading ? <LoaderCircle className="spin" /> : <Upload />}
          {uploading ? 'Enviando...' : 'Selecionar fotos'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFiles}
            disabled={uploading}
          />
        </label>
        <small>Até {MAX_IMAGES} fotos · JPG, PNG ou WebP · máximo 10 MB</small>
      </div>

      {progress && <div className="admin-alert admin-alert-success"><CheckCircle2 /> {progress}</div>}
      {error && <div className="admin-alert admin-alert-error" role="alert"><CircleAlert /> {error}</div>}

      {vehicle.images.length > 0 && (
        <div className="admin-photo-grid">
          {vehicle.images.map((image, index) => (
            <article className="admin-photo-item" key={`${image}-${index}`}>
              <img src={image} alt={`Foto ${index + 1} do veículo`} />
              {index === 0 && <span className="admin-cover-badge"><Check /> Foto principal</span>}
              <div className="admin-photo-actions">
                {index > 0 && (
                  <button type="button" onClick={() => makeCover(index)}>Usar como capa</button>
                )}
                <div>
                  <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} aria-label="Mover foto para a esquerda"><ChevronLeft /></button>
                  <button type="button" onClick={() => moveImage(index, 1)} disabled={index === vehicle.images.length - 1} aria-label="Mover foto para a direita"><ChevronRight /></button>
                  <button className="danger" type="button" onClick={() => removeImage(index)} aria-label="Remover foto"><Trash2 /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function VehicleEditor({ initialVehicle, onCancel, onSaved }) {
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (field, value) => setVehicle((current) => ({ ...current, [field]: value }));

  const validateStep = () => {
    if (step === 1) {
      if (!vehicle.brand.trim() || !vehicle.model.trim() || !vehicle.version.trim() || !vehicle.category.trim()) {
        return 'Preencha marca, modelo, versão e categoria.';
      }
      const year = Number(vehicle.year);
      if (!Number.isInteger(year) || year < 1900 || year > 2100) return 'Informe um ano válido.';
      if (!Number(vehicle.price) || Number(vehicle.price) < 0) return 'Informe um preço válido.';
    }

    if (step === 2) {
      if (!vehicle.fuel.trim() || !vehicle.transmission.trim() || !vehicle.color.trim() || !vehicle.engine.trim()) {
        return 'Preencha combustível, câmbio, cor e motor.';
      }
      if (vehicle.description.trim().length < 10) return 'Escreva uma descrição um pouco mais completa.';
    }

    if (step === 3 && vehicle.images.length === 0) return 'Adicione pelo menos uma foto do veículo.';
    return '';
  };

  const nextStep = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError('');
    setStep((current) => Math.min(3, current + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveVehicle = async () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const { data, error: saveError } = await supabase
        .from('vehicles')
        .upsert(toDatabaseVehicle(vehicle), { onConflict: 'id' })
        .select('*')
        .single();

      if (saveError) throw saveError;
      onSaved(mapVehicleFromDatabase(data));
    } catch (saveError) {
      setError('Não foi possível salvar o veículo. Confira os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="admin-editor-page">
      <div className="admin-page-width">
        <button type="button" className="admin-back-button" onClick={onCancel}><ArrowLeft /> Voltar aos veículos</button>

        <div className="admin-editor-heading">
          <div>
            <h1>{initialVehicle.brand ? 'Editar veículo' : 'Adicionar veículo'}</h1>
          </div>
          <span>Etapa {step} de 3</span>
        </div>

        <div className="admin-progress" aria-label={`Etapa ${step} de 3`}>
          {[1, 2, 3].map((number) => <span key={number} className={number <= step ? 'active' : ''} />)}
        </div>

        {error && <div className="admin-alert admin-alert-error admin-editor-alert" role="alert"><CircleAlert /> {error}</div>}

        <section className="admin-form-card">
          {step === 1 && (
            <>
              <div className="admin-section-title"><Car /><div><h2>Informações principais</h2><p>Dados que aparecem primeiro no catálogo.</p></div></div>
              <div className="admin-form-grid">
                <label><span>Marca *</span><input value={vehicle.brand} onChange={(event) => update('brand', event.target.value)} placeholder="Ex.: Fiat" maxLength={50} /></label>
                <label><span>Modelo *</span><input value={vehicle.model} onChange={(event) => update('model', event.target.value)} placeholder="Ex.: Argo Drive" maxLength={80} /></label>
                <label className="full"><span>Versão *</span><input value={vehicle.version} onChange={(event) => update('version', event.target.value)} placeholder="Ex.: 1.0 Flex Manual" maxLength={100} /></label>
                <label><span>Ano *</span><input type="number" inputMode="numeric" min="1900" max="2100" value={vehicle.year} onChange={(event) => update('year', event.target.value)} /></label>
                <label><span>Categoria *</span><select value={vehicle.category} onChange={(event) => update('category', event.target.value)}><option>Hatch</option><option>Sedã</option><option>SUV</option><option>Picape</option><option>Utilitário</option><option>Outro</option></select></label>
                <label className="full"><span>Preço à vista *</span><input type="number" inputMode="decimal" min="0" step="100" value={vehicle.price} onChange={(event) => update('price', event.target.value)} placeholder="Ex.: 58900" /></label>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="admin-section-title"><Pencil /><div><h2>Detalhes do veículo</h2><p>Informe o que o cliente precisa saber.</p></div></div>
              <div className="admin-form-grid">
                <label><span>Combustível *</span><input value={vehicle.fuel} onChange={(event) => update('fuel', event.target.value)} placeholder="Ex.: Flex" maxLength={50} /></label>
                <label><span>Câmbio *</span><input value={vehicle.transmission} onChange={(event) => update('transmission', event.target.value)} placeholder="Ex.: Manual" maxLength={60} /></label>
                <label><span>Cor *</span><input value={vehicle.color} onChange={(event) => update('color', event.target.value)} placeholder="Ex.: Branco" maxLength={50} /></label>
                <label><span>Motor *</span><input value={vehicle.engine} onChange={(event) => update('engine', event.target.value)} placeholder="Ex.: 1.0 Flex" maxLength={60} /></label>
                <label className="full"><span>Quilometragem</span><input value={vehicle.mileage} onChange={(event) => update('mileage', event.target.value)} placeholder="Ex.: 85.000 km — deixe vazio se não souber" maxLength={40} /></label>
                <label className="full"><span>Descrição *</span><textarea rows="4" value={vehicle.description} onChange={(event) => update('description', event.target.value)} placeholder="Descreva o estado e os principais diferenciais do carro." maxLength={700} /></label>
                <label className="full"><span>Itens e acessórios</span><textarea rows="7" value={vehicle.featuresText} onChange={(event) => update('featuresText', event.target.value)} placeholder={'Digite um item por linha:\nAr-condicionado\nDireção elétrica\nCentral multimídia'} maxLength={1500} /><small>Digite um item por linha.</small></label>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="admin-section-title"><Camera /><div><h2>Fotos e publicação</h2><p>A primeira foto será a capa do veículo no catálogo.</p></div></div>
              <PhotoManager vehicle={vehicle} onChange={setVehicle} />
              <div className="admin-publish-option">
                <div><strong>Publicar no catálogo</strong><p>O veículo ficará visível para todos assim que for salvo.</p></div>
                <button type="button" role="switch" aria-checked={vehicle.available} className={vehicle.available ? 'active' : ''} onClick={() => update('available', !vehicle.available)}><span /></button>
              </div>
            </>
          )}
        </section>
      </div>

      <footer className="admin-editor-footer">
        <div className="admin-page-width">
          <button type="button" className="admin-secondary-button" onClick={step === 1 ? onCancel : () => setStep((current) => current - 1)}>{step === 1 ? <X /> : <ArrowLeft />}{step === 1 ? 'Cancelar' : 'Voltar'}</button>
          {step < 3 ? (
            <button type="button" className="admin-primary-button" onClick={nextStep}>Continuar <ArrowRight /></button>
          ) : (
            <button type="button" className="admin-primary-button" onClick={saveVehicle} disabled={saving}>{saving ? <LoaderCircle className="spin" /> : <Save />}{saving ? 'Salvando...' : 'Salvar veículo'}</button>
          )}
        </div>
      </footer>
    </main>
  );
}

function AdminDashboard({ onLogout }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editorVehicle, setEditorVehicle] = useState(null);
  const [updatingId, setUpdatingId] = useState('');

  const loadAdminVehicles = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: loadError } = await supabase
      .from('vehicles')
      .select('*')
      .order('sort_order', { ascending: true });

    if (loadError) {
      setError('Não foi possível carregar os veículos. Tente novamente.');
    } else {
      setVehicles((data || []).map(mapVehicleFromDatabase));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAdminVehicles();
  }, [loadAdminVehicles]);

  const publishedCount = useMemo(() => vehicles.filter((vehicle) => vehicle.available).length, [vehicles]);
  const hiddenCount = vehicles.length - publishedCount;

  const toggleAvailability = async (vehicle) => {
    const willPublish = !vehicle.available;
    if (!willPublish && !window.confirm(`Retirar ${vehicle.brand} ${vehicle.model} do site? Ele continuará salvo no painel.`)) return;

    setUpdatingId(vehicle.id);
    const { data, error: updateError } = await supabase
      .from('vehicles')
      .update({ available: willPublish, updated_at: new Date().toISOString() })
      .eq('id', vehicle.id)
      .select('*')
      .single();

    if (updateError) {
      setError('Não foi possível alterar a publicação do veículo.');
    } else {
      setVehicles((current) => current.map((item) => item.id === vehicle.id ? mapVehicleFromDatabase(data) : item));
      setNotice(willPublish ? 'Veículo publicado no site.' : 'Veículo retirado do site.');
    }
    setUpdatingId('');
  };

  const handleSaved = (savedVehicle) => {
    setVehicles((current) => {
      const exists = current.some((vehicle) => vehicle.id === savedVehicle.id);
      const next = exists
        ? current.map((vehicle) => vehicle.id === savedVehicle.id ? savedVehicle : vehicle)
        : [...current, savedVehicle];
      return next.sort((a, b) => a.sortOrder - b.sortOrder);
    });
    setEditorVehicle(null);
    setNotice('Veículo salvo com sucesso.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (editorVehicle) {
    return <VehicleEditor initialVehicle={editorVehicle} onCancel={() => setEditorVehicle(null)} onSaved={handleSaved} />;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-page-width admin-header-inner">
          <a href="/" aria-label="Abrir o site da West Car"><WestCarLogo height={46} /></a>
          <div>
            <span className="admin-user-label"><ShieldCheck /> Administrador</span>
            <button type="button" onClick={onLogout}><LogOut /> Sair</button>
          </div>
        </div>
      </header>

      <main className="admin-page-width admin-main">
        <div className="admin-welcome">
          <div><h1>Estoque da West Car</h1><p>Cadastre veículos e mantenha as informações do site atualizadas.</p></div>
          <a href="/" target="_blank" rel="noreferrer"><Eye /> Ver site</a>
        </div>

        {notice && <div className="admin-alert admin-alert-success admin-dashboard-notice" role="status"><CheckCircle2 /> {notice}</div>}

        <section className="admin-summary" aria-label="Resumo do estoque">
          <article><span className="green"><CheckCircle2 /></span><div><strong>{publishedCount}</strong><p>Publicados</p></div></article>
          <article><span className="gray"><EyeOff /></span><div><strong>{hiddenCount}</strong><p>Fora do site</p></div></article>
          <article><span className="red"><Car /></span><div><strong>{vehicles.length}</strong><p>Total de veículos</p></div></article>
        </section>

        <div className="admin-list-heading">
          <div><h2>Veículos cadastrados</h2><p>Edite os dados ou retire um veículo do site.</p></div>
          <button type="button" className="admin-primary-button" onClick={() => setEditorVehicle(createEmptyVehicle(vehicles.length + 1))}><Plus /> Adicionar veículo</button>
        </div>

        {error && <div className="admin-alert admin-alert-error" role="alert"><CircleAlert /> {error}</div>}

        {loading ? (
          <div className="admin-loading"><LoaderCircle className="spin" /><p>Carregando veículos...</p></div>
        ) : vehicles.length === 0 ? (
          <div className="admin-empty"><Car /><h2>Nenhum veículo cadastrado</h2><p>Use o botão abaixo para adicionar o primeiro.</p><button className="admin-primary-button" type="button" onClick={() => setEditorVehicle(createEmptyVehicle(1))}><Plus /> Adicionar veículo</button></div>
        ) : (
          <section className="admin-vehicle-list">
            {vehicles.map((vehicle) => (
              <article className="admin-vehicle-card" key={vehicle.id}>
                <div className="admin-vehicle-photo">{vehicle.images[0] ? <img src={vehicle.images[0]} alt={`${vehicle.brand} ${vehicle.model}`} /> : <Car />}</div>
                <div className="admin-vehicle-info">
                  <span className={`admin-status ${vehicle.available ? 'published' : 'hidden'}`}>{vehicle.available ? 'Publicado' : 'Fora do site'}</span>
                  <h3>{vehicle.brand} {vehicle.model}</h3>
                  <p>{vehicle.version} · {vehicle.year}</p>
                  <strong>{formatPrice(vehicle.price)}</strong>
                </div>
                <div className="admin-vehicle-actions">
                  <button type="button" className="edit" onClick={() => setEditorVehicle(toEditorVehicle(vehicle))}><Pencil /> Editar</button>
                  <button type="button" className={vehicle.available ? 'hide' : 'publish'} onClick={() => toggleAvailability(vehicle)} disabled={updatingId === vehicle.id}>{updatingId === vehicle.id ? <LoaderCircle className="spin" /> : vehicle.available ? <EyeOff /> : <Eye />}{vehicle.available ? 'Retirar do site' : 'Publicar no site'}</button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

    </div>
  );
}

export default function AdminApp() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  const validateAccess = useCallback(async () => {
    if (!supabase) {
      setChecking(false);
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setUser(null);
      setChecking(false);
      return;
    }

    const { data: access, error: accessError } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (accessError || !access) {
      await supabase.auth.signOut();
      setMessage('Não foi possível validar o acesso. Entre novamente.');
      setUser(null);
    } else {
      setUser(userData.user);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    document.title = 'Painel da Loja | West Car Multimarcas';
    validateAccess();
    return () => {
      document.title = 'WEST CAR Multimarcas | Catálogo de Veículos Selecionados';
    };
  }, [validateAccess]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!hasSupabaseConfig) {
    return <main className="admin-login-page"><section className="admin-login-card"><CircleAlert size={36} /><h1>Painel indisponível</h1><p>A conexão segura ainda não foi configurada.</p></section></main>;
  }

  if (checking) {
    return <main className="admin-login-page"><div className="admin-loading"><LoaderCircle className="spin" /><p>Verificando acesso seguro...</p></div></main>;
  }

  return user
    ? <AdminDashboard onLogout={logout} />
    : <AdminLogin onAuthenticated={setUser} message={message} />;
}
