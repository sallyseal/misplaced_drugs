/**
 * @file Trajectory
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import Signal from '../../lib/signals.es6.js'

import { Log } from '../globals.js'
import { defaults } from '../utils.js'
import { circularMean, arrayMean } from '../math/array-utils.js'
import { lerp, spline } from '../math/math-utils.js'
import Selection from '../selection/selection.js'
import Superposition from '../align/superposition.js'
import TrajectoryPlayer from './trajectory-player.js'

function centerPbc (coords, mean, box) {
  if (box[ 0 ] === 0 || box[ 8 ] === 0 || box[ 4 ] === 0) {
    return
  }

  const n = coords.length

  const bx = box[ 0 ]
  const by = box[ 1 ]
  const bz = box[ 2 ]
  const mx = mean[ 0 ]
  const my = mean[ 1 ]
  const mz = mean[ 2 ]

  const fx = -mx + bx + bx / 2
  const fy = -my + by + by / 2
  const fz = -mz + bz + bz / 2

  for (let i = 0; i < n; i += 3) {
    coords[ i + 0 ] = (coords[ i + 0 ] + fx) % bx
    coords[ i + 1 ] = (coords[ i + 1 ] + fy) % by
    coords[ i + 2 ] = (coords[ i + 2 ] + fz) % bz
  }
}

function removePbc (x, box) {
  if (box[ 0 ] === 0 || box[ 8 ] === 0 || box[ 4 ] === 0) {
    return
  }

  // ported from GROMACS src/gmxlib/rmpbc.c:rm_gropbc()
  // in-place

  const n = x.length

  for (let i = 3; i < n; i += 3) {
    for (let j = 0; j < 3; ++j) {
      const dist = x[ i + j ] - x[ i - 3 + j ]

      if (Math.abs(dist) > 0.9 * box[ j * 3 + j ]) {
        if (dist > 0) {
          for (let d = 0; d < 3; ++d) {
            x[ i + d ] -= box[ j * 3 + d ]
          }
        } else {
          for (let d = 0; d < 3; ++d) {
            x[ i + d ] += box[ j * 3 + d ]
          }
        }
      }
    }
  }

  return x
}

function removePeriodicity (x, box, mean) {
  if (box[ 0 ] === 0 || box[ 8 ] === 0 || box[ 4 ] === 0) {
    return
  }

  const n = x.length
  for (let i = 3; i < n; i += 3) {
    for (let j = 0; j < 3; ++j) {
      const f = (x[ i + j ] - mean[ j ]) / box[ j * 3 + j ]
      if (Math.abs(f) > 0.5) {
        x[ i + j ] -= box[ j * 3 + j ] * Math.round(f)
      }
    }
  }

  return x
}

function circularMean3 (indices, coords, box) {
  return [
    circularMean(coords, box[ 0 ], 3, 0, indices),
    circularMean(coords, box[ 1 ], 3, 1, indices),
    circularMean(coords, box[ 2 ], 3, 2, indices)
  ]
}

function arrayMean3 (coords) {
  return [
    arrayMean(coords, 3, 0),
    arrayMean(coords, 3, 1),
    arrayMean(coords, 3, 2)
  ]
}

function interpolateSpline (c, cp, cpp, cppp, t) {
  const m = c.length
  const coords = new Float32Array(m)

  for (let j0 = 0; j0 < m; j0 += 3) {
    const j1 = j0 + 1
    const j2 = j0 + 2
    coords[ j0 ] = spline(cppp[ j0 ], cpp[ j0 ], cp[ j0 ], c[ j0 ], t, 1)
    coords[ j1 ] = spline(cppp[ j1 ], cpp[ j1 ], cp[ j1 ], c[ j1 ], t, 1)
    coords[ j2 ] = spline(cppp[ j2 ], cpp[ j2 ], cp[ j2 ], c[ j2 ], t, 1)
  }

  return coords
}

function interpolateLerp (c, cp, t) {
  const m = c.length
  const coords = new Float32Array(m)

  for (let j0 = 0; j0 < m; j0 += 3) {
    const j1 = j0 + 1
    const j2 = j0 + 2
    coords[ j0 ] = lerp(cp[ j0 ], c[ j0 ], t)
    coords[ j1 ] = lerp(cp[ j1 ], c[ j1 ], t)
    coords[ j2 ] = lerp(cp[ j2 ], c[ j2 ], t)
  }

  return coords
}

/**
 * Trajectory parameter object.
 * @typedef {Object} TrajectoryParameters - parameters
 *
 * @property {Number} deltaTime - timestep between frames in picoseconds
 * @property {Number} timeOffset - starting time of frames in picoseconds
 * @property {String} sele - to restrict atoms used for superposition
 * @property {Boolean} centerPbc - center on initial frame
 * @property {Boolean} removePeriodicity - move atoms into the origin box
 * @property {Boolean} remo - try fixing periodic boundary discontinuities
 * @property {Boolean} superpose - superpose on initial frame
 */

