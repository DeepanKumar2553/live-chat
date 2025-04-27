import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";
import { Backdrop, CircularProgress, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Img from "../assests/live-chat_512px.png";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { refreshSidebarFun } from "../features/refreshSidebar";
import { setNormalRefresh } from "../features/normalRefresh";

const CreateContact = () => {
  const theme = useSelector((state) => state.themeKey);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();
  const userData = JSON.parse(localStorage.getItem("live-chat-userData"));

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("live-chat-userData"));
    if (!user) {
      nav("/");
    } else {
      setIsAuthenticated(true);
    }
  }, [nav]);

  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData?.token}`,
      },
    };

    axios
      .get("http://localhost:5000/api/v1/users/fetchUsers", config)
      .then((data) => {
        setUsers(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(
          "Error fetching users",
          err.response ? err.response.data : err
        );
      });
  }, [userData?.token]);

  const filteredUsers = useMemo(() => {
    const searchTerm = searchQuery.toLowerCase().trim();
    if (!searchTerm) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm) &&
        user._id !== userData?._id // Exclude current user
    );
  }, [users, searchQuery, userData?._id]);

  if (!isAuthenticated) return null;

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
              <p>Available Users</p>
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
            {filteredUsers.length === 0 ? (
              <div
                className={
                  "cc-contacts chatArea-header conversation-items" +
                  (theme ? "" : " dark")
                }
              >
                <p>No users found</p>
              </div>
            ) : (
              filteredUsers.map((user, index) => (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  key={index}
                  onClick={async () => {
                    dispatch(setNormalRefresh(true));
                    try {
                      const config = {
                        headers: {
                          Authorization: `Bearer ${userData.token}`,
                        },
                      };
                      await axios
                        .post(
                          "http://localhost:5000/api/v1/chats/",
                          { userId: user._id },
                          config
                        )
                        .then((res) => {
                          dispatch(refreshSidebarFun());
                          nav(
                            `/app/chats/${res.data._id}/${res.data.users[1].name}`
                          );
                        });
                    } catch (err) {
                      console.log("Error creating chat", err);
                    }
                  }}
                  className={
                    "cc-contacts chatArea-header conversation-items" +
                    (theme ? "" : " dark")
                  }
                >
                  <div>
                    <div
                      className={"conversation-icon" + (theme ? "" : " dark-2")}
                    >
                      {user.name[0]}
                    </div>
                  </div>
                  <div>
                    <div className="ca-name">{user.name || "Unknown User"}</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default CreateContact;
