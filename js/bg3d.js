// =========================
// Premium 3D Background (Cinema Vibe)
// Movie Camera + Film Reel + Clapper + Spotlight + Play
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

  // Lights (cinematic soft)
  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(7, 8, 10);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xffffff, 0.55);
  rim.position.set(-8, 2, 8);
  scene.add(rim);

  const amb = new THREE.AmbientLight(0xffffff, 0.34);
  scene.add(amb);

  // Materials
  const matWarm = new THREE.MeshStandardMaterial({
    color: 0xbd5d38,
    roughness: 0.45,
    metalness: 0.55,
  });
  const matCool = new THREE.MeshStandardMaterial({
    color: 0x2b6fff,
    roughness: 0.5,
    metalness: 0.5,
  });
  const matDark = new THREE.MeshStandardMaterial({
    color: 0x1f2327,
    roughness: 0.65,
    metalness: 0.22,
  });
  const matWhite = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6,
    metalness: 0.12,
  });

  const group = new THREE.Group();
  scene.add(group);

  const roundedBox = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

  // =========================
  // 1) MOVIE CAMERA (cinema camera with 2 reels)
  // =========================
  const movieCam = new THREE.Group();

  // camera body
  const body = roundedBox(2.25, 1.35, 0.95, matDark);
  body.position.set(0, 0, 0);
  movieCam.add(body);

  // lens
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.65, 0.9, 28),
    matWarm
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.set(1.4, -0.05, 0);
  movieCam.add(lens);

  // lens ring (glass feel)
  const lensRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.1, 14, 50),
    matCool
  );
  lensRing.rotation.y = Math.PI / 2;
  lensRing.position.set(1.9, -0.05, 0);
  movieCam.add(lensRing);

  // handle
  const handle = roundedBox(0.55, 0.25, 0.55, matDark);
  handle.position.set(-0.55, 0.95, 0);
  movieCam.add(handle);

  // reels (two discs)
  const reelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.18, 28);
  const reel1 = new THREE.Mesh(reelGeo, matWhite);
  reel1.position.set(-0.8, 0.9, 0.35);
  reel1.rotation.x = Math.PI / 2;
  movieCam.add(reel1);

  const reel2 = new THREE.Mesh(reelGeo, matWhite);
  reel2.position.set(-0.2, 0.9, 0.35);
  reel2.rotation.x = Math.PI / 2;
  movieCam.add(reel2);

  // reel holes (simple)
  const holeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.22, 12);
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const h1 = new THREE.Mesh(holeGeo, matDark);
    h1.position.set(-0.8 + Math.cos(ang) * 0.22, 0.9 + Math.sin(ang) * 0.22, 0.35);
    h1.rotation.x = Math.PI / 2;
    movieCam.add(h1);

    const h2 = new THREE.Mesh(holeGeo, matDark);
    h2.position.set(-0.2 + Math.cos(ang) * 0.22, 0.9 + Math.sin(ang) * 0.22, 0.35);
    h2.rotation.x = Math.PI / 2;
    movieCam.add(h2);
  }

  movieCam.scale.setScalar(0.85);
  movieCam.position.set(-3.3, 1.55, -1.2);
  movieCam.rotation.set(0.2, -0.65, 0.1);
  group.add(movieCam);

  // =========================
  // 2) FILM REEL
  // =========================
  const reel = new THREE.Group();
  const reelDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.05, 0.22, 34),
    matWhite
  );
  reelDisc.rotation.x = Math.PI / 2;
  reel.add(reelDisc);

  const reelRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.08, 14, 60),
    matCool
  );
  reelRing.rotation.y = Math.PI / 2;
  reel.add(reelRing);

  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const hole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.3, 14),
      matDark
    );
    hole.position.set(Math.cos(ang) * 0.45, Math.sin(ang) * 0.45, 0);
    hole.rotation.x = Math.PI / 2;
    reel.add(hole);
  }

  reel.scale.setScalar(0.72);
  reel.position.set(3.25, -0.25, -1.8);
  reel.rotation.set(0.25, 0.85, -0.12);
  group.add(reel);

  // =========================
  // 3) CLAPPERBOARD
  // =========================
  const clapper = new THREE.Group();
  const slate = roundedBox(2.15, 1.25, 0.18, matDark);
  clapper.add(slate);

  const topBar = roundedBox(2.2, 0.35, 0.2, matWhite);
  topBar.position.set(0, 0.75, 0);
  clapper.add(topBar);

  for (let i = 0; i < 7; i++) {
    const stripe = roundedBox(0.32, 0.08, 0.22, i % 2 ? matWarm : matCool);
    stripe.position.set(-0.92 + i * 0.32, 0.75, 0.02);
    stripe.rotation.z = -0.55;
    clapper.add(stripe);
  }

  clapper.scale.setScalar(0.72);
  clapper.position.set(0.5, -2.2, -1.1);
  clapper.rotation.set(-0.12, 0.35, 0.12);
  group.add(clapper);

  // =========================
  // 4) SPOTLIGHT (cone light)
  // =========================
  const spotlight = new THREE.Group();

  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.45, 0.9, 20),
    matDark
  );
  head.rotation.z = Math.PI / 2.8;
  spotlight.add(head);

  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(1.9, 3.6, 24, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      roughness: 1,
      metalness: 0,
    })
  );
  cone.position.set(1.7, -0.9, 0);
  cone.rotation.z = -0.95;
  spotlight.add(cone);

  spotlight.scale.setScalar(0.8);
  spotlight.position.set(-0.2, 2.6, -2.4);
  spotlight.rotation.set(0.25, -0.25, 0);
  group.add(spotlight);

  // =========================
  // 5) PLAY RING (subtle)
  // =========================
  const play = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.11, 14, 64),
    matWarm
  );
  ring.rotation.x = Math.PI / 2.1;
  play.add(ring);

  const triShape = new THREE.Shape();
  triShape.moveTo(-0.22, -0.42);
  triShape.lineTo(0.56, 0.0);
  triShape.lineTo(-0.22, 0.42);
  triShape.closePath();

  const triGeo = new THREE.ExtrudeGeometry(triShape, {
    depth: 0.16,
    bevelEnabled: true,
    bevelSize: 0.05,
    bevelThickness: 0.05,
    bevelSegments: 2,
    steps: 1,
  });
  const tri = new THREE.Mesh(triGeo, matCool);
  tri.position.set(0.08, 0, -0.08);
  play.add(tri);

  play.scale.setScalar(0.65);
  play.position.set(2.0, 2.0, -2.6);
  play.rotation.set(0.18, 0.35, -0.08);
  group.add(play);

  // Parallax (very subtle)
  let mx = 0, my = 0;
  document.addEventListener("mousemove", (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let running = true;
  function animate() {
    if (!running) return;

    group.rotation.y += 0.0012;
    group.rotation.x += 0.0008;

    group.rotation.y += mx * 0.0005;
    group.rotation.x += my * 0.0004;

    // micro motion
    movieCam.rotation.y += 0.0008;
    reel.rotation.z += 0.0011;
    clapper.rotation.y -= 0.0006;
    play.rotation.x += 0.0007;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) animate();
  });
})();
