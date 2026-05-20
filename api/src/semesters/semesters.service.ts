import { Injectable } from "@nestjs/common";
import { PaginationDto } from "../common/dto/pagination.dto";
import { CreateSemesterDto, UpdateSemesterDto } from "../common/dto/semester.dto";

@Injectable()
export class SemestersService {
  create(dto: CreateSemesterDto) {
    return { action: "createSemester", payload: dto };
  }

  list(query: PaginationDto) {
    return { action: "listSemesters", query };
  }

  get(id: string) {
    return { action: "getSemester", id };
  }

  update(id: string, dto: UpdateSemesterDto) {
    return { action: "updateSemester", id, payload: dto };
  }

  remove(id: string) {
    return { action: "removeSemester", id };
  }
}
