import { useEffect, useRef, type JSX } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { activateAccountRequest } from "../../services/auth";
import { isAxiosError } from "axios";
import NavBar from "../../components/navbar";
import { useAuth } from "../../hooks/auth";

export function ActivateAccountPage(): JSX.Element {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const activationTriggered = useRef<boolean>(false);

  useEffect(() => {
    document.title = "Activate Account | League of Tamati";
  }, []);

  if (isAuthenticated) {
    navigate(`/profile/${user?.username}`, { replace: true });
  }

  useEffect(() => {
    // istant redirect with error toast
    if (!token) {
      toast.error("No token in URL");
      navigate("/login", { replace: true });
      return;
    }

    if (activationTriggered.current) return;
    activationTriggered.current = true;

    const activateAccount = async () => {
      try {
        const response = await activateAccountRequest(token);

        toast.success(response.message || "Account activated successfully!");

        navigate("/login", {
          replace: true,
          state: {
            message: "Account activated! You can now log in.",
          },
        });
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          const backendError =
            error.response?.data?.detail || "Activation failed.";
          toast.error(backendError);

          navigate("/login", {
            replace: true,
            state: {
              message: backendError,
            },
          });
        } else {
          toast.error("Something went wrong");
          navigate("/login", { replace: true });
        }
      }
    };

    activateAccount();
  }, [token, navigate]);

  return (
    <>
      <NavBar />
      <div className="w-xs md:w-md mx-auto py-20 flex-center flex-col gap-4">
        <p className="text-lol-text text-sm md:text-lg animate-pulse">
          Verifying your activation link...
        </p>
      </div>
    </>
  );
}
