import React from "react";
// import { convoArray } from './SideBar'
import "./styles.css";

const MyMessage = React.memo((props) => {
  console.log(props);
  const timeStamp = props.props?.createdAt
    ? new Date(props.props.createdAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "No Time";

  return (
    <div className="my-message-component">
      <div>
        <p className="my-message-messages">{props.props.content}</p>
        <p className="conversation-time">{timeStamp}</p>
      </div>
    </div>
  );
});

export default MyMessage;
