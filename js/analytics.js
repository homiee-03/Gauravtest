// Analytics dashboard for GAURAV AI
import { auth, db, coursesCatalog, firestoreUtils, adminEmail } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const { collection, getDocs } = firestoreUtils;

const totalUsersEl = document.querySelector("[data-analytics-users]");
const activeUsersEl = document.querySelector("[data-analytics-active]");
const revenueEl = document.querySelector("[data-analytics-revenue]");
const courseGraph = document.querySelector("[data-course-graph]");

const formatRevenue = (value) => `₹${value.toLocaleString("en-IN")}`;

const renderGraph = (stats) => {
  if (!courseGraph) return;
  courseGraph.innerHTML = "";
  stats.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.className = "graph";
    wrapper.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${item.title}</strong>
        <span class="pill">${item.count} purchases</span>
      </div>
      <div class="graph-bar">
        <span style="width:${item.percent}%"></span>
      </div>
    `;
    courseGraph.appendChild(wrapper);
  });
};

onAuthStateChanged(auth, async (user) => {
  if (!user || user.email !== adminEmail) return;

  const snapshot = await getDocs(collection(db, "users"));
  const users = snapshot.docs.map((docSnap) => docSnap.data());
  const totalUsers = users.length;
  const activeUsers = users.filter((profile) => (profile.testsCompleted || 0) > 0).length;

  const purchasesCount = coursesCatalog.map((course) => {
    const count = users.filter((profile) => (profile.purchasedCourses || []).includes(course.id))
      .length;
    return { ...course, count };
  });

  const maxPurchase = Math.max(...purchasesCount.map((course) => course.count), 1);
  const revenue = purchasesCount.reduce((total, course) => total + course.count * course.price, 0);

  if (totalUsersEl) totalUsersEl.textContent = totalUsers;
  if (activeUsersEl) activeUsersEl.textContent = activeUsers;
  if (revenueEl) revenueEl.textContent = formatRevenue(revenue);

  renderGraph(
    purchasesCount.map((course) => ({
      title: course.title,
      count: course.count,
      percent: Math.round((course.count / maxPurchase) * 100)
    }))
  );
});
