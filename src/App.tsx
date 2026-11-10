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
  idioma: string;
  creado_en: string;
};

type AuthUser = {
  id: number;
  email: string;
  nombre: string;
  idioma: string;
  token: string;
};

type Vista = 'login' | 'register' | 'dashboard';

type Idioma = 'es' | 'en' | 'ru' | 'hi';

const IDIOMAS: Record<Idioma, { codigo: Idioma; nombre: string; nativo: string }> = {
  es: { codigo: 'es', nombre: 'Español', nativo: 'Español' },
  en: { codigo: 'en', nombre: 'English', nativo: 'English' },
  ru: { codigo: 'ru', nombre: 'Russian', nativo: 'Русский' },
  hi: { codigo: 'hi', nombre: 'Hindi', nativo: 'हिन्दी' }
};

// ---------- TRADUCCIONES ----------
const TRADUCCIONES: Record<Idioma, Record<string, string>> = {
  es: {
    'app.title': 'Panel de Administración',
    'app.conectado_como': 'Conectado como',
    'app.salir': 'Salir',
    'app.idioma': 'Idioma',

    'login.titulo': 'Iniciar sesión',
    'login.email': 'Email',
    'login.contrasena': 'Contraseña',
    'login.ingresar': 'Ingresar',
    'login.no_cuenta': '¿No tienes cuenta?',
    'login.registrarse': 'Regístrate',
    'login.ya_cuenta': '¿Ya tienes cuenta?',
    'login.inicia_sesion': 'Inicia sesión',

    'register.titulo': 'Crear cuenta',
    'register.nombre': 'Nombre',
    'register.registrarse': 'Registrarse',

    'dashboard.nuevo_item': 'Nuevo Item',
    'dashboard.editar_item': 'Editar Item',
    'dashboard.titulo': 'Título',
    'dashboard.descripcion': 'Descripción',
    'dashboard.imagen': 'Imagen (opcional)',
    'dashboard.crear_item': 'Crear Item',
    'dashboard.guardar_cambios': 'Guardar cambios',
    'dashboard.cancelar': 'Cancelar',
    'dashboard.buscar_filtrar': 'Buscar / Filtrar',
    'dashboard.buscar_placeholder': 'Escribe para filtrar...',
    'dashboard.exportar_csv': 'Exportar CSV',
    'dashboard.limpiar_filtro': 'Limpiar filtro',
    'dashboard.items': 'Items',
    'dashboard.sin_items': 'No hay items registrados.',
    'dashboard.editar': 'Editar',
    'dashboard.eliminar': 'Eliminar',
    'dashboard.creado': 'Creado',
    'dashboard.usuario': 'Usuario',
    'dashboard.desconocido': 'Desconocido',
    'dashboard.usuarios': 'Usuarios registrados',
    'dashboard.sin_usuarios': 'No hay usuarios.',
    'dashboard.confirmar_eliminar': '¿Eliminar este item?',

    'msg.titulo_requerido': 'El título es requerido',
    'msg.item_creado': 'Item creado',
    'msg.item_actualizado': 'Item actualizado',
    'msg.error_guardar': 'Error guardando item',
    'msg.item_eliminado': 'Item eliminado',
    'msg.error_eliminar': 'Error eliminando',
    'msg.csv_exportado': 'CSV exportado',
    'msg.error_exportar': 'Error exportando',
    'msg.error_conexion': 'Error de conexión',
    'msg.credenciales_invalidas': 'Credenciales inválidas',
    'msg.bienvenido': 'Bienvenido de nuevo',
    'msg.registro_exitoso': 'Registro exitoso',
    'msg.sesion_cerrada': 'Sesión cerrada',
    'msg.email_ya_registrado': 'El email ya está registrado',
    'msg.contenido_invalido': 'Contenido inválido',
    'msg.idioma_actualizado': 'Idioma actualizado'
  },

  en: {
    'app.title': 'Admin Panel',
    'app.conectado_como': 'Connected as',
    'app.salir': 'Logout',
    'app.idioma': 'Language',

    'login.titulo': 'Sign in',
    'login.email': 'Email',
    'login.contrasena': 'Password',
    'login.ingresar': 'Sign in',
    'login.no_cuenta': "Don't have an account?",
    'login.registrarse': 'Register',
    'login.ya_cuenta': 'Already have an account?',
    'login.inicia_sesion': 'Sign in',

    'register.titulo': 'Create account',
    'register.nombre': 'Name',
    'register.registrarse': 'Register',

    'dashboard.nuevo_item': 'New Item',
    'dashboard.editar_item': 'Edit Item',
    'dashboard.titulo': 'Title',
    'dashboard.descripcion': 'Description',
    'dashboard.imagen': 'Image (optional)',
    'dashboard.crear_item': 'Create Item',
    'dashboard.guardar_cambios': 'Save changes',
    'dashboard.cancelar': 'Cancel',
    'dashboard.buscar_filtrar': 'Search / Filter',
    'dashboard.buscar_placeholder': 'Type to filter...',
    'dashboard.exportar_csv': 'Export CSV',
    'dashboard.limpiar_filtro': 'Clear filter',
    'dashboard.items': 'Items',
    'dashboard.sin_items': 'No items registered.',
    'dashboard.editar': 'Edit',
    'dashboard.eliminar': 'Delete',
    'dashboard.creado': 'Created',
    'dashboard.usuario': 'User',
    'dashboard.desconocido': 'Unknown',
    'dashboard.usuarios': 'Registered users',
    'dashboard.sin_usuarios': 'No users.',
    'dashboard.confirmar_eliminar': 'Delete this item?',

    'msg.titulo_requerido': 'Title is required',
    'msg.item_creado': 'Item created',
    'msg.item_actualizado': 'Item updated',
    'msg.error_guardar': 'Error saving item',
    'msg.item_eliminado': 'Item deleted',
    'msg.error_eliminar': 'Error deleting',
    'msg.csv_exportado': 'CSV exported',
    'msg.error_exportar': 'Error exporting',
    'msg.error_conexion': 'Connection error',
    'msg.credenciales_invalidas': 'Invalid credentials',
    'msg.bienvenido': 'Welcome back',
    'msg.registro_exitoso': 'Registration successful',
    'msg.sesion_cerrada': 'Session closed',
    'msg.email_ya_registrado': 'Email already registered',
    'msg.contenido_invalido': 'Invalid content',
    'msg.idioma_actualizado': 'Language updated'
  },

  ru: {
    'app.title': 'Панель администратора',
    'app.conectado_como': 'Подключён как',
    'app.salir': 'Выйти',
    'app.idioma': 'Язык',

    'login.titulo': 'Войти',
    'login.email': 'Электронная почта',
    'login.contrasena': 'Пароль',
    'login.ingresar': 'Войти',
    'login.no_cuenta': 'Нет аккаунта?',
    'login.registrarse': 'Зарегистрироваться',
    'login.ya_cuenta': 'Уже есть аккаунт?',
    'login.inicia_sesion': 'Войти',

    'register.titulo': 'Создать аккаунт',
    'register.nombre': 'Имя',
    'register.registrarse': 'Зарегистрироваться',

    'dashboard.nuevo_item': 'Новый элемент',
    'dashboard.editar_item': 'Редактировать элемент',
    'dashboard.titulo': 'Заголовок',
    'dashboard.descripcion': 'Описание',
    'dashboard.imagen': 'Изображение (необязательно)',
    'dashboard.crear_item': 'Создать элемент',
    'dashboard.guardar_cambios': 'Сохранить изменения',
    'dashboard.cancelar': 'Отмена',
    'dashboard.buscar_filtrar': 'Поиск / Фильтр',
    'dashboard.buscar_placeholder': 'Введите для фильтрации...',
    'dashboard.exportar_csv': 'Экспорт CSV',
    'dashboard.limpiar_filtro': 'Очистить фильтр',
    'dashboard.items': 'Элементы',
    'dashboard.sin_items': 'Элементы не зарегистрированы.',
    'dashboard.editar': 'Редактировать',
    'dashboard.eliminar': 'Удалить',
    'dashboard.creado': 'Создано',
    'dashboard.usuario': 'Пользователь',
    'dashboard.desconocido': 'Неизвестно',
    'dashboard.usuarios': 'Зарегистрированные пользователи',
    'dashboard.sin_usuarios': 'Пользователей нет.',
    'dashboard.confirmar_eliminar': 'Удалить этот элемент?',

    'msg.titulo_requerido': 'Требуется заголовок',
    'msg.item_creado': 'Элемент создан',
    'msg.item_actualizado': 'Элемент обновлён',
    'msg.error_guardar': 'Ошибка сохранения элемента',
    'msg.item_eliminado': 'Элемент удалён',
    'msg.error_eliminar': 'Ошибка удаления',
    'msg.csv_exportado': 'CSV экспортирован',
    'msg.error_exportar': 'Ошибка экспорта',
    'msg.error_conexion': 'Ошибка соединения',
    'msg.credenciales_invalidas': 'Неверные учётные данные',
    'msg.bienvenido': 'С возвращением',
    'msg.registro_exitoso': 'Регистрация успешна',
    'msg.sesion_cerrada': 'Сессия закрыта',
    'msg.email_ya_registrado': 'Электронная почта уже зарегистрирована',
    'msg.contenido_invalido': 'Недопустимый контент',
    'msg.idioma_actualizado': 'Язык обновлён'
  },

  hi: {
    'app.title': 'प्रशासक पैनल',
    'app.conectado_como': 'जुड़े हुए उपयोगकर्ता',
    'app.salir': 'लॉगआउट',
    'app.idioma': 'भाषा',

    'login.titulo': 'साइन इन करें',
    'login.email': 'ईमेल',
    'login.contrasena': 'पासवर्ड',
    'login.ingresar': 'साइन इन करें',
    'login.no_cuenta': 'खाता नहीं है?',
    'login.registrarse': 'रजिस्टर करें',
    'login.ya_cuenta': 'पहले से खाता है?',
    'login.inicia_sesion': 'साइन इन करें',

    'register.titulo': 'खाता बनाएं',
    'register.nombre': 'नाम',
    'register.registrarse': 'रजिस्टर करें',

    'dashboard.nuevo_item': 'नई वस्तु',
    'dashboard.editar_item': 'वस्तु संपादित करें',
    'dashboard.titulo': 'शीर्षक',
    'dashboard.descripcion': 'विवरण',
    'dashboard.imagen': 'छवि (वैकल्पिक)',
    'dashboard.crear_item': 'वस्तु बनाएं',
    'dashboard.guardar_cambios': 'परिवर्तन सहेजें',
    'dashboard.cancelar': 'रद्द करें',
    'dashboard.buscar_filtrar': 'खोजें / फ़िल्टर करें',
    'dashboard.buscar_placeholder': 'फ़िल्टर करने के लिए टाइप करें...',
    'dashboard.exportar_csv': 'सीएसवी निर्यात करें',
    'dashboard.limpiar_filtro': 'फ़िल्टर साफ़ करें',
    'dashboard.items': 'वस्तुएं',
    'dashboard.sin_items': 'कोई वस्तु पंजीकृत नहीं है।',
    'dashboard.editar': 'संपादित करें',
    'dashboard.eliminar': 'हटाएं',
    'dashboard.creado': 'बनाया गया',
    'dashboard.usuario': 'उपयोगकर्ता',
    'dashboard.desconocido': 'अज्ञात',
    'dashboard.usuarios': 'पंजीकृत उपयोगकर्ता',
    'dashboard.sin_usuarios': 'कोई उपयोगकर्ता नहीं।',
    'dashboard.confirmar_eliminar': 'क्या आप इस वस्तु को हटाना चाहते हैं?',

    'msg.titulo_requerido': 'शीर्षक आवश्यक है',
    'msg.item_creado': 'वस्तु बनाई गई',
    'msg.item_actualizado': 'वस्तु अद्यतन की गई',
    'msg.error_guardar': 'वस्तु सहेजने में त्रुटि',
    'msg.item_eliminado': 'वस्तु हटा दी गई',
    'msg.error_eliminar': 'हटाने में त्रुटि',
    'msg.csv_exportado': 'सीएसवी निर्यात किया गया',
    'msg.error_exportar': 'निर्यात करने में त्रुटि',
    'msg.error_conexion': 'कनेक्शन त्रुटि',
    'msg.credenciales_invalidas': 'अमान्य क्रेडेंशियल',
    'msg.bienvenido': 'स्वागत है वापस',
    'msg.registro_exitoso': 'पंजीकरण सफल',
    'msg.sesion_cerrada': 'सत्र बंद',
    'msg.email_ya_registrado': 'ईमेल पहले से पंजीकृत है',
    'msg.contenido_invalido': 'अमान्य सामग्री',
    'msg.idioma_actualizado': 'भाषा अद्यतन की गई'
  }
};

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
  const [idioma, setIdiomaState] = useState<Idioma>(() => {
    const guardado = localStorage.getItem('idioma') as Idioma;
    if (guardado && guardado in IDIOMAS) return guardado;
    return 'es';
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

  // ---------- i18n ----------
  const t = (key: string): string => {
    return TRADUCCIONES[idioma][key] || key;
  };

  function cambiarIdioma(nuevoIdioma: Idioma) {
    setIdiomaState(nuevoIdioma);
    localStorage.setItem('idioma', nuevoIdioma);
  }

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
  }, [auth, filtro, idioma]);

  async function cargarItems() {
    try {
      const qs = filtro ? `?search=${encodeURIComponent(filtro)}` : '';
      const res = await fetch(`${API_URL}/api/items${qs}`, { headers: headersAuth() });
      if (res.status === 401 || res.status === 403) { cerrarSesion(); return; }
      const data = await res.json();
      setItems(data);
    } catch (e) {
      mostrar(t('msg.error_conexion'), 'error');
    }
  }

  async function cargarUsuarios() {
    try {
      const res = await fetch(`${API_URL}/api/usuarios`, { headers: headersAuth() });
      if (res.status === 401 || res.status === 403) { cerrarSesion(); return; }
      const data = await res.json();
      setUsuarios(data);
    } catch (e) {
      mostrar(t('msg.error_conexion'), 'error');
    }
  }

  // ---------- auth ----------

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, idioma }),
      });
      const data = await res.json();
      if (!res.ok) { mostrar(data.error || t('msg.error_conexion'), 'error'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      setAuth({ ...data.usuario, token: data.token });
      cambiarIdioma(data.usuario.idioma as Idioma);
      setVista('dashboard');
      mostrar(t('msg.registro_exitoso'), 'ok');
    } catch (err) { mostrar(t('msg.error_conexion'), 'error'); }
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
        mostrar(data.error || t('msg.credenciales_invalidas'), 'error');
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      setAuth({ ...data.usuario, token: data.token });
      cambiarIdioma(data.usuario.idioma as Idioma);
      setVista('dashboard');
      mostrar(t('msg.bienvenido'), 'ok');
    } catch (err) { mostrar(t('msg.error_conexion'), 'error'); }
  }

  async function cambiarIdiomaUsuario(nuevoIdioma: Idioma) {
    try {
      const res = await fetch(`${API_URL}/api/usuarios/me/idioma`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth?.token}` },
        body: JSON.stringify({ idioma: nuevoIdioma }),
      });
      const data = await res.json();
      if (!res.ok) { mostrar(data.error || t('msg.error_conexion'), 'error'); return; }
      // Actualizar token y auth con nuevo idioma
      const nuevoAuth: AuthUser = { ...auth!, idioma: nuevoIdioma, token: data.token };
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify({ ...auth!, idioma: nuevoIdioma }));
      setAuth(nuevoAuth);
      cambiarIdioma(nuevoIdioma);
      mostrar(t('msg.idioma_actualizado'), 'ok');
    } catch (err) { mostrar(t('msg.error_conexion'), 'error'); }
  }

  function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('idioma');
    setAuth(null);
    setVista('login');
    setItems([]);
    mostrar(t('msg.sesion_cerrada'), 'info');
  }

  // ---------- items ----------

  async function guardarItem(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) { mostrar(t('msg.titulo_requerido'), 'error'); return; }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    if (imagenFile) formData.append('imagen', imagenFile);

    try {
      const url = editId ? `${API_URL}/api/items/${editId}` : `${API_URL}/api/items`;
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: headersAuth(), body: formData });
      if (res.status === 401 || res.status === 403) { cerrarSesion(); return; }
      if (!res.ok) { const d = await res.json(); mostrar(d.error || t('msg.contenido_invalido'), 'error'); return; }
      mostrar(editId ? t('msg.item_actualizado') : t('msg.item_creado'), 'ok');
      resetFormulario();
      cargarItems();
    } catch (err) { mostrar(t('msg.error_guardar'), 'error'); }
  }

  async function eliminarItem(id: number) {
    if (!confirm(t('dashboard.confirmar_eliminar'))) return;
    try {
      const res = await fetch(`${API_URL}/api/items/${id}`, { method: 'DELETE', headers: headersAuth() });
      if (res.status === 401 || res.status === 403) { cerrarSesion(); return; }
      mostrar(t('msg.item_eliminado'), 'ok');
      cargarItems();
    } catch (err) { mostrar(t('msg.error_eliminar'), 'error'); }
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
      mostrar(t('msg.csv_exportado'), 'ok');
    } catch (err) { mostrar(t('msg.error_exportar'), 'error'); }
  }

  // ---------- pantallas ----------

  const authHeader = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{t('app.conectado_como')} <strong>{auth?.nombre}</strong></span>
      <select
        value={idioma}
        onChange={(e) => cambiarIdiomaUsuario(e.target.value as Idioma)}
        style={{
          background: '#000',
          color: '#ffaa00',
          border: '1px solid #330000',
          padding: '0.25rem 0.5rem',
          fontSize: '0.85rem',
          borderRadius: '4px',
          cursor: 'pointer',
          marginLeft: '0.5rem'
        }}
      >
        {Object.values(IDIOMAS).map((idi) => (
          <option key={idi.codigo} value={idi.codigo}>{idi.nativo}</option>
        ))}
      </select>
      <button className="btn" onClick={cerrarSesion} style={{ background: '#000', color: '#ff1a1a', padding: '0.4rem 0.8rem', marginLeft: '0.5rem' }}>{t('app.salir')}</button>
    </div>
  );

  if (vista === 'login') {
    return (
      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2>{t('login.titulo')}</h2>
          <select
            value={idioma}
            onChange={(e) => cambiarIdioma(e.target.value as Idioma)}
            style={{
              background: '#000',
              color: '#ffaa00',
              border: '1px solid #330000',
              padding: '0.25rem 0.5rem',
              fontSize: '0.85rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {Object.values(IDIOMAS).map((idi) => (
              <option key={idi.codigo} value={idi.codigo}>{idi.nativo}</option>
            ))}
          </select>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>{t('login.email')}</label>
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
            <label>{t('login.contrasena')}</label>
            <input
              ref={passwordRef}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={shake ? 'input-error shake' : ''}
            />
          </div>
          <button type="submit" className="btn">{t('login.ingresar')}</button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', opacity: 0.8 }}>
          {t('login.no_cuenta')} <a href="#" onClick={(e) => { e.preventDefault(); setVista('register'); }} style={{ color: '#ffaa00' }}>{t('login.registrarse')}</a>
        </p>
        {mensaje.texto && <p className={`msg ${mensaje.tipo}`}>{mensaje.texto}</p>}
      </div>
    );
  }

  if (vista === 'register') {
    return (
      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2>{t('register.titulo')}</h2>
          <select
            value={idioma}
            onChange={(e) => cambiarIdioma(e.target.value as Idioma)}
            style={{
              background: '#000',
              color: '#ffaa00',
              border: '1px solid #330000',
              padding: '0.25rem 0.5rem',
              fontSize: '0.85rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {Object.values(IDIOMAS).map((idi) => (
              <option key={idi.codigo} value={idi.codigo}>{idi.nativo}</option>
            ))}
          </select>
        </div>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>{t('register.nombre')}</label>
            <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t('login.email')}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t('login.contrasena')}</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn">{t('register.registrarse')}</button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', opacity: 0.8 }}>
          {t('login.ya_cuenta')} <a href="#" onClick={(e) => { e.preventDefault(); setVista('login'); }} style={{ color: '#ffaa00' }}>{t('login.inicia_sesion')}</a>
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
          <h1>{t('app.title')}</h1>
          {authHeader}
        </div>
      </div>

      {mensaje.texto && <p className={`msg ${mensaje.tipo}`}>{mensaje.texto}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <h3>{editId ? t('dashboard.editar_item') : t('dashboard.nuevo_item')}</h3>
          <form onSubmit={guardarItem}>
            <div className="form-group">
              <label>{t('dashboard.titulo')}</label>
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Reporte mensual" required />
            </div>
            <div className="form-group">
              <label>{t('dashboard.descripcion')}</label>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Detalles del item" rows="3" />
            </div>
            <div className="form-group">
              <label>{t('dashboard.imagen')}</label>
              <input type="file" accept="image/*" onChange={(e) => { if (e.target.files) setImagenFile(e.target.files[0]); }} />
              {imagenActual && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img src={`${API_URL}${imagenActual}`} alt="preview" style={{ maxWidth: '150px', border: '1px solid #330000', marginTop: '0.5rem' }} />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn">{editId ? t('dashboard.guardar_cambios') : t('dashboard.crear_item')}</button>
              <button type="button" className="btn" onClick={resetFormulario} style={{ background: '#000', color: '#ff1a1a' }}>{t('dashboard.cancelar')}</button>
            </div>
          </form>
        </div>

        <div className="card">
          <h3>{t('dashboard.buscar_filtrar')}</h3>
          <div className="form-group">
            <label>{t('dashboard.buscar_placeholder')}</label>
            <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder={t('dashboard.buscar_placeholder')} />
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button className="btn" onClick={exportarCSV} style={{ background: '#000', color: '#ff1a1a', flex: 1 }}>{t('dashboard.exportar_csv')}</button>
            <button className="btn" onClick={() => setFiltro('')} style={{ flex: 1 }}>{t('dashboard.limpiar_filtro')}</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>{t('dashboard.items')} ({items.length})</h3>
        {items.length === 0 ? (
          <div className="empty">{t('dashboard.sin_items')}</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="item">
              <div className="item-info">
                {item.imagen ? (
                  <img src={`${API_URL}${item.imagen}`} alt="item" className="item-img" />
                ) : (
                  <div className="item-img-placeholder">{t('dashboard.sin_items'.replace('No hay ', 'Sin '))}</div>
                )}
                <div className="item-text">
                  <h4>{item.titulo}</h4>
                  <p>{item.descripcion || 'Sin descripción'}</p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                    {t('dashboard.creado')}: {new Date(item.creado_en).toLocaleDateString()} &middot;
                    {t('dashboard.usuario')}: {item.usuario_nombre || t('dashboard.desconocido')}
                  </p>
                </div>
              </div>
              <div className="item-actions">
                <button className="btn" onClick={() => editarItem(item)} style={{ background: '#000', color: '#ffaa00', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>{t('dashboard.editar')}</button>
                <button className="btn" onClick={() => eliminarItem(item.id)} style={{ background: '#000', color: '#ff1a1a', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>{t('dashboard.eliminar')}</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>{t('dashboard.usuarios')} ({usuarios.length})</h3>
        {usuarios.length === 0 ? (
          <div className="empty">{t('dashboard.sin_usuarios')}</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {usuarios.map((u) => (
              <li key={u.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,26,26,0.1)' }}>
                <strong>{u.nombre}</strong> &mdash; {u.email} <span style={{ fontSize: '0.8rem', opacity: 0.6, color: '#ffaa00' }}>( {u.idioma } )</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
