import useWebSocket, { ReadyState } from 'react-use-websocket'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import styles from './styles.module.scss'
import clsx from 'clsx'

import { initOrdersSnapshot, updateOrder } from './store'
import { orderKeys } from './config'

const useOrderBookWs = () => {
  const orders = useSelector(({ orders }) => orders)
  const dispatch = useDispatch()

  const WS_URL = 'wss://api-pub.bitfinex.com/ws/2'
  const {
    readyState,
    sendJsonMessage: send,
    lastJsonMessage: data,
  } = useWebSocket(WS_URL, {
    share: false,
    shouldReconnect: () => true,
  })

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      send({
        symbol: 'tBTCUSD',
        prec: 'P0',
        freq: 'F0',
        channel: 'book',
        event: 'subscribe',
      })
    }
  }, [readyState, send])

  useEffect(() => {
    if (Array.isArray(data)) {
      const [_, payload] = data
      if (payload.length > 3) {
        dispatch(initOrdersSnapshot(payload))
      } else if (typeof payload?.[0] === 'number') {
        dispatch(updateOrder(payload))
      }
    }
  }, [data, orders, dispatch])
}

const separateColumns = (data = []) => {
  return data.reduce(
    (acc, cur) => {
      acc[cur[orderKeys.AMOUNT] > 0 ? 0 : 1].push(cur)
      return acc
    },
    [[], []],
  )
}

function App() {
  useOrderBookWs()

  // const orders = useSelector(({ orders }) => orders)

  // hacking the removal of  orders FYI 'Removed' orders are still
  // kept in the store
  const orders = useSelector(({ orders }) =>
    orders.filter(([_, count]) => count !== 0),
  )

  const [buys, sells] = separateColumns(orders)

  return (
    <div className={styles.app}>
      <div className={styles.orderBook}>
        <div className={styles.buyOrders}>
          <Header>
            <Cell>Count</Cell>
            <Cell>Amount</Cell>
            <Cell>Price</Cell>
          </Header>
          <Rows>
            {buys.map(([price, count, amount]) => (
              <Row key={price}>
                <Cell>{count}</Cell>
                <Cell>{amount}</Cell>
                <Cell>{price}</Cell>
              </Row>
            ))}
          </Rows>
        </div>
        <div className={styles.sellOrders}>
          <Header>
            <Cell>Count</Cell>
            <Cell>Amount</Cell>
            <Cell>Price</Cell>
          </Header>
          <Rows reverse>
            {sells.map(([price, count, amount]) => (
              <Row key={price}>
                <Cell>{count}</Cell>
                <Cell>{Math.abs(amount)}</Cell>
                <Cell>{price}</Cell>
              </Row>
            ))}
          </Rows>
        </div>
      </div>
    </div>
  )
}

export const Price = ({ value, ...props }) => {
  return value.toLocaleString()
}

export const Rows = ({ className, reverse, ...props }) => (
  <div
    className={clsx(className, styles.rows, {
      [styles.reversed]: reverse,
    })}
    {...props}
  />
)

export const Row = ({ className, ...props }) => (
  <div className={clsx(className, styles.row)} {...props} />
)

export const Cell = ({ className, ...props }) => (
  <div className={clsx(className, styles.cell)} {...props} />
)

export const Header = ({ className, ...props }) => (
  <div className={clsx(className, styles.header)} {...props} />
)

export default App
