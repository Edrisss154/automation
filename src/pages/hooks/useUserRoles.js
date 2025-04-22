import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserById } from '../../api/api';

const useUserRoles = () => {
    const [userRoles, setUserRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [signatoryId, setSignatoryId] = useState('');
    const navigate = useNavigate();




    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                const signatoryIdFromLocalStorage = localStorage.getItem('userId');
                if (!signatoryIdFromLocalStorage) {
                    //alert("شناسه کاربر معتبر نیست. لطفاً دوباره وارد شوید.");
                    navigate('/login');
                    return;
                }
                setSignatoryId(signatoryIdFromLocalStorage);

                const response = await getUserById(signatoryIdFromLocalStorage);
                if (response && response.roles) {
                    console.log("Roles from API:", response.roles);
                    setUserRoles(response.roles);
                    setSelectedRole(response.roles[0]?.id || '');
                } else {
                    console.error("Unexpected response format:", response);
                    //alert("خطا در دریافت سمت‌های کاربر. لطفاً دوباره تلاش کنید.");
                }
            } catch (error) {
                console.error("Error fetching roles from API:", error);
                //alert("خطا در دریافت سمت‌های کاربر. لطفاً دوباره تلاش کنید.");
            }
        };

        fetchUserRoles();
    }, [navigate]);

    return { userRoles, selectedRole, setSelectedRole, signatoryId };
};

export default useUserRoles;