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
const sunMap = new THREE.TextureLoader().load("textures/2k_sun.jpg");
sunMap.colorSpace = THREE.SRGBColorSpace;

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(5, 32, 32),
  new THREE.MeshBasicMaterial({ map: sunMap }),
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
    texture: "2k_mercury.jpg",
  },
  {
    name: "Venus",
    radius: 1.2,
    distance: 15,
    speed: 1.1,
    spin: 0.3,
    phase: 1.5,
    texture: "2k_venus_surface.jpg",
  },
  {
    name: "Earth",
    radius: 1.3,
    distance: 21,
    speed: 0.8,
    spin: 1.0,
    phase: 3.0,
    texture: "2k_earth_daymap.jpg",
  },
  {
    name: "Mars",
    radius: 1.0,
    distance: 27,
    speed: 0.6,
    spin: 0.9,
    phase: 4.5,
    texture: "2k_mars.jpg",
  },
  {
    name: "Jupiter",
    radius: 3.0,
    distance: 38,
    speed: 0.3,
    spin: 1.8,
    phase: 5.5,
    texture: "2k_jupiter.jpg",
  },
  {
    name: "Saturn",
    radius: 2.6,
    distance: 50,
    speed: 0.22,
    spin: 1.6,
    phase: 0.8,
    texture: "2k_saturn.jpg",
  },
  {
    name: "Uranus",
    radius: 2.0,
    distance: 60,
    speed: 0.15,
    spin: 1.2,
    phase: 2.2,
    texture: "2k_uranus.jpg",
  },
  {
    name: "Neptune",
    radius: 1.9,
    distance: 70,
    speed: 0.1,
    spin: 1.2,
    phase: 4.0,
    texture: "2k_neptune.jpg",
  },
  {
    name: "Moon",
    radius: 0.4,
    distance: 3,
    speed: 3.0,
    spin: 0.5,
    phase: 0.0,
    texture: "2k_moon.jpg",
    parent: "Earth",
  },
];

const loader = new THREE.TextureLoader();

for (const b of bodies) {
  const map = loader.load(`textures/${b.texture}`);
  map.colorSpace = THREE.SRGBColorSpace;
  b.mesh = new THREE.Mesh(
    new THREE.SphereGeometry(b.radius, 32, 32),
    new THREE.MeshStandardMaterial({ map }),
  );
  scene.add(b.mesh);
}

// Venus cloud layer: slightly larger translucent shell over the surface
const venus = bodies.find((b) => b.name === "Venus");
const venusAtmosMap = loader.load("textures/2k_venus_atmosphere.jpg");
venusAtmosMap.colorSpace = THREE.SRGBColorSpace;
const venusAtmos = new THREE.Mesh(
  new THREE.SphereGeometry(venus.radius * 1.04, 32, 32),
  new THREE.MeshStandardMaterial({
    map: venusAtmosMap,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  }),
);
venusAtmos.raycast = () => {}; // clicks should hit Venus itself
venus.mesh.add(venusAtmos);

const saturn = bodies.find((b) => b.name === "Saturn");
const ringInner = 3.4;
const ringOuter = 5.2;
const ringGeometry = new THREE.RingGeometry(ringInner, ringOuter, 128);
// The ring texture is a radial strip, so map u from inner to outer edge
const ringPos = ringGeometry.attributes.position;
const ringUv = ringGeometry.attributes.uv;
const v3 = new THREE.Vector3();
for (let i = 0; i < ringPos.count; i++) {
  v3.fromBufferAttribute(ringPos, i);
  ringUv.setXY(i, (v3.length() - ringInner) / (ringOuter - ringInner), 0.5);
}
const ringMap = loader.load("textures/2k_saturn_ring_alpha.png");
ringMap.colorSpace = THREE.SRGBColorSpace;
const rings = new THREE.Mesh(
  ringGeometry,
  new THREE.MeshStandardMaterial({
    map: ringMap,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
  }),
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
let downX = 0;
let downY = 0;

let followed = null;
let zoomFrames = 0;

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
    followed = obj;
    zoomFrames = 60;
    const b =
      obj === sun ? sun.userData : bodies.find((body) => body.mesh === obj);
    popup.innerHTML = `<b>${b.name}</b><br>Orbit distance: ${b.distance}<br>Radius: ${b.radius}`;
    popup.style.display = "block";
  } else {
    followed = null;
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
  venusAtmos.rotation.y += dt * 0.2; // clouds drift relative to the surface

  if (followed) {
    const delta = followed.position
      .clone()
      .sub(controls.target)
      .multiplyScalar(0.1);
    controls.target.add(delta);
    camera.position.add(delta);

    if (zoomFrames > 0) {
      zoomFrames--;
      const offset = camera.position.clone().sub(controls.target);
      const wanted = followed.geometry.parameters.radius * 6;
      offset.setLength(THREE.MathUtils.lerp(offset.length(), wanted, 0.08));
      camera.position.copy(controls.target).add(offset);
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
