import React from "react";
import Img from "../assests/live-chat_512px.png";

const WelcomePage = () => {
  return (
    <div className="welcome-page-container">
      <img src={Img} width="200px" loading="lazy" alt="img" />
      <p>
        "Welcome to our live chat! We're here to help—let's get the conversation
        started!"
      </p>
    </div>
  );
};

export default WelcomePage;
