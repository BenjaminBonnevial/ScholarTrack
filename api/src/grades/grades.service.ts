import { Injectable } from "@nestjs/common";
import { CreateGradeDto, GradeImportDto, UpdateGradeDto } from "../common/dto/grade.dto";

@Injectable()
export class GradesService {
  create(dto: CreateGradeDto) {
    return { action: "createGrade", payload: dto };
  }

  update(id: string, dto: UpdateGradeDto) {
    return { action: "updateGrade", id, payload: dto };
  }

  importCsv(dto: GradeImportDto) {
    return { action: "importGrades", payload: dto };
  }
}
