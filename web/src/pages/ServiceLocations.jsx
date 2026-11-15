
import { useState } from "react";
import "./ServiceLocations.css";

function ServiceLocations() {
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    locationName: "",
    address: "",
    city: "",
    contactNumber: "",
    notes: "",
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      locationName: "",
      address: "",
      city: "",
      contactNumber: "",
      notes: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (editingId !== null) {
      setLocations((previous) =>
        previous.map((location) =>
          location.id === editingId
            ? { ...formData, id: editingId }
            : location
        )
      );
    } else {
      setLocations((previous) => [
        ...previous,
        { ...formData, id: Date.now(), archived: false },
      ]);
    }

    resetForm();
  };

  const handleEdit = (location) => {
    setFormData({
      locationName: location.locationName,
      address: location.address,
      city: location.city,
      contactNumber: location.contactNumber,
      notes: location.notes,
    });
    setEditingId(location.id);
    setShowForm(true);
  };

  const handleArchive = (id) => {
    setLocations((previous) =>
      previous.map((location) =>
        location.id === id
          ? { ...location, archived: true }
          : location
      )
    );
  };

  const activeLocations = locations.filter(
    (location) => !location.archived
  );

  return (
    <div className="locations-page">
      <div className="locations-heading">
        <div>
          <h2>Service Locations</h2>
          <p>Manage the locations where you need pest control services.</p>
        </div>

        <button
          className="add-location-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add New Location
        </button>
      </div>

      <div className="location-summary">
        <div className="location-summary-card">
          <span>📍</span>
          <div>
            <p>Total Active Locations</p>
            <h2>{activeLocations.length}</h2>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="location-form-card">
          <h3>
            {editingId !== null ? "Edit Location" : "Add New Location"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="location-form-grid">
              <div>
                <label>Location Name *</label>
                <input
                  name="locationName"
                  value={formData.locationName}
                  onChange={handleChange}
                  placeholder="e.g. Home, Office"
                  required
                />
              </div>

              <div>
                <label>City *</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  required
                />
              </div>

              <div className="full-width">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  required
                />
              </div>

              <div>
                <label>Contact Number *</label>
                <input
                  name="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                  required
                />
              </div>

              <div>
                <label>Additional Notes</label>
                <input
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <div className="location-form-actions">
              <button type="button" onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="save-location-btn">
                {editingId !== null ? "Update Location" : "Save Location"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="locations-list-card">
        <h3>My Service Locations</h3>

        {activeLocations.length === 0 ? (
          <div className="locations-empty">
            <span>📍</span>
            <h3>No Service Locations Yet</h3>
            <p>Add your first service location to get started.</p>
          </div>
        ) : (
          <div className="locations-grid">
            {activeLocations.map((location) => (
              <div className="location-card" key={location.id}>
                <div className="location-card-heading">
                  <h3>{location.locationName}</h3>
                  <span className="location-status">Active</span>
                </div>

                <p><strong>Address:</strong> {location.address}</p>
                <p><strong>City:</strong> {location.city}</p>
                <p><strong>Contact:</strong> {location.contactNumber}</p>

                {location.notes && (
                  <p><strong>Notes:</strong> {location.notes}</p>
                )}

                <div className="location-card-actions">
                  <button onClick={() => handleEdit(location)}>
                    Edit
                  </button>
                  <button
                    className="archive-btn"
                    onClick={() => handleArchive(location.id)}
                  >
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ServiceLocations;
