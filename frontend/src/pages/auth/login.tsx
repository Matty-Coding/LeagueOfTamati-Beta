import { useEffect, useMemo, useState, type JSX } from "react";
import { Link, useNavigate } from "react-router";
import TextInput from "../../components/form/text-input";
import PasswordInput from "../../components/form/password-input";
import SubmitButton from "../../components/form/submit-button";
import NavBar from "../../components/navbar";
import { Alert } from "../../components/alert";
import { useLocation } from "react-router";
import { loginRequest } from "../../services/auth";
import { isAxiosError } from "axios";
import { useAuth } from "../../hooks/auth";
import { toast } from "react-toastify";
import { usePersistedCountdown } from "../../hooks/countdown-limiter";

export interface LoginFormValues {
  username: string;
  password: string;
}

export interface LoginFormErrors {
  username?: string;
  password?: string;
}

export interface LoginFormTouched {
  username: boolean;
  password: boolean;
}

export default function LoginPage(): JSX.Element {
  // hooks
  useEffect(() => {
    document.title = "Login | League of Tamati";
  }, []);

  // form handling
  const [formValues, setFormValues] = useState<LoginFormValues>({
    username: "",
    password: "",
  });

  const [formValuesTouched, setFormValueTouched] = useState<LoginFormTouched>({
    username: false,
    password: false,
  });

  const { countdown, isOnCountdown, refresh } =
    usePersistedCountdown("unlock_at");

  // form flow
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [submitError, setSubmitError] = useState<string | null>(null);

  // auth context
  const { login, isAuthenticated, user } = useAuth();

  // navigation
  const navigate = useNavigate();

  if (isAuthenticated)
    navigate(`/profile/${user?.username}`, { replace: true });

  // redirect after register
  const location = useLocation();
  const redirectMessage = location.state?.message ?? null;
  const redirectRoute = location.state?.from ?? null;

  // functions
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
    setFormValueTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  // handling touched fields
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name } = event.target;
    setFormValueTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    setSubmitError(null);

    try {
      const response = await loginRequest({
        username: formValues.username,
        password: formValues.password,
      });

      login(response.user, response.access_token, response.csrf_token);

      toast.success("Login successful!");

      navigate(redirectRoute ?? `/profile/${response.user.username}`, {
        replace: true,
      });
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 429) {
        const unlockAt = error.response.data.unlock_at;
        localStorage.setItem("unlock_at", unlockAt);
        refresh();
      } else if (isAxiosError(error)) {
        setSubmitError(error.response?.data?.detail);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // check if all fields are touched
  const allFieldsTouched: boolean =
    formValuesTouched.username && formValuesTouched.password;

  // form validation
  const formErrors = useMemo((): LoginFormErrors => {
    const errors: LoginFormErrors = {};

    // username validation
    if (formValuesTouched.username && !formValues.username.trim()) {
      errors.username = "Username is required";
    }

    // password validation
    if (formValuesTouched.password && !formValues.password.trim()) {
      errors.password = "Password is required";
    }

    return errors;
  }, [formValues, formValuesTouched]);

  // check if form is valid
  const isFormValid = Object.keys(formErrors).length === 0 && allFieldsTouched;

  // rendering
  return (
    <>
      <NavBar />

      <div className="w-xs md:w-md mx-auto rounded-md py-2 min-h-[80vh] flex-center flex-col">
        <h1 className="text-lol-gold font-cinzel text-3xl text-center py-2">
          CONTINUE YOUR JOURNEY
        </h1>

        {/* redirect from register */}
        {redirectMessage && <Alert type="info" message={redirectMessage} />}

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
            {/* username */}
            <TextInput
              id="username"
              name="username"
              placeholder="Username"
              errorMessage={formErrors.username}
              value={formValues.username}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* password */}
            <PasswordInput
              labelText="Password"
              id="password"
              name="password"
              value={formValues.password}
              errorMessage={formErrors.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* response error */}
            {submitError && <Alert type="error" message={submitError} />}

            {submitError?.toLowerCase()?.includes("account") && (
              <Link
                to={{
                  pathname: "/send-email",
                  search: "?type=activation-account",
                }}
                className="border border-lol-gold px-2 py-1 rounded-md text-lol-gold hover:bg-lol-gold hover:text-lol-bg transition-all duration-300 ease-in-out w-full text-center text-sm"
              >
                Click here to receive new activation email
              </Link>
            )}

            {/* submit button */}
            <SubmitButton
              disabled={
                isSubmitting ||
                !isFormValid ||
                !allFieldsTouched ||
                isOnCountdown
              }
              text={isOnCountdown ? `Please wait ${countdown}s` : "Login"}
              isSubmitting={isSubmitting}
            />
          </form>

          <div className="w-full flex-center flex-col py-5 text-sm">
            <Link
              to={{
                pathname: "/send-email",
                search: "?type=reset-password",
              }}
              className="hover:underline text-lol-text/60 hover:text-lol-text"
            >
              Forgot Password?
            </Link>

            <p className="text-center text-lol-text">
              Do not have any account?{" "}
              <Link
                to="/register"
                className="text-emerald-400 hover:text-emerald-300"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
