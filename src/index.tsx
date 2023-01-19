import React from 'react'
import ReactDOM from 'react-dom'
import '@/style/style.scss'
import '@/locale'
import App from './views/App'
import reportWebVitals from './reportWebVitals'
import Providers from '@/Providers'

ReactDOM.render(
    <Providers>
        <App/>
    </Providers>,
    document.getElementById('root')
)

reportWebVitals()
