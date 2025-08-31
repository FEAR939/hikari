import { authService } from "../../services/AuthService";
import { router } from "../../lib/router/index";

enum AuthOp {
  SIGNUP = 0,
  SIGNIN = 1,
  SIGNIN_VERIFICATION = 5,
  FORGOT_PASSWORD = 2,
  RESET_PASSWORD = 3,
  SET_NEW_PASSWORD = 4,
}

export default async function Auth(query) {
  const page = document.createElement("div");
  page.className =
    "h-full w-full p-4 flex flex-col items-center justify-center space-y-8";

  document.root.appendChild(page);

  const pageback = document.createElement("div");
  pageback.className =
    "absolute z-10 top-2 left-4 size-8 flex items-center justify-center";
  pageback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left-short size-8" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"/>
  </svg>`;

  page.appendChild(pageback);

  pageback.addEventListener("click", () => {
    router.navigate("/");
  });

  let op: AuthOp = AuthOp.SIGNUP;
  let resetToken = "";

  const emailbox = document.createElement("div");
  emailbox.className = "w-full max-w-96 space-y-2";

  const emaillabel = document.createElement("div");
  emaillabel.textContent = "Email";

  const emailfieldwrapper = document.createElement("div");
  emailfieldwrapper.className =
    "flex space-x-4 w-full max-w-96 px-6 py-4 outline-2 outline-[#141414] rounded-xl has-[:invalid:not(:placeholder-shown):not(:focus)]:outline-red-800";
  emailfieldwrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope size-6" viewBox="0 0 16 16">
    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
  </svg>`;

  const emailfield = document.createElement("input");
  emailfield.className =
    "w-full h-full bg-transparent text-[#c0c0c0] outline-none border-none";
  emailfield.type = "email";
  emailfield.required = true;
  emailfield.placeholder = "Enter you email";

  emailfieldwrapper.appendChild(emailfield);

  emailbox.appendChild(emaillabel);
  emailbox.appendChild(emailfieldwrapper);

  page.appendChild(emailbox);

  const usernamebox = document.createElement("div");
  usernamebox.className = "w-full max-w-96 space-y-2";

  const usernamelabel = document.createElement("div");
  usernamelabel.textContent = "Username";

  const usernamefieldwrapper = document.createElement("div");
  usernamefieldwrapper.className =
    "flex space-x-4 w-full max-w-96 px-6 py-4 outline-2 outline-[#141414] rounded-xl has-[:invalid:not(:placeholder-shown):not(:focus)]:outline-red-800";
  usernamefieldwrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person size-6" viewBox="0 0 16 16">
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
  </svg>`;

  const usernamefield = document.createElement("input");
  usernamefield.className =
    "w-full h-full bg-transparent text-[#c0c0c0] outline-none border-none";
  usernamefield.type = "text";
  usernamefield.required = true;
  usernamefield.placeholder = "Enter your username";

  usernamefieldwrapper.appendChild(usernamefield);

  usernamebox.appendChild(usernamelabel);
  usernamebox.appendChild(usernamefieldwrapper);

  page.appendChild(usernamebox);

  const passwordbox = document.createElement("div");
  passwordbox.className = "w-full max-w-96 space-y-2";

  const passwordlabel = document.createElement("div");
  passwordlabel.className = "flex justify-between";
  passwordlabel.innerHTML = "<span>Password</span>";

  const passwordforgot = document.createElement("div");
  passwordforgot.className = "text-sm text-[#c0c0c0] cursor-pointer";
  passwordforgot.textContent = "Forgot Password?";

  passwordforgot.addEventListener("click", () => {
    op = 2;
    modeHandler();
  });

  passwordlabel.appendChild(passwordforgot);

  const passwordfieldwrapper = document.createElement("div");
  passwordfieldwrapper.className =
    "group flex space-x-4 w-full max-w-96 px-6 py-4 outline-2 outline-[#141414] rounded-xl has-[:invalid:not(:placeholder-shown):not(:focus)]:outline-red-800";
  passwordfieldwrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-key size-6" viewBox="0 0 16 16">
    <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5"/>
    <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
  </svg>`;

  const passwordfield = document.createElement("input");
  passwordfield.className =
    "w-full h-full bg-transparent text-[#c0c0c0] outline-none border-none";
  passwordfield.type = "password";
  passwordfield.required = true;
  passwordfield.placeholder = "Enter your password";

  passwordfieldwrapper.appendChild(passwordfield);

  passwordbox.appendChild(passwordlabel);
  passwordbox.appendChild(passwordfieldwrapper);

  page.appendChild(passwordbox);

  const repeatpasswordbox = document.createElement("div");
  repeatpasswordbox.className = "w-full max-w-96 space-y-2";

  const repeatpasswordlabel = document.createElement("div");
  repeatpasswordlabel.textContent = "Repeat Password";

  const repeatpasswordfieldwrapper = document.createElement("div");
  repeatpasswordfieldwrapper.className =
    "group flex space-x-4 w-full max-w-96 px-6 py-4 outline-2 outline-[#141414] rounded-xl has-[:invalid:not(:placeholder-shown):not(:focus)]:outline-red-800";
  repeatpasswordfieldwrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-key size-6" viewBox="0 0 16 16">
    <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5"/>
    <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
  </svg>`;

  const repeatpasswordfield = document.createElement("input");
  repeatpasswordfield.className =
    "w-full h-full bg-transparent text-[#c0c0c0] outline-none border-none";
  repeatpasswordfield.type = "password";
  repeatpasswordfield.required = true;
  repeatpasswordfield.placeholder = "Enter your password again";

  repeatpasswordfieldwrapper.appendChild(repeatpasswordfield);

  repeatpasswordbox.addEventListener("input", () => {
    if (repeatpasswordfield.value !== passwordfield.value) {
      repeatpasswordfield.setCustomValidity("Passwords do not match");
    } else {
      repeatpasswordfield.setCustomValidity("");
    }
  });

  repeatpasswordbox.appendChild(repeatpasswordlabel);
  repeatpasswordbox.appendChild(repeatpasswordfieldwrapper);

  page.appendChild(repeatpasswordbox);

  const verificationbox = document.createElement("div");
  verificationbox.className =
    "w-full max-w-96 text-[#c0c0c0] text-xl text-center space-y-4";

  const verificationText = document.createElement("div");
  verificationText.textContent =
    "Verification code sent. Please check your inbox!";

  verificationbox.appendChild(verificationText);

  const verificationCodeInputWrapper = document.createElement("div");
  verificationCodeInputWrapper.className =
    "relative w-full max-w-96 flex justify-center space-x-2";

  const codeLength = 6;

  const verificationCodeInput = document.createElement("input");
  verificationCodeInput.type = "text";
  verificationCodeInput.maxLength = codeLength;
  verificationCodeInput.className = "absolute inset-0 opacity-0";

  const chars = [];

  for (let i = 0; i < codeLength; i++) {
    const verificationCodeChar = document.createElement("div");
    verificationCodeChar.className =
      "w-12 h-12 bg-[#0d0d0d] text-[#c0c0c0] outline-2 outline-[#141414] rounded-xl flex items-center justify-center";
    verificationCodeChar.textContent = "";
    verificationCodeInputWrapper.appendChild(verificationCodeChar);

    chars.push(verificationCodeChar);
  }

  verificationCodeInput.addEventListener("input", () => {
    const value = verificationCodeInput.value;
    for (let i = 0; i < codeLength; i++) {
      chars[i].textContent = value[i] || "";
    }
  });

  verificationCodeInputWrapper.appendChild(verificationCodeInput);

  verificationbox.appendChild(verificationCodeInputWrapper);

  const resendbutton = document.createElement("div");
  resendbutton.className =
    "flex items-center justify-center space-x-2 text-sm text-[#c0c0c0] cursor-pointer";
  resendbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-repeat size-4" viewBox="0 0 16 16">
    <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"/>
    <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"/>
  </svg>
  <span>Resend Verification Code</span>`;

  resendbutton.addEventListener("click", () => {
    // Implement resend functionality here
  });

  verificationbox.appendChild(resendbutton);

  page.appendChild(verificationbox);

  const submitbutton = document.createElement("div");
  submitbutton.className =
    "group relative w-full max-w-96 px-6 py-4 bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#0a0a0a] outline-2 outline-[#141414] shadow-md rounded-xl flex justify-center cursor-pointer transition-all duration-300 ease-in-out";

  submitbutton.tabIndex = 0;

  page.appendChild(submitbutton);

  const submitbuttonText = document.createElement("div");
  submitbuttonText.textContent = "Sign Up";

  submitbutton.appendChild(submitbuttonText);

  const submitbuttonArrow = document.createElement("div");
  submitbuttonArrow.className =
    "absolute right-2 size-6 group-hover:-translate-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out";
  submitbuttonArrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-short size-6" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
  </svg>`;

  submitbutton.appendChild(submitbuttonArrow);

  submitbutton.addEventListener("click", async () => {
    switch (op) {
      case AuthOp.SIGNUP:
        if (
          emailfield.value.trim().length == 0 &&
          usernamefield.value.trim().length == 0 &&
          passwordfield.value.trim().length == 0 &&
          repeatpasswordfield.value.trim().length == 0
        )
          break;
        const signup = await handleSignup(
          emailfield.value.trim(),
          usernamefield.value.trim(),
          passwordfield.value.trim(),
        );

        if (!signup) {
          console.log("Signup failed");
          emailfield.setCustomValidity("Invalid email");
          usernamefield.setCustomValidity("Invalid username");
          passwordfield.setCustomValidity("Invalid password");
          repeatpasswordfield.setCustomValidity("Invalid password");
          setTimeout(() => {
            emailfield.setCustomValidity("");
            usernamefield.setCustomValidity("");
            passwordfield.setCustomValidity("");
            repeatpasswordfield.setCustomValidity("");
          }, 3000);
          return;
        }

        op = AuthOp.SIGNIN_VERIFICATION;
        break;
      case AuthOp.SIGNIN:
        if (
          emailfield.value.trim().length == 0 &&
          passwordfield.value.trim().length == 0
        )
          break;
        const tokens = await handleSignin(
          emailfield.value.trim(),
          passwordfield.value.trim(),
        );

        if (!tokens) {
          emailfield.setCustomValidity("Invalid email");
          passwordfield.setCustomValidity("Invalid password");
          setTimeout(() => {
            emailfield.setCustomValidity("");
            passwordfield.setCustomValidity("");
          }, 3000);
          return;
        }

        authService.authenticate(tokens);
        router.navigate("/");
        break;
      case AuthOp.FORGOT_PASSWORD:
        if (emailfield.value.trim().length == 0) break;
        const forgot = handleForgotPassword(emailfield.value.trim());

        if (!forgot) {
          emailfield.setCustomValidity("Invalid email");
          setTimeout(() => {
            emailfield.setCustomValidity("");
          }, 3000);
          return;
        }

        op = AuthOp.RESET_PASSWORD;
        break;
      case AuthOp.RESET_PASSWORD:
        if (verificationCodeInput.value.trim().length < 6) break;
        resetToken = await handleVerifyCode(
          verificationCodeInput.value.trim(),
          1,
        );

        if (!resetToken) {
          verificationCodeInput.setCustomValidity("Invalid code");
          setTimeout(() => {
            verificationCodeInput.setCustomValidity("");
          }, 3000);
          return;
        }

        op = AuthOp.SET_NEW_PASSWORD;
        break;
      case AuthOp.SET_NEW_PASSWORD:
        if (
          passwordfield.value.trim().length == 0 &&
          repeatpasswordfield.value.trim().length == 0 &&
          resetToken == null
        )
          break;
        const set = await handleResetPassword(
          resetToken,
          passwordfield.value.trim(),
        );

        if (!set) {
          passwordfield.setCustomValidity("Invalid password");
          repeatpasswordfield.setCustomValidity("Invalid password");
          setTimeout(() => {
            passwordfield.setCustomValidity("");
            repeatpasswordfield.setCustomValidity("");
          }, 3000);
          return;
        }

        op = AuthOp.SIGNIN;
        break;
      case AuthOp.SIGNIN_VERIFICATION:
        if (verificationCodeInput.value.trim().length < 6) break;
        resetToken = await handleVerifyCode(
          verificationCodeInput.value.trim(),
          2,
        );

        if (!resetToken) {
          verificationCodeInput.setCustomValidity("Invalid verification code");
          setTimeout(() => {
            verificationCodeInput.setCustomValidity("");
          }, 3000);
          return;
        }

        op = AuthOp.SIGNIN;
        break;
    }

    modeHandler();
  });

  const switchbutton = document.createElement("div");
  switchbutton.className = "w-full max-w-96 cursor-pointer";
  switchbutton.textContent = "Switch to Login";
  switchbutton.tabIndex = 0;

  page.appendChild(switchbutton);

  switchbutton.addEventListener("click", () => {
    switch (op) {
      case AuthOp.SIGNUP:
        op = 1;
        break;
      case AuthOp.SIGNIN:
        op = 0;
        break;
      case AuthOp.FORGOT_PASSWORD:
        op = 1;
        break;
      case AuthOp.RESET_PASSWORD:
        op = 1;
        break;
      case AuthOp.SET_NEW_PASSWORD:
        op = 1;
        break;
      case AuthOp.SIGNIN_VERIFICATION:
        op = 1;
        break;
    }
    modeHandler();
  });

  modeHandler();

  function modeHandler() {
    emailbox.style.display = "none";
    usernamebox.style.display = "none";
    passwordbox.style.display = "none";
    passwordforgot.style.display = "none";
    repeatpasswordbox.style.display = "none";
    verificationbox.style.display = "none";

    emailfield.value = "";
    usernamefield.value = "";
    passwordfield.value = "";
    repeatpasswordfield.value = "";
    verificationCodeInput.value = "";

    switch (op) {
      case 0:
        // signup
        emailbox.style.display = "block";
        usernamebox.style.display = "block";
        passwordbox.style.display = "block";
        repeatpasswordbox.style.display = "block";
        submitbuttonText.textContent = "Sign Up";
        switchbutton.style.display = "block";
        switchbutton.textContent = "Already have an account? Sign In";
        break;
      case 1:
        // signin
        emailbox.style.display = "block";
        passwordbox.style.display = "block";
        passwordforgot.style.display = "block";
        submitbuttonText.textContent = "Sign In";
        switchbutton.style.display = "block";
        switchbutton.textContent = "Don't have an account yet? Sign Up";
        break;
      case 2:
        // forgot password
        emailbox.style.display = "block";
        submitbuttonText.textContent = "Send Code";
        switchbutton.style.display = "block";
        switchbutton.textContent = "Back to Signin";
        break;
      case 3:
        // verification sent
        verificationbox.style.display = "block";
        submitbuttonText.textContent = "Verify";
        switchbutton.textContent = "Back to Signin";
        break;
      case 4:
        // set new password
        passwordbox.style.display = "block";
        repeatpasswordbox.style.display = "block";
        submitbuttonText.textContent = "Set New Password";
        switchbutton.textContent = "Back to Signin";
        break;
      case 5:
        // signin verification
        verificationbox.style.display = "block";
        submitbuttonText.textContent = "Verify";
        switchbutton.style.display = "block";
        switchbutton.textContent = "Back to Signin";
        break;
    }
  }
}

async function handleSignup(email: string, username: string, password: string) {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("username", username);
  formData.append("password", password);

  try {
    const response = await fetch("http://localhost:5000/auth/register", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return false;
    }
  } catch (error) {
    console.warn(error);
    return false;
  }

  return true;
}

async function handleSignin(email: string, password: string) {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  try {
    const response = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.warn(error);
    return false;
  }
}

async function handleForgotPassword(email: string) {
  const formData = new FormData();
  formData.append("email", email);

  try {
    const response = await fetch(
      "http://localhost:5000/auth/password-reset-code",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
}

async function handleVerifyCode(code: string, mode: number) {
  const formData = new FormData();
  formData.append("code", code);

  let url = "";

  if (mode === 1) {
    url = "http://localhost:5000/auth/verify-reset-code";
  } else if (mode === 2) {
    url = "http://localhost:5000/auth/verify-email";
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    return data.resetToken;
  } catch (error) {
    console.warn(error);
    return false;
  }
}

async function handleResetPassword(token: string, password: string) {
  const formData = new FormData();
  formData.append("token", token);
  formData.append("password", password);

  try {
    const response = await fetch("http://localhost:5000/auth/reset-password", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
}
