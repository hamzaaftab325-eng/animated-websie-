'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import {
  ArrowRight,
  Flower2,
  Leaf,
  Mountain,
  SunMedium,
} from 'lucide-react';

const BACKGROUND_IMAGE =
  'https://res.cloudinary.com/diometfe9/image/upload/v1790183196/download_enkn9u.png';

const FEATURES = [
  {
    title: 'Create',
    description:
      'Bring your ideas to life with intuitive tools.',
    href: '/contact',
    icon: Flower2,
  },
  {
    title: 'Explore',
    description:
      'Discover new perspectives and endless inspiration.',
    href: '/work',
    icon: Mountain,
  },
  {
    title: 'Transform',
    description:
      'Turn imagination into reality.',
    href: '/contact',
    icon: SunMedium,
  },
  {
    title: 'Grow',
    description:
      'A brighter, more creative tomorrow awaits.',
    href: '/about',
    icon: Leaf,
  },
] as const;

export function EverythingYouNeed() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const image = imageRef.current;
    const canvas = canvasRef.current;

    if (!section || !image || !canvas) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reducedMotion) return;

    const content = section.querySelector<HTMLElement>(
      '[data-eyn-content]'
    );
    const ctx = gsap.context(() => {
      gsap.fromTo(
        [image, canvas],
        {
          yPercent: -5.5,
          scale: 1.16,
        },
        {
          yPercent: 6.5,
          scale: 1.105,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.75,
            invalidateOnRefresh: true,
          },
        }
      );

      if (content) {
        gsap.fromTo(
          content,
          { y: 28 },
          {
            y: -46,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          }
        );
      }

    }, section);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const bgWrap = bgRef.current;
    const sourceImage = imageRef.current;
    const canvas = canvasRef.current;

    if (
      !section ||
      !bgWrap ||
      !sourceImage ||
      !canvas
    ) {
      return;
    }

    const desktopFinePointer =
      window.matchMedia(
        '(min-width: 768px) and (hover: hover) and (pointer: fine)'
      ).matches;
    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    if (
      !desktopFinePointer ||
      reducedMotion
    ) {
      return;
    }

    let disposed = false;
    let active = true;
    let resizeRaf = 0;
    let loopRaf = 0;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      });
    } catch {
      return;
    }

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        1.5
      )
    );

    const quadGeometry =
      new THREE.PlaneGeometry(2, 2);
    const quadCamera =
      new THREE.OrthographicCamera(
        -1,
        1,
        1,
        -1,
        0,
        1
      );
    const quadScene = new THREE.Scene();
    const quad: THREE.Mesh<
      THREE.PlaneGeometry,
      THREE.Material
    > = new THREE.Mesh(
      quadGeometry,
      new THREE.MeshBasicMaterial()
    );
    quadScene.add(quad);

    const baseVertex = [
      'precision highp float;',
      'varying vec2 vUv;',
      'void main() {',
      '  vUv = uv;',
      '  gl_Position = vec4(position.xy, 0.0, 1.0);',
      '}',
    ].join('\n');

    const fluidVertex = [
      'precision highp float;',
      'uniform vec2 u_texel;',
      'varying vec2 vUv;',
      'varying vec2 vL;',
      'varying vec2 vR;',
      'varying vec2 vT;',
      'varying vec2 vB;',
      'void main() {',
      '  vUv = uv;',
      '  vL = vUv - vec2(u_texel.x, 0.0);',
      '  vR = vUv + vec2(u_texel.x, 0.0);',
      '  vT = vUv + vec2(0.0, u_texel.y);',
      '  vB = vUv - vec2(0.0, u_texel.y);',
      '  gl_Position = vec4(position.xy, 0.0, 1.0);',
      '}',
    ].join('\n');

    const splatFragment = [
      'precision highp float;',
      'uniform sampler2D u_input_texture;',
      'uniform vec3 u_point_value;',
      'uniform vec2 u_point;',
      'uniform float u_ratio;',
      'uniform float u_point_size;',
      'varying vec2 vUv;',
      'void main() {',
      '  vec2 p = vUv - u_point.xy;',
      '  p.x *= u_ratio;',
      '  vec3 splat = 0.6 * pow(2.0, -dot(p, p) / u_point_size) * u_point_value;',
      '  vec3 base = texture2D(u_input_texture, vUv).xyz;',
      '  gl_FragColor = vec4(base + splat, 1.0);',
      '}',
    ].join('\n');

    const divergenceFragment = [
      'precision highp float;',
      'uniform sampler2D u_velocity_texture;',
      'varying highp vec2 vUv;',
      'varying highp vec2 vL;',
      'varying highp vec2 vR;',
      'varying highp vec2 vT;',
      'varying highp vec2 vB;',
      'void main() {',
      '  float L = texture2D(u_velocity_texture, vL).x;',
      '  float R = texture2D(u_velocity_texture, vR).x;',
      '  float T = texture2D(u_velocity_texture, vT).y;',
      '  float B = texture2D(u_velocity_texture, vB).y;',
      '  float div = 0.25 * (R - L + T - B);',
      '  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);',
      '}',
    ].join('\n');

    const pressureFragment = [
      'precision highp float;',
      'uniform sampler2D u_pressure_texture;',
      'uniform sampler2D u_divergence_texture;',
      'varying highp vec2 vUv;',
      'varying highp vec2 vL;',
      'varying highp vec2 vR;',
      'varying highp vec2 vT;',
      'varying highp vec2 vB;',
      'void main() {',
      '  float L = texture2D(u_pressure_texture, vL).x;',
      '  float R = texture2D(u_pressure_texture, vR).x;',
      '  float T = texture2D(u_pressure_texture, vT).x;',
      '  float B = texture2D(u_pressure_texture, vB).x;',
      '  float divergence = texture2D(u_divergence_texture, vUv).x;',
      '  float pressure = (L + R + B + T - divergence) * 0.25;',
      '  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);',
      '}',
    ].join('\n');

    const gradientSubtractFragment = [
      'precision highp float;',
      'uniform sampler2D u_pressure_texture;',
      'uniform sampler2D u_velocity_texture;',
      'varying highp vec2 vUv;',
      'varying highp vec2 vL;',
      'varying highp vec2 vR;',
      'varying highp vec2 vT;',
      'varying highp vec2 vB;',
      'void main() {',
      '  float L = texture2D(u_pressure_texture, vL).x;',
      '  float R = texture2D(u_pressure_texture, vR).x;',
      '  float T = texture2D(u_pressure_texture, vT).x;',
      '  float B = texture2D(u_pressure_texture, vB).x;',
      '  vec2 velocity = texture2D(u_velocity_texture, vUv).xy;',
      '  velocity.xy -= vec2(R - L, T - B);',
      '  gl_FragColor = vec4(velocity, 0.0, 1.0);',
      '}',
    ].join('\n');

    const advectionFragment = [
      'precision highp float;',
      'uniform sampler2D u_velocity_texture;',
      'uniform sampler2D u_input_texture;',
      'uniform vec2 u_texel;',
      'uniform vec2 u_output_texel;',
      'uniform float u_dt;',
      'uniform float u_dissipation;',
      'varying vec2 vUv;',
      'vec4 bilerp(sampler2D sam, vec2 uv, vec2 tsize) {',
      '  vec2 st = uv / tsize - 0.5;',
      '  vec2 iuv = floor(st);',
      '  vec2 fuv = fract(st);',
      '  vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);',
      '  vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);',
      '  vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);',
      '  vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);',
      '  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);',
      '}',
      'void main() {',
      '  vec2 coord = vUv - u_dt * bilerp(u_velocity_texture, vUv, u_texel).xy * u_texel;',
      '  vec4 velocity = bilerp(u_input_texture, coord, u_output_texel);',
      '  gl_FragColor = u_dissipation * velocity;',
      '}',
    ].join('\n');

    const sceneFragment = [
      'precision highp float;',
      'uniform sampler2D u_texture;',
      'uniform vec2 u_view_size;',
      'uniform vec2 u_image_size;',
      'varying vec2 vUv;',
      'void main() {',
      '  vec2 uv = vUv;',
      '  float viewAspect = u_view_size.x / u_view_size.y;',
      '  float imageAspect = u_image_size.x / u_image_size.y;',
      '  if (viewAspect > imageAspect) {',
      '    float scale = imageAspect / viewAspect;',
      '    uv.y = (uv.y - 0.5) * scale + 0.5;',
      '  } else {',
      '    float scale = viewAspect / imageAspect;',
      '    uv.x = (uv.x - 0.5) * scale + 0.5;',
      '  }',
      '  gl_FragColor = texture2D(u_texture, uv);',
      '}',
    ].join('\n');

    const finalFragment = [
      'precision highp float;',
      'uniform sampler2D u_scene;',
      'uniform sampler2D u_velocity;',
      'uniform sampler2D u_output;',
      'uniform float u_disturb_power;',
      'varying vec2 vUv;',
      'void main() {',
      '  float offset = texture2D(u_output, vUv).r;',
      '  vec2 rawVelocity = texture2D(u_velocity, vUv).xy;',
      '  vec2 velocity = rawVelocity + 0.001;',
      '  vec2 dir = normalize(velocity);',
      '  vec2 distortedUv = vUv;',
      '  distortedUv -= u_disturb_power * dir * offset;',
      '  distortedUv -= u_disturb_power * dir * offset;',
      '  distortedUv = clamp(distortedUv, 0.002, 0.998);',
      '  vec3 original = texture2D(u_scene, vUv).rgb;',
      '  vec3 distorted = texture2D(u_scene, distortedUv).rgb;',
      '  float delta = length(distorted - original);',
      '  float field = abs(offset) * 24.0 + length(rawVelocity) * 0.004;',
      '  float changedPixels = smoothstep(0.012, 0.105, delta);',
      '  float activeFluid = smoothstep(0.010, 0.16, field);',
      '  float alpha = changedPixels * activeFluid;',
      '  gl_FragColor = vec4(distorted, alpha);',
      '}',
    ].join('\n');

    const makeMaterial = (
      vertexShader: string,
      fragmentShader: string,
      uniforms: Record<
        string,
        THREE.IUniform
      >,
      transparent = false
    ) =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        depthTest: false,
        depthWrite: false,
        transparent,
        blending: transparent
          ? THREE.NormalBlending
          : THREE.NoBlending,
      });

    const splatMaterial = makeMaterial(
      baseVertex,
      splatFragment,
      {
        u_input_texture: { value: null },
        u_ratio: { value: 1 },
        u_point_value: {
          value: new THREE.Vector3(),
        },
        u_point: {
          value: new THREE.Vector2(
            0.65,
            0.5
          ),
        },
        u_point_size: { value: 0.00018 },
      }
    );

    const texel = new THREE.Vector2(1, 1);

    const divergenceMaterial =
      makeMaterial(
        fluidVertex,
        divergenceFragment,
        {
          u_texel: {
            value: texel.clone(),
          },
          u_velocity_texture: {
            value: null,
          },
        }
      );

    const pressureMaterial = makeMaterial(
      fluidVertex,
      pressureFragment,
      {
        u_texel: {
          value: texel.clone(),
        },
        u_pressure_texture: {
          value: null,
        },
        u_divergence_texture: {
          value: null,
        },
      }
    );

    const gradientMaterial = makeMaterial(
      fluidVertex,
      gradientSubtractFragment,
      {
        u_texel: {
          value: texel.clone(),
        },
        u_pressure_texture: {
          value: null,
        },
        u_velocity_texture: {
          value: null,
        },
      }
    );

    const advectionMaterial =
      makeMaterial(
        baseVertex,
        advectionFragment,
        {
          u_velocity_texture: {
            value: null,
          },
          u_input_texture: {
            value: null,
          },
          u_texel: {
            value: texel.clone(),
          },
          u_output_texel: {
            value: texel.clone(),
          },
          u_dt: { value: 0 },
          u_dissipation: {
            value: 0.98,
          },
        }
      );

    const texture =
      new THREE.TextureLoader().load(
        sourceImage.currentSrc ||
          sourceImage.src,
        () => {
          if (disposed) return;
          texture.colorSpace =
            THREE.SRGBColorSpace;
          texture.needsUpdate = true;
          sceneMaterial.uniforms
            .u_image_size.value.set(
              texture.image
                ?.naturalWidth ||
                texture.image?.width ||
                2048,
              texture.image
                ?.naturalHeight ||
                texture.image?.height ||
                2048
            );
          resize();
          bgWrap.classList.add(
            'is-liquid-ready'
          );
        }
      );

    texture.colorSpace =
      THREE.SRGBColorSpace;
    texture.minFilter =
      THREE.LinearFilter;
    texture.magFilter =
      THREE.LinearFilter;
    texture.generateMipmaps = false;

    const sceneMaterial = makeMaterial(
      baseVertex,
      sceneFragment,
      {
        u_texture: { value: texture },
        u_view_size: {
          value: new THREE.Vector2(1, 1),
        },
        u_image_size: {
          value: new THREE.Vector2(
            2048,
            2048
          ),
        },
      }
    );

    const finalMaterial = makeMaterial(
      baseVertex,
      finalFragment,
      {
        u_scene: { value: null },
        u_velocity: { value: null },
        u_output: { value: null },
        u_disturb_power: { value: 0.22 },
      },
      true
    );

    type DoubleRT = {
      width: number;
      height: number;
      read: THREE.WebGLRenderTarget;
      write: THREE.WebGLRenderTarget;
      swap: () => void;
      dispose: () => void;
    };

    const createRT = (
      width: number,
      height: number
    ) =>
      new THREE.WebGLRenderTarget(
        width,
        height,
        {
          type: THREE.HalfFloatType,
          format: THREE.RGBAFormat,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          wrapS:
            THREE.ClampToEdgeWrapping,
          wrapT:
            THREE.ClampToEdgeWrapping,
          depthBuffer: false,
          stencilBuffer: false,
        }
      );

    const createDoubleRT = (
      width: number,
      height: number
    ): DoubleRT => {
      let read = createRT(
        width,
        height
      );
      let write = createRT(
        width,
        height
      );

      return {
        width,
        height,
        get read() {
          return read;
        },
        get write() {
          return write;
        },
        swap() {
          const temp = read;
          read = write;
          write = temp;
        },
        dispose() {
          read.dispose();
          write.dispose();
        },
      };
    };

    let velocity: DoubleRT | null = null;
    let outputColor: DoubleRT | null =
      null;
    let divergence:
      | THREE.WebGLRenderTarget
      | null = null;
    let pressure: DoubleRT | null = null;
    let sceneTarget:
      | THREE.WebGLRenderTarget
      | null = null;

    const pointer = {
      x: 0.65,
      y: 0.5,
      lastX: null as number | null,
      lastY: null as number | null,
      dx: 0,
      dy: 0,
      moved: false,
    };

    const disposeTargets = () => {
      velocity?.dispose();
      outputColor?.dispose();
      divergence?.dispose();
      pressure?.dispose();
      sceneTarget?.dispose();
    };

    const resize = () => {
      const rect =
        bgWrap.getBoundingClientRect();

      if (
        !rect.width ||
        !rect.height ||
        disposed
      ) {
        return;
      }

      renderer.setSize(
        rect.width,
        rect.height,
        false
      );
      sceneMaterial.uniforms
        .u_view_size.value.set(
          rect.width,
          rect.height
        );

      const maxSide = 720;
      const scale = Math.min(
        1,
        maxSide /
          Math.max(
            rect.width,
            rect.height
          )
      );
      const simWidth = Math.max(
        128,
        Math.round(rect.width * scale)
      );
      const simHeight = Math.max(
        128,
        Math.round(rect.height * scale)
      );

      disposeTargets();

      velocity = createDoubleRT(
        simWidth,
        simHeight
      );
      outputColor = createDoubleRT(
        simWidth,
        simHeight
      );
      divergence = createRT(
        simWidth,
        simHeight
      );
      pressure = createDoubleRT(
        simWidth,
        simHeight
      );

      const t = new THREE.Vector2(
        1 / simWidth,
        1 / simHeight
      );
      divergenceMaterial.uniforms
        .u_texel.value.copy(t);
      pressureMaterial.uniforms
        .u_texel.value.copy(t);
      gradientMaterial.uniforms
        .u_texel.value.copy(t);
      advectionMaterial.uniforms
        .u_texel.value.copy(t);
      advectionMaterial.uniforms
        .u_output_texel.value.copy(t);

      const pixelWidth = Math.max(
        1,
        Math.floor(
          rect.width *
            renderer.getPixelRatio()
        )
      );
      const pixelHeight = Math.max(
        1,
        Math.floor(
          rect.height *
            renderer.getPixelRatio()
        )
      );

      sceneTarget =
        new THREE.WebGLRenderTarget(
          pixelWidth,
          pixelHeight,
          {
            type:
              THREE.UnsignedByteType,
            format: THREE.RGBAFormat,
            minFilter:
              THREE.LinearFilter,
            magFilter:
              THREE.LinearFilter,
            depthBuffer: false,
            stencilBuffer: false,
          }
        );

      pointer.lastX = null;
      pointer.lastY = null;
    };

    const renderPass = (
      material: THREE.Material,
      target:
        | THREE.WebGLRenderTarget
        | null
    ) => {
      quad.material = material;
      renderer.setRenderTarget(target);
      renderer.render(
        quadScene,
        quadCamera
      );
    };

    const splat = () => {
      if (
        !pointer.moved ||
        !velocity ||
        !outputColor
      ) {
        return;
      }

      pointer.moved = false;

      splatMaterial.uniforms.u_ratio.value =
        bgWrap.clientWidth /
        Math.max(
          1,
          bgWrap.clientHeight
        );
      splatMaterial.uniforms.u_point.value.set(
        pointer.x,
        pointer.y
      );

      splatMaterial.uniforms
        .u_input_texture.value =
        velocity.read.texture;
      splatMaterial.uniforms
        .u_point_value.value.set(
          pointer.dx,
          -pointer.dy,
          0
        );
      renderPass(
        splatMaterial,
        velocity.write
      );
      velocity.swap();

      splatMaterial.uniforms
        .u_input_texture.value =
        outputColor.read.texture;
      splatMaterial.uniforms
        .u_point_value.value.set(
          0.012,
          0,
          0
        );
      renderPass(
        splatMaterial,
        outputColor.write
      );
      outputColor.swap();
    };

    const stepFluid = () => {
      if (
        !velocity ||
        !outputColor ||
        !divergence ||
        !pressure
      ) {
        return;
      }

      const dt = 1 / 60;
      splat();

      divergenceMaterial.uniforms
        .u_velocity_texture.value =
        velocity.read.texture;
      renderPass(
        divergenceMaterial,
        divergence
      );

      pressureMaterial.uniforms
        .u_divergence_texture.value =
        divergence.texture;
      pressureMaterial.uniforms
        .u_pressure_texture.value =
        pressure.read.texture;
      renderPass(
        pressureMaterial,
        pressure.write
      );
      pressure.swap();

      gradientMaterial.uniforms
        .u_pressure_texture.value =
        pressure.read.texture;
      gradientMaterial.uniforms
        .u_velocity_texture.value =
        velocity.read.texture;
      renderPass(
        gradientMaterial,
        velocity.write
      );
      velocity.swap();

      advectionMaterial.uniforms
        .u_velocity_texture.value =
        velocity.read.texture;
      advectionMaterial.uniforms
        .u_input_texture.value =
        velocity.read.texture;
      advectionMaterial.uniforms
        .u_output_texel.value.set(
          1 / velocity.width,
          1 / velocity.height
        );
      advectionMaterial.uniforms
        .u_dt.value = dt;
      advectionMaterial.uniforms
        .u_dissipation.value = 0.97;
      renderPass(
        advectionMaterial,
        velocity.write
      );
      velocity.swap();

      advectionMaterial.uniforms
        .u_velocity_texture.value =
        velocity.read.texture;
      advectionMaterial.uniforms
        .u_input_texture.value =
        outputColor.read.texture;
      advectionMaterial.uniforms
        .u_output_texel.value.set(
          1 / outputColor.width,
          1 / outputColor.height
        );
      advectionMaterial.uniforms
        .u_dt.value = 8 * dt;
      advectionMaterial.uniforms
        .u_dissipation.value = 0.98;
      renderPass(
        advectionMaterial,
        outputColor.write
      );
      outputColor.swap();
    };

    const renderFinal = () => {
      if (
        !sceneTarget ||
        !velocity ||
        !outputColor
      ) {
        return;
      }

      renderPass(
        sceneMaterial,
        sceneTarget
      );

      finalMaterial.uniforms
        .u_scene.value =
        sceneTarget.texture;
      finalMaterial.uniforms
        .u_velocity.value =
        velocity.read.texture;
      finalMaterial.uniforms
        .u_output.value =
        outputColor.read.texture;
      finalMaterial.uniforms
        .u_disturb_power.value = 0.34;

      quad.material = finalMaterial;
      renderer.setRenderTarget(null);
      renderer.clear(true, true, true);
      renderer.render(
        quadScene,
        quadCamera
      );
    };

    const onPointerMove = (
      event: MouseEvent
    ) => {
      const rect =
        bgWrap.getBoundingClientRect();

      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        pointer.lastX = null;
        pointer.lastY = null;
        return;
      }

      const x =
        (event.clientX - rect.left) /
        rect.width;
      const yPx =
        event.clientY - rect.top;
      const y =
        1 - yPx / rect.height;

      if (
        pointer.lastX == null ||
        pointer.lastY == null
      ) {
        pointer.lastX = event.clientX;
        pointer.lastY = event.clientY;
        pointer.x = x;
        pointer.y = y;
        return;
      }

      const dxPx =
        event.clientX - pointer.lastX;
      const dyPx =
        event.clientY - pointer.lastY;

      pointer.moved = true;
      pointer.dx = 3 * dxPx;
      pointer.dy = 3 * dyPx;
      pointer.x = x;
      pointer.y = y;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
    };

    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf =
        requestAnimationFrame(resize);
    };

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          active =
            !!entry?.isIntersecting;
        },
        {
          rootMargin:
            '25% 0px 25% 0px',
        }
      );

    observer.observe(section);

    window.addEventListener(
      'mousemove',
      onPointerMove,
      { passive: true }
    );
    window.addEventListener(
      'resize',
      onResize,
      { passive: true }
    );

    resize();

    const loop = () => {
      if (disposed) return;

      if (active) {
        stepFluid();
        renderFinal();
      }

      loopRaf =
        requestAnimationFrame(loop);
    };

    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(loopRaf);
      cancelAnimationFrame(resizeRaf);
      observer.disconnect();
      window.removeEventListener(
        'mousemove',
        onPointerMove
      );
      window.removeEventListener(
        'resize',
        onResize
      );
      bgWrap.classList.remove(
        'is-liquid-ready'
      );
      disposeTargets();
      texture.dispose();
      splatMaterial.dispose();
      divergenceMaterial.dispose();
      pressureMaterial.dispose();
      gradientMaterial.dispose();
      advectionMaterial.dispose();
      sceneMaterial.dispose();
      finalMaterial.dispose();
      quad.geometry.dispose();
      quad.material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="possibilities"
      className="relative z-40 isolate min-h-[100svh] overflow-hidden bg-[#e7b6a9] text-white"
    >
      <div
        ref={bgRef}
        aria-hidden="true"
        className="eynLiquidBg absolute inset-0 overflow-hidden"
      >
        <img
          ref={imageRef}
          src={BACKGROUND_IMAGE}
          alt=""
          draggable={false}
          crossOrigin="anonymous"
        />
        <canvas
          ref={canvasRef}
          className="eynLiquidCanvas"
          aria-hidden="true"
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(180deg,rgba(68,78,103,.16) 0%,rgba(173,117,137,.08) 45%,rgba(157,101,117,.16) 100%), linear-gradient(180deg,rgba(8,10,15,.05) 0%,rgba(8,10,15,.01) 55%,rgba(8,10,15,.22) 100%)',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 38%,rgba(7,9,13,0) 32%,rgba(7,9,13,.055) 68%,rgba(7,9,13,.18) 100%), linear-gradient(90deg,rgba(7,9,13,.10) 0%,rgba(7,9,13,0) 24%,rgba(7,9,13,0) 76%,rgba(7,9,13,.10) 100%)',
        }}
      />

      <div className="hero-grain pointer-events-none absolute -inset-1/2 z-[3] opacity-[.045] mix-blend-soft-light" />

      <div
        data-eyn-content
        className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1180px] flex-col items-center px-5 pb-16 pt-[clamp(7.5rem,12vh,9.5rem)] md:px-8 md:pb-20"
      >
        <div
          data-reveal
          className="mx-auto max-w-[760px] text-center"
        >
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.34em] text-white/72 [text-shadow:0_2px_14px_rgba(17,12,16,.24)] md:text-[11px]">
            Discover the possibilities
          </p>

          <h2 className="font-serif text-[clamp(2.7rem,5.2vw,4.7rem)] font-normal leading-[0.94] tracking-[-0.035em] text-white [text-shadow:0_2px_24px_rgba(24,14,20,.30)]">
            Everything You Need
          </h2>

          <p className="mx-auto mt-4 max-w-[650px] text-[clamp(.98rem,1.35vw,1.18rem)] leading-[1.45] tracking-[-0.01em] text-white/82 [text-shadow:0_2px_14px_rgba(24,14,20,.24)]">
            Powerful tools, boundless creativity, and a more
            beautiful future — all in one place.
          </p>
        </div>

        <div className="relative mt-[clamp(2.9rem,5.4vh,4.6rem)] grid w-full max-w-[880px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[14px] lg:[transform:translateY(50px)_scale(0.92)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[5px] left-1/2 hidden h-[14px] w-[72%] -translate-x-1/2 rounded-[50%] bg-[#5c3733]/14 blur-[11px] lg:block"
          />
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                data-reveal
                data-eyn-card
                className="group relative min-h-[214px] overflow-hidden rounded-[22px] border border-white/[0.44] bg-white/[0.07] px-5 py-[15px] text-center text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35),inset_0_-1px_0_rgba(255,255,255,.05),0_9px_22px_rgba(75,44,40,.10)] backdrop-blur-[14px] transition-[transform,background-color,border-color,box-shadow] duration-700 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-[2px] hover:border-white/[0.58] hover:bg-white/[0.09] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.48),inset_0_-1px_0_rgba(255,255,255,.07),0_15px_30px_rgba(75,44,40,.13)]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[1px] rounded-[21px] border border-white/[0.10]"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-[18px] top-0 h-px bg-white/[0.48] opacity-70"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{
                    background:
                      'linear-gradient(145deg,rgba(255,255,255,.05) 0%,rgba(255,219,207,.035) 44%,rgba(184,118,111,.045) 100%)',
                  }}
                />

                <div className="relative z-10 flex h-full flex-col items-center">
                  <div className="relative h-[57px] w-[57px] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-[2px] group-hover:scale-[1.02]">
                    <div className="absolute inset-0 rounded-full border border-white/[0.50] bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,.46),inset_0_-7px_16px_rgba(111,66,60,.08),0_8px_22px_rgba(93,52,47,.13)] backdrop-blur-[14px]" />

                    <div
                      aria-hidden="true"
                      className="absolute inset-[6px] rounded-full border border-white/[0.12]"
                    />

                    <div
                      aria-hidden="true"
                      className="absolute left-[13px] top-[9px] h-[13px] w-[24px] -rotate-[22deg] rounded-full bg-white/[0.22] blur-[5px] opacity-80 transition-[transform,opacity] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[2px] group-hover:-translate-y-[1px] group-hover:opacity-100"
                    />

                    <Icon
                      aria-hidden="true"
                      className="absolute left-1/2 top-1/2 h-[27px] w-[27px] -translate-x-[calc(50%-1px)] -translate-y-[calc(50%-1.5px)] stroke-[1.7] text-[#a16660]/36 blur-[.3px]"
                    />

                    <Icon
                      aria-hidden="true"
                      className="absolute left-1/2 top-1/2 h-[27px] w-[27px] -translate-x-1/2 -translate-y-1/2 stroke-[1.5] text-white drop-shadow-[0_2px_4px_rgba(108,61,56,.18)] transition-[transform,filter] duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.055] group-hover:drop-shadow-[0_3px_7px_rgba(108,61,56,.22)]"
                    />
                  </div>

                  <h3 className="mt-3 font-serif text-[1.46rem] font-normal leading-none tracking-[-0.025em] text-white [text-shadow:0_1px_10px_rgba(91,47,44,.18)]">
                    {feature.title}
                  </h3>

                  <p className="mt-2 max-w-[168px] text-[12.75px] leading-[1.42] text-white/92">
                    {feature.description}
                  </p>

                  <Link
                    href={feature.href}
                    aria-label={`${feature.title} — learn more`}
                    className="mt-auto flex h-[32px] min-w-[80px] items-center justify-center rounded-full border border-white/[0.52] bg-white/[0.075] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,.36),0_4px_12px_rgba(93,50,46,.09)] backdrop-blur-[14px] transition-[transform,background-color,border-color,box-shadow] duration-600 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-[1px] hover:border-white/[0.72] hover:bg-white/[0.105]"
                  >
                    <ArrowRight className="h-[17px] w-[17px] stroke-[1.4] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[2px]" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%]"
        style={{
          background:
            'linear-gradient(180deg,rgba(32,23,22,0),rgba(32,23,22,.08))',
        }}
      />
    </section>
  );
}
