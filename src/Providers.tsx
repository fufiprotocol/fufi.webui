import React, { FC } from 'react'
import { Provider } from 'react-redux'
import store from '@/state'
const Providers: FC = ({ children }) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}

export default Providers
