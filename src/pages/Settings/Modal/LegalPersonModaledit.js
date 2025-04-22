import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Switch from 'react-switch';
import { updateContact, getRoles, getProvinces, getCities } from '../../../api/api';
import { useNavigate } from "react-router-dom";

const EditLegalPersonModal = ({ isOpen, toggle, userData, handleSave, userId }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [roleOptions, setRoleOptions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);

    const [formData, setFormData] = useState({
        companyName: userData.companyName || '',
        economicCode: userData.economicCode || '',
        registrationId: userData.registrationId || '',
        nationalId: userData.nationalId || '',
        agentFirstName: userData.agentFirstName || '',
        agentLastName: userData.agentLastName || '',
        mobile: userData.mobile || '',
        email: userData.email || '',
        address: userData.address || '',
        city: userData.city || '',
        postalCode: userData.postalCode || '',
        phone: userData.phone || '',
        fax: userData.fax || '',
        website: userData.website || '',
        description: userData.description || '',
        role_ids: userData.roles ? userData.roles.map(role => ({ value: role.id, label: role.name })) : [],
        isActive: userData.isActive || false,
        systemCode: userData.systemCode || ''
    });

    useEffect(() => {
        setFormData({
            companyName: userData.first_name || '',
            economicCode: userData.economic_code || '',
            registrationId: userData.registration_id || '',
            nationalId: userData.national_id || '',
            agentFirstName: userData.agent_first_name || '',
            agentLastName: userData.agent_last_name || '',
            mobile: userData.mobile || '',
            email: userData.email || '',
            address: userData.address || '',
            city: userData.city || '',
            postalCode: userData.postal_code || '',
            phone: userData.phone || '',
            fax: userData.fax || '',
            website: userData.website || '',
            description: userData.description || '',
            role_ids: userData.roles ? userData.roles.map(role => ({ value: role.id, label: role.name })) : [],
            isActive: userData.is_active === 1,
            systemCode: userData.system_code || ''
        });
    }, [userData]);

    useEffect(() => {
        const fetchRolesAndProvinces = async () => {
            try {
                const roles = await getRoles();
                setRoleOptions(roles.data.map(role => ({ value: role.id, label: role.name })));

                const provincesResponse = await getProvinces();
                const provincesData = provincesResponse.map(province => ({
                    value: province.id,
                    label: province.name
                }));
                setProvinces(provincesData);

                if (userData.city) {
                    const selectedProvinceId = userData.city.province_id;
                    const selectedProvince = provincesData.find(province => province.value === selectedProvinceId);
                    setSelectedProvince(selectedProvince);

                    const citiesResponse = await getCities(selectedProvinceId);
                    setCities(citiesResponse.map(city => ({
                        value: city.id,
                        label: city.name
                    })));
                    setFormData(prev => ({
                        ...prev,
                        city: userData.city.id
                    }));
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (isOpen) {
            fetchRolesAndProvinces();
        }
    }, [isOpen, userData]);

    const handleProvinceChange = async (selectedOption) => {
        setSelectedProvince(selectedOption);
        setFormData(prev => ({ ...prev, city: '' }));

        try {
            const citiesResponse = await getCities(selectedOption.value);
            setCities(citiesResponse.map(city => ({
                value: city.id,
                label: city.name
            })));
        } catch (error) {
            console.error("Error fetching cities:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (selectedOptions) => {
        setFormData(prev => ({ ...prev, role_ids: selectedOptions }));
    };

    const handleSwitchChange = (checked) => {
        setFormData(prev => ({ ...prev, isActive: checked }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const contactData = {
                is_contact: 1,
                type: 'legal',
                system_code: formData.systemCode,
                is_active: formData.isActive ? 1 : 0,
                first_name: formData.companyName,
                economic_code: formData.economicCode,
                registration_id: formData.registrationId,
                national_id: formData.nationalId,
                agent_first_name: formData.agentFirstName,
                agent_last_name: formData.agentLastName,
                mobile: formData.mobile,
                email: formData.email,
                address: formData.address,
                city_id: formData.city,
                postal_code: formData.postalCode,
                phone: formData.phone,
                fax: formData.fax,
                website: formData.website,
                description: formData.description,
                role_ids: formData.role_ids.map(role => role.value)
            };

            await updateContact(userId, contactData);
            window.location.reload();
            handleSave();
            toggle();
        } catch (error) {
            console.error('Error updating contact:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={toggle}></div>

                {/* Modal */}
                <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-black">
                            ویرایش اطلاعات شخص حقوقی
                        </h3>
                        <button
                            onClick={toggle}
                            className="text-black hover:text-gray-700 dark:text-black dark:hover:text-gray-200"
                        >
                            <span className="sr-only">بستن</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6 bg-white dark:bg-gray-900">
                        {/* Status and System Code */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center space-x-4 space-x-reverse">
                                <label className="text-sm font-bold text-gray-900 dark:text-black">فعال</label>
                                <Switch
                                    checked={formData.isActive}
                                    onChange={handleSwitchChange}
                                    onColor="#10B981"
                                    offColor="#EF4444"
                                    height={24}
                                    width={48}
                                    className="react-switch"
                                />
                            </div>
                            <div>
                                <label htmlFor="systemCode" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                    کد سیستمی
                                </label>
                                <input
                                    type="text"
                                    id="systemCode"
                                    name="systemCode"
                                    value={formData.systemCode}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Company Info */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-black">اطلاعات شرکت</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        نام شرکت
                                    </label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                        className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="economicCode" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        کد اقتصادی
                                    </label>
                                    <input
                                        type="text"
                                        id="economicCode"
                                        name="economicCode"
                                        value={formData.economicCode}
                                        onChange={handleChange}
                                        required
                                        className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="registrationId" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        شناسه ثبت
                                    </label>
                                    <input
                                        type="text"
                                        id="registrationId"
                                        name="registrationId"
                                        value={formData.registrationId}
                                        onChange={handleChange}
                                        required
                                        className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="nationalId" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        شناسه ملی
                                    </label>
                                    <input
                                        type="text"
                                        id="nationalId"
                                        name="nationalId"
                                        value={formData.nationalId}
                                        onChange={handleChange}
                                        required
                                        className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-black">اطلاعات تماس</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="province" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        استان
                                    </label>
                                    <Select
                                        id="province"
                                        value={selectedProvince}
                                        onChange={handleProvinceChange}
                                        options={provinces}
                                        placeholder="انتخاب استان"
                                        isSearchable
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        theme={(theme) => ({
                                            ...theme,
                                            colors: {
                                                ...theme.colors,
                                                primary: '#3B82F6',
                                                primary25: '#DBEAFE',
                                                neutral0: 'white',
                                                neutral80: '#111827',
                                                neutral10: '#F3F4F6',
                                                neutral20: '#E5E7EB',
                                                neutral30: '#D1D5DB',
                                                neutral40: '#9CA3AF',
                                                neutral50: '#6B7280',
                                                neutral60: '#4B5563',
                                                neutral70: '#374151',
                                            },
                                        })}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                padding: '4px',
                                                borderRadius: '0.5rem',
                                                minHeight: '45px',
                                                backgroundColor: 'white',
                                                borderColor: document.documentElement.classList.contains('dark') ? '#4B5563' : '#E5E7EB',
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                backgroundColor: 'white',
                                            }),
                                            option: (base, state) => ({
                                                ...base,
                                                backgroundColor: state.isSelected 
                                                    ? document.documentElement.classList.contains('dark') ? '#1F2937' : '#3B82F6'
                                                    : state.isFocused
                                                    ? '#F3F4F6'
                                                    : 'white',
                                                color: state.isSelected
                                                    ? 'white'
                                                    : '#111827',
                                            }),
                                        }}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        شهر
                                    </label>
                                    <Select
                                        id="city"
                                        value={formData.city ? { value: formData.city, label: cities.find(city => city.value === formData.city)?.label } : null}
                                        onChange={(selectedOption) => setFormData(prev => ({ ...prev, city: selectedOption.value }))}
                                        options={cities}
                                        placeholder="انتخاب شهر"
                                        isDisabled={!selectedProvince}
                                        isSearchable
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        theme={(theme) => ({
                                            ...theme,
                                            colors: {
                                                ...theme.colors,
                                                primary: '#3B82F6',
                                                primary25: '#DBEAFE',
                                                neutral0: 'white',
                                                neutral80: '#111827',
                                                neutral10: '#F3F4F6',
                                                neutral20: '#E5E7EB',
                                                neutral30: '#D1D5DB',
                                                neutral40: '#9CA3AF',
                                                neutral50: '#6B7280',
                                                neutral60: '#4B5563',
                                                neutral70: '#374151',
                                            },
                                        })}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                padding: '4px',
                                                borderRadius: '0.5rem',
                                                minHeight: '45px',
                                                backgroundColor: 'white',
                                                borderColor: document.documentElement.classList.contains('dark') ? '#4B5563' : '#E5E7EB',
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                backgroundColor: 'white',
                                            }),
                                            option: (base, state) => ({
                                                ...base,
                                                backgroundColor: state.isSelected 
                                                    ? document.documentElement.classList.contains('dark') ? '#1F2937' : '#3B82F6'
                                                    : state.isFocused
                                                    ? '#F3F4F6'
                                                    : 'white',
                                                color: state.isSelected
                                                    ? 'white'
                                                    : '#111827',
                                            }),
                                        }}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="address" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        آدرس پستی
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="postalCode" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        کد پستی
                                    </label>
                                    <input
                                        type="text"
                                        id="postalCode"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        تلفن
                                    </label>
                                    <input
                                        type="text"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="fax" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        فکس
                                    </label>
                                    <input
                                        type="text"
                                        id="fax"
                                        name="fax"
                                        value={formData.fax}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="mobile" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        موبایل
                                    </label>
                                    <input
                                        type="text"
                                        id="mobile"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        ایمیل
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="website" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        آدرس سایت
                                    </label>
                                    <input
                                        type="url"
                                        id="website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Agent Info */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-black">اطلاعات رابط شرکت</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="agentFirstName" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        نام رابط
                                    </label>
                                    <input
                                        type="text"
                                        id="agentFirstName"
                                        name="agentFirstName"
                                        value={formData.agentFirstName}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="agentLastName" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        نام خانوادگی رابط
                                    </label>
                                    <input
                                        type="text"
                                        id="agentLastName"
                                        name="agentLastName"
                                        value={formData.agentLastName}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-black">توضیحات</h4>
                            <div>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <button
                            type="button"
                            onClick={toggle}
                            className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-black bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            لغو
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditLegalPersonModal;