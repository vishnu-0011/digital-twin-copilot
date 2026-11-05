/**
 * "Rivet" — the tour guide
 * ========================
 * A small floating orb: pearl ceramic shell, a black glass visor whose
 * light-drawn eyes carry the expression, a voice line that moves while it
 * speaks, and a fine halo ring with an orbiting bead. Rendered in its own
 * WebGL canvas so it never competes with the factory scene's camera.
 *
 * The eyes are painted onto a 2D canvas every frame and used as the visor's
 * emissive map, so expressions are shapes (lids, smiles, squints) rather
 * than cartoon geometry.
 *
 * Public API (unchanged from the previous mascot):
 *   setMood(name)        happy | curious | thinking | alarmed | worried | proud
 *   setSpeaking(bool)    voice line on/off
 *   pulse(strength)      one word "kick" for the voice line (0..1)
 *   lookAtScreen(x, y)   eyes + orb turn toward a client-space point (or null)
 *   gesture(name)        wave | point | none
 *   celebrate()          spin + lift
 *   start() / stop()     render loop control
 *   resize()             re-read canvas CSS size
 */

/*  open   eye height (1 = neutral)
 *  smile  lower-lid push (happy eyes), 0..1
 *  lid    upper-lid droop (focused / tired), 0..1
 *  slant  inner-corner tilt: + worried, − stern
 *  size   overall eye scale
 *  up     resting gaze offset (thinking looks up)
 */
const MOODS = {
  happy:    { open: 1.00, smile: 0.42, lid: 0.00, slant: 0.00, size: 1.00, up: 0.0, accent: 0x38bdf8 },
  curious:  { open: 1.06, smile: 0.12, lid: 0.00, slant: 0.00, size: 1.06, up: 0.1, accent: 0x38bdf8 },
  thinking: { open: 0.92, smile: 0.00, lid: 0.38, slant: 0.00, size: 0.96, up: 0.6, accent: 0xa78bfa },
  alarmed:  { open: 1.22, smile: 0.00, lid: 0.00, slant: 0.00, size: 1.12, up: 0.0, accent: 0xfb7185 },
  worried:  { open: 0.96, smile: 0.00, lid: 0.22, slant: 0.55, size: 1.00, up: 0.0, accent: 0xfbbf24 },
  proud:    { open: 0.92, smile: 0.80, lid: 0.10, slant: 0.00, size: 1.00, up: 0.1, accent: 0x34d399 },
};
const NUMERIC = ['open', 'smile', 'lid', 'slant', 'size', 'up'];

const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Soft studio for clear-coat reflections: one wide key, two strips, dim floor. */
function buildEnvScene() {
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(
    new THREE.BoxGeometry(12, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x3a3f48, side: THREE.BackSide })
  ));
  const panel = (w, h, pos, intensity, color = 0xffffff) => {
    const m = new THREE.MeshBasicMaterial({ color });
    m.color.multiplyScalar(intensity);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    mesh.position.copy(pos);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
  };
  panel(7, 2.4, new THREE.Vector3(-1.5, 4.6, 3), 5);      // overhead softbox
  panel(1.2, 6, new THREE.Vector3(5, 0.5, 2), 3);          // right strip
  panel(1.2, 6, new THREE.Vector3(-5, 0.5, -1), 1.6);      // left strip
  panel(6, 2, new THREE.Vector3(0, -5, 0), 0.5);           // floor bounce
  return env;
}

