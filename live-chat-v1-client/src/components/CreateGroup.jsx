import React, { useState } from "react";
import {
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import DoneOutlineIcon from "@mui/icons-material/DoneOutline";
import "./styles.css";
import { useDispatch, useSelector } from "react-redux";
import API from "./services/api";
import { useNavigate } from "react-router-dom";
import { refreshSidebarFun } from "../features/refreshSidebar";
import Toaster from "../components/Toaster";

const CreateGroup = () => {
  const theme = useSelector((state) => state.themeKey);
  const [groupName, setGroupName] = useState("");
  const [open, setOpen] = useState(false);
  const [groupStatus, setGroupStatus] = useState(null);
  const userData = JSON.parse(localStorage.getItem("live-chat-userData"));
  const nav = useNavigate();
  const dispatch = useDispatch();

  if (!userData) {
    console.log("User not Authenticated");
    nav("/");
  }

  const handleCreateGroup = () => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    };

    API.post(
      "/api/v1/chats/createGroup",
      {
        name: groupName,
        users: userData._id,
      },
      config
    )
      .then((response) => {
        const createdGroup = response.data;
        dispatch(refreshSidebarFun());
        setTimeout(() => {
          nav(`/app/chats/${createdGroup._id}/${createdGroup.chatName}`);
        }, 500);
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "Failed to create group";
        setGroupStatus({
          msg: errorMessage,
          key: Math.random(),
        });
      })
      .finally(() => {
        setOpen(false);
      });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Do you Want To Create a Group Named "{groupName}" ?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You will be the admin of this group. Others can join using the group
            name.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateGroup} color="primary" autoFocus>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <div className="create-group-container">
        <div className={theme ? "" : "dark"}>
          <input
            placeholder="Enter Group Name"
            className={"cg-input search-bar" + (theme ? "" : " dark")}
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value);
              setGroupStatus(null);
            }}
          />
          <IconButton
            className="send-icon"
            onClick={() => {
              if (!groupName.trim()) {
                setGroupStatus({
                  msg: "Please enter a group name",
                  key: Math.random(),
                });
                return;
              }
              setOpen(true);
            }}
          >
            <DoneOutlineIcon />
          </IconButton>
        </div>
      </div>

      {groupStatus && (
        <Toaster
          key={groupStatus.key}
          message={groupStatus.msg}
          type={groupStatus.msg.includes("successfully") ? "success" : "error"}
        />
      )}
    </>
  );
};

export default CreateGroup;
