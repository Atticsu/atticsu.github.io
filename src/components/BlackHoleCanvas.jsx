import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ────────────────────────────────────────────────────────────────────────
 *  Eclipse shader
 *  Renders a horizontally-scrolling slogan text texture as background, then
 *  draws a black moon occluding it. Where light bends near the moon's edge,
 *  the text is radially displaced (gravitational lensing) and split into
 *  R/G/B channels (chromatic aberration). A thin warm rim of "sun" peeks out
 *  along the lower-left, giving the crescent.
 * ──────────────────────────────────────────────────────────────────────── */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Write directly in clip-space so the quad always fills the viewport
    // regardless of camera/zoom. position.xy on a planeGeometry(2, 2)
    // already ranges over [-1, 1] which matches NDC.
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform float uTime;
  uniform sampler2D uText;
  uniform float uAspect;       // viewport width / height
  uniform float uTextRatio;    // text texture aspect (w/h)
  uniform float uDiscRadius;   // disc radius (centered-y units, where viewport y = [-0.5, 0.5])
  uniform vec2  uDiscCenter;   // disc center offset in centered-y units
  uniform float uScrollSpeed;
  uniform float uTextHeight;   // text band height as fraction of viewport height
  uniform vec3  uBgColor;
  uniform vec3  uTextColor;
  uniform vec3  uSunColor;

  void main() {
    vec2 uv = vUv;
    // Centered space: aspect-corrected, disc-relative
    vec2 centered = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5) - uDiscCenter;
    float r = length(centered);
    float rDisc = uDiscRadius;

    // ── Lensing displacement ─────────────────────────────────────────────
    // Near the disc rim, pull sampled coordinates toward the disc center —
    // light from behind the moon would bend around it.
    vec2 dir = centered / max(r, 0.0001);
    float lensFalloff = smoothstep(rDisc * 4.5, rDisc * 1.02, r);
    float lensMag = 0.085 * rDisc / max(r - rDisc * 0.92, 0.015);
    float lens = lensMag * lensFalloff;

    // ── Compute text UV ──────────────────────────────────────────────────
    // Maintain text's natural aspect: vertical scale chooses a band; horizontal
    // scale derives from that to keep glyphs un-stretched.
    float textVScale = uTextHeight;
    float textHScale = textVScale * uTextRatio / uAspect;

    vec2 textUv;
    textUv.y = (uv.y - (0.5 + uDiscCenter.y)) / textVScale + 0.5;
    textUv.x = (uv.x - 0.5) / textHScale + 0.5 + uTime * uScrollSpeed;

    // Apply lens displacement (radial, pulling toward disc center)
    vec2 lensedUv = textUv - dir * vec2(lens / textHScale, lens / textVScale);

    // ── Chromatic aberration ─────────────────────────────────────────────
    float chroma = 0.018 * lensFalloff;
    vec2 chromaOffset = dir * vec2(chroma / textHScale, chroma / textVScale);

    // Sample R/G/B with slight radial offsets (use green channel as luminance
    // since text was painted white-on-black).
    float lumR = texture2D(uText, lensedUv + chromaOffset).g;
    float lumG = texture2D(uText, lensedUv).g;
    float lumB = texture2D(uText, lensedUv - chromaOffset).g;

    // Vertical mask: text only inside its band (avoid sampling outside)
    float vBand = step(0.0, textUv.y) * step(textUv.y, 1.0);
    lumR *= vBand;
    lumG *= vBand;
    lumB *= vBand;

    // Mix background with text color, per channel for the aberration
    vec3 col = uBgColor
      + vec3(lumR, lumG, lumB) * (uTextColor - uBgColor);

    // ── Eclipse: bright sun behind, black moon in front, slight offset ───
    // Sun position drifts in a slow Lissajous orbit so the crescent breathes
    // and the bright sliver slides around the rim over time.
    float orbitT = uTime * 0.14;
    vec2 sunOrbit = vec2(
      0.020 * sin(orbitT) + 0.007 * sin(orbitT * 2.3),
      0.014 * cos(orbitT * 0.85) + 0.006 * cos(orbitT * 1.7)
    );
    vec2 sunPos = vec2(0.012, 0.020) + sunOrbit;

    float rSun = length(centered - sunPos);
    float sunCore = smoothstep(rDisc * 0.99 + 0.0025, rDisc * 0.99 - 0.0008, rSun);
    float sunGlow = smoothstep(rDisc * 1.30, rDisc * 0.99, rSun) * 0.35;

    // Moon (the black disc in front)
    float moon = smoothstep(rDisc + 0.0035, rDisc - 0.0005, r);

    // Visible portion of the sun
    float visibleSun = max(sunCore - moon, 0.0);
    float visibleGlow = sunGlow * (1.0 - moon);

    // Flowing brightness wave along the rim — two layered sine bands
    // travelling in opposite directions create a shimmering "river of light".
    float angle = atan(centered.y, centered.x);
    float shimmer = 1.0
      + 0.32 * sin(angle * 2.0 - uTime * 1.3)
      + 0.18 * sin(angle * 5.0 + uTime * 0.85);
    shimmer = clamp(shimmer, 0.55, 1.55);

    // Compose
    col += uSunColor * visibleSun * 1.6 * shimmer;
    col += uSunColor * visibleGlow * 0.75;
    col = mix(col, vec3(0.0), moon);  // moon is pure black

    // Subtle vignette toward edges
    float vignette = smoothstep(1.35, 0.45, length(vec2((uv.x - 0.5) * uAspect, uv.y - 0.5)));
    col *= mix(0.7, 1.0, vignette);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ────────────────────────────────────────────────────────────────────────
 *  Text → CanvasTexture
 *  Renders the slogan repeatedly across a wide canvas so it tiles cleanly
 *  with RepeatWrapping. Canvas width is rounded to an integer number of
 *  phrase widths, so there's no visible seam.
 * ──────────────────────────────────────────────────────────────────────── */

