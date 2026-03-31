# Sistema de Pre-Reserva Ocean Cinemas - Implementación Completa

## 🎯 Sistema Implementado

### ✅ Frontend (Ocean Cinemas)
- **Detección de películas próximamente** con candado visual
- **Contador regresivo** hasta el estreno
- **Horarios de estreno** configurables por película
- **Botón "Pre-Reservar Ticket"** con gradiente morado
- **Integración completa con Ocean Pay**
- **Verificación de disponibilidad de asientos** en tiempo real
- **Activación automática** de pre-reservas al cargar la página

### ✅ Backend (server.js)
- **Tabla `ocean_cinemas_prereservas`** con todos los campos necesarios
- **5 endpoints API** completos para el sistema
- **Verificación de saldos AquaBux** antes de procesar
- **Transacciones atómicas** para evitar conflictos
- **Sistema de activación automática** de pre-reservas

## 📋 Endpoints Implementados

### 1. Crear Pre-Reserva
```http
POST https://owsdatabase.onrender.com/ocean-cinemas/prereserva
Authorization: Bearer {token}

Body:
{
  "peliculaId": "p16",
  "peliculaTitulo": "SENTA",
  "horarioEstreno": "2025-11-28T14:00:00.000Z",
  "asientos": ["A1", "A2"],
  "precioTotal": 300
}

Response:
{
  "success": true,
  "prereserva": {...},
  "newBalance": 1200
}
```

### 2. Obtener Pre-Reservas del Usuario
```http
GET https://owsdatabase.onrender.com/ocean-cinemas/prereservas/{userId}
Authorization: Bearer {token}

Response:
[
  {
    "id": 1,
    "pelicula_titulo": "SENTA",
    "estado": "PRE-RESERVADO",
    "fecha_activacion": "2025-11-28T14:00:00.000Z",
    ...
  }
]
```

### 3. Verificar Disponibilidad de Asientos
```http
POST https://owsdatabase.onrender.com/ocean-cinemas/verificar-asientos

Body:
{
  "peliculaId": "p16",
  "horarioEstreno": "2025-11-28T14:00:00.000Z",
  "asientos": ["A1", "A2"]
}

Response:
{
  "disponible": true,
  "conflictos": [],
  "asientosReservados": ["B1", "B2"]
}
```

### 4. Activar Pre-Reservas
```http
POST https://owsdatabase.onrender.com/ocean-cinemas/activar-prereservas

Response:
{
  "success": true,
  "activadas": 5,
  "prereservas": [...]
}
```

### 5. Estadísticas
```http
GET https://owsdatabase.onrender.com/ocean-cinemas/stats-prereservas

Response:
{
  "total": 25,
  "preReservadas": 15,
  "activadas": 10,
  "porPelicula": [...]
}
```

## 🗄️ Estructura de Base de Datos

### Tabla: `ocean_cinemas_prereservas`
```sql
CREATE TABLE ocean_cinemas_prereservas (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  pelicula_id TEXT NOT NULL,
  pelicula_titulo TEXT NOT NULL,
  horario_estreno TIMESTAMP NOT NULL,
  asientos TEXT[] NOT NULL,
  precio_total INTEGER NOT NULL,
  estado TEXT NOT NULL DEFAULT 'PRE-RESERVADO',
  fecha_compra TIMESTAMP DEFAULT NOW(),
  fecha_activacion TIMESTAMP,
  ocean_pay_tx_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Índices
- `idx_prereservas_user` en `user_id`
- `idx_prereservas_pelicula` en `pelicula_id`

## 🔄 Flujo Completo de Pre-Reserva

### 1. Usuario ve película próximamente
- Se muestra candado con contador regresivo
- Horarios de estreno disponibles
- Botón "Pre-Reservar Ticket"

### 2. Proceso de pre-reserva
```javascript
// 1. Verificar vinculación Ocean Pay
if (!opToken) {
  mostrarToast('Debes vincular tu cuenta de Ocean Pay');
  return;
}

// 2. Abrir sección de compra en modo pre-reserva
window.modoPreReserva = true;
abrirPreReserva(peliculaId);

// 3. Usuario selecciona horario y asientos
// 4. Verificar disponibilidad
const verificacion = await fetch('https://owsdatabase.onrender.com/ocean-cinemas/verificar-asientos', {...});

// 5. Procesar pago con Ocean Pay
const result = await fetch('https://owsdatabase.onrender.com/ocean-cinemas/prereserva', {
  headers: { 'Authorization': `Bearer ${opToken}` },
  ...
});
```

### 3. Activación automática
```javascript
// Al cargar la página
verificarPreReservas();

