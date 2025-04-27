import React from 'react'
// import { convoArray } from './SideBar'
import './styles.css'
import { useSelector } from 'react-redux'

const OtherMessage = React.memo((props) => {
  const theme = useSelector((state) => state.themeKey)
  console.log("other", props)
  const timeStamp = props.props?.createdAt 
  ? new Date(props.props.createdAt).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true, 
    })
  : 'No Time'

  return (
    <div className="other-message-component">
      <p className={"other-message-icon conversation-icon" + (theme ? "" : " dark-2")}>{props.props.sender.name[0]}</p>
      <div className={theme ? "" : " dark-2"}>
        {props.props?.chat?.isGroupChat && (
          <div className={"convo-name"+(theme?"":" dark-2")}>{props.props.sender.name}</div>
        )}
        <p className="other-message-messsages">{props.props.content}</p>
        <p className={"conversation-time"+(theme?"":" dark-2")}>{timeStamp}</p>
      </div>
    </div>
  )
})

export default OtherMessage