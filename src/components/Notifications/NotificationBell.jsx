// src/components/Notifications/NotificationBell.jsx
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import notificationService from "../../services/notificationService";
import proposalService from "../../services/proposalService";
import { FaBell } from "react-icons/fa";
import { toast } from "react-toastify";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [socket, setSocket] = useState(null);

  const readUser = () => {
    try {
      const u = localStorage.getItem("user");
      if (u) return JSON.parse(u);
    } catch {
      // ignore
    }
    return null;
  };
  const user = readUser();

  // Fetch existing notifications on mount
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await notificationService.getNotifications();
        const items = res.data || [];
        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.read).length);
      } catch (err) {
        console.error("fetch notifications:", err);
      }
    };
    fetch();
  }, []);

  // Socket setup
  useEffect(() => {
    if (!user) return;
    const s = io(SOCKET_URL, { transports: ["websocket"], withCredentials: true });
    setSocket(s);

    s.on("connect", () => {
      s.emit("register", { userId: user._id });
    });

    s.on("notification", (n) => {
      setNotifications((prev) => [n, ...prev]);
      setUnreadCount((c) => c + 1);
      toast.info("New notification");
    });

    s.on("disconnect", () => {
      console.warn("Socket disconnected");
    });

    return () => {
      s.disconnect();
    };
  }, [user]);

  const markRead = async (id) => {
    try {
      await notificationService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (socket) {
        socket.emit("read_notification", { id, userId: user._id });
      }
    } catch (err) {
      console.error("mark read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await Promise.all(
        notifications.filter((n) => !n.read).map((n) => notificationService.markNotificationRead(n._id))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      if (socket) {
        socket.emit("read_all", { userId: user._id });
      }
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("mark all read:", err);
    }
  };

  const handleAccept = async (notification) => {
    try {
      const pid = notification.payload.proposalId;
      if (!pid) return toast.error("Proposal id missing");
      await proposalService.acceptProposal(pid);
      toast.success("Proposal accepted");
      await markRead(notification._id);
      if (socket) {
        socket.emit("proposal_accepted", {
          proposalId: pid,
          clientId: user._id,
          freelancerId: notification.payload.freelancerId,
        });
      }
    } catch (err) {
      console.error("accept err:", err);
      toast.error("Failed to accept");
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button onClick={() => setOpen(!open)} className="flex items-center space-x-2">
        <FaBell size={18} />
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-red-500 text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-2 max-h-96 overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-500 underline"
                >
                  Mark all as read
                </button>
              )}
            </div>
            {notifications.length === 0 && (
              <div className="text-sm text-gray-500 p-2">No notifications</div>
            )}
            {notifications.map((n) => (
              <div
                key={n._id || n.id}
                className={`p-2 mb-2 border ${n.read ? "bg-gray-50" : "bg-white"}`}
              >
                <div className="text-sm font-medium">{n.type}</div>
                <div className="text-xs text-gray-600">
                  {n.payload?.freelancerName || n.payload?.projectTitle}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    {!n.read && (
                      <button
                        onClick={() => markRead(n._id || n.id)}
                        className="text-xs underline mr-2"
                      >
                        Mark read
                      </button>
                    )}
                    {n.type === "proposal_received" && (
                      <button
                        onClick={() => handleAccept(n)}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Accept
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(n.createdAt || n.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