/** Rounded-rectangle path helper for the 2D canvases. */
function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Radial glow sprite texture (white; tinted by the material colour). */
function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function createMascot(canvas) {
  if (typeof THREE === 'undefined' || !canvas) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    console.warn('Guide WebGL unavailable:', e);
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.12, 5.9);
  camera.lookAt(0, 0.05, 0);

  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(buildEnvScene(), 0.04).texture;
    pmrem.dispose();
  } catch (e) { /* reflections are a nicety */ }

  scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa3b2, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.95);
  key.position.set(-2.5, 3.5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(MOODS.happy.accent, 1.1);
  rim.position.set(3, 1.2, -3);
  scene.add(rim);

  const accent = new THREE.Color(MOODS.happy.accent);
  const accentTarget = new THREE.Color(MOODS.happy.accent);

  // ---------- Rig ----------
  const root = new THREE.Group();   // float, lift, spin
  const body = new THREE.Group();   // turn / tilt toward what it's talking about
  root.add(body);
  scene.add(root);

  // Shell: pearl ceramic with a clear coat
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0xf3f1ec, roughness: 0.38, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.14,
  });
  body.add(new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), shellMat));

  // Equator panel line (visible on the sides and back)
  const seamMat = new THREE.MeshStandardMaterial({ color: 0xc9c5bd, roughness: 0.6 });
  const seam = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.006, 8, 160), seamMat);
  seam.rotation.x = Math.PI / 2;
  seam.position.y = -0.18;
  seam.scale.setScalar(Math.cos(Math.asin(0.18)));
  body.add(seam);

  // Visor: a pill-shaped patch of black glass on the front of the sphere.
  const VW = 576, VH = 256;
  const PHI_LEN = 1.92, THETA_LEN = 0.86, THETA_MID = Math.PI / 2 - 0.06;
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = VW; faceCanvas.height = VH;
  const fx = faceCanvas.getContext('2d');
  const faceTex = new THREE.CanvasTexture(faceCanvas);

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = VW; maskCanvas.height = VH;
  const mx = maskCanvas.getContext('2d');
  mx.fillStyle = '#000'; mx.fillRect(0, 0, VW, VH);
  mx.fillStyle = '#fff'; roundRect(mx, 6, 6, VW - 12, VH - 12, VH * 0.44); mx.fill();
  const maskTex = new THREE.CanvasTexture(maskCanvas);

  const visorMat = new THREE.MeshPhysicalMaterial({
    color: 0x05070b, roughness: 0.06, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.02,
    emissive: 0xffffff, emissiveIntensity: 1.7, emissiveMap: faceTex, alphaMap: maskTex, transparent: true,
  });
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(1.012, 96, 48, Math.PI / 2 - PHI_LEN / 2, PHI_LEN, THETA_MID - THETA_LEN / 2, THETA_LEN),
    visorMat
  );
  body.add(visor);

  // Halo: a fine tilted ring with one orbiting bead, plus a fainter outer ring.
  const halo = new THREE.Group();
  halo.rotation.set(Math.PI / 2 - 0.32, 0, 0.16);
  root.add(halo);
  const ringMat = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.9 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.011, 8, 200), ringMat);
  halo.add(ring);
  const ring2Mat = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.28 });
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.006, 6, 200), ring2Mat);
  ring2.rotation.set(0.12, -0.1, 0);
  halo.add(ring2);
  const beadMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const bead = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14), beadMat);
  halo.add(bead);
  const beadGlowMat = new THREE.SpriteMaterial({ map: glowTexture(), color: accent, transparent: true, depthWrite: false, opacity: 0.9 });
  const beadGlow = new THREE.Sprite(beadGlowMat);
  beadGlow.scale.setScalar(0.42);
  bead.add(beadGlow);

  // Aura behind the orb (tinted with the mood accent)
  const auraMat = new THREE.SpriteMaterial({ map: glowTexture(), color: accent, transparent: true, depthWrite: false, opacity: 0.32 });
  const aura = new THREE.Sprite(auraMat);
  aura.scale.setScalar(3.6);
  aura.position.z = -1.4;
  root.add(aura);

  // ---------- State ----------
  const cur = { ...MOODS.happy, eyeX: 0, eyeY: 0, turnY: 0, turnX: 0, voice: 0 };
  let moodName = 'happy';
  let target = MOODS.happy;
  let speaking = false;
  let talkEnergy = 0;
  let lookTarget = null;
  let gestureName = 'none';
  let gestureT = 0;
  let celebrateT = -1;
  let shakeT = -1;
  let blinkT = 2 + Math.random() * 2;
  let blink = 0;
  let beadA = 0;
  let running = false;
  let rafId = null;
  let last = performance.now();
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    const w = canvas.clientWidth || 240;
    const h = canvas.clientHeight || 240;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  /** Paints the visor: two light-drawn eyes, the voice line, and a faint bezel. */
  function paintFace(t, blinkScale) {
    fx.clearRect(0, 0, VW, VH);
    fx.fillStyle = '#000';
    fx.fillRect(0, 0, VW, VH);

    const eyeCol = '#eef8ff';
    const glow = `rgb(${Math.round(accent.r * 255)},${Math.round(accent.g * 255)},${Math.round(accent.b * 255)})`;
    const s = cur.size;
    const w = 54 * s;
    const h = Math.max(4, 92 * s * cur.open * blinkScale);
    const cy = VH * 0.44 - cur.up * 14 - cur.eyeY * 18;
    const gx = cur.eyeX * 34;

    [-1, 1].forEach(side => {
      const cx = VW / 2 + side * 98 + gx;
      fx.save();
      // Draw the eye on its own layer so the lids can cut it.
      fx.globalCompositeOperation = 'source-over';
      fx.shadowColor = glow;
      fx.shadowBlur = 26;
      fx.fillStyle = eyeCol;
      roundRect(fx, cx - w / 2, cy - h / 2, w, h, w / 2);
      fx.fill();
      fx.shadowBlur = 0;

      fx.globalCompositeOperation = 'destination-out';
      // Lower lid: a wide ellipse pushing up from below = smiling eyes.
      if (cur.smile > 0.02) {
        fx.beginPath();
        fx.ellipse(cx, cy + h / 2 + 30 - cur.smile * (h * 0.62), w * 1.15, 40, 0, 0, Math.PI * 2);
        fx.fill();
      }
      // Upper lid: a band dropping from above, tilted at the inner corner.
      const lidDrop = cur.lid * h * 0.55;
      const tilt = cur.slant * 0.5 * side;  // inner corner up = worried
      if (lidDrop > 0.5 || Math.abs(cur.slant) > 0.02) {
        fx.save();
        fx.translate(cx, cy - h / 2 + lidDrop);
        fx.rotate(-tilt);
        fx.fillRect(-w * 1.5, -200, w * 3, 200);
        fx.restore();
      }
      fx.restore();
    });

    // Voice line: a calm waveform under the eyes while speaking.
    const v = cur.voice;
    if (v > 0.02) {
      const y0 = VH * 0.79;
      const half = 64;
      fx.save();
      fx.globalAlpha = Math.min(1, v * 1.4);
      fx.strokeStyle = eyeCol;
      fx.shadowColor = glow;
      fx.shadowBlur = 12;
      fx.lineWidth = 4;
      fx.lineCap = 'round';
      fx.beginPath();
      for (let i = 0; i <= 48; i++) {
        const u = i / 48;
        const x = VW / 2 - half + u * half * 2;
        const env = Math.sin(u * Math.PI);                 // taper at both ends
        const amp = (4 + 16 * talkEnergy) * v * env;
        const y = y0 + Math.sin(u * 13 + t * 11) * amp * 0.7 + Math.sin(u * 23 - t * 7) * amp * 0.3;
        if (i === 0) fx.moveTo(x, y); else fx.lineTo(x, y);
      }
      fx.stroke();
      fx.restore();
    }
    // Faint bezel just inside the visor edge (drawn last so the lids never cut it)
    fx.strokeStyle = `rgba(${Math.round(accent.r * 255)},${Math.round(accent.g * 255)},${Math.round(accent.b * 255)},0.22)`;
    fx.lineWidth = 2;
    roundRect(fx, 12, 12, VW - 24, VH - 24, VH * 0.4);
    fx.stroke();
    faceTex.needsUpdate = true;
  }

  function frame(now) {
    if (!running) return;
    rafId = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    const k = 1 - Math.pow(0.002, dt);     // frame-rate independent smoothing

    NUMERIC.forEach(p => { cur[p] = lerp(cur[p], target[p], k); });
    accent.lerp(accentTarget, k);
    ringMat.color.copy(accent);
    ring2Mat.color.copy(accent);
    beadGlowMat.color.copy(accent);
    auraMat.color.copy(accent);
    rim.color.copy(accent);

    // Blink (eyes squash, not close fully: reads as a soft LED blink)
    blinkT -= dt;
    if (blinkT <= 0) { blink = 1; blinkT = 2.8 + Math.random() * 3.2; }
    blink = Math.max(0, blink - dt * 7.5);
    const blinkScale = 1 - Math.sin(Math.min(1, blink) * Math.PI) * 0.9;

    // Where to look
    let lx, ly;
    if (lookTarget) {
      const r = canvas.getBoundingClientRect();
      const dx = lookTarget.x - (r.left + r.width / 2);
      const dy = lookTarget.y - (r.top + r.height / 2);
      const len = Math.hypot(dx, dy) || 1;
      lx = dx / len; ly = -dy / len;
    } else {
      lx = Math.sin(t * 0.31) * 0.3; ly = Math.sin(t * 0.21) * 0.15;
    }
    cur.eyeX = lerp(cur.eyeX, lx, k);
    cur.eyeY = lerp(cur.eyeY, ly, k);

    // Voice
    talkEnergy = Math.max(0, talkEnergy - dt * 4.5);
    cur.voice = lerp(cur.voice, speaking ? 1 : 0, 1 - Math.pow(0.02, dt));
    paintFace(t, blinkScale);

    // Body: float, turn toward target, mood tilt
    const point = gestureName === 'point' && lookTarget ? 1.6 : 1;
    root.position.y = reducedMotion ? 0 : Math.sin(t * 1.3) * 0.06;
    cur.turnY = lerp(cur.turnY, lx * 0.42 * point, k);
    cur.turnX = lerp(cur.turnX, -ly * 0.22 * point, k);
    body.rotation.y = cur.turnY;
    body.rotation.x = cur.turnX + (speaking ? talkEnergy * 0.025 : 0);
    let roll = moodName === 'curious' || moodName === 'thinking' ? 0.1 : Math.sin(t * 0.7) * 0.025;
    if (gestureName === 'wave') {
      gestureT += dt;
      roll += Math.sin(gestureT * 7) * 0.16 * Math.max(0, 1 - gestureT / 1.8);
      if (gestureT > 1.8) gestureName = 'none';
    }
    body.rotation.z = lerp(body.rotation.z, roll, k);

    if (shakeT >= 0) {
      shakeT += dt;
      body.position.x = Math.sin(shakeT * 55) * 0.03 * Math.max(0, 1 - shakeT / 0.6);
      if (shakeT > 0.6) { shakeT = -1; body.position.x = 0; }
    }

    // Halo: bead orbits; speaking adds a gentle breathing to the ring.
    const beadSpeed = celebrateT >= 0 ? 7 : (speaking ? 1.4 : 0.8);
    beadA += dt * beadSpeed;
    bead.position.set(Math.cos(beadA) * 1.3, Math.sin(beadA) * 1.3, 0);
    const breathe = 1 + (speaking ? talkEnergy * 0.025 : 0) + Math.sin(t * 1.3) * 0.006;
    ring.scale.setScalar(breathe);
    ringMat.opacity = 0.75 + (speaking ? Math.min(0.25, talkEnergy * 0.3) : 0);
    halo.rotation.z = 0.16 + Math.sin(t * 0.4) * 0.04;
    auraMat.opacity = 0.26 + cur.voice * 0.08 + (moodName === 'alarmed' ? 0.12 : 0);

    // Celebrate: one smooth turn with a small lift
    if (celebrateT >= 0) {
      celebrateT += dt;
      const p = Math.min(1, celebrateT / 1.1);
      const e = 1 - Math.pow(1 - p, 3);
      root.rotation.y = e * Math.PI * 2;
      root.position.y += Math.sin(p * Math.PI) * 0.3;
      if (p >= 1) { celebrateT = -1; root.rotation.y = 0; }
    }

    renderer.render(scene, camera);
  }

  return {
    canvas,
    setMood(name) {
      moodName = MOODS[name] ? name : 'happy';
      target = MOODS[moodName];
      accentTarget.set(target.accent);
      if (moodName === 'alarmed' && !reducedMotion) shakeT = 0;
    },
    setSpeaking(on) { speaking = !!on; if (!on) talkEnergy = 0; },
    pulse(strength = 0.8) { talkEnergy = Math.min(1.2, talkEnergy + strength); },
    lookAtScreen(x, y) { lookTarget = (x == null || y == null) ? null : { x, y }; },
    gesture(name) { gestureName = name || 'none'; gestureT = 0; },
    celebrate() { if (!reducedMotion) celebrateT = 0; },
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      resize();
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    },
    resize,
  };
}
