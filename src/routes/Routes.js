import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Automation from "../pages/Automation";
import Settings from "../pages/Settings";
import Newmessage from "../pages/Automation/newmessage";
import Mymessage from "../pages/Automation/mymessage";
import Kartablsearch from "../pages/Automation/kartablsearch";
import CC from "../pages/Automation/CC";

import Inbox from "../pages/Automation/Inbox";
import Kartablsend from "../pages/Automation/kartabl-send";
import General from "../pages/Settings/general";
import Secretariat from "../pages/Settings/secretariat";
import Email from "../pages/Settings/email-server";
import Officeautomation from "../pages/Settings/Officeautomation";
import Headers from "../pages/Settings/Headers";
import Users from "../pages/Settings/Users";
import Management from "../pages/Settings/Management";
import Permissions from "../pages/Settings/Permissions";
import Help from "../pages/khan/homekhan";
import Login from "../components/Login";
import EditMessage from "../pages/Automation/editemessage";
import ProtectedRoute from './ProtectedRoute';
import CRM from "../pages/Settings/CRM";
import CRMNEW from "../pages/Settings/CRMnewmessage";
import Hooby from "../Login";



const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="/Hooby" element={<ProtectedRoute><Hooby /></ProtectedRoute>} />

            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/general" element={<ProtectedRoute><General /></ProtectedRoute>} />
            <Route path="/settings/secretariat" element={<ProtectedRoute><Secretariat /></ProtectedRoute>} />
            <Route path="/settings/Email" element={<ProtectedRoute><Email /></ProtectedRoute>} />
            <Route path="/settings/Officeautomation" element={<ProtectedRoute><Officeautomation /></ProtectedRoute>} />
            <Route path="/settings/Headers" element={<ProtectedRoute><Headers /></ProtectedRoute>} />
            <Route path="/settings/Users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/settings/Management" element={<ProtectedRoute><Management /></ProtectedRoute>} />
            <Route path="/settings/Permissions" element={<ProtectedRoute><Permissions /></ProtectedRoute>} />
            <Route path="/settings/CRM" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
            <Route path="/inter-collection-communication" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
            <Route path="/inter-collection-communication/newmessage" element={<ProtectedRoute><CRMNEW /></ProtectedRoute>} />

            
            <Route path="/automation" element={<ProtectedRoute><Automation /></ProtectedRoute>} />
            <Route path="/automation/newmessage" element={<ProtectedRoute><Newmessage /></ProtectedRoute>} />
            <Route path="/automation/mymessage" element={<ProtectedRoute><Mymessage /></ProtectedRoute>} />
            <Route path="/Automation/kartablsearch" element={<ProtectedRoute><Kartablsearch /></ProtectedRoute>} />
            <Route path="/Automation/CC" element={<ProtectedRoute><CC /></ProtectedRoute>} />
            <Route path="/automation/editmessage/:id" element={<ProtectedRoute><EditMessage /></ProtectedRoute>} />
            <Route path="/Automation/Inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
            <Route path="/Automation/kartabl-send" element={<ProtectedRoute><Kartablsend /></ProtectedRoute>} />
        </Routes>
    );
};

export default AppRoutes;