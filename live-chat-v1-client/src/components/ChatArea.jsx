import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";
// import { convoArray } from './SideBar'
import SendIcon from "@mui/icons-material/Send";
import { IconButton } from "@mui/material";
import OtherMessage from "./OtherMessage";
import MyMessage from "./MyMessage";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

import { refreshSidebarFun } from "../features/refreshSidebar";
import io from "socket.io-client";
import Toaster from "./Toaster";
import DeleteIcon from "@mui/icons-material/Delete";

const ChatArea = () => {
  const theme = useSelector((state) => state.themeKey);
  const { chatId, name } = useParams();
  // const normalRefreshKey = useSelector((state) => state.normalRefreshKey)
  const userData = JSON.parse(localStorage.getItem("live-chat-userData"));
  const userDataId = userData?._id;
  const token = useMemo(() => userData?.token, [userData?.token]);
  const dispatch = useDispatch();
  const [allMessages, setAllMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const refreshKey = useSelector((state) => state.refreshKey);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [exitStatus, setExitStatus] = useState(null);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [isGroupAdmin, setIsGroupAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const nav = useNavigate();

  const socket = useMemo(
    () =>
      io("http://localhost:5000", {
        withCredentials: true,
        autoConnect: true,
      }),
    []
  );

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("live-chat-userData"));
    if (!user) {
      nav("/");
    } else {
      setIsAuthenticated(true);
    }
  }, [nav]);

  useEffect(() => {
    try {
      console.log("messages refreshed");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      axios
        .get("http://localhost:5000/api/v1/message/" + chatId, config)
        .then(({ data }) => {
          setAllMessages(data);
        });
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [chatId, token, refreshKey]);

  useEffect(() => {
    if (!userData) return;
    socket.emit("setup", { _id: userData._id });

    socket.emit("join chat", chatId);

    socket.on("message received", (newMessage) => {
      setAllMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("message received");
      socket.emit("leave chat", chatId);
    };
  }, [chatId, userData, socket]);

  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const response = await axios.get(
          `http://localhost:5000/api/v1/chats/${chatId}`,
          config
        );
        console.log("datas", response.data);
        setIsGroupChat(response.data.isGroupChat);
        setIsGroupAdmin(response.data.groupAdmin === userDataId);
      } catch (error) {
        dispatch(refreshSidebarFun());
        nav("/app");
        alert("The Chat has been deleted");
      }
    };
    if (chatId) fetchChatDetails();
  }, [chatId, token, userDataId, nav, dispatch]);

  const sendMessage = () => {
    if (!messageContent.trim()) return;

    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    };

    axios
      .post(
        "http://localhost:5000/api/v1/message",
        {
          content: messageContent,
          chatId: chatId,
        },
        config
      )
      .then(({ data }) => {
        console.log("Message sent:", data);
        setMessageContent("");
        dispatch(refreshSidebarFun());
      })
      .catch((error) => {
        dispatch(refreshSidebarFun());
        nav("/app");
        alert("The Chat has been deleted");
        console.error("Error sending message:", error);
      });
  };

  const lastOtherMessage = allMessages
    .filter((msg) => msg.sender._id !== userData?._id)
    .slice(-1)[0];

  const handleExitGroup = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData?.token}`,
        },
      };

      await axios.post(
        "http://localhost:5000/api/v1/chats/groupExit",
        { chatId },
        config
      );

      dispatch(refreshSidebarFun());
      nav("/app/welcome");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to exit group";
      setExitStatus({
        msg: errorMessage,
        key: Math.random(),
        type: "error",
      });
    } finally {
      setExitDialogOpen(false);
    }
  };

  const ExitConfirmationDialog = () => (
    <Dialog open={exitDialogOpen} onClose={() => setExitDialogOpen(false)}>
      <DialogTitle>Exit Group Confirmation</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to exit this group?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setExitDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleExitGroup} color="primary" autoFocus>
          Confirm Exit
        </Button>
      </DialogActions>
    </Dialog>
  );

  const handleDeleteGroup = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${userData?.token}` },
      };

      await axios.delete(
        `http://localhost:5000/api/v1/chats/${chatId}`,
        config
      );

      dispatch(refreshSidebarFun());
      nav("/app/welcome");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete group";
      setDeleteStatus({
        msg: errorMessage,
        key: Math.random(),
        type: "error",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const DeleteConfirmationDialog = () => (
    <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
      <DialogTitle>Delete Group Confirmation</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to permanently delete this group and all its
          messages?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleDeleteGroup} color="secondary" autoFocus>
          Confirm Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (!isAuthenticated) return null;

  return (
    <div className="chatArea-container">
      {exitStatus && (
        <Toaster
          key={exitStatus.key}
          message={exitStatus.msg}
          type={exitStatus.type}
        />
      )}
      {deleteStatus && (
        <Toaster
          key={deleteStatus.key}
          message={deleteStatus.msg}
          type={deleteStatus.type}
        />
      )}
      <div
        className={
          "chatArea-header conversation-items" + (theme ? "" : " dark")
        }
      >
        <div>
          <div className={"conversation-icon" + (theme ? "" : " dark-2")}>
            {name[0]}
          </div>
        </div>
        <div>
          <div className="ca-name">{name}</div>
          <div className="ca-time">
            {lastOtherMessage
              ? new Date(lastOtherMessage.createdAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
              : "No messages from them"}
          </div>
        </div>
        <div>
          <div>
            {isGroupChat && (
              <>
                {isGroupAdmin ? (
                  <IconButton onClick={() => setDeleteDialogOpen(true)}>
                    <DeleteIcon className={theme ? "" : "dark"} />
                  </IconButton>
                ) : (
                  <IconButton onClick={() => setExitDialogOpen(true)}>
                    <ExitToAppIcon className={theme ? "" : "dark"} />
                  </IconButton>
                )}
              </>
            )}
          </div>
          <ExitConfirmationDialog />
          <DeleteConfirmationDialog />
        </div>
      </div>
      <div className={"chatArea-body" + (theme ? "" : " dark")}>
        {allMessages
          .slice(0)
          .reverse()
          .map((message, index) => {
            const sender = message.sender;
            const selfId = userData._id;
            if (sender._id === selfId) {
              return <MyMessage props={message} key={index} />;
            } else {
              return <OtherMessage props={message} key={index} />;
            }
          })}
      </div>
      <div className={"chatArea-keyboard sb-search" + (theme ? "" : " dark")}>
        <input
          placeholder="Type a Message"
          className={"ca-input search-bar" + (theme ? "" : " dark")}
          value={messageContent}
          onChange={(e) => {
            setMessageContent(e.target.value);
          }}
          onKeyDown={(event) => {
            if (event.code === "Enter") {
              setMessageContent("");
              sendMessage();
            }
          }}
        ></input>
        <IconButton className="send-icon">
          <SendIcon
            onClick={() => {
              sendMessage();
            }}
          />
        </IconButton>
      </div>
    </div>
  );
};

export default ChatArea;
