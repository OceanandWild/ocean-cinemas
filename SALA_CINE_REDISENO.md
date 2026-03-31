# Rediseño Completo de la Sala de Cine - Ocean Cinemas

## 🎬 Visión General

Transformar la experiencia de ver películas en Ocean Cinemas con:
- Sala de cine inmersiva y profesional
- Sistema de recompensas inteligente basado en visualización
- Tickets que se "rompen" después de usarse
- Tracking completo de la experiencia

## 🎨 Nueva Sala de Cine

### Diseño Visual

**Pantalla Principal**:
- Modo cine completo (fullscreen opcional)
- Controles personalizados estilo Netflix/Disney+
- Barra de progreso con preview
- Indicador de recompensas en tiempo real
- Overlay de información sutil

**Elementos de la Sala**:
```
┌─────────────────────────────────────────┐
│  🎬 [Título de la Película]        ⏱️ 45:23 │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│           [VIDEO PLAYER]                │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  ▶️ ⏸️  ⏮️ ⏭️  🔊 ⚙️  💰 +25 AB  [Salir] │
└─────────────────────────────────────────┘
```

### Características

1. **Controles Personalizados**:
   - Play/Pause
   - Retroceder 10s / Adelantar 10s
   - Control de volumen
   - Configuración de calidad
   - Modo pantalla completa
   - Subtítulos (si disponible)

2. **Indicador de Recompensas**:
   - Contador en tiempo real de AquaBux ganados
   - Animación al ganar recompensas
   - Multiplicador por ver sin pausas

3. **Información Contextual**:
   - Tiempo transcurrido / Total
   - Porcentaje de progreso
   - Asientos asignados
   - Estado del ticket

## 💰 Sistema de Recompensas Inteligente

### Fórmula de Cálculo

```javascript
Recompensa Base = Duración de la Película (min) × 0.5 AquaBux/min
Multiplicador de Continuidad = 1.0 - (Pausas × 0.1)
Multiplicador de Completitud = Tiempo Visto / Duración Total
Bonus por Completar = 50 AquaBux (si ve >95%)

Recompensa Final = (Recompensa Base × Multiplicador de Continuidad × Multiplicador de Completitud) + Bonus
```

### Ejemplos

**Película de 90 minutos**:
- Base: 90 × 0.5 = 45 AquaBux
- Sin pausas, completa: 45 × 1.0 × 1.0 + 50 = **95 AquaBux**
- Con 2 pausas, completa: 45 × 0.8 × 1.0 + 50 = **86 AquaBux**
- Sin pausas, 50% visto: 45 × 1.0 × 0.5 + 0 = **22.5 AquaBux**

**Película de 120 minutos**:
- Base: 120 × 0.5 = 60 AquaBux
- Sin pausas, completa: 60 × 1.0 × 1.0 + 50 = **110 AquaBux**

### Reglas

1. **Pausas Penalizan**: Cada pausa reduce el multiplicador en 10%
2. **Salir Temprano**: Solo recibes lo acumulado hasta ese momento
3. **Bonus de Completitud**: 50 AquaBux extra si ves >95%
4. **Máximo de Pausas**: Después de 5 pausas, multiplicador = 0.5 (mínimo)
5. **Una Vez por Ticket**: Cada ticket solo da recompensa una vez

## 🎟️ Sistema de Tickets "Rotos"

### Estados del Ticket

```javascript
{
  id: 'ticket_123',
  estado: 'NUEVO',      // NUEVO → EN_USO → USADO → VENCIDO
  usado: false,
  fechaUso: null,
  recompensaObtenida: 0,
  tiempoVisto: 0,
  pausas: 0,
  completado: false
}
```

### Visualización

**Ticket Nuevo** (Verde):
```
┌─────────────────────┐
│  ✓ TICKET VÁLIDO    │
│  🎬 Película X      │
│  🪑 A1, A2          │
│  ⏰ 19:30           │
│  [VER AHORA]        │
└─────────────────────┘
```

**Ticket Usado** (Gris, efecto rasgado):
```
┌─────────────────────┐
│  ✗ TICKET USADO     │
│  🎬 Película X      │
│  💰 +95 AquaBux     │
│  ✓ Completado       │
│  [DETALLES]         │
└─────────────────────┘
```

