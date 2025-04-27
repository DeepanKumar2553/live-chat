import React, { useState } from "react";
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
import axios from "axios";
import Toaster from "../components/Toaster";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [signInStatus, setSignInStatus] = React.useState("");

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const signHandler = async () => {
    setLoading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const response = await axios.post(
        "http://localhost:5000/api/v1/users/signup",
        data,
        config
      );

      localStorage.setItem("live-chat-userData", JSON.stringify(response.data));
      setLoading(false);
      setSignInStatus({ msg: "Success", key: Math.random() });
      navigate("/app/welcome");
    } catch (error) {
      if (error.response.status === 400) {
        setSignInStatus({
          msg: error.response.data.message,
          key: Math.random(),
        });
      }
      setLoading(false);
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
          <h1>SignUp For New Account</h1>
          <TextField
            onChange={changeHandler}
            id="name-input"
            type="text"
            label="UserName"
            variant="standard"
            name="name"
            inputProps={{
              style: {
                paddingRight: "32px",
              },
            }}
          />
          <TextField
            id="gmail-input"
            type="email"
            onChange={changeHandler}
            label="Gmail"
            variant="standard"
            name="email"
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
            onClick={signHandler}
            variant="contained"
            className="login-btn"
            style={{ backgroundColor: "#20fcd0", color: "#fff" }}
          >
            SignUp
          </Button>
          <p>
            Already have an Account ?
            <span
              className="hyper"
              onClick={() => {
                navigate("/");
              }}
            >
              Login
            </span>
          </p>
        </div>
      </div>
      {signInStatus ? (
        <Toaster key={signInStatus.key} message={signInStatus.msg} />
      ) : null}
    </>
  );
};

export default SignUp;
