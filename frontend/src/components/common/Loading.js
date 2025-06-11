import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const Loading = ({ message }) => {
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center py-5">
      <Spinner animation="border" variant="primary" />
      {message && <p className="mt-3">{message}</p>}
    </Container>
  );
};

export default Loading;