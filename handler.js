//  控制移動
function moveHandler(THREE, scene, modelMesh, camera, keysPressed, cameraHeight, cameraRange, speed, rotateSpeed) {
  if (JSON.stringify(keysPressed) !== '{}') {
    new TWEEN.Tween(scene)
      .onUpdate(() => {
        let matrix
        //  計算旋轉
        const calRotate = (radiu) => {
          let distanceX = camera.position.x - modelMesh.position.x
          let distanceZ = camera.position.z - modelMesh.position.z
          //  由於距離計算有時候會稍微超過最大距離，轉為整數就可以固定為最大距離
          if (
            distanceX > cameraRange ||
            distanceX < cameraRange * -1 ||
            distanceZ > cameraRange ||
            distanceZ < cameraRange * -1
          ) {
            distanceX = parseInt(distanceX)
            distanceZ = parseInt(distanceZ)
          }
          const thetaX = Math.acos(distanceX / cameraRange)
          const thetaZ = Math.asin(distanceZ / cameraRange)
          let theta = thetaX
          if (!isNaN(thetaX)) {
            if (thetaZ > 0) {
              theta = 2 * Math.PI - thetaX
            }

            modelMesh.rotateY(radiu)
            camera.position.set(
              modelMesh.position.x + cameraRange * Math.cos(theta + radiu),
              modelMesh.position.y + cameraHeight,
              modelMesh.position.z - cameraRange * Math.sin(theta + radiu)
            )
          }
        }

        //  計算前後移動
        const calMove = (action) => {
          const direction = new THREE.Vector3()
          let move
          if (action === 'forward') {
            move = speed
          } else {
            move = speed * -1
          }
          camera.getWorldDirection(direction)
          camera.position.addScaledVector({ x: direction.x, y: 0, z: direction.z }, move) // y向量設0，y軸才不會偏移
          modelMesh.position.copy(camera.position)
          modelMesh.updateMatrix()
          modelMesh.translateX(cameraRange)
          modelMesh.translateY(cameraHeight * -1)
        }

        if (keysPressed['w']) {
          calMove('forward')
        }

        if (keysPressed['s']) {
          calMove('back')
        }

        if (keysPressed['a']) {
          calRotate(rotateSpeed)
        }

        if (keysPressed['d']) {
          calRotate(rotateSpeed * -1)
        }
      })
      .start()
  }
}

//  控制相機視角
function cameraHandler(cameraControl, modelMesh) {
  cameraControl.target.set(modelMesh.position.x, modelMesh.position.y + 3, modelMesh.position.z)
}

//  控制子彈
function bulletHandler(THREE, bullets, allCreaper, scene, renderer) {
  bullets.forEach((element) => {
    element.translateX(10)
    element.updateMatrix()
    const originPoint = element.position.clone()

    const position = element.geometry.attributes.position
    const vector = new THREE.Vector3()
    for (let i = 0, l = position.count; i < l; i++) {
      vector.fromBufferAttribute(position, i)
      vector.applyMatrix4(element.matrixWorld)
      const globalVertex = vector.applyMatrix4(element.matrix)
      const directionVector = globalVertex.sub(element.position)
      const ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize())
      let creeperRes = ray.intersectObjects(allCreaper)
      if (creeperRes.length > 0 && creeperRes[0].distance < directionVector.length()) {
        let selectObj = scene.getObjectByProperty('uuid', creeperRes[0].object.parent.uuid)
        element.geometry.dispose()
        element.material.dispose()
        scene.remove(element)
        creeperRes[0].object.geometry.dispose()
        // creeperRes[0].object.material.dispose()
        scene.remove(selectObj)
        creeperRes.splice(0, 1)
        console.log(bullets)
        bullets.splice(bullets.indexOf(bullets.find((bullet) => bullet.id === element.id)), 1)
        // renderer.renderLists.dispose()
      }
    }
  })
  return bullets
}