/**
 * @example
 * trajectory.signals.frameChanged.add( function(i){ ... } );
 *
 * @typedef {Object} TrajectorySignals
 * @property {Signal<Integer>} countChanged - when the frame count is changed
 * @property {Signal<Integer>} frameChanged - when the set frame is changed
 * @property {Signal<TrajectoryPlayer>} playerChanged - when the player is changed
 */

/**
 * Base class for trajectories, tying structures and coordinates together
 * @interface
 */
class Trajectory {
  /**
   * @param {String|Frames} trajPath - trajectory source
   * @param {Structure} structure - the structure object
   * @param {TrajectoryParameters} params - trajectory parameters
   */
  constructor (trajPath, structure, params) {
    /**
     * Events emitted by the trajectory
     * @type {TrajectorySignals}
     */
    this.signals = {
      countChanged: new Signal(),
      frameChanged: new Signal(),
      playerChanged: new Signal()
    }

    const p = params || {}

    this.deltaTime = defaults(p.deltaTime, 0)
    this.timeOffset = defaults(p.timeOffset, 0)
    this.centerPbc = defaults(p.centerPbc, false)
    this.removePbc = defaults(p.removePbc, false)
    this.removePeriodicity = defaults(p.removePeriodicity, false)
    this.superpose = defaults(p.superpose, false)

    this.name = trajPath.replace(/^.*[\\/]/, '')
    this.trajPath = trajPath

    this.initialCoords = null
    this.structureCoords = null

    /**
     * selection to restrict atoms used for superposition
     * @type {Selection}
     */
    this.selection = new Selection(
      defaults(p.sele, 'backbone and not hydrogen')
    )

    this.selection.signals.stringChanged.add(function () {
      this.selectionIndices = this.structure.getAtomIndices(this.selection)
      this._resetCache()
      this._saveInitialCoords()
      this.setFrame(this._currentFrame)
    }, this)

    this._frameCount = 0
    this._currentFrame = -1
  }

  /**
   * Number of frames in the trajectory
   * @return {Number} count
   */
  get frameCount () {
    return this._frameCount
  }

  /**
   * Currently set frame of the trajectory
   * @return {Number} frame
   */
  get currentFrame () {
    return this._currentFrame
  }

  _init (structure) {
    this.setStructure(structure)
    this._loadFrameCount()
    this.setPlayer(new TrajectoryPlayer(this))
  }

  setStructure (structure) {
    this.structure = structure
    this.atomCount = structure.atomCount

    this.backboneIndices = this._getIndices(
      new Selection('backbone and not hydrogen')
    )
    this._makeAtomIndices()
    this._saveStructureCoords()

    this.selectionIndices = this._getIndices(this.selection)
    this._resetCache()
    this._saveInitialCoords()
    this.setFrame(this._currentFrame)
  }

  _saveInitialCoords () {
    if (this.structure.hasCoords()) {
      this.initialCoords = new Float32Array(this.structureCoords)
      this._makeSuperposeCoords()
    } else if (this.frameCache[0]) {
      this.initialCoords = new Float32Array(this.frameCache[0])
      this._makeSuperposeCoords()
    } else {
      this.loadFrame(0, () => this._saveInitialCoords())
    }
  }

  _saveStructureCoords () {
    const p = { what: { position: true } }
    this.structureCoords = this.structure.getAtomData(p).position
  }

  setSelection (string) {
    this.selection.setString(string)
    return this
  }

