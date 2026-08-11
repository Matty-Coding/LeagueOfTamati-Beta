import { useState, type JSX } from "react";
import { HiOutlineX } from "react-icons/hi";
import {
  HiCheckCircle,
  HiExclamationTriangle,
  HiInformationCircle,
} from "react-icons/hi2";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export function Alert({ type, message }: AlertProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(true);

  const closeAlert = () => {
    setIsOpen(false);
  };

  switch (type) {
    case "success":
      return (
        <div
          className={` ${!isOpen && "hidden"} alert bg-green-950 text-green-300 border-green-300`}
        >
          <HiCheckCircle size={20} />
          <p className="text-xs md:text-sm grow">{message}</p>
          <HiOutlineX
            size={20}
            className="cursor-pointer"
            onClick={closeAlert}
          />
        </div>
      );
    case "error":
      return (
        <div
          className={`${!isOpen && "hidden"} alert bg-rose-950 text-rose-300 border-rose-300`}
        >
          <HiExclamationTriangle size={20} />
          <p className="text-xs md:text-sm grow">{message}</p>
          <HiOutlineX
            size={20}
            className="cursor-pointer"
            onClick={closeAlert}
          />
        </div>
      );
    case "warning":
      return (
        <div
          className={`${!isOpen && "hidden"} alert bg-yellow-950 text-yellow-300 border-yellow-300`}
        >
          <HiExclamationTriangle size={20} />
          <p className="text-xs md:text-sm grow">{message}</p>
          <HiOutlineX
            size={20}
            className="cursor-pointer"
            onClick={closeAlert}
          />
        </div>
      );
    case "info":
      return (
        <div
          className={`${!isOpen && "hidden"} alert bg-mist-900 text-mist-300 border-mist-300`}
        >
          <HiInformationCircle size={20} />
          <p className="text-xs md:text-sm grow">{message}</p>
          <HiOutlineX
            size={20}
            className="cursor-pointer"
            onClick={closeAlert}
          />
        </div>
      );
  }
}
