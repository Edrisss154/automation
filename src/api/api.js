import axios from 'axios';

const apiBaseURL = 'https://automationapi.satia.co';

const instance = axios.create({
    baseURL: apiBaseURL,
});



const login = (mobile, password) => {
    const data = new URLSearchParams();
    data.append('mobile', mobile);
    data.append('password', password);

    return axios.post(`${apiBaseURL}/api/login`, data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }).then(response => {
        return response;
    });
};

const getServerURL = () => {
    return apiBaseURL;
};

const logout = () => {
    const token = localStorage.getItem('token');
    return instance.post(`/api/logout?token=${token}`);
};

const getUsersLetterable = () => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/users?token=${token}`);
};

const getLetters = (page, referralType = 'none') => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/letters?token=${token}`, {
        params: {
            page: page,
            referral_type: referralType
        }
    }).then(response => {
        //console.log("Response from getLetters API:", response.data);
        if (Array.isArray(response.data.data)) {
            return {
                data: response.data.data,
                total_pages: response.data.last_page
            };
        } else {
            throw new Error("Unexpected response format");
        }
    });
};

const kartablsearch = (page, searchParams = {}) => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/letters?token=${token}`, {
        params: {
            page: page,
            ...searchParams
        }
    }).then(response => {
        //console.log("Response from getLetters API:", response.data);
        if (Array.isArray(response.data.data)) {
            return {
                data: response.data.data,
                total_pages: response.data.last_page
            };
        } else {
            throw new Error("Unexpected response format");
        }
    });
};

const kartablsearchmymessage = (page, referralType, searchParams = {}) => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/letters?token=${token}`, {
        params: {
            page: page,
            referral_type: referralType,
            ...searchParams
        }
    }).then(response => {
        //console.log("Response from getLetters API:", response.data);
        if (Array.isArray(response.data.data)) {
            return {
                data: response.data.data,
                total_pages: response.data.last_page
            };
        } else {
            throw new Error("Unexpected response format");
        }
    });
};

const getLettersreceived = (page, referralType = 'received') => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/letters?token=${token}`, {
        params: {
            page: page,
            referral_type: referralType
        }
    }).then(response => {
        //console.log("Response from getLetters API:", response.data);
        if (Array.isArray(response.data.data)) {
            return {
                data: response.data.data,
                total_pages: response.data.last_page
            };
        } else {
            throw new Error("Unexpected response format");
        }
    });
};
const getLettersCC = (page, referralType = 'cc') => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/letters?token=${token}`, {
        params: {
            page: page,
            referral_type: referralType
        }
    }).then(response => {
        //console.log("Response from getLetters API:", response.data);
        if (Array.isArray(response.data.data)) {
            return {
                data: response.data.data,
                total_pages: response.data.last_page
            };
        } else {
            throw new Error("Unexpected response format");
        }
    });
};
const getLetterssend = (page, referralType = 'sent') => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/letters?token=${token}`, {
        params: {
            page: page,
            referral_type: referralType
        }
    }).then(response => {
        //console.log("Response from getLetters API:", response.data);
        if (Array.isArray(response.data.data)) {
            return {
                data: response.data.data,
                total_pages: response.data.last_page
            };
        } else {
            throw new Error("Unexpected response format");
        }
    });
};

const deleteLetter = (id) => {
    const token = localStorage.getItem('token');
    return instance.delete(`/api/letters/${id}?token=${token}`)
        .then(response => {
            //console.log("Response from deleteLetter API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error from deleteLetter API:", error.response?.data || error.message);
            throw error;
        });
};

const addLetter = (data) => {
    const token = localStorage.getItem('token');
    return instance.post(`/api/letters?token=${token}`, data)
        .then(response => {
            //console.log("Response from server:", response.data);
            return response;
        })
        .catch(error => {
            console.error("Error from server:", error.response?.data || error.message);
            throw error;
        });
};

const getDashboard = () => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/dashboard?token=${token}`).then(response => response.data);
};

const setAuthToken = (token) => {
    localStorage.setItem('token', token);
};

const getLetterDetails = (id) => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/letters/${id}?token=${token}`)
        .then(response => {
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error(`Unexpected status code: ${response.status}`);
            }
        })
        .catch(error => {
            console.error("Error from getLetterDetails API:", error.response?.data || error.message);
            throw error;
        });
};

const updateLetter = (id, data) => {
    const token = localStorage.getItem('token');
    return instance.post(`/api/letters/${id}?token=${token}`, data).then(response => {
        //console.log("Response from updateLetter API:", response.data);
        return response.data;
    }).catch(error => {
        console.error("Error from updateLetter API:", error.response?.data || error.message);
        throw error;
    });
};

const updateLetterreferer = (id, data) => {
    const token = localStorage.getItem('token');
    return instance.put(`/api/letters/${id}?token=${token}`, data).then(response => {
        //console.log("Response from updateLetter API:", response.data);
        return response.data;
    }).catch(error => {
        console.error("Error from updateLetter API:", error.response?.data || error.message);
        throw error;
    });
};

const getGeneralSettings = () => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/settings/general?token=${token}`).then(response => {
        //console.log("Response from getGeneralSettings API:", response.data);
        return response.data;
    });
};

