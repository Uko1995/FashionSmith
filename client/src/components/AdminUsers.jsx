import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../services/api";
import UserDetailsModal from "./UserDetailsModal";
import { getProfileImageUrl, getUserInitials } from "../utils/imageUtils";
import {
  MagnifyingGlassIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  DotsThreeVerticalIcon,
} from "@phosphor-icons/react";

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: adminAPI.getUsers,
  });

  const AllUsers = users?.data?.data || [];
  console.log("users in admin:", users);

  const filteredUsers = AllUsers?.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (userId) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  const closeDropdown = (userId) => {
    // Close the specific user's popover
    const popover = document.getElementById(`popover-${userId}`);
    if (popover) {
      popover.hidePopover();
    }
  };

  const handleDropdownAction = (action, userId) => {
    closeDropdown(userId);

    switch (action) {
      case "viewDetails":
        handleViewDetails(userId);
        break;
      case "sendMessage":
        console.log("Send Message:", userId);
        // Add send message logic here
        break;
      case "verifyUser":
        console.log("Verify User:", userId);
        // Add verify user logic here
        break;
      case "suspendUser":
        console.log("Suspend User:", userId);
        // Add suspend user logic here
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error loading users: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Users</h1>
          <p className="text-base-content/60 mt-2">
            Manage all registered users ({AllUsers?.length || 0} total)
          </p>
        </div>

        {/* Search */}
        <div className="form-control w-full max-w-md">
          <div className="input-group flex gap-2">
            <input
              type="text"
              placeholder="Search users..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-square">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}

      <div className="overflow-x-auto bg-base-100 shadow-lg">
        <table className="table table-zebra">
          <thead>
            <tr className="h-12">
              <th className="py-4">User</th>
              <th className="py-4">Email</th>
              <th className="py-4">Role</th>
              <th className="py-4">Status</th>
              <th className="py-4">Joined</th>
              <th className="py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers?.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="avatar">
                          <div className="w-10 h-10 lg:w-10 lg:h-10 rounded-lg">
                            {user?.profileImage ? (
                              <img
                                src={getProfileImageUrl(user.profileImage)}
                                alt="Profile"
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  console.log(
                                    "Image failed to load:",
                                    user.profileImage
                                  );
                                  // Hide the img and show fallback
                                  e.target.style.display = "none";
                                  e.target.nextElementSibling.style.display =
                                    "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="bg-primary text-primary-content rounded-full w-full h-full flex items-center justify-center"
                              style={{
                                display: user?.profileImage ? "none" : "flex",
                              }}
                            >
                              <span className="text-sm font-bold">
                                {getUserInitials(user)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-lg">{user.username}</div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`badge badge-lg capitalize ${
                        user.role === "admin" ? "badge-ghost" : "badge-primary"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      {user.isVerified ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                      <span
                        className={`badge ${
                          user.isVerified ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {user.isVerified ? "Verified" : "Pending"}
                      </span>
                    </div>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      popoverTarget={`popover-${user.id}`}
                      style={{ anchorName: `--anchor-${user.id}` }}
                    >
                      <DotsThreeVerticalIcon
                        className="w-4 h-4"
                        weight="bold"
                      />
                    </button>

                    <ul
                      className="dropdown dropdown-end menu w-52 mt-2 rounded-box bg-base-100 shadow-sm"
                      popover="auto"
                      id={`popover-${user.id}`}
                      style={{ positionAnchor: `--anchor-${user.id}` }}
                    >
                      <li>
                        <a
                          className="hover:bg-primary hover:text-primary-content cursor-pointer"
                          onClick={() =>
                            handleDropdownAction("viewDetails", user.id)
                          }
                        >
                          View Details
                        </a>
                      </li>
                      <li>
                        <a
                          className="hover:bg-primary hover:text-primary-content cursor-pointer"
                          onClick={() =>
                            handleDropdownAction("sendMessage", user.id)
                          }
                        >
                          Send Message
                        </a>
                      </li>
                      {!user.isVerified && (
                        <li>
                          <a
                            className="hover:bg-success hover:text-success-content cursor-pointer"
                            onClick={() =>
                              handleDropdownAction("verifyUser", user.id)
                            }
                          >
                            Verify User
                          </a>
                        </li>
                      )}
                      <li>
                        <a
                          className="text-error hover:bg-error hover:text-error-content cursor-pointer"
                          onClick={() =>
                            handleDropdownAction("suspendUser", user.id)
                          }
                        >
                          Suspend User
                        </a>
                      </li>
                    </ul>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-8">
                  <UserIcon className="h-12 w-12 mx-auto text-base-content/40 mb-2" />
                  <p className="text-base-content/60">
                    {searchTerm
                      ? "No users found matching your search"
                      : "No users found"}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-title">Total Users</div>
          <div className="stat-value text-primary">{AllUsers?.length || 0}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-title">Verified Users</div>
          <div className="stat-value text-success">
            {AllUsers?.filter((user) => user.isVerified).length || 0}
          </div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-title">Admin Users</div>
          <div className="stat-value text-warning">
            {AllUsers?.filter((user) => user.role === "admin").length || 0}
          </div>
        </div>
      </div>

      {/* User Details Modal */}

      <UserDetailsModal
        userId={selectedUserId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default AdminUsers;
