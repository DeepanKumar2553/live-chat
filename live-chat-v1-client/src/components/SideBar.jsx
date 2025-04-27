import "./styles.css";
import {
  Backdrop,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import NightlightIcon from "@mui/icons-material/Nightlight";
import LightModeIcon from "@mui/icons-material/LightMode";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import ConversationItems from "./ConversationItems";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../features/themeSlice";
import { setNormalRefresh } from "../features/normalRefresh";
import axios from "axios";
import { io } from "socket.io-client";

// export const convoArray=[
//       { name: "Test1", lastMessage: "lastMessage", timeStamp: "today" },
//       { name: "Test2", lastMessage: "lastMessage2", timeStamp: "yesterday" },
//       { name: "Test3", lastMessage: "lastMessage3", timeStamp: "2 days ago" },
//     ]

const SideBar = () => {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.themeKey);
  const refreshKey = useSelector((state) => state.refreshKey);
  const normalRefreshKey = useSelector((state) => state.normalRefreshKey);
  const userData = JSON.parse(localStorage.getItem("live-chat-userData"));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logout, setLogout] = useState(null);
  const open = Boolean(logout);

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
      navigate("/");
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData?.token}`,
      },
    };

    axios
      .get("http://localhost:5000/api/v1/chats/", config)
      .then((response) => {
        setConversations(response.data);
        dispatch(setNormalRefresh(false));
      })
      .catch((err) => {
        console.log("Error fetching conversations", err);
      });
  }, [refreshKey, userData?.token, dispatch]);

  useEffect(() => {
    if (!userData) return;

    socket.emit("setup", { _id: userData?._id });

    const handleNewConversation = (newChat) => {
      setConversations((prev) => {
        const exists = prev.some((chat) => chat._id === newChat._id);
        return exists ? prev : [newChat, ...prev];
      });
    };

    const handleConversationUpdate = (updatedChat) => {
      setConversations((prev) =>
        prev.map((chat) => (chat._id === updatedChat._id ? updatedChat : chat))
      );
    };

    socket.on("new conversation", handleNewConversation);
    socket.on("conversation updated", handleConversationUpdate);

    return () => {
      socket.off("new conversation", handleNewConversation);
      socket.off("conversation updated", handleConversationUpdate);
      socket.emit("leave setup", userData?._id);
    };
  }, [socket, userData, conversations]);

  const filteredConversations = useMemo(() => {
    const searchTerm = searchQuery.toLowerCase().trim();

    if (!searchTerm) return conversations;

    return conversations.filter((conversation) => {
      if (conversation.isGroupChat) {
        return conversation.chatName.toLowerCase().includes(searchTerm);
      }

      const oppositeUser = conversation.users.find(
        (user) => user._id !== userData?._id
      );

      return oppositeUser?.name.toLowerCase().includes(searchTerm);
    });
  }, [conversations, searchQuery, userData?._id]);

  const handleClick = (event) => {
    setLogout(event.currentTarget);
  };

  const handleClose = () => {
    setLogout(null);
  };

  const handleLogout = () => {
    document.body.classList.add("react-logout");

    localStorage.removeItem("live-chat-userData");

    setTimeout(() => {
      window.location.href = "/";
    }, 10);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={normalRefreshKey}
      >
        <CircularProgress color="secondary" />
      </Backdrop>
      <div className="sidebar-container">
        <div className={"sb-header" + (theme ? "" : " dark")}>
          <div>
            <IconButton>
              <AccountCircleIcon
                className={theme ? "" : "dark"}
                onClick={handleClick}
              />
            </IconButton>
            <Menu
              className="logout-menu"
              anchorEl={logout}
              open={open}
              onClose={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </div>
          <div>
            <IconButton
              onClick={() => {
                navigate("contacts");
              }}
            >
              <PersonAddIcon className={theme ? "" : "dark"} />
            </IconButton>
            <IconButton
              onClick={() => {
                navigate("groups");
              }}
            >
              <GroupAddIcon className={theme ? "" : "dark"} />
            </IconButton>
            <IconButton
              onClick={() => {
                navigate("create-group");
              }}
            >
              <AddCircleOutlineIcon className={theme ? "" : "dark"} />
            </IconButton>
            <IconButton
              onClick={() => {
                dispatch(toggleTheme());
              }}
            >
              {theme ? (
                <NightlightIcon className={theme ? "" : "dark"} />
              ) : (
                <LightModeIcon className={theme ? "" : "dark"} />
              )}
            </IconButton>
          </div>
        </div>
        <div className={"sb-search" + (theme ? "" : " dark")}>
          <IconButton>
            <SearchIcon className={theme ? "" : "dark"} />
          </IconButton>
          <input
            placeholder="search"
            className={"search-bar" + (theme ? "" : " dark")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          ></input>
        </div>
        <div className={"sb-conversations" + (theme ? "" : " dark")}>
          {filteredConversations.length === 0 ? (
            <div className="no-conversations-message">
              <p>No conversations found.</p>
              <p>Start a new chat!</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItems props={conversation} key={conversation._id} />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default SideBar;
