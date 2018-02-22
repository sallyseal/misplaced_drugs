/**
 * @file Molecular Surface Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { RepresentationRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import StructureRepresentation from './structure-representation.js'
import MolecularSurface from '../surface/molecular-surface.js'
import SurfaceBuffer from '../buffer/surface-buffer.js'
import ContourBuffer from '../buffer/contour-buffer.js'
import DoubleSidedBuffer from '../buffer/doublesided-buffer'
import Selection from '../selection/selection.js'

/**
 * Molecular Surface Representation
 */
class MolecularSurfaceRepresentation extends StructureRepresentation {
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'surface'

    this.parameters = Object.assign({

      surfaceType: {
        type: 'select',
        rebuild: true,
        options: {
          'vws': 'vws',
          'sas': 'sas',
          'ms': 'ms',
          'ses': 'ses',
          'av': 'av'
        }
      },
      probeRadius: {
        type: 'number',
        precision: 1,
        max: 20,
        min: 0,
        rebuild: true
      },
      smooth: {
        type: 'integer',
        precision: 1,
        max: 10,
        min: 0,
        rebuild: true
      },
      scaleFactor: {
        type: 'number',
        precision: 1,
        max: 5,
        min: 0,
        rebuild: true
      },
      cutoff: {
        type: 'number',
        precision: 2,
        max: 50,
        min: 0,
        rebuild: true
      },
      contour: {
        type: 'boolean', rebuild: true
      },
      background: {
        type: 'boolean', rebuild: true  // FIXME
      },
      opaqueBack: {
        type: 'boolean', buffer: true
      },
      filterSele: {
        type: 'text', rebuild: true
      },
      colorVolume: {
        type: 'hidden'
      },
      useWorker: {
        type: 'boolean', rebuild: true
      }

    }, this.parameters, {

      radiusType: null,
      radius: null,
      scale: null

    })

    this.__infoList = []

    // TODO find a more direct way
    this.structure.signals.refreshed.add(function () {
      this.__forceNewMolsurf = true
    }, this)

