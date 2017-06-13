// @flow

import React from 'react'
import PropTypes from 'prop-types'
import { equals, zip } from 'ramda'

import withPlotParams from './withPlotParams'

import type { PlotPoint } from '../../types'

type Props = {
  /**
   * Plot points
   */
  points: PlotPoint[],

  /**
   * Plot scales
   */
  scale: { x: number, y: number },

  /**
   * Plot sizes
   */
  sizes: { height: number, width: number },

  /**
   * Line color
   */
  color: string,

  id?: string,

  padding: { left: number, bottom: number },

  range: { x: [number, number], y: [number, number] }
}

const KEYS_FOR_UPDATES = [
  'points',
  'scale',
  'sizes',
  'color',
  'id',
  'padding',
  'range'
]

const getProps = props => KEYS_FOR_UPDATES.map(x => props[x])

const checkPropsUpdate = (propsA: Props, propsB: Props) =>
  zip(getProps(propsA), getProps(propsB)).some(x => !equals(...x))

let GlobalId = 0

class Line extends React.PureComponent {
  static defaultProps = {
    color: 'red',
    padding: { left: 0, bottom: 0 },
    scale: { x: 1, y: 1 }
  }

  props: Props

  _flush: ?Function = null
  _id: string = (GlobalId++).toString(16)

  componentDidMount() {
    if (this.props.id) {
      this._id = this.props.id
    }
    this._registerPoints()
  }

  componentDidUpdate(prevProps) {
    if (this.props.id && this.props.id !== prevProps.id) {
      this._id = this.props.id
    }
    if (!equals(this.props.points, prevProps.points)) {
      if (this._flush) {
        this._flush()
      }
      this._registerPoints()
    }
  }

  shouldComponentUpdate(nextProps) {
    return checkPropsUpdate(this.props, nextProps)
  }

  componentWillUnmount() {
    if (this._flush) {
      this._flush()
    }
  }

  render() {
    const { padding, sizes } = this.props
    return (
      <g>
        <defs>
          <clipPath id={this._id}>
            <rect
              x={padding.left}
              y={0}
              width={sizes.width - padding.left}
              height={sizes.height - padding.bottom}
            />
          </clipPath>
        </defs>
        <path
          clipPath={`url(#${this._id})`}
          strokeWidth="2"
          fill="none"
          stroke={this.props.color}
          d={this._getDirection()}
        />
      </g>
    )
  }

  _getDirection() {
    const { scale, points, sizes, padding, range } = this.props
    return points.map(pointToPath(scale, sizes, padding, range)).join(' ')
  }

  _registerPoints() {
    this._flush = this.context.registerPoints(
      this._id,
      this.props.points,
      this.props.color
    )
  }
}

Line.contextTypes = {
  registerPoints: PropTypes.func.isRequired
}

function pointToPath(scale, sizes, padding, range) {
  return (point, i) => {
    const type = i === 0 ? 'M' : 'L'
    const x = (point.x - range.x[0]) * scale.x + padding.left
    const y = sizes.height - (point.y - range.y[0]) * scale.y - padding.bottom
    return `${type}${x}, ${y}`
  }
}

export default withPlotParams(Line)
