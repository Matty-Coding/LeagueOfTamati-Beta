import { useEffect, useState, type JSX } from "react";
import SubmitButton from "../../components/form/submit-button";
import PasswordInput from "../../components/form/password-input";
import NavBar from "../../components/navbar";
import { useNavigate, useParams } from "react-router";
import { passwordRegex } from "../../utils/regex";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";
import { resetPasswordConfirmRequest } from "../../services/user";
import { Alert } from "../../components/alert";
import { useAuth } from "../../hooks/auth";

export function ResetPasswordPage(): JSX.Element {
  const { token } = useParams();

  const [passwordValue, setPasswordValue] = useState<string>("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState<string>("");

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();

  const { logout } = useAuth();

  useEffect(() => {
    document.title = "Reset Password | League of Tamati";
  }, []);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid token");
      navigate("/");
    }
  }, [token, navigate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === "password") {
      setPasswordValue(value);

      if (value.trim() === "") {
        setPasswordError("Password is required");
      } else if (!passwordRegex.test(value)) {
        setPasswordError(
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character",
        );
      } else {
        setPasswordError(null);
      }
    }

    if (confirmPasswordValue && value !== confirmPasswordValue) {
      setConfirmPasswordError("Passwords do not match");
    } else if (confirmPasswordValue && value === confirmPasswordValue) {
      setConfirmPasswordError(null);
    }

    if (name === "confirmPassword") {
      setConfirmPasswordValue(value);

      if (value.trim() === "") {
        setConfirmPasswordError("Confirm Password is required");
      } else if (value !== passwordValue) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError(null);
      }
    }
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await resetPasswordConfirmRequest(token, passwordValue);
      toast.success(response.message);
      logout();
      navigate("/login", {
        replace: true,
        state: {
          message: "Now you can login with your new password",
        },
      });
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        setError(error.response?.data?.detail);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPasswordValid =
    passwordValue.trim() !== "" &&
    confirmPasswordValue.trim() !== "" &&
    passwordError === null &&
    confirmPasswordError === null;

  if (!token) return <></>;

  return (
    <>
      <NavBar />
      <div className="w-xs md:w-md mx-auto rounded-md py-2 min-h-[80vh] flex-center flex-col">
        <h1 className="text-lol-gold font-cinzel text-3xl text-center py-2">
          Reset Password
        </h1>

        <p className="text-lol-text text-center">Insert your new password</p>

        <div className="form-container">
          <form
            method="patch"
            onSubmit={handleSubmit}
            className="flex-center flex-col w-full gap-3"
          >
            <PasswordInput
              labelText="Password"
              id="password"
              name="password"
              value={passwordValue}
              errorMessage={passwordError}
              onChange={handleChange}
            />

            <PasswordInput
              labelText="Confirm Password"
              id="confirm-password"
              name="confirmPassword"
              value={confirmPasswordValue}
              errorMessage={confirmPasswordError}
              onChange={handleChange}
            />

            {/* response error */}
            {error && <Alert type="error" message={error} />}

            <SubmitButton
              disabled={!isPasswordValid || isSubmitting}
              text="Reset Password"
              isSubmitting={isSubmitting}
            />
          </form>
        </div>
      </div>
    </>
  );
}
