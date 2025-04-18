import React , { useState }  from "react";
import logo from "./images/logo.png";
import { Container, Row, Col, Form, Button, Navbar, Nav, Card } from "react-bootstrap";
import "./Home.css";
import { useNavigate ,Link } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    username: "",
    pin: "",
    parentContact: "",
  });

  const [contract, setContract] = useState(false);

  const handleContract = () => {
    setContract(!contract);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();


    const { name, username, pin, parentContact } = data;

    console.log("Name:", `"${name}"`);
    console.log("Username:", `"${username}"`);
    console.log("PIN:", `"${pin}"`);
    console.log("Parent Contact:", `"${parentContact}"`);

    if (!name.trim() || !username.trim() || !pin.trim()) {
      alert("Please fill in all required fields (name, username, pin)");
      return;
    }
    
    if (!parentContact.trim()) {
      alert("Please enter a parent contact number or email.");
      return;
    }
    

    if (!/^\d{4}$/.test(pin.trim())) {
      alert("PIN must be exactly 4 digits.");
      return;
    }
    



    try {
      const response = await fetch("https://oclearn.onrender.com/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ✅ This is required
        },
        body: JSON.stringify({
          name,
          username,
          pin,
          parentContact,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("You have been successfully registered!");
        navigate("/");
      } else {
        alert(result.message || "Failed to register");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Error occurred while registering");
    }
  };

  return (
    <div className="subs">
      {/* Navbar */}
      <Navbar bg="light" variant="light" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img src={logo} width="30" height="30" alt="Logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/contact">
                Contacts
              </Nav.Link>
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/login">
                Login
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Centered Form */}
      <Container className="d-flex flex-column justify-content-center align-items-center min-vh-100">
        <Row className="w-100">
          <Col xs={12} sm={10} md={8} lg={6} xl={5} className="mx-auto">
            <Card className="p-4 shadow w-100" style={{ maxWidth: "500px" }}>
              <h1 className="text-center mb-4">Register to Play!</h1>

              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3 input2">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={data.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                  />
                </Form.Group>

                <Form.Group className="mb-3 input2">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={data.username}
                    onChange={handleInputChange}
                    placeholder="Pick a fun username!"
                  />
                </Form.Group>

                <Form.Group className="mb-3 input2">
                  <Form.Label>4-digit PIN</Form.Label>
                  <Form.Control
                    type="password"
                    inputMode="numeric"
                    name="pin"
                    value={data.pin}
                    maxLength="4"
                    onChange={handleInputChange}
                    placeholder="Enter a 4-digit PIN"
                  />
                </Form.Group>

                <Form.Group className="mb-3 input2">
                  <Form.Label>Parent Contact (Email or Phone)</Form.Label>
                  <Form.Control
                    type="tel"
                    name="parentContact"
                    value={data.parentContact}
                    onChange={handleInputChange}
                    placeholder="Enter parent's contact"
                  />
                </Form.Group>

                <h5>Legal Stuff</h5>
                <Form.Text className="text-muted mb-3 d-block">
                  We only use this info to save your progress and help you
                  become a better speller! 🎉 No spam, no sharing data.
                </Form.Text>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="I agree to the terms and conditions"
                    checked={contract}
                    onChange={handleContract}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100" disabled={!contract}>
                  Submit
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Register;