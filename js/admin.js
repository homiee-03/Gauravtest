// Admin panel logic for GAURAV AI
import { auth, db, coursesCatalog, firestoreUtils, adminEmail } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const { doc, updateDoc, collection, getDocs } = firestoreUtils;

const adminTableBody = document.querySelector("[data-admin-users]");
const totalUsers = document.querySelector("[data-total-users]");
const totalRevenue = document.querySelector("[data-total-revenue]");

const formatRevenue = (value) => `₹${value.toLocaleString("en-IN")}`;

const renderAdminRows = (users) => {
  if (!adminTableBody) return;
  adminTableBody.innerHTML = "";

  users.forEach((user) => {
    const purchasedCourses = user.purchasedCourses || [];
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.name || "Learner"}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${purchasedCourses.length}</td>
      <td>
        <select data-course-select>
          ${coursesCatalog
            .map(
              (course) =>
                `<option value="${course.id}" ${
                  purchasedCourses.includes(course.id) ? "selected" : ""
                }>${course.title}</option>`
            )
            .join("")}
        </select>
      </td>
      <td>
        <button class="btn btn-ghost" data-toggle-course>Toggle Access</button>
      </td>
    `;

    const select = row.querySelector("[data-course-select]");
    const toggleButton = row.querySelector("[data-toggle-course]");

    toggleButton.addEventListener("click", async () => {
      const chosen = select.value;
      const newSet = new Set(purchasedCourses);
      if (newSet.has(chosen)) {
        newSet.delete(chosen);
      } else {
        newSet.add(chosen);
      }
      await updateDoc(doc(db, "users", user.id), {
        purchasedCourses: Array.from(newSet)
      });
      toggleButton.textContent = "Updated ✓";
    });

    adminTableBody.appendChild(row);
  });
};

const calculateRevenue = (users) => {
  return users.reduce((sum, user) => {
    const purchasedCourses = user.purchasedCourses || [];
    const userRevenue = purchasedCourses.reduce((total, courseId) => {
      const course = coursesCatalog.find((item) => item.id === courseId);
      return total + (course?.price || 0);
    }, 0);
    return sum + userRevenue;
  }, 0);
};

onAuthStateChanged(auth, async (user) => {
  if (!user || user.email !== adminEmail) return;

  const snapshot = await getDocs(collection(db, "users"));
  const users = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));

  renderAdminRows(users);
  if (totalUsers) totalUsers.textContent = users.length;
  if (totalRevenue) totalRevenue.textContent = formatRevenue(calculateRevenue(users));
});
