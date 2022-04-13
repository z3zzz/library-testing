import { Card, Button, Row, Col } from "react-bootstrap";

function ProjectCard({ project, isEditable, setIsEditing }) {
  return (
    <Card.Text>
      <Row className="justify-content-between align-items-center mb-2">
        <Col>
          {project.title}
          <br />
          <span className="text-muted">{project.description}</span>
          <br />
          <span className="text-muted">
            {`${project.from_date} ~ ${project.to_date}`}
          </span>
        </Col>
        {isEditable && (
          <Col xs lg="1">
            <Button
              variant="outline-info"
              size="sm"
              onClick={() => setIsEditing((prev) => !prev)}
              className="mr-3"
            >
              편집
            </Button>
          </Col>
        )}
      </Row>
    </Card.Text>
  );
}

export default ProjectCard;
