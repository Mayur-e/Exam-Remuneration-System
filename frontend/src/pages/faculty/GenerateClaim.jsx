import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function GenerateClaim() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Generate Claim</h2>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold">Select Claim Type</h3>

        <Button
          className="w-full"
          onClick={() => navigate("/faculty/claim/teaching")}
        >
          Teaching Staff Claim (PR / OR / TW / Project)
        </Button>

        <Button disabled variant="outline" className="w-full">
          Non-Teaching Staff Claim (Coming Soon)
        </Button>
      </Card>
    </div>
  );
}
