// =========================
// Premium 3D Background (Media / Video Vibe)
// Camera + Lens + Play + Clapper + Timeline
// =========================
(function () {
  if (!window.THREE) return;

  // Respect reduced motion
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
  container.appendChild(renderer.domElement);

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 10;

  // Lights (soft cinematic)
  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(7, 8, 10);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xffffff, 0.55);
  rim.position.set(-8, 2, 8);
  scene.add(rim);

  const amb = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(amb);

  // Materials (keep classy)
  const matWarm = new THREE.MeshStandardMaterial({
    color: 0xbd5d38, roughness: 0.42, metalness: 0.55,
  });
  const matCool = new THREE.MeshStandardMaterial({
    color: 0x2b6fff, roughness: 0.45, metalness: 0.5,
  });
  const matDark = new THREE.MeshStandardMaterial({
    color: 0x1f2327, roughness: 0.6, metalness: 0.25,
  });
  const matWhite = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.55, metalness: 0.15,
  });

  const group = new THREE.Group();
  scene.add(group);

  // Helpers
  function addRoundedBox(w, h, d, mat) {
    const g = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(g, mat);
    return m;
  }

  // =========================
  // 1) CAMERA (body + lens)
  // =========================
  const cameraIcon = new THREE.Group();

  // body
  const body = addRoundedBox(2.3, 1.35, 0.9, matDark);
  body.position.set(0, 0, 0);
  cameraIcon.add(body);

  // top bump
  const top = addRoundedBox(0.9, 0.42, 0.75, matDark);
  top.position.set(-0.55, 0.88, 0);
  cameraIcon.add(top);

  // lens base
  const lensBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.62, 0.65, 24),
    matWarm
  );
  lensBase.rotation.x = Math.PI / 2;
  lensBase.position.set(0.85, 0.05, 0.0);
  cameraIcon.add(lensBase);

  // lens glass ring
  const lensRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.11, 14, 42),
    matCool
  );
  lensRing.rotation.y = Math.PI / 2;
  lensRing.position.set(1.18, 0.05, 0.0);
  cameraIcon.add(lensRing);

  // small button
  const btn = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 18, 18),
    matWarm
  );
  btn.position.set(-0.9, 0.35, 0.48);
  cameraIcon.add(btn);

  cameraIcon.scale.setScalar(0.85);
  cameraIcon.position.set(-3.2, 1.6, -1.2);
  cameraIcon.rotation.set(0.2, -0.6, 0.1);
  group.add(cameraIcon);

  // =========================
  // 2) PLAY ICON (triangle + circle)
  // =========================
  const playIcon = new THREE.Group();

  const playCircle = new THREE.Mesh(
    new THREE.TorusGeometry(1.05, 0.12, 14, 64),
    matWarm
  );
  playCircle.rotation.x = Math.PI / 2.2;
  playIcon.add(playCircle);

  const triShape = new THREE.Shape();
  triShape.moveTo(-0.25, -0.45);
  triShape.lineTo(0.55, 0.0);
  triShape.lineTo(-0.25, 0.45);
  triShape.closePath();

  const triGeo = new THREE.ExtrudeGeometry(triShape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelSize: 0.06,
    bevelThickness: 0.06,
    bevelSegments: 2,
    steps: 1,
  });
  const tri = new THREE.Mesh(triGeo, matCool);
  tri.rotation.y = Math.PI / 10;
  tri.position.set(0.08, 0, -0.08);
  playIcon.add(tri);

  playIcon.scale.setScalar(0.75);
  playIcon.position.set(3.1, -0.2, -1.6);
  playIcon.rotation.set(0.2, 0.7, -0.1);
  group.add(playIcon);

  // =========================
  // 3) CLAPPERBOARD (slate)
  // =========================
  const clapper = new THREE.Group();

  const slate = addRoundedBox(2.1, 1.25, 0.18, matDark);
  clapper.add(slate);

  // stripes top
  const topBar = addRoundedBox(2.15, 0.35, 0.2, matWhite);
  topBar.position.set(0, 0.75, 0);
  clapper.add(topBar);

  // diagonal stripes (thin boxes)
  for (let i = 0; i < 6; i++) {
    const stripe = addRoundedBox(0.34, 0.08, 0.22, i % 2 ? matWarm : matCool);
    stripe.position.set(-0.82 + i * 0.34, 0.75, 0.02);
    stripe.rotation.z = -0.55;
    clapper.add(stripe);
  }

  clapper.scale.setScalar(0.72);
  clapper.position.set(0.4, -2.1, -1.1);
  clapper.rotation.set(-0.1, 0.3, 0.12);
  group.add(clapper);

  // =========================
  // 4) TIMELINE BARS (edit vibe)
  // =========================
  const timeline = new THREE.Group();
  const barMats = [matWarm, matCool, matDark];

  for (let i = 0; i < 9; i++) {
    const h = 0.3 + (i % 3) * 0.18;
    const bar = addRoundedBox(0.35, h, 0.25, barMats[i % 3]);
    bar.position.set(-1.6 + i * 0.42, 0, 0);
    timeline.add(bar);
  }

  // base line
  const base = addRoundedBox(4.2, 0.08, 0.12, matWhite);
  base.position.set(0.0, -0.45, 0);
  timeline.add(base);

  timeline.scale.setScalar(0.78);
  timeline.position.set(0.2, 2.45, -2.2);
  timeline.rotation.set(0.25, -0.2, 0.0);
  group.add(timeline);

  // =========================
  // Subtle parallax
  // =========================
  let mx = 0, my = 0;
  document.addEventListener("mousemove", (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Animate
  let running = true;
  function animate() {
    if (!running) return;

    // Slow global drift
    group.rotation.y += 0.0013;
    group.rotation.x += 0.0009;

    // Parallax (very subtle)
    group.rotation.y += mx * 0.00055;
    group.rotation.x += my * 0.00045;

    // Individual small motion
    cameraIcon.rotation.y += 0.0009;
    playIcon.rotation.x += 0.0008;
    clapper.rotation.y -= 0.0007;
    timeline.rotation.z += 0.0006;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // Resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Pause when tab hidden
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) animate();
  });
})();
