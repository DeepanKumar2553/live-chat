import "./styles.css";
import SideBar from "./SideBar";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useResponsiveRoute } from "../hooks/UseResponsiveRoute";

const MainContainer = () => {
  const theme = useSelector((state) => state.themeKey);
  const navigate = useNavigate();
  const { isAllowedRoute, isMobile } = useResponsiveRoute();
  const showSidebar = !isMobile || (isMobile && isAllowedRoute);

  useEffect(() => {
    const userData = localStorage.getItem("live-chat-userData");
    if (!userData) {
      navigate("/");
      return;
    }
  }, [navigate]);

  return (
    <div className={"main-container" + (theme ? "" : " dark-2")}>
      {showSidebar && <SideBar />}
      <Outlet />
    </div>
  );
};

export default MainContainer;