  _getIndices (selection) {
    let i = 0
    const test = selection.test
    const indices = []

    this.structure.eachAtom(function (ap) {
      if (test(ap)) indices.push(i)
      i += 1
    })

    return indices
  }

  _makeSuperposeCoords () {
    const n = this.selectionIndices.length * 3

    this.coords1 = new Float32Array(n)
    this.coords2 = new Float32Array(n)

    const y = this.initialCoords
    const coords2 = this.coords2

    for (let i = 0; i < n; i += 3) {
      const j = this.selectionIndices[ i / 3 ] * 3

      coords2[ i + 0 ] = y[ j + 0 ]
      coords2[ i + 1 ] = y[ j + 1 ]
      coords2[ i + 2 ] = y[ j + 2 ]
    }
  }

  _makeAtomIndices () {
    Log.error('Trajectory._makeAtomIndices not implemented')
  }

  _resetCache () {
    this.frameCache = {}
    this.loadQueue = {}
    this.boxCache = {}
    this.pathCache = {}
    this.frameCacheSize = 0
    this.initialCoords = null
  }

  setParameters (params) {
    const p = params || {}
    let resetCache = false

    if (p.centerPbc !== undefined && p.centerPbc !== this.centerPbc) {
      this.centerPbc = p.centerPbc
      resetCache = true
    }

    if (p.removePeriodicity !== undefined && p.removePeriodicity !== this.removePeriodicity) {
      this.removePeriodicity = p.removePeriodicity
      resetCache = true
    }

    if (p.removePbc !== undefined && p.removePbc !== this.removePbc) {
      this.removePbc = p.removePbc
      resetCache = true
    }

    if (p.superpose !== undefined && p.superpose !== this.superpose) {
      this.superpose = p.superpose
      resetCache = true
    }

    this.deltaTime = defaults(p.deltaTime, this.deltaTime)
    this.timeOffset = defaults(p.timeOffset, this.timeOffset)

    if (resetCache) {
      this._resetCache()
      this.setFrame(this._currentFrame)
    }
  }

  /**
   * Check if a frame is available
   * @param  {Integer|Integer[]} i - the frame index
   * @return {Boolean} frame availability
   */
  hasFrame (i) {
    if (Array.isArray(i)) {
      return i.every(j => !!this.frameCache[j])
    } else {
      return !!this.frameCache[i]
    }
  }

  /**
   * Set trajectory to a frame index
   * @param {Integer} i - the frame index
   * @param {Function} callback - fired when the frame has been set
   */
  setFrame (i, callback) {
    if (i === undefined) return this

    this.inProgress = true

    i = parseInt(i)

    if (i === -1 || this.frameCache[ i ]) {
      this._updateStructure(i)
      if (callback) callback()
    } else {
      this.loadFrame(i, () => {
        this._updateStructure(i)
        if (callback) callback()
      })
    }

    return this
  }

  _interpolate (i, ip, ipp, ippp, t, type) {
    const fc = this.frameCache

    let coords
    if (type === 'spline') {
      coords = interpolateSpline(fc[ i ], fc[ ip ], fc[ ipp ], fc[ ippp ], t)
    } else {
      coords = interpolateLerp(fc[ i ], fc[ ip ], t)
    }

    this.structure.updatePosition(coords)
    this._currentFrame = i
    this.signals.frameChanged.dispatch(i)
  }

  /**
   * Interpolated and set trajectory to frame indices
   * @param {Integer} i - the frame index
   * @param {Integer} ip - one before frame index
   * @param {Integer} ipp - two before frame index
   * @param {Integer} ippp - three before frame index
   * @param {Number} t - interpolation step [0,1]
   * @param {String} type - interpolation type, '', 'spline' or 'linear'
   * @param {Function} callback - fired when the frame has been set
   */
  setFrameInterpolated (i, ip, ipp, ippp, t, type, callback) {
    if (i === undefined) return this

    const fc = this.frameCache
    const iList = []

    if (!fc[ ippp ]) iList.push(ippp)
    if (!fc[ ipp ]) iList.push(ipp)
    if (!fc[ ip ]) iList.push(ip)
    if (!fc[ i ]) iList.push(i)

    if (iList.length) {
      this.loadFrame(iList, () => {
        this._interpolate(i, ip, ipp, ippp, t, type)
        if (callback) callback()
      })
    } else {
      this._interpolate(i, ip, ipp, ippp, t, type)
      if (callback) callback()
    }

    return this
  }

