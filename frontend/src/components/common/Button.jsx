import React from "react";
import { Link } from "react-router-dom";
import Loading from "./Loading";

// Enhanced SubmitButton with loading state
export const LoginButton = ({ name, isLoading = false, disabled = false }) => {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className={`w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold py-3 px-2 rounded-lg transition-colors duration-200 relative ${
        isLoading || disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {isLoading ? (
        <>
          <span className="opacity-0">{name}</span>
          <span className="absolute inset-0 flex items-center justify-center">
            <Loading size={20} />
          </span>
        </>
      ) : (
        name
      )}
    </button>
  );
};

// Enhanced SubmitButton with loading state
export const SubmitButton = ({
  name,
  className,
  isLoading = false,
  disabled = false,
  onClick,
  type = "button",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`mt-6 ${className} text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 relative ${
        isLoading || disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {isLoading ? (
        <>
          <span className="opacity-0">{name}</span>
          <span className="absolute inset-0 flex items-center justify-center">
            <Loading size={20} />
          </span>
        </>
      ) : (
        name
      )}
    </button>
  );
};

// Enhanced SubmitLink with loading state (visual only since Link can't be disabled)
export const SubmitLink = ({ urlLink, name, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-indigo-600 opacity-70 text-white text-base font-semibold py-3 px-4 rounded-md transition duration-200 w-full sm:w-auto flex items-center justify-center">
        <Loading size={20} />
      </div>
    );
  }

  return (
    <Link
      to={urlLink}
      className="bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold py-3 px-4 rounded-md transition duration-200 w-full sm:w-auto flex items-center justify-center cursor-pointer"
    >
      {name}
    </Link>
  );
};

// Enhanced ActionButton with loading state
export const ActionButton = ({
  onClick,
  name,
  className,
  isLoading = false,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`px-4 py-2 text-white rounded-md shadow-md relative ${className} ${
        isLoading || disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {isLoading ? (
        <>
          <span className="opacity-0">{name}</span>
          <span className="absolute inset-0 flex items-center justify-center">
            <Loading size={20} />
          </span>
        </>
      ) : (
        name
      )}
    </button>
  );
};

// Enhanced CancelButton with loading state
export const CancelButton = ({
  onClick,
  isLoading = false,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      type="cancel"
      disabled={isLoading || disabled}
      className={`px-4 py-2 text-white rounded-md shadow-md relative bg-gray-600 hover:bg-gray-700 ${
        isLoading || disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {isLoading ? (
        <>
          <span className="opacity-0">Cancel</span>
          <span className="absolute inset-0 flex items-center justify-center">
            <Loading size={20} />
          </span>
        </>
      ) : (
        "Cancel"
      )}
    </button>
  );
};
