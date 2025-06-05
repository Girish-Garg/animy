import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-100 overflow-hidden">
      <div className="w-full max-w-[450px] p-4">
        <SignIn 
          routing="path" 
          path="/login" 
          signUpUrl="/signup" 
          redirectUrl="/dashboard"
          appearance={{
            elements: {
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
              footerActionLink: "text-blue-600 hover:text-blue-800",
              card: "shadow-lg rounded-lg",
              formFieldInput: "h-12",
              formButtonReset: "h-12",
              identityPreview: "h-12"
            },
            layout: {
              spacing: {
                /* Increase spacing between elements */
                inputLabelRow: "1.5rem",
                formFieldRow: "1.5rem",
                formButtonPrimary: "1.5rem"
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Login;