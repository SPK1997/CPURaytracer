# CPU Raytracer

A simple CPU-based ray tracer written in **vanilla JavaScript**, rendering directly to an HTML5 `<canvas>` element — no WebGL, no external libraries.

---

## Current Progress

- ✅ Progressive loading is now integrated into the ray tracing engine.
- ⚡ This makes the UI more responsive, giving users early visual feedback while rendering.
- 🎥 [Watch a demo on YouTube](https://www.youtube.com/watch?v=zL2WcQBKGdU)

---

## Project Structure

### `src/CanvasManager.js`

Responsible for creating, updating, and destroying the canvas element used for rendering.

### `src/RaytracingManager.js`

- Starts and stops web workers.
- Progressively loads pixels.

### `src/mathServices.js`

Contains vector algebra and geometry utilities used by the ray tracer.

### `src/RaytracingWorker.js`

Contains the web worker logic which is the core ray tracing logic:

- Generates rays.
- Computes intersections from shape data.
- Computes reflections (matte, specular, other objects on surface) and shadows from lighting data.

---

## Getting Started

To run the raytracer locally:

1. Clone this repository.
2. Built the project. Run the command `npm run build`
3. Open `index.html` in any modern browser.
4. Watch the pixel-by-pixel ray tracing in action.
5. Alternatively, the NPM package `'raytrace-engine'` can be installed and used.

---

## Understanding the `index.html` File

Appropriate comments are added to `index.html`. It is advised to read it alongside this explanation:

### Usage

1. To use this raytrace engine, you need two managers: `CanvasManager` and `RaytracingManager`.

2. The options provided to `CanvasManager` during instantiation are:

   - `target`: An HTML element which will contain the HTML canvas element.
   - `height`: Height of the canvas.
   - `width`: Width of the canvas.

3. The options provided to `RaytracingManager` during instantiation are:
   - `canvasHeight`: Determines viewport height.
   - `canvasWidth`: Determines viewport width.
   - `cameraPosition`: The `{x, y, z}` coordinates of the camera.
   - `distanceFromCameraToViewport`: Distance `D` from the camera to the viewport.
   - `shapeData`: An array of objects describing each shape (currently only spheres supported).
   - `lightData`: An array of objects describing light sources.
   - `noIntersectionColor`: Background color when a ray hits nothing.
   - `reflectiveRecursionLimit`: Max number of bounces for reflective rays.
   - `putPixelCallback`: A callback that receives an array of pixel objects `{x, y, color}` to render on the canvas.

---

## `shapeData` Format

Each object in `shapeData` represents a sphere.

### Required properties:

- `center`: `{ x, y, z }` — position of the sphere in 3D space.
- `radius`: `number` — radius of the sphere.
- `color`: `{ r, g, b }` — color of the sphere (0–255 for each channel).

### Optional properties:

- `specular`: `number` — higher values make the surface shinier (e.g., 500 for glossy, 0 for matte).
- `reflective`: `number` (0 to 1) — determines how reflective the surface is. `1` is a mirror, `0` means no reflection.

### Example:

```js
shapeData = [
  {
    center: { x: 0, y: -1, z: 3 },
    radius: 1,
    color: { r: 255, g: 0, b: 0 },
    specular: 500,
  },
  {
    center: { x: -1.5, y: 0.5, z: 3 },
    radius: 1,
    color: { r: 255, g: 255, b: 255 },
    specular: 500,
    reflective: 0.9,
  },
  {
    center: { x: 1.5, y: 1, z: 3 },
    radius: 1,
    color: { r: 0, g: 255, b: 0 },
    specular: 800,
  },
];
```

---

## `lightData` Format

There are 3 types of supported lights:

### Ambient Light

```js
{
  type: "ambient",
  intensity: 0.2, // Value between 0 and 1
}
```

- Applies uniform brightness to the entire scene.

### Point Light

```js
{
  type: "point",
  intensity: 0.6,
  position: { x: 2, y: 1, z: 0 }
}
```

- Emits light from a specific position like a bulb.

### Directional Light

```js
{
  type: "directional",
  intensity: 0.2,
  direction: { x: 1, y: 4, z: 4 }
}
```

- Simulates light from a distant source like the sun.

---

For more details about the ray tracing algorithm, see the theoretical notes below and [source code](./src).

## Raytracing Algo

- Ray tracing begins with a **scene**.
- A scene consists of a **camera**, a **viewport**, and a **3D world**.
- Think of the **camera** as an eye and the **viewport** as a screen with small square openings. Each opening corresponds to a pixel on the canvas.
- For every square (or pixel) on the viewport, a **ray is cast** from the camera through it into the 3D world.
- If the ray intersects a 3D object, the corresponding pixel on the canvas is painted with the color of that object at the point of intersection.

![Raytracing Visualization](readmeImages/raytracing_algo.png)

---

## Modelling Lighting

### Types of Light Sources

**Based on origin:**

- **Emissive Light**: Light emitted directly from a source (e.g., bulb, sun).
- **Scattered Light**: Light reflected off surfaces. Acts as a secondary source.

**Based on mathematical modeling:**

- **Point Light**: Light originates from a single point. Each surface point has a different light vector (e.g., a bulb).
- **Directional Light**: Light comes from a far-away source. All surface points share the same direction vector (e.g., sunlight).
- **Ambient Light**: A constant, low-intensity light representing indirect scattering from the environment.

### Surface Types

- **Matte Surface**: Reflects light equally in all directions (diffuse reflection).
- **Shiny Surface**: Reflects light in a specific direction (specular reflection).

### Diffuse Reflection Calculation

![Diffuse Reflection Visualization](readmeImages/diffuse_light_calc.png)

To compute how a matte surface reflects light:

- **I**: Light intensity (thickness of the light beam)
- **A**: Surface area over which the light spreads
- **L**: Light vector (from point to light source)
- **N**: Surface normal at the point
- **a**: Angle between L and N

**Reflected Intensity = Light Intensity x (I/A) = Light Intensity × cos(a)**

- When a approaches 0 degrees, the ratio I/A approaches 1 (maximum reflection)
- When a approaches 90 degrees, A approaches infinity, the ratio I/A approaches 0 (no reflection)

To compute how I/A is same as cos(a) from the diagram:

- angle SPR = a + b = 90 degrees
- angle ZRP = 90 degrees - b = a
- cosine(a) = RZ/RP = (I/2) / (A/2) = I/A

This models how light spreads over a larger area at shallow angles, thus reducing its intensity.

### Specular Reflection Calculation

![Specular Reflection Visualization](readmeImages/specular_light_calc.png)

To compute how a **shiny surface** reflects light:

- **L** — Light vector (from the point on the surface to the light source)
- **N** — Surface normal at that point
- **R** — Perfectly reflected light vector
- **Vi** — View vectors (e.g., **V1, V2, V3, V4**) from the point toward the camera
- **a** — Angle between the reflected light vector (**R**) and a view vector (e.g., **V3**)

No surface is perfectly smooth — meaning light isn't only reflected in the exact direction of **R**, but also slightly around it. This gives rise to **specular highlights**, which appear brighter when:

- The view direction is aligned with the reflected light
- The surface is highly polished or shiny

We calculate the reflected light intensity as follows:

**Reflected Intensity = Light Intensity × (cos(a))^specular**

- The `specular` exponent determines how shiny the surface is.
- **Higher values** produce smaller, sharper highlights.
- **Lower values** produce broader, softer highlights.
- This is because higher specular value makes the cosine curve narrower. Check the image below for **cos(a)^b**

![Cosine Curve](readmeImages/cosine_curve.png)

When **a = 0 degrees** (perfect alignment), the intensity is **maximum**.  
As **a increases toward 90 degrees**, intensity **drops rapidly**.  
Raising **cos(a)** to a high power compresses the reflection into a narrow beam — simulating a shiny surface.

### Working of Raytracing and Light

During ray tracing, if the ray vector does not intersect with anything, then `{ r: 0, g: 0, b: 0 }` is returned.

If the ray intersects with something, then depending on the intensity of light reflected by the surface, its color is modified like:

`{ r: valueR * ReflectedLightIntensity, g: valueG * ReflectedLightIntensity, b: valueB * ReflectedLightIntensity }`

Therefore, when no lights are present, it will be pitch black as shown in below video:

[![Watch Diffuse Reflection demo](readmeImages/Diffuse_Lighting_demo.png)](https://www.youtube.com/watch?v=PY25eGugKfM)

---

## Modelling Shadows

- In raytracing we cast a ray from camera and find its intersection with an object.
- From the point of intersection (P) towards the light source we have a vector called the light vector (L) which we saw earlier in lights modelling section.
- We form a new ray vector of the form P + t\*L where t is a positive number and can vary, P and L are 3D vectors.
- This ray starts at the intersection point and travels in the direction of the light source.
- If this shadow ray intersects any other object before reaching the light, it means the light is blocked, and point P lies in shadow.
- If no object obstructs the shadow ray, then the light reaches point P, and we proceed with lighting calculations (diffuse, specular)

---

## Modelling Reflections of other objects on surface

To make surfaces look shiny or mirror-like, we simulate how light bounces off them. When a ray of light hits a reflective object, we send another ray in the direction it would bounce — just like how you'd see your reflection in a mirror.

This new ray continues the same process: it might hit something else, reflect again, and so on. We recursively repeat this bounce a few times to create realistic reflections, but stop after a set limit to avoid infinite loop (like mirror infront of mirror scenario)

Limitation
Right now, all of this happens on the main thread — and since every pixel may involve multiple recursive rays, the UI can freeze. Using Web Workers to offload this heavy computation can make rendering much smoother and faster.

---

## Notes

- This raytracer runs entirely on the CPU using `CanvasRenderingContext2D`
- No WebGL, no Three.js, no shaders — just math and canvas

---

## Planned Work

🔄 Next Up

- Experiment more with performance
- Add more shapes and planes
