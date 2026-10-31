"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

/*
 * ScrollMotionGraphics3D
 * ============================================================================
 * Haute-Couture 3D Motion Graphics Canvas for Salon EyeLines.
 *
 * Implements the aesthetic of Reference Image 2:
 *  1. Flowing, translucent silk / organza ribbons in creamy ivory, warm
 *     champagne, and delicate blush rose, with soft satin sheen and Fresnel glow.
 *  2. Polished liquid gold metallic filaments (couture wire strands) weaving
 *     and undulating gracefully alongside the silk curves.
 *  3. Translucent pearlescent spheres & glass dewdrops / bubbles floating with
 *     buoyancy, refractive highlights, and depth-of-field parallax.
 *  4. Cascading streams of golden stardust and soft glowing bokeh particles
 *     trailing along the ribbon trajectories with dynamic twinkling.
 *  5. Cinematic scroll-linked choreography: as the visitor scrolls down the
 *     page, the camera glides along a smooth path, ribbons undulate and twist,
 *     and bubbles drift with multi-plane parallax.
 * ============================================================================
 */

// ─── LUXURY COLOR PALETTE (Reference Image 2) ───
const LUXURY_PALETTE = {
  ivory: new THREE.Color("#FAF7F2"),
  champagne: new THREE.Color("#F5E6D3"),
  rose: new THREE.Color("#F7E2DD"),
  gold: new THREE.Color("#E8C170"),
  goldDeep: new THREE.Color("#C99A46"),
  goldBright: new THREE.Color("#FFF2CF"),
  pearl: new THREE.Color("#FFFDF8"),
};

interface ScrollMotionGraphics3DProps {
  className?: string;
}

