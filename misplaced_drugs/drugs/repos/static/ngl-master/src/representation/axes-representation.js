/**
 * @file Axes Representation
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Color, Vector3 } from '../../lib/three.es6.js'

import { RepresentationRegistry } from '../globals.js'
import { defaults } from '../utils.js'
import { AxesPicker } from '../utils/picker.js'
import { uniformArray, uniformArray3 } from '../math/array-utils.js'
import StructureRepresentation from './structure-representation.js'
import SphereBuffer from '../buffer/sphere-buffer.js'
import CylinderBuffer from '../buffer/cylinder-buffer.js'

/**
 * Axes representation. Show principal axes and/or a box aligned with them
 * that fits the structure or selection.
 *
 * __Name:__ _axes_
 *
 * @example
 * stage.loadFile( "rcsb://3pqr", {
 *     assembly: "BU1"
 * } ).then( function( o ){
 *     o.addRepresentation( "cartoon" );
 *     o.addRepresentation( "axes", {
 *         sele: "RET", showAxes: false, showBox: true, radius: 0.2
 *     } );
 *     o.addRepresentation( "ball+stick", { sele: "RET" } );
 *     o.addRepresentation( "axes", {
 *         sele: ":B and backbone", showAxes: false, showBox: true, radius: 0.2
 *     } );
 *     stage.autoView();
 *     var pa = o.structure.getPrincipalAxes();
 *     stage.animationControls.rotate( pa.getRotationQuaternion(), 1500 );
 * } );
 */
class AxesRepresentation extends StructureRepresentation {
  /**
   * @param  {Structure} structure - the structure object
   * @param  {Viewer} viewer - the viewer object
   * @param  {StructureRepresentationParameters} params - parameters object
   */
  constructor (structure, viewer, params) {
    super(structure, viewer, params)

    this.type = 'axes'

    this.parameters = Object.assign({

      radius: {
        type: 'number', precision: 3, max: 10.0, min: 0.001
      },
      sphereDetail: true,
      radialSegments: true,
      disableImpostor: true,
      showAxes: {
        type: 'boolean', rebuild: true
      },
      showBox: {
        type: 'boolean', rebuild: true
      }

    }, this.parameters, {
      assembly: null
    })

    this.init(params)
  }

  init (params) {
    var p = params || {}

    p.radius = defaults(p.radius, 0.5)
    p.colorValue = defaults(p.colorValue, 'lightgreen')

    this.showAxes = defaults(p.showAxes, true)
    this.showBox = defaults(p.showBox, false)

    super.init(p)
  }

  getPrincipalAxes (/* sview */) {
    var selection
    var assembly = this.getAssembly()

    if (assembly) {
      selection = assembly.partList[ 0 ].getSelection()
    }

    return this.structureView.getPrincipalAxes(selection)
  }

  getAxesData (sview) {
    var pa = this.getPrincipalAxes(sview)
    var c = new Color(this.colorValue)

    var vn = 0
    var en = 0

    if (this.showAxes) {
      vn += 6
      en += 3
    }

    if (this.showBox) {
      vn += 8
      en += 12
    }

    var vertexPosition = new Float32Array(3 * vn)
    var vertexColor = uniformArray3(vn, c.r, c.g, c.b)
    var vertexRadius = uniformArray(vn, this.radius)

    var edgePosition1 = new Float32Array(3 * en)
    var edgePosition2 = new Float32Array(3 * en)
    var edgeColor = uniformArray3(en, c.r, c.g, c.b)
    var edgeRadius = uniformArray(en, this.radius)

    var offset = 0

    if (this.showAxes) {
      var addAxis = function (v1, v2) {
        v1.toArray(vertexPosition, offset * 2)
        v2.toArray(vertexPosition, offset * 2 + 3)
        v1.toArray(edgePosition1, offset)
        v2.toArray(edgePosition2, offset)
        offset += 3
      }

      addAxis(pa.begA, pa.endA)
      addAxis(pa.begB, pa.endB)
      addAxis(pa.begC, pa.endC)
    }

    if (this.showBox) {
      var v = new Vector3()
      var { d1a, d2a, d3a, d1b, d2b, d3b } = pa.getProjectedScaleForAtoms(sview)

      console.log(d1a, d2a, d3a, d1b, d2b, d3b)

      var offset2 = offset * 2
      var addCorner = function (d1, d2, d3) {
        v.copy(pa.center)
          .addScaledVector(pa.normVecA, d1)
          .addScaledVector(pa.normVecB, d2)
          .addScaledVector(pa.normVecC, d3)
        v.toArray(vertexPosition, offset2)
        offset2 += 3
      }
      addCorner(d1a, d2a, d3a)
      addCorner(d1a, d2a, d3b)
      addCorner(d1a, d2b, d3b)
      addCorner(d1a, d2b, d3a)
      addCorner(d1b, d2b, d3b)
      addCorner(d1b, d2b, d3a)
      addCorner(d1b, d2a, d3a)
      addCorner(d1b, d2a, d3b)

      var edgeOffset = offset
      var addEdge = function (a, b) {
        v.fromArray(vertexPosition, offset * 2 + a * 3)
          .toArray(edgePosition1, edgeOffset)
        v.fromArray(vertexPosition, offset * 2 + b * 3)
          .toArray(edgePosition2, edgeOffset)
        edgeOffset += 3
      }
      addEdge(0, 1)
      addEdge(0, 3)
      addEdge(0, 6)
      addEdge(1, 2)
      addEdge(1, 7)
      addEdge(2, 3)
      addEdge(2, 4)
      addEdge(3, 5)
      addEdge(4, 5)
      addEdge(4, 7)
      addEdge(5, 6)
      addEdge(6, 7)
    }

    const picker = new AxesPicker(pa)

    return {
      vertex: {
        position: vertexPosition,
        color: vertexColor,
        radius: vertexRadius,
        picking: picker
      },
      edge: {
        position1: edgePosition1,
        position2: edgePosition2,
        color: edgeColor,
        color2: edgeColor,
        radius: edgeRadius,
        picking: picker
      }
    }
  }

  create () {
    var axesData = this.getAxesData(this.structureView)

    this.sphereBuffer = new SphereBuffer(
      axesData.vertex,
      this.getBufferParams({
        sphereDetail: this.sphereDetail,
        disableImpostor: this.disableImpostor,
        dullInterior: true
      })
    )

    this.cylinderBuffer = new CylinderBuffer(
      axesData.edge,
      this.getBufferParams({
        openEnded: true,
        radialSegments: this.radialSegments,
        disableImpostor: this.disableImpostor,
        dullInterior: true
      })
    )

    this.dataList.push({
      sview: this.structureView,
      bufferList: [ this.sphereBuffer, this.cylinderBuffer ]
    })
  }

  updateData (what, data) {
    var axesData = this.getAxesData(data.sview)
    var sphereData = {}
    var cylinderData = {}

    if (!what || what.position) {
      sphereData.position = axesData.vertex.position
      cylinderData.position1 = axesData.edge.position1
      cylinderData.position2 = axesData.edge.position2
    }

    if (!what || what.color) {
      sphereData.color = axesData.vertex.color
      cylinderData.color = axesData.edge.color
      cylinderData.color2 = axesData.edge.color
    }

    if (!what || what.radius) {
      sphereData.radius = axesData.vertex.radius
      cylinderData.radius = axesData.edge.radius
    }

    this.sphereBuffer.setAttributes(sphereData)
    this.cylinderBuffer.setAttributes(cylinderData)
  }
}

RepresentationRegistry.add('axes', AxesRepresentation)

export default AxesRepresentation
