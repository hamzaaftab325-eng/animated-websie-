'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

const PROJECTS_BACKGROUND =
  'https://res.cloudinary.com/diometfe9/image/upload/v1790183196/download_enkn9u.png';

const BUTTON_LABEL = 'View Projects';

export function ProjectsLiquidSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const bgWrap = bgRef.current;
    const image = imageRef.current;
    const canvas = canvasRef.current;

    if (!section || !bgWrap || !image || !canvas) return;

    const titleLines = Array.from(
      section.querySelectorAll<HTMLElement>(
        '[data-projects-title-line]'
      )
    );
    const descLines = Array.from(
      section.querySelectorAll<HTMLElement>(
        '[data-projects-desc-line]'
      )
    );
    const buttonChars = Array.from(
      section.querySelectorAll<HTMLElement>(
        '[data-projects-button-char]'
      )
    );
    const firstLine =
      section.querySelector<HTMLElement>(
        '[data-projects-line-first]'
      );
    const lastLine =
      section.querySelector<HTMLElement>(
        '[data-projects-line-last]'
      );
    const contents =
      section.querySelector<HTMLElement>(
        '[data-projects-contents]'
      );
    const label =
      section.querySelector<HTMLElement>(
        '[data-projects-label]'
      );
    const tint =
      section.querySelector<HTMLElement>(
        '[data-projects-tint]'
      );

    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(
          [
            ...titleLines,
            ...descLines,
            ...buttonChars,
          ],
          {
            opacity: 1,
            y: 0,
            yPercent: 0,
            rotateX: 0,
            filter: 'none',
          }
        );

        if (lastLine) {
          gsap.set(lastLine, {
            clipPath:
              'inset(0% calc(100% - 5vw) 0% 0%)',
          });
        }

        return;
      }

      gsap.set(titleLines, {
        yPercent: 125,
        opacity: 0,
        rotateX: 9,
        filter: 'blur(10px)',
        transformOrigin: '0% 100%',
        force3D: true,
      });

      gsap.set(descLines, {
        yPercent: 115,
        opacity: 0,
        filter: 'blur(7px)',
        force3D: true,
      });

      gsap.set(buttonChars, {
        y: 10,
        opacity: 0,
        force3D: true,
      });

      if (image) {
        gsap.fromTo(
          image,
          {
            yPercent: -6,
            scale: 1.115,
          },
          {
            yPercent: 9,
            scale: 1.025,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }

      gsap.fromTo(
        canvas,
        {
          yPercent: -6,
          scale: 1.115,
        },
        {
          yPercent: 9,
          scale: 1.025,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      if (contents) {
        gsap.fromTo(
          contents,
          { y: 74 },
          {
            y: -128,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }

      if (label) {
        gsap.fromTo(
          label,
          { y: 14 },
          {
            y: -44,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top center',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }

      if (tint) {
        gsap.fromTo(
          tint,
          { opacity: 0.88 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'center center',
              scrub: true,
            },
          }
        );
      }

      const playReferenceAnimation = () => {
        gsap.to(titleLines, {
          opacity: 1,
          duration: 0.72,
          stagger: 0.055,
          ease: 'power2.out',
        });

        gsap.to(titleLines, {
          yPercent: 0,
          rotateX: 0,
          filter: 'blur(0px)',
          duration: 1.02,
          stagger: 0.055,
          ease: 'expo.out',
          force3D: true,
        });

        gsap.to(descLines, {
          opacity: 1,
          duration: 0.78,
          delay: 0.34,
          stagger: 0.05,
          ease: 'power2.out',
        });

        gsap.to(descLines, {
          yPercent: 0,
          filter: 'blur(0px)',
          duration: 1.02,
          delay: 0.34,
          stagger: 0.05,
          ease: 'expo.out',
          force3D: true,
        });

        if (firstLine) {
          gsap.to(firstLine, {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.52,
            delay: 0.66,
            ease: 'power4.out',
          });

          gsap.to(firstLine, {
            clipPath: 'inset(0% 0% 0% 100%)',
            duration: 0.52,
            delay: 0.92,
            ease: 'power4.inOut',
          });
        }

        if (lastLine) {
          gsap.fromTo(
            lastLine,
            {
              clipPath:
                'inset(0% 100% 0% 0%)',
            },
            {
              clipPath:
                window.innerWidth <= 767
                  ? 'inset(0% calc(100% - 19.9004975124vw) 0% 0%)'
                  : 'inset(0% calc(100% - 5vw) 0% 0%)',
              duration: 0.58,
              delay: 1,
              ease: 'power4.out',
            }
          );
        }

        gsap.to(buttonChars, {
          y: 0,
          opacity: 1,
          duration: 0.72,
          delay: 0.98,
          stagger: 0.018,
          ease: 'power3.out',
          force3D: true,
        });
      };

      ScrollTrigger.create({
        trigger: section,
        start: 'top 78%',
        once: true,
        onEnter: playReferenceAnimation,
      });
    }, section);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    const onImageReady = () => {
      ScrollTrigger.refresh();
    };

    image.addEventListener('load', onImageReady);

    if (image.decode) {
      image
        .decode()
        .then(onImageReady)
        .catch(() => {});
    }

    return () => {
      image.removeEventListener(
        'load',
        onImageReady
      );
      ctx.revert();
    };
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
        u_point_size: { value: 0.0005 },
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
        u_disturb_power: { value: 0.5 },
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
          0.025,
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
        .u_disturb_power.value = 0.5;

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
      pointer.dx = 6 * dxPx;
      pointer.dy = 6 * dyPx;
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
      id="projectsSection"
      aria-labelledby="projectsTitle"
      className="ffProjects"
    >
      <div
        ref={bgRef}
        className="ffProjects_bg"
        aria-hidden="true"
      >
        <img
          ref={imageRef}
          src={PROJECTS_BACKGROUND}
          alt=""
          draggable={false}
        />
        <canvas
          ref={canvasRef}
          className="ffProjects_liquidCanvas"
          aria-hidden="true"
        />
      </div>

      <div
        data-projects-tint
        className="ffProjects_tint"
        aria-hidden="true"
      />

      <div
        data-projects-contents
        className="ffProjects_contents"
      >
        <div className="ffProjects_inner">
          <div className="ffProjects_sticky">
            <div className="ffProjects_stickySub">
              <h2
                data-projects-label
                className="ffProjects_label"
              >
                projects
              </h2>
            </div>

            <div className="ffProjects_stickyMain">
              <div className="ffProjects_content">
                <p
                  id="projectsTitle"
                  className="ffProjects_title"
                  aria-label="Designing the Dimensions of Life"
                >
                  <span className="ffProjects_lineMask">
                    <span
                      data-projects-title-line
                      className="ffProjects_titleLine"
                    >
                      Designing
                    </span>
                  </span>
                  <span className="ffProjects_lineMask">
                    <span
                      data-projects-title-line
                      className="ffProjects_titleLine"
                    >
                      the Dimensions
                    </span>
                  </span>
                  <span className="ffProjects_lineMask">
                    <span
                      data-projects-title-line
                      className="ffProjects_titleLine"
                    >
                      of Life
                    </span>
                  </span>
                </p>

                <div className="ffProjects_descriptions">
                  <p className="ffProjects_description">
                    {[
                      'Through three practices,',
                      'Izanami designs harmony across life.',
                      'How life is nurtured, how living is enriched,',
                      'and how one returns to oneself.',
                    ].map((line) => (
                      <span
                        key={line}
                        className="ffProjects_descMask"
                      >
                        <span
                          data-projects-desc-line
                          className="ffProjects_descLine"
                        >
                          {line}
                        </span>
                      </span>
                    ))}
                  </p>
                </div>

                <div className="ffProjects_buttonWrap">
                  <Link
                    className="ffProjects_button"
                    href="/work"
                    aria-label="View Projects"
                  >
                    <span className="ffProjects_buttonBlock">
                      <span
                        className="ffProjects_buttonLines"
                        aria-hidden="true"
                      >
                        <span
                          data-projects-line-first
                          className="ffProjects_buttonLine ffProjects_buttonLineFirst"
                        />
                        <span
                          data-projects-line-last
                          className="ffProjects_buttonLine ffProjects_buttonLineLast"
                        />
                      </span>

                      <span className="ffProjects_buttonText">
                        <span className="ffProjects_buttonTextContent">
                          {BUTTON_LABEL.split(
                            ''
                          ).map(
                            (
                              char,
                              index
                            ) => (
                              <span
                                key={
                                  char +
                                  index
                                }
                                data-projects-button-char
                                className="ffProjects_buttonChar"
                              >
                                {char ===
                                ' '
                                  ? '\u00A0'
                                  : char}
                              </span>
                            )
                          )}
                        </span>
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
