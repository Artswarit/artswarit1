
import { Link } from "react-router-dom";

const SignupHeader = () => {
  return (
    <div className="text-center px-2">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-4 sm:mb-6">
        Create your account
      </h1>
      <p className="mt-2 text-sm sm:text-base text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-artswarit-purple hover:text-artswarit-purple-dark underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default SignupHeader;
