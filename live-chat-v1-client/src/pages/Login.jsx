import React, { useEffect, useState } from "react";
import Img from "../assests/live-chat_512px.png";
import "../components/styles.css";
import {
  Backdrop,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Toaster from "../components/Toaster";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ name: "", password: "" });
  const [logInStatus, setLogInStatus] = React.useState("");
  const [showPassword, setShowPassword] = useState(false);
  const userData = JSON.parse(localStorage.getItem("live-chat-userData"));

  useEffect(() => {
    if (userData) {
      console.log("User Authenticated");
      navigate("/app/welcome");
    }
  });

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const loginHandler = async () => {
    setLoading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const response = await API.post("/api/v1/users/login", data, config);

      setLoading(false);
      setLogInStatus({ msg: "Success", key: Math.random() });
      localStorage.setItem("live-chat-userData", JSON.stringify(response.data));
      navigate("app/welcome");
    } catch (error) {
      setLogInStatus({
        msg: error.response.data.message,
        key: Math.random(),
      });
      console.error(error.response?.data || error.message);
    }
    setLoading(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="secondary" />
      </Backdrop>
      <div className="login-container">
        <div className="login-image-container">
          <img src={Img} width="200px" loading="lazy" alt="img" />
        </div>
        <div className="login-details">
          <h1>Login To Your Account</h1>
          <TextField
            id="name-input"
            label="UserName"
            type="text"
            variant="standard"
            name="name"
            onChange={changeHandler}
            inputProps={{
              style: {
                paddingRight: "32px",
              },
            }}
          />
          <TextField
            id="password-input"
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="standard"
            name="password"
            onChange={changeHandler}
            inputProps={{
              "data-ms-hide": "true",
              style: {
                paddingRight: "32px",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position="end"
                  sx={{
                    marginRight: "0px",
                    position: "absolute",
                    right: "0",
                  }}
                >
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                    size="small"
                    sx={{
                      padding: "4px",
                      "&:hover": { background: "transparent" },
                    }}
                  >
                    {showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                pr: "0",
              },
            }}
          />
          <Button
            variant="contained"
            className="login-btn"
            style={{ backgroundColor: "#20fcd0", color: "#fff" }}
            onClick={loginHandler}
          >
            Login
          </Button>
          <p>
            Doesn't have an Account ?
            <span
              className="hyper"
              onClick={() => {
                navigate("/signup");
              }}
            >
              SignUp
            </span>
          </p>
        </div>
      </div>
      {logInStatus ? (
        <Toaster key={logInStatus.key} message={logInStatus.msg} />
      ) : null}
    </>
  );
};

export default Login;