const buildTextTexture = (slogan) => {
  const canvas = document.createElement('canvas');
  const fontSize = 360;
  canvas.height = 720;

  // Probe phrase width
  const probeCtx = canvas.getContext('2d');
  probeCtx.font = `italic 400 ${fontSize}px "Instrument Serif", Georgia, serif`;
  const separator = '   ·   ';
  const phrase = `${slogan}${separator}`;
  const phraseWidth = probeCtx.measureText(phrase).width;

  // Final canvas width: aim for ~4096 px, round to exact phrase multiple
  const targetWidth = 4096;
  const repeats = Math.max(2, Math.ceil(targetWidth / phraseWidth));
  canvas.width = Math.ceil(repeats * phraseWidth);

  // Resizing the canvas resets the context state; re-fetch and re-set
  const ctx = canvas.getContext('2d');
  ctx.font = `italic 400 ${fontSize}px "Instrument Serif", Georgia, serif`;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < repeats; i++) {
    ctx.fillText(phrase, Math.round(i * phraseWidth), canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  return { texture, aspect: canvas.width / canvas.height };
};

const placeholderTexture = () => {
  const data = new Uint8Array([0, 0, 0, 255]);
  const t = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  t.wrapS = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
};

/* ────────────────────────────────────────────────────────────────────────
 *  Plane that fills the orthographic camera viewport
 * ──────────────────────────────────────────────────────────────────────── */

const EclipsePlane = ({ slogan, mobile }) => {
  const matRef = useRef();
  const { size } = useThree();

  // Stable placeholder texture for initial render
  const [placeholder] = useState(() => placeholderTexture());
  const textureRef = useRef(placeholder);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uText: { value: placeholder },
      uAspect: { value: 16 / 9 },
      uTextRatio: { value: 4 },
      uDiscRadius: { value: mobile ? 0.16 : 0.20 },
      uDiscCenter: { value: new THREE.Vector2(0.0, 0.16) },
      uScrollSpeed: { value: 0.035 },
      uTextHeight: { value: mobile ? 0.28 : 0.36 },
      uBgColor: { value: new THREE.Color('#07070a') },
      uTextColor: { value: new THREE.Color('#a6a097') },
      uSunColor: { value: new THREE.Color('#f4e9d8') },
    }),
    [mobile, placeholder],
  );

  // Build the text texture once fonts have loaded, and replace when slogan changes
  useEffect(() => {
    let cancelled = false;
    const build = () => {
      if (cancelled) return;
      const { texture, aspect } = buildTextTexture(slogan);
      // Dispose previous if not the placeholder
      if (textureRef.current && textureRef.current !== placeholder) {
        textureRef.current.dispose();
      }
      textureRef.current = texture;
      if (matRef.current) {
        matRef.current.uniforms.uText.value = texture;
        matRef.current.uniforms.uTextRatio.value = aspect;
      }
    };

    if (document.fonts && document.fonts.load) {
      // Explicitly request the font/size we will use on the canvas, then build
      Promise.all([
        document.fonts.load('italic 400 360px "Instrument Serif"'),
        document.fonts.ready,
      ]).then(build).catch(build);
    } else {
      build();
    }
    return () => {
      cancelled = true;
    };
  }, [slogan, placeholder]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (textureRef.current && textureRef.current !== placeholder) {
        textureRef.current.dispose();
      }
      placeholder.dispose();
    },
    [placeholder],
  );

  useFrame((_, dt) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value += dt;
    matRef.current.uniforms.uAspect.value = size.width / Math.max(1, size.height);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        toneMapped={false}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
};

const EclipseCanvas = ({ slogan = 'Building language-model alpha from market narratives', mobile = false, reducedMotion = false }) => (
  <Canvas
    orthographic
    camera={{ position: [0, 0, 1], zoom: 1, near: 0.1, far: 10 }}
    dpr={mobile ? [1, 1.25] : [1, 1.75]}
    gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
    frameloop={reducedMotion ? 'demand' : 'always'}
    style={{ width: '100%', height: '100%', display: 'block' }}
  >
    <color attach="background" args={['#07070a']} />
    <EclipsePlane slogan={slogan} mobile={mobile} />
  </Canvas>
);

export default EclipseCanvas;
