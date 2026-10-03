import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 70, 130);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Sun
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(5, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffcc33 }),
);
sun.userData = { name: "Sun", radius: 5, distance: 0 };
scene.add(sun);

// Lighting
const sunLight = new THREE.PointLight(0xffffff, 3, 0, 0);
scene.add(sunLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.15));

const clock = new THREE.Clock();
const timeScale = 0.25;

// Bodies (moons have a `parent` and must come after it in the array)
const bodies = [
  {
    name: "Mercury",
    radius: 0.8,
    distance: 10,
    speed: 1.6,
    spin: 0.5,
    phase: 0.0,
    color: 0xaaaaaa,
  },
  {
    name: "Venus",
    radius: 1.2,
    distance: 15,
    speed: 1.1,
    spin: 0.3,
    phase: 1.5,
    color: 0xe6c27a,
  },
  {
    name: "Earth",
    radius: 1.3,
    distance: 21,
    speed: 0.8,
    spin: 1.0,
    phase: 3.0,
    color: 0x3377ff,
  },
  {
    name: "Mars",
    radius: 1.0,
    distance: 27,
    speed: 0.6,
    spin: 0.9,
    phase: 4.5,
    color: 0xcc5533,
  },
  {
    name: "Jupiter",
    radius: 3.0,
    distance: 38,
    speed: 0.3,
    spin: 1.8,
    phase: 5.5,
    color: 0xd9a066,
  },
  {
    name: "Saturn",
    radius: 2.6,
    distance: 50,
    speed: 0.22,
    spin: 1.6,
    phase: 0.8,
    color: 0xe3d29a,
  },
  {
    name: "Uranus",
    radius: 2.0,
    distance: 60,
    speed: 0.15,
    spin: 1.2,
    phase: 2.2,
    color: 0x7fd6e0,
  },
  {
    name: "Neptune",
    radius: 1.9,
    distance: 70,
    speed: 0.1,
    spin: 1.2,
    phase: 4.0,
    color: 0x3a4fd6,
  },
  {
    name: "Moon",
    radius: 0.4,
    distance: 3,
    speed: 3.0,
    spin: 0.5,
    phase: 0.0,
    color: 0xcccccc,
    parent: "Earth",
  },
];

for (const b of bodies) {
  b.mesh = new THREE.Mesh(
    new THREE.SphereGeometry(b.radius, 32, 32),
    new THREE.MeshStandardMaterial({ color: b.color }),
  );
  scene.add(b.mesh);
}

const saturn = bodies.find((b) => b.name === 'Saturn');
const rings = new THREE.Mesh(
  new THREE.RingGeometry(3.4, 5.2, 64),
  new THREE.MeshStandardMaterial({
    color: 0xcdbf98,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  })
);
rings.rotation.x = Math.PI / 2 + 0.4; // lay flat, then tilt
scene.add(rings);

// Orbit lines (skip moons)
for (const b of bodies) {
  if (b.parent) continue;
  const points = [];
  for (let i = 0; i < 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    points.push(
      new THREE.Vector3(Math.cos(a) * b.distance, 0, Math.sin(a) * b.distance),
    );
  }
  const line = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x444444 }),
  );
  scene.add(line);
}

// Starfield
const starPositions = [];
for (let i = 0; i < 2000; i++) {
  const dir = new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5,
  ).normalize();
  starPositions.push(...dir.multiplyScalar(400 + Math.random() * 100));
}
const stars = new THREE.Points(
  new THREE.BufferGeometry().setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3),
  ),
  new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.2,
    sizeAttenuation: false,
  }),
);
scene.add(stars);

// Click to popup
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const popup = document.getElementById("popup");
let downX = 0,
  downY = 0;

renderer.domElement.addEventListener("pointerdown", (e) => {
  downX = e.clientX;
  downY = e.clientY;
});

renderer.domElement.addEventListener("pointerup", (e) => {
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return;

  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const clickables = [sun, ...bodies.map((b) => b.mesh)];
  const hits = raycaster.intersectObjects(clickables);
  if (hits.length > 0) {
    const obj = hits[0].object;
    const b =
      obj === sun ? sun.userData : bodies.find((body) => body.mesh === obj);
    popup.innerHTML = `<b>${b.name}</b><br>Orbit distance: ${b.distance}<br>Radius: ${b.radius}`;
    popup.style.display = "block";
  } else {
    popup.style.display = "none";
  }
});

function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  const t = clock.elapsedTime * timeScale;

  for (const b of bodies) {
    const angle = t * b.speed + b.phase;
    const center = b.parent
      ? bodies.find((p) => p.name === b.parent).mesh.position
      : { x: 0, z: 0 };
    b.mesh.position.x = center.x + Math.cos(angle) * b.distance;
    b.mesh.position.z = center.z + Math.sin(angle) * b.distance;
    b.mesh.rotation.y += dt * b.spin;
  }
  rings.position.copy(saturn.mesh.position);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
