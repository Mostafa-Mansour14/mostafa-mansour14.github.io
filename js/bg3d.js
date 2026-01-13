// =========================
// Premium 3D Background
// ONLY: Clapper + Lens (No Camera Body)
// =========================
(function () {
  if (!window.THREE) return;

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const container = document.getElementById("bg3d");
  if (!container) return;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    52,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 11;

  // Lights (soft cinematic)
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(7, 8, 10);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xffffff, 0.5);
  rim.position.set(-8, 2, 8);
  scene.add(rim);

  const amb = new THREE.AmbientLight(0xffffff, 0.32);
  scene.add(amb);

  // Materials
  const matWarm = new THREE.MeshStandardMaterial({
    color: 0xbd5d38, roughness: 0.45, metalness: 0.55
  });
  const matCool = new THREE.MeshStandardMaterial({
    color: 0x2b6fff, roughness: 0.55, metalness: 0.45
  });
  const matDark = new THREE.MeshStandardMaterial({
    color: 0x1f2327, roughness: 0.7, metalness: 0.22
  });
  const matWhite = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.65, metalness: 0.12
  });

  const group = new THREE.Group();
  scene.add(group);

  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

  // =====================================================
  // 1) CLAPPERBOARD
  // =====================================================
  const clapper = new THREE.Group();

  const slate = box(2.15, 1.25, 0.18, matDark);
  clapper.add(slate);

  const topBar = box(2.2, 0.35, 0.2, matWhite);
  topBar.position.set(0, 0.75, 0);
  clapper.add(topBar);

  for (let i = 0; i < 7; i++) {
    const stripe = box(0.32, 0.08, 0.22, i % 2 ? matWarm : matCool);
    stripe.position.set(-0.92 + i * 0.32, 0.75, 0.02);
    stripe.rotation.z = -0.55;
    clapper.add(stripe);
  }

  clapper.scale.setScalar(0.78);
  clapper.position.set(-1.4, -1.9, -1.1);
  clapper.rotation.set(-0.12, 0.32, 0.12);
  group.add(clapper);

  // =====================================================
  // 2) DIAPHRAGM LENS
  // =====================================================
  const lens = new THREE.Group();

  const outer = new THREE.Mesh(
    new THREE.TorusGeometry(1.15, 0.14, 16, 80),
    matWarm
  );
  outer.rotation.x = Math.PI / 2.2;
  lens.add(outer);

  const inner = new THREE.Mesh(
    new THREE.TorusGeometry(0.72, 0.10, 16, 70),
    matCool
  );
  inner.rotation.x = Math.PI / 2.2;
  lens.add(inner);

  const bladeGeo = new THREE.BoxGeometry(0.62, 0.16, 0.08);
  const blades = new THREE.Group();
  const bladeCount = 8;

  for (let i = 0; i < bladeCount; i++) {
    const b = new THREE.Mesh(bladeGeo, matDark);
    const a = (i / bladeCount) * Math.PI * 2;
    b.position.set(Math.cos(a) * 0.38, Math.sin(a) * 0.38, 0);
    b.rotation.z = a + Math.PI / 4;
    blades.add(b);
  }
  lens.add(blades);

  lens.scale.setScalar(0.78);
  lens.position.set(2.7, 0.25, -1.8);
  lens.rotation.set(0.2, 0.85, -0.1);
  group.add(lens);

  // Motion (light)
  let mx = 0, my = 0;
  document.addEventListener("mousemove", (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let running = true;
  function animate() {
    if (!running) return;

    group.rotation.y += 0.0009;
    group.rotation.x += 0.00055;

    group.rotation.y += mx * 0.00035;
    group.rotation.x += my * 0.00025;

    clapper.rotation.y -= 0.00045;
    lens.rotation.z += 0.0009;

    const t = performance.now() * 0.001;
    blades.rotation.z = Math.sin(t * 0.8) * 0.18;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  let resizeT = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 80);
  });

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) animate();
  });
})();
