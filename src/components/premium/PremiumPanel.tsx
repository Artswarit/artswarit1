
import { Button } from "@/components/ui/button";
import { Crown, Star } from "lucide-react";

const plans = [
  { name: "Monthly", price: "₹49", key: "monthly", subline: "/month" },
  { name: "Yearly", price: "₹499", key: "yearly", subline: "/year" },
  { name: "Lifetime", price: "₹1499", key: "lifetime", subline: "" }
];

type Props = {
  onUpgrade: (plan: string) => void;
}

const PremiumPanel = ({ onUpgrade }: Props) => (
  <div className="w-full p-6 rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 border border-yellow-300 shadow-lg mb-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold mb-1">
          <Crown className="h-6 w-6 text-yellow-500" />
          Unlock <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-transparent bg-clip-text">Premium</span>
        </h2>
        <p className="text-gray-600 mb-1 max-w-lg">Upgrade to Premium to access exclusive features: lifetime badge, analytics, exclusive/pinned artworks, and apply to premium projects.</p>
        <ul className="text-sm text-gray-800 ml-5 mb-2 list-disc">
          <li>Exclusive & pinned artworks</li>
          <li>Advanced analytics dashboard</li>
          <li>Premium badge on your profile</li>
          <li>Project applications & networking</li>
          <li>No renewal worry with lifetime option</li>
        </ul>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {plans.map((plan) => (
          <div key={plan.key} className="bg-white border border-yellow-200 rounded-md px-4 py-4 flex flex-col items-center shadow">
            <div className="font-bold text-lg">{plan.name}</div>
            <div className="text-3xl font-extrabold text-yellow-600">{plan.price}</div>
            <div className="text-xs text-gray-500">{plan.subline}</div>
            <Button
              className="mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 w-full text-white font-semibold"
              onClick={() => onUpgrade(plan.key)}
            >
              Upgrade
            </Button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default PremiumPanel;
