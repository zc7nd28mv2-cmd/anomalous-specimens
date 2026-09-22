const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_res;
uniform float u_time, u_speed, u_cell, u_levels, u_scale, u_glow, u_flicker, u_contrast, u_scan, u_dpr, u_colorCount;
uniform vec3 u_bg, u_c0, u_c1, u_c2, u_c3;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.07;
    a *= 0.5;
  }
  return v;
}

vec3 ramp(float t) {
  t = clamp(t, 0.0, 1.0) * (u_colorCount - 1.0);
  if (t < 1.0) return mix(u_c0, u_c1, t);
  if (t < 2.0) return mix(u_c1, u_c2, t - 1.0);
  return mix(u_c2, u_c3, t - 2.0);
}

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float glyph(float gi, vec2 q) {
  if (gi < 0.5) return 1.0;
  if (gi < 1.5) return length(q - vec2(0.0, -0.30)) - 0.16;
  if (gi < 2.5) return min(length(q - vec2(0.0, 0.28)), length(q - vec2(0.0, -0.28))) - 0.15;
  if (gi < 3.5) return sdBox(q, vec2(0.30, 0.09));
  if (gi < 4.5) return min(sdBox(q - vec2(0.0, 0.19), vec2(0.30, 0.085)), sdBox(q + vec2(0.0, 0.19), vec2(0.30, 0.085)));
  if (gi < 5.5) return min(sdBox(q, vec2(0.32, 0.09)), sdBox(q, vec2(0.09, 0.32)));
  if (gi < 6.5) {
    float d = sdSeg(q, vec2(0.0, -0.32), vec2(0.0, 0.32));
    d = min(d, sdSeg(q, vec2(-0.28, -0.16), vec2(0.28, 0.16)));
    d = min(d, sdSeg(q, vec2(-0.28, 0.16), vec2(0.28, -0.16)));
    return d - 0.09;
  }
  if (gi < 7.5) {
    float d = min(sdBox(q - vec2(0.0, 0.17), vec2(0.34, 0.075)), sdBox(q + vec2(0.0, 0.17), vec2(0.34, 0.075)));
    return min(d, min(sdBox(q - vec2(0.15, 0.0), vec2(0.075, 0.36)), sdBox(q + vec2(0.15, 0.0), vec2(0.075, 0.36))));
  }
  float ring = abs(length(q) - 0.31) - 0.08;
  return min(ring, length(q) - 0.13);
}

float plasma(vec2 p, float t) {
  vec2 o1 = vec2(0.55 + 0.4 * sin(t * 0.31), 0.32 * cos(t * 0.23));
  vec2 o2 = vec2(-0.5 + 0.35 * cos(t * 0.27), 0.36 * sin(t * 0.19) - 0.08);
  float v = sin(p.x * 2.3 - t * 0.7) + sin(p.y * 3.1 + t * 0.5) + sin((p.x + p.y) * 1.9 + t * 0.6);
  v += 1.7 * sin(length(p - o1) * 3.6 - t * 0.9);
  v += 1.5 * sin(length(p - o2) * 3.1 + t * 0.8);
  v *= 0.16;
  return v / (1.0 + abs(v) * 0.4);
}

