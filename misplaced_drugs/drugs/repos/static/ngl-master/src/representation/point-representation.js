/**
 * @file Point Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import StructureRepresentation from './structure-representation.js'
import PointBuffer from '../buffer/point-buffer.js'

/**
 * Point Representation
 */
class PointRepresentation extends StructureRepresentation {
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'point'

    this.parameters = Object.assign({

      pointSize: {
        type: 'number', precision: 1, max: 100, min: 0, buffer: true
      },
      sizeAttenuation: {
        type: 'boolean', buffer: true
      },
      sortParticles: {
        type: 'boolean', rebuild: true
      },
      useTexture: {
        type: 'boolean', buffer: true
      },
      alphaTest: {
        type: 'range', step: 0.001, max: 1, min: 0, buffer: true
      },
      forceTransparent: {
        type: 'boolean', buffer: true
      },
      edgeBleach: {
        type: 'range', step: 0.001, max: 1, min: 0, buffer: true
      }

    }, this.parameters, {

      flatShaded: null,
      wireframe: null,
      linewidth: null,
      side: null,

      roughness: null,
      metalness: null

    })

    this.init(params)
  }

  init (params) {
    var p = params || {}

    this.pointSize = defaults(p.pointSize, 1)
    this.sizeAttenuation = defaults(p.sizeAttenuation, true)
    this.sortParticles = defaults(p.sortParticles, false)
    this.useTexture = defaults(p.useTexture, false)
    this.alphaTest = defaults(p.alphaTest, 0.5)
    this.forceTransparent = defaults(p.forceTransparent, false)
    this.edgeBleach = defaults(p.edgeBleach, 0.0)

    super.init(p)
  }

  createData (sview) {
    var what = { position: true, color: true, picking: true }
    var atomData = sview.getAtomData(this.getAtomParams(what))

    var pointBuffer = new PointBuffer(
      atomData,
      this.getBufferParams({
        pointSize: this.pointSize,
        sizeAttenuation: this.sizeAttenuation,
        sortParticles: this.sortParticles,
        useTexture: this.useTexture,
        alphaTest: this.alphaTest,
        forceTransparent: this.forceTransparent,
        edgeBleach: this.edgeBleach
      })
    )

    return {
      bufferList: [ pointBuffer ]
    }
  }

  updateData (what, data) {
    var atomData = data.sview.getAtomData(this.getAtomParams(what))
    var pointData = {}

    if (!what || what.position) {
      pointData.position = atomData.position
    }

    if (!what || what.color) {
      pointData.color = atomData.color
    }

    data.bufferList[ 0 ].setAttributes(pointData)
  }
}

RepresentationRegistry.add('point', PointRepresentation)

export default PointRepresentation
