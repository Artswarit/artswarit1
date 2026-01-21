import { Link } from "react-router-dom";

const SignupHeader = () => {
  return (
    <div className="text-center">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
        Create your account
      </h1>
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:text-primary/80 underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default SignupHeader;
