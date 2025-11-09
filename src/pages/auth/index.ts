import { authService } from "../../services/auth";
import { router } from "../../lib/router/index";
import { API } from "../../app";

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
    "relative h-full w-full p-4 flex flex-col items-center justify-center space-y-8";

  router.container!.appendChild(page);

  const pageback = document.createElement("div");
  pageback.className =
    "absolute z-10 top-2 left-4 size-8 flex items-center justify-center cursor-pointer";
  pageback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-to-line-icon lucide-arrow-left-to-line"><path d="M3 19V5"/><path d="m13 6-6 6 6 6"/><path d="M7 12h14"/></svg>`;

  page.appendChild(pageback);

  pageback.addEventListener("click", () => {
    router.navigate("/");
  });

  let op: AuthOp = AuthOp.SIGNIN;
  let resetToken = "";

  const emailbox = document.createElement("div");
  emailbox.className = "w-full max-w-96 space-y-2";

  const emaillabel = document.createElement("div");
  emaillabel.textContent = "Email";

  const emailfieldwrapper = document.createElement("div");
  emailfieldwrapper.className =
    "group flex items-center space-x-4 w-full max-w-96 px-4 py-3 outline-2 outline-[#141414] rounded-xl has-[:invalid:not(:placeholder-shown):not(:focus)]:outline-red-800";
  emailfieldwrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail-icon lucide-mail"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>`;

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
    "group flex items-center space-x-4 w-full max-w-96 px-4 py-3 outline-2 outline-[#141414] rounded-xl has-[:invalid:not(:placeholder-shown):not(:focus)]:outline-red-800";
  usernamefieldwrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-icon lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

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
    "group flex items-center space-x-4 w-full max-w-96 px-4 py-3 outline-2 outline-[#141414] rounded-xl has-[:invalid:not(:placeholder-shown):not(:focus)]:outline-red-800";
  passwordfieldwrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock-icon lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

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
    "group flex items-center space-x-4 w-full max-w-96 px-4 py-3 outline-2 outline-[#141414] rounded-xl has-[:invalid:not(:placeholder-shown):not(:focus)]:outline-red-800";
  repeatpasswordfieldwrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock-icon lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

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
    "w-full max-w-96 text-[#c0c0c0] text-md text-center space-y-4";

  const verificationText = document.createElement("div");
  verificationText.className = "space-y-2";
  verificationText.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail-open-icon lucide-mail-open size-10 mx-auto"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>
    <div>Verification code sent. Please check your inbox!</div>`;

  verificationbox.appendChild(verificationText);

  const verificationCodeInputWrapper = document.createElement("div");
  verificationCodeInputWrapper.className =
    "relative w-full max-w-96 bg-neutral-900 flex items-center justify-center space-x-2 outline-none border-1 border-neutral-800 rounded-xl";
  verificationCodeInputWrapper.tabIndex = 0;

  const codeLength = 6;

  const chars = [];
  let charString = "";

  for (let i = 0; i < codeLength; i++) {
    if (i !== 0) {
      const divider = document.createElement("div");
      divider.className = "w-0.25 h-4 rounded bg-neutral-800";

      verificationCodeInputWrapper.appendChild(divider);
    }
    const verificationCodeChar = document.createElement("div");
    verificationCodeChar.className =
      "w-12 h-12 flex items-center justify-center";
    verificationCodeChar.textContent = "";
    verificationCodeInputWrapper.appendChild(verificationCodeChar);

    chars.push(verificationCodeChar);
  }

  verificationCodeInputWrapper.addEventListener("keyup", (e) => {
    switch (e.key) {
      case "Backspace":
        chars[chars.length - 1].textContent = "";
        charString = charString.slice(0, charString.length - 1);
        break;
      default:
        if (charString.length < codeLength && /^[0-9a-zA-Z]$/.test(e.key)) {
          chars[charString.length].textContent = e.key;

          charString += e.key;
        }
        break;
    }
    const value = charString;
    for (let i = 0; i < codeLength; i++) {
      chars[i].textContent = value[i] || "";
    }
  });

  verificationbox.appendChild(verificationCodeInputWrapper);

  const resendbutton = document.createElement("div");
  resendbutton.className =
    "flex items-center justify-center space-x-2 text-sm text-[#c0c0c0] cursor-pointer";
  resendbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-cw-icon lucide-rotate-cw"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
  <span>Resend Verification Code</span>`;

  resendbutton.addEventListener("click", () => {
    // Implement resend functionality here
  });

  verificationbox.appendChild(resendbutton);

  page.appendChild(verificationbox);

  const submitbutton = document.createElement("div");
  submitbutton.className =
    "group relative w-full max-w-96 px-6 py-2 bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#0a0a0a] outline-2 outline-[#141414] shadow-md rounded-xl flex justify-center cursor-pointer transition-all duration-300 ease-in-out";

  submitbutton.tabIndex = 0;

  page.appendChild(submitbutton);

  const submitbuttonText = document.createElement("div");
  submitbuttonText.textContent = "Sign Up";

  submitbutton.appendChild(submitbuttonText);

  const submitbuttonArrow = document.createElement("div");
  submitbuttonArrow.className =
    "absolute right-2 size-6 group-hover:-translate-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out";
  submitbuttonArrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right-icon lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;

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
        const forgot = await handleForgotPassword(emailfield.value.trim());

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
        if (charString.trim().length < 6) break;
        resetToken = await handleVerifyCode(charString.trim(), 1);

        if (!resetToken) {
          // verificationCodeInput.setCustomValidity("Invalid code");
          // setTimeout(() => {
          //   verificationCodeInput.setCustomValidity("");
          // }, 3000);
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
        if (charString.trim().length < 6) break;
        resetToken = await handleVerifyCode(charString.trim(), 2);

        if (!resetToken) {
          // verificationCodeInput.setCustomValidity("Invalid verification code");
          // setTimeout(() => {
          //   verificationCodeInput.setCustomValidity("");
          // }, 3000);
          return;
        }

        op = AuthOp.SIGNIN;
        break;
    }

    modeHandler();
  });

  const switchbutton = document.createElement("div");
  switchbutton.className = "flex space-x-2 w-full max-w-96 cursor-pointer";
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
    charString = "";

    switch (op) {
      case 0:
        // signup
        emailbox.style.display = "block";
        usernamebox.style.display = "block";
        passwordbox.style.display = "block";
        repeatpasswordbox.style.display = "block";
        submitbuttonText.textContent = "Sign Up";
        switchbutton.style.display = "flex";
        switchbutton.innerHTML = `
          <div class="text-neutral-500 w-fit">Already have an account?</div>
          <div class="text-neutral-200 flex gap-1 hover:underline">
            Sign In
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-arrow-out-up-right-icon lucide-square-arrow-out-up-right size-4"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/></svg>
          </div>

          `;
        break;
      case 1:
        // signin
        emailbox.style.display = "block";
        passwordbox.style.display = "block";
        passwordforgot.style.display = "block";
        submitbuttonText.textContent = "Sign In";
        switchbutton.style.display = "flex";
        switchbutton.innerHTML = `
          <div class="text-neutral-500 w-fit">Don't have an account yet?</div>
          <span class="text-neutral-200 flex gap-1 hover:underline">
            Sign Up
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-arrow-out-up-right-icon lucide-square-arrow-out-up-right size-4"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/></svg>
          </span>
          `;
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
    const response = await fetch(`${API.baseurl}/auth/register`, {
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
    const response = await fetch(`${API.baseurl}/auth/login`, {
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
    const response = await fetch(`${API.baseurl}/auth/password-reset-code`, {
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

async function handleVerifyCode(code: string, mode: number) {
  const formData = new FormData();
  formData.append("code", code);

  let url = "";

  if (mode === 1) {
    url = `${API.baseurl}/auth/verify-reset-code`;
  } else if (mode === 2) {
    url = `${API.baseurl}/auth/verify-email`;
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
    const response = await fetch(`${API.baseurl}/auth/reset-password`, {
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
