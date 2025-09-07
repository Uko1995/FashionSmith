import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../services/api";
import UserDetailsModal from "./UserDetailsModal";
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  UsersIcon,
} from "@phosphor-icons/react";

const getRoleBadge = (role) => {
  switch (role) {
    case "admin":
      return "badge-secondary";
    case "user":
      return "badge-primary";
    default:
      return "badge-ghost";
  }
};

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: adminAPI.getUsers,
  });

  const users = usersData?.data?.data || [];

  const filteredUsers = users.filter(
    (user) =>
      (user.username &&
        user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email &&
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-base-content">
            Users
          </h1>
          <p className="text-base-content/60 mt-1 sm:mt-2">
            Manage all registered users ({users.length} total)
          </p>
        </div>
        <button className="btn btn-primary">
          <UserPlusIcon className="h-5 w-5" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="form-control">
        <div className="input-group flex gap-1">
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-square">
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Users List for Mobile */}
      <div className="sm:hidden space-y-4">
        {filteredUsers?.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user._id} className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-10">
                        <span className="text-sm">
                          {user.username?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">{user.username}</div>
                      <div className="text-sm text-base-content/70">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className={`badge ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <div className="text-xs text-base-content/60">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    className="btn btn-xs btn-ghost"
                    onClick={() => {
                      setSelectedUser(user);
                      document.getElementById("user_details_modal").showModal();
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <UsersIcon className="h-12 w-12 mx-auto text-base-content/40 mb-2" />
            <p className="text-base-content/60">No users found</p>
          </div>
        )}
      </div>

      {/* Users Table for Desktop */}
      <div className="hidden sm:block card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers?.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-10">
                              <span className="text-sm">
                                {user.username?.charAt(0).toUpperCase() || "?"}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{user.username}</div>
                            <div className="text-sm opacity-50">
                              {user.location || "No location"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {user.email}
                        <br />
                        <span className="badge badge-ghost badge-sm">
                          {user.phoneNumber || "No phone"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            user.isVerified ? "badge-success" : "badge-warning"
                          }`}
                        >
                          {user.isVerified ? "Verified" : "Not Verified"}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => {
                            setSelectedUser(user);
                            document
                              .getElementById("user_details_modal")
                              .showModal();
                          }}
                        >
                          details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      <UsersIcon className="h-12 w-12 mx-auto text-base-content/40 mb-2" />
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
        </div>
      </div>

      {selectedUser && (
        <UserDetailsModal user={selectedUser} modalId="user_details_modal" />
      )}
    </div>
  );
};

export default AdminUsers;
