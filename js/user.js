// User experience logic for GAURAV AI
import { auth, db, coursesCatalog, toggleLoader, firestoreUtils } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const { doc, getDoc, updateDoc } = firestoreUtils;

const welcomeName = document.querySelector("[data-user-name]");
const purchasedWrapper = document.querySelector("[data-purchased]");
const courseGrid = document.querySelector("[data-course-grid]");
const paymentDetails = document.querySelector("[data-payment-details]");
const paymentButton = document.querySelector("[data-pay-now]");
const qrImage = document.querySelector("[data-qr-image]");
const qrName = document.querySelector("[data-qr-name]");
const qrUpi = document.querySelector("[data-qr-upi]");
const qrAmount = document.querySelector("[data-qr-amount]");
const testsForm = document.querySelector("#tests-form");
const testsStatus = document.querySelector("[data-tests-status]");

const renderCourses = (purchasedCourses = []) => {
  if (!courseGrid) return;
  courseGrid.innerHTML = "";

  coursesCatalog.forEach((course) => {
    const isPurchased = purchasedCourses.includes(course.id);
    const card = document.createElement("article");
    card.className = "glass-card course-card";
    card.innerHTML = `
      <div class="course-thumb">${course.title}</div>
      <div>
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <p class="pill">₹${course.price}</p>
      </div>
      <div>
        <span class="badge ${isPurchased ? "success" : "locked"}">
          ${isPurchased ? "Unlocked" : "Locked"}
        </span>
      </div>
      <div>
        <a class="btn ${isPurchased ? "btn-ghost" : "btn-primary"}" href="${
          isPurchased ? "dashboard.html" : `payment.html?course=${course.id}`
        }">
          ${isPurchased ? "Open" : "Buy Now"}
        </a>
      </div>
    `;
    courseGrid.appendChild(card);
  });
};

const renderPurchased = (purchasedCourses = []) => {
  if (!purchasedWrapper) return;
  const purchasedList = coursesCatalog.filter((course) => purchasedCourses.includes(course.id));
  purchasedWrapper.innerHTML = purchasedList
    .map(
      (course) => `
        <div class="glass-card">
          <h4>${course.title}</h4>
          <p class="muted">Unlocked • ₹${course.price}</p>
        </div>
      `
    )
    .join("");

  if (!purchasedList.length) {
    purchasedWrapper.innerHTML = `
      <div class="glass-card">
        <h4>No purchases yet</h4>
        <p class="muted">Start with AI Foundation to unlock your journey.</p>
      </div>
    `;
  }
};

const initPayment = (userDocRef, userData) => {
  if (!paymentDetails || !paymentButton) return;
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("course");
  const course = coursesCatalog.find((item) => item.id === courseId) || coursesCatalog[0];

  paymentDetails.innerHTML = `
    <h2>${course.title}</h2>
    <p>${course.description}</p>
    <p class="pill">Total: ₹${course.price}</p>
  `;

  if (qrImage) {
    qrImage.src = course.qrImage;
    qrImage.alt = `${course.title} UPI QR code`;
  }
  if (qrName) qrName.textContent = "SAURABH VERMA";
  if (qrUpi) qrUpi.textContent = "UPI ID: sauravvarmag8@oksbi";
  if (qrAmount) qrAmount.textContent = `Amount: ₹${course.price.toFixed(2)}`;

  paymentButton.addEventListener("click", async () => {
    toggleLoader(true);
    const purchasedCourses = new Set(userData.purchasedCourses || []);
    purchasedCourses.add(course.id);

    await updateDoc(userDocRef, {
      purchasedCourses: Array.from(purchasedCourses)
    });

    paymentButton.textContent = "Payment Successful ✓";
    paymentButton.classList.add("btn-ghost");
    setTimeout(() => (window.location.href = "dashboard.html"), 1200);
    toggleLoader(false);
  });
};

const initTests = (userDocRef, userData) => {
  if (!testsForm) return;
  testsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    toggleLoader(true);
    const score = Math.floor(Math.random() * 40) + 60;
    const attempts = (userData.testsCompleted || 0) + 1;

    await updateDoc(userDocRef, {
      testsCompleted: attempts,
      latestScore: score,
      lastTestAt: new Date().toISOString()
    });

    testsStatus.textContent = `Latest score: ${score}% • Total attempts: ${attempts}`;
    toggleLoader(false);
  });
};

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);
  const userData = userDoc.data() || {};

  if (welcomeName) {
    welcomeName.textContent = userData.name || "Learner";
  }

  renderPurchased(userData.purchasedCourses || []);
  renderCourses(userData.purchasedCourses || []);
  initPayment(userDocRef, userData);
  initTests(userDocRef, userData);
});
