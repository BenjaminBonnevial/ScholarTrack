import { GradesService } from "./grades.service";

describe("GradesService", () => {
  let gradesService: GradesService;

  beforeEach(() => {
    gradesService = new GradesService();
  });

  it("creates a grade payload", () => {
    const dto = {
      courseId: "course-1",
      studentId: "student-1",
      score: 18,
    };

    expect(gradesService.create(dto as never)).toEqual({
      action: "createGrade",
      payload: dto,
    });
  });

  it("updates a grade payload", () => {
    const dto = { score: 16 };

    expect(gradesService.update("grade-1", dto as never)).toEqual({
      action: "updateGrade",
      id: "grade-1",
      payload: dto,
    });
  });

  it("imports grades payloads", () => {
    const dto = { rows: [] };

    expect(gradesService.importCsv(dto as never)).toEqual({
      action: "importGrades",
      payload: dto,
    });
  });
});
