import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Switch from 'react-switch';
import { getProvinces, getCities, addContact, getRoles } from '../../../api/api';
import { useNavigate } from "react-router-dom";

const AddRealPersonModal = ({ isOpen, toggle, handleSave }) => {
    const navigate = useNavigate();
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [loading, setLoading] = useState(false);
    const [roleOptions, setRoleOptions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        nationalId: '',
        mobile: '',
        email: '',
        address: '',
        city_id: '',
        postalCode: '',
        phone: '',
        fax: '',
        website: '',
        description: '',
        role_ids: [],
        isActive: true,
        systemCode: ''
    });

    useEffect(() => {
        const fetchRolesAndProvinces = async () => {
            try {
                const roles = await getRoles();
                setRoleOptions(roles.data.map(role => ({ value: role.id, label: role.name })));

                const provincesResponse = await getProvinces();
                setProvinces(provincesResponse.map(province => ({
                    value: province.id,
                    label: province.name
                })));
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (isOpen) {
            fetchRolesAndProvinces();
        }
    }, [isOpen]);

    const handleProvinceChange = async (selectedOption) => {
        setSelectedProvince(selectedOption);
        setFormData(prev => ({ ...prev, city_id: '' }));

        try {
            const citiesResponse = await getCities(selectedOption.value);
            setCities(citiesResponse.map(city => ({ value: city.id, label: city.name })));
        } catch (error) {
            console.error("Error fetching cities:", error);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const contactData = {
                is_contact: 1,
                type: 'natural',
                system_code: formData.systemCode,
                is_active: formData.isActive ? 1 : 0,
                first_name: formData.firstName,
                last_name: formData.lastName,
                national_code: formData.nationalId,
                mobile: formData.mobile,
                email: formData.email,
                address: formData.address,
                city_id: formData.city_id,
                postal_code: formData.postalCode,
                phone: formData.phone,
                fax: formData.fax,
                website: formData.website,
                description: formData.description,
                role_ids: formData.role_ids.map(role => role.value)
            };

            await addContact(contactData);
            window.location.reload();
            handleSave();
            toggle();
        } catch (error) {
            console.error('Error saving contact:', error);
        } finally {
            setLoading(false);
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

    const handleCancel = () => {
        toggle();
        navigate('/settings');
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
                            افزودن شخص حقیقی
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

                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-black">اطلاعات شخصی</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        نام
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        نام خانوادگی
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="nationalId" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        کد ملی
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
                                <div>
                                    <label htmlFor="role_ids" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                        عنوان سمت
                                    </label>
                                    <Select
                                        id="role_ids"
                                        value={formData.role_ids}
                                        onChange={handleRoleChange}
                                        options={roleOptions}
                                        isMulti
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
                                        value={formData.city_id ? { value: formData.city_id, label: cities.find(city => city.value === formData.city_id)?.label } : null}
                                        onChange={(selectedOption) => setFormData(prev => ({
                                            ...prev,
                                            city_id: selectedOption.value
                                        }))}
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
                            onClick={handleCancel}
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
                            {loading ? 'در حال ذخیره...' : 'ذخیره'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddRealPersonModal;