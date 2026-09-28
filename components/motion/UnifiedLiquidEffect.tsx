'use client';

import {
  useEffect,
  useRef,
  type RefObject,
} from 'react';
import * as THREE from 'three';

type UnifiedLiquidEffectProps = {
  sectionRef: RefObject<HTMLElement | null>;
  sourceType: 'image' | 'canvas';
  sourceValue: string;
  className?: string;
};

export function UnifiedLiquidEffect({
  sectionRef,
  sourceType,
  sourceValue,
  className = '',
}: UnifiedLiquidEffectProps) {
  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const sourceCanvas =
      sourceType === 'canvas'
        ? (document.getElementById(
            sourceValue
          ) as HTMLCanvasElement | null)
        : null;
    const sourceBuffer =
      sourceCanvas
        ? document.createElement('canvas')
        : null;
    const sourceBufferContext =
      sourceBuffer?.getContext('2d', {
        alpha: false,
        desynchronized: false,
      }) ?? null;

    if (
      !section ||
      !canvas ||
      (sourceType === 'canvas' &&
        !sourceCanvas)
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

    let texture: THREE.Texture =
      new THREE.Texture();

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

    if (sourceType === 'image') {
      const placeholder = texture;

      new THREE.TextureLoader().load(
        sourceValue,
        (loadedTexture) => {
          if (disposed) {
            loadedTexture.dispose();
            return;
          }

          placeholder.dispose();
          texture = loadedTexture;
          texture.colorSpace =
            THREE.SRGBColorSpace;
          texture.minFilter =
            THREE.LinearFilter;
          texture.magFilter =
            THREE.LinearFilter;
          texture.generateMipmaps = false;
          texture.needsUpdate = true;

          sceneMaterial.uniforms
            .u_texture.value = texture;
          sceneMaterial.uniforms
            .u_image_size.value.set(
              loadedTexture.image
                ?.naturalWidth ||
                loadedTexture.image?.width ||
                2048,
              loadedTexture.image
                ?.naturalHeight ||
                loadedTexture.image?.height ||
                2048
            );

          canvas.classList.add(
            'is-liquid-ready'
          );
        }
      );
    } else if (
      sourceCanvas &&
      sourceBuffer &&
      sourceBufferContext
    ) {
      sourceBuffer.width = Math.max(
        1,
        sourceCanvas.width
      );
      sourceBuffer.height = Math.max(
        1,
        sourceCanvas.height
      );

      texture.dispose();
      texture =
        new THREE.CanvasTexture(
          sourceBuffer
        );
      texture.colorSpace =
        THREE.SRGBColorSpace;
      texture.minFilter =
        THREE.LinearFilter;
      texture.magFilter =
        THREE.LinearFilter;
      texture.generateMipmaps = false;

      sceneMaterial.uniforms
        .u_texture.value = texture;
    }

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

    const rectSafeWidth = () =>
      Math.max(
        1,
        canvas.getBoundingClientRect().width
      );
    const rectSafeHeight = () =>
      Math.max(
        1,
        canvas.getBoundingClientRect().height
      );

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
        canvas.getBoundingClientRect();

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
        rectSafeWidth() /
        Math.max(
          1,
          rectSafeHeight()
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
        .u_dissipation.value = 0.955;
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
        .u_dt.value = 2.5 * dt;
      advectionMaterial.uniforms
        .u_dissipation.value = 0.94;
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

      if (
        sourceCanvas &&
        sourceBuffer &&
        sourceBufferContext
      ) {
        const width = Math.max(
          1,
          sourceCanvas.width
        );
        const height = Math.max(
          1,
          sourceCanvas.height
        );

        if (
          sourceBuffer.width !== width ||
          sourceBuffer.height !== height
        ) {
          sourceBuffer.width = width;
          sourceBuffer.height = height;
        }

        try {
          sourceBufferContext.drawImage(
            sourceCanvas,
            0,
            0,
            width,
            height
          );

          texture.needsUpdate = true;
          sceneMaterial.uniforms
            .u_image_size.value.set(
              width,
              height
            );

          if (
            !canvas.classList.contains(
              'is-liquid-ready'
            )
          ) {
            canvas.classList.add(
              'is-liquid-ready'
            );
          }
        } catch {
          return;
        }
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
        .u_disturb_power.value = 0.22;

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
        canvas.getBoundingClientRect();

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

      const x = Math.max(
        0,
        Math.min(
          1,
          (event.clientX - rect.left) /
            rect.width
        )
      );
      const yPx =
        event.clientY - rect.top;
      const y = Math.max(
        0,
        Math.min(
          1,
          1 - yPx / rect.height
        )
      );

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
      canvas.classList.remove(
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
  }, [
    sectionRef,
    sourceType,
    sourceValue,
  ]);

  return (
    <canvas
      ref={canvasRef}
      data-liquid-canvas
      aria-hidden="true"
      className={`unifiedLiquidCanvas ${className}`}
    />
  );
}
