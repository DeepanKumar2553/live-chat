import React from "react";
import "./styles.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const ConversationItems = ({ props }) => {
  const navigate = useNavigate();
  const theme = useSelector((state) => state.themeKey);

  if (!props || !props.users) {
    return null;
  }

  const chatId = props._id;
  const userData = JSON.parse(localStorage.getItem("live-chat-userData"));
  const chatName = props.isGroupChat
    ? props.chatName?.trim() || "Group Chat"
    : props.users?.find((user) => user._id !== userData._id)?.name || "Unknown";
  const lastMessage = props.latestMessage?.content || "No messages yet";
  const timeStamp = props.latestMessage?.createdAt
    ? new Date(props.latestMessage.createdAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "No Time";

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={"conversation-items" + (theme ? "" : " dark")}
      onClick={() => {
        navigate(`chats/${chatId}/${chatName}`);
      }}
    >
      <p className={"conversation-icon" + (theme ? "" : " dark-2")}>
        {chatName[0]}
      </p>
      <p className={"conversation-name" + (theme ? "" : " dark-name")}>
        {chatName}
      </p>
      <p className={"conversation-message" + (theme ? "" : " dark-name")}>
        {lastMessage}
      </p>
      <p className={"conversation-time" + (theme ? "" : " dark-name")}>
        {timeStamp}
      </p>
    </motion.div>
  );
};

export default ConversationItems;
