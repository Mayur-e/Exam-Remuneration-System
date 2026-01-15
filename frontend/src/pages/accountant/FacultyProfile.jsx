import { useEffect, useState } from "react";
import api from "../../services/api";
import { useParams } from "react-router-dom";
import { Card } from "../../components/ui/card";

export default function FacultyProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/accountant/faculty/${id}`).then(res => setData(res.data));
  }, [id]);

  if (!data) return <p>Loading...</p>;

  return (
    <Card className="p-4 space-y-2">
      <h2 className="font-bold">{data.faculty.name}</h2>
      <p>Email: {data.faculty.email}</p>
      <p>Department: {data.faculty.department}</p>

      <hr />

      <h3 className="font-semibold">Bank Details</h3>
      {data.bank ? (
        <>
          <p>Bank: {data.bank.bank_name}</p>
          <p>Account: {data.bank.account_number}</p>
          <p>IFSC: {data.bank.ifsc_code}</p>
        </>
      ) : (
        <p>No bank details</p>
      )}
    </Card>
  );
}
