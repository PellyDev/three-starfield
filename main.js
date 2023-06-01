import gsap from "gsap"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "dat-gui"
// colors

const mainColor = {
    r: 20 / 255,
    g: 40 / 255,
    b: 29 / 255,
}

const hoverColor = {
    r: 143 / 255,
    g: 187 / 255,
    b: 153 / 255,
}
// random values to move the vertices
let randomValues = []
// dat.gui
const gui = new dat.GUI()
const world = {
    plane: {
        width: 400,
        height: 400,
        widthSegments: 50,
        heightSegments: 50,
    },
}
gui.add(world.plane, "width", 1, 500).onChange(generatePlaneGeometry)
gui.add(world.plane, "height", 1, 500).onChange(generatePlaneGeometry)
gui.add(world.plane, "widthSegments", 1, 100).onChange(generatePlaneGeometry)
gui.add(world.plane, "heightSegments", 1, 100).onChange(generatePlaneGeometry)

function transformVertices() {
    const { array: vertices } = planeMesh.geometry.attributes.position

    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i]
        const y = vertices[i + 1]
        const z = vertices[i + 2]

        vertices[i] = x + (Math.random() - 0.5) * 2
        vertices[i + 1] = y + (Math.random() - 0.5) * 2
        vertices[i + 2] = (z + Math.random() - 0.5) * 7.5

        for (let j = 0; j < 3; ++j) {
            randomValues.push(Math.random() - 0.5)
        }
    }
}

function generatePlaneGeometry() {
    planeMesh.geometry.dispose()
    planeMesh.geometry = new THREE.PlaneGeometry(
        world.plane.width,
        world.plane.height,
        world.plane.widthSegments,
        world.plane.heightSegments
    )
    transformVertices()
}

let time = 0

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    raycaster.setFromCamera(mouse, camera)
    time += 0.001

    const { array } = planeMesh.geometry.attributes.position

    for (let i = 0; i < array.length; i += 3) {
        array[i] = array[i] + Math.cos(time + randomValues[i]) * 0.005
        array[i + 1] =
            array[i + 1] + Math.sin(time + randomValues[i + 1]) * 0.005
        if (i === 0) {
        }
    }
    const intersections = raycaster.intersectObject(planeMesh)
    const { color } = planeMesh.geometry.attributes
    color.needsUpdate = true
    planeMesh.geometry.attributes.position.needsUpdate = true
    if (intersections.length > 0) {
        color.setXYZ(
            intersections[0].face.a,
            hoverColor.r,
            hoverColor.g,
            hoverColor.b
        )
        color.setXYZ(
            intersections[0].face.b,
            hoverColor.r,
            hoverColor.g,
            hoverColor.b
        )
        color.setXYZ(
            intersections[0].face.c,
            hoverColor.r,
            hoverColor.g,
            hoverColor.b
        )
        const fadingColor = { ...hoverColor }
        gsap.to(fadingColor, {
            r: mainColor.r,
            g: mainColor.g,
            b: mainColor.b,
            duration: 1,
            ease: "power2.Out",
            onUpdate: () => {
                color.setXYZ(
                    intersections[0].face.a,
                    fadingColor.r,
                    fadingColor.g,
                    fadingColor.b
                )
                color.setXYZ(
                    intersections[0].face.b,
                    fadingColor.r,
                    fadingColor.g,
                    fadingColor.b
                )
                color.setXYZ(
                    intersections[0].face.c,
                    fadingColor.r,
                    fadingColor.g,
                    fadingColor.b
                )
            },
        })
    }
}
// out of bounds mouse position so there's no intersection on load
const mouse = {
    x: -10,
    y: 10,
}

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1, // near clipping plane -> how close does the object have to be to the camera to be clipped out
    1000 // far clipping plane -> how far does the object have to be from the camera to be clipped
)
camera.rotateX(1)
const raycaster = new THREE.Raycaster()
const renderer = new THREE.WebGLRenderer({ antialias: true })
const planeGeometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
)
const planeMaterial = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    flatShading: true,
    vertexColors: true,
})

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
console.log(planeMesh.geometry.attributes)
const light = new THREE.DirectionalLight(0xfdfbd3, 1)
const backLight = new THREE.DirectionalLight(0xffffff, 1)

const colors = []
const { count } = planeMesh.geometry.attributes.position
for (let i = 0; i < count; ++i) {
    colors.push(mainColor.r, mainColor.g, mainColor.b)
}
planeMesh.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3)
)

transformVertices()

light.position.set(0, 1, 1)
backLight.position.set(0, 1, -1)

new OrbitControls(camera, renderer.domElement)
camera.position.z = 75 // move camera towards us (z-axis)

scene.add(planeMesh)
scene.add(light)
scene.add(backLight)

renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)

document.body.appendChild(renderer.domElement)

animate()

addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1
    mouse.y = -(e.clientY / innerHeight) * 2 + 1
})
