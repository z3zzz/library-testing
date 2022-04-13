import React, { useState } from "react";
import { Button, Form, Col, Row } from "react-bootstrap";
import DatePicker from "react-datepicker";
import * as Api from "../../api";

function CertificateEditForm({
  currentCertificate,
  setCertificates,
  setIsEditing,
}) {
  //useState로 title 상태를 생성함.
  const [title, setTitle] = useState(currentCertificate.title);
  //useState로 description 상태를 생성함.
  const [description, setDescription] = useState(
    currentCertificate.description
  );
  //useState로 whenDate 상태를 생성함.
  const [whenDate, setWhenDate] = useState(
    new Date(currentCertificate.when_date)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // currentCertificate의 user_id를 user_id 변수에 할당함.
    const user_id = currentCertificate.user_id;
    const when_date = whenDate.toISOString().split("T")[0];

    // "certificates/자격증id" 엔드포인트로 PUT 요청함.
    await Api.put(`certificates/${currentCertificate.id}`, {
      user_id,
      title,
      description,
      when_date,
    });

    // "certificatelist/유저id" 엔드포인트로 GET 요청함.
    const res = await Api.get("certificatelist", user_id);
    // certificates를 response의 data로 세팅함.
    setCertificates(res.data);
    // 편집 과정이 끝났으므로, isEditing을 false로 세팅함.
    setIsEditing(false);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="certificateEditTitle">
        <Form.Control
          type="text"
          placeholder="자격증 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="certificateEditDescription" className="mt-3">
        <Form.Control
          type="text"
          placeholder="상세내역"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Form.Group>

      <Form.Group as={Row} className="mt-3">
        <Col xs="auto">
          <DatePicker
            selected={whenDate}
            onChange={(date) => setWhenDate(date)}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mt-3 text-center mb-4">
        <Col sm={{ span: 20 }}>
          <Button variant="primary" type="submit" className="me-3">
            확인
          </Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>
            취소
          </Button>
        </Col>
      </Form.Group>
    </Form>
  );
}

export default CertificateEditForm;
