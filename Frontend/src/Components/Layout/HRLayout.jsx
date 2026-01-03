import Sidebar from "../HRSidebar";
import Header from "../Header";
import { Outlet } from "react-router-dom";

const HrLayoutDashboard = () => {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
export default HrLayoutDashboard;