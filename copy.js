document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const containers = document.querySelectorAll(".container");
  const showSignupLink = document.getElementById("show-signup");
  const showLoginLink = document.getElementById("show-login");
  const loginContainer = document.getElementById("login-container");
  const signupContainer = document.getElementById("signup-container");
  const roleSelectionContainer = document.getElementById("role-selection-container");
  const residentContainer = document.getElementById("resident-container");
  const staffContainer = document.getElementById("staff-container");
  const adminContainer = document.getElementById("admin-container");
  const staffDashboard = document.getElementById("staff-dashboard");
  const adminDashboard = document.getElementById("admin-dashboard");
  const requestFormContainer = document.getElementById("request-form-container");
  const complaintFormContainer = document.getElementById("complaint-form-container");
  const blotterFormContainer = document.getElementById("blotter-form-container");

  // Data storage
  let selectedRole = null;
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let currentUser = null;
  let requests = JSON.parse(localStorage.getItem("requests")) || [];
  let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
  let blotters = JSON.parse(localStorage.getItem("blotters")) || [];

  // Utility function to hide all containers
  function hideAllContainers() {
    containers.forEach((container) => {
      container.style.display = "none";
    });
  }

  // Initialize - show role selection first
  hideAllContainers();
  roleSelectionContainer.style.display = "flex";

  // Role selection handler
  document.querySelectorAll(".role-card").forEach((card) => {
    card.addEventListener("click", function () {
      selectedRole = this.getAttribute("data-role");
      hideAllContainers();

      if (selectedRole === "staff" || selectedRole === "admin") {
        loginContainer.style.display = "flex";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
      } else {
        loginContainer.style.display = "flex";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
      }
    });
  });

  // Toggle between login and signup forms
  showSignupLink?.addEventListener("click", function (e) {
    e.preventDefault();
    loginContainer.style.display = "none";
    signupContainer.style.display = "flex";
  });

  showLoginLink?.addEventListener("click", function (e) {
    e.preventDefault();
    signupContainer.style.display = "none";
    loginContainer.style.display = "flex";
  });

  // Signup form submission
  document
    .getElementById("signup-form")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("signup-email").value.trim();
      const firstName = document.getElementById("first-name").value.trim();
      const lastName = document.getElementById("last-name").value.trim();
      const userType = document.getElementById("user-type").value;
      const password = document.getElementById("signup-password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      // Validation
      if (
        !email ||
        !firstName ||
        !lastName ||
        !userType ||
        !password ||
        !confirmPassword
      ) {
        alert("Please fill in all fields");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      if (users.some((user) => user.email === email)) {
        alert("User with this email already exists!");
        return;
      }

      // Create new user
      const newUser = {
        email,
        firstName,
        lastName,
        userType,
        password,
        dateCreated: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      // Show role-specific instructions
      if (userType === "staff") {
        alert(
          'Account created successfully! As staff, you will need to verify with "brgystff" after login.'
        );
      } else if (userType === "admin") {
        alert(
          'Account created successfully! As admin, you will need to verify with "admin" after login.'
        );
      } else {
        alert("Account created successfully!");
      }

      // Clear form and show login
      this.reset();
      signupContainer.style.display = "none";
      loginContainer.style.display = "block";
    });

  // Login form submission
  document
    .getElementById("login-form")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      // Find user
      const user = users.find((u) => u.email === email);

      // Validate credentials - only check against stored password
      if (!user || user.password !== password) {
        alert("Invalid email or password!");
        return;
      }

      currentUser = user;
      hideAllContainers();

      // Redirect based on role
      switch (user.userType) {
        case "resident":
          residentContainer.style.display = "block";
          loadResidentTracking();
          break;
        case "staff":
          staffContainer.style.display = "block";
          break;
        case "admin":
          adminContainer.style.display = "block";
          break;
        default:
          roleSelectionContainer.style.display = "block";
      }
    });

  // Staff verification
  document
    .getElementById("staff-auth-form")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();
      const password = document.getElementById("staff-password").value;

      // Verify current user is actually staff
      if (!currentUser || currentUser.userType !== "staff") {
        alert("Invalid user session!");
        hideAllContainers();
        roleSelectionContainer.style.display = "block";
        return;
      }

      if (password === "brgystff") {
        hideAllContainers();
        staffDashboard.style.display = "block";
        loadStaffDashboard();
      } else {
        alert("Invalid staff verification password!");
      }
    });

  // Admin verification
  document
    .getElementById("admin-auth-form")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();
      const password = document.getElementById("admin-password").value;

      // Verify current user is actually admin
      if (!currentUser || currentUser.userType !== "admin") {
        alert("Invalid user session!");
        hideAllContainers();
        roleSelectionContainer.style.display = "block";
        return;
      }

      if (password === "admin") {
        hideAllContainers();
        adminDashboard.style.display = "block";
        loadAdminDashboard();
      } else {
        alert("Invalid admin verification password!");
      }
    });

  // Service card click handlers
  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("click", function () {
      const serviceType = this.getAttribute("data-service");
      hideAllContainers();

      switch (serviceType) {
        case "request":
          requestFormContainer.style.display = "block";
          break;
        case "complaint":
          complaintFormContainer.style.display = "block";
          break;
        case "blotter":
          blotterFormContainer.style.display = "block";
          break;
      }
    });
  });

  // Form submission handlers
  document
    .getElementById("request-form")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();
      submitRequest();
    });

  document
    .getElementById("complaint-form")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();
      submitComplaint();
    });

  document
    .getElementById("blotter-form")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();
      submitBlotter();
    });

  // Tab switching for resident tracking
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab");

      // Update active tab button
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      // Update active tab content
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active");
      });
      document.getElementById(`${tabId}-tab`).classList.add("active");
    });
  });

  // Logout functionality
  document.querySelectorAll(".logout-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      currentUser = null;
      selectedRole = null;
      hideAllContainers();
      roleSelectionContainer.style.display = "block";
    });
  });

  // Back button functionality
  document.querySelectorAll(".back-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      hideAllContainers();

      if (currentUser) {
        switch (currentUser.userType) {
          case "resident":
            residentContainer.style.display = "block";
            loadResidentTracking();
            break;
          case "staff":
            staffContainer.style.display = "block";
            break;
          case "admin":
            adminContainer.style.display = "block";
            break;
          default:
            loginContainer.style.display = "block";
        }
      } else {
        loginContainer.style.display = "block";
      }
    });
  });

  // Load resident tracking data
  function loadResidentTracking() {
    if (!currentUser) return;

    // Filter for current user's submissions
    const userRequests = requests.filter(
      (req) => req.email === currentUser.email
    );
    const userComplaints = complaints.filter(
      (comp) => comp.email === currentUser.email
    );
    const userBlotters = blotters.filter(
      (blot) => blot.email === currentUser.email
    );

    // Populate requests table
    const requestsList = document.getElementById("requests-list");
    requestsList.innerHTML = userRequests
      .map(
        (req) => `
      <tr>
        <td>${req.id}</td>
        <td>${req.type}</td>
        <td>${new Date(req.date).toLocaleDateString()}</td>
        <td class="status-${req.status}">${req.status}</td>
      </tr>
    `
      )
      .join("");

    // Populate complaints table
    const complaintsList = document.getElementById("complaints-list");
    complaintsList.innerHTML = userComplaints
      .map(
        (comp) => `
      <tr>
        <td>${comp.id}</td>
        <td>${comp.type}</td>
        <td>${new Date(comp.date).toLocaleDateString()}</td>
        <td class="status-${comp.status}">${comp.status}</td>
      </tr>
    `
      )
      .join("");

    // Populate blotters table
    const blottersList = document.getElementById("blotters-list");
    blottersList.innerHTML = userBlotters
      .map(
        (blot) => `
      <tr>
        <td>${blot.id}</td>
        <td>${blot.type}</td>
        <td>${new Date(blot.date).toLocaleDateString()}</td>
        <td class="status-${blot.status}">${blot.status}</td>
      </tr>
    `
      )
      .join("");
  }

  // Submit request function
  function submitRequest() {
    const requestData = {
      id: "REQ-" + Date.now(),
      firstName: document.getElementById("firstNameReq").value,
      lastName: document.getElementById("lastNameReq").value,
      address: document.getElementById("addressReq").value,
      contactNumber: document.getElementById("contactNumberReq").value,
      type: document.getElementById("docType").value,
      date: new Date().toISOString(),
      status: "pending",
    };

    requests.push(requestData);
    localStorage.setItem("requests", JSON.stringify(requests));
    alert("Request submitted successfully!");

    hideAllContainers();
    residentContainer.style.display = "block";
    loadResidentTracking();
  }

  // Submit complaint function
  function submitComplaint() {
    const complaintData = {
      id: "COMP-" + Date.now(),
      email: currentUser.email,
      firstName: document.getElementById("firstNameComp").value,
      lastName: document.getElementById("middleNameComp").value,
      address: document.getElementById("addressComp").value,
      contactNumber: document.getElementById("contactNumberComp").value,
      type: document.getElementById("typeOfComplaint").value,
      date: new Date().toISOString(),
      status: "pending",
    };

    complaints.push(complaintData);
    localStorage.setItem("complaints", JSON.stringify(complaints));
    alert("Complaint submitted successfully!");

    hideAllContainers();
    residentContainer.style.display = "block";
    loadResidentTracking();
  }

  // Submit blotter function
  function submitBlotter() {
    const blotterData = {
      id: "BLOT-" + Date.now(),
      email: currentUser.email,
      mainComplaint: document.getElementById("main-complaint").value,
      otherComplaint: document.getElementById("other-complaint").value,
      incidentLocation: document.getElementById("incident-location").value,
      incidentType: document.getElementById("incident-type").value,
      incidentDate: document.getElementById("incident-date").value,
      incidentTime: document.getElementById("incident-time").value,
      date: new Date().toISOString(),
      status: "pending",
    };

    blotters.push(blotterData);
    localStorage.setItem("blotters", JSON.stringify(blotters));
    alert("Blotter submitted successfully!");

    hideAllContainers();
    residentContainer.style.display = "block";
    loadResidentTracking();
  }

  // Updated Load staff dashboard function
  function loadStaffDashboard() {
    // Get all submissions
    requests = JSON.parse(localStorage.getItem("requests")) || [];
    complaints = JSON.parse(localStorage.getItem("complaints")) || [];
    blotters = JSON.parse(localStorage.getItem("blotters")) || [];
    const allUsers = JSON.parse(localStorage.getItem("users")) || [];

    // Update counts
    document.getElementById("pending-count").textContent =
      requests.filter((r) => r.status === "pending").length +
      complaints.filter((c) => c.status === "pending").length +
      blotters.filter((b) => b.status === "pending").length;

    document.getElementById("processing-count").textContent =
      requests.filter((r) => r.status === "processing").length +
      complaints.filter((c) => c.status === "processing").length +
      blotters.filter((b) => b.status === "processing").length;

    document.getElementById("completed-count").textContent =
      requests.filter((r) => r.status === "completed").length +
      complaints.filter((c) => c.status === "completed").length +
      blotters.filter((b) => b.status === "completed").length;

    // Populate requests table
    const requestsList = document.getElementById("staff-requests-list");
    requestsList.innerHTML = requests
      .map((req) => {
        const user = allUsers.find((u) => u.email === req.email) || {};
        return `
      <tr>
        <td>${req.id}</td>
        <td>${user.firstName || ""} ${user.lastName || ""}</td>
        <td>${req.type}</td>
        <td>${new Date(req.date).toLocaleDateString()}</td>
        <td class="status-${req.status}">${req.status}</td>
        <td>
          <select class="status-select" data-type="request" data-id="${req.id}">
            <option value="pending" ${
              req.status === "pending" ? "selected" : ""
            }>Pending</option>
            <option value="processing" ${
              req.status === "processing" ? "selected" : ""
            }>Processing</option>
            <option value="completed" ${
              req.status === "completed" ? "selected" : ""
            }>Completed</option>
          </select>
        </td>
        <td>
          <button class="update-btn" data-type="request" data-id="${
            req.id
          }">Update</button>
        </td>
      </tr>
    `;
      })
      .join("");

    // Populate complaints table
    const complaintsList = document.getElementById("staff-complaints-list");
    complaintsList.innerHTML = complaints
      .map((comp) => {
        const user = allUsers.find((u) => u.email === comp.email) || {};
        return `
      <tr>
        <td>${comp.id}</td>
        <td>${user.firstName || ""} ${user.lastName || ""}</td>
        <td>${comp.type}</td>
        <td>${new Date(comp.date).toLocaleDateString()}</td>
        <td class="status-${comp.status}">${comp.status}</td>
        <td>
          <select class="status-select" data-type="complaint" data-id="${
            comp.id
          }">
            <option value="pending" ${
              comp.status === "pending" ? "selected" : ""
            }>Pending</option>
            <option value="processing" ${
              comp.status === "processing" ? "selected" : ""
            }>Processing</option>
            <option value="completed" ${
              comp.status === "completed" ? "selected" : ""
            }>Completed</option>
          </select>
        </td>
        <td>
          <button class="update-btn" data-type="complaint" data-id="${
            comp.id
          }">Update</button>
        </td>
      </tr>
    `;
      })
      .join("");

    // Populate blotters table
    const blottersList = document.getElementById("staff-blotters-list");
    blottersList.innerHTML = blotters
      .map((blot) => {
        const user = allUsers.find((u) => u.email === blot.email) || {};
        return `
      <tr>
        <td>${blot.id}</td>
        <td>${user.firstName || ""} ${user.lastName || ""}</td>
        <td>${blot.incidentType}</td>
        <td>${new Date(blot.date).toLocaleDateString()}</td>
        <td class="status-${blot.status}">${blot.status}</td>
        <td>
          <select class="status-select" data-type="blotter" data-id="${
            blot.id
          }">
            <option value="pending" ${
              blot.status === "pending" ? "selected" : ""
            }>Pending</option>
            <option value="processing" ${
              blot.status === "processing" ? "selected" : ""
            }>Processing</option>
            <option value="completed" ${
              blot.status === "completed" ? "selected" : ""
            }>Completed</option>
          </select>
        </td>
        <td>
          <button class="update-btn" data-type="blotter" data-id="${
            blot.id
          }">Update</button>
        </td>
      </tr>
    `;
      })
      .join("");

    // Set up tab switching for staff dashboard
    document.querySelectorAll(".submission-tabs .tab-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const tabId = this.getAttribute("data-tab");

        // Update active tab button
        document
          .querySelectorAll(".submission-tabs .tab-btn")
          .forEach((b) => b.classList.remove("active"));
        this.classList.add("active");

        // Update active tab content
        document
          .querySelectorAll(".submission-content .tab-content")
          .forEach((content) => {
            content.classList.remove("active");
          });
        document.getElementById(`${tabId}-tab-staff`).classList.add("active");
      });
    });
  }

  // Updated Status update handler
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("update-btn")) {
      const type = e.target.getAttribute("data-type");
      const id = e.target.getAttribute("data-id");
      const select = document.querySelector(
        `.status-select[data-type="${type}"][data-id="${id}"]`
      );
      const newStatus = select.value;

      // Update in localStorage
      let items;
      if (type === "request") {
        items = requests;
      } else if (type === "complaint") {
        items = complaints;
      } else if (type === "blotter") {
        items = blotters;
      }

      const itemIndex = items.findIndex((item) => item.id === id);
      if (itemIndex !== -1) {
        items[itemIndex].status = newStatus;

        // Save back to localStorage
        if (type === "request") {
          localStorage.setItem("requests", JSON.stringify(items));
        } else if (type === "complaint") {
          localStorage.setItem("complaints", JSON.stringify(items));
        } else if (type === "blotter") {
          localStorage.setItem("blotters", JSON.stringify(items));
        }

        alert("Status updated successfully!");
        loadStaffDashboard();
      }
    }
  });

  // Load admin dashboard
  function loadAdminDashboard() {
    const allUsers = JSON.parse(localStorage.getItem("users")) || [];

    // Update counts
    document.getElementById("total-users").textContent = allUsers.length;
    document.getElementById("active-staff").textContent = allUsers.filter(
      (u) => u.userType === "staff"
    ).length;
    document.getElementById("pending-issues").textContent =
      requests.filter((r) => r.status === "pending").length +
      complaints.filter((c) => c.status === "pending").length +
      blotters.filter((b) => b.status === "pending").length;

    // Populate resident email dropdown
    const residentEmailSelect = document.getElementById("resident-email");
    residentEmailSelect.innerHTML =
      '<option value="">Select Resident</option>' +
      allUsers
        .filter((u) => u.userType === "resident")
        .map(
          (user) =>
            `<option value="${user.email}">${user.firstName} ${user.lastName} (${user.email})</option>`
        )
        .join("");
  }

  // Status update handler
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("update-btn")) {
      const type = e.target.getAttribute("data-type");
      const id = e.target.getAttribute("data-id");
      const select = document.querySelector(
        `.status-select[data-type="${type}"][data-id="${id}"]`
      );
      const newStatus = select.value;

      // Update in localStorage
      let items;
      if (type === "request") {
        items = requests;
      } else if (type === "complaint") {
        items = complaints;
      } else if (type === "blotter") {
        items = blotters;
      }

      const itemIndex = items.findIndex((item) => item.id === id);
      if (itemIndex !== -1) {
        items[itemIndex].status = newStatus;

        // Save back to localStorage
        if (type === "request") {
          localStorage.setItem("requests", JSON.stringify(items));
        } else if (type === "complaint") {
          localStorage.setItem("complaints", JSON.stringify(items));
        } else if (type === "blotter") {
          localStorage.setItem("blotters", JSON.stringify(items));
        }

        alert("Status updated successfully!");
        loadStaffDashboard();
      }
    }
  });
});
