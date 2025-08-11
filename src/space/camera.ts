import * as THREE from 'three'

export class CameraHelper {
  camera: THREE.PerspectiveCamera

  topDownTilt: number
  defaultCameraDistance: number
  defaultCameraZ: number
  defaultCameraYOffset: number

  shadowLight?: THREE.Light
  shadowLightTarget?: THREE.Object3D
  shadowLightXOffset: number
  shadowLightYOffset: number

  // horizontalFov: horizontal fov of camera. i personally prefer this for framing as opposed
  //   to vertical fov, so this means we need to do some computation because three uses vertical fov
  // width: width in units of default view
  // topDownTilt: angle in degrees by which the camera should be tilted for better viewing of the world
  constructor(
    horizontalFov: number,
    width: number,
    topDownTilt: number = 0,
    shadowLight?: THREE.Light,
    shadowLightTarget?: THREE.Object3D
  ) {
    const verticalFov = THREE.MathUtils.radToDeg(
      2 *
        Math.atan(
          (450 / 600) * Math.tan(THREE.MathUtils.degToRad(horizontalFov) / 2)
        )
    )

    this.topDownTilt = topDownTilt
    this.defaultCameraDistance =
      width / (2 * Math.tan((horizontalFov * Math.PI) / 180 / 2))
    this.defaultCameraZ =
      this.defaultCameraDistance *
      Math.cos(THREE.MathUtils.degToRad(topDownTilt))
    this.defaultCameraYOffset =
      this.defaultCameraDistance *
      Math.sin(THREE.MathUtils.degToRad(topDownTilt))

    this.camera = new THREE.PerspectiveCamera(
      verticalFov, // three means vertical fov when it just refers to fov
      600 / 450, // assuming 600px x 450px canvas, hardcoded for now
      0.01,
      this.defaultCameraDistance + 100
    )

    this.camera.position.z = this.defaultCameraDistance
    this.camera.rotateX(THREE.MathUtils.degToRad(topDownTilt))

    const min = new THREE.Vector2()
    const max = new THREE.Vector2()
    this.camera.getViewBounds(this.defaultCameraDistance, min, max)

    this.shadowLight = shadowLight
    this.shadowLightTarget = shadowLightTarget
    this.shadowLightXOffset = -25
    this.shadowLightYOffset = -50

    this.moveTo(0, 0)
  }

  // due to top-down tilt, the x, y coordinates of the camera itself don't align
  // with the center of the actual camera. when moving the camera, use this method
  // instead which accounts for the tilt and ensures the camera moves to a position
  // where the given coordinates will be in the center of the canvas
  moveTo(x: number, y: number) {
    this.camera.position.x = x
    this.camera.position.y = y - this.defaultCameraYOffset
    this.camera.position.z = this.defaultCameraZ

    if (this.shadowLight && this.shadowLightTarget) {
      this.shadowLightTarget.position.set(x, y, 0)
      this.shadowLight.position.set(
        x + this.shadowLightXOffset,
        y + this.shadowLightYOffset,
        this.shadowLight.position.z
      )
    }
  }
}
