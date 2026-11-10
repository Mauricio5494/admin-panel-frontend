import React, { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type Item = {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string | null;
  creado_en: string;
  usuario_id: number;
  usuario_nombre?: string;
};

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  creado_en: string;
};

type AuthUser = {
  id: number;
  email: string;
  nombre: string;
  token: string;
};

type Vista = 'login' | 'register' | 'dashboard';

function App() {
  const [vista, setVista] = useState<Vista>('login');
  const [auth, setAuth] = useState<AuthUser | null>(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('usuario');
    if (t && u) {
      try { return { ...JSON.parse(u), token: t }; } catch { return null; }
    }
    return null;
  });
  const [items, setItems] = useState<Item[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: 'info' as 'info' | 'ok' | 'error' });

  // Formulario items
  const [editId, setEditId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenActual, setImagenActual] = useState<string | null>(null);

  // Formulario auth
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [shake, setShake] = useState(false);

  // Filtro
  const [filtro, setFiltro] = useState('');

  // ---------- helpers ----------

  function mostrar(texto: string, tipo: 'info' | 'ok' | 'error') {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: 'info' }), 4000);
  }

  function headersAuth() {
    return auth ? { Authorization: `Bearer ${auth.token}` } : {};
  }

  // ---------- efectos ----------

  useEffect(() => {
    if (!auth) return;
    cargarItems();
    cargarUsuarios();
  }, [auth, filtro]);

  async function cargarItems() {
    try {
      const qs = filtro ? `?search=${encodeURIComponent(filtro)}` : '';
      const res = await fetch(`${API_URL}/api/items${qs}`, { headers: headersAuth() });
      if (res.status === 401 || res.status === 403) { cerrarSesion(); return; }
      const data = await res.json();
      setItems(data);
    } catch (e) {
      mostrar('Error cargando items', 'error');
    }
  }

  async function cargarUsuarios() {
    try {
      const res = await fetch(`${API_URL}/api/usuarios`, { headers: headersAuth() });
      if (res.status === 401 || res.status === 403) { cerrarSesion(); return; }
      const data = await res.json();
      setUsuarios(data);
    } catch (e) {
      mostrar('Error cargando usuarios', 'error');
    }
  }

  // ---------- auth ----------

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { mostrar(data.error || 'Error al registrar', 'error'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      setAuth({ ...data.usuario, token: data.token });
      setVista('dashboard');
      mostrar('Registro exitoso', 'ok');
    } catch (err) { mostrar('Error de conexión', 'error'); }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setShake(false);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        mostrar(data.error || 'Credenciales inválidas', 'error');
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      setAuth({ ...data.usuario, token: data.token });
      setVista('dashboard');
      mostrar('Bienvenido de nuevo', 'ok');
    } catch (err) { mostrar('Error de conexión', 'error'); }
  }

  function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setAuth(null);
    setVista('login');
    setItems([]);
    mostrar('Sesión cerrada', 'info');
  }

  // ---------- items ----------

  async function guardarItem(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) { mostrar('El título es requerido', 'error'); return; }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    if (imagenFile) formData.append('imagen', imagenFile);

    try {
      const url = editId ? `${API_URL}/api/items/${editId}` : `${API_URL}/api/items`;
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: headersAuth(), body: formData });
      if (res.status === 401 || res.status === 403) { cerrarSesion(); return; }
      if (!res.ok) { const d = await res.json(); mostrar(d.error || 'Error', 'error'); return; }
      mostrar(editId ? 'Item actualizado' : 'Item creado', 'ok');
      resetFormulario();
      cargarItems();
    } catch (err) { mostrar('Error guardando item', 'error'); }
  }

  async function eliminarItem(id: number) {
    if (!confirm('¿Eliminar este item?')) return;
    try {
      const res = await fetch(`${API_URL}/api/items/${id}`, { method: 'DELETE', headers: headersAuth() });
      if (res.status === 401 || res.status === 403) { cerrarSesion(); return; }
      mostrar('Item eliminado', 'ok');
      cargarItems();
    } catch (err) { mostrar('Error eliminando', 'error'); }
  }

  function editarItem(item: Item) {
    setEditId(item.id);
    setTitulo(item.titulo);
    setDescripcion(item.descripcion);
    setImagenActual(item.imagen || null);
    setImagenFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetFormulario() {
    setEditId(null);
    setTitulo('');
    setDescripcion('');
    setImagenFile(null);
    setImagenActual(null);
  }

  async function exportarCSV() {
    try {
      const qs = filtro ? `?search=${encodeURIComponent(filtro)}` : '';
      const res = await fetch(`${API_URL}/api/items/export${qs}`, { headers: headersAuth() });
      if (res.status === 401 || res.status === 403) { cerrarSesion(); return; }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'items.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      mostrar('CSV exportado', 'ok');
    } catch (err) { mostrar('Error exportando', 'error'); }
  }

  // ---------- pantallas ----------

  if (vista === 'login') {
    return (
      <div className="login-card">
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              ref={emailRef}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={shake ? 'input-error shake' : ''}
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              ref={passwordRef}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={shake ? 'input-error shake' : ''}
            />
          </div>
          <button type="submit" className="btn">Ingresar</button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', opacity: 0.8 }}>
          ¿No tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setVista('register'); }} style={{ color: '#ffaa00' }}>Regístrate</a>
        </p>
        {mensaje.texto && <p className={`msg ${mensaje.tipo}`}>{mensaje.texto}</p>}
      </div>
    );
  }

  if (vista === 'register') {
    return (
      <div className="login-card">
        <h2>Crear cuenta</h2>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn">Registrarse</button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', opacity: 0.8 }}>
          ¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); setVista('login'); }} style={{ color: '#ffaa00' }}>Inicia sesión</a>
        </p>
        {mensaje.texto && <p className={`msg ${mensaje.tipo}`}>{mensaje.texto}</p>}
      </div>
    );
  }

  // ---------- DASHBOARD ----------

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Panel de Administración</h1>
          <p>Conectado como <strong>{auth?.nombre}</strong> ({auth?.email})</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn" onClick={cerrarSesion} style={{ background: '#000', color: '#ff1a1a', padding: '0.4rem 0.8rem' }}>Salir</button>
        </div>
      </div>

      {mensaje.texto && <p className={`msg ${mensaje.tipo}`}>{mensaje.texto}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <h3>{editId ? 'Editar Item' : 'Nuevo Item'}</h3>
          <form onSubmit={guardarItem}>
            <div className="form-group">
              <label>Título</label>
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Reporte mensual" required />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Detalles del item" rows="3" />
            </div>
            <div className="form-group">
              <label>Imagen (opcional)</label>
              <input type="file" accept="image/*" onChange={(e) => { if (e.target.files) setImagenFile(e.target.files[0]); }} />
              {imagenActual && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img src={`${API_URL}${imagenActual}`} alt="preview" style={{ maxWidth: '150px', border: '1px solid #330000', marginTop: '0.5rem' }} />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn">{editId ? 'Guardar cambios' : 'Crear Item'}</button>
              <button type="button" className="btn" onClick={resetFormulario} style={{ background: '#000', color: '#ff1a1a' }}>Cancelar</button>
            </div>
          </form>
        </div>

        <div className="card">
          <h3>Buscar / Filtrar</h3>
          <div className="form-group">
            <label>Buscar por título o descripción</label>
            <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Escribe para filtrar..." />
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button className="btn" onClick={exportarCSV} style={{ background: '#000', color: '#ff1a1a', flex: 1 }}>Exportar CSV</button>
            <button className="btn" onClick={() => setFiltro('')} style={{ flex: 1 }}>Limpiar filtro</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Items ({items.length})</h3>
        {items.length === 0 ? (
          <div className="empty">No hay items registrados.</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="item">
              <div className="item-info">
                {item.imagen ? (
                  <img src={`${API_URL}${item.imagen}`} alt="item" className="item-img" />
                ) : (
                  <div className="item-img-placeholder">Sin imagen</div>
                )}
                <div className="item-text">
                  <h4>{item.titulo}</h4>
                  <p>{item.descripcion || 'Sin descripción'}</p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                    Creado: {new Date(item.creado_en).toLocaleDateString()} &middot;
                    Usuario: {item.usuario_nombre || 'Desconocido'}
                  </p>
                </div>
              </div>
              <div className="item-actions">
                <button className="btn" onClick={() => editarItem(item)} style={{ background: '#000', color: '#ffaa00', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Editar</button>
                <button className="btn" onClick={() => eliminarItem(item.id)} style={{ background: '#000', color: '#ff1a1a', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Usuarios registrados ({usuarios.length})</h3>
        {usuarios.length === 0 ? (
          <div className="empty">No hay usuarios.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {usuarios.map((u) => (
              <li key={u.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,26,26,0.1)' }}>
                <strong>{u.nombre}</strong> &mdash; {u.email}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
