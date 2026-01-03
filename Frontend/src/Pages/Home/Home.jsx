import React from "react";
import Header from "../../Components/Header";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {logoutUser} from "../../Redux/Slice"
const Home=()=>{
    const dispatch = useDispatch();
    const navigate = useNavigate(); 
         const handleLogout = () => {
        dispatch(logoutUser());  // Dispatch Redux logout action
        localStorage.removeItem("token"); // Clear token from storage
        localStorage.removeItem("role"); // Clear role from storage
        navigate("/"); // Redirect to Login Page
      };
    return(
        <>
        <Header/>
                    <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded transition duration-200"
                onClick={handleLogout}
              >
                Log out
              </button>
        </>
    )
};
export default Home;