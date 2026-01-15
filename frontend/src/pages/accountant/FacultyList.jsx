import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function FacultyList() {
  const [faculty, setFaculty] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/accountant/faculty").then(res => setFaculty(res.data));
  }, []);

  return (
    <Card className="p-4">
      <h2 className="font-bold mb-4">Faculty</h2>
      <table className="w-full border">
        <tbody>
          {faculty.map(f => (
            <tr key={f.id}>
              <td>{f.name}</td>
              <td>{f.department}</td>
              <td>
                <Button size="sm" onClick={() => navigate(`/accountant/faculty/${f.id}`)}>
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
