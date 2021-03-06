// @flow

import React from 'react'
import { storiesOf } from '@kadira/storybook'

import StockPlot from './StockPlot'

storiesOf('StockPlot', module).add('simple', () =>
  <StockPlot
    width={1000}
    height={300}
    data={[
      [
        { date: new Date('2016-01-01'), value: 20 },
        { date: new Date('2016-02-02'), value: 30 },
        { date: new Date('2016-03-01'), value: 25 },
        { date: new Date('2016-04-01'), value: 20 },
        { date: new Date('2016-05-01'), value: 26 },
        { date: new Date('2016-06-01'), value: 29 },
        { date: new Date('2016-07-01'), value: 32 },
        { date: new Date('2016-08-01'), value: 30 },
        { date: new Date('2016-09-01'), value: 31 },
        { date: new Date('2016-10-01'), value: 30 },
        { date: new Date('2016-11-01'), value: 27 },
        { date: new Date('2016-12-01'), value: 20 }
      ],
      [
        { date: new Date('2016-01-11'), value: 20 },
        { date: new Date('2016-02-22'), value: 43 },
        { date: new Date('2016-03-06'), value: 25 },
        { date: new Date('2016-04-11'), value: 13 },
        { date: new Date('2016-05-21'), value: 26 },
        { date: new Date('2016-06-11'), value: 33 },
        { date: new Date('2016-08-11'), value: 30 },
        { date: new Date('2016-09-21'), value: 31 },
        { date: new Date('2016-10-11'), value: 30 },
        { date: new Date('2016-11-21'), value: 27 },
        { date: new Date('2016-12-31'), value: 20 }
      ]
    ]}
  />
)
