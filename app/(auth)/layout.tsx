import { PropsWithChildren } from "react";

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <main className="h-full flex items-center justify-center">{children}</main>
  );
};

export default AuthLayout;