const saveGeneralSettings = (data) => {
    const token = localStorage.getItem('token');
    return instance.post(`/api/settings/general?token=${token}`, data)
        .then(response => {
            //console.log("Response from saveGeneralSettings API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error saving settings:", error);
            throw error;
        });
};

const getSecretariatSettings = () => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/settings/secretariat?token=${token}`).then(response => {
        //console.log("Response from getSecretariatSettings API:", response.data);
        return response.data;
    });
};

const saveSecretariatSettings = (data) => {
    const token = localStorage.getItem('token');
    return instance.post(`/api/settings/secretariat?token=${token}`, data)
        .then(response => {
            //console.log("Response from saveSecretariatSettings API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error saving secretariat settings:", error);
            throw error;
        });
};

const getEmailServerSettings = () => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/settings/email-server?token=${token}`).then(response => {
        //console.log("Response from getEmailServerSettings API:", response.data);
        return response.data;
    });
};

const saveEmailServerSettings = (data) => {
    const token = localStorage.getItem('token');
    return instance.post(`/api/settings/email-server?token=${token}`, data)
        .then(response => {
            //console.log("Response from saveEmailServerSettings API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error saving email server settings:", error);
            throw error;
        });
};

const getOasSettings = () => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/settings/oas?token=${token}`).then(response => {
        //console.log("Response from getOasSettings API:", response.data);
        return response.data;
    });
};

const saveOasSettings = (data) => {
    const token = localStorage.getItem('token');
    return instance.post(`/api/settings/oas?token=${token}`, data)
        .then(response => {
            //console.log("Response from saveOasSettings API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error saving Oas settings:", error);
            throw error;
        });
};

const getLetterTemplates = (page = 1) => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/settings/letter-templates?token=${token}&page=${page}`).then(response => {
        //console.log("Response from getLetterTemplates API:", response.data);
        return response.data;
    });
};

const saveLetterTemplate = (data) => {
    const token = localStorage.getItem('token');
    return instance.post(`/api/settings/letter-templates?token=${token}`, data)
        .then(response => {
            //console.log("Response from saveLetterTemplate API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error saving letter template:", error);
            throw error;
        });
};

const getLetterTemplateById = (id) => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/settings/letter-templates/${id}?token=${token}`).then(response => {
        //console.log("Response from getLetterTemplateById API:", response.data);
        return response.data;
    });
};

const updateLetterTemplate = (id, data) => {
    const token = localStorage.getItem('token');
    return instance.post(`/api/settings/letter-templates/${id}?token=${token}`, data)
        .then(response => {
            //console.log("Response from updateLetterTemplate API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error updating letter template:", error);
            throw error;
        });
};

const deleteLetterTemplate = (id) => {
    const token = localStorage.getItem('token');
    return instance.delete(`/api/settings/letter-templates/${id}?token=${token}`)
        .then(response => {
            //console.log("Response from deleteLetterTemplate API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error deleting letter template:", error);
            throw error;
        });
};

const referLetter = (letterId, data) => {
    const token = localStorage.getItem('token');
    return instance.post(`/api/letters/${letterId}/referring?token=${token}`, data)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error from referLetter API:", error.response?.data || error.message);
            throw error;
        });
};

const addFootnote = (letterId, data) => {
    const token = localStorage.getItem('token');
    return instance.post(`/api/letters/${letterId}/footnotes?token=${token}`, data)
        .then(response => {
            //console.log("Response from addFootnote API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error from addFootnote API:", error.response?.data || error.message);
            throw error;
        });
};

const getUnreadLettersCount = () => {
    const token = localStorage.getItem('token');
    return instance.post(`/api/letters/count?token=${token}`)
        .then(response => {
            //console.log("Response from getUnreadLettersCount API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error from getUnreadLettersCount API:", error.response?.data || error.message);
            throw error;
        });
};

const getUsers = (isContact = 0, page = 1, q = '') => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/users?token=${token}`, {
        params: {
            is_contact: isContact,
            page: page,
            q: q
        }
    })
        .then(response => {
            //console.log("Fetched Users:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error fetching users:", error.response?.data || error.message);
            throw error;
        });
};

const deleteUser = async (id) => {
    const token = localStorage.getItem('token');
    try {
        const response = await instance.get(`/api/users/${id}/delete?token=${token}`);
        return response.data;
    } catch (error) {
        throw new Error(`Error deleting user: ${error.response?.data?.message || error.message}`);
    }
};

