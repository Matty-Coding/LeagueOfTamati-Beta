import { useEffect, useState, type JSX } from "react";
import { useNavigate, useSearchParams } from "react-router";
import EmailInput from "../../components/form/email-input";
import SubmitButton from "../../components/form/submit-button";
import { emailRegex } from "../../utils/regex";
import { resendActivationRequest } from "../../services/auth";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { Alert } from "../../components/alert";
import NavBar from "../../components/navbar";
import { resetPasswordRequest } from "../../services/user";
import { usePersistedCountdown } from "../../hooks/countdown-limiter";
import { useAuth } from "../../hooks/auth";

export function ResendEmailPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const [emailValue, setEmailValue] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);

  const navigate = useNavigate();

  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    navigate(`/profile/${user?.username}`, { replace: true });
  }

  const { countdown, isOnCountdown, refresh } =
    usePersistedCountdown("unlock_at");

  const isActivation = type === "activation-account";

  const title = isActivation ? "Resend Activation Email" : "Reset Password";

  useEffect(() => {
    document.title = `${title} | League of Tamati`;
  }, [title]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmailValue(value);

    if (value.trim() === "") {
      setEmailError("Email is required");
    } else if (!emailRegex.test(value)) {
      setEmailError("Email is invalid");
    } else {
      setEmailError(null);
      setIsEmailValid(true);
    }
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setEmailError(null);

    try {
      let response: { message: string };
      if (isActivation) {
        response = await resendActivationRequest(emailValue);
      } else {
        response = await resetPasswordRequest(emailValue);
      }
      toast.success(response.message);
      navigate("/login", {
        state: {
          message: "Check your inbox.",
        },
      });
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 429) {
        const unlockAt = error.response.data.unlock_at;
        localStorage.setItem("unlock_at", unlockAt);
        refresh();
      } else if (isAxiosError(error)) {
        setError(error.response?.data?.detail);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="w-xs md:w-md mx-auto rounded-md py-2 min-h-[80vh] flex-center flex-col">
        <h1 className="text-lol-gold font-cinzel text-3xl text-center py-2">
          {title}
        </h1>
        <p className="text-lol-text text-center">
          {isActivation
            ? "Enter your email to receive a new activation link."
            : "Enter your email to receive a password reset link."}
        </p>

        {/* limiter alert 429 */}
        {isOnCountdown && (
          <Alert
            type="warning"
            message="Too many requests, please wait before trying again"
          />
        )}

        <div className="form-container">
          <form
            method="post"
            onSubmit={handleSubmit}
            className="flex-center flex-col w-full gap-3"
          >
            <EmailInput
              id="email"
              name="email"
              value={emailValue}
              errorMessage={emailError}
              onChange={handleChange}
            />

            {/* response error */}
            {error && <Alert type="error" message={error} />}

            <SubmitButton
              disabled={!isEmailValid || isSubmitting || isOnCountdown}
              text={isOnCountdown ? `Please wait ${countdown}s` : "Send Email"}
              isSubmitting={isSubmitting}
            />
          </form>
        </div>
      </div>
    </>
  );
}
