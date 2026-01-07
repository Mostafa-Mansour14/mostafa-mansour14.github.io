// =========================
// Premium 3D Background
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
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
  camera.position.z = 9;

  // Lights (cinematic)
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(6, 8, 10);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
  fillLight.position.set(-6, -4, 8);
  scene.add(fillLight);

  const ambient = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambient);

  // Materials
  const matWarm = new THREE.MeshStandardMaterial({
    color: 0xbd5d38,
    roughness: 0.35,
    metalness: 0.65,
  });

  const matCool = new THREE.MeshStandardMaterial({
    color: 0x2b6fff,
    roughness: 0.4,
    metalness: 0.6,
  });

  const matDark = new THREE.MeshStandardMaterial({
    color: 0x1f2327,
    roughness: 0.55,
    metalness: 0.35,
  });

  // Group
  const group = new THREE.Group();
  scene.add(group);

  // Shapes (media / tech vibe)
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.1, 0.35, 120, 16),
    matWarm
  );
  knot.position.set(-2.6, 0.8, 0);
  group.add(knot);

  const ico = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.2, 1),
    matCool
  );
  ico.position.set(2.4, -0.5, -0.6);
  group.add(ico);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.25, 0.22, 18, 90),
    matDark
  );
  ring.position.set(0.2, -1.9, -1.2);
  ring.rotation.x = Math.PI * 0.35;
  group.add(ring);

  // Mouse parallax (subtle)
  let mouseX = 0,
    mouseY = 0;
  document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Animate
  let running = true;
  function animate() {
    if (!running) return;

    group.rotation.y += 0.002;
    group.rotation.x += 0.0015;

    group.rotation.y += mouseX * 0.0008;
    group.rotation.x += mouseY * 0.0008;

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
