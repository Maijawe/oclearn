import React, { useEffect, useState } from "react";
import { Container, Table, Spinner, Form, Button, Alert } from "react-bootstrap";

function AdminDashboard() {
  const [stats, setStats] = useState({
    date: "",
    dailyUsers: null,
    level3Completions: null,
  });
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("");
  const [words, setWords] = useState([""]);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const loginRes = await fetch(`${process.env.REACT_APP_API_URL}/api/analytics/daily-logins`);
        const loginData = await loginRes.json();

        const level3Res = await fetch(`${process.env.REACT_APP_API_URL}/api/analytics/level3-completions`);
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

  const handleAddLevel = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/levels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: parseInt(level), words }),
      });

      const result = await response.json();
      if (response.ok) {
        setSubmitStatus({ success: true, message: "Level added successfully!" });
        setLevel("");
        setWords([""]);
      } else {
        setSubmitStatus({ success: false, message: result.message || "Error adding level" });
      }
    } catch (err) {
      setSubmitStatus({ success: false, message: "Server error" });
    }
  };

  const handleWordChange = (index, value) => {
    const updatedWords = [...words];
    updatedWords[index] = value;
    setWords(updatedWords);
  };

  const addWordField = () => {
    if (words.length < 10) setWords([...words, ""]);
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center">📊 Admin Analytics Dashboard</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table bordered hover responsive className="text-center">
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

      <hr />
      <h4>Add New Level</h4>
      <Form onSubmit={handleAddLevel}>
        <Form.Group className="mb-2">
          <Form.Label>Level Number</Form.Label>
          <Form.Control
            type="number"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            min={1}
            required
          />
        </Form.Group>

        {words.map((word, index) => (
          <Form.Group key={index} className="mb-2">
            <Form.Label>Word {index + 1}</Form.Label>
            <Form.Control
              type="text"
              value={word}
              onChange={(e) => handleWordChange(index, e.target.value)}
              required
            />
          </Form.Group>
        ))}

        {words.length < 10 && (
          <Button variant="secondary" onClick={addWordField} className="mb-2">
            ➕ Add Another Word
          </Button>
        )}

        <Button type="submit" variant="primary">
          🚀 Submit New Level
        </Button>
      </Form>

      {submitStatus && (
        <Alert className="mt-3" variant={submitStatus.success ? "success" : "danger"}>
          {submitStatus.message}
        </Alert>
      )}
    </Container>
  );
}

export default AdminDashboard;


