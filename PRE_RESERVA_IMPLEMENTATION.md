# Sistema de Pre-Reserva para Películas Próximamente

## 🎯 Objetivo
Implementar un sistema completo de pre-reserva para películas que aún no se han estrenado, con transición automática a horarios normales después del estreno.

## 📋 Características

### 1. Vista de Película Próximamente
- **Candado visual** en la sección de detalles
- **Botón "Pre-Reservar Ticket"** en lugar de "Comprar Ticket"
- **Horarios de estreno especiales** configurables por película
- **Contador regresivo** hasta el estreno

### 2. Horarios de Estreno
Cada película próximamente tendrá:
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

### 3. Lógica de Transición
1. **Antes del estreno**: Solo pre-reservas disponibles
2. **Día del estreno**: Horarios especiales de estreno activos
3. **1 hora después del último horario**: Transición automática a "Nuevo Estreno"
4. **Como Nuevo Estreno**: Horarios normales cada 2 horas

### 4. Proceso de Pre-Reserva
1. Usuario selecciona horario de estreno
2. Selecciona asientos
3. Paga con Ocean Pay (mismo precio)
4. Recibe ticket con estado "PRE-RESERVADO"
5. El día del estreno, el ticket se activa automáticamente

### 5. Estados de Ticket
- `PRE-RESERVADO`: Ticket comprado antes del estreno
- `ACTIVO`: Ticket válido para usar
- `USADO`: Ticket ya utilizado
- `VENCIDO`: Ticket expirado

## 🔧 Cambios Necesarios

### HTML (index.html)

#### 1. Agregar sección de pre-reserva en detalles
```html
<!-- Candado y Pre-Reserva (solo para próximamente) -->
<div id="detalle-prereserva-section" class="hidden glass rounded-2xl p-6 border-2 border-[var(--accent-purple)]">
  <div class="flex items-center gap-4 mb-4">
    <div class="w-16 h-16 rounded-full bg-[var(--accent-purple)]/20 flex items-center justify-center">
      <i class="fas fa-lock text-[var(--accent-purple)] text-2xl"></i>
    </div>
    <div>
      <h3 class="text-xl font-bold text-[var(--text-primary)]">Película Próximamente</h3>
      <p class="text-sm text-[var(--text-muted)]">Disponible para pre-reserva</p>
    </div>
  </div>
  
  <div class="space-y-4">
    <!-- Contador regresivo -->
    <div class="glass rounded-xl p-4 border border-[var(--border-color)] text-center">
      <p class="text-xs text-[var(--text-muted)] mb-2">Estreno en:</p>
      <div id="detalle-countdown" class="text-2xl font-black text-[var(--accent-cyan)]">
        <span id="countdown-days">0</span>d 
        <span id="countdown-hours">0</span>h 
        <span id="countdown-mins">0</span>m
      </div>
    </div>
    
    <!-- Horarios de estreno -->
    <div>
      <h4 class="font-bold text-[var(--text-primary)] mb-2">Horarios de Estreno</h4>
      <div id="detalle-horarios-estreno" class="grid grid-cols-3 gap-2">
        <!-- Se llenarán dinámicamente -->
      </div>
    </div>
    
    <!-- Info de pre-reserva -->
    <div class="bg-[var(--accent-cyan)]/10 rounded-xl p-4 border border-[var(--accent-cyan)]/30">
      <p class="text-sm text-[var(--text-secondary)]">
        <i class="fas fa-info-circle text-[var(--accent-cyan)] mr-2"></i>
        Pre-reserva tu ticket ahora y asegura tu lugar para el estreno. 
        Tu ticket se activará automáticamente el día del estreno.
      </p>
    </div>
  </div>
</div>
```

#### 2. Modificar botones de acción
```html
<!-- Botones de acción -->
<div class="flex flex-wrap gap-4">
  <!-- Botón normal (películas disponibles) -->
  <button id="detalle-comprar" class="btn-ver flex-1 min-w-[200px] text-lg py-4">
    <i class="fas fa-ticket-alt mr-2"></i>
    Comprar Ticket
  </button>
  
  <!-- Botón pre-reserva (películas próximamente) -->
  <button id="detalle-prereservar" class="hidden btn-ver flex-1 min-w-[200px] text-lg py-4 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)]">
    <i class="fas fa-lock mr-2"></i>
    Pre-Reservar Ticket
  </button>
  
  <button class="px-6 py-4 rounded-xl glass border border-[var(--border-color)] hover:border-[var(--accent-cyan)] transition-all font-semibold">
    <i class="fas fa-share-alt mr-2"></i>
    Compartir
  </button>
</div>
```

### JavaScript (index.html)

