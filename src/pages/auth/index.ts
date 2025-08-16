export default async function Auth(query) {
  const page = document.createElement("div");
  page.className =
    "h-full w-full flex flex-col items-center justify-center space-y-4";

  document.root.appendChild(page);

  let signup = true;

  const usernamefield = document.createElement("input");
  usernamefield.className =
    "w-full max-w-96 px-4 py-2 bg-[#0d0d0d] text-[#c0c0c0] outline-none border-none rounded-xl";
  usernamefield.type = "text";
  usernamefield.placeholder = "Username";

  page.appendChild(usernamefield);

  const passwordfield = document.createElement("input");
  passwordfield.className =
    "w-full max-w-96 px-4 py-2 bg-[#0d0d0d] text-[#c0c0c0] outline-none border-none rounded-xl";
  passwordfield.type = "password";
  passwordfield.placeholder = "Password";

  page.appendChild(passwordfield);

  const submitbutton = document.createElement("div");
  submitbutton.className =
    "w-full max-w-96 px-4 py-2 bg-[#0d0d0d] text-[#c0c0c0] outline-none border-none rounded-xl flex justify-center cursor-pointer";
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
    } else {
      submitbutton.textContent = "Sign In";
      switchbutton.textContent = "Don't have an account yet? Sign Up";
    }
  }
}
