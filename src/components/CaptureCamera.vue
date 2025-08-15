<template>
  <div class="bg-white rounded-xl shadow p-4 space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Captura guiada</h2>
      <div class="text-sm text-gray-500">Lote: {{ loteId }}</div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
      <div class="p-2 rounded-lg border">
        <div class="text-gray-500">Fotos válidas</div>
        <div class="text-xl font-semibold">{{ validCount }}</div>
      </div>
      <div class="p-2 rounded-lg border">
        <div class="text-gray-500">Nitidez</div>
        <div :class="sharpnessOk ? 'text-green-600 font-semibold' : 'text-red-600'">
          {{ sharpness.toFixed(0) }}
        </div>
      </div>
      <div class="p-2 rounded-lg border">
        <div class="text-gray-500">Ángulo (°)</div>
        <div :class="angleOk ? 'text-green-600 font-semibold' : 'text-red-600'">
          {{ pitchDeg.toFixed(0) }}
        </div>
      </div>
      <div class="p-2 rounded-lg border">
        <div class="text-gray-500">Exposición</div>
        <div :class="exposureOk ? 'text-green-600 font-semibold' : 'text-red-600'">
          {{ (exposure*100).toFixed(0) }}%
        </div>
      </div>
    </div>

    <div class="relative w-full rounded-xl overflow-hidden border aspect-[3/4] bg-black">
      <video ref="videoEl" playsinline autoplay muted class="absolute inset-0 w-full h-full object-cover"></video>
      <canvas ref="overlayEl" class="absolute inset-0 w-full h-full pointer-events-none"></canvas>
    </div>

    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-600">
        Estado:
        <span :class="allOk ? 'text-green-600 font-semibold' : 'text-red-600'">
          {{ allOk ? 'OK para disparar' : mensaje }}
        </span>
      </div>
      <div class="text-sm text-gray-600">
        Objetivo: {{ objetivo }} · Restantes: {{ Math.max(objetivo - validCount, 0) }}
      </div>
    </div>

    <div class="flex gap-3">
      <button @click="takePhoto" :disabled="!allOk || taking"
        class="flex-1 px-4 py-3 rounded-lg text-white bg-emerald-600 hover:opacity-90 disabled:opacity-50">
        {{ taking ? 'Guardando...' : 'Tomar foto válida' }}
      </button>
      <button @click="toggleTorch" v-if="torchSupported" class="px-4 py-3 rounded-lg border">
        {{ torchOn ? 'Apagar luz' : 'Encender luz' }}
      </button>
    </div>

    <details>
      <summary class="cursor-pointer text-sm font-medium">Ajustes avanzados</summary>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
        <div>
          <label class="text-sm text-gray-600">Umbral nitidez (Laplacian)</label>
          <input v-model.number="sharpnessMin" type="number" class="w-full border rounded-lg px-3 py-2"/>
        </div>
        <div>
          <label class="text-sm text-gray-600">Ángulo min (°)</label>
          <input v-model.number="pitchMin" type="number" class="w-full border rounded-lg px-3 py-2"/>
        </div>
        <div>
          <label class="text-sm text-gray-600">Ángulo máx (°)</label>
          <input v-model.number="pitchMax" type="number" class="w-full border rounded-lg px-3 py-2"/>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { supabase, ASERRIN_BUCKET } from '@/lib/supabase'

const props = defineProps({
  loteId: { type: String, required: true },
  objetivo: { type: Number, default: 90 }
})

const videoEl = ref(null)
const overlayEl = ref(null)
const streamRef = ref(null)
const validCount = ref(0)
const taking = ref(false)

const sharpness = ref(0)
const exposure = ref(0.5)
const pitchDeg = ref(0)
const sharpnessMin = ref(120)
const pitchMin = ref(20)
const pitchMax = ref(50)
const mensaje = ref('Ajusta ángulo / nitidez / exposición')

const torchSupported = ref(false)
const torchOn = ref(false)

const sharpnessOk = computed(() => sharpness.value >= sharpnessMin.value)
const angleOk = computed(() => pitchDeg.value >= pitchMin.value && pitchDeg.value <= pitchMax.value)
const exposureOk = computed(() => exposure.value > 0.08 && exposure.value < 0.92)
const allOk = computed(() => sharpnessOk.value && angleOk.value && exposureOk.value)

let overlayCtx, sampleCanvas, sampleCtx, rafId

onMounted(() => {
  initCamera()
  window.addEventListener('deviceorientation', deviceOrientationHandler, true)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('deviceorientation', deviceOrientationHandler, true)
  if (streamRef.value) streamRef.value.getTracks().forEach(t => t.stop())
})

async function initCamera() {
  try {
    const constraints = {
      audio: false,
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        advanced: [{ torch: false }]
      }
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    streamRef.value = stream
    videoEl.value.srcObject = stream

    const track = stream.getVideoTracks()[0]
    const caps = track.getCapabilities?.()
    torchSupported.value = !!(caps && 'torch' in caps)

    overlayCtx = overlayEl.value.getContext('2d')
    sampleCanvas = document.createElement('canvas')
    sampleCanvas.width = 256; sampleCanvas.height = 256
    sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true })

    videoEl.value.onloadedmetadata = () => {
      videoEl.value.play()
      tick()
    }
  } catch (e) {
    alert('No se pudo abrir la cámara: ' + (e.message || e))
  }
}