    this.init(params)
  }

  init (params) {
    const p = params || {}
    p.colorScheme = defaults(p.colorScheme, 'uniform')
    p.colorValue = defaults(p.colorValue, 0xDDDDDD)
    p.disablePicking = defaults(p.disablePicking, true)

    this.surfaceType = defaults(p.surfaceType, 'ms')
    this.probeRadius = defaults(p.probeRadius, 1.4)
    this.smooth = defaults(p.smooth, 2)
    this.scaleFactor = defaults(p.scaleFactor, 2.0)
    this.cutoff = defaults(p.cutoff, 0.0)
    this.contour = defaults(p.contour, false)
    this.background = defaults(p.background, false)
    this.opaqueBack = defaults(p.opaqueBack, true)
    this.filterSele = defaults(p.filterSele, '')
    this.colorVolume = defaults(p.colorVolume, undefined)
    this.useWorker = defaults(p.useWorker, true)

    super.init(params)
  }

  prepareData (sview, i, callback) {
    let info = this.__infoList[ i ]
    if (!info) {
      info = {}
      this.__infoList[ i ] = info
    }

    if (!info.molsurf || info.sele !== sview.selection.string) {
      if (this.filterSele) {
        const sviewFilter = sview.structure.getView(new Selection(this.filterSele))
        const bbSize = sviewFilter.boundingBox.getSize()
        const maxDim = Math.max(bbSize.x, bbSize.y, bbSize.z)
        const asWithin = sview.getAtomSetWithinPoint(sviewFilter.center, (maxDim / 2) + 6.0)
        sview = sview.getView(
                    new Selection(sview.getAtomSetWithinSelection(asWithin, 3).toSeleString())
                )
      }

      info.sele = sview.selection.string
      info.molsurf = new MolecularSurface(sview)

      const p = this.getSurfaceParams()
      const onSurfaceFinish = function (surface) {
        info.surface = surface
        callback(i)
      }

      if (this.useWorker) {
        info.molsurf.getSurfaceWorker(p, onSurfaceFinish)
      } else {
        onSurfaceFinish(info.molsurf.getSurface(p))
      }
    } else {
      callback(i)
    }
  }

  prepare (callback) {
    if (this.__forceNewMolsurf || this.__sele !== this.selection.string ||
                this.__surfaceParams !== JSON.stringify(this.getSurfaceParams())) {
      this.__infoList.forEach(info => {
        info.molsurf.dispose()
      })
      this.__infoList.length = 0
    }

    if (this.structureView.atomCount === 0) {
      callback()
      return
    }

    const after = function () {
      this.__sele = this.selection.string
      this.__surfaceParams = JSON.stringify(this.getSurfaceParams())
      this.__forceNewMolsurf = false
      callback()
    }.bind(this)

    const name = this.assembly === 'default' ? this.defaultAssembly : this.assembly
    const assembly = this.structure.biomolDict[ name ]

    if (assembly) {
      assembly.partList.forEach((part, i) => {
        const sview = part.getView(this.structureView)
        this.prepareData(sview, i, (_i) => {
          if (_i === assembly.partList.length - 1) after()
        })
      })
    } else {
      this.prepareData(this.structureView, 0, after)
    }
  }

  createData (sview, i) {
    const info = this.__infoList[ i ]
    const surface = info.surface

    const surfaceData = {
      position: surface.getPosition(),
      color: surface.getColor(this.getColorParams()),
      index: surface.getFilteredIndex(this.filterSele, sview)
    }

    const bufferList = []

    if (surface.contour) {
      const contourBuffer = new ContourBuffer(
        surfaceData,
        this.getBufferParams({
          wireframe: false
        })
      )

      bufferList.push(contourBuffer)
    } else {
      surfaceData.normal = surface.getNormal()
      surfaceData.picking = surface.getPicking(sview.getStructure())

      const surfaceBuffer = new SurfaceBuffer(
        surfaceData,
        this.getBufferParams({
          background: this.background,
          opaqueBack: this.opaqueBack,
          dullInterior: false
        })
      )

      const doubleSidedBuffer = new DoubleSidedBuffer(surfaceBuffer)

      bufferList.push(doubleSidedBuffer)
    }

    return { bufferList, info }
  }

  updateData (what, data) {
    const surfaceData = {}

    if (what.position) {
      this.__forceNewMolsurf = true
      this.build()
      return
    }

    if (what.color) {
      surfaceData.color = data.info.surface.getColor(this.getColorParams())
    }

    if (what.index) {
      surfaceData.index = data.info.surface.getFilteredIndex(this.filterSele, data.sview)
    }

    data.bufferList[ 0 ].setAttributes(surfaceData)
  }

  setParameters (params, what, rebuild) {
    what = what || {}

    if (params && params.filterSele) {
      what.index = true
    }

    if (params && params.colorVolume !== undefined) {
      what.color = true
    }

    // forbid setting wireframe to true when contour is true
    if (params && params.wireframe && (
          params.contour || (params.contour === undefined && this.contour)
        )
    ) {
      params.wireframe = false
    }

    super.setParameters(params, what, rebuild)

    return this
  }

  getSurfaceParams (params) {
    const p = Object.assign({
      type: this.surfaceType,
      probeRadius: this.probeRadius,
      scaleFactor: this.scaleFactor,
      smooth: this.smooth && !this.contour,
      cutoff: this.cutoff,
      contour: this.contour,
      useWorker: this.useWorker
    }, params)

    return p
  }

  getColorParams () {
    const p = super.getColorParams()

    p.volume = this.colorVolume

    return p
  }

  clear () {
    super.clear()
  }

  dispose () {
    this.__infoList.forEach(info => {
      info.molsurf.dispose()
    })
    this.__infoList.length = 0

    super.dispose()
  }
}

RepresentationRegistry.add('surface', MolecularSurfaceRepresentation)

export default MolecularSurfaceRepresentation
