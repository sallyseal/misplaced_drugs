/**
 * @file Tiled Renderer
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

function TiledRenderer (renderer, camera, viewer, params) {
  const p = params || {}

  let factor = p.factor !== undefined ? p.factor : 2
  const antialias = p.antialias !== undefined ? p.antialias : false

  const onProgress = p.onProgress
  const onFinish = p.onFinish

  //

  if (antialias) factor *= 2
  const n = factor * factor

  // canvas

  const canvas = document.createElement('canvas')
  const width = viewer.width
  const height = viewer.height

  if (antialias) {
    canvas.width = width * factor / 2
    canvas.height = height * factor / 2
  } else {
    canvas.width = width * factor
    canvas.height = height * factor
  }

  const ctx = canvas.getContext('2d')

  const viewerSampleLevel = viewer.sampleLevel
  viewer.setSampling(-1)

  function renderTile (i) {
    const x = i % factor
    const y = Math.floor(i / factor)

    const offsetX = x * width
    const offsetY = y * height

    viewer.camera.setViewOffset(
      width * factor,
      height * factor,
      offsetX,
      offsetY,
      width,
      height
    )

    viewer.render()

    if (antialias) {
      ctx.drawImage(
        renderer.domElement,
        Math.floor(offsetX / 2),
        Math.floor(offsetY / 2),
        Math.ceil(width / 2),
        Math.ceil(height / 2)
      )
    } else {
      ctx.drawImage(
        renderer.domElement,
        Math.floor(offsetX),
        Math.floor(offsetY),
        Math.ceil(width),
        Math.ceil(height)
      )
    }

    if (typeof onProgress === 'function') {
      onProgress(i + 1, n, false)
    }
  }

  function finalize () {
    viewer.setSampling(viewerSampleLevel)
    viewer.camera.view = null

    if (typeof onFinish === 'function') {
      onFinish(n + 1, n, false)
    }
  }

  function render () {
    for (let i = 0; i <= n; ++i) {
      if (i === n) {
        finalize()
      } else {
        renderTile(i)
      }
    }
  }

  function renderAsync () {
    let count = 0

    function fn () {
      if (count === n) {
        finalize()
      } else {
        renderTile(count)
      }
      count += 1
    }

    for (let i = 0; i <= n; ++i) {
      setTimeout(fn, 0)
    }
  }

  // API

  this.render = render
  this.renderAsync = renderAsync

  this.canvas = canvas
}

TiledRenderer.prototype.constructor = TiledRenderer

export default TiledRenderer
