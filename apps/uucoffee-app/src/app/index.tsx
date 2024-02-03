import * as React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

function App(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="App">
      <Navbar
        fixed="top"
        expand={"sm"}
        className="mb-3"
        bg="dark"
        variant="dark"
      >
        <Container fluid>
          <Navbar.Brand onClick={() => navigate("/")}>
            UUCofee
          </Navbar.Brand>
        </Container>
      </Navbar>
      <Outlet />
    </div>
  );
}

export default App;
