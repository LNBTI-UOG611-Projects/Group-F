
import { useState } from "react";
import "./CustomerDashboard.css";
import ServiceLocations from "./ServiceLocations";
import CustomerProfile from "./CustomerProfile";

function CustomerDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");

  const navigation = [
    "Dashboard",
    "My Profile",
    "Service Locations",
    "Service Requests",
  ];

  const stats = [
    { title: "Service Locations", count: 0, icon: "📍" },
    { title: "Total Requests", count: 0, icon: "📋" },
    { title: "Pending Requests", count: 0, icon: "⏳" },
    { title: "Completed Requests", count: 0, icon: "✅" },
  ];

  return (
    <div className="customer-dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="dashboard-logo">PCI</div>
          <div>
            <h2>PCI Colombo</h2>
            <p>Customer Portal</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="dashboard-nav">
          {navigation.map((item) => (
            <button
              key={item}
              type="button"
              className={
                activePage === item
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => setActivePage(item)}
            >
              {item === "Dashboard" && "🏠"}
              {item === "My Profile" && "👤"}
              {item === "Service Locations" && "📍"}
              {item === "Service Requests" && "📋"}

              <span>{item}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          type="button"
          className="logout-button"
          onClick={() =>
            alert("Logout will be connected later.")
          }
        >
          ↪ Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>{activePage}</h1>
            <p>
              Welcome to your PCI Colombo customer portal.
            </p>
          </div>

          <div className="customer-avatar">C</div>
        </header>

        {/* Dashboard */}
        {activePage === "Dashboard" ? (
          <>
            <section className="welcome-section">
              <h2>Welcome Back!</h2>
              <p>
                Manage your pest control services easily
                from your customer dashboard.
              </p>
            </section>

            {/* Statistics */}
            <section className="dashboard-stats">
              {stats.map((stat) => (
                <div className="stat-card" key={stat.title}>
                  <div className="stat-icon">
                    {stat.icon}
                  </div>
                  <p>{stat.title}</p>
                  <h2>{stat.count}</h2>
                </div>
              ))}
            </section>

            {/* Quick Actions and Recent Requests */}
            <section className="dashboard-content">
              <div className="content-card">
                <h2>Quick Actions</h2>

                <button
                  type="button"
                  className="action-button"
                  onClick={() =>
                    setActivePage("Service Locations")
                  }
                >
                  + Manage Service Locations
                </button>

                <button
                  type="button"
                  className="action-button secondary"
                  onClick={() =>
                    setActivePage("Service Requests")
                  }
                >
                  View Service Requests
                </button>
              </div>

              <div className="content-card">
                <h2>Recent Service Requests</h2>
                <p className="empty-message">
                  No service requests available yet.
                </p>
              </div>
            </section>
          </>
        ) : activePage === "My Profile" ? (
          /* Customer Profile */
          <CustomerProfile />
        ) : activePage === "Service Locations" ? (
          /* Service Locations */
          <ServiceLocations />
        ) : (
          /* Service Requests - Pending Development */
          <section className="coming-soon">
            <h2>{activePage}</h2>
            <p>This section will be developed soon.</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default CustomerDashboard;