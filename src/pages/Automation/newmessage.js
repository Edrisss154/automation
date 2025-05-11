import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import moment from "jalali-moment";
import { addLetter, getUsersLetterable, getUserById } from "../../api/api";
import { useNavigate } from "react-router-dom";
import ReferModal from "./Modal/ReferModal";
import InviteModal from "./Modal/InviteModal";
import SuccessModal from "./Modal/SuccessModal";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from "reactstrap";
import DOMPurify from "dompurify";
import axios from "axios";
import useUserRoles from "../hooks/useUserRoles";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import WebcamComponent from "../../components/WebcamComponent";
import Select from "react-select";
import DatePicker from "react-datepicker2";
import { useDropzone } from "react-dropzone";

const NewMessage = () => {
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

  const userOptions = users.map((user) => ({
    value: user.id,
    label: `${user.first_name} ${user.last_name || ""}`.trim(),
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

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const handleFileUpload = (event, type) => {
    const files = Array.from(event.target.files);
    const allowedFormats = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];

    const validFiles = files.filter((file) => {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      return allowedFormats.includes(fileExtension);
    });

    if (validFiles.length !== files.length) {
      alert("فقط فایل‌های با فرمت PDF, DOC, DOCX, JPG, JPEG, PNG مجاز هستند.");
      return;
    }

    const oversizedFiles = validFiles.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      alert(
        `حجم فایل‌های زیر بیش از حد مجاز (${
          MAX_FILE_SIZE / 1024 / 1024
        }MB) است:\n${oversizedFiles.map((file) => file.name).join("\n")}`
      );
      return;
    }

    if (uploadedFileCount + validFiles.length > 2) {
      alert("شما فقط می‌توانید حداکثر ۲ فایل آپلود کنید.");
      return;
    }

    const filesWithType = validFiles.map((file) => ({ file, type }));

    setUploadedFiles((prevFiles) => [...prevFiles, ...filesWithType]);
    setUploadedFileCount((prevCount) => prevCount + validFiles.length);
  };
// نگاشت IDهای سامانه به IDهای CRM
const userIdMapping = JSON.parse(process.env.REACT_APP_USER_ID_MAPPING || "{}");

// تابع برای تبدیل ID سامانه به ID CRM
const getCrmUserId = (localId) => {
  return userIdMapping[localId] || localId; // اگر ID در نگاشت نبود، همان ID محلی را برگردان
};

const createTaskInCRM = async (letterData) => {
  try {
    const token = localStorage.getItem("interorganizational_token");
    if (!token) {
      console.error("توکن CRM یافت نشد");
      return;
    }

    const taskFormData = new FormData();
    taskFormData.append("token", token);
    taskFormData.append("platform", "web");
    taskFormData.append("title", letterData.subject || "نامه جدید");
    taskFormData.append(
      "description",
      `نامه جدید  در سامانه نامه چی:  ${letterData.content.substring(0, 50000)}`
    );
    taskFormData.append("adslTell", ""); 
    taskFormData.append("referTo", getCrmUserId(letterData.toUserId) || "S205");
    taskFormData.append("ccTo", getCrmUserId(letterData.toUserId) || "S205"); 
    taskFormData.append("priority", convertUrgencyToEnglish(letterData.urgency) || "normal");
    taskFormData.append("categoryType", "21");
    taskFormData.append("status", ""); 
    taskFormData.append("workTime", ""); 

    if (letterData.attachments && letterData.attachments.length > 0) {
      letterData.attachments.forEach((file, index) => {
        if (file.file instanceof File) {
          taskFormData.append(`file${index + 1}`, file.file, file.file.name);
        }
      });
    }

    console.log("Task FormData entries:");
    for (let [key, value] of taskFormData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await axios.post(
      "https://task.satia.co/proxy.php/operator_tk/createNewTask",
      taskFormData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "Accept": "application/json", 
        },
      }
    );

    if (response.data.status) {
      console.log("وظیفه با موفقیت در CRM ثبت شد:", response.data);
    } else {
      console.error("خطا در ثبت وظیفه در CRM:", response.data);
    }
  } catch (err) {
    console.error("خطا در ارسال درخواست به CRM:", err.response?.data || err.message);
    alert("مشکلی در ثبت وظیفه در CRM رخ داد. لطفاً دوباره تلاش کنید.");
  }
};

const handleSubmit = async () => {
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
  formData.append("registered_at", gregorianDate);
  formData.append("role_id", selectedRole);

  if (importanceLevel1 === "وارده") {
    formData.append("from_user_id", fromUserId);
  } else if (importanceLevel1 === "صادره") {
    formData.append("to_user_id", toUserId);
  }

  if (uploadedFiles.length > 0) {
    uploadedFiles.forEach((file, index) => {
      formData.append(`attachments[]`, "file");
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

  try {
    const response = await addLetter(formData);
    console.log("Response from server:", response.data);
    setSuccessMessage("نامه با موفقیت ثبت شد!");
    setShowSuccessModal(true);

    // بررسی گیرنده یا ارجاع برای وحید قائم‌مقامی
    // const vahidId = "39";
    // //const vahidId = "98";

    // console.log("importanceLevel1:", importanceLevel1);
    // console.log("toUserId:", toUserId);
    // console.log("selectedToUser:", selectedToUser);
    // console.log("referData:", referData);
    // console.log("carbonCopy:", carbonCopy.map((user) => ({ id: user.id, name: `${user.first_name} ${user.last_name}` })));
    // const isVahidRecipient =
    //   String(toUserId) === vahidId ||
    //   referData.some((ref) => String(ref.receiver) === vahidId) ||
    //   carbonCopy.some((cc) => String(cc.id) === vahidId);
    // console.log("isVahidRecipient:", isVahidRecipient);

    // if (isVahidRecipient) {
    //   console.log("Sending task to CRM for Vahid...");
    //   console.log("CRM token:", localStorage.getItem("interorganizational_token"));
    //   console.log("CRM User ID:", getCrmUserId(toUserId));
    //   await createTaskInCRM({
    //     subject,
    //     content: cleanedEditorValue,
    //     toUserId,
    //     urgency: priorityLevel,
    //     attachments: uploadedFiles,
    //   });
    // } else {
    //   console.log("Vahid is not a recipient, skipping CRM task creation.");
    // }

    setTimeout(() => {
      setShowSuccessModal(false);
      navigate("/automation");
    }, 1000);
  } catch (err) {
    console.error("Error from server:", err.response?.data || err.message);
    setError("مشکلی در ارسال داده‌ها وجود دارد");
  }
};
  const handleSubmitAndRefer = () => {
    setShowReferModal(true);
  };const handleReferSubmit = async (referData, selectedMessageId, carbonCopy = []) => {
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
  
      // بررسی گیرنده یا ارجاع برای وحید قائم‌مقامی
      const vahidId = process.env.REACT_APP_VAHID_ID;
  
      // شرط جدید: وحید فقط باید گیرنده (toUserId یا referData) باشد
      const isVahidRecipient =
        String(toUserId) === vahidId || referData.some((ref) => String(ref.receiver) === vahidId);
      const shouldCreateTask = isVahidRecipient;
  
      // لاگ برای دیباگ
      // console.log("handleReferSubmit - importanceLevel1:", importanceLevel1);
      // console.log("handleReferSubmit - toUserId:", toUserId);
      // console.log("handleReferSubmit - selectedToUser:", selectedToUser);
      // console.log("handleReferSubmit - referData:", referData);
      console.log(
        "handleReferSubmit - carbonCopy:",
        carbonCopy.map((user) => ({ id: user.id, name: `${user.first_name} ${user.last_name}` }))
       );
      // console.log("handleReferSubmit - isVahidRecipient:", isVahidRecipient);
      // console.log("handleReferSubmit - shouldCreateTask:", shouldCreateTask);
  
      if (shouldCreateTask) {
        // console.log("Sending task to CRM for Vahid...");
        // console.log("CRM token:", localStorage.getItem("interorganizational_token"));
        // console.log("CRM User ID:", getCrmUserId(vahidId));
        await createTaskInCRM({
          subject,
          content: cleanedEditorValue,
          toUserId: vahidId, // استفاده از vahidId برای اطمینان
          urgency: priorityLevel,
          attachments: uploadedFiles,
        });
      } else {
        console.log("Vahid is not a recipient, skipping CRM task creation.");
      }
  
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
    control: (base) => ({
      ...base,
      backgroundColor: 'white dark:white',
      borderColor: 'var(--select-border)',
      '&:hover': {
        borderColor: 'var(--select-border-hover)'
      }
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'white dark:white',
      border: '1px solid var(--select-border)'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? 'var(--select-option-hover)' : 'var(--select-bg)',
      color: 'var(--select-text)',
      '&:hover': {
        backgroundColor: 'var(--select-option-hover)'
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: 'dark:white'
    }),
    input: (base) => ({
      ...base,
      color: 'var(--select-text)'
    }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--select-placeholder)'
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

    document.documentElement.style.setProperty('--select-bg', 'white ');
    document.documentElement.style.setProperty('--select-border', '#D1D5DB');
    document.documentElement.style.setProperty('--select-border-hover', '#9CA3AF');
    document.documentElement.style.setProperty('--select-text', '#1F2937');
    document.documentElement.style.setProperty('--select-placeholder', '#6B7280');
    document.documentElement.style.setProperty('--select-option-hover', '#F3F4F6');

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateThemeVariables = (e) => {
      if (e.matches) {
        document.documentElement.style.setProperty('--select-bg', '#1F2937');
        document.documentElement.style.setProperty('--select-border', '#4B5563');
        document.documentElement.style.setProperty('--select-border-hover', '#6B7280');
        document.documentElement.style.setProperty('--select-text', '#E5E7EB');
        document.documentElement.style.setProperty('--select-placeholder', '#9CA3AF');
        document.documentElement.style.setProperty('--select-option-hover', '#374151');
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

  return (
    <div
      className={`max-w-3xl mx-auto p-5 rounded-lg shadow-md dir-rtl font-vazir transition-colors duration-300 dark:bg-gray-800 dark:text-gray-100`}
    >
      <div className="user-input mb-5">
        <div className="user-info flex items-center mb-5 mr-5">
          <img src="/picture/icons/semat.svg" alt="User Icon" className="w-8 h-8 mr-2" />
          <label
            htmlFor="userRole"
            className={`font-bold mr-2 dark:text-gray-200`}
          >
            سمت:
          </label>
          <select
            id="userRole"
            value={selectedRole}
            onChange={handleRoleChange}
            className={`border rounded-md p-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200`}
          >
            {userRoles.map((role, index) => (
              <option key={index} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className={`flex justify-center items-center mb-5 p-4 rounded-md shadow-sm dark:bg-gray-700`}
      >
        <h2
          className={`text-2xl font-bold dark:text-gray-100`}
        >
          ایجاد نامه جدید
        </h2>
      </div>

      <form className="flex flex-col gap-5">
        <div className="flex gap-4">
          <label className="flex items-center dark:text-gray-200">
            داخلی
            <input
              type="radio"
              name="dakheli"
              value="داخلی"
              checked={importanceLevel1 === "داخلی"}
              onChange={(e) => setImportanceLevel1(e.target.value)}
              className={`mr-2 dark:accent-blue-400`}
            />
          </label>
          <label className="flex items-center dark:text-gray-200">
            صادره
            <input
              type="radio"
              name="sadere"
              value="صادره"
              checked={importanceLevel1 === "صادره"}
              onChange={(e) => setImportanceLevel1(e.target.value)}
              className={`mr-2 dark:accent-blue-400`}
            />
          </label>
          <label className="flex items-center dark:text-gray-200">
            وارده
            <input
              type="radio"
              name="varede"
              value="وارده"
              checked={importanceLevel1 === "وارده"}
              onChange={(e) => setImportanceLevel1(e.target.value)}
              className={`mr-2 dark:accent-blue-400 `}
            />
          </label>
        </div>

        <div className="form-group flex flex-col gap-2">
          {importanceLevel1 === "وارده" && (
            <>
              <label
                className={`font-bold dark:text-gray-200`}
              >
                فرستنده (از مخاطبین غیرداخلی):
              </label>
              <Select
                options={fromUserOptions}
                value={selectedFromUser}
                onChange={(selectedOption) => {
                  setSelectedFromUser(selectedOption);
                  setFromUserId(selectedOption ? selectedOption.value : "");
                }}
                placeholder="انتخاب فرستنده"
                isSearchable
                noOptionsMessage={() => "نتیجه‌ای یافت نشد"}
                className="w-full"
                styles={selectStyles}
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: '#60A5FA',
                    primary75: '#3B82F6',
                    primary50: '#93C5FD',
                    primary25: '#BFDBFE',
                  },
                })}
              />
            </>
          )}
          {importanceLevel1 === "صادره" && (
            <>
              <label
                className={`font-bold dark:text-gray-200 `}
              >
                گیرنده (به مخاطبین غیرداخلی):
              </label>
              <Select
                options={toUserOptions} 
                value={selectedToUser}
                onChange={(selectedOption) => {
                  setSelectedToUser(selectedOption);
                  setToUserId(selectedOption ? selectedOption.value : "");
                }}
                placeholder="انتخاب گیرنده"
                isSearchable
                noOptionsMessage={() => "نتیجه‌ای یافت نشد"}
                className="w-full"
                styles={selectStyles}
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: '#60A5FA',
                    primary75: '#3B82F6',
                    primary50: '#93C5FD',
                    primary25: '#BFDBFE',
                  },
                })}
              />
            </>
          )}
        </div>
        

        <div className="form-group flex flex-col gap-2">
          <label
            className={`font-bold dark:text-gray-200`}
          >
            تاریخ:
          </label>
          <div className="flex items-center gap-2 w-full">
            {importanceLevel1 === "وارده" ? (
              <>
                <img src="/picture/icons/Group 3274.svg" alt="انتخاب تاریخ" className="w-8 h-8" />
                <div className="flex-1">
                  <DatePicker
                    isGregorian={false}
                    timePicker={false}
                    value={startDate ? moment(startDate, "jYYYY/jMM/jDD") : null}
                    onChange={(value) => setStartDate(value.format("jYYYY/jMM/jDD"))}
                    className={`border rounded-md p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 [&_input]:dark:bg-gray-700 [&_input]:dark:text-gray-200 [&_.calendarContainer]:dark:bg-gray-700 [&_.calendarContainer]:dark:text-gray-200 [&_.selected]:dark:bg-blue-600 [&_.selected]:dark:text-white [&_.today]:dark:bg-gray-600`}
                    inputFormat="jYYYY/jMM/jDD"
                  />
                </div>
              </>
            ) : (
              <>
                <img src="/picture/icons/Group 3274.svg" alt="انتخاب تاریخ" className="w-8 h-8" />
                <div className="flex-1">
                  <input
                    type="text"
                    className={`border rounded-md p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200`}
                    value={startDate || ""}
                    placeholder="تاریخ را انتخاب کنید"
                    readOnly
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="form-group flex flex-col gap-2">
          <label
            className={`font-bold dark:text-gray-200`}
          >
            موضوع: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200`}
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="form-group flex flex-col gap-2">
          <label
            className={`font-bold dark:text-gray-200`}
          >
            متن: <span className="text-red-500">*</span>
          </label>
          <div className="dark:bg-gray-700 rounded-lg">
            <ReactQuill
              theme="snow"
              value={editorValue}
              onChange={handleChange}
              modules={modules}
              className="w-full text-gray-800 dark:text-gray-200 [&_.ql-toolbar]:dark:bg-gray-600 [&_.ql-toolbar]:dark:border-gray-500 [&_.ql-toolbar_.ql-stroke]:dark:stroke-gray-200 [&_.ql-toolbar_.ql-fill]:dark:fill-gray-200 [&_.ql-toolbar_.ql-picker-label]:dark:text-gray-200 [&_.ql-toolbar_.ql-picker-item]:dark:text-gray-200 [&_.ql-container]:dark:border-gray-500 [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:dark:bg-gray-700 [&_.ql-editor]:dark:text-gray-200"
              style={{ direction: "rtl", textAlign: "right" }}
            />
          </div>
        </div>

        <div className="form-group flex flex-col gap-2">
         <div className="flex flex-col gap-4 md:flex-row md:gap-8">
           <div className="flex flex-col gap-2">
             <label
               className={`font-bold dark:text-gray-200`}
             >
               سطح اهمیت:
             </label>
             <div className="flex gap-4">
               <label className="flex items-center dark:text-gray-200">
                 عادی
                 <input
                   type="radio"
                   name="security"
                   value="عادی"
                   checked={importanceLevel === "عادی"}
                   onChange={(e) => setImportanceLevel(e.target.value)}
                   className={`mr-2 dark:accent-blue-400`}
                 />
               </label>
               <label className="flex items-center dark:text-gray-200">
                 محرمانه
                 <input
                   type="radio"
                   name="security"
                   value="محرمانه"
                   checked={importanceLevel === "محرمانه"}
                   onChange={(e) => setImportanceLevel(e.target.value)}
                   className={`mr-2 dark:accent-blue-400`}
                 />
               </label>
               <label className="flex items-center dark:text-gray-200">
                 سری
                 <input
                   type="radio"
                   name="security"
                   value="سری"
                   checked={importanceLevel === "سری"}
                   onChange={(e) => setImportanceLevel(e.target.value)}
                   className={`mr-2 dark:accent-blue-400`}
                 />
               </label>
             </div>
           </div>
         </div>
       </div>
        <div className="form-group flex flex-col gap-2">
          
          <div className="flex flex-col gap-4 md:flex-row md:gap-8">
            
            <div className="flex flex-col gap-2">
              <label
                className={`font-bold dark:text-gray-200`}
              >
                فوریت:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center dark:text-gray-200">
                  عادی
                  <input
                    type="radio"
                    name="priority"
                    value="عادی"
                    checked={priorityLevel === "عادی"}
                    onChange={(e) => setPriorityLevel(e.target.value)}
                    className={`mr-2 dark:accent-blue-400`}
                  />
                </label>
                <label className="flex items-center dark:text-gray-200">
                  فوری
                  <input
                    type="radio"
                    name="priority"
                    value="فوری"
                    checked={priorityLevel === "فوری"}
                    onChange={(e) => setPriorityLevel(e.target.value)}
                    className={`mr-2 dark:accent-blue-400`}
                  />
                </label>
                <label className="flex items-center dark:text-gray-200">
                  آنی
                  <input
                    type="radio"
                    name="priority"
                    value="آنی"
                    checked={priorityLevel === "آنی"}
                    onChange={(e) => setPriorityLevel(e.target.value)}
                    className={`mr-2 dark:accent-blue-400`}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

       

        <div className="form-group flex flex-col gap-2">
          <label
            className={`font-bold dark:text-gray-200`}
          >
            آپلود/افزودن مدرک:
          </label>
          <div className="flex gap-4">
            <div>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "file")}
                className="hidden"
                id="file-upload-1"
                accept="image/*"
              />
              <label
                htmlFor="file-upload-1"
                className={`px-4 py-2 rounded-md cursor-pointer bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200`}
              >
                آپلود فایل
              </label>
            </div>
            <div>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "letter")}
                className="hidden"
                id="file-upload-2"
                accept="image/*"
              />
              <label
                htmlFor="file-upload-2"
                className={`px-4 py-2 rounded-md cursor-pointer bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200`}
              >
                افزودن مدرک
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2">
                {file.file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file.file)}
                    alt={`Uploaded ${index}`}
                    className="w-24 h-24 object-cover mr-2"
                  />
                ) : (
                  <span className="dark:text-gray-200">
                    {file.file.name}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className={`px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200`}
                >
                  حذف
                </button>
              </div>
            ))}
            {scannedImages.map((image, index) => (
              <div key={index} className="flex items-center gap-2">
                <img src={image} alt={`Scanned ${index}`} className="w-24 h-24 object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveScannedImage(index)}
                  className={`px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200`}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group flex flex-col gap-2 relative" ref={dropdownRef}>
          <label
            className={`font-bold dark:text-gray-200`}
          >
            رونوشت:
          </label>
          <div className="relative w-1/2">
            <input
              type="text"
              className={`border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200`}
              value={searchTermCC}
              onChange={handleSearchCC}
              onClick={handleInputClick}
              placeholder="نام مخاطب را وارد کنید..."
            />
            {isDropdownOpen && filteredCCUsers.length > 0 && (
              <ul
                className={`absolute w-full max-h-60 overflow-y-auto border rounded-md shadow-md z-10 mt-1 bg-gray-0 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200`}
              >
                {filteredCCUsers.map((user) => (
                  <li
                    key={user.id}
                    onClick={() => handleSelectUserCC(user)}
                    className={`p-2 cursor-pointer text-gray-800  hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 flex items-center gap-2`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white  overflow-hidden">
                      {user.profile ? (
                        <img 
                          src={`${user.profile}`}
                          alt={`${user.first_name} ${user.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {user.first_name?.[0]?.toUpperCase() || ''}{user.last_name?.[0]?.toUpperCase() || ''}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.first_name} {user.last_name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{user.email || 'بدون ایمیل'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="selected-users flex flex-wrap gap-2 mt-2">
          {carbonCopy.map((user) => (
            <span
              key={user.id}
              className={`flex items-center rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white overflow-hidden">
                  {user.profile ? (
                    <img 
                      src={`${user.profile}`}
                      alt={`${user.first_name} ${user.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {user.first_name?.[0]?.toUpperCase() || ''}{user.last_name?.[0]?.toUpperCase() || ''}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{user.first_name} {user.last_name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{user.email || 'بدون ایمیل'}</span>
                </div>
              </div>
              <button
                onClick={() => handleRemoveUser(user.id)}
                className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-full transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          ))}
        </div>

        <div className="form-actions flex justify-end gap-4 flex-wrap">
          <button
            type="button"
            className={`px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 dark:bg-green-700 dark:hover:bg-green-800 dark:disabled:bg-gray-600 transition-colors duration-200`}
            onClick={handleSubmit}
            disabled={!validateForm() || isSubmitting}
          >
            ثبت
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 dark:bg-blue-700 dark:hover:bg-blue-800 dark:disabled:bg-gray-600 transition-colors duration-200`}
            onClick={handleSubmitAndRefer}
            disabled={!validateForm() || isSubmitting}
          >
            ثبت و ارجاع
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200`}
            onClick={handleCancel}
          >
            انصراف
          </button>
        </div>
      </form>

      <ReferModal
        isOpen={showReferModal}
        toggle={() => setShowReferModal(false)}
        handleAddRefer={handleAddRefer}
        receiver={receiver}
        setReceiver={setReceiver}
        direction={direction}
        setDirection={setDirection}
        margin={margin}
        setMargin={setMargin}
        privateNote={privateNote}
        setPrivateNote={setPrivateNote}
        referData={referData}
        selectedRole={selectedRole}
        isAdded={isAdded}
        setShowInviteModal={setShowInviteModal}
        setIsAdded={setIsAdded}
        onSubmitRefer={handleReferSubmit}
        userRoles={userRoles}
        letterType={convertTypeToEnglish(importanceLevel1)}
        carbonCopy={carbonCopy}
      />

      <InviteModal
        isOpen={showInviteModal}
        toggle={() => setShowInviteModal(false)}
        handleSendInvite={handleSendInvite}
        inviteName={inviteName}
        setInviteName={setInviteName}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        inviteMobile={inviteMobile}
        setInviteMobile={setInviteMobile}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        toggle={() => setShowSuccessModal(false)}
        message={successMessage}
      />

      <Modal isOpen={showReferTableModal} toggle={() => setShowReferTableModal(false)}>
        <ModalHeader toggle={() => setShowReferTableModal(false)}>ارجاع داده‌ها</ModalHeader>
        <ModalBody>
          <button
            type="button"
            className={`px-4 py-2 rounded-md mb-4 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200`}
            onClick={handleAddRefer}
          >
            اضافه کردن
          </button>
          <Table
            striped
            bordered
            hover
            className="dark:bg-gray-700 dark:text-gray-200"
          >
            <thead>
              <tr>
                <th>گیرنده</th>
                <th>جهت</th>
                <th>هامش</th>
                <th>یادداشت خصوصی</th>
                <th>سمت</th>
              </tr>
            </thead>
            <tbody>
              {referData.map((data, index) => (
                <tr key={index}>
                  <td>{data.receiver}</td>
                  <td>{data.direction}</td>
                  <td>{data.margin}</td>
                  <td>{data.privateNote}</td>
                  <td>{data.selectedRole}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => setShowReferTableModal(false)}
            className="dark:bg-blue-700 dark:text-gray-100"
          >
            بستن
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default NewMessage;