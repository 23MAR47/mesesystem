/* eslint-disable */
// @ts-nocheck
//
// NEGENTROPY — Hourglass galaxy reference snippet
// -----------------------------------------------
// Used in: Sections 1–3 (The Void → Entropy → The Refusal).
// Visual: two stacked galaxies (top + bottom) forming an hourglass / sand-timer
// figure. Section 3 will reverse rotation direction via uTime to dramatize the
// "refusal" beat.
// Output preview: ../assets/hourglass-figure.png
//
// DO NOT IMPORT THIS FILE DIRECTLY. It is a reference snippet using ESM CDN
// imports (esm.sh) and browser-globals (canvas.webgl, OrbitControls, lil-gui).
// Port into a React leaf client component using @react-three/fiber + drei.
// Replace OrbitControls with a fixed-camera setup driven by a spring (see the
// "spring → uniform" pattern in [[animation-system]] discussion).
//
// Shaders to extract into .glsl files when porting:
//   - galaxyVertexShader   (default upward funnel)
//   - galaxyVertexShader1  (same as default; reversible)
//   - galaxyVertexShader2  (downward funnel — second half of hourglass)
//   - galaxyFragmentShader (shared disc-shaped point sprite)

const galaxyVertexShader = `
uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Spin
    float angle = atan( modelPosition.x, modelPosition.z );
    float distanceToCenter = length( modelPosition.xz );
    float angleOffset = ( 1.0 / distanceToCenter ) * uTime * 0.2;
    angle += angleOffset;
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;

    // vertical spin
    float offsetOfGalaxy = 5.0;
    modelPosition.y = - clamp(0.5 / distanceToCenter, 0.0, offsetOfGalaxy);
    modelPosition.y += 5.0;

    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / - viewPosition.z);

    vColor = color;
}
`;


const galaxyFragmentShader = `
varying vec3 vColor;

void main()
{
    vec2 newUv = gl_PointCoord;
    newUv -= 0.5;
    float strength = length(newUv);
    strength = 1.0 - strength;
    strength = pow(strength, 10.0);

    vec3 color = mix(vec3(0.0), vColor, strength);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
}
`;

const galaxyVertexShader1 = `
uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float angle = atan( modelPosition.x, modelPosition.z );
    float distanceToCenter = length( modelPosition.xz );
    float angleOffset = ( 1.0 / distanceToCenter ) * uTime * 0.2;
    angle += angleOffset;
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;

    float offsetOfGalaxy = 5.0;
    modelPosition.y = - clamp(0.5 / distanceToCenter, 0.0, offsetOfGalaxy);
    modelPosition.y += 5.0;

    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / - viewPosition.z);

    vColor = color;
}
`;

const galaxyVertexShader2 = `
uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float angle = atan( modelPosition.x, modelPosition.z );
    float distanceToCenter = length( modelPosition.xz );
    float angleOffset = ( 1.0 / distanceToCenter ) * uTime * 0.2;
    angle -= angleOffset;
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;

    float offsetOfGalaxy = 5.0;
    modelPosition.y = clamp(0.5 / distanceToCenter, 0.0, offsetOfGalaxy);
    modelPosition.y += - offsetOfGalaxy;

    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / - viewPosition.z);

    vColor = color;
}
`;


import * as THREE from "https://esm.sh/three"
import { OrbitControls } from "https://esm.sh/three/examples/jsm/controls/OrbitControls.js"
import GUI from "https://esm.sh/lil-gui"

