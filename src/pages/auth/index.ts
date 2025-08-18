export default async function Auth(query) {
  const page = document.createElement("div");
  page.className =
    "h-full w-full flex flex-col items-center justify-center space-y-8";

  document.root.appendChild(page);

  let signup = true;

  const emailbox = document.createElement("div");
  emailbox.className = "w-full max-w-96 space-y-2";

  const emaillabel = document.createElement("div");
  emaillabel.textContent = "Email";

  const emailfield = document.createElement("input");
  emailfield.className =
    "w-full max-w-96 px-6 py-4 bg-transparent text-[#c0c0c0] outline-2 outline-[#141414] rounded-xl invalid:[&:not(:placeholder-shown):not(:focus)]:outline-red-500";
  emailfield.type = "email";
  emailfield.required = true;
  emailfield.placeholder = "you@example.com";

  emailbox.appendChild(emaillabel);
  emailbox.appendChild(emailfield);

  page.appendChild(emailbox);

  const passwordbox = document.createElement("div");
  passwordbox.className = "w-full max-w-96 space-y-2";

  const passwordlabel = document.createElement("div");
  passwordlabel.textContent = "Password";

  const passwordfield = document.createElement("input");
  passwordfield.className =
    "w-full max-w-96 px-6 py-4 bg-transparent text-[#c0c0c0] outline-2 outline-[#141414] rounded-xl invalid:[&:not(:placeholder-shown):not(:focus)]:outline-red-500";
  passwordfield.type = "password";
  passwordfield.required = true;
  passwordfield.placeholder = "Password";

  passwordbox.appendChild(passwordlabel);
  passwordbox.appendChild(passwordfield);

  page.appendChild(passwordbox);

  const repeatpasswordbox = document.createElement("div");
  repeatpasswordbox.className = "w-full max-w-96 space-y-2";

  const repeatpasswordlabel = document.createElement("div");
  repeatpasswordlabel.textContent = "Repeat Password";

  const repeatpasswordfield = document.createElement("input");
  repeatpasswordfield.className =
    "w-full max-w-96 px-6 py-4 bg-transparent text-[#c0c0c0] outline-2 outline-[#141414] rounded-xl invalid:[&:not(:placeholder-shown):not(:focus)]:outline-red-500";
  repeatpasswordfield.type = "password";
  repeatpasswordfield.required = true;
  repeatpasswordfield.placeholder = "Repeat Password";

  repeatpasswordbox.appendChild(repeatpasswordlabel);
  repeatpasswordbox.appendChild(repeatpasswordfield);

  page.appendChild(repeatpasswordbox);

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
    signup = !signup;
    modeHandler();
  });

  modeHandler();

  function modeHandler() {
    if (signup) {
      submitbutton.textContent = "Sign Up";
      switchbutton.textContent = "Already have an account? Sign In";
      repeatpasswordbox.style.display = "block";
    } else {
      submitbutton.textContent = "Sign In";
      switchbutton.textContent = "Don't have an account yet? Sign Up";
      repeatpasswordbox.style.display = "none";
    }
  }
}
