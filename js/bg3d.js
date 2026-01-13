// =========================
// Premium 3D Background (No downloads)
// ONLY: Clapperboard
// =========================
(function () {
  if (!window.THREE) return;

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const container = document.getElementById("bg3d");
  if (!container) return;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    52,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 10.5;

  // Lights
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(7, 8, 10);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xffffff, 0.55);
  rim.position.set(-8, 2, 8);
  scene.add(rim);

  const amb = new THREE.AmbientLight(0xffffff, 0.34);
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
  // CLAPPERBOARD ONLY
  // =====================================================
  const clapper = new THREE.Group();

  const slate = box(2.35, 1.35, 0.18, matDark);
  clapper.add(slate);

  const topBar = box(2.42, 0.36, 0.2, matWhite);
  topBar.position.set(0, 0.82, 0);
  clapper.add(topBar);

  for (let i = 0; i < 7; i++) {
    const stripe = box(0.34, 0.085, 0.22, i % 2 ? matWarm : matCool);
    stripe.position.set(-1.02 + i * 0.34, 0.82, 0.02);
    stripe.rotation.z = -0.55;
    clapper.add(stripe);
  }

  clapper.scale.setScalar(0.85);
  clapper.position.set(1.2, -0.7, -1.2);
  clapper.rotation.set(-0.15, 0.55, 0.12);
  group.add(clapper);

  // Motion (subtle premium)
  let mx = 0, my = 0;
  document.addEventListener("mousemove", (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let running = true;
  function animate() {
    if (!running) return;

    group.rotation.y += 0.00085;
    group.rotation.x += 0.00055;

    group.rotation.y += mx * 0.00035;
    group.rotation.x += my * 0.00025;

    clapper.rotation.y -= 0.00045;

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
