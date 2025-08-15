import React from "react";
import { AuthForm } from "../components/auth";

const Login: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center">
      <AuthForm />
    </div>
  );
};

export default Login;