export default function ScrollMotionGraphics3D({
  className = "",
}: ScrollMotionGraphics3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef(0);
  const targetScrollRef = useRef(0);
  const animationFrameRef = useRef<number>(0);

  // Smooth scroll handler
  const handleScroll = useCallback(() => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    targetScrollRef.current = docH > 0 ? Math.min(Math.max(window.scrollY / docH, 0), 1) : 0;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ──────────────────────────────────────────────────────────────────────────
    // 1. SCENE, CAMERA, RENDERER
    // ──────────────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 95);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // ──────────────────────────────────────────────────────────────────────────
    // 2. LIGHTING SYSTEM (Warm Champagne & Rosé Studio Lights)
    // ──────────────────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.9);
    scene.add(ambientLight);

    // Key Light (Warm Champagne from top-right)
    const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.2);
    keyLight.position.set(65, 80, 75);
    scene.add(keyLight);

    // Fill Light (Soft Rose Blush from bottom-left)
    const fillLight = new THREE.DirectionalLight(0xfce8e4, 1.4);
    fillLight.position.set(-75, -45, 55);
    scene.add(fillLight);

    // Rim Light (Golden edge sheen from back)
    const rimLight = new THREE.DirectionalLight(0xf7d99b, 1.2);
    rimLight.position.set(0, 40, -60);
    scene.add(rimLight);

    // Interactive Mouse Follower Point Light (Liquid Gold Specular Glint)
    const interactiveLight = new THREE.PointLight(0xffe6a8, 1.8, 120, 1.5);
    interactiveLight.position.set(0, 0, 40);
    scene.add(interactiveLight);

    // ──────────────────────────────────────────────────────────────────────────
    // 3. SILK RIBBON PROCEDURAL MESH GENERATOR
    // ──────────────────────────────────────────────────────────────────────────
    /**
     * Builds a continuous 3D ribbon mesh along a 3D CatmullRom spline,
     * applying transverse curl/crease folding across width and width variation.
     */
    function createRibbonGeometry(
      curve: THREE.CatmullRomCurve3,
      lengthSegments = 160,
      widthSegments = 14,
      baseWidth = 32,
      foldDepth = 3.5,
      twistAngle = 1.2
    ) {
      const vertices: number[] = [];
      const normals: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];

      // Frenet frames for rotation-minimizing transport along curve
      const frames = curve.computeFrenetFrames(lengthSegments, false);

      for (let i = 0; i <= lengthSegments; i++) {
        const u = i / lengthSegments;
        const pt = curve.getPointAt(u);
        const tangent = frames.tangents[i];
        const normal = frames.normals[i];
        const binormal = frames.binormals[i];

        // Width modulation (tapers at tips, wider in mid-flourish)
        const widthProfile = baseWidth * (0.35 + 0.65 * Math.sin(u * Math.PI));

        // Smooth rotation angle along length for organic twist
        const currentTwist = Math.sin(u * Math.PI * 2.2) * twistAngle + u * 0.8;
        const cosT = Math.cos(currentTwist);
        const sinT = Math.sin(currentTwist);

        // Twisted transverse & normal vectors
        const transverse = new THREE.Vector3()
          .copy(binormal)
          .multiplyScalar(cosT)
          .addScaledVector(normal, sinT)
          .normalize();

        const crestNormal = new THREE.Vector3()
          .copy(normal)
          .multiplyScalar(cosT)
          .addScaledVector(binormal, -sinT)
          .normalize();

        for (let j = 0; j <= widthSegments; j++) {
          const v = j / widthSegments; // 0 to 1 across ribbon width
          const centeredV = v - 0.5; // -0.5 to 0.5

          // Lateral displacement
          const lateralOffset = centeredV * widthProfile;

          // Transverse fold crease (S-curve concavity that mimics flowing cloth)
          const foldOffset =
            Math.sin(v * Math.PI) * Math.cos(v * Math.PI * 1.5) * foldDepth;

          const vx =
            pt.x + transverse.x * lateralOffset + crestNormal.x * foldOffset;
          const vy =
            pt.y + transverse.y * lateralOffset + crestNormal.y * foldOffset;
          const vz =
            pt.z + transverse.z * lateralOffset + crestNormal.z * foldOffset;

          vertices.push(vx, vy, vz);
          normals.push(crestNormal.x, crestNormal.y, crestNormal.z);
          uvs.push(u, v);
        }
      }

      // Build quad indices
      const rowSize = widthSegments + 1;
      for (let i = 0; i < lengthSegments; i++) {
        for (let j = 0; j < widthSegments; j++) {
          const a = i * rowSize + j;
          const b = (i + 1) * rowSize + j;
          const c = (i + 1) * rowSize + (j + 1);
          const d = i * rowSize + (j + 1);

          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
      );
      geom.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
      geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geom.setIndex(indices);
      geom.computeVertexNormals();
      return geom;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. SILK SHADER MATERIAL (Translucent Satin Sheen + Fresnel + Gold Trim)
    // ──────────────────────────────────────────────────────────────────────────
    const silkVertexShader = `
      uniform float uTime;
      uniform float uScroll;
      uniform vec2 uMouse;

      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec2 vUv;
      varying vec3 vWorldPosition;

      void main() {
        vUv = uv;

        // Dynamic rippling silk waves
        float waveA = sin(position.x * 0.042 + position.y * 0.035 + uTime * 0.65 + uScroll * 3.2) * 2.6;
        float waveB = cos(position.y * 0.045 - position.z * 0.03 + uTime * 0.5 + uScroll * 2.4) * 1.8;
        float waveC = sin(uv.x * 6.28318 + uTime * 0.35) * 1.2;

        vec3 displaced = position + normal * (waveA + waveB + waveC);

        // Subtle interactive mouse tilt bend
        displaced.z += sin(uv.x * 3.14159) * (uMouse.x * 3.5 - uMouse.y * 2.5);

        vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
        vWorldPosition = worldPos.xyz;

        vec4 mvPosition = viewMatrix * worldPos;
        vViewPosition = -mvPosition.xyz;

        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const silkFragmentShader = `
      uniform float uTime;
      uniform float uScroll;
      uniform vec3 uIvory;
      uniform vec3 uChampagne;
      uniform vec3 uRose;
      uniform vec3 uGold;
      uniform float uOpacity;

      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec2 vUv;
      varying vec3 vWorldPosition;

      void main() {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(vViewPosition);

        // Lights
        vec3 L1 = normalize(vec3(65.0, 80.0, 75.0) - vWorldPosition);
        vec3 L2 = normalize(vec3(-75.0, -45.0, 55.0) - vWorldPosition);

        // Two-sided soft translucent diffuse lighting
        float diff1 = max(dot(N, L1), 0.0) * 0.65 + max(dot(-N, L1), 0.0) * 0.35;
        float diff2 = max(dot(N, L2), 0.0) * 0.4 + max(dot(-N, L2), 0.0) * 0.2;

        // Fresnel sheen (signature silk organza luminous glow at grazing angles)
        float NdotV = max(dot(N, V), 0.0);
        float fresnel = pow(1.0 - NdotV, 2.8);
        float broadFresnel = pow(1.0 - NdotV, 1.4);

        // Multi-tone base blend: creamy ivory -> warm champagne -> subtle blush rose
        vec3 base = mix(uIvory, uChampagne, smoothstep(0.1, 0.9, vUv.x));
        float roseShift = sin(vUv.y * 3.14159 * 2.0 + vUv.x * 2.5 + uScroll * 1.5) * 0.25 + 0.25;
        base = mix(base, uRose, roseShift);

        // Satin specular sheen (Blinn-Phong)
        vec3 H1 = normalize(L1 + V);
        float specSharp = pow(max(dot(N, H1), 0.0), 36.0) * 1.35;
        float specBroad = pow(max(dot(N, H1), 0.0), 9.0) * 0.4;

        // Golden hem trim along the edges of the ribbon
        float edgeDist = min(vUv.y, 1.0 - vUv.y);
        float goldHem = smoothstep(0.045, 0.0, edgeDist);

        // Compose color
        vec3 lit = base * (diff1 * vec3(1.0, 0.98, 0.93) + diff2 * vec3(0.96, 0.88, 0.84) + vec3(0.28));
        lit += fresnel * uChampagne * 0.85;
        lit += (specSharp + specBroad) * vec3(1.0, 0.95, 0.85);

        // Apply liquid gold trim
        lit = mix(lit, uGold * (1.2 + specSharp * 1.5), goldHem * 0.85);

        // Soft edge dissolving alpha
        float alphaMask = smoothstep(0.0, 0.035, edgeDist) *
                          smoothstep(0.0, 0.04, vUv.x) *
                          smoothstep(1.0, 0.96, vUv.x);
        float finalAlpha = (uOpacity * 0.78 + broadFresnel * 0.22) * alphaMask;

        gl_FragColor = vec4(lit, finalAlpha);
      }
    `;

    function createSilkMaterial(opacity = 0.85) {
      return new THREE.ShaderMaterial({
        vertexShader: silkVertexShader,
        fragmentShader: silkFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uScroll: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uIvory: { value: LUXURY_PALETTE.ivory },
          uChampagne: { value: LUXURY_PALETTE.champagne },
          uRose: { value: LUXURY_PALETTE.rose },
          uGold: { value: LUXURY_PALETTE.gold },
          uOpacity: { value: opacity },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 5. CONSTRUCT SILK RIBBONS (Matches Reference Image 2 Sweeping Flow)
    // ──────────────────────────────────────────────────────────────────────────
    const silkGroup = new THREE.Group();

    // Ribbon 1: Primary Lower Sweeping Wave (Cascades up from left to center-right)
    const ribbonCurve1 = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-85, -28, -12),
        new THREE.Vector3(-52, -12, 10),
        new THREE.Vector3(-18, 0, 18),
        new THREE.Vector3(18, -14, 12),
        new THREE.Vector3(50, -6, -4),
        new THREE.Vector3(80, 16, -18),
        new THREE.Vector3(105, 32, -28),
      ],
      false,
      "centripetal",
      0.5
    );
    const ribbonGeo1 = createRibbonGeometry(ribbonCurve1, 160, 16, 36, 4.2, 1.4);
    const ribbonMat1 = createSilkMaterial(0.88);
    const ribbonMesh1 = new THREE.Mesh(ribbonGeo1, ribbonMat1);
    silkGroup.add(ribbonMesh1);

    // Ribbon 2: Secondary Upper Framing Wave (Sweeps gracefully across top)
    const ribbonCurve2 = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-92, 38, -22),
        new THREE.Vector3(-54, 32, -6),
        new THREE.Vector3(-12, 24, 14),
        new THREE.Vector3(30, 32, 6),
        new THREE.Vector3(68, 24, -10),
        new THREE.Vector3(98, 12, -24),
      ],
      false,
      "centripetal",
      0.5
    );
    const ribbonGeo2 = createRibbonGeometry(ribbonCurve2, 140, 14, 28, 3.2, 1.0);
    const ribbonMat2 = createSilkMaterial(0.82);
    const ribbonMesh2 = new THREE.Mesh(ribbonGeo2, ribbonMat2);
    silkGroup.add(ribbonMesh2);

    // Ribbon 3: Atmospheric Depth Wave (Floats in deeper Z space)
    const ribbonCurve3 = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-95, -6, -42),
        new THREE.Vector3(-42, 14, -38),
        new THREE.Vector3(12, -8, -40),
        new THREE.Vector3(66, 10, -45),
        new THREE.Vector3(110, -4, -48),
      ],
      false,
      "centripetal",
      0.5
    );
    const ribbonGeo3 = createRibbonGeometry(ribbonCurve3, 120, 12, 32, 2.5, 0.7);
    const ribbonMat3 = createSilkMaterial(0.55);
    const ribbonMesh3 = new THREE.Mesh(ribbonGeo3, ribbonMat3);
    silkGroup.add(ribbonMesh3);

    scene.add(silkGroup);

    // ──────────────────────────────────────────────────────────────────────────
    // 6. POLISHED GOLDEN METALLIC FILAMENTS (Couture Wire Strands)
    // ──────────────────────────────────────────────────────────────────────────
    const goldFilamentMat = new THREE.MeshStandardMaterial({
      color: LUXURY_PALETTE.gold,
      metalness: 0.94,
      roughness: 0.16,
      emissive: LUXURY_PALETTE.goldDeep,
      emissiveIntensity: 0.22,
    });

    const filamentGroup = new THREE.Group();

    // Filament 1: Sweeping thread weaving through lower silk wave up to top-right
    const filCurve1 = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-78, -26, 8),
        new THREE.Vector3(-44, -16, 20),
        new THREE.Vector3(-6, -4, 24),
        new THREE.Vector3(34, -14, 16),
        new THREE.Vector3(64, 8, 10),
        new THREE.Vector3(84, 30, -6),
      ],
      false,
      "centripetal",
      0.5
    );
    const filGeo1 = new THREE.TubeGeometry(filCurve1, 180, 0.28, 12, false);
    const filMesh1 = new THREE.Mesh(filGeo1, goldFilamentMat);
    filamentGroup.add(filMesh1);

    // Filament 2: Delicate upper filament tracing top silk curve
    const filCurve2 = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-82, 36, -12),
        new THREE.Vector3(-38, 28, 6),
        new THREE.Vector3(6, 20, 18),
        new THREE.Vector3(48, 26, 10),
        new THREE.Vector3(80, 16, -8),
      ],
      false,
      "centripetal",
      0.5
    );
    const filGeo2 = new THREE.TubeGeometry(filCurve2, 160, 0.24, 12, false);
    const filMesh2 = new THREE.Mesh(filGeo2, goldFilamentMat);
    filamentGroup.add(filMesh2);

    // Filament 3: Looping accent strand across the lower section
    const filCurve3 = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-28, -28, 14),
        new THREE.Vector3(10, -32, 20),
        new THREE.Vector3(44, -20, 18),
        new THREE.Vector3(62, -4, 22),
        new THREE.Vector3(76, 14, 12),
      ],
      false,
      "centripetal",
      0.5
    );
    const filGeo3 = new THREE.TubeGeometry(filCurve3, 140, 0.22, 12, false);
    const filMesh3 = new THREE.Mesh(filGeo3, goldFilamentMat);
    filamentGroup.add(filMesh3);

    scene.add(filamentGroup);

    // ──────────────────────────────────────────────────────────────────────────
    // 7. PEARLESCENT SPHERES & TRANSLUCENT GLASS DEWDROPS (Bubbles)
    // ──────────────────────────────────────────────────────────────────────────
    const sphereGroup = new THREE.Group();

    // Pearl Material (Lustrous Creamy Sheen with Gold/Rose Fresnel)
    const pearlMat = new THREE.MeshStandardMaterial({
      color: LUXURY_PALETTE.pearl,
      roughness: 0.14,
      metalness: 0.08,
      emissive: LUXURY_PALETTE.champagne,
      emissiveIntensity: 0.18,
    });

    // Glass Dewdrop Material (Crystal-clear Translucent with High Specular)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 0.88,
      transparent: true,
      roughness: 0.05,
      ior: 1.48,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      attenuationColor: LUXURY_PALETTE.champagne,
      attenuationDistance: 12.0,
    });

    interface SphereData {
      mesh: THREE.Mesh;
      baseX: number;
      baseY: number;
      baseZ: number;
      floatSpeed: number;
      floatAmp: number;
      parallaxSpeed: number;
      phase: number;
    }

    const spheresList: SphereData[] = [];

    // Master Hero Pearl (Top Left — prominent statement pearl from Ref Image 2)
    const masterPearlGeo = new THREE.SphereGeometry(7.0, 36, 36);
    const masterPearlMesh = new THREE.Mesh(masterPearlGeo, pearlMat);
    masterPearlMesh.position.set(-42, 26, 8);
    sphereGroup.add(masterPearlMesh);
    spheresList.push({
      mesh: masterPearlMesh,
      baseX: -42,
      baseY: 26,
      baseZ: 8,
      floatSpeed: 0.65,
      floatAmp: 2.2,
      parallaxSpeed: 0.35,
      phase: 0,
    });

    // Master Glass Bubble (Mid Right — translucent dewdrop from Ref Image 2)
    const masterGlassGeo = new THREE.SphereGeometry(5.4, 32, 32);
    const masterGlassMesh = new THREE.Mesh(masterGlassGeo, glassMat);
    masterGlassMesh.position.set(52, -6, 16);
    sphereGroup.add(masterGlassMesh);
    spheresList.push({
      mesh: masterGlassMesh,
      baseX: 52,
      baseY: -6,
      baseZ: 16,
      floatSpeed: 0.8,
      floatAmp: 2.5,
      parallaxSpeed: 0.55,
      phase: 1.8,
    });

    // Secondary Floating Dewdrops & Pearls scattered along the ribbon flow
    const smallSphereDefs = [
      { x: -32, y: 10, z: 14, r: 2.8, isPearl: true, parallax: 0.45 },
      { x: -16, y: -16, z: 12, r: 2.2, isPearl: false, parallax: 0.65 },
      { x: 8, y: -10, z: 22, r: 1.8, isPearl: true, parallax: 0.8 },
      { x: 36, y: 14, z: 12, r: 2.6, isPearl: false, parallax: 0.5 },
      { x: 62, y: 18, z: 2, r: 3.2, isPearl: true, parallax: 0.4 },
      { x: 26, y: -26, z: 10, r: 1.6, isPearl: false, parallax: 0.75 },
      { x: -56, y: -14, z: 6, r: 2.4, isPearl: true, parallax: 0.35 },
      { x: 44, y: 30, z: -6, r: 3.6, isPearl: true, parallax: 0.3 },
      { x: -10, y: 28, z: 10, r: 1.4, isPearl: false, parallax: 0.6 },
      { x: 70, y: -18, z: 14, r: 2.0, isPearl: false, parallax: 0.7 },
    ];

    smallSphereDefs.forEach((def, idx) => {
      const geo = new THREE.SphereGeometry(def.r, 24, 24);
      const mesh = new THREE.Mesh(geo, def.isPearl ? pearlMat : glassMat);
      mesh.position.set(def.x, def.y, def.z);
      sphereGroup.add(mesh);
      spheresList.push({
        mesh,
        baseX: def.x,
        baseY: def.y,
        baseZ: def.z,
        floatSpeed: 0.7 + idx * 0.12,
        floatAmp: 1.4 + (idx % 3) * 0.5,
        parallaxSpeed: def.parallax,
        phase: idx * 0.75,
      });
    });

    scene.add(sphereGroup);

    // ──────────────────────────────────────────────────────────────────────────
    // 8. CASCADING GOLDEN STARDUST & BOKEH PARTICLES
    // ──────────────────────────────────────────────────────────────────────────
    // Procedural high-resolution stardust canvas texture
    const pCanvas = document.createElement("canvas");
    pCanvas.width = 128;
    pCanvas.height = 128;
    const pCtx = pCanvas.getContext("2d")!;

    // Multi-stop radial sparkle glow
    const pGrad = pCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    pGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
    pGrad.addColorStop(0.12, "rgba(255, 243, 207, 0.95)");
    pGrad.addColorStop(0.35, "rgba(232, 193, 112, 0.65)");
    pGrad.addColorStop(0.65, "rgba(201, 154, 70, 0.2)");
    pGrad.addColorStop(1, "rgba(201, 154, 70, 0)");
    pCtx.fillStyle = pGrad;
    pCtx.beginPath();
    pCtx.arc(64, 64, 64, 0, Math.PI * 2);
    pCtx.fill();

    // Diamond cross glint in center
    pCtx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    pCtx.lineWidth = 1.5;
    pCtx.beginPath();
    pCtx.moveTo(64, 40);
    pCtx.lineTo(64, 88);
    pCtx.moveTo(40, 64);
    pCtx.lineTo(88, 64);
    pCtx.stroke();

    const particleTexture = new THREE.CanvasTexture(pCanvas);

    // Stream 1: Cascading ribbon dust particles (~380 particles along curves)
    const PARTICLE_COUNT = 380;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleBaseU = new Float32Array(PARTICLE_COUNT);
    const particleSpeeds = new Float32Array(PARTICLE_COUNT);
    const particleOffsets = new Float32Array(PARTICLE_COUNT * 3);
    const particlePhases = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const u = Math.random();
      particleBaseU[i] = u;
      particleSpeeds[i] = 0.015 + Math.random() * 0.025;
      particlePhases[i] = Math.random() * Math.PI * 2;

      // Small radial scatter offset around curve
      particleOffsets[i3] = (Math.random() - 0.5) * 16;
      particleOffsets[i3 + 1] = (Math.random() - 0.5) * 12;
      particleOffsets[i3 + 2] = (Math.random() - 0.5) * 10;

      // Initial sample from lower ribbon curve
      const pt = ribbonCurve1.getPointAt(u);
      particlePositions[i3] = pt.x + particleOffsets[i3];
      particlePositions[i3 + 1] = pt.y + particleOffsets[i3 + 1];
      particlePositions[i3 + 2] = pt.z + particleOffsets[i3 + 2];
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      size: 2.8,
      map: particleTexture,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: LUXURY_PALETTE.gold,
    });
    const ribbonDust = new THREE.Points(particleGeo, particleMat);
    scene.add(ribbonDust);

    // Stream 2: Ambient Large Bokeh Discs (Dreamy out-of-focus background orbs)
    const BOKEH_COUNT = 32;
    const bokehGeo = new THREE.BufferGeometry();
    const bokehPos = new Float32Array(BOKEH_COUNT * 3);
    for (let i = 0; i < BOKEH_COUNT; i++) {
      const i3 = i * 3;
      bokehPos[i3] = (Math.random() - 0.5) * 160;
      bokehPos[i3 + 1] = (Math.random() - 0.5) * 120;
      bokehPos[i3 + 2] = (Math.random() - 0.5) * 70 - 20;
    }
    bokehGeo.setAttribute("position", new THREE.BufferAttribute(bokehPos, 3));

    const bokehMat = new THREE.PointsMaterial({
      size: 11.0,
      map: particleTexture,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: LUXURY_PALETTE.champagne,
    });
    const bokehParticles = new THREE.Points(bokehGeo, bokehMat);
    scene.add(bokehParticles);

    // ──────────────────────────────────────────────────────────────────────────
    // 9. SCROLL & MOUSE INTERACTION LISTENERS
    // ──────────────────────────────────────────────────────────────────────────
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // ──────────────────────────────────────────────────────────────────────────
    // 10. ANIMATION & SMOOTHED SCROLL CHOREOGRAPHY LOOP
    // ──────────────────────────────────────────────────────────────────────────
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Smooth scroll interpolation (cinematic damping)
      scrollProgressRef.current +=
        (targetScrollRef.current - scrollProgressRef.current) * 0.055;
      const scroll = scrollProgressRef.current; // 0 (top) to 1 (bottom)

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Update shader uniforms
      const materials = [ribbonMat1, ribbonMat2, ribbonMat3];
      materials.forEach((mat) => {
        mat.uniforms.uTime.value = elapsed;
        mat.uniforms.uScroll.value = scroll;
        mat.uniforms.uMouse.value.set(mouseX, mouseY);
      });

      // ── Camera Cinematic Path ──
      // Tracks down, pulls in slightly, and sweeps gracefully along an S-curve
      const targetCamX = mouseX * 5.0 + Math.sin(scroll * Math.PI) * 10.0;
      const targetCamY = -mouseY * 4.0 - scroll * 28.0;
      const targetCamZ = 95.0 - scroll * 16.0;

      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.position.z += (targetCamZ - camera.position.z) * 0.04;

      // Camera looks towards scene focal point, smoothly tracking downward
      camera.lookAt(0, -scroll * 24.0, 0);

      // Subtle camera roll for haute couture elegance
      camera.rotation.z = (scroll - 0.5) * 0.06 + mouseX * 0.02;

      // ── Interactive Light Positioning ──
      interactiveLight.position.x = mouseX * 45;
      interactiveLight.position.y = -mouseY * 35 - scroll * 20;
      interactiveLight.position.z = 35 + Math.sin(elapsed * 1.5) * 5;

      // ── Silk Ribbons Undulation & Scroll Movement ──
      silkGroup.rotation.y = scroll * 0.28 + Math.sin(elapsed * 0.25) * 0.04;
      silkGroup.rotation.x = Math.sin(scroll * Math.PI * 1.2) * 0.08;
      silkGroup.position.y = -scroll * 12.0;

      // ── Golden Filaments Twist ──
      filamentGroup.rotation.y = scroll * 0.32 + Math.sin(elapsed * 0.3) * 0.05;
      filamentGroup.rotation.x = silkGroup.rotation.x;
      filamentGroup.position.y = silkGroup.position.y;

      // ── Spheres (Pearls & Dewdrops) Buoyancy & Parallax ──
      spheresList.forEach((s) => {
        const floatY =
          Math.sin(elapsed * s.floatSpeed + s.phase) * s.floatAmp;
        const floatX =
          Math.cos(elapsed * (s.floatSpeed * 0.7) + s.phase) * (s.floatAmp * 0.35);

        s.mesh.position.y =
          s.baseY + floatY - scroll * (30.0 * s.parallaxSpeed);
        s.mesh.position.x = s.baseX + floatX + mouseX * (s.parallaxSpeed * 3.0);
        s.mesh.position.z = s.baseZ + Math.sin(elapsed * 0.5 + s.phase) * 1.0;

        // Subtle pearlescent sphere rotation
        s.mesh.rotation.y = elapsed * 0.15 + s.phase;
      });

      // ── Cascading Ribbon Dust Twinkle & Flow Along Curve ──
      const pArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        // Advance progress along curve
        particleBaseU[i] =
          (particleBaseU[i] + particleSpeeds[i] * (0.015 + scroll * 0.03)) % 1;
        const currentU = particleBaseU[i];

        // Sample position along primary ribbon curve
        const curvePt = ribbonCurve1.getPointAt(currentU);

        // Breathing floating flutter
        const flutter = Math.sin(elapsed * 1.5 + particlePhases[i]) * 1.2;

        pArr[i3] = curvePt.x + particleOffsets[i3];
        pArr[i3 + 1] =
          curvePt.y + particleOffsets[i3 + 1] + flutter - scroll * 12.0;
        pArr[i3 + 2] = curvePt.z + particleOffsets[i3 + 2];
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Ambient Bokeh Discs Drift
      const bArr = bokehGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < BOKEH_COUNT; i++) {
        const i3 = i * 3;
        bArr[i3 + 1] += 0.012;
        if (bArr[i3 + 1] > 70) bArr[i3 + 1] = -70;
      }
      bokehGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // ──────────────────────────────────────────────────────────────────────────
    // 11. RESPONSIVE RESIZE OBSERVER
    // ──────────────────────────────────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // ──────────────────────────────────────────────────────────────────────────
    // 12. DISPOSAL & RESOURCE CLEANUP
    // ──────────────────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      // Geometries
      ribbonGeo1.dispose();
      ribbonGeo2.dispose();
      ribbonGeo3.dispose();
      filGeo1.dispose();
      filGeo2.dispose();
      filGeo3.dispose();
      masterPearlGeo.dispose();
      masterGlassGeo.dispose();
      particleGeo.dispose();
      bokehGeo.dispose();
      spheresList.forEach((s) => s.mesh.geometry.dispose());

      // Materials
      ribbonMat1.dispose();
      ribbonMat2.dispose();
      ribbonMat3.dispose();
      goldFilamentMat.dispose();
      pearlMat.dispose();
      glassMat.dispose();
      particleMat.dispose();
      bokehMat.dispose();

      // Textures & Renderer
      particleTexture.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
