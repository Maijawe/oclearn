import React, { useEffect, useState } from "react";
import { Container, Table, Spinner } from "react-bootstrap";

function AdminDashboard() {
  const [stats, setStats] = useState({
    date: "",
    dailyUsers: null,
    level3Completions: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const loginRes = await fetch("http://localhost:5000/api/analytics/daily-logins");
        const loginData = await loginRes.json();

        const level3Res = await fetch("http://localhost:5000/api/analytics/level3-completions");
        const level3Data = await level3Res.json();

        setStats({
          date: loginData.date,
          dailyUsers: loginData.dailyActiveUsers,
          level3Completions: level3Data.level3Completions,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center">📊 Admin Analytics Dashboard</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <Table bordered hover responsive="md" className="text-center">
          <thead className="table-dark">
            <tr>
              <th>📅 Date</th>
              <th>👤 Daily Users</th>
              <th>✅ Level 3 Completions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{stats.date}</td>
              <td>{stats.dailyUsers}</td>
              <td>{stats.level3Completions}</td>
            </tr>
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default AdminDashboard;

