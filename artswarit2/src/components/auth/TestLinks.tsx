
import { Link } from "react-router-dom";

const TestLinks = () => {
  return (
    <div className="text-center pt-4 border-t">
      <p className="text-sm text-gray-500 mb-2">Testing Links:</p>
      <div className="flex justify-center gap-4">
        <Link to="/artist-dashboard" className="text-sm text-artswarit-purple hover:text-artswarit-purple-dark">
          Artist Dashboard
        </Link>
        <Link to="/client-dashboard" className="text-sm text-artswarit-purple hover:text-artswarit-purple-dark">
          Client Dashboard
        </Link>
      </div>
    </div>
  );
};

export default TestLinks;