void main() {
  float aspect = u_res.x / max(u_res.y, 1.0);
  float t = u_time * u_speed;
  float cellH = max(u_cell * u_dpr, 4.0);
  vec2 cellSz = vec2(cellH * 0.62, cellH);
  vec2 px = v_uv * u_res;
  vec2 cellId = floor(px / cellSz);
  vec2 cellC = (cellId + 0.5) * cellSz;
  vec2 q = (px - cellC) / cellH * 2.0;
  vec2 qn = (px - cellC) / cellSz * 2.0;

  vec2 fp = (cellC / u_res.y - vec2(0.5 * aspect, 0.5)) * u_scale;
  float pv = plasma(fp, t);
  float w = fbm(fp * 2.1 + vec2(t * 0.10, -t * 0.07) + pv * 0.8);
  float vc = clamp(0.5 + pv * 0.95 + (w - 0.5) * 0.45, 0.0, 1.0);
  vc = clamp(0.5 + (vc - 0.5) * u_contrast * 1.25, 0.0, 1.0);
  vc = pow(vc, 1.3);
  vc -= smoothstep(0.72, 1.0, vc) * (0.02 + 0.20 * (1.0 - w));

  float fl = hash(cellId + floor(u_time * 9.0));
  vc += (fl - 0.5) * u_flicker * 0.10;
  vc += (hash(cellId * 1.7 + 11.3) - 0.5) * (0.30 / u_levels);
  float spark = smoothstep(0.972, 1.0, hash(cellId * 2.3 + floor(u_time * 2.5)));
  vc = max(vc, spark * (0.35 + 0.5 * u_flicker) / u_levels);
  vc = clamp(vc, 0.0, 1.0);

  float lv = clamp(floor(vc * u_levels), 0.0, u_levels - 1.0);
  float den = max(u_levels - 1.0, 1.0);
  float gi = floor(lv / den * 8.0 + 0.5);
  float vq = lv / den;

  float d = glyph(gi, q / 1.4) * 1.4;
  float aa = 2.4 / cellH;
  float cov = smoothstep(aa, -aa, d);

  float pw = clamp(plasma((px / u_res.y - vec2(0.5 * aspect, 0.5)) * u_scale, t) + 0.5, 0.0, 1.0);
  pw = pw * pw;
  vec3 wash = ramp(pw * 0.85) * pw * u_glow * 0.16;
  float halo = exp(-dot(qn, qn) * 1.1) * pow(vq, 2.0) * u_glow * 0.35;

  vec3 gcol = ramp(mix(vq, vc, 0.35));
  gcol *= 0.62 + 0.6 * vc;
  gcol = mix(gcol, vec3(1.0), smoothstep(0.86, 1.0, vc) * 0.3);

  vec2 vctr = (v_uv - 0.5) * vec2(aspect, 1.0);
  float vig = 1.0 - 0.28 * smoothstep(0.3, 1.1, length(vctr));
  vec3 col = u_bg * vig + wash + ramp(vq) * halo;
  col += ramp(vc) * vc * 0.05;
  col = mix(col, gcol, cov);

  float scan = 1.0 - u_scan * 0.16 * (0.5 + 0.5 * sin(px.y / u_dpr * 3.14159));
  col *= scan;
  float sp = fract(u_time * 0.05);
  float dsw = (v_uv.y - (1.0 - sp)) * 9.0;
  col *= 1.0 + exp(-dsw * dsw) * u_flicker * 0.10;
  col += (hash(px * 0.7 + fract(u_time) * 13.1) - 0.5) * 0.02;
  col += (hash(px + 0.5) - 0.5) * 0.008;

  gl_FragColor = vec4(col, 1.0);
}
`;

const COLORS: Array<[number, number, number]> = [
  [0x08, 0x08, 0x08],
  [0x10, 0x10, 0x10],
  [0x18, 0x18, 0x18],
  [0x24, 0x24, 0x24],
];

const BG: [number, number, number] = [0, 0, 0];

const FIELD = {
  speed: 0.12,
  cell: 16,
  levels: 6,
  scale: 2,
  glow: 0.08,
  flicker: 0.04,
  contrast: 1.25,
  scan: 0.08,
};

function rgb(value: [number, number, number]) {
  return [value[0] / 255, value[1] / 255, value[2] / 255] as const;
}

export function startAsciiPlasma(host: HTMLElement) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;";
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    premultipliedAlpha: false,
  });
  if (!gl) {
    return () => undefined;
  }

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) {
      return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vert = compile(gl.VERTEX_SHADER, VERT);
  const frag = compile(gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!vert || !frag || !program) {
    return () => undefined;
  }
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return () => undefined;
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const loc = (name: string) => gl.getUniformLocation(program, name);
  const uTime = loc("u_time");
  const uRes = loc("u_res");
  const set1 = (name: string, value: number) => gl.uniform1f(loc(name), value);
  const set3 = (name: string, value: readonly [number, number, number]) =>
    gl.uniform3f(loc(name), value[0], value[1], value[2]);

  set3("u_bg", rgb(BG));
  set3("u_c0", rgb(COLORS[0]));
  set3("u_c1", rgb(COLORS[1]));
  set3("u_c2", rgb(COLORS[2]));
  set3("u_c3", rgb(COLORS[3]));
  set1("u_colorCount", COLORS.length);
  set1("u_speed", FIELD.speed);
  set1("u_cell", FIELD.cell);
  set1("u_levels", FIELD.levels);
  set1("u_scale", FIELD.scale);
  set1("u_glow", FIELD.glow);
  set1("u_flicker", FIELD.flicker);
  set1("u_contrast", FIELD.contrast);
  set1("u_scan", FIELD.scan);

  host.appendChild(canvas);

  const dprCap = 1.5;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const width = Math.max(1, Math.round(host.clientWidth * dpr));
    const height = Math.max(1, Math.round(host.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    set1("u_dpr", dpr);
  };
  resize();

  const reduced =
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;
  let alive = true;
  const started = performance.now();

  const draw = (now: number) => {
    gl.uniform1f(uTime, (now - started) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const loop = (now: number) => {
    if (!alive) {
      return;
    }
    if (document.hidden) {
      raf = 0;
      return;
    }
    if (!reduced) {
      raf = window.requestAnimationFrame(loop);
    }
    draw(now);
  };

  const onVisible = () => {
    if (!alive || reduced || document.hidden || raf) {
      return;
    }
    raf = window.requestAnimationFrame(loop);
  };

  document.addEventListener("visibilitychange", onVisible);
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  raf = window.requestAnimationFrame(loop);

  return () => {
    alive = false;
    if (raf) {
      window.cancelAnimationFrame(raf);
    }
    document.removeEventListener("visibilitychange", onVisible);
    observer.disconnect();
    canvas.remove();
    const lose = gl.getExtension("WEBGL_lose_context");
    lose?.loseContext();
  };
}