  /**
   * Load frame index
   * @param {Integer|Integer[]} i - the frame index
   * @param {Function} callback - fired when the frame has been loaded
   */
  loadFrame (i, callback) {
    if (Array.isArray(i)) {
      i.forEach(j => {
        if (!this.loadQueue[j] && !this.frameCache[j]) {
          this.loadQueue[j] = true
          this._loadFrame(j, () => {
            delete this.loadQueue[j]
          })
        }
      })
    } else {
      if (!this.loadQueue[i] && !this.frameCache[i]) {
        this.loadQueue[i] = true
        this._loadFrame(i, () => {
          delete this.loadQueue[i]
          if (callback) callback()
        })
      }
    }
  }

  /**
   * Load frame index
   * @abstract
   * @param {Integer} i - the frame index
   * @param {Function} callback - fired when the frame has been loaded
   */
  _loadFrame (i, callback) {
    Log.error('Trajectory._loadFrame not implemented', i, callback)
  }

  _updateStructure (i) {
    if (this._disposed) {
      console.error('updateStructure: traj disposed')
      return
    }

    if (i === -1) {
      if (this.structureCoords) {
        this.structure.updatePosition(this.structureCoords)
      }
    } else {
      this.structure.updatePosition(this.frameCache[ i ])
    }

    this.structure.trajectory = {
      name: this.trajPath,
      frame: i
    }

    this._currentFrame = i
    this.inProgress = false
    this.signals.frameChanged.dispatch(i)
  }

  _doSuperpose (x) {
    const n = this.selectionIndices.length * 3

    const coords1 = this.coords1
    const coords2 = this.coords2

    for (let i = 0; i < n; i += 3) {
      const j = this.selectionIndices[ i / 3 ] * 3

      coords1[ i + 0 ] = x[ j + 0 ]
      coords1[ i + 1 ] = x[ j + 1 ]
      coords1[ i + 2 ] = x[ j + 2 ]
    }

    // TODO re-use superposition object
    const sp = new Superposition(coords1, coords2)
    sp.transform(x)
  }

  _process (i, box, coords, frameCount) {
    this._setFrameCount(frameCount)

    if (box) {
      if (this.backboneIndices.length > 0 && this.centerPbc) {
        const box2 = [ box[ 0 ], box[ 4 ], box[ 8 ] ]
        const circMean = circularMean3(this.backboneIndices, coords, box2)
        centerPbc(coords, circMean, box2)
      }

      if (this.removePeriodicity) {
        const mean = arrayMean3(coords)
        removePeriodicity(coords, box, mean)
      }

      if (this.removePbc) {
        removePbc(coords, box)
      }
    }

    if (this.selectionIndices.length > 0 && this.coords1 && this.superpose) {
      this._doSuperpose(coords)
    }

    this.frameCache[ i ] = coords
    this.boxCache[ i ] = box
    this.frameCacheSize += 1
  }

  _setFrameCount (n) {
    if (n !== this._frameCount) {
      this._frameCount = n
      this.signals.countChanged.dispatch(n)
    }
  }

  /**
   * Dispose of the trajectory object
   * @return {undefined}
   */
  dispose () {
    this._resetCache()  // aid GC
    this._disposed = true
    if (this.player) this.player.stop()
  }

  /**
   * Set player for this trajectory
   * @param {TrajectoryPlayer} player - the player
   */
  setPlayer (player) {
    this.player = player
    this.signals.playerChanged.dispatch(player)
  }

  /**
   * Get path of atom
   * abstract
   * @param  {Integer} index - atom index
   * @param  {Function} callback - fired when the path is available
   * @return {undefined}
   */
  getPath (index, callback) {
    Log.error('Trajectory.getPath not implemented', index, callback)
  }

  /**
   * Get time for frame
   * @param  {Integer} i - frame index
   * @return {Number} time in picoseconds
   */
  getFrameTime (i) {
    return this.timeOffset + i * this.deltaTime
  }
}

export default Trajectory
