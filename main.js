import * as THREE from "three"

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1, // near clipping plane -> how close does the object have to be to the camera to be clipped out
    1000 // far clipping plane -> how far does the object have to be from the camera to be clipped
)
const renderer = new THREE.WebGLRenderer()
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0x0000ff })
const box = new THREE.Mesh(boxGeometry, material)
let flag = true
function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    box.rotation.z += 0.01
    box.rotation.y -= 0.01
}

scene.add(box)

camera.position.z = 5 // move camera 5 units towards us (z-axis)

renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)
animate()
