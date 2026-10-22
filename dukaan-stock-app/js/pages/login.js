import { showToast } from "../components/toast.js";


export function loginPage() {
  return `
<div class="login-page min-vh-100 d-flex align-items-center justify-content-center px-3 py-5">

  <div class="w-100" style="max-width:420px">

    <!-- Brand -->
    <div class="text-center mb-4">

      <div
        class="ico mx-auto mb-3 d-flex align-items-center justify-content-center"
        style="
          width:68px;
          height:68px;
          font-size:30px;
          border-radius:18px;
        "
      >
        🏬
      </div>

      <div class="small fw-bold text-muted mb-1">
        DUKAAN STOCK
      </div>

      <h1 class="mb-2">
        Welcome back
      </h1>

      <p class="muted mb-0">
        Apni dukaan ka stock aur hisaab manage karo.
      </p>

    </div>


    <!-- Login Card -->
    <div class="card p-4">

      <!-- Email -->
      <div class="mb-3">

        <label for="l_email" class="form-label">
          Email
        </label>

        <input
          id="l_email"
          type="email"
          class="form-control"
          autocomplete="username"
          inputmode="email"
          maxlength="254"
          placeholder="you@example.com"
        >

      </div>


      <!-- Password -->
      <div class="mb-2">

        <div class="d-flex justify-content-between align-items-center">

          <label for="l_pass" class="form-label mb-1">
            Password
          </label>

        </div>

        <div class="position-relative">

          <input
            id="l_pass"
            type="password"
            class="form-control pe-5"
            autocomplete="current-password"
            maxlength="128"
            placeholder="Enter your password"
          >

          <button
            type="button"
            id="togglePassword"
            class="btn btn-sm position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent"
            style="z-index:2"
            aria-label="Show password"
          >
            👁
          </button>

        </div>

      </div>


      <!-- Login Button -->
      <button
        class="login-submit-button w-100 mt-4"
        id="loginButton"
        type="button"
      >
        Login karo
      </button>

    </div>


    <div class="text-center mt-3">

      <small class="text-muted">
        Secure login • Dukaan Stock Tracker
      </small>

    </div>

  </div>

</div>
  `;
}


export function bindLogin(actions) {

  const emailInput =
    document.querySelector("#l_email");

  const passwordInput =
    document.querySelector("#l_pass");

  const button =
    document.querySelector("#loginButton");

  const togglePassword =
    document.querySelector("#togglePassword");


  if (
    !button ||
    !emailInput ||
    !passwordInput
  ) {
    return;
  }


  // --------------------------------
  // Show / Hide Password
  // --------------------------------

  togglePassword?.addEventListener(
    "click",
    () => {

      const isPassword =
        passwordInput.type === "password";

      passwordInput.type =
        isPassword
          ? "text"
          : "password";

      togglePassword.textContent =
        isPassword
          ? "🙈"
          : "👁";

      togglePassword.setAttribute(
        "aria-label",
        isPassword
          ? "Hide password"
          : "Show password"
      );

    }
  );


  // --------------------------------
  // Email validation
  // --------------------------------

  function validateEmail(email) {

    if (!email) {
      return "Email likho";
    }

    if (email.length > 254) {
      return "Email bahut lamba hai";
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return "Email address sahi nahi hai";
    }

    return "";
  }


  // --------------------------------
  // Password validation
  // --------------------------------

  function validatePassword(password) {

    if (!password) {
      return "Password likho";
    }

    if (password.length < 6) {
      return "Password kam se kam 6 characters ka hona chahiye";
    }

    if (password.length > 128) {
      return "Password bahut lamba hai";
    }

    return "";
  }


  // --------------------------------
  // Login function
  // --------------------------------

  async function handleLogin() {

    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value;


    // Validate email
    const emailError =
      validateEmail(email);

    if (emailError) {

      showToast(emailError);

      emailInput.focus();

      return;
    }


    // Validate password
    const passwordError =
      validatePassword(password);

    if (passwordError) {

      showToast(passwordError);

      passwordInput.focus();

      return;
    }


    // --------------------------------
    // Loading state
    // --------------------------------

    button.disabled = true;

    const originalText =
      button.textContent.trim();

    button.innerHTML = `
      <span
        class="spinner-border spinner-border-sm me-2"
        role="status"
        aria-hidden="true"
      ></span>
      Login ho raha hai...
    `;


    try {

      await actions.login(
        email,
        password
      );


    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      button.disabled = false;

      button.textContent =
        originalText;


      showToast(
        getAuthErrorMessage(error)
      );

    }

  }


  // --------------------------------
  // Firebase Auth errors
  // --------------------------------

  function getAuthErrorMessage(error) {

    const code =
      error?.code || "";


    switch (code) {

      case "auth/invalid-email":
        return "Email address sahi nahi hai";


      case "auth/user-not-found":
        return "Is email se koi account nahi mila";


      case "auth/wrong-password":
        return "Email ya password galat hai";


      case "auth/invalid-credential":
        return "Email ya password galat hai";


      case "auth/user-disabled":
        return "Ye account disabled hai";


      case "auth/too-many-requests":
        return "Bahut attempts ho gaye. Thodi der baad try karo";


      case "auth/network-request-failed":
        return "Internet connection check karo";


      case "auth/operation-not-allowed":
        return "Email/password login enabled nahi hai";


      case "auth/internal-error":
        return "Firebase mein temporary problem hai. Dobara try karo";


      case "auth/timeout":
        return "Request timeout ho gayi. Dobara try karo";


      default:
        return "Login nahi ho paya. Dobara try karo";
    }

  }


  // --------------------------------
  // Button click
  // --------------------------------

  button.addEventListener(
    "click",
    handleLogin
  );


  // --------------------------------
  // Enter key
  // --------------------------------

  [emailInput, passwordInput].forEach(
    (input) => {

      input.addEventListener(
        "keydown",
        (event) => {

          if (event.key === "Enter") {

            event.preventDefault();

            handleLogin();

          }

        }
      );

    }
  );

}