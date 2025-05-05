import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";
import { Backdrop, CircularProgress, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Img from "../assests/live-chat_512px.png";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { refreshSidebarFun } from "../features/refreshSidebar";
import API from "./services/api";
import { setNormalRefresh } from "../features/normalRefresh";

const AvailableGroups = () => {
  const theme = useSelector((state) => state.themeKey);
  const dispatch = useDispatch();
  const [groups, SetGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const userData = JSON.parse(localStorage.getItem("live-chat-userData"));
  const nav = useNavigate();
  if (!userData) {
    console.log("User not Authenticated");
    nav("/");
  }

  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    };

    API.get("/api/v1/chats/fetchGroups", config).then((response) => {
      SetGroups(response.data);
      setLoading(false);
    });
  }, [userData.token]);

  const filteredGroups = useMemo(() => {
    const searchTerm = searchQuery.toLowerCase().trim();
    if (!searchTerm) return groups;

    return groups.filter((group) =>
      group.chatName.toLowerCase().includes(searchTerm)
    );
  }, [groups, searchQuery]);

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="secondary" />
      </Backdrop>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ ease: "anticipate", duration: 0.3 }}
          className="create-contact-container"
        >
          <div className={"cc-header sb-header" + (theme ? "" : " dark")}>
            <div className={theme ? "" : "dark"}>
              <img src={Img} width="30px" loading="lazy" alt="icon"></img>
              <p>Available Groups</p>
            </div>
          </div>
          <div className={"sb-search" + (theme ? "" : " dark")}>
            <IconButton>
              <SearchIcon className={theme ? "" : " dark"} />
            </IconButton>
            <input
              placeholder="search"
              className={"cc-search search-bar" + (theme ? "" : " dark")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            ></input>
          </div>
          <div className="cc-body">
            {filteredGroups.length === 0 ? (
              <div
                className={
                  "cc-contacts chatArea-header conversation-items" +
                  (theme ? "" : " dark")
                }
              >
                <p>No groups found</p>
              </div>
            ) : (
              filteredGroups.map((group, index) => (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={
                    "cc-contacts chatArea-header conversation-items" +
                    (theme ? "" : " dark")
                  }
                  key={index}
                  onClick={() => {
                    dispatch(setNormalRefresh(true));
                    const config = {
                      headers: {
                        Authorization: `Bearer ${userData.token}`,
                      },
                    };

                    axios
                      .put(
                        `http://localhost:5000/api/v1/chats/joinGroup/${group._id}`,
                        {},
                        config
                      )
                      .then((response) => {
                        dispatch(refreshSidebarFun());
                        nav(`/app/chats/${group._id}/${group.chatName}`);
                      })
                      .catch((error) => {
                        if (error.response?.data?.code === "ALREADY_MEMBER") {
                          nav(`/app/chat/${group._id}`);
                        } else {
                          console.error("Error joining group:", error);
                        }
                      });
                  }}
                >
                  <p className={"conversation-icon" + (theme ? "" : " dark")}>
                    {group.chatName[0]}
                  </p>
                  <p className={"ca-name" + (theme ? "" : " dark")}>
                    {group.chatName}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default AvailableGroups;
