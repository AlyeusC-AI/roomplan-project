import React from "react";
import { NavUser } from "./nav-user";
import CreateOptionsPopover from "./create-options-popover";
import NotificationPopover from "./notification-popover";

const ActionOptionsSidebar = () => {
  const handleCreateProject = () => {
    console.log("Create project clicked");
    // Add your project creation logic here
  };

  const handleCreateUser = () => {
    console.log("Create user clicked");
    // Add your user creation logic here
  };

  const handleCreateGroup = () => {
    console.log("Create group clicked");
    // Add your group creation logic here
  };

  const handleNotificationClick = (id: string) => {
    console.log("Notification clicked:", id);
    // Add your notification handling logic here
  };

  const handleContactClick = (id: string) => {
    console.log("Contact clicked:", id);
    // Add your contact handling logic here
  };

  // Example data - replace with your actual data
  const headerNotifications = [
    {
      id: "1",
      title: "Project Update",
      message: "Your project has been updated",
      type: "info" as const,
      timestamp: "2m ago",
    },
  ];

  const contactNotifications = [
    {
      id: "1",
      name: "John Doe",
      message: "Sent you a message about the project",
      timestamp: "5m ago",
      unread: true,
    },
  ];

  return (
    <div className='flex items-center'>
      <CreateOptionsPopover
        onCreateProject={handleCreateProject}
        onInviteUser={handleCreateUser}
        onCreateGroup={handleCreateGroup}
      />
      <NotificationPopover
        headerNotifications={headerNotifications}
        contactNotifications={contactNotifications}
        onNotificationClick={handleNotificationClick}
        onContactClick={handleContactClick}
      />
      <NavUser withAvatar={false} />
    </div>
  );
};

export default ActionOptionsSidebar;