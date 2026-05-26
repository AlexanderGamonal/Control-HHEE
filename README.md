# Control HHEE Perú

PWA para registrar y calcular horas extras según la legislación laboral peruana (D.Leg. 713). Funciona completamente offline, sin servidor ni cuenta requerida. Los datos se guardan en el propio dispositivo.

---

## Características

- **Cálculo automático de HHEE** por período de pago (16 de un mes al 15 del siguiente)
- **Feriados peruanos** integrados según D.Leg. 713, incluyendo Semana Santa y Carnavales (fechas móviles)
- **Turnos día y noche** con descuento de refrigerio automático (45 min para turno día, 0 para turno noche)
- **Descanso rotativo** — cualquier día puede marcarse como día de descanso trabajado (pago ×2)
- **Panel estimado** — muestra HHEE acumuladas en tiempo real durante el período activo
- **Exportar a Google Sheets** o descargar CSV
- **Funciona offline** — instalable como app nativa (PWA)
- **Sin backend, sin cuenta** — todo en `localStorage` del dispositivo

---

## Lógica de cálculo

### Períodos de pago

El sistema trabaja en ciclos **del 16 de un mes al 15 del siguiente**. Por ejemplo:

- Período abril–mayo: 16 abr → 15 may (30 días)
- Período mayo–junio: 16 may → 15 jun (30 días)

### Jornada base

| Turno | Entrada | Refrigerio | Trabajo efectivo |
|-------|---------|------------|-----------------|
| Día   | antes de 19:00 | 45 min descontados | 8h |
| Noche | 19:00 o después | sin descuento | 8h |

La jornada semanal configurable es de **48h (6 días × 8h)**.

### Umbral obligatorio del período

El umbral es la cantidad de horas que debes trabajar antes de que se generen HHEE netas:

```
semanas_completas = floor(días_del_período / 7)
días_restantes    = días_del_período % 7
días_laborables   = semanas_completas × 6 + días_restantes
umbral_min        = (días_laborables − feriados_no_trabajados) × 480 min
```

> **Ejemplo:** Período de 30 días con 1 feriado no trabajado  
> `floor(30/7) = 4` semanas × 6 días + 2 residuales = 26 días laborables  
> 26 − 1 feriado = 25 días × 8h = **200h de umbral**

### Tipos de hora

| Tipo | Multiplicador | Condición |
|------|--------------|-----------|
| Hora regular | base | Día laboral normal |
| HHEE netas | ×1.25 | Horas sobre el umbral del período |
| Feriado / descanso | ×2 | Feriado registrado o día de descanso marcado |

### Feriados (D.Leg. 713)

Un feriado **no registrado** = descanso remunerado → reduce el umbral en 1 día (8h).  
Un feriado **registrado** = día trabajado → pago doble (×2), no reduce el umbral.

**Feriados fijos:**
Año Nuevo, Día del Trabajo, San Pedro y San Pablo, Día de la FAP, Fiestas Patrias (28 y 29 jul), Santa Rosa de Lima, Combate de Angamos, Todos los Santos, Inmaculada Concepción, Batalla de Ayacucho, Navidad.

**Feriados móviles (algoritmo de Cómputo Pascal):**
Lunes y Martes de Carnaval, Jueves y Viernes Santo.

---

## Flujo de uso

### 1. Configuración inicial

Abre ⚙️ **Ajustes** e ingresa:

- **Remuneración mensual** — tu sueldo base en S/
- **Asignación Familiar** — marca si percibes AF (se suma al computable)
- **Jornada semanal** — por defecto 48h
- **Google Sheets URL** — opcional, para sincronización automática

El sistema calcula automáticamente el **valor hora referencial** para HHEE (×1.25) y descanso (×2).

### 2. Registrar un día

En **Registrar día** ingresa:

1. **Fecha** — el sistema detecta si es feriado o domingo y muestra un aviso
2. **Hora entrada** — formato `HH:MM` (se autocompleta al perder el foco)
3. **Hora salida** — ídem

El **preview automático** muestra turno, refrigerio descontado y horas efectivas antes de guardar.

**Días especiales:**
- **Feriado** → se guarda automáticamente como ×2
- **Domingo** → aparece checkbox "Sin compensación de descanso (×2)"; márcalo si trabajaste sin descanso compensatorio
- **Cualquier día** → si tu descanso es rotativo y coincidió en ese día, marca el checkbox

### 3. Ver el resumen

En **Resumen** puedes navegar por períodos con las flechas ◀ ▶ o ir al período actual con el botón central.

Muestra:
- Días registrados, total HHEE, monto a cobrar, turnos noche
- Nota de feriados no trabajados y ajuste de umbral
- **Panel estimado** (solo en período activo): HHEE acumuladas según los días ya registrados, fluctúa hasta cerrar el período

### 4. Exportar

En **Historial** puedes exportar por período activo o todos los registros:

- **↑ Sync Google Sheets** — envía los datos a tu hoja configurada
- **↓ Descargar CSV** — descarga archivo con todos los campos (período, entrada, salida, tipo, delta ±8h, monto)

---

## Valor hora referencial

```
Remuneración computable = Sueldo + AF (si aplica)
Valor hora              = Remuneración computable / 30 / 8
HHEE (×1.25)           = Valor hora × 1.25
Feriado/Descanso (×2)  = Valor hora × 2
```

---

## Instalación como app (PWA)

La app es una PWA instalable en Android, iOS y escritorio:

- **Android/Chrome:** aparece banner automático "Instalar Control HHEE"
- **iOS/Safari:** Compartir → Agregar a pantalla de inicio
- **Escritorio/Chrome:** ícono de instalación en la barra de direcciones

Una vez instalada funciona **completamente offline**.

---

## Conectar Google Sheets (opcional)

1. Abre [sheets.google.com](https://sheets.google.com) en modo escritorio
2. Crea una hoja → nómbrala `Control HHEE`
3. Ve a **Extensiones → Apps Script**
4. Pega el script que aparece en ⚙️ Ajustes → Conectar Google Sheets
5. Implementar → Nueva implementación → Aplicación web → Acceso: Cualquiera
6. Copia la URL generada y pégala en **Ajustes → Google Sheets Script URL**

---

## Desarrollo

```bash
npm install       # instalar dependencias
npm run dev       # servidor de desarrollo (http://localhost:5173)
npm run build     # build de producción → dist/
npm run preview   # previsualizar el build
```

### Stack

| Herramienta | Uso |
|------------|-----|
| Vite 6 | Bundler y dev server |
| React 18 | UI por componentes |
| TypeScript | Tipado estático |
| Zustand | Estado global + persistencia localStorage |
| vite-plugin-pwa | Service worker y caché offline |

### Estructura del proyecto

```
src/
├── types/          → interfaces TypeScript (Registro, Config, Periodo...)
├── constants.ts    → feriados, Apps Script, configuración default
├── utils/
│   ├── calculations.ts  → calcHHEE, calcHHEEPeriodo, calcHHEEAcumulado
│   ├── holidays.ts      → esFeriado, nombreFeriado, algoritmo Pascua
│   ├── timeUtils.ts     → conversiones de tiempo, getDeltaInfo
│   ├── dateUtils.ts     → períodos 16-15, formateo de fechas
│   └── workerUtils.ts   → valorHora, getSinComp, getTipoLabel
├── store/          → Zustand store (config + registros + periodoActivo)
├── hooks/          → usePWA (install prompt)
├── components/
│   ├── config/     → ConfigPanel, FontSizeSelector, SheetsInstructions
│   ├── registro/   → RegistroForm, PreviewBox, SpecialDayNotice
│   ├── resumen/    → ResumenPanel, StatsGrid, PeriodoNav, AcumuladoPanel
│   ├── historial/  → HistorialPanel, RegistroTable
│   └── ui/         → Alert, InstallBanner
└── styles/
    └── globals.css → tema oscuro, responsive, tamaños de fuente
```

### Migración de datos

Si tenías datos en la versión HTML anterior (`hhee_data` / `hhee_cfg` en localStorage), se migran automáticamente al nuevo store Zustand la primera vez que abres la versión React.

---

## Licencia

Uso personal. Legislación de referencia: D.Leg. 713 — Ley de Descansos Remunerados de los Trabajadores sujetos al régimen laboral de la actividad privada (Perú).
