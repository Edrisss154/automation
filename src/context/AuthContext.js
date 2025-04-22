import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, logout as apiLogout } from '../api/api';
import { v4 as uuidv4 } from 'uuid';
import { loginUrl, ssoClientId, ssoCodeUrl, ssoRedirectUrl, ssoBaseUrl } from "../components/config";
import axios from "axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const TOKEN_EXPIRATION_TIME = 2 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRoles, setUserRoles] = useState([]);

    const getSearchParams = () => {
        const search = window.location.search;
        const params = new URLSearchParams(search);
        return params;
    };

    const loginToCRM = async () => {
        try {
            console.log('CRM Username:', process.env.REACT_APP_CRM_USERNAME);
            console.log('CRM Password:', process.env.REACT_APP_CRM_PASSWORD);
            const formData = new FormData();
            formData.append('username', process.env.REACT_APP_CRM_USERNAME);
            formData.append('password', process.env.REACT_APP_CRM_PASSWORD);
            formData.append('lang', 'fa');
            formData.append('platform', 'web');
            formData.append('token_fb', 'null');
            formData.append('userAgentData', 'undefined');

            const response = await axios.post('https://task.satia.co/proxy.php/operator/login', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data && response.data.user && response.data.user.token) {
                localStorage.setItem('interorganizational_token', response.data.user.token);
                localStorage.setItem('interorganizational_user', JSON.stringify({
                    name: response.data.user.Name,
                    username: response.data.user.Username,
                    serial: response.data.user.Serial,
                }));
            } else {
                console.error('توکن CRM دریافت نشد');
                throw new Error('توکن CRM دریافت نشد');
            }
        } catch (error) {
            console.error('خطا در ورود به CRM:', error);
            throw error; // خطا را به لایه بالاتر ارسال می‌کنیم
        }
    };

    const login = async (mobile, password) => {
        try {
            const response = await apiLogin(mobile, password);
            const token = response.data.token;
            const roles = response.data.user.roles.map(role => role.name);
            const userId = response.data.user.id;
            const expirationTime = new Date().getTime() + TOKEN_EXPIRATION_TIME;

            localStorage.setItem('token', token);
            localStorage.setItem('roles', JSON.stringify(roles));
            localStorage.setItem('userId', userId);
            localStorage.setItem('tokenExpiry', expirationTime);

            setUserRoles(roles);
            setIsLoggedIn(true);

            // ورود خودکار به CRM
            await loginToCRM();
        } catch (error) {
            console.error("Login Failed:", error);
            throw new Error("Login failed");
        }
    };

    const logout = async (manual = false) => {
        try {
            await apiLogout();
            const ssoLogoutUrl = `https://oauth.satia.co/logout?client_id=${ssoClientId}&redirect_uri=${encodeURIComponent(ssoRedirectUrl)}&state=${uuidv4()}`;
            window.location.href = ssoLogoutUrl;
        } catch (error) {
            console.error("Logout Failed:", error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('roles');
            localStorage.removeItem('userId');
            localStorage.removeItem('tokenExpiry');
            localStorage.removeItem('interorganizational_token'); // حذف توکن CRM
            localStorage.removeItem('interorganizational_user'); // حذف اطلاعات کاربر CRM
            setIsLoggedIn(false);
            setUserRoles([]);

            if (manual) {
                alert("شما از سیستم خارج شدید!");
            }

            window.dispatchEvent(new Event("storage"));
        }
    };

    const redirectToSSO = () => {
        const state = uuidv4().toString();
        const query = new URLSearchParams({
            'client_id': ssoClientId,
            'redirect_uri': ssoRedirectUrl,
            'response_type': 'code',
            'scope': '',
            'state': state,
        });
        window.location.href = `${ssoCodeUrl}?${query.toString()}`;
    };

    useEffect(() => {
        const checkToken = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            const tokenExpiry = localStorage.getItem('tokenExpiry');
            const currentTime = new Date().getTime();

            if (token && tokenExpiry && currentTime < parseInt(tokenExpiry)) {
                setUserRoles(JSON.parse(localStorage.getItem('roles')) || []);
                setIsLoggedIn(true);

                // بررسی وجود توکن CRM و اتصال خودکار اگر وجود ندارد
                if (!localStorage.getItem('interorganizational_token')) {
                    try {
                        await loginToCRM();
                    } catch (error) {
                        console.error('اتصال خودکار به CRM ناموفق بود');
                    }
                }
                setLoading(false);
                return;
            }

            const params = getSearchParams();
            if (params.has('code') && params.has('state')) {
                try {
                    const formData = new FormData();
                    formData.append('code', params.get('code'));
                    formData.append('state', params.get('state'));
                    formData.append('redirect_uri', ssoRedirectUrl);

                    const response = await axios.post(`${loginUrl}`, formData, {
                        headers: { Accept: 'application/json' },
                    });

                    if (response.data.token) {
                        const { token, user } = response.data;
                        const expirationTime = new Date().getTime() + TOKEN_EXPIRATION_TIME;

                        localStorage.setItem('token', token);
                        localStorage.setItem('userId', user.id);
                        localStorage.setItem('roles', JSON.stringify(user.roles.map(r => r.name)));
                        localStorage.setItem('tokenExpiry', expirationTime);

                        setUserRoles(user.roles.map(r => r.name));
                        setIsLoggedIn(true);

                        // ورود خودکار به CRM پس از SSO
                        await loginToCRM();

                        window.history.replaceState({}, '', window.location.pathname);
                    }
                } catch (error) {
                    console.error("SSO Login failed:", error);
                    localStorage.clear();
                }
            }

            setLoading(false);
        };

        checkToken();

        const handleStorageChange = (event) => {
            if (event.key === "token" || event.key === "tokenExpiry") {
                checkToken();
            }
        };

        window.addEventListener("storage", handleStorageChange);

        const interval = setInterval(() => {
            if (new Date().getTime() >= parseInt(localStorage.getItem('tokenExpiry'))) {
                logout();
            }
        }, 60000);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, userRoles, login, logout, loading, redirectToSSO }}>
            {children}
        </AuthContext.Provider>
    );
};  