#### 1. Agregar horarios de estreno a películas
```javascript
const peliculas = [
  // ... otras películas
  { 
    id:'p16', 
    titulo:'SENTA', 
    descripcion:'🎧 "SENTA" es un track de Eternxlkz, lanzado oficialmente el 28 de noviembre de 2025', 
    poster:'assets/senta.jpg', 
    video:'assets/movies/senta.mp4', 
    proximamente:true, 
    fechaLanzamiento: crearFechaLocal(2025,11,28), 
    duracion:90, 
    genero:'Musical - Phonk', 
    artista:'Eternxlkz',
    horariosEstreno: [
      { hora: 14, minuto: 0 },
      { hora: 17, minuto: 30 },
      { hora: 20, minuto: 0 }
    ]
  }
];
```

#### 2. Función para verificar estado de película
```javascript
function getMovieStatus(pelicula) {
  if (!pelicula.proximamente) {
    return { status: 'disponible', message: 'Disponible ahora' };
  }
  
  const now = new Date();
  const releaseDate = pelicula.fechaLanzamiento;
  
  // Antes del estreno
  if (now < releaseDate) {
    return { 
      status: 'prereserva', 
      message: 'Disponible para pre-reserva',
      countdown: releaseDate - now
    };
  }
  
  // Día del estreno - verificar si pasaron los horarios
  const isSameDay = now.toDateString() === releaseDate.toDateString();
  if (isSameDay && pelicula.horariosEstreno) {
    const lastHorario = pelicula.horariosEstreno[pelicula.horariosEstreno.length - 1];
    const lastShowTime = new Date(releaseDate);
    lastShowTime.setHours(lastHorario.hora, lastHorario.minuto, 0, 0);
    
    // 1 hora después del último horario
    const transitionTime = new Date(lastShowTime.getTime() + 60 * 60 * 1000);
    
    if (now < transitionTime) {
      return { 
        status: 'estreno', 
        message: 'Horarios de estreno activos',
        horariosEstreno: pelicula.horariosEstreno
      };
    }
  }
  
  // Después del estreno - convertir a nuevo estreno
  return { 
    status: 'nuevo_estreno', 
    message: 'Nuevo estreno - Horarios regulares'
  };
}
```

#### 3. Actualizar mostrarDetallesPelicula
```javascript
function mostrarDetallesPelicula(pelicula, sourceElement) {
  // ... código existente de animación ...
  
  // Verificar estado de la película
  const movieStatus = getMovieStatus(pelicula);
  
  // Mostrar/ocultar secciones según estado
  const prereservaSection = document.getElementById('detalle-prereserva-section');
  const comprarBtn = document.getElementById('detalle-comprar');
  const prereservarBtn = document.getElementById('detalle-prereservar');
  
  if (movieStatus.status === 'prereserva') {
    // Mostrar sección de pre-reserva
    prereservaSection?.classList.remove('hidden');
    comprarBtn?.classList.add('hidden');
    prereservarBtn?.classList.remove('hidden');
    
    // Iniciar contador regresivo
    startCountdown(pelicula.fechaLanzamiento);
    
    // Mostrar horarios de estreno
    renderHorariosEstreno(pelicula.horariosEstreno);
    
    // Configurar botón de pre-reserva
    prereservarBtn.onclick = () => abrirPreReserva(pelicula.id);
  } else {
    // Mostrar botón normal de compra
    prereservaSection?.classList.add('hidden');
    comprarBtn?.classList.remove('hidden');
    prereservarBtn?.classList.add('hidden');
    
    comprarBtn.onclick = () => abrirComprarTicket(pelicula.id);
  }
  
  // ... resto del código ...
}
```

#### 4. Función de contador regresivo
```javascript
let countdownInterval = null;

function startCountdown(targetDate) {
  // Limpiar intervalo anterior
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  
  function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;
    
    if (diff <= 0) {
      clearInterval(countdownInterval);
      document.getElementById('detalle-countdown').textContent = '¡Ya disponible!';
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById('countdown-days').textContent = days;
    document.getElementById('countdown-hours').textContent = hours;
    document.getElementById('countdown-mins').textContent = mins;
  }
  
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 60000); // Actualizar cada minuto
}
```

#### 5. Renderizar horarios de estreno
```javascript
function renderHorariosEstreno(horarios) {
  const container = document.getElementById('detalle-horarios-estreno');
  if (!container || !horarios) return;
  
  container.innerHTML = '';
  
  horarios.forEach(h => {
    const btn = document.createElement('button');
    btn.className = 'px-4 py-2 rounded-lg glass border border-[var(--border-color)] hover:border-[var(--accent-cyan)] transition-all text-sm font-semibold';
    btn.textContent = `${String(h.hora).padStart(2, '0')}:${String(h.minuto).padStart(2, '0')}`;
    container.appendChild(btn);
  });
}
```