class Galaxy
{
    constructor(gui, shaderOption)
    {
        this.gui = gui;

        const parameters = {}
        parameters.count = 200000
        parameters.size = 0.005
        parameters.radius = 5
        parameters.branches = 3
        parameters.spin = 1
        parameters.randomness = 0.5
        parameters.randomnessPower = 1
        parameters.insideColor = '#ff6030'
        parameters.outsideColor = '#1b3984'

        let geometry = null
        let material = null
        let points = null

        const generateGalaxy = () =>
        {
            if(points !== null)
            {
                geometry.dispose()
                material.dispose()
                scene.remove(points)
            }

            geometry = new THREE.BufferGeometry()

            const positions = new Float32Array(parameters.count * 3)
            const colors = new Float32Array(parameters.count * 3)
            const scales = new Float32Array(parameters.count * 1)
            const randomness = new Float32Array(parameters.count * 3)

            const insideColor = new THREE.Color(parameters.insideColor)
            const outsideColor = new THREE.Color(parameters.outsideColor)

            for(let i = 0; i < parameters.count; i++)
            {
                const i3 = i * 3

                const radius = Math.random() * parameters.radius

                const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

                positions[i3    ] = Math.cos(branchAngle) * radius
                positions[i3 + 1] = 0
                positions[i3 + 2] = Math.sin(branchAngle) * radius

                const radialDensity = Math.pow(Math.random(), parameters.randomnessPower) * parameters.randomness * radius;
                const phi = Math.acos(1 - 2 * Math.random());
                const theta = Math.random() * Math.PI * 2;
                const randomX = Math.sin(phi) * Math.cos(theta) * radialDensity;
                const randomY = Math.sin(phi) * Math.sin(theta) * radialDensity;
                const randomZ = Math.cos(phi) * radialDensity;

                randomness[i3 + 0] = randomX
                randomness[i3 + 1] = randomY
                randomness[i3 + 2] = randomZ

                const mixedColor = insideColor.clone()
                mixedColor.lerp(outsideColor, radius / parameters.radius)

                colors[i3    ] = mixedColor.r
                colors[i3 + 1] = mixedColor.g
                colors[i3 + 2] = mixedColor.b

                scales[i] = Math.random()
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
            geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
            geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))

            this.material = new THREE.ShaderMaterial({
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                vertexColors: true,
                vertexShader: shaderOption === 1 ? galaxyVertexShader1 : galaxyVertexShader2,
                fragmentShader: galaxyFragmentShader,
                uniforms:
                {
                    uTime: { value : 0 },
                    uSize: { value : 11 * Math.min(window.devicePixelRatio, 2) },
                    uVortex: { value : 0}
                }
            })

            this.points = new THREE.Points(geometry, this.material)
            this.points.position.z = 0
            galaxy2Folder.add(this.points.position, 'z', 0, 1, 0.01).name('offset')
        }

        const galaxy2Folder = this.gui.addFolder('Galaxy 2');

        generateGalaxy()
        const clock = new THREE.Clock()
    }
}


const gui = new GUI()

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

const parameters = {}
parameters.count = 200000
parameters.size = 0.005
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 0.5
parameters.randomnessPower = 3
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'

let geometry = null
let material = null
let points = null

const generateGalaxy = () =>
{
    if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    const scales = new Float32Array(parameters.count * 1)
    const randomness = new Float32Array(parameters.count * 3)

    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++)
    {
        const i3 = i * 3

        const radius = Math.random() * parameters.radius

        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        positions[i3    ] = Math.cos(branchAngle) * radius
        positions[i3 + 1] = 0
        positions[i3 + 2] = Math.sin(branchAngle) * radius

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius

        randomness[i3 + 0] = randomX
        randomness[i3 + 1] = randomY
        randomness[i3 + 2] = randomZ

        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / parameters.radius)

        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

        scales[i] = Math.random()
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))

    material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: galaxyVertexShader,
        fragmentShader: galaxyFragmentShader,
        uniforms:
        {
            uTime: { value : 0 },
            uSize: { value : 11 * renderer.getPixelRatio() },
            uVortex: { value : 0}
        }
    })

    points = new THREE.Points(geometry, material)
    points.position.z = 0

    scene.add(points)
    galaxy1Folder.add(points.position, 'z', 0, 1, 0.01).name('offset')
}
const galaxy1Folder = gui.addFolder('Galaxy 1');

const galaxy2 = new Galaxy(gui, 2)
scene.add(galaxy2.points)


const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 8
camera.position.z = 10
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

generateGalaxy()

const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    material.uniforms.uTime.value = elapsedTime
    galaxy2.material.uniforms.uTime.value = elapsedTime

    controls.update()

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick();
