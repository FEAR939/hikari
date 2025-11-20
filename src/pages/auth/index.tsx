/** @jsx h */
import { h } from "@lib/jsx/runtime";
import { createSignal, bind } from "@lib/jsx/reactive";
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

export default async function Auth(query: any) {
  // --- State ---
  const opSignal = createSignal(AuthOp.SIGNIN);
  const [op, setOp] = opSignal;

  const emailSignal = createSignal("");
  const [email, setEmail] = emailSignal;

  const usernameSignal = createSignal("");
  const [username, setUsername] = usernameSignal;

  const passwordSignal = createSignal("");
  const [password, setPassword] = passwordSignal;

  const repeatPasswordSignal = createSignal("");
  const [repeatPassword, setRepeatPassword] = repeatPasswordSignal;

  const codeSignal = createSignal("");
  const [code, setCode] = codeSignal;

  let resetToken = "";

  // Refs for validation focusing/messages
  let emailInputRef: HTMLInputElement | null = null;
  let usernameInputRef: HTMLInputElement | null = null;
  let passwordInputRef: HTMLInputElement | null = null;
  let repeatPasswordInputRef: HTMLInputElement | null = null;

  // --- Logic ---

  const clearInputs = () => {
    setEmail("");
    setUsername("");
    setPassword("");
    setRepeatPassword("");
    setCode("");
  };

  const switchTo = (mode: AuthOp) => {
    clearInputs();
    setOp(mode);
  };

  const onSwitchClick = () => {
    switch (op()) {
      case AuthOp.SIGNUP:
        switchTo(AuthOp.SIGNIN);
        break;
      case AuthOp.SIGNIN:
        switchTo(AuthOp.SIGNUP);
        break;
      default:
        switchTo(AuthOp.SIGNIN);
        break;
    }
  };

  const showValidity = (input: HTMLInputElement | null, msg: string) => {
    if (!input) return;
    input.setCustomValidity(msg);
    input.reportValidity();
    setTimeout(() => input.setCustomValidity(""), 3000);
  };

  const handleSubmit = async () => {
    const currentOp = op();
    switch (currentOp) {
      case AuthOp.SIGNUP:
        if (
          !email().trim() &&
          !username().trim() &&
          !password().trim() &&
          !repeatPassword().trim()
        )
          break;
        if (
          !(await handleSignup(
            email().trim(),
            username().trim(),
            password().trim(),
          ))
        ) {
          // Error handling logic (simplified for brevity)
          if (emailInputRef) showValidity(emailInputRef, "Registration failed");
          return;
        }
        switchTo(AuthOp.SIGNIN_VERIFICATION);
        break;
      case AuthOp.SIGNIN:
        if (!email().trim() && !password().trim()) break;
        const tokens = await handleSignin(email().trim(), password().trim());
        if (!tokens) {
          if (emailInputRef) showValidity(emailInputRef, "Invalid credentials");
          return;
        }
        authService.authenticate(tokens);
        router.navigate("/");
        break;
      case AuthOp.FORGOT_PASSWORD:
        if (!email().trim()) break;
        if (!(await handleForgotPassword(email().trim()))) {
          if (emailInputRef) showValidity(emailInputRef, "Request failed");
          return;
        }
        switchTo(AuthOp.RESET_PASSWORD);
        break;
      case AuthOp.RESET_PASSWORD:
        if (code().trim().length < 6) break;
        resetToken = await handleVerifyCode(code().trim(), 1);
        if (!resetToken) return;
        switchTo(AuthOp.SET_NEW_PASSWORD);
        break;
      case AuthOp.SET_NEW_PASSWORD:
        if (!password().trim() && !repeatPassword().trim()) break;
        if (!(await handleResetPassword(resetToken, password().trim()))) {
          if (passwordInputRef) showValidity(passwordInputRef, "Reset failed");
          return;
        }
        switchTo(AuthOp.SIGNIN);
        break;
      case AuthOp.SIGNIN_VERIFICATION:
        if (code().trim().length < 6) break;
        resetToken = await handleVerifyCode(code().trim(), 2);
        if (!resetToken) return;
        switchTo(AuthOp.SIGNIN);
        break;
    }
  };

  const handleCodeKeyUp = (e: KeyboardEvent) => {
    const currentCode = code();
    if (e.key === "Backspace") setCode(currentCode.slice(0, -1));
    else if (currentCode.length < 6 && /^[0-9a-zA-Z]$/.test(e.key))
      setCode(currentCode + e.key);
  };

  // --- Components & UI ---

  // Base container
  const page = document.createElement("div");
  page.className =
    "relative h-full w-full p-4 flex flex-col items-center justify-center bg-black text-neutral-200 selection:bg-neutral-800";

  // Dynamic Header to give context
  const HeaderSection = bind(opSignal, (mode) => {
    let title = "";
    let desc = "";

    switch (mode) {
      case AuthOp.SIGNIN:
        title = "Welcome back";
        desc = "Enter your credentials to access your account";
        break;
      case AuthOp.SIGNUP:
        title = "Create an account";
        desc = "Enter your information below to create your account";
        break;
      case AuthOp.FORGOT_PASSWORD:
        title = "Reset Password";
        desc = "Enter your email to receive a reset code";
        break;
      case AuthOp.RESET_PASSWORD:
      case AuthOp.SIGNIN_VERIFICATION:
        title = "Verify Code";
        desc = "Enter the 6-digit code sent to your email";
        break;
      case AuthOp.SET_NEW_PASSWORD:
        title = "New Password";
        desc = "Enter your new secure password below";
        break;
    }

    return (
      <div class="flex flex-col space-y-2 text-center mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h1 class="text-2xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        <p class="text-sm text-neutral-400">{desc}</p>
      </div>
    );
  });

  // Input Styling Helper
  const inputWrapperClass =
    "group flex items-center space-x-3 w-full px-3 py-2.5 bg-neutral-900/50 border border-neutral-800 rounded-lg focus-within:ring-1 focus-within:ring-neutral-600 focus-within:border-neutral-600 transition-all duration-200 has-[:invalid:not(:placeholder-shown):not(:focus)]:border-red-900/50";
  const inputIconClass =
    "text-neutral-500 size-5 group-focus-within:text-neutral-300 transition-colors";
  const inputClass =
    "w-full h-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-600 outline-none border-none";
  const labelClass = "text-xs font-medium text-neutral-300 ml-1";

  const EmailSection = bind(opSignal, (mode) => {
    if (![AuthOp.SIGNUP, AuthOp.SIGNIN, AuthOp.FORGOT_PASSWORD].includes(mode))
      return document.createElement("div");
    return (
      <div class="w-full max-w-[350px] space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-500">
        <label class={labelClass}>Email</label>
        <div class={inputWrapperClass}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class={inputIconClass}
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <input
            ref={(el: HTMLInputElement) => (emailInputRef = el)}
            class={inputClass}
            type="email"
            required
            placeholder="name@example.com"
            value={email()}
            onInput={(e: any) => setEmail(e.target.value)}
          />
        </div>
      </div>
    );
  });

  const UsernameSection = bind(opSignal, (mode) => {
    if (mode !== AuthOp.SIGNUP) return document.createElement("div");
    return (
      <div class="w-full max-w-[350px] space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <label class={labelClass}>Username</label>
        <div class={inputWrapperClass}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class={inputIconClass}
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <input
            ref={(el: HTMLInputElement) => (usernameInputRef = el)}
            class={inputClass}
            type="text"
            required
            placeholder="johndoe"
            value={username()}
            onInput={(e: any) => setUsername(e.target.value)}
          />
        </div>
      </div>
    );
  });

  const PasswordSection = bind(opSignal, (mode) => {
    if (![AuthOp.SIGNUP, AuthOp.SIGNIN, AuthOp.SET_NEW_PASSWORD].includes(mode))
      return document.createElement("div");
    return (
      <div class="w-full max-w-[350px] space-y-2 animate-in fade-in slide-in-from-bottom-5 duration-500">
        <div class="flex justify-between items-center">
          <label class={labelClass}>Password</label>
          {mode === AuthOp.SIGNIN && (
            <div
              class="text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors"
              onClick={() => switchTo(AuthOp.FORGOT_PASSWORD)}
            >
              Forgot?
            </div>
          )}
        </div>
        <div class={inputWrapperClass}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class={inputIconClass}
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            ref={(el: HTMLInputElement) => (passwordInputRef = el)}
            class={inputClass}
            type="password"
            required
            placeholder="••••••••"
            value={password()}
            onInput={(e: any) => setPassword(e.target.value)}
          />
        </div>
      </div>
    );
  });

  const RepeatPasswordSection = bind(opSignal, (mode) => {
    if (![AuthOp.SIGNUP, AuthOp.SET_NEW_PASSWORD].includes(mode))
      return document.createElement("div");
    return (
      <div class="w-full max-w-[350px] space-y-2 animate-in fade-in slide-in-from-bottom-6 duration-500">
        <label class={labelClass}>Confirm Password</label>
        <div class={inputWrapperClass}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class={inputIconClass}
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            ref={(el: HTMLInputElement) => (repeatPasswordInputRef = el)}
            class={inputClass}
            type="password"
            required
            placeholder="••••••••"
            value={repeatPassword()}
            onInput={(e: any) => {
              setRepeatPassword(e.target.value);
              if (e.target.value !== password())
                e.target.setCustomValidity("Passwords do not match");
              else e.target.setCustomValidity("");
            }}
          />
        </div>
      </div>
    );
  });

  const VerificationSection = bind(opSignal, (mode) => {
    if (![AuthOp.RESET_PASSWORD, AuthOp.SIGNIN_VERIFICATION].includes(mode))
      return document.createElement("div");
    return (
      <div class="w-full max-w-[350px] flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="relative flex items-center justify-center">
          {/* OTP Styling: A visually unified segmented control */}
          <div
            class="flex border border-neutral-800 bg-neutral-900/50 rounded-lg overflow-hidden"
            tabIndex={0}
            onKeyUp={handleCodeKeyUp}
          >
            {bind(codeSignal, (c) => (
              <div class="contents">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div class="w-10 h-12 flex items-center justify-center text-lg font-bold border-r border-neutral-800 last:border-r-0">
                    {c[i] || ""}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div class="flex items-center space-x-2 text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          <span>Resend code</span>
        </div>
      </div>
    );
  });

  const SubmitButton = (
    <div class="w-full max-w-[350px] mt-2">
      <div
        class="group relative w-full py-2.5 bg-neutral-100 hover:bg-white text-black font-medium text-sm rounded-lg shadow-sm flex justify-center items-center cursor-pointer transition-all duration-200 outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-black"
        tabIndex={0}
        onClick={handleSubmit}
      >
        {bind(opSignal, (mode) => {
          switch (mode) {
            case AuthOp.SIGNUP:
              return <div>Sign Up with Email</div>;
            case AuthOp.SIGNIN:
              return <div>Sign In</div>;
            case AuthOp.FORGOT_PASSWORD:
              return <div>Send Reset Code</div>;
            case AuthOp.RESET_PASSWORD:
            case AuthOp.SIGNIN_VERIFICATION:
              return <div>Verify Code</div>;
            case AuthOp.SET_NEW_PASSWORD:
              return <div>Save New Password</div>;
            default:
              return <div>Submit</div>;
          }
        })}
        {/* Icon hidden/shown based on hover logic in CSS, simplified here to just be present */}
        <span class="absolute right-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );

  const SwitchButton = (
    <div class="mt-6 text-center text-sm text-neutral-500">
      {bind(opSignal, (mode) => {
        if (mode === AuthOp.SIGNUP) {
          return (
            <div
              onClick={onSwitchClick}
              class="cursor-pointer hover:text-neutral-300 transition-colors"
            >
              Already have an account?{" "}
              <span class="underline underline-offset-4 text-neutral-300">
                Sign In
              </span>
            </div>
          );
        } else if (mode === AuthOp.SIGNIN) {
          return (
            <div
              onClick={onSwitchClick}
              class="cursor-pointer hover:text-neutral-300 transition-colors"
            >
              Don't have an account?{" "}
              <span class="underline underline-offset-4 text-neutral-300">
                Sign Up
              </span>
            </div>
          );
        } else {
          return (
            <div
              onClick={() => switchTo(AuthOp.SIGNIN)}
              class="flex items-center justify-center gap-1 cursor-pointer hover:text-neutral-300 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              <span>Back to Sign in</span>
            </div>
          );
        }
      })}
    </div>
  );

  // === Assembly ===
  // Wrapper for contents to ensure center alignment and spacing
  const contentWrapper = document.createElement("div");
  contentWrapper.className = "w-full max-w-[350px] flex flex-col gap-4";

  contentWrapper.appendChild(HeaderSection);
  contentWrapper.appendChild(EmailSection);
  contentWrapper.appendChild(UsernameSection);
  contentWrapper.appendChild(PasswordSection);
  contentWrapper.appendChild(RepeatPasswordSection);
  contentWrapper.appendChild(VerificationSection);
  contentWrapper.appendChild(SubmitButton as unknown as Node);
  contentWrapper.appendChild(SwitchButton as unknown as Node);

  page.appendChild(contentWrapper);

  router.container!.appendChild(page);
}

// --- API Methods (Unchanged) ---

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
    if (!response.ok) return false;
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
    if (!response.ok) return false;
    return await response.json();
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
    if (!response.ok) return false;
    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
}

async function handleVerifyCode(code: string, mode: number) {
  const formData = new FormData();
  formData.append("code", code);
  let url =
    mode === 1
      ? `${API.baseurl}/auth/verify-reset-code`
      : `${API.baseurl}/auth/verify-email`;
  try {
    const response = await fetch(url, { method: "POST", body: formData });
    if (!response.ok) return false;
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
    if (!response.ok) return false;
    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
}