// Endpoint que se ejecuta periódicamente
POST https://owsdatabase.onrender.com/ocean-cinemas/activar-prereservas
```

## 💰 Integración con Ocean Pay

### Verificación de Saldo
```sql
SELECT aquabux FROM ocean_pay_users 
WHERE id = $1 FOR UPDATE
```

### Descuento de AquaBux
```sql
UPDATE ocean_pay_users 
SET aquabux = aquabux - $1 
WHERE id = $2
```

### Registro de Transacción
```sql
INSERT INTO ocean_pay_txs 
(user_id, concepto, monto, origen)
VALUES ($1, 'Pre-reserva: SENTA', -300, 'Ocean Cinemas')
```

## 🎬 Estados de Pre-Reserva

### PRE-RESERVADO
- Estado inicial después de la compra
- Ticket pagado pero no activo
- Se activa automáticamente en la fecha de estreno

### ACTIVO
- Pre-reserva activada el día del estreno
- Usuario puede entrar a la sala
- Funciona como ticket normal

### USADO
- Ticket ya utilizado para entrar
- Estado final

### VENCIDO
- Ticket que no se usó después del horario
- Se marca automáticamente

## 🔧 Configuración de Película

### Ejemplo: SENTA
```javascript
{
  id: 'p16',
  titulo: 'SENTA',
  proximamente: true,
  fechaLanzamiento: crearFechaLocal(2025, 11, 28),
  horariosEstreno: [
    { hora: 14, minuto: 0 },  // 14:00
    { hora: 17, minuto: 30 }, // 17:30
    { hora: 20, minuto: 0 }   // 20:00
  ]
}
```

## 🚀 Funciones JavaScript Clave

### `abrirPreReserva(peliculaId)`
- Configura modo pre-reserva
- Abre sección de compra
- Pobla horarios de estreno

### `procesarPreReserva()`
- Verifica disponibilidad de asientos
- Procesa pago con Ocean Pay
- Guarda pre-reserva local y servidor

### `verificarPreReservas()`
- Se ejecuta al cargar la página
- Activa pre-reservas que llegaron a su fecha
- Actualiza localStorage

### `poblarSelectPreReserva(pelicula)`
- Configura interfaz para pre-reserva
- Muestra horarios de estreno
- Agrega información específica

## 🎨 Estilos Visuales

### Candado y Contador
- Icono de candado morado
- Contador animado con pulse
- Cards glass con bordes morados

### Botón Pre-Reservar
- Gradiente morado a rosa
- Efecto hover con elevación
- Icono de candado

### Modo Pre-Reserva
- Background con gradiente sutil
- Títulos en color morado
- Información destacada

## 📱 Compatibilidad

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Mobile (iOS Safari, Android Chrome)
- ✅ Tablet (iPad, Android tablets)

## 🔒 Seguridad

### Autenticación
- JWT tokens para todas las operaciones
- Verificación de usuario en cada endpoint
- Usuarios solo pueden ver sus propias pre-reservas

### Validaciones
- Verificación de saldo antes de procesar
- Validación de disponibilidad de asientos
- Transacciones atómicas en base de datos

### Prevención de Conflictos
- `FOR UPDATE` en consultas críticas
- Verificación doble de asientos
- Rollback automático en errores

## 📊 Monitoreo

### Logs del Servidor
```javascript
console.log('✅ Pre-reserva creada:', prereservaId);
console.log('🔄 Activando pre-reservas...');
console.error('❌ Error en pre-reserva:', error);
```

### Estadísticas Disponibles
- Total de pre-reservas
- Pre-reservas activas vs activadas
- Popularidad por película
- Ingresos por pre-reservas

## 🎁 Sistema de Recompensas Gratuitas

Para resolver el problema de "huevo y gallina" (necesitas AquaBux para ver películas, pero ganas AquaBux viendo películas), implementamos un sistema de recompensas gratuitas:

### Recompensas Disponibles

#### 1. Bono de Bienvenida
- **Cantidad**: 500 AquaBux
- **Frecuencia**: Solo una vez
- **Requisito**: Vincular cuenta de Ocean Pay
- **Descripción**: Regalo de bienvenida para nuevos usuarios

#### 2. Recompensa Diaria
- **Cantidad**: 100 AquaBux
- **Frecuencia**: Cada 24 horas
- **Requisito**: Cuenta vinculada
- **Descripción**: Vuelve cada día para reclamar tu recompensa

#### 3. Ver Anuncios
- **Cantidad**: 50 AquaBux por anuncio
- **Frecuencia**: Máximo 3 al día
- **Duración**: 5 segundos por anuncio
- **Descripción**: Mira un breve anuncio y gana AquaBux

#### 4. Compartir en Redes
- **Cantidad**: 150 AquaBux
- **Frecuencia**: Máximo 2 al día
- **Requisito**: Compartir enlace de Ocean Cinemas
- **Descripción**: Comparte con tus amigos y gana recompensas

### Cálculo de AquaBux Gratuitos

**Primer día (nuevo usuario)**:
- Bono de Bienvenida: 500 AquaBux
- Recompensa Diaria: 100 AquaBux
- Ver 3 Anuncios: 150 AquaBux
- Compartir 2 veces: 300 AquaBux
- **Total primer día**: 1,050 AquaBux

**Días siguientes (diario)**:
- Recompensa Diaria: 100 AquaBux
- Ver 3 Anuncios: 150 AquaBux
- Compartir 2 veces: 300 AquaBux
- **Total diario**: 550 AquaBux

### Precios de Referencia
- Ticket normal: 250 AquaBux
- Ticket premium (ver ahora): 400 AquaBux
- Pre-reserva: 150 AquaBux por asiento

Con el bono de bienvenida (500 AquaBux), un nuevo usuario puede:
- Comprar 2 tickets normales, o
- Comprar 1 ticket premium, o
- Pre-reservar 3 asientos

### Implementación Técnica

#### LocalStorage
```javascript
{
  "oceanCinemasClaims": {
    "bienvenida": true,
    "daily": true,
    "dailyDate": "Wed Nov 27 2024",
    "ads": true,
    "adsDate": "Wed Nov 27 2024",
    "adsCount": 2,
    "shares": true,
    "sharesDate": "Wed Nov 27 2024",
    "sharesCount": 1
  }
}
```

#### Funciones JavaScript
- `actualizarEstadoRecompensas()` - Verifica límites y actualiza UI
- `changeAquabux(amount, concepto, origen)` - Procesa la recompensa
- Validación de límites diarios
- Persistencia en localStorage

### Interfaz de Usuario

**Botón "Gratis"**:
- Ubicado junto al saldo de AquaBux
- Gradiente amarillo-naranja
- Icono de regalo

**Modal de Recompensas**:
- 4 tarjetas con recompensas disponibles
- Indicadores de estado (disponible/reclamado/límite)
- Contadores de uso diario
- Temporizadores para próxima disponibilidad

## 🚀 Próximas Mejoras

- [ ] Notificaciones push para activación
- [ ] Recordatorios por email
- [ ] Cancelación de pre-reservas
- [ ] Transferencia de pre-reservas
- [ ] Descuentos por pre-reserva temprana
- [ ] Sistema de lista de espera
- [ ] Integración con calendario
- [ ] Códigos promocionales
- [ ] Logros y recompensas adicionales
- [ ] Sistema de referidos (invita amigos)

## 🎯 Uso del Sistema

### Para Usuarios
1. Vincular cuenta Ocean Pay
2. Ver película próximamente (SENTA)
3. Hacer clic en "Pre-Reservar Ticket"
4. Seleccionar horario de estreno
5. Elegir asientos
6. Confirmar pago
7. Esperar activación automática

### Para Administradores
1. Configurar horarios de estreno en películas
2. Monitorear estadísticas
3. Ejecutar activación manual si es necesario
4. Revisar logs de transacciones

## 🔧 Configuración Técnica

### Variables de Entorno
```env
STUDIO_SECRET=tu_secret_jwt
DATABASE_URL=postgresql://...
```

### Inicialización
```javascript
// Las tablas se crean automáticamente al iniciar el servidor
ensurePreReservasTables();
```

### Precio por Asiento
```javascript
const precioTotal = asientosSeleccionados.length * 150; // 150 AquaBux por asiento
```

## ✅ Testing

### Probar Pre-Reserva
1. Vincular Ocean Pay con saldo suficiente (mínimo 300 AquaBux)
2. Ir a Ocean Cinemas
3. Ver película SENTA (próximamente)
4. Hacer clic en "Pre-Reservar Ticket"
5. Seleccionar horario de estreno
6. Elegir 2 asientos
7. Confirmar compra
8. Verificar que se descuenten los AquaBux
9. Verificar que aparezca en localStorage

### Probar Activación
1. Modificar `fecha_activacion` en la base de datos a una fecha pasada
2. Recargar Ocean Cinemas
3. Verificar que se active automáticamente
4. Verificar que aparezca el toast de activación

¡El sistema de pre-reserva está completamente implementado y listo para usar! 🎬✨
