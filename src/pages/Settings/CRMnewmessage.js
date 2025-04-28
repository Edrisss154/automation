import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import moment from "jalali-moment";
import { addLetter, getUsersLetterable, getUserById } from "../../api/api";
import { useNavigate } from "react-router-dom";
import ReferModal from "../Automation/Modal/ReferModal";
import InviteModal from "../Automation/Modal/InviteModal";
import SuccessModal from "../Automation/Modal/SuccessModal";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from "reactstrap";
import DOMPurify from "dompurify";
import axios from "axios";
import useUserRoles from "../hooks/useUserRoles";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import WebcamComponent from "../../components/WebcamComponent";
import Select from "react-select";
import DatePicker from "react-datepicker2";
import { useDropzone } from "react-dropzone";

const CRMNewMessage = () => {
  const [fromUserId, setFromUserId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [editorValue, setEditorValue] = useState("");
  const [from, setFrom] = useState("");
  const [footnotes_to, setfootnotes_to] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [referData, setReferData] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [direction, setDirection] = useState("");
  const [margin, setMargin] = useState("");
  const [privateNote, setPrivateNote] = useState("");
  const [isAdded, setIsAdded] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");   
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMobile, setInviteMobile] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReferTableModal, setShowReferTableModal] = useState(false);
  const [signers, setSigners] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [importanceLevel, setImportanceLevel] = useState("عادی");
  const [priorityLevel, setPriorityLevel] = useState("عادی");
  const [importanceLevel1, setImportanceLevel1] = useState("داخلی");
  const [subject, setSubject] = useState("");
  const [signatureFile, setSignatureFile] = useState(null);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rolessig, setRolessig] = useState(localStorage.getItem("rolessig") || "");
  const cleanedRolessig = rolessig.replace(/['"]/g, "");
  const [showImage, setShowImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userRoles1 = JSON.parse(localStorage.getItem("roles")) || [];
  const userFullName = localStorage.getItem("userFullName") || "نام کاربر";
  const rolesWithUserName = [`نام کامل: ${userFullName}`, ...userRoles1];
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFromUsers, setFilteredFromUsers] = useState([]);
  const [searchTermFrom, setSearchTermFrom] = useState("");
  const [searchTermCC, setSearchTermCC] = useState("");
  const [filteredCCUsers, setFilteredCCUsers] = useState([]);
  const [carbonCopy, setCarbonCopy] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [footnoteGroups, setFootnoteGroups] = useState([{ from: "", to: "", content: "" }]);
  const [footnoteItems, setFootnoteItems] = useState([]);
  const [newFootnote, setNewFootnote] = useState({ from: "", to: "", text: "" });
  const [editIndex, setEditIndex] = useState(null);
  const { userRoles, selectedRole, setSelectedRole, signatoryId } = useUserRoles();
  const [signature, setSignature] = useState(null);
  const [uploadedFileCount, setUploadedFileCount] = useState(0);
  const [selectedFromUser, setSelectedFromUser] = useState(null);
  const [selectedToUser, setSelectedToUser] = useState(null);
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    referTo: '',
    ccTo: [],
    priority: '',
    workDays: '',
    taskType: '',
    description: '',
    adslTell: '',
    title: '',
    status: '',
    files: []
  });
  const [categoryTask, setCategoryTask] = useState([]);
  const [listUser, setListUser] = useState([]);
  const [categoryPriority, setCategoryPriority] = useState([]);

  const fetchSignature = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await getUserById(userId);
      if (response.signature) {
        setSignature(response.signature);
      } else {
        console.error("No signature found in response:", response);
      }
    } catch (error) {
      console.error("Error fetching signature:", error);
    }
  };

  useEffect(() => {
    if (showImage) {
      fetchSignature();
    }
  }, [showImage]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("https://automationapi.satia.co/api/users", {
          params: {
            token: localStorage.getItem("token"),
            per_page: 100000,
          },
        });
        if (response.data && Array.isArray(response.data.data)) {
          setUsers(response.data.data);
          setFilteredUsers(response.data.data);
        } else {
          setUsers([]);
          setFilteredUsers([]);
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("خطا در دریافت داده‌های کاربر:", error);
      }
    };

    fetchUserData();
  }, [importanceLevel1]);

  useEffect(() => {
    const filtered = users.filter((user) =>
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTermFrom.toLowerCase())
    );
    setFilteredFromUsers(filtered);
  }, [searchTermFrom, users]);

  useEffect(() => {
    setCarbonCopy([]);
    setFilteredFromUsers(users);
    setFootnoteItems([]);
  }, [users]);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTermCC.toLowerCase()) &&
        !carbonCopy.some((ccUser) => ccUser.id === user.id)
    );
    setFilteredCCUsers(filtered);
  }, [searchTermCC, users, carbonCopy]);

  useEffect(() => {
    if (importanceLevel1 === "داخلی" || importanceLevel1 === "صادره") {
      const today = moment().format("jYYYY/jMM/jDD");
      setStartDate(today);
    }
  }, [importanceLevel1]);

  const handleRemoveUser = (userId) => {
    setCarbonCopy(carbonCopy.filter((user) => user.id !== userId));
  };

  const handleSearchCC = (event) => {
    setSearchTermCC(event.target.value);
    setIsDropdownOpen(true);
  };

  const handleSelectUserCC = (user) => {
    setCarbonCopy((prev) => [...prev, user]);
    setSearchTermCC("");
    setFilteredCCUsers([]);
    setIsDropdownOpen(false);
  };

  const handleInputClick = () => {
    setIsDropdownOpen(true);
  };

  const validateForm = () => {
    return editorValue.trim() !== "" && startDate !== null && subject.trim() !== "";
  };

  const handleSendInvite = async () => {
    try {
      console.log("Sending invite to:", inviteName, inviteEmail, inviteMobile);
      setInviteName("");
      setInviteEmail("");
      setInviteMobile("");
      setShowInviteModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("خطا در ارسال دعوت‌نامه:", error);
      alert("مشکلی در ارسال دعوت‌نامه وجود دارد");
    }
  };

  const handleCancel = () => {
    navigate("/automation");
  };

  const userOptions = listUser.map(user => ({
    value: user.value,
    label: user.label,
    Serial: user.Serial,
    Name: user.Name,
    Email: user.Email,
    Type: user.Type
  }));

  const fromUserOptions = users
    .filter((user) => user.is_contact === 1)
    .map((user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name || ""}`.trim(),
    }));

  const toUserOptions = users
    .filter((user) => user.is_contact === 1)
    .map((user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name || ""}`.trim(),
    }));

  const handleAddRefer = () => {
    if (receiver && direction) {
      const newRefer = {
        receiver,
        direction,
        margin,
        privateNote,
        selectedRole,
      };
      setReferData([...referData, newRefer]);
      setReceiver("");
      setDirection("");
      setMargin("");
      setPrivateNote("");
    } else {
      alert("لطفاً تمامی فیلدهای ضروری را پر کنید.");
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
    setUploadedFileCount((prevCount) => prevCount - 1);
  };

  const handleChange = (value) => {
    setEditorValue(value);
  };

  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ align: [] }],
      ["bold", "italic", "underline"],
      ["link"],
      [{ indent: "-1" }, { indent: "+1" }],
      ["blockquote"],
      ["image", "video"],
      ["code-block"],
    ],
  };

  const convertTypeToEnglish = (type) => {
    switch (type) {
      case "داخلی":
        return "internal";
      case "صادره":
        return "issued";
      case "وارده":
        return "incoming";
      default:
        return type;
    }
  };

  const convertImportanceToEnglish = (importance) => {
    switch (importance) {
      case "عادی":
        return "normal";
      case "محرمانه":
        return "secret";
      case "سری":
        return "classified";
      default:
        return importance;
    }
  };

  const convertUrgencyToEnglish = (urgency) => {
    switch (urgency) {
      case "عادی":
        return "normal";
      case "فوری":
        return "urgent";
      case "آنی":
        return "instant";
      default:
        return urgency;
    }
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_FILE_TYPES = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'image/jpeg': '.jpg,.jpeg',
    'image/png': '.png',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov'
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setError(`فایل ${file.name} بزرگتر از 10 مگابایت است`);
        return false;
      }
      if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
        setError(`نوع فایل ${file.name} مجاز نیست`);
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles]
    }));
  };

  const handleRemoveFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('interorganizational_token');
      const submitFormData = new FormData();
      
      submitFormData.append('token', token);
      submitFormData.append('adslTell', formData.adslTell);
      submitFormData.append('categoryType', formData.taskType);
      submitFormData.append('title', formData.title);
      submitFormData.append('description', formData.description);
      submitFormData.append('status', formData.status);
      submitFormData.append('ccTo', formData.ccTo.join(','));
      submitFormData.append('workTime', formData.workDays);
      submitFormData.append('priority', formData.priority);
      submitFormData.append('referTo', formData.referTo);
      submitFormData.append('platform', 'web');

      formData.files.forEach((file, index) => {
        submitFormData.append(`file${index + 1}`, file);
      });

      const response = await axios.post('https://task.satia.co/proxy.php/operator_tk/createNewTask', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      if (response.data.status) {
        navigate('/settings/CRM');
      } else {
        setError('خطا در ثبت وظیفه');
      }
    } catch (err) {
      setError('خطا در ارسال اطلاعات');
      console.error('Error submitting task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAndRefer = () => {
    setShowReferModal(true);
  };

  const handleReferSubmit = async (referData) => {
    if (!validateForm()) {
      alert("لطفاً تمام فیلدهای ضروری را پر کنید.");
      return;
    }

    const cleanedEditorValue = DOMPurify.sanitize(editorValue, { ALLOWED_TAGS: [] });
    const gregorianDate = moment(startDate, "jYYYY/jMM/jDD").format("YYYY-MM-DD");
    const signatoryId = localStorage.getItem("userId");

    if (!signatoryId) {
      alert("شناسه کاربر معتبر نیست. لطفاً دوباره وارد شوید.");
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("type", convertTypeToEnglish(importanceLevel1));
    formData.append("subject", subject);
    formData.append("content", cleanedEditorValue);
    formData.append("importance", convertImportanceToEnglish(importanceLevel));
    formData.append("urgency", convertUrgencyToEnglish(priorityLevel));
    formData.append("signatory_id", signatoryId);
    formData.append("role_id", selectedRole);
    formData.append("registered_at", gregorianDate);

    if (importanceLevel1 === "وارده") {
      formData.append("from_user_id", fromUserId);
    } else if (importanceLevel1 === "صادره") {
      formData.append("to_user_id", toUserId);
    }

    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((file, index) => {
        formData.append(`attachments[]`, file.type);
        formData.append(`files[]`, file.file);
      });
    }

    if (referData.length > 0) {
      referData.forEach((data) => {
        formData.append("receivers_user_id[]", data.receiver);
        formData.append("receivers_reason_id[]", data.direction);
        formData.append("receivers_footnote[]", data.margin);
        formData.append("receivers_private_message[]", data.privateNote);
      });
    }

    if (carbonCopy.length > 0) {
      carbonCopy.forEach((user) => {
        formData.append("cc[]", user.id);
      });
    }

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await addLetter(formData);
      console.log("Response from server:", response.data);
      setSuccessMessage("نامه با موفقیت ثبت و ارجاع شد!");
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/automation");
      }, 1000);
      setShowReferModal(false);
    } catch (err) {
      console.error("Error from server:", err.response?.data || err.message);
      setError("مشکلی در ارسال داده‌ها وجود دارد");
      alert("خطا در ثبت نامه. لطفاً دوباره تلاش کنید.");
    }
  };

  const handleClick = () => {
    setShowImage(!showImage);
    if (!showImage) {
      fetchSignature();
    }
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const [scannedImages, setScannedImages] = useState([]);
  const [showScannerModal, setShowScannerModal] = useState(false);

  const handleRemoveScannedImage = (index) => {
    setScannedImages(scannedImages.filter((_, i) => i !== index));
  };

  const handleScan = () => {
    navigate("/scan-and-edit");
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'var(--select-bg)',
      borderColor: state.isFocused ? '#60A5FA' : 'var(--select-border)',
      boxShadow: state.isFocused ? '0 0 0 1px #60A5FA' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#60A5FA' : 'var(--select-border-hover)'
      }
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'var(--select-bg)',
      border: '1px solid var(--select-border)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? 'var(--select-option-hover)' : 'var(--select-bg)',
      color: 'var(--select-text)',
      '&:hover': {
        backgroundColor: 'var(--select-option-hover)',
        color: 'var(--select-text)'
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--select-text)'
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: 'var(--select-multi-bg)',
      '.dark &': {
        backgroundColor: '#374151',
        color: '#fff'
      }
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: 'var(--select-text)',
      '.dark &': {
        color: '#fff'
      }
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: 'var(--select-text)',
      ':hover': {
        backgroundColor: 'var(--select-multi-remove-hover)',
        color: '#fff'
      },
      '.dark &': {
        color: '#fff'
      }
    }),
    input: (base) => ({
      ...base,
      color: 'var(--select-text)',
      '.dark &': {
        color: '#fff'
      }
    }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--select-placeholder)',
      '.dark &': {
        color: '#9ca3af'
      }
    }),
    clearIndicator: (base) => ({
      ...base,
      color: 'var(--select-text)',
      ':hover': {
        color: 'var(--select-text)'
      },
      '.dark &': {
        color: '#fff'
      }
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: 'var(--select-text)',
      ':hover': {
        color: 'var(--select-text)'
      },
      '.dark &': {
        color: '#fff'
      }
    })
  };

  const customQuillStyles = `
    .dark .ql-snow.ql-toolbar {
      background-color: #374151;
      border-color: #4B5563;
    }
    
    .dark .ql-snow.ql-toolbar button,
    .dark .ql-snow.ql-toolbar button svg {
      color: #E5E7EB;
      filter: invert(1);
    }
    
    .dark .ql-snow.ql-toolbar button:hover,
    .dark .ql-snow.ql-toolbar button.ql-active {
      color: #60A5FA;
    }
    
    .dark .ql-editor {
      background-color: #1F2937;
      color: #E5E7EB;
    }
    
    .dark .ql-container.ql-snow {
      border-color: #4B5563;
    } 
  `;

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = customQuillStyles;
    document.head.appendChild(styleSheet);

    // Light mode variables
    document.documentElement.style.setProperty('--select-bg', '#ffffff');
    document.documentElement.style.setProperty('--select-border', '#d1d5db');
    document.documentElement.style.setProperty('--select-border-hover', '#9ca3af');
    document.documentElement.style.setProperty('--select-text', '#1f2937');
    document.documentElement.style.setProperty('--select-placeholder', '#6b7280');
    document.documentElement.style.setProperty('--select-option-hover', '#f3f4f6');
    document.documentElement.style.setProperty('--select-multi-bg', '#e5e7eb');
    document.documentElement.style.setProperty('--select-multi-remove-hover', '#ef4444');

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateThemeVariables = (e) => {
      if (e.matches) {
        // Dark mode variables
        document.documentElement.style.setProperty('--select-bg', '#1f2937');
        document.documentElement.style.setProperty('--select-border', '#4b5563');
        document.documentElement.style.setProperty('--select-border-hover', '#6b7280');
        document.documentElement.style.setProperty('--select-text', '#ffffff');
        document.documentElement.style.setProperty('--select-placeholder', '#9ca3af');
        document.documentElement.style.setProperty('--select-option-hover', '#374151');
        document.documentElement.style.setProperty('--select-multi-bg', '#374151');
        document.documentElement.style.setProperty('--select-multi-remove-hover', '#dc2626');
      } else {
        // Reset to light mode variables
        document.documentElement.style.setProperty('--select-bg', '#ffffff');
        document.documentElement.style.setProperty('--select-border', '#d1d5db');
        document.documentElement.style.setProperty('--select-border-hover', '#9ca3af');
        document.documentElement.style.setProperty('--select-text', '#1f2937');
        document.documentElement.style.setProperty('--select-placeholder', '#6b7280');
        document.documentElement.style.setProperty('--select-option-hover', '#f3f4f6');
        document.documentElement.style.setProperty('--select-multi-bg', '#e5e7eb');
        document.documentElement.style.setProperty('--select-multi-remove-hover', '#ef4444');
      }
    };

    darkModeMediaQuery.addListener(updateThemeVariables);
    updateThemeVariables(darkModeMediaQuery);

    return () => {
      darkModeMediaQuery.removeListener(updateThemeVariables);
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('interorganizational_token');
        if (!token) {
          navigate('/settings/CRM');
          return;
        }

        const formData = new FormData();
        formData.append('token', token);
        formData.append('platform', 'web');

        const response = await axios.post('https://task.satia.co/proxy.php/operator_tk/CategoryTask', formData);
        
        if (response.data) {
          setCategoryTask(response.data.categoryTask || []);
          setListUser(response.data.listUser || []);
          setCategoryPriority(response.data.categoryPriority || []);
        }
      } catch (err) {
        setError('خطا در دریافت اطلاعات');
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [navigate]);

  const handleChangeForm = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const priorityOptions = categoryPriority.map(priority => ({
    value: priority.value,
    label: priority.label
  }));

  const taskTypeOptions = categoryTask.map(task => ({
    value: task.value,
    label: task.label,
    Serial: task.Serial,
    OpRef: task.OpRef,
    Name: task.Name
  }));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">
            ثبت وظایف جدید
          </h2>
          <div className="h-1 w-20 bg-blue-500 mx-auto"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
              عنوان:
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.title}
              onChange={(e) => handleChangeForm('title', e.target.value)}
              placeholder="عنوان را وارد کنید"
            />
          </div>
          <div className="form-group">
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
              شماره تلفن مشترک:
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.adslTell}
              onChange={(e) => handleChangeForm('adslTell', e.target.value)}
              placeholder="شماره تلفن را وارد کنید"
            />
          </div>
          <div className="form-group">
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
              ارجاع به:
            </label>
            <Select
              options={userOptions}
              onChange={(option) => handleChangeForm('referTo', option.value)}
              placeholder="انتخاب کنید..."
              className="text-right"
              isRtl={true}
              styles={selectStyles}
              getOptionLabel={(option) => `${option.Name} - ${option.label}`}
              getOptionValue={(option) => option.value}
            />
          </div>

          <div className="form-group">
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
              رونوشت به:
            </label>
            <Select
              options={userOptions}
              isMulti
              onChange={(options) => handleChangeForm('ccTo', options.map(opt => opt.value))}
              placeholder="انتخاب کنید..."
              className="text-right"
              isRtl={true}
              styles={selectStyles}
              getOptionLabel={(option) => `${option.Name} - ${option.label}`}
              getOptionValue={(option) => option.value}
            />
          </div>

          <div className="form-group">
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
              الویت:
            </label>
            <Select
              options={priorityOptions}
              onChange={(option) => handleChangeForm('priority', option.value)}
              placeholder="انتخاب کنید..."
              className="text-right"
              isRtl={true}
              styles={selectStyles}
            />
          </div>

          <div className="form-group">
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
              تعداد روز کاری:
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.workDays}
              onChange={(e) => handleChangeForm('workDays', e.target.value)}
              min="1"
            />
          </div>

          <div className="form-group">
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
              نوع وظیفه:
            </label>
            <Select
              options={taskTypeOptions}
              onChange={(option) => handleChangeForm('taskType', option.value)}
              placeholder="انتخاب کنید..."
              className="text-right"
              isRtl={true}
              styles={selectStyles}
              getOptionLabel={(option) => `${option.Name} - ${option.OpRef}`}
              getOptionValue={(option) => option.value}
            />
          </div>

          <div className="form-group">
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
              توضیحات:
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="4"
              value={formData.description}
              onChange={(e) => handleChangeForm('description', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
              فایل‌های پیوست:
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer  dark:bg-gray-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>آپلود فایل</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept={Object.values(ALLOWED_FILE_TYPES).join(',')}
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="pr-1">یا فایل را اینجا رها کنید</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF، Word، تصاویر و ویدیو تا 10MB
                </p>
              </div>
            </div>
          </div>

          {formData.files.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">فایل‌های آپلود شده:</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {formData.files.map((file, index) => (
                  <li key={index} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      حذف
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:text-red-100 dark:border-red-800" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/settings/CRM')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'در حال ثبت...' : 'ثبت'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CRMNewMessage;