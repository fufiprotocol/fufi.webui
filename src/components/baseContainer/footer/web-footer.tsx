import React, {memo} from 'react'
import header_logo from "@/assets/images/web/header_logo.png";
import {Link} from "react-router-dom";
import Icon from "@/components/Icon";
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IWebFooterProps {
}

const WebFooter: React.FunctionComponent<IWebFooterProps> = (props) => {

  return (
      <footer className="web-footer flex-row-between-center">
          <div>
              <Link to="/">
                  <Icon src={header_logo} height="32px"></Icon>
              </Link>
              <p className='txt'>AMAX区块链浏览器</p>
          </div>
            <div className='flex-row-center-end fs-16 '>
                <a href='https://www.test.com' target='_blank'
                   rel='noreferrer'>官方网站</a>
                <a href='https://www.test.com' target='_blank'
                   rel='noreferrer' className='m-l-40'>联系我们</a>
                <a href='https://t.me/' target='_blank'
                   rel='noreferrer' className='m-l-40'>电报群</a>
            </div>
      </footer>
  )
}

export default memo(WebFooter)
