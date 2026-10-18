# Solar

An interactive 3D model of the solar system that runs in the browser, built with [Three.js](https://threejs.org/).

The Sun, the eight planets, and Earth's Moon orbit and spin in real time. Each body has a texture, and the Sun lights the scene. You can click any body to zoom in on it, follow it, and see its stats.

## Features

- **Textured bodies**: the Sun, Mercury through Neptune, and the Moon, each with a 2K surface texture
- **Lighting from the Sun**: a point light at the Sun's position, plus a little ambient light so the dark sides stay visible
- **Orbits and rotation**: every body orbits on its own track at its own speed and spins on its axis. The Moon orbits Earth.
- **Saturn's rings**: a tilted, see-through ring textured from the outer edge to the inner edge
- **Venus's atmosphere**: a see-through cloud layer that drifts slowly over the surface
- **Orbit lines and a starfield**: faint circles mark each planet's path, and 2,000 stars sit in the background
- **Click to follow**: click a body to zoom in, keep the camera on it as it moves, and show its name, orbit distance, and radius. Click empty space to stop following.

## Running it

The project has no build step and no dependencies to install. Three.js (v0.160.0) is loaded from a CDN with an import map.

Browsers block ES modules and texture loading over `file://`, so you need to serve the folder over HTTP. Any static server works:

```sh
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000>.

## Controls

| Action | Result |
| --- | --- |
| Left-drag | Rotate the camera |
| Right-drag | Pan |
| Scroll | Zoom |
| Click a body | Zoom in, follow it, and show its info |
| Click empty space | Stop following and close the info popup |

A drag of more than 5 pixels counts as camera movement, not a click.

## Project structure

```
.
├── index.html   # Page shell, popup styling, and the Three.js import map
├── main.js      # Scene setup, bodies, rings, animation loop, and click handling
└── textures/    # 2K textures for every body and for Saturn's rings
```

## Customizing

Every body is an entry in the `bodies` array in [main.js](main.js):

```js
{
  name: "Mars",
  radius: 1.0,      // sphere size
  distance: 27,     // orbit radius (from the Sun, or from `parent`)
  speed: 0.6,       // orbital speed
  spin: 0.9,        // spin speed on its own axis
  phase: 4.5,       // starting angle in radians
  texture: "2k_mars.jpg",
  parent: "Earth",  // optional: makes this body a moon of another one
}
```

Moons need a `parent`, and they must come after their parent in the array. Change `timeScale` to make the whole simulation faster or slower.

Sizes, distances, and speeds are picked to look good on screen. They are not to scale.

## Credits

- Rendered with [Three.js](https://threejs.org/)
- Planet textures from [Solar System Scope](https://www.solarsystemscope.com/textures/), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
