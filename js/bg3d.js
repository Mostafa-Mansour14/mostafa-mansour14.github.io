// =========================
// Premium 3D Background (No downloads)
// ONLY: Cinema Camera + Clapper + Lens
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
  camera.position.z = 11;

  // Lights (soft cinematic)
  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(7, 8, 10);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xffffff, 0.55);
  rim.position.set(-8, 2, 8);
  scene.add(rim);

  const amb = new THREE.AmbientLight(0xffffff, 0.34);
  scene.add(amb);

  // Materials (classy)
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
  // 1) CINEMA CAMERA
  // =====================================================
  const movieCam = new THREE.Group();

  const body = box(2.25, 1.35, 0.95, matDark);
  movieCam.add(body);

  const handle = box(0.55, 0.25, 0.55, matDark);
  handle.position.set(-0.55, 0.95, 0);
  movieCam.add(handle);

  const lensBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.62, 0.95, 28),
    matWarm
  );
  lensBarrel.rotation.x = Math.PI / 2;
  lensBarrel.position.set(1.45, -0.05, 0);
  movieCam.add(lensBarrel);

  const lensRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.1, 14, 56),
    matCool
  );
  lensRing.rotation.y = Math.PI / 2;
  lensRing.position.set(1.95, -0.05, 0);
  movieCam.add(lensRing);

  const reelGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.18, 28);
  const r1 = new THREE.Mesh(reelGeo, matWhite);
  r1.position.set(-0.85, 0.9, 0.35);
  r1.rotation.x = Math.PI / 2;
  movieCam.add(r1);

  const r2 = new THREE.Mesh(reelGeo, matWhite);
  r2.position.set(-0.25, 0.9, 0.35);
  r2.rotation.x = Math.PI / 2;
  movieCam.add(r2);

  const holeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.22, 12);
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const h1 = new THREE.Mesh(holeGeo, matDark);
    h1.position.set(-0.85 + Math.cos(ang) * 0.22, 0.9 + Math.sin(ang) * 0.22, 0.35);
    h1.rotation.x = Math.PI / 2;
    movieCam.add(h1);

    const h2 = new THREE.Mesh(holeGeo, matDark);
    h2.position.set(-0.25 + Math.cos(ang) * 0.22, 0.9 + Math.sin(ang) * 0.22, 0.35);
    h2.rotation.x = Math.PI / 2;
    movieCam.add(h2);
  }

  movieCam.scale.setScalar(0.88);
  movieCam.position.set(-3.25, 1.45, -1.25);
  movieCam.rotation.set(0.18, -0.68, 0.08);
  group.add(movieCam);

  // =====================================================
  // 2) CLAPPERBOARD
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

  clapper.scale.setScalar(0.75);
  clapper.position.set(0.55, -2.25, -1.1);
  clapper.rotation.set(-0.12, 0.35, 0.12);
  group.add(clapper);

  // =====================================================
  // 3) DIAPHRAGM LENS
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

  lens.scale.setScalar(0.72);
  lens.position.set(3.15, -0.15, -1.9);
  lens.rotation.set(0.2, 0.85, -0.1);
  group.add(lens);

  // Motion
  let mx = 0, my = 0;
  document.addEventListener("mousemove", (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let running = true;
  function animate() {
    if (!running) return;

    group.rotation.y += 0.0011;
    group.rotation.x += 0.00075;

    group.rotation.y += mx * 0.00045;
    group.rotation.x += my * 0.00035;

    movieCam.rotation.y += 0.00075;
    clapper.rotation.y -= 0.00055;
    lens.rotation.z += 0.0010;

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
