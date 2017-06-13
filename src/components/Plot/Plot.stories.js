// @flow

import React from 'react'
import { storiesOf } from '@kadira/storybook'

import Plot from './Plot'
import Line from './Line'
import Axis from './Axis'

storiesOf('Plot', module).add('simple', () =>
  <div
    style={{
      display: 'inline-block',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      paddingTop: 35,
      paddingRight: 50,
      background: '#fafafa'
    }}
  >
    <Plot height={200} width={400}>
      <Line
        points={[
          { x: 0, y: 5 },
          { x: 10, y: 10 },
          { x: 20, y: 20 },
          { x: 30, y: 15 },
          { x: 40, y: 30 }
        ]}
      />
      <Line
        points={[
          { x: 0, y: 20 },
          { x: 5, y: 17 },
          { x: 8, y: 18 },
          { x: 16, y: 23 },
          { x: 23, y: 15 },
          { x: 31, y: 9 },
          { x: 37, y: 7 }
        ]}
        color="green"
      />
      <Axis position="bottom" min={10} max={50} />
      <Axis position="left" min={0} max={35} renderLabel={x => `$${x}`} />
    </Plot>
  </div>
)
