import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import Loading from "../common/Loading";
import HousingCard from "../housing/HousingCard";
import MessagingPage from "../messaging/MessagingPage";
import NotificationsList from "../notifications/NotificationsList";
import ProfileEdit from "../profile/ProfileEdit";
import ChangePassword from "../profile/ChangePassword";
import { toast } from "react-toastify";
import {
  FaUsers,
  FaEdit,
  FaHome,
  FaEye,
  FaEyeSlash,
  FaBell,
  FaTrash,
  FaBan,
  FaCheck,
  FaCog,
  FaChartBar,
  FaUser,
  FaEnvelope,
  FaTrophy,
  FaSearch,
  FaArrowLeft,
  FaLock,
  FaCheckCircle,
  FaComments,
} from "react-icons/fa";
import "./AdminDashboard.css";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const AdminDashboard = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, theme } = useTheme();

  const VALID_TABS = [
    "overview",
    "users",
    "housings",
    "profile",
    "messages",
    "notifications",
    "user-detail",
  ];

  const getTabFromURL = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    return VALID_TABS.includes(tab) ? tab : "overview";
  };

  const [activeTab, setActiveTab] = useState(getTabFromURL);

  useEffect(() => {
    setActiveTab(getTabFromURL());
  }, [location.search]); // eslint-disable-line

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/dashboard?tab=${tab}`, { replace: true });
  };
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [housings, setHousings] = useState([]);
  const [proprietaires, setProprietaires] = useState([]); // 🆕 NOUVEAU
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterOwner, setFilterOwner] = useState("");
  const [filterVisibility, setFilterVisibility] = useState("all");
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [showEditProfile, setShowEditProfile] = useState(false); // ✅ AJOUTÉ
  // ... autres états

  useEffect(() => {
    loadData();
  }, [activeTab, filterOwner, filterVisibility]);

  // 🆕 Charger la liste des propriétaires au montage
  useEffect(() => {
    loadProprietaires();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === "overview") {
        const response = await api.get("/admin/stats/detailed/");
        setStats(response.data);
      } else if (activeTab === "users") {
        const response = await api.get("/admin/users/enhanced/");
        setUsers(response.data);
      } else if (activeTab === "housings") {
        const params = {};
        if (filterOwner) params.owner = filterOwner;
        if (filterVisibility !== "all") params.visibility = filterVisibility;

        const response = await api.get("/admin/housings/", { params });
        setHousings(response.data.results || response.data);
      }
    } catch (error) {
      console.error("Erreur chargement:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // 🆕 NOUVEAU: Charger uniquement les propriétaires
  const loadProprietaires = async () => {
    try {
      const response = await api.get("/admin/proprietaires/");
      setProprietaires(response.data);
    } catch (error) {
      console.error("Erreur chargement propriétaires:", error);
    }
  };

  // ==================== GESTION UTILISATEURS ====================

  const handleViewUserDetail = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}/`);
      setSelectedUser(response.data);
      handleTabChange("user-detail");
    } catch (error) {
      toast.error("Erreur lors du chargement");
    }
  };

  const handleBlockUser = async (userId, duration) => {
    try {
      await api.post(`/admin/users/${userId}/block/`, { duration });
      toast.success("Utilisateur bloqué");
      loadData();
    } catch (error) {
      toast.error("Erreur lors du blocage");
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/unblock/`);
      toast.success("Utilisateur débloqué");
      loadData();
    } catch (error) {
      toast.error("Erreur lors du déblocage");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        "Attention: Supprimer cet utilisateur et tous ses logements ?",
      )
    )
      return;

    try {
      await api.delete(`/admin/users/${userId}/delete/`);
      toast.success("Utilisateur supprimé");
      loadData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // ==================== GESTION LOGEMENTS ====================

  const handleToggleVisibility = async (housingId) => {
    try {
      const response = await api.post(
        `/admin/housings/${housingId}/toggle-visibility/`,
      );
      toast.success(response.data.message);
      loadData();
    } catch (error) {
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDeleteHousing = async (housingId) => {
    if (!window.confirm("Supprimer ce logement ?")) return;

    try {
      await api.delete(`/admin/housings/${housingId}/delete/`);
      toast.success("Logement supprimé");
      loadData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // Génère une couleur unique basée sur le nom
  const getAvatarColor = (name) => {
    let hash = 0;
    const text = name || "User";
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 65%, 45%)`;
  };

  // Récupère les initiales (ex: "JD" pour Jean Dupont)
  const getInitials = (user) => {
    const first = user.first_name || "";
    const last = user.last_name || user.username || "U";
    if (first && last)
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    return last.charAt(0).toUpperCase();
  };

  // ==================== RENDER ====================

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="overview-section">
            <h1>
              <FaChartBar /> {t("dashboard_overview")}
            </h1>

            {loading ? (
              <Loading />
            ) : (
              stats && (
                <>
                  {/* Statistiques Utilisateurs */}
                  <section className="stats-section">
                    <h2>
                      <FaUsers /> {t("users")}
                    </h2>

                    <div className="stats-grid">
                      <div className="stat-card blue">
                        <div className="stat-icon">
                          <FaUsers />
                        </div>
                        <div className="stat-number">{stats.users.total}</div>
                        <div className="stat-label">{t("total")}</div>
                      </div>

                      <div className="stat-card green">
                        <div className="stat-icon">
                          <FaHome />
                        </div>
                        <div className="stat-number">
                          {stats.users.proprietaires}
                        </div>
                        <div className="stat-label">{t("owners")}</div>
                      </div>

                      <div className="stat-card purple">
                        <div className="stat-icon">
                          <FaSearch />
                        </div>
                        <div className="stat-number">
                          {stats.users.locataires}
                        </div>
                        <div className="stat-label">{t("tenants")}</div>
                      </div>

                      <div className="stat-card orange">
                        <div className="stat-icon">
                          <FaBan />
                        </div>
                        <div className="stat-number">{stats.users.blocked}</div>
                        <div className="stat-label">{t("blocked")}</div>
                      </div>
                    </div>
                  </section>

                  {/* Statistiques Logements */}
                  <section className="stats-section">
                    <h2>
                      <FaHome /> {t("housings")}
                    </h2>

                    <div className="stats-grid">
                      <div className="stat-card blue">
                        <div className="stat-icon">
                          <FaChartBar />
                        </div>
                        <div className="stat-number">
                          {stats.housings.total}
                        </div>
                        <div className="stat-label">{t("total")}</div>
                      </div>

                      <div className="stat-card green">
                        <div className="stat-icon">
                          <FaEye />
                        </div>
                        <div className="stat-number">
                          {stats.housings.visible}
                        </div>
                        <div className="stat-label">{t("visible")}</div>
                      </div>

                      <div className="stat-card orange">
                        <div className="stat-icon">
                          <FaLock />
                        </div>
                        <div className="stat-number">
                          {stats.housings.hidden}
                        </div>
                        <div className="stat-label">{t("hidden")}</div>
                      </div>

                      <div className="stat-card purple">
                        <div className="stat-icon">
                          <FaCheckCircle />
                        </div>
                        <div className="stat-number">
                          {stats.housings.disponible}
                        </div>
                        <div className="stat-label">{t("available")}</div>
                      </div>
                    </div>
                  </section>

                  {/* Top Propriétaires */}
                  <section className="stats-section">
                    <h2>
                      <FaTrophy /> {t("top_owners")}
                    </h2>

                    <div className="top-users-list">
                      {stats.users.top_owners.map((owner, idx) => (
                        <div key={owner.id} className="top-user-item">
                          <div className="rank">#{idx + 1}</div>
                          (
                          <img
                            src={owner.photo || "/default-avatar.png"}
                            alt={owner.username}
                            onError={(e) => {
                              e.target.src = "/default-avatar.png";
                            }}
                          />
                          ):(
                          <div
                            className="avatar-initials-only"
                            style={{
                              backgroundColor: getAvatarColor(
                                owner.last_name || owner.username,
                              ),
                            }}
                            title={`${owner.first_name || ""} ${owner.last_name || owner.username}`}
                          >
                            {getInitials(owner)}
                          </div>
                          <div className="user-info">
                            <h4>{owner.username}</h4>
                            <p>{owner.email}</p>
                          </div>
                          <div className="user-stats">
                            <span>
                              <FaHome /> {owner.housings_count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )
            )}
          </div>
        );

      case "users":
        return (
          <div className="users-section">
            <h1>
              <FaUsers /> {t("users_management")}
            </h1>

            {loading ? (
              <Loading />
            ) : (
              <div className="users-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{t("photo")}</th>
                      <th>{t("name")}</th>
                      <th>{t("email")}</th>
                      <th>{t("role")}</th>
                      <th>{t("housings")}</th>
                      <th>{t("status")}</th>
                      <th>{t("registered_on")}</th>
                      <th>{t("actions")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          {user.photo ? (
                            <img
                              src={user.photo}
                              alt={user.username}
                              className="user-avatar-sm"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/default-avatar.png";
                              }}
                            />
                          ) : (
                            <div
                              className="user-avatar-sm avatar-initials"
                              style={{
                                backgroundColor: getAvatarColor(
                                  user.last_name || user.username,
                                ),
                              }}
                            >
                              {(user.last_name || user.username)
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                        </td>

                        <td>{user.username}</td>

                        <td>{user.email}</td>

                        <td>
                          <span
                            className={`role-badge ${user.is_proprietaire ? "proprietaire" : "locataire"}`}
                          >
                            {user.is_proprietaire ? t("owner") : t("tenant")}
                          </span>
                        </td>

                        <td>
                          <button
                            className="btn-link"
                            onClick={() => handleViewUserDetail(user.id)}
                          >
                            <FaHome /> {user.housings_count || 0}
                          </button>
                        </td>

                        <td>
                          <span
                            className={`status-badge ${user.is_blocked ? "blocked" : "active"}`}
                          >
                            {user.is_blocked ? t("blocked") : t("active")}
                          </span>
                        </td>

                        <td>
                          {new Date(user.date_joined).toLocaleDateString(
                            language === "fr" ? "fr-FR" : "en-US",
                          )}
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon"
                              onClick={() => handleViewUserDetail(user.id)}
                              title={t("view_details")}
                            >
                              <FaEye />
                            </button>

                            {!user.is_blocked ? (
                              <button
                                className="btn-icon danger"
                                onClick={() =>
                                  handleBlockUser(user.id, "permanent")
                                }
                                title={t("block")}
                              >
                                <FaBan />
                              </button>
                            ) : (
                              <button
                                className="btn-icon success"
                                onClick={() => handleUnblockUser(user.id)}
                                title={t("unblock")}
                              >
                                <FaCheck />
                              </button>
                            )}

                            <button
                              className="btn-icon danger"
                              onClick={() => handleDeleteUser(user.id)}
                              title={t("delete")}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "user-detail":
        return (
          selectedUser && (
            <div className="user-detail-section">
              <button
                className="btn btn-outline"
                onClick={() => handleTabChange("users")}
              >
                <FaArrowLeft /> {t("back")}
              </button>

              <h1>
                {t("user_details")} : {selectedUser.username}
              </h1>

              <div className="user-detail-card">
                <img
                  src={selectedUser.photo || "/default-avatar.png"}
                  alt={selectedUser.username}
                  className="user-avatar-large"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />

                <div className="user-info">
                  <p>
                    <strong>
                      <FaEnvelope /> {t("email")}:
                    </strong>{" "}
                    {selectedUser.email}
                  </p>

                  <p>
                    <strong>{t("phone")}:</strong>{" "}
                    {selectedUser.phone || t("not_provided")}
                  </p>

                  <p>
                    <strong>
                      <FaUser /> {t("role")}:
                    </strong>
                    {selectedUser.is_proprietaire ? t("owner") : t("tenant")}
                  </p>
                </div>
              </div>

              <h2>
                <FaHome /> {t("housings")} ({selectedUser.housings_count})
              </h2>

              <div className="housing-grid">
                {selectedUser.housings &&
                  selectedUser.housings.map((housing) => (
                    <HousingCard key={housing.id} housing={housing} />
                  ))}
              </div>
            </div>
          )
        );

      // case 'housings':

      case "housings":
        return (
          <div className="housings-section">
            <h1>
              <FaHome /> {t("housings_management")}
            </h1>

            <div className="filters-bar">
              {/* Filtre propriétaires */}
              <select
                value={filterOwner}
                onChange={(e) => setFilterOwner(e.target.value)}
              >
                <option value="">{t("all_owners")}</option>

                {proprietaires.map((proprio) => (
                  <option key={proprio.id} value={proprio.id}>
                    {proprio.username} ({proprio.housings_count} {t("housings")}
                    )
                  </option>
                ))}
              </select>

              {/* Filtre visibilité */}
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value)}
              >
                <option value="all">{t("all")}</option>
                <option value="visible">{t("visible")}</option>
                <option value="hidden">{t("hidden")}</option>
              </select>
            </div>

            {loading ? (
              <Loading />
            ) : (
              <div className="housings-list">
                {housings.map((housing) => (
                  <div key={housing.id} className="housing-admin-item">
                    <HousingCard housing={housing} />

                    <div className="housing-admin-actions">
                      <button
                        className={`btn btn-sm ${housing.is_visible ? "btn-warning" : "btn-success"}`}
                        onClick={() => handleToggleVisibility(housing.id)}
                      >
                        {housing.is_visible ? (
                          <>
                            <FaEyeSlash /> {t("hide")}
                          </>
                        ) : (
                          <>
                            <FaEye /> {t("activate")}
                          </>
                        )}
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteHousing(housing.id)}
                      >
                        <FaTrash /> {t("delete")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "profile":
        return (
          <div className="profile-section">
            <h1>
              <FaUser /> {t("admin_profile_title")}
            </h1>

            {/* Carte profil */}
            <div className="profile-card">
              <div className="profile-header">
                {/* POUR IMAGE */}
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt={user.username}
                    className="user-avatar-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                ) : (
                  <div
                    className="user-avatar-sm avatar-initials"
                    style={{
                      backgroundColor: getAvatarColor(
                        user?.last_name || user?.username || "User",
                      ),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      borderRadius: "50%",
                      textTransform: "uppercase",
                    }}
                  >
                    {/* Affiche l'initiale du nom, sinon du pseudo, sinon 'U' par défaut */}
                    {(user?.last_name || user?.username || "AD").charAt(0)}
                  </div>
                )}

                <div className="profile-info">
                  <h3>
                    {user?.first_name} {user?.last_name}
                  </h3>
                  <p>@{user?.username}</p>

                  <p className="role-badge admin">{t("admin_role")}</p>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-item">
                  <strong>{t("email")}:</strong> {user?.email}
                </div>

                <div className="detail-item">
                  <strong>{t("phone")}:</strong>{" "}
                  {user?.phone || t("not_provided")}
                </div>

                <div className="detail-item">
                  <strong>{t("member_since")}:</strong>{" "}
                  {new Date(user?.date_joined).toLocaleDateString(
                    language === "fr" ? "fr-FR" : "en-US",
                  )}
                </div>
              </div>

              <div className="profile-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowEditProfile(true)}
                >
                  <FaEdit /> {t("edit_profile")}
                </button>

                <button
                  className="btn btn-outline"
                  onClick={() => setShowChangePassword(true)}
                >
                  <FaLock /> {t("change_password")}
                </button>
              </div>
            </div>

            {/* Modals */}
            {showEditProfile && (
              <ProfileEdit
                onClose={() => setShowEditProfile(false)}
                onUpdate={(updatedUser) => {
                  if (typeof updateUser === "function") {
                    updateUser(updatedUser);
                  }
                  setShowEditProfile(false);
                }}
              />
            )}

            {showChangePassword && (
              <ChangePassword onClose={() => setShowChangePassword(false)} />
            )}
          </div>
        );

      // AdminDashboard.jsx - SECTION MESSAGES/SUPPORT

      case "messages":
        return (
          <div className="messages-section">
            <div className="messages-header">
              <h1>
                <FaComments /> {t("support_client")}
              </h1>
              <p>{t("user_conversations")}</p>
            </div>

            {/* Intégration MessagingPage avec filtre admin */}
            <MessagingPage isAdminView={true} />
          </div>
        );

      case "notifications":
        return (
          <div className="notifications-section">
            <NotificationsList />
          </div>
        );
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>
            <FaCog /> {t("admin_panel")}
          </h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => handleTabChange("overview")}
          >
            <FaChartBar /> {t("dashboard_overview")}
          </button>

          <button
            className={activeTab === "users" ? "active" : ""}
            onClick={() => handleTabChange("users")}
          >
            <FaUsers /> {t("users")}
          </button>

          <button
            className={activeTab === "housings" ? "active" : ""}
            onClick={() => handleTabChange("housings")}
          >
            <FaHome /> {t("housings")}
          </button>

          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => handleTabChange("profile")}
          >
            <FaUser /> {t("profile")}
          </button>

          <button
            className={activeTab === "messages" ? "active" : ""}
            onClick={() => handleTabChange("messages")}
          >
            <FaComments /> {t("support")}
          </button>

          <button
            className={activeTab === "notifications" ? "active" : ""}
            onClick={() => handleTabChange("notifications")}
          >
            <FaBell /> {t("notifications")}
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">{renderContent()}</main>
    </div>
  );
};

export default AdminDashboard;
