export default async function Auth(query) {
  const page = document.createElement("div");
  page.className =
    "h-full w-full flex flex-col items-center justify-center space-y-8";

  document.root.appendChild(page);

  // op mapping:
  // 0 -> signup
  // 1 -> signin
  // 2 -> forgot password
  // 3 -> verification sent
  let op = 0;

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
  emailfield.placeholder = "you@example.com";

  emailfieldwrapper.appendChild(emailfield);

  emailbox.appendChild(emaillabel);
  emailbox.appendChild(emailfieldwrapper);

  page.appendChild(emailbox);

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
  passwordfield.placeholder = "Password";

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
  repeatpasswordfield.placeholder = "Password";

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
    "w-full max-w-96 text-[#c0c0c0] text-xl text-center";
  verificationbox.textContent =
    "Verification Email sent, please check your inbox!";

  page.appendChild(verificationbox);

  const submitbutton = document.createElement("div");
  submitbutton.className =
    "w-full max-w-96 px-6 py-4 bg-[#0d0d0d] text-[#c0c0c0] outline-none border-none rounded-xl flex justify-center cursor-pointer";
  submitbutton.textContent = "Sign Up";

  page.appendChild(submitbutton);

  const switchbutton = document.createElement("div");
  switchbutton.className = "w-full max-w-96 cursor-pointer";
  switchbutton.textContent = "Switch to Login";

  page.appendChild(switchbutton);

  switchbutton.addEventListener("click", () => {
    switch (op) {
      case 0:
        op = 1;
        break;
      case 1:
        op = 0;
        break;
      case 2:
        op = 1;
        break;
      case 3:
        op = 0;
        break;
    }
    modeHandler();
  });

  modeHandler();

  function modeHandler() {
    emailbox.style.display = "none";
    passwordbox.style.display = "none";
    passwordforgot.style.display = "none";
    repeatpasswordbox.style.display = "none";
    verificationbox.style.display = "none";

    switch (op) {
      case 0:
        // signup
        emailbox.style.display = "block";
        passwordbox.style.display = "block";
        repeatpasswordbox.style.display = "block";
        submitbutton.textContent = "Sign Up";
        switchbutton.style.display = "block";
        switchbutton.textContent = "Already have an account? Sign In";
        break;
      case 1:
        // signin
        emailbox.style.display = "block";
        passwordbox.style.display = "block";
        passwordforgot.style.display = "block";
        submitbutton.textContent = "Sign In";
        switchbutton.style.display = "block";
        switchbutton.textContent = "Don't have an account yet? Sign Up";
        break;
      case 2:
        // forgot password
        emailbox.style.display = "block";
        submitbutton.textContent = "Reset Password";
        switchbutton.style.display = "block";
        switchbutton.textContent = "Back to Signin";
        break;
      case 3:
        // verification sent
        verificationbox.style.display = "block";
        submitbutton.textContent = "Back to Signin";
        break;
    }
  }
}
