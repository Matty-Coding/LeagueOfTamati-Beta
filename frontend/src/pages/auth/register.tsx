import { useEffect, useMemo, useState, type JSX } from "react";
import { Link } from "react-router";
import TextInput from "../../components/form/text-input";
import EmailInput from "../../components/form/email-input";
import PasswordInput from "../../components/form/password-input";
import SubmitButton from "../../components/form/submit-button";
import NavBar from "../../components/navbar";
import { registerRequest } from "../../services/auth";
import { isAxiosError } from "axios";
import { Alert } from "../../components/alert";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { emailRegex, passwordRegex, usernameRegex } from "../../utils/regex";
import { usePersistedCountdown } from "../../hooks/countdown-limiter";
import { useAuth } from "../../hooks/auth";

export interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface RegisterFormTouched {
  username: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
}

export default function RegisterPage(): JSX.Element {
  // hooks
  useEffect(() => {
    document.title = "Register | League of Tamati";
  }, []);

  const [formValues, setFormValues] = useState<RegisterFormValues>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formValuesTouched, setFormValueTouched] =
    useState<RegisterFormTouched>({
      username: false,
      email: false,
      password: false,
      confirmPassword: false,
    });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const navigate = useNavigate();

  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    navigate(`/profile/${user?.username}`, { replace: true });
  }

  const { countdown, isOnCountdown, refresh } =
    usePersistedCountdown("unlock_at");

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
      await registerRequest({
        username: formValues.username,
        email: formValues.email,
        password: formValues.password,
      });
      toast.success("Registration successful!");
      navigate("/login", {
        state: {
          message: "Check your email to activate your account.",
        },
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
    formValuesTouched.username &&
    formValuesTouched.email &&
    formValuesTouched.password &&
    formValuesTouched.confirmPassword;

  // form validation
  const formErrors = useMemo((): RegisterFormErrors => {
    const errors: RegisterFormErrors = {};

    if (formValuesTouched.username) {
      if (!formValues.username.trim()) {
        errors.username = "Username is required";
      } else if (!usernameRegex.test(formValues.username)) {
        errors.username =
          "Username must be between 3 and 20 characters long and contain no spaces or special characters";
      }
    }

    if (formValuesTouched.email) {
      if (!formValues.email.trim()) {
        errors.email = "Email is required";
      } else if (!emailRegex.test(formValues.email)) {
        errors.email = "Email is invalid";
      }
    }

    if (formValuesTouched.password) {
      if (!formValues.password.trim()) {
        errors.password = "Password is required";
      } else if (!passwordRegex.test(formValues.password)) {
        errors.password =
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character";
      }
    }

    // confirm password validation
    // must match password field
    if (formValuesTouched.confirmPassword) {
      if (!formValues.confirmPassword.trim()) {
        errors.confirmPassword = "Confirm password is required";
      } else if (formValues.password !== formValues.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
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
          BEGIN YOUR JOURNEY
        </h1>

        {isOnCountdown && (
          <Alert
            type="warning"
            message="Too many requests, please wait before trying again."
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

            {/* email */}
            <EmailInput
              id="email"
              name="email"
              value={formValues.email}
              errorMessage={formErrors.email}
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

            {/* confirm password */}
            <PasswordInput
              labelText="Confirm Password"
              id="confirm-password"
              name="confirmPassword"
              value={formValues.confirmPassword}
              errorMessage={formErrors.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* response error*/}
            {submitError && <Alert type="error" message={submitError} />}

            {/* submit button */}
            <SubmitButton
              disabled={
                isSubmitting ||
                !isFormValid ||
                !allFieldsTouched ||
                isOnCountdown
              }
              text={isOnCountdown ? `Please wait ${countdown}s` : "Register"}
              isSubmitting={isSubmitting}
            />
          </form>

          <p className="text-center text-lol-text pt-5 pb-2 text-xs md:text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