#### 6. Función de pre-reserva
```javascript
function abrirPreReserva(peliculaId) {
  const pelicula = peliculas.find(p => p.id === peliculaId);
  if (!pelicula) return;
  
  // Verificar que tenga horarios de estreno
  if (!pelicula.horariosEstreno || pelicula.horariosEstreno.length === 0) {
    mostrarToast('Esta película no tiene horarios de estreno configurados');
    return;
  }
  
  // Abrir sección de compra con modo "pre-reserva"
  document.getElementById('section-detalles-pelicula').classList.add('hidden');
  document.getElementById('section-comprar-ticket').classList.remove('hidden');
  
  // Configurar modo pre-reserva
  window.modoPreReserva = true;
  window.peliculaPreReserva = pelicula;
  
  // Poblar select con horarios de estreno
  poblarSelectPeliculaPreReserva(pelicula);
}
```

#### 7. Modificar compra de ticket
```javascript
async function comprarTicket() {
  // ... validaciones existentes ...
  
  const esPreReserva = window.modoPreReserva || false;
  const tipoTicket = esPreReserva ? 'PRE-RESERVADO' : 'ACTIVO';
  
  // Crear ticket
  const ticket = {
    id: Date.now(),
    peliculaId: pelicula.id,
    peliculaTitulo: pelicula.titulo,
    peliculaPoster: pelicula.poster,
    horario: horarioTimestamp,
    asientos: Array.from(window.asientosSeleccionados),
    precio: precioTotal,
    estado: tipoTicket,
    fechaCompra: new Date().toISOString(),
    esPreReserva: esPreReserva
  };
  
  // Si es pre-reserva, agregar fecha de activación
  if (esPreReserva) {
    ticket.fechaActivacion = pelicula.fechaLanzamiento.toISOString();
  }
  
  // ... resto del código de compra ...
}
```

#### 8. Sistema de activación automática
```javascript
// Verificar tickets pre-reservados al cargar
function verificarTicketsPreReservados() {
  const tickets = JSON.parse(localStorage.getItem('oceanCinemasTickets') || '[]');
  const now = new Date();
  let cambios = false;
  
  tickets.forEach(ticket => {
    if (ticket.estado === 'PRE-RESERVADO' && ticket.fechaActivacion) {
      const fechaActivacion = new Date(ticket.fechaActivacion);
      
      // Si ya pasó la fecha de activación, activar el ticket
      if (now >= fechaActivacion) {
        ticket.estado = 'ACTIVO';
        cambios = true;
      }
    }
  });
  
  if (cambios) {
    localStorage.setItem('oceanCinemasTickets', JSON.stringify(tickets));
    mostrarToast('¡Tus tickets pre-reservados han sido activados!');
  }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  verificarTicketsPreReservados();
  // ... resto de inicialización ...
});
```

## 🎨 Estilos CSS Adicionales

```css
/* Badge de pre-reserva */
.prereserva-badge {
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-pink));
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

/* Contador regresivo animado */
#detalle-countdown span {
  display: inline-block;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Horarios de estreno */
#detalle-horarios-estreno button.selected {
  background: var(--accent-purple);
  border-color: var(--accent-purple);
  color: white;
}
```

## 📊 Flujo Completo

```
1. Usuario ve película "Próximamente"
   ↓
2. Hace clic en "Ver ahora"
   ↓
3. Ve candado + contador + horarios de estreno
   ↓
4. Hace clic en "Pre-Reservar Ticket"
   ↓
5. Selecciona horario de estreno
   ↓
6. Selecciona asientos
   ↓
7. Paga con Ocean Pay
   ↓
8. Recibe ticket con estado "PRE-RESERVADO"
   ↓
9. Día del estreno: ticket se activa automáticamente
   ↓
10. Usuario puede entrar a la sala normalmente
```

## 🔄 Transición Automática

```javascript
// Verificar y actualizar estado de películas
function actualizarEstadoPeliculas() {
  peliculas.forEach(pelicula => {
    const status = getMovieStatus(pelicula);
    
    if (status.status === 'nuevo_estreno' && pelicula.proximamente) {
      // Convertir a nuevo estreno
      pelicula.proximamente = false;
      pelicula.nuevoEstreno = true;
      
      // Generar horarios normales
      if (!pelicula.horarios || pelicula.horarios.length === 0) {
        generarHorariosNormales(pelicula);
      }
    }
  });
}

// Ejecutar cada hora
setInterval(actualizarEstadoPeliculas, 60 * 60 * 1000);
```

## ✅ Checklist de Implementación

- [ ] Agregar HTML de sección de pre-reserva
- [ ] Agregar horarios de estreno a película SENTA
- [ ] Implementar función getMovieStatus()
- [ ] Actualizar mostrarDetallesPelicula()
- [ ] Implementar contador regresivo
- [ ] Implementar renderizado de horarios de estreno
- [ ] Crear función abrirPreReserva()
- [ ] Modificar comprarTicket() para pre-reservas
- [ ] Implementar verificación automática de tickets
- [ ] Implementar transición automática de películas
- [ ] Agregar estilos CSS
- [ ] Probar flujo completo
