import { useEffect, useState } from "react";
import api from "../../services/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export default function Queries() {
  const [queries, setQueries] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    api.get("/faculty/queries").then(res => setQueries(res.data));
  }, []);

  const raiseQuery = async () => {
    if (!text) return;
    await api.post("/faculty/queries", { description: text });
    setText("");
    const res = await api.get("/faculty/queries");
    setQueries(res.data);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Queries</h2>

      <div className="flex gap-2">
        <Input
          placeholder="Write your query..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <Button onClick={raiseQuery}>Submit</Button>
      </div>

      <div className="space-y-2">
        {queries.map(q => (
          <div key={q.id} className="p-3 border rounded">
            <p className="text-sm">{q.description}</p>
            <p className="text-xs text-muted-foreground">Status: {q.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
