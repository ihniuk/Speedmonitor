import React, { useEffect, useState } from 'react';
import GaugeChart from 'react-gauge-chart';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function App() {
  const [results, setResults] = useState([]);
  const [frequency, setFrequency] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = () => {
    fetch('http://localhost:5000/api/recent')
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(() => console.error("Failed to fetch"));
  };

  const runNow = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/run-now', { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        setTimeout(() => {
          fetchResults();
          setLoading(false);
        }, 2000);
      });
  };

  const latest = results[0] || { download_mbps: 0, upload_mbps: 0 };

  return (
    <Container className="p-4 bg-dark text-light" fluid>
      <h1 className="text-center mb-4">Speed Monitor</h1>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Label>Frequency (mins)</Form.Label>
          <Form.Select value={frequency} onChange={(e) => setFrequency(Number(e.target.value))}>
            {[1, 5, 10, 15, 30, 60].map((min) => (
              <option key={min} value={min}>{min}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6} className="d-flex align-items-end justify-content-end">
          <Button onClick={runNow} disabled={loading} variant="primary">
            {loading ? "Running..." : "Run Now"}
          </Button>
        </Col>
      </Row>
      <Row>
        <Col md={8}>
          <h4>Download Speed</h4>
          <GaugeChart id="download-gauge"
                      nrOfLevels={20}
                      percent={latest.download_mbps / 100}
                      textColor="#fff"
                      formatTextValue={() => `${latest.download_mbps.toFixed(2)} Mbps`} />
        </Col>
        <Col md={4}>
          <h4>Upload Speed</h4>
          <GaugeChart id="upload-gauge"
                      nrOfLevels={20}
                      percent={latest.upload_mbps / 100}
                      textColor="#fff"
                      formatTextValue={() => `${latest.upload_mbps.toFixed(2)} Mbps`} />
        </Col>
      </Row>
      <hr />
      <h4 className="mt-4">Last 24 Hours</h4>
      <Table striped bordered hover variant="dark" responsive>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Download (Mbps)</th>
            <th>Upload (Mbps)</th>
            <th>Latency (ms)</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.id}>
              <td>{new Date(r.timestamp).toLocaleString()}</td>
              <td>{r.download_mbps.toFixed(2)}</td>
              <td>{r.upload_mbps.toFixed(2)}</td>
              <td>{r.latency_ms.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default App;
