import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import "bootstrap/dist/css/bootstrap.min.css";
import Connect from "../components/Wallet/Connect";
import { useRouter } from "next/router";
import Home from "@mui/icons-material/Home";

function TopNavbar() {
  const router = useRouter();
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/")}
        >
          <div style={{ display: "flex", gap: 2 }}>
            <Home fontSize="large" />
            <h3>HELPY</h3>
          </div>
        </Navbar.Brand>
        <Connect />
      </Container>
    </Navbar>
  );
}

export default TopNavbar;
