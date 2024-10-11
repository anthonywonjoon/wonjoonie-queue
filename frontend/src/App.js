import './App.css';
import Homepage from './components/Homepage/Homepage';

import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <Container fluid>
      <Row>
        <Col>
          <Homepage />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