**Ticket Vencido** (Rojo):
```
┌─────────────────────┐
│  ⏰ VENCIDO          │
│  🎬 Película X      │
│  ❌ No usado        │
│  [ELIMINAR]         │
└─────────────────────┘
```

### Efectos Visuales

1. **Animación de Rotura**:
   - Efecto de papel rasgándose
   - Transición de color verde → gris
   - Marca de "USADO" con sello

2. **CSS para Ticket Roto**:
```css
.ticket-usado {
  position: relative;
  filter: grayscale(0.8);
  opacity: 0.7;
}

.ticket-usado::after {
  content: 'USADO';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  font-size: 3rem;
  font-weight: 900;
  color: rgba(255, 0, 0, 0.3);
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  pointer-events: none;
}

.ticket-rasgado {
  clip-path: polygon(
    0% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 
    5% 100%, 0% 95%, 0% 5%
  );
}
```

## 📊 Tracking de Visualización

### Datos Almacenados

```javascript
{
  ticketId: 'ticket_123',
  peliculaId: 'p1',
  inicioVisualizacion: '2024-11-27T19:30:00',
  finVisualizacion: '2024-11-27T21:15:00',
  duracionTotal: 90, // minutos
  tiempoVisto: 87, // minutos
  pausas: 2,
  momentosPausa: [
    { tiempo: 1200, duracion: 30 }, // segundo 1200, 30s de pausa
    { tiempo: 3600, duracion: 45 }
  ],
  completado: true,
  porcentajeVisto: 96.7,
  recompensaBase: 45,
  multiplicadorContinuidad: 0.8,
  multiplicadorCompletitud: 0.967,
  bonusCompletitud: 50,
  recompensaFinal: 85,
  aquabuxGanados: 85
}
```

### LocalStorage

```javascript
// Historial de visualizaciones
localStorage.setItem('oceanCinemasVisualizaciones', JSON.stringify([
  { ticketId, peliculaId, fecha, recompensa, completado },
  ...
]));

// Tickets actualizados
localStorage.setItem('oceanCinemasTickets', JSON.stringify([
  { id, estado: 'USADO', fechaUso, recompensaObtenida },
  ...
]));
```

## 🎯 Implementación por Fases

### Fase 1: Nueva Sala HTML/CSS ✅
- Estructura HTML de la sala
- Estilos CSS profesionales
- Controles personalizados
- Indicadores visuales

### Fase 2: Sistema de Recompensas ✅
- Cálculo de recompensas
- Tracking de pausas
- Multiplicadores
- Integración con Ocean Pay

### Fase 3: Tickets Rotos ✅
- Estados de tickets
- Animaciones de rotura
- Prevención de reuso
- Actualización visual

### Fase 4: Tracking y Analytics ✅
- Almacenamiento de datos
- Historial de visualizaciones
- Estadísticas personales
- Reportes

## 🚀 Mejoras Futuras

- [ ] Sistema de logros por ver películas
- [ ] Recompensas por maratones (ver múltiples películas seguidas)
- [ ] Modo cine con amigos (sincronización)
- [ ] Comentarios y reacciones en tiempo real
- [ ] Sistema de calificación post-visualización
- [ ] Recomendaciones basadas en historial
- [ ] Modo offline para películas descargadas
- [ ] Subtítulos personalizables
- [ ] Audio descriptions para accesibilidad

## 📱 Responsive Design

### Desktop (>1024px)
- Sala fullscreen opcional
- Controles completos
- Sidebar con información

### Tablet (768px - 1024px)
- Controles adaptados
- Información en overlay

### Mobile (<768px)
- Controles táctiles optimizados
- Modo landscape recomendado
- Gestos para controlar

## 🔒 Seguridad

1. **Prevención de Fraude**:
   - Verificar que el video realmente se reprodujo
   - Detectar si la pestaña está activa
   - Validar tiempo de visualización en servidor

2. **Límites**:
   - Máximo 10 películas por día
   - Cooldown de 5 minutos entre películas
   - Verificación de tickets válidos

3. **Validación**:
   - Tickets no pueden reutilizarse
   - Recompensas solo una vez por ticket
   - Sincronización con servidor

¡Este rediseño transformará Ocean Cinemas en una experiencia cinematográfica de primera clase! 🎬✨