const getContact = (isContact = 1, page = 1, q = '') => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/users?token=${token}`, {
        params: {
            is_contact: isContact,
            page: page,
            q: q
        }
    })
        .then(response => {
            //console.log("Fetched Users:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error fetching users:", error.response?.data || error.message);
            throw error;
        });
};

const getUserById = (id) => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/users/${id}?token=${token}`)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error from getUserById API:", error.response?.data || error.message);
            throw error;
        });
};

const getContactById = (id) => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/users/${id}?token=${token}`)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error from getUserById API:", error.response?.data || error.message);
            throw error;
        });
};

const getRoles = (perPage = 20, name = '') => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/settings/roles?token=${token}`, {
        params: {
            per_page: perPage,
            name: name
        }
    })
        .then(response => {
            //console.log("Response from getRoles API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error from getRoles API:", error.response?.data || error.message);
            throw error;
        });
};

const getPermissions = () => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/settings/permission-groups?token=${token}`)
        .then(response => {
            //console.log("Response from getPermissionGroups API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error from getPermissionGroups API:", error.response?.data || error.message);
            throw error;
        });
};

const getRoleDetails = (id) => {
    const token = localStorage.getItem('token');
    return instance.get(`/api/settings/roles/${id}?token=${token}`)
        .then(response => {
            //console.log("Response from getRoleDetails API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error from getRoleDetails API:", error.response?.data || error.message);
            throw error;
        });
};

const addRole = (name) => {
    const token = localStorage.getItem('token');
    return instance.post(`/api/settings/roles?token=${token}`, { name })
        .then(response => {
            //console.log("Response from addRole API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error from addRole API:", error.response?.data || error.message);
            throw error;
        });
};

const updateRole = (id, name) => {
    const token = localStorage.getItem('token');
    return instance.put(`/api/settings/roles/${id}?token=${token}`, { name })
        .then(response => {
            //console.log("Response from updateRole API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error from updateRole API:", error.response?.data || error.message);
            throw error;
        });
};

const deleteRole = (id) => {
    const token = localStorage.getItem('token');
    return instance.delete(`/api/settings/roles/${id}?token=${token}`)
        .then(response => {
            //console.log("Response from deleteRole API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error from deleteRole API:", error.response?.data || error.message);
            throw error;
        });
};

 const updateRolePermissions = (id, permissions) => {
     const token = localStorage.getItem('token');

     return instance.post(`/api/settings/roles/${id}/permissions?token=${token}`, { permissions })
        .then(response => {
            //console.log("Response from updateRolePermissions API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error from updateRolePermissions API:", error.response?.data || error.message);
            throw error;
        });
};






const addContact = (data) => {
    const token = localStorage.getItem('token');

    return instance.post(`/api/users?token=${token}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    } )
        .then(response => {
            //console.log("Response from server:", response.data);
            return response;
        })
        .catch(error => {
            console.error("Error from server:", error.response?.data || error.message);
            throw error;
        });
};
const updateContact = async (id, data) => {
    const token = localStorage.getItem('token');

    try {
        const response = await instance.post(`/api/users/${id}?token=${token}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};
const getProvinces = () => {
    const token = localStorage.getItem('token');

    return instance.get(`/api/provinces?token=${token}`)
        .then(response => {
            //console.log("Response from getProvinces API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error fetching provinces:", error.response?.data || error.message);
            throw error;
        });
};

const getCities = (provinceId) => {
    const token = localStorage.getItem('token');

    return instance.get(`/api/provinces/${provinceId}/cities?token=${token}`)
        .then(response => {
            //console.log("Response from getCities API:", response.data);
            return response.data;
        })
        .catch(error => {
            console.error("Error fetching cities:", error.response?.data || error.message);
            throw error;
        });
};

export {
    login, logout, getUsersLetterable, getLetters, deleteLetter, addLetter, getDashboard,
    setAuthToken, getLetterDetails, updateLetter, getGeneralSettings, saveGeneralSettings, getSecretariatSettings,
    saveSecretariatSettings, saveEmailServerSettings, getEmailServerSettings, getOasSettings, saveOasSettings, getLetterTemplates, saveLetterTemplate, getLetterTemplateById,
    updateLetterTemplate, deleteLetterTemplate, referLetter,getLettersreceived,getLetterssend,addFootnote,getUnreadLettersCount,getServerURL,updateLetterreferer,
    getUsers,getUserById,getRoles,getPermissions,getContact,getContactById,addContact,deleteUser,updateContact,getCities,getProvinces,kartablsearch,kartablsearchmymessage
    ,updateRolePermissions,deleteRole,updateRole,addRole,getRoleDetails,getLettersCC

};
