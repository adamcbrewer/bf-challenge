import { configureStore, createSlice } from '@reduxjs/toolkit'
import { orderKeys } from './config'

const ordersSlice = createSlice({
  name: 'orders',
  initialState: [],
  reducers: {
    initOrdersSnapshot: (state, action) => {
      return action.payload
    },
    updateOrder(state, action) {
      const { payload: order } = action

      const index = state.findIndex(
        ([price]) => price === order[orderKeys.PRICE],
      )

      if (index === -1) {
        state.push(order)
      } else {
        // This throws an error about updating state which I couldn't figure
        // out and ran out of time trying to get to the bottom of
        // if (order[orderKeys.COUNT] === 0) {
        //   state.splice(index, 1)
        // } else {
        //   state.splice(index, 1, order)
        // }

        state.splice(index, 1, order)
      }
    },
  },
})

export const { initOrdersSnapshot, updateOrder } = ordersSlice.actions

export const store = configureStore({
  reducer: {
    orders: ordersSlice.reducer,
  },
})