function deviceOrientationHandler(evt) {
  const beta = evt.beta // -180..180
  pitchDeg.value = Math.abs(beta ?? 0)
}

function tick() {
  drawOverlay()

  if (videoEl.value.readyState >= 2) {
    sampleCtx.drawImage(videoEl.value, 0, 0, sampleCanvas.width, sampleCanvas.height)
    const img = sampleCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height)
    sharpness.value = laplacianSharpness(img)
    exposure.value   = meanLuma(img)
  }

  rafId = requestAnimationFrame(tick)
}

function drawOverlay() {
  const w = overlayEl.value.width = overlayEl.value.clientWidth
  const h = overlayEl.value.height = overlayEl.value.clientHeight
  overlayCtx.clearRect(0,0,w,h)

  overlayCtx.strokeStyle = allOk.value ? 'rgba(0,180,80,0.95)' : 'rgba(220,50,50,0.95)'
  overlayCtx.lineWidth = 6
  const pad = Math.min(w,h)*0.08
  overlayCtx.strokeRect(pad, pad, w-2*pad, h-2*pad)

  overlayCtx.fillStyle = 'rgba(0,0,0,0.5)'
  overlayCtx.fillRect(0,0,w,40)
  overlayCtx.fillStyle = '#fff'
  overlayCtx.font = '16px system-ui, sans-serif'
  const txt = allOk.value ? 'OK para disparar' : mensaje.value
  overlayCtx.fillText(txt, 16, 26)

  overlayCtx.strokeStyle = 'rgba(255,255,255,0.3)'
  overlayCtx.lineWidth = 1
  overlayCtx.beginPath()
  overlayCtx.moveTo(w*0.33, pad); overlayCtx.lineTo(w*0.33, h-pad)
  overlayCtx.moveTo(w*0.66, pad); overlayCtx.lineTo(w*0.66, h-pad)
  overlayCtx.moveTo(pad, h*0.5); overlayCtx.lineTo(w-pad, h*0.5)
  overlayCtx.stroke()
}

function meanLuma(img) {
  const data = img.data
  let sum = 0
  for (let i=0; i<data.length; i+=4) {
    const r = data[i], g = data[i+1], b = data[i+2]
    sum += (0.2126*r + 0.7152*g + 0.0722*b)
  }
  const mean = sum / (img.width*img.height) / 255
  return mean
}

function laplacianSharpness(img) {
  const w = img.width, h = img.height
  const src = img.data
  const gray = new Float32Array(w*h)
  for (let i=0, p=0; i<src.length; i+=4, p++) {
    gray[p] = (src[i]*0.299 + src[i+1]*0.587 + src[i+2]*0.114)
  }
  const k = [0,1,0, 1,-4,1, 0,1,0]
  let sum = 0, sum2 = 0, count = 0
  for (let y=1; y<h-1; y++) {
    for (let x=1; x<w-1; x++) {
      const p = y*w + x
      const val =
        gray[p-w] * k[1] + gray[p+w] * k[7] +
        gray[p-1] * k[3] + gray[p+1] * k[5] +
        gray[p]   * k[4]
      sum += val; sum2 += val*val; count++
    }
  }
  const mean = sum / count
  const variance = (sum2 / count) - (mean*mean)
  return Math.max(0, variance / 100)
}

async function toggleTorch() {
  const track = streamRef.value?.getVideoTracks?.()[0]
  if (!track) return
  try {
    await track.applyConstraints({ advanced: [{ torch: !torchOn.value }] })
    torchOn.value = !torchOn.value
  } catch {
    alert('Tu dispositivo no permite torch en este modo.')
  }
}

async function takePhoto() {
  if (!allOk.value || taking.value) return
  taking.value = true
  try {
    const canvas = document.createElement('canvas')
    const vw = videoEl.value.videoWidth, vh = videoEl.value.videoHeight
    canvas.width = vw; canvas.height = vh
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoEl.value, 0, 0, vw, vh)
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92))
    const fileName = `${Date.now()}.jpg`

    const path = `${props.loteId}/crudo/${fileName}`
    const { error: upErr } = await supabase.storage.from(ASERRIN_BUCKET).upload(path, blob, {
      contentType: 'image/jpeg', upsert: false
    })
    if (upErr) throw upErr

    const payload = {
      lote_fk: props.loteId,
      archivo_path: path,
      nitidez: sharpness.value,
      angulo_pitch_deg: pitchDeg.value,
      exposicion_mean: exposure.value,
      valido: true
    }
    const { error: insErr } = await supabase.from('capturas_aserrin').insert(payload)
    if (insErr) throw insErr

    validCount.value++
    mensaje.value = 'Foto guardada ✔️'
  } catch (e) {
    alert('Error guardando foto: ' + (e.message || e))
  } finally {
    taking.value = false
  }
}
</script>
