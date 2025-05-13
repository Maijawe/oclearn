import React, { useState } from "react";
import logo from "./images/logo.png";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate, Link } from "react-router-dom";
import "./App.css";

function Login() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    username: "",
    pin: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!data.username || !data.pin) {
      alert("Please enter your username and 4-digit PIN.");
      return;
    }

    // Admin override
    if (
      data.username === "maijawethato06@gmail.com" &&
      data.pin === "2001"
    ) {
      navigate("/admin");
      return;
    }

    const sendDataToServer = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          alert(result.message);
        } else {
          const token = result.token;
          sessionStorage.setItem("token", token);
          navigate("/home");
        }
      } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred during login. Please try again.");
      }
    };

    sendDataToServer();
  };

  return (
    <div className="app-2">
      <Navbar bg="light" variant="light" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img
              src={logo}
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="Logo"
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/contact">Contacts</Nav.Link>
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/register">Registration</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="login-wrapper d-flex flex-column align-items-center mt-5">
        <img className="logo2" src={logo} alt="Logo" />

        <Form onSubmit={handleSubmit} className="login-form w-100">
          <Form.Group className="mb-3" controlId="formBasicUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={data.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPin">
            <Form.Label>4-digit PIN</Form.Label>
            <Form.Control
              type="tel"
              name="pin"
              value={data.pin}
              maxLength="4"
              onChange={handleInputChange}
              placeholder="Enter your PIN"
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Submit
          </Button>
          <Form.Text className="text-center d-block mt-3">
            Don’t have an account?{" "}
            <Link to="/register" className="text-decoration-none fw-bold text-primary">
            Register here
            </Link>
          </Form.Text>

        </Form>
      </Container>
    </div>
  );
}

export default Login;
