import React, { useEffect, useState } from "react";
import axios from "axios"; // اضافه کردن axios
import "./../styles/Dashboard.scss";

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [userName, setUserName] = useState(""); // متغیر برای ذخیره نام کاربری
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(""); // متغیر برای ذخیره سمت کاربر
    const adminMenuItems = [
        { title: "کارتابل دریافتی", description: "کارتابل دریافتی", icon: "/picture/icons/daryafti.svg", path: "/dept" },
        { title: "کارتابل ارسالی", description: "کارتابل ارسالی", icon: "/picture/icons/ersalli.svg", path: "/automation" },
        { title: "اتوماسیون", description: "اتوماسیون", icon: "/picture/icons/outomasion.svg", path: "/dept" },
        { title: "دبیرخانه", description: "دبیرخانه", icon: "/picture/icons/dabir.svg", path: "/dept" },
        { title: "فکس و ایمیل", description: "فکس و ایمیل", icon: "/picture/icons/emailfax.svg", path: "/dept" },
    ];

    const editorMenuItems = [
        { title: "کارتابل دریافتی", description: "کارتابل دریافتی", icon: "/picture/icons/daryafti.svg", path: "/dept" },
        { title: "اتوماسیون", description: "اتوماسیون", icon: "/picture/icons/outomasion.svg", path: "/dept" },
        { title: "دبیرخانه", description: "دبیرخانه", icon: "/picture/icons/dabir.svg", path: "/dept" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get("http://185.143.206.102:8080/api/dashboard", {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setUserName(response.data.user.name);
                setUserRole(response.data.user.roles[0]);
                setDashboardData(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="loading">در حال بارگذاری...</div>;
    }

    if (error) {
        return <div className="error">خطا: {error}</div>;
    }

    const menuItems = userRole === "Admin" ? adminMenuItems : editorMenuItems;

    return (
        <div className="dashboard">
            <div className="user-input">
                <div className="user-info">
                    <img src="/picture/icons/semat.svg" alt="User Icon" className="user-icon"/>
                    <label htmlFor="userRole">سمت:</label>
                    <select
                        id="userRole"
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value)}
                    >
                        {dashboardData.user.roles.map((role, index) => (
                            <option key={index} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="header">
                <h2>داشبورد</h2>
            </div>
            <div className="tabs">
                {menuItems.map((item, index) => (
                    <div key={index} className="tab">
                        <div className="tab-header">
                            <img src={item.icon} alt={item.title} />
                            <h3>{item.title}</h3>
                        </div>
                        <div className="tab-body">
                            {dashboardData && dashboardData.cards && dashboardData.cards[index] && (
                                <ul>
                                    {dashboardData.cards[index].items.map((cardItem, idx) => (
                                        <li key={idx}>
                                            {cardItem.label}: {cardItem.value}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